import { useCallback, useRef, useState } from 'react'
import Canvas from '@/components/organisms/Canvas'
import { CanvasDraw, MouseContext, MouseWheel } from '@/components/organisms/Canvas/types'
import '@/css/canvas.css'
import Toolbar from '@/components/particles/Toolbar'
import RenderingEngine from '@/components/organisms/RenderingEngine'
import Settings from '@/components/particles/Settings'

let engine: RenderingEngine | null = null;

const getRenderingEngine = () => {
  if (engine === null) {
    engine = new RenderingEngine()
    return engine
  }
  return engine
}

const useRenderingEngine = () => {
  const renderingEngine = useRef(getRenderingEngine())

  const onMouseMove = useCallback((ctx: MouseContext) => {
    renderingEngine.current.onMouseMove(ctx)
  }, [])

  const onMouseDown = useCallback((ctx: MouseContext) => {
    renderingEngine.current.onMouseDown(ctx)
  }, [])

  const onMouseUp = useCallback(() => {
    renderingEngine.current.onMouseUp()
  }, [])

  const onMouseWheel = useCallback((wheel: MouseWheel) => {
    renderingEngine.current.onMouseScroll(wheel)
  }, [])

  const setResizeMode = useCallback(() => {
    renderingEngine.current.setResizeMode()
  }, [])

  const setNormalMode = useCallback(() => {
    renderingEngine.current.setNormalMode()
  }, [])

  const setAddCircle = useCallback(() => {
    renderingEngine.current.setAddCircle()
  }, [])

  const setAddRectangle = useCallback(() => {
    renderingEngine.current.setAddRectangle()
  }, [])

  const setAddPath = useCallback(() => {
    renderingEngine.current.setAddPath()
  }, [])

  const draw: CanvasDraw = useCallback((ctx) => {
    renderingEngine.current.render(ctx)
  }, [])

  return {
    draw,
    onMouseMove,
    onMouseUp,
    onMouseDown,
    onMouseWheel,
    setResizeMode,
    setNormalMode,
    setAddCircle,
    setAddRectangle,
    setAddPath
  }
}

function LiveCanvas() {
  const { 
    draw, 
    onMouseMove, 
    onMouseDown, 
    onMouseUp, 
    onMouseWheel, 
    setResizeMode, 
    setNormalMode, 
    ...other
  } = useRenderingEngine()
  const [showAddOptions, setShowAddOption] = useState(false);

  const onClickAdd = useCallback(() => {
    setShowAddOption(prev => !prev)
  }, [setShowAddOption]);

  const onMouseDownExtra = useCallback((ctx: MouseContext) => {
    setShowAddOption(false)
    onMouseDown(ctx)
  }, [])

  const setAddCircle = useCallback(() => {
    setShowAddOption(false)
    other.setAddCircle()
  }, [])

  const setAddRectangle = useCallback(() => {
    setShowAddOption(false)
    other.setAddRectangle()
  }, [])

  const setAddPath = useCallback(() => {
    setShowAddOption(false)
    other.setAddPath()
  }, [])

  return (
    <>
      <Settings />

      <Toolbar {...{
        setNormalMode, 
        setResizeMode, 
        onClickAdd, 
        showAddOptions, 
        setAddCircle, 
        setAddRectangle,
        setAddPath
      }} />

      <Canvas
        draw={draw}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDownExtra}
        onMouseUp={onMouseUp}
        onMouseWheel={onMouseWheel}
      />
    </>
  )
}

export default LiveCanvas
