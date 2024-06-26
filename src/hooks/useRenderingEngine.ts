import { useCallback, useRef, useState } from 'react'

import { CanvasDraw, MouseContext, MouseWheel } from '@/components/molecules/Canvas/types'
import RenderingEngine from '@/components/molecules/RenderingEngine'

let engine: RenderingEngine | null = null

const getRenderingEngine = (logic: string) => {
  if (engine === null) {
    engine = new RenderingEngine(logic)
    return engine
  }

  return engine
}

const useRenderingEngine = (logic: string) => {
  const renderingEngine = useRef(getRenderingEngine(logic))
  const [selected, setSelected] = useState(renderingEngine.current.selected)

  const onMouseMove = useCallback((ctx: MouseContext) => {
    renderingEngine.current.onMouseMove(ctx)
  }, [])

  const onMouseDown = useCallback((ctx: MouseContext) => {
    renderingEngine.current.onMouseDown(ctx)
    setSelected(renderingEngine.current.selected)
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

  const client = renderingEngine.current.crdtClient
  const context = renderingEngine.current.context

  const setRenderPropbar = useCallback((renderPropbar: () => void) => {
    renderingEngine.current.setRenderPropbar(renderPropbar)
  }, [])

  return {
    draw,
    selected,
    client,
    context,
    onMouseMove,
    onMouseUp,
    onMouseDown,
    onMouseWheel,
    setSelected,
    setResizeMode,
    setNormalMode,
    setAddCircle,
    setAddRectangle,
    setAddPath,
    setRenderPropbar,
  }
}

export default useRenderingEngine
