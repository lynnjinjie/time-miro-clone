import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
} from 'lucide-react'
import ToolButton from './tool-button'

export default function Toolbar() {
  return (
    <div className="absolute top-[50%] left-2 -translate-y-[50%] flex flex-col gap-y-4">
      <div className="bg-white p-1.5 flex flex-col items-center gap-y-1 rounded-md shadow-md">
        <ToolButton
          label="Select"
          icon={MousePointer2}
          onClick={() => {}}
          isActive={false}
        />
        <ToolButton
          label="Text"
          icon={Type}
          onClick={() => {}}
          isActive={false}
        />
        <ToolButton
          label="Sticky note"
          icon={StickyNote}
          onClick={() => {}}
          isActive={false}
        />
        <ToolButton
          label="Rectangle"
          icon={Square}
          onClick={() => {}}
          isActive={false}
        />
        <ToolButton
          label="Ellipse"
          icon={Circle}
          onClick={() => {}}
          isActive={false}
        />
        <ToolButton
          label="Pen"
          icon={Pencil}
          onClick={() => {}}
          isActive={true}
        />
      </div>
      <div className="bg-white p-1.5 flex flex-col items-center rounded-md shadow-md">
        <ToolButton
          label="Undo"
          icon={Undo2}
          onClick={() => {}}
          isDisabled={false}
        />
        <ToolButton
          label="Redo"
          icon={Redo2}
          onClick={() => {}}
          isDisabled={true}
        />
      </div>
    </div>
  )
}

export function ToolbarSkeleton() {
  return (
    <div className="absolute top-[50%] left-2 -translate-y-[50%] flex flex-col gap-y-4 bg-white rounded-md shadow-md w-[52px] h-[360px]" />
  )
}
