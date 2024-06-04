import { FC, forwardRef, useState } from 'react'

import IcAdd from '@/assets/icons/ic-add.svg?react'
import IcCircle from '@/assets/icons/ic-circle.svg?react'
import IcPath from '@/assets/icons/ic-path.svg?react'
import IcPointer from '@/assets/icons/ic-pointer.svg?react'
import IcRect from '@/assets/icons/ic-rect.svg?react'
import IcResize from '@/assets/icons/ic-resize.svg?react'
import clsxm from '@/utils/clsxm'

interface ToolbarButton {
  Content: FC<{ color?: string }>
  active?: boolean
  onClick?: () => void
}

const ToolbarButton = forwardRef<HTMLDivElement, ToolbarButton>(({ Content, active, onClick }, ref) => {
  const [hover, setHover] = useState(false)
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={clsxm(
        'relative flex aspect-square w-full items-center justify-center rounded-md text-black *:h-6 *:w-6 hover:cursor-pointer hover:bg-[#1f1f1f]',
        active && 'bg-[#1f1f1f]'
      )}
      onClick={onClick}
    >
      <Content color={active || hover ? 'white' : 'black'} />
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
        Content={IcCircle}
        onClick={setAddCircle}
      />

      <ToolbarButton
        Content={IcRect}
        onClick={setAddRect}
      />

      <ToolbarButton
        Content={IcPath}
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

const Toolbar: FC<Toolbar> = ({
  setNormalMode,
  setResizeMode,
  onClickAdd,
  setAddCircle,
  setAddRectangle,
  setAddPath,
  showAddOptions,
}) => {
  const [active, setActive] = useState('pointer')

  return (
    <>
      <div className='absolute left-3 top-1/3 flex h-auto w-12 flex-col gap-2 rounded-md bg-white p-2 shadow-toolbar'>
        <ToolbarButton
          Content={IcAdd}
          onClick={onClickAdd}
        />

        <AddOptions
          visible={showAddOptions}
          setAddCircle={setAddCircle}
          setAddRect={setAddRectangle}
          setAddPath={setAddPath}
        />

        <ToolbarButton
          Content={IcPointer}
          onClick={() => {
            setActive('pointer')
            setNormalMode()
          }}
          active={active === 'pointer'}
        />

        <ToolbarButton
          Content={IcResize}
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
