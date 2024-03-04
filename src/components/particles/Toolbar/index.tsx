import { FC, forwardRef, ReactNode, useState } from 'react'

import IcAdd from '@/assets/icons/ic-add.svg?react'
import IcCircle from '@/assets/icons/ic-circle.svg?react'
import IcPath from '@/assets/icons/ic-path.svg?react'
import IcPointer from '@/assets/icons/ic-pointer.svg?react'
import IcRect from '@/assets/icons/ic-rect.svg?react'
import IcResize from '@/assets/icons/ic-resize.svg?react'
import clsxm from '@/utils/clsxm'

interface ToolbarButton {
  content: ReactNode
  active?: boolean
  onClick?: () => void
}

const ToolbarButton = forwardRef<HTMLDivElement, ToolbarButton>(({ content, active, onClick }, ref) => {
  return (
    <div
      ref={ref}
      className={clsxm(
        'relative flex aspect-square w-full items-center justify-center rounded-md text-black transition-all duration-300 ease-in-out *:h-6 *:w-6 hover:cursor-pointer hover:bg-inktor-cyan',
        active && 'bg-inktor-cyan'
      )}
      onClick={onClick}
    >
      {content}
    </div>
  )
})

interface AddOptions {
  visible: boolean
  setAddCircle: () => void
  setAddRect?: () => void
  setAddPath?: () => void
}

const AddOptions: FC<AddOptions> = ({ visible = false, setAddCircle, setAddRect, setAddPath }) => {
  return (
    <div
      className={clsxm(
        'absolute left-16 top-0 z-10 flex h-12 w-32 gap-2 rounded-md bg-white p-2 shadow-toolbar transition-all duration-150',
        !visible ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <ToolbarButton
        content={<IcCircle />}
        onClick={setAddCircle}
      />

      <ToolbarButton 
        content={<IcRect />}
        onClick={setAddRect}
      />

      <ToolbarButton
        content={<IcPath />} 
        onClick={setAddPath}
      />
    </div>
  )
}

interface Toolbar {
  setNormalMode: () => void
  setResizeMode: () => void
  onClickAdd: () => void
  setAddCircle: () => void
  setAddRectangle?: () => void
  setAddPath?: () => void
  showAddOptions: boolean
}

const Toolbar: FC<Toolbar> = ({ setNormalMode, setResizeMode, onClickAdd, setAddCircle, setAddRectangle, setAddPath, showAddOptions }) => {
  const [active, setActive] = useState('pointer')

  return (
    <>
      <div className='toolbar absolute left-3 flex h-toolbar w-12 flex-col gap-2 rounded-md bg-white p-2 shadow-toolbar'>
        <ToolbarButton
          content={<IcAdd />}
          onClick={onClickAdd}
        />

        <AddOptions
          visible={showAddOptions}
          setAddCircle={setAddCircle}
          setAddRect={setAddRectangle}
          setAddPath={setAddPath}
        />

        <ToolbarButton
          content={<IcPointer />}
          onClick={() => {
            setActive('pointer')
            setNormalMode()
          }}
          active={active === 'pointer'}
        />

        <ToolbarButton
          content={<IcResize />}
          onClick={() => {
            setActive('resize')
            setResizeMode()
          }}
          active={active === 'resize'}
        />
      </div>
    </>
  )
}

export default Toolbar
