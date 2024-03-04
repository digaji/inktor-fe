import { useCallback, useRef, useState } from 'react'

import Canvas from '@/components/organisms/Canvas'
import { CanvasDraw, MouseContext, MouseWheel } from '@/components/organisms/Canvas/types'
import RenderingEngine from '@/components/organisms/RenderingEngine'
import PropertiesBar from '@/components/particles/PropertiesBar'
import Settings from '@/components/particles/Settings'
import Toolbar from '@/components/particles/Toolbar'

let engine: RenderingEngine | null = null

const getRenderingEngine = () => {
  if (engine === null) {
    engine = new RenderingEngine()
    return engine
  }

  return engine
}

const useRenderingEngine = () => {
  const renderingEngine = useRef(getRenderingEngine())
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

  const setRenderPropbar = useCallback((renderPropbar: () => void) => {
    renderingEngine.current.setRenderPropbar(renderPropbar)
  }, [])

  return {
    draw,
    selected,
    client,
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

function LiveCanvas() {
  const { 
    draw, 
    selected,
    client,
    onMouseMove, 
    onMouseDown, 
    onMouseUp, 
    onMouseWheel, 
    setSelected,
    setResizeMode, 
    setNormalMode, 
    setRenderPropbar,
    ...other
  } = useRenderingEngine()
  const [showAddOptions, setShowAddOption] = useState(false);

  const onClickAdd = useCallback(() => {
    setShowAddOption((prev) => !prev)
  }, [setShowAddOption])

  const onMouseDownExtra = useCallback((ctx: MouseContext) => {
    setShowAddOption(false)
    onMouseDown(ctx)
  }, [onMouseDown, setShowAddOption])

  const setAddCircle = useCallback(() => {
    other.setAddCircle()
  }, [other])

  const setAddRectangle = useCallback(() => {
    other.setAddRectangle()
  }, [other])

  const setAddPath = useCallback(() => {
    other.setAddPath()
  }, [other])

  const onClickDelete = useCallback(() => {
    if (selected === undefined) return

    client.removeObject(selected.id)
  }, [client, selected])

  const circle = selected ? client.getCircle(selected.id) : undefined
  return (
    <main>
      <Toolbar
        setNormalMode={setNormalMode}
        setResizeMode={setResizeMode}
        onClickAdd={onClickAdd}
        setAddCircle={setAddCircle}
        setAddRectangle={setAddRectangle}
        setAddPath={setAddPath}
        showAddOptions={showAddOptions}
      />

      <Settings propBarVisible={!!circle} />

      {circle && (
        <PropertiesBar
          client={client}
          selected={circle}
          setSelected={setSelected}
          onClickDelete={onClickDelete}
          setRenderPropbar={setRenderPropbar}
        />
      )}

      <Canvas
        draw={draw}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDownExtra}
        onMouseUp={onMouseUp}
        onMouseWheel={onMouseWheel}
      />
    </main>
  )
}

export default LiveCanvas
