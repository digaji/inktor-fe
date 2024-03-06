import { useCallback, useState } from 'react'

import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import Canvas from '@/components/organisms/Canvas'
import { MouseContext } from '@/components/organisms/Canvas/types'
import PropertiesBar from '@/components/particles/PropertiesBar'
import Settings from '@/components/particles/Settings'
import Toolbar from '@/components/particles/Toolbar'
import { useAssertions } from '@/hooks/useAssertions'
import useRenderingEngine from '@/hooks/useRenderingEngine'

const LiveCanvas = () => {
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
  const [showAddOptions, setShowAddOption] = useState(false)
  const assertions = useAssertions()

  const onClickAdd = useCallback(() => {
    setShowAddOption((prev) => !prev)
  }, [setShowAddOption])

  const onMouseDownExtra = useCallback(
    (ctx: MouseContext) => {
      setShowAddOption(false)
      onMouseDown(ctx)
    },
    [onMouseDown, setShowAddOption]
  )

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

  const assertInstance = (selected: Circle | Rectangle | Path) => {
    switch (true) {
      case selected instanceof Circle || assertions.isCircle(selected):
        return client.getCircle(selected.id)
      case selected instanceof Rectangle || assertions.isRect(selected):
        return client.getRectangle(selected.id)
      case selected instanceof Path || assertions.isPath(selected):
        return client.getPath(selected.id)
    }
  }

  const element = selected ? assertInstance(selected) : undefined

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

      <Settings propBarVisible={!!element} />

      {element && (
        <PropertiesBar
          client={client}
          selected={element}
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
