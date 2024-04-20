'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import { LiveObject } from '@liveblocks/client'

import {
  CanvasState,
  CanvasMode,
  Camera,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from '@/types/canvas'
import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
} from '@/liveblocks.config'
import {
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
  rgbToHex,
} from '@/lib/utils'
import { useDisableScrollBounce } from '@/hooks/use-disable-scroll-bounce'
import { useDeleteLayers } from '@/hooks/use-delete-layers'

import Info from './info'
import Participants from './participants'
import Toolbar from './toolbar'
import { CursorsPresence } from './cursors-presence'
import { LayerPreview } from './layer-preview'
import { SelectionBox } from './selection-box'
import { SelectionTools } from './selection-tools'
import Path from './layer-type/path'

const MAX_LAYERS = 100

interface CanvasProps {
  boardId: string
}

export default function Canvas({ boardId }: CanvasProps) {
  const layerIds = useStorage((root) => root.layerIds)

  const pencilDraft = useSelf((me) => me.presence.pencilDraft)

  const [canvasState, setCanvaseState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })

  const [lastUserColor, setLastUserColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  })

  useDisableScrollBounce()

  const history = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Note
        | LayerType.Rectangle
        | LayerType.Text,
      position: Point
    ) => {
      const liveLayers = storage.get('layers')
      if (liveLayers.size > MAX_LAYERS) return

      const liveLayerIds = storage.get('layerIds')
      const layerId = nanoid()
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        width: 100,
        height: 100,
        fill: lastUserColor,
      })

      // insert to liveblock to update layers list and user
      liveLayerIds.push(layerId)
      liveLayers.set(layerId, layer)

      setMyPresence({ selection: [layerId] }, { addToHistory: true })
      setCanvaseState({ mode: CanvasMode.None })
    },
    []
  )

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      }

      const layers = storage.get('layers')

      for (const id of self.presence.selection) {
        const layer = layers.get(id)

        if (layer) {
          layer.update({
            x: layer.get('x') + offset.x,
            y: layer.get('y') + offset.y,
          })
        }
      }

      setCanvaseState({ mode: CanvasMode.Translating, current: point })
    },
    [canvasState]
  )

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      )

      const layers = storage.get('layers')
      const layer = layers.get(self.presence.selection[0])

      if (layer) {
        layer.update(bounds)
      }
    },
    [canvasState]
  )

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUserColor,
      })
    },
    [lastUserColor]
  )

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return
      }

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      })
    },
    [canvasState.mode]
  )

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const layers = storage.get('layers')
      const { pencilDraft } = self.presence

      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        layers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null })
        return
      }

      const id = nanoid()
      layers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUserColor))
      )

      const layerIds = storage.get('layerIds')
      layerIds.push(id)

      setMyPresence({ pencilDraft: null })
      setCanvaseState({ mode: CanvasMode.Pencil })
    },
    [lastUserColor]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Inserting) return

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure)
        return
      }

      setCanvaseState({ mode: CanvasMode.Pressing, origin: point })
    },
    [camera, canvasState.mode, setCanvaseState, startDrawing]
  )

  const unSelectedLayer = useMutation(({ self, setMyPresence }) => {
    // when click outside let all layer not selected
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true })
    }
  }, [])

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unSelectedLayer()

        setCanvaseState({
          mode: CanvasMode.None,
        })
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath()
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point)
      } else {
        setCanvaseState({ mode: CanvasMode.None })
      }

      history.resume()
    },
    [
      camera,
      canvasState,
      setCanvaseState,
      history,
      insertLayer,
      unSelectedLayer,
      insertPath,
    ]
  )

  const selections = useOthersMapped((other) => other.presence.selection)

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Inserting ||
        canvasState.mode === CanvasMode.Pencil
      ) {
        return
      }

      history.pause()
      e.stopPropagation()

      const point = pointerEventToCanvasPoint(e, camera)

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true })
      }
      setCanvaseState({ mode: CanvasMode.Translating, current: point })
    },
    [setCanvaseState, camera, history, canvasState.mode]
  )

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {}
    for (const user of selections) {
      const [connectionId, selection] = user // [4, [id1, id2]]
      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
      }
    }
    return layerIdsToColorSelection
  }, [selections])

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get('layers').toImmutable()

      setCanvaseState({
        mode: CanvasMode.SelectionNet,
        current,
        origin,
      })

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        current,
        origin
      )
      setMyPresence({ selection: ids })
    },
    [layerIds]
  )

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    // make sure it's select and drag handle
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvaseState({
        mode: CanvasMode.SelectionNet,
        current,
        origin,
      })
    }
  }, [])

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault()

      const current = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin)
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin)
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current)
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current)
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e)
      }

      setMyPresence({ cursor: current })
    },
    [
      camera,
      canvasState,
      resizeSelectedLayer,
      startMultiSelection,
      updateSelectionNet,
      translateSelectedLayers,
      continueDrawing,
    ]
  )

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null })
  }, [])

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause()
      setCanvaseState({ mode: CanvasMode.Resizing, corner, initialBounds })
    },
    [history]
  )

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }))
  }, [])

  const deleteLayer = useDeleteLayers()
  // undo and redo shortcut key
  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === 'z') {
        if (e.ctrlKey || e.metaKey) {
          if (e.shiftKey) {
            history.redo()
          } else {
            history.undo()
          }
        }
      }
    }

    document.addEventListener('keydown', keyDown)
    return () => {
      document.removeEventListener('keydown', keyDown)
    }
  }, [deleteLayer, history])

  return (
    <main className="w-full h-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvaseState={setCanvaseState}
        canUndo={canUndo}
        canRedo={canRedo}
        undo={history.undo}
        redo={history.redo}
      />
      <SelectionTools camera={camera} setLastUserColor={setLastUserColor} />
      <svg
        className="w-screen h-screen"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(canvasState.current.x, canvasState.origin.x)}
                y={Math.min(canvasState.current.y, canvasState.origin.y)}
                width={Math.abs(canvasState.current.x - canvasState.origin.x)}
                height={Math.abs(canvasState.current.y - canvasState.origin.y)}
              />
            )}
          <CursorsPresence />
          {pencilDraft !== null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              x={0}
              y={0}
              fill={rgbToHex(lastUserColor)}
            />
          )}
        </g>
      </svg>
    </main>
  )
}
