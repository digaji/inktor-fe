import { useCallback, useRef } from 'react'
import Canvas from '@/components/organisms/Canvas'
import { CanvasDraw, MouseContext, MouseWheel } from '@/components/organisms/Canvas/types'
import '@/css/canvas.css'
import Toolbar from '@/components/particles/Toolbar'
import RenderingEngine from '@/components/organisms/RenderingEngine'
import Settings from '@/components/particles/Settings'

const useRenderingEngine = () => {
  const renderingEngine = useRef(new RenderingEngine())

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
  }
}

function LiveCanvas() {
  const { draw, onMouseMove, onMouseDown, onMouseUp, onMouseWheel, setResizeMode, setNormalMode } = useRenderingEngine()

  return (
    <>
      <Settings />

      <Toolbar {...{ setNormalMode, setResizeMode }} />

      <Canvas
        draw={draw}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseWheel={onMouseWheel}
      />
    </>
  )
}

export default LiveCanvas
