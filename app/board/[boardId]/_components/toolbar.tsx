export default function Toolbar() {
  return (
    <div className="absolute top-[50%] left-2 -translate-y-[50%] flex flex-col gap-y-4">
      <div className="bg-white p-1.5 flex flex-col items-center gap-y-1 rounded-md shadow-md">
        <div>pencil</div>
        <div>square</div>
      </div>
      <div className="bg-white p-1.5 flex flex-col items-center rounded-md shadow-md">
        <div>Undo</div>
        <div>Redo</div>
      </div>
    </div>
  )
}
