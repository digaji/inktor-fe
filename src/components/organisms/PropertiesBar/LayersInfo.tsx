import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FC, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import IcSixDots from '@/assets/icons/ic-sixdots.svg?react'
import CrdtClient from '@/components/molecules/Crdt'
import deriveLayers, { SVGLayerObject } from '@/components/molecules/Layers'
import clsxm from '@/utils/clsxm'

type LayersInfoProps = {
  crdtClient: CrdtClient
}

const INDENT_WIDTH = 25 // px

const useLayers = ({ crdtClient }: { crdtClient: CrdtClient }) => {
  const [layers, setLayers] = useState<SVGLayerObject[]>(deriveLayers(crdtClient.children()))
  useEffect(() => {
    const subscriberId = crdtClient.addMutateSubsriber(() => {
      const tree = crdtClient.children()
      setLayers(deriveLayers(tree))
    })
    return () => {
      crdtClient.removeMutateSubscriber(subscriberId)
    }
  }, [crdtClient])

  return { layers, setLayers }
}

type LayerItemProps = {
  object: SVGLayerObject
  overlay?: boolean
  result?: boolean
}

const useHover = () => {
  const [hover, setHover] = useState(false)

  const onMouseEnter = useCallback(() => {
    setHover(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    setHover(false)
  }, [])

  return { hover, onMouseEnter, onMouseLeave }
}

const LayerItem: FC<LayerItemProps> = ({ object, ...props }) => {
  const { hover, onMouseEnter, onMouseLeave } = useHover()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: object.id, disabled: !hover })
  const name = object.type.charAt(0).toUpperCase() + object.type.slice(1).toLowerCase()
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }
  const overlay = props.overlay ?? false
  const result = props.result ?? false
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={clsxm('flex gap-2 bg-white px-1 py-1', result && 'opacity-50')}
    >
      <button
        className={clsxm(
          'cursor-grab rounded-sm bg-black bg-opacity-0 px-[0.5px] hover:bg-opacity-30',
          overlay && 'cursor-grabbing'
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <IcSixDots />
      </button>
      {name}
    </div>
  )
}

const LayersInfo: FC<LayersInfoProps> = ({ crdtClient }) => {
  const [activeLayer, setActiveLayer] = useState<SVGLayerObject | null>(null)
  const { layers, setLayers } = useLayers({ crdtClient })
  const activeLayerId = activeLayer?.id ?? null

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      const id = e.active.id
      const layer = layers.find((ly) => ly.id === id)
      if (!layer) return
      setActiveLayer(layer)
    },
    [layers]
  )

  const onDragOver = useCallback(
    (e: DragOverEvent) => {
      setLayers((layers) => {
        const activeId = e.active.id
        const overId = e.over?.id
        if (overId === undefined) return layers
        const activeLayerIndex = layers.findIndex((ly) => ly.id === activeId)
        const overLayerIndex = layers.findIndex((ly) => ly.id === overId)
        if (activeLayerIndex === -1) return layers
        if (overLayerIndex === -1) return layers
        return arrayMove(layers, activeLayerIndex, overLayerIndex)
      })
    },
    [setLayers]
  )

  const onDragEnd = useCallback(
    (_e: DragEndEvent) => {
      if (!activeLayerId) return
      const activeIndex = layers.findIndex((ly) => ly.id === activeLayerId)
      if (activeIndex === -1) return
      crdtClient.moveObject(null, activeLayerId, activeIndex)
      setActiveLayer(null)
    },
    [layers, activeLayerId, crdtClient]
  )
  return (
    <DndContext
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={layers.map((it) => it.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className='flex h-full flex-col gap-[1px] overflow-x-hidden overflow-y-scroll px-1 pt-2'>
          {layers.map((it) => (
            <LayerItem
              key={it.id}
              object={it}
              result={it.id === activeLayerId}
            />
          ))}
        </div>
      </SortableContext>
      {activeLayer &&
        createPortal(
          <DragOverlay>
            <LayerItem
              key={activeLayer.id}
              object={activeLayer}
            />
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}

export default LayersInfo
