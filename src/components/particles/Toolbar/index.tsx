import { FC, ReactNode, RefObject, forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import clsxm from '@/utils/clsxm'

const PointerSVG = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.3572 3.23397C3.66645 2.97447 4.1014 2.92638 4.45988 3.11204L20.7851 11.567C21.1426 11.7522 21.3542 12.1337 21.322 12.5351C21.2898 12.9364 21.02 13.2793 20.6375 13.405L13.7827 15.6586L10.373 22.0179C10.1828 22.3728 9.79826 22.5789 9.39743 22.541C8.9966 22.503 8.65762 22.2284 8.53735 21.8441L3.04564 4.29872C2.92505 3.91345 3.04794 3.49346 3.3572 3.23397ZM5.67123 5.99173L9.73507 18.9752L12.2091 14.361C12.3304 14.1347 12.5341 13.9637 12.7781 13.8835L17.7518 12.2484L5.67123 5.99173Z'
      fill='currentColor'
    />
  </svg>
)

const ResizeSVG = () => (
  <svg
    viewBox='0 0 32 32'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g
      fill='none'
      fillRule='evenodd'
    >
      <g
        transform='translate(-256.000000, -879.000000)'
        fill='currentColor'
      >
        <path d='M284,909 C282.896,909 282,908.104 282,907 C282,905.896 282.896,905 284,905 C285.104,905 286,905.896 286,907 C286,908.104 285.104,909 284,909 L284,909 Z M280.142,906 L263.858,906 C263.496,904.6 262.401,903.505 261,903.142 L261,886.858 C262.401,886.496 263.496,885.4 263.858,884 L280.142,884 C280.504,885.4 281.599,886.496 283,886.858 L283,903.142 C281.599,903.505 280.504,904.6 280.142,906 L280.142,906 Z M260,909 C258.896,909 258,908.104 258,907 C258,905.896 258.896,905 260,905 C261.104,905 262,905.896 262,907 C262,908.104 261.104,909 260,909 L260,909 Z M258,883 C258,881.896 258.896,881 260,881 C261.104,881 262,881.896 262,883 C262,884.104 261.104,885 260,885 C258.896,885 258,884.104 258,883 L258,883 Z M284,881 C285.104,881 286,881.896 286,883 C286,884.104 285.104,885 284,885 C282.896,885 282,884.104 282,883 C282,881.896 282.896,881 284,881 L284,881 Z M285,903.142 L285,886.858 C286.722,886.413 288,884.862 288,883 C288,880.791 286.209,879 284,879 C282.138,879 280.587,880.278 280.142,882 L263.858,882 C263.413,880.278 261.862,879 260,879 C257.791,879 256,880.791 256,883 C256,884.862 257.278,886.413 259,886.858 L259,903.142 C257.278,903.588 256,905.139 256,907 C256,909.209 257.791,911 260,911 C261.862,911 263.413,909.723 263.858,908 L280.142,908 C280.587,909.723 282.138,911 284,911 C286.209,911 288,909.209 288,907 C288,905.139 286.722,903.588 285,903.142 L285,903.142 Z' />
      </g>
    </g>
  </svg>
)

const AddSVG = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12" x2="12" y1="20" y2="4" />
    <line fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="4" x2="20" y1="12" y2="12" />
  </svg>
)

const CircleSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
    stroke="#000000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  </svg>
)

const RectSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32">
    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Z"/>
  </svg>
)

const PathSVG = () => (
  <svg width="32px" height="32px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path fill="#000000" fillRule="evenodd" 
      d="M13 0a3 3 0 00-1.65 5.506 7.338 7.338 0 01-.78 1.493c-.22.32-.472.635-.8 1.025a1.509 1.509 0 00-.832.085 12.722 12.722 0 00-1.773-1.124c-.66-.34-1.366-.616-2.215-.871a1.5 1.5 0 10-2.708 1.204c-.9 1.935-1.236 3.607-1.409 5.838a1.5 1.5 0 101.497.095c.162-2.07.464-3.55 1.25-5.253.381-.02.725-.183.979-.435.763.23 1.367.471 1.919.756a11.13 11.13 0 011.536.973 1.5 1.5 0 102.899-.296c.348-.415.64-.779.894-1.148.375-.548.665-1.103.964-1.857A3 3 0 1013 0zm-1.5 3a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
    clipRule="evenodd"/>
  </svg>
)

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
        'flex aspect-square w-full items-center justify-center rounded-md text-black transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-inktor-cyan *:w-6 *:h-6',
        `${active && 'bg-inktor-cyan'}`
      )}
      onClick={onClick}
    >
      {content}
    </div>
  )
})

interface AddOptions {
  addButtonRef: RefObject<HTMLDivElement>
}

const AddOptions: FC<AddOptions> = ({ addButtonRef }) => {
  // If someone has a better way of implementing this please let me know xD
  // - Bryn.
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null)
  const resizeObserver = useRef(new ResizeObserver(() => {
    if (!addButtonRef.current) return
    const rect = addButtonRef.current.getBoundingClientRect()
    setPosition({ y: rect.top, x: rect.right })
  }))
  const offsetX = 15;
  const offsetY = -8;
  useEffect(() => {
    if (!addButtonRef.current) return
    const rect = addButtonRef.current.getBoundingClientRect()
    setPosition({ y: rect.top, x: rect.right })
    const root = document.getElementById("root")
    if (!root) return
    resizeObserver.current.observe(root)
  }, [])
  return (
    <>
      {position && (
        <div className="absolute z-10 flex h-12 w-32 gap-2 p-2 bg-white shadow-toolbar rounded-md" style={{ left: position.x + offsetX, top: position.y + offsetY }}>
          <ToolbarButton
            content={<CircleSVG />}
          />
          <ToolbarButton
            content={<RectSVG />}
          />
          <ToolbarButton
            content={<PathSVG />}
          />
        </div>
      )}
    </>
  )
}

interface Toolbar {
  setNormalMode?: () => void
  setResizeMode?: () => void
  onClickAdd?: () => void
  showAddOptions?: boolean
}

const Toolbar: FC<Toolbar> = (props) => {
  const [active, setActive] = useState('pointer')
  const addButtonRef = useRef<HTMLDivElement>(null)
  const doNothing = () => { }
  const setNormalMode = props.setNormalMode ?? doNothing
  const setResizeMode = props.setResizeMode ?? doNothing
  const onClickAdd = props.onClickAdd ?? doNothing
  const showAddOptions = props.showAddOptions ?? false

  return (
    <>
      {
        showAddOptions && <AddOptions addButtonRef={addButtonRef} />
      }
      <div className='h-toolbar toolbar shadow-toolbar absolute left-3 flex w-12 flex-col gap-2 rounded-md bg-white p-2'>
        <ToolbarButton
          content={<AddSVG />}
          onClick={onClickAdd}
          ref={addButtonRef}
        />
        <ToolbarButton
          content={<PointerSVG />}
          onClick={() => {
            setActive('pointer')
            setNormalMode()
          }}
          active={active === 'pointer'}
        />

        <ToolbarButton
          content={<ResizeSVG />}
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
