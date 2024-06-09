import { SVGCircle, SVGPath, SVGRectangle } from '@inktor/inktor-crdt-rs'
import { FC, useCallback, useEffect, useState } from 'react'

import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import CrdtClient from '@/components/molecules/Crdt'
import { useColorPicker } from '@/hooks/useColorPicker'
import clsxm from '@/utils/clsxm'

import ElementInfo from './ElementInfo'
import LayersInfo from './LayersInfo'

type SelectedItem = SVGCircle | SVGRectangle | SVGPath | undefined
interface PropertiesBar {
  client: CrdtClient
  selected: SelectedItem
  setSelected: React.Dispatch<React.SetStateAction<Circle | Rectangle | Path | undefined>>
  onClickDelete: () => void
  setRenderPropbar: (fn: () => void) => void
}

type PropertiesTabs = 'LAYERS' | 'ELEMENTS'

const usePropertiesTabs = ({ selected }: { selected: SelectedItem }) => {
  const [tab, setTab] = useState<PropertiesTabs>('ELEMENTS')
  useEffect(() => {
    if (selected === undefined) {
      setTab('LAYERS')
    }
  }, [selected])
  const onClickLayers = useCallback(() => {
    setTab('LAYERS')
  }, [])
  const onClickElements = useCallback(() => {
    setTab('ELEMENTS')
  }, [])

  const isLayers = tab === 'LAYERS'
  const isElements = tab === 'ELEMENTS'

  return { onClickElements, onClickLayers, isElements, isLayers }
}

const PropertiesBar: FC<PropertiesBar> = ({ client, selected, setSelected, onClickDelete, setRenderPropbar }) => {
  const { onClickElements, onClickLayers, isElements, isLayers } = usePropertiesTabs({ selected })
  const fillPicker = useColorPicker()
  const strokePicker = useColorPicker()

  return (
    <section
      className={clsxm(
        'absolute right-0 flex h-screen w-80 flex-col gap-2 border-l-2 border-gray-200 bg-white transition-all duration-150'
      )}
      onClick={() => {
        fillPicker.hideColorPicker()
        strokePicker.hideColorPicker()
      }}
    >
      <div className='bg-[#e5e7eb]'>
        {selected && (
          <button
            className={clsxm('px-2 py-1 text-gray-600', isElements && 'bg-white')}
            onClick={onClickElements}
          >
            Element
          </button>
        )}
        <button
          className={clsxm('px-2 py-1 text-gray-600', isLayers && 'bg-white')}
          onClick={onClickLayers}
        >
          Layers
        </button>
      </div>
      {isElements && selected && (
        <ElementInfo
          client={client}
          selected={selected}
          setSelected={setSelected}
          onClickDelete={onClickDelete}
          setRenderPropbar={setRenderPropbar}
        />
      )}
      {isLayers && <LayersInfo crdtClient={client} />}
    </section>
  )
}

export default PropertiesBar
