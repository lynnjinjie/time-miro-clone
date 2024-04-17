'use client'

import { useCallback, useMemo, useState } from 'react'
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
} from '@/liveblocks.config'
import {
  connectionIdToColor,
  pointerEventToCanvasPoint,
  resizeBounds,
} from '@/lib/utils'

import Info from './info'
import Participants from './participants'
import Toolbar from './toolbar'
import { CursorsPresence } from './cursors-presence'
import { LayerPreview } from './layer-preview'
import { SelectionBox } from './selection-box'

const MAX_LAYERS = 100

interface CanvasProps {
  boardId: string
}

export default function Canvas({ boardId }: CanvasProps) {
  const layerIds = useStorage((root) => root.layerIds)
  const [canvasState, setCanvaseState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })

  const [lastUserColor, setLastUserColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  })

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

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point)
      } else {
        setCanvaseState({ mode: CanvasMode.None })
      }

      history.resume()
    },
    [camera, canvasState, history, insertLayer]
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

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault()

      const current = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current)
      }

      setMyPresence({ cursor: current })
    },
    [camera, canvasState, resizeSelectedLayer]
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
      <svg
        className="w-screen h-screen"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
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
          <CursorsPresence />
        </g>
      </svg>
    </main>
  )
}
