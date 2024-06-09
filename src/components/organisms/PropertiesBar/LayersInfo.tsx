import { DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from 'antd'
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import IcCaretDown from '@/assets/icons/ic-caret-down.svg?react'
import IcCaretRight from '@/assets/icons/ic-caret-right.svg?react'
import IcSixDots from '@/assets/icons/ic-sixdots.svg?react'
import CrdtClient from '@/components/molecules/Crdt'
import deriveLayers, { SVGLayerObject } from '@/components/molecules/Layers'
import clsxm from '@/utils/clsxm'

type IDSet = { [key: string]: null }
type SetLayersCb = (st: { layers: SVGLayerObject[]; foldedLayers: IDSet }) => SVGLayerObject[]

type LayersInfoProps = {
  crdtClient: CrdtClient
}

const INDENT_WIDTH = 25 // px

const updateDepth = (
  layers: SVGLayerObject[],
  activeId: string,
  initialDepth: number,
  oldLeft: number,
  newLeft: number,
  foldedLayers: IDSet
): SVGLayerObject[] => {
  const currDepthChange = Math.floor((newLeft - oldLeft) / INDENT_WIDTH)
  const activeIndex = layers.findIndex((it) => it.id == activeId)
  if (activeIndex <= 0) {
    const activeLayer = { ...layers[activeIndex], depth: 0 }
    return [...layers.slice(0, activeIndex), activeLayer, ...layers.slice(activeIndex + 1)]
  }

  const belowLayerDepth = activeIndex === layers.length - 1 ? 0 : layers[activeIndex + 1].depth
  const aboveLayer = layers[activeIndex - 1]

  let currDepth = currDepthChange + initialDepth

  // when the above element is folded, you cannot be a child of that element
  if (aboveLayer.id in foldedLayers && aboveLayer.depth <= currDepth) {
    const activeLayer = { ...layers[activeIndex], depth: aboveLayer.depth }
    return [...layers.slice(0, activeIndex), activeLayer, ...layers.slice(activeIndex + 1)]
  }

  // when the element above you is not a group, you cannot be it's children
  if (aboveLayer.type !== 'GROUP' && aboveLayer.depth <= currDepth) {
    const activeLayer = { ...layers[activeIndex], depth: aboveLayer.depth }
    return [...layers.slice(0, activeIndex), activeLayer, ...layers.slice(activeIndex + 1)]
  }

  if (aboveLayer.depth + 1 < currDepth) {
    currDepth = aboveLayer.depth + 1
  } else if (currDepth < belowLayerDepth) {
    currDepth = belowLayerDepth
  }

  const activeLayer = { ...layers[activeIndex], depth: currDepth }
  return [...layers.slice(0, activeIndex), activeLayer, ...layers.slice(activeIndex + 1)]
}

const skipChildren = (layers: SVGLayerObject[], index: number) => {
  const layer = layers[index]
  let k = index + 1
  while (k < layers.length && layers[k].depth > layer.depth) {
    k += 1
  }
  return k
}

const removeFolded = (layers: SVGLayerObject[], foldedLayers: IDSet) => {
  const result: SVGLayerObject[] = []
  let idx = 0
  const length = layers.length
  while (idx < length) {
    const layer = layers[idx]
    result.push(layer)
    if (layer.id in foldedLayers) {
      idx = skipChildren(layers, idx)
    } else {
      idx += 1
    }
  }
  return result
}

const useLayers = ({ crdtClient }: { crdtClient: CrdtClient }) => {
  const [state, setState] = useState<{
    layers: SVGLayerObject[]
    foldedLayers: IDSet
  }>({ layers: deriveLayers(crdtClient.children()), foldedLayers: {} })
  const { layers, foldedLayers } = state
  const setLayers = useCallback((s: SetLayersCb) => {
    setState(({ layers: prevLayers, foldedLayers }) => {
      const afterS = s({ layers: prevLayers, foldedLayers })
      const layers = removeFolded(afterS, foldedLayers)
      return { layers, foldedLayers }
    })
  }, [])
  const setFoldedLayers: Dispatch<SetStateAction<IDSet>> = useCallback((s) => {
    setState(({ layers, foldedLayers }) => {
      let nxt: IDSet
      if (typeof s === 'function') {
        nxt = s(foldedLayers)
      } else {
        nxt = s
      }
      return { layers, foldedLayers: nxt }
    })
  }, [])

  const toggleFold = useCallback(
    (layerId: string) => {
      setState(({ foldedLayers }) => {
        const layers = deriveLayers(crdtClient.children())
        if (layerId in foldedLayers) {
          delete foldedLayers[layerId]
        } else {
          foldedLayers[layerId] = null
        }
        const result: SVGLayerObject[] = removeFolded(layers, foldedLayers)
        return { layers: result, foldedLayers }
      })
    },
    [crdtClient]
  )
  useEffect(() => {
    const subscriberId = crdtClient.addMutateSubsriber(() => {
      const tree = crdtClient.children()
      setLayers(() => deriveLayers(tree))
    })
    return () => {
      crdtClient.removeMutateSubscriber(subscriberId)
    }
  }, [crdtClient, setLayers])

  return { layers, setLayers, foldedLayers, setFoldedLayers, toggleFold }
}

type LayerItemProps = {
  object: SVGLayerObject
  overlay?: boolean
  result?: boolean
  fold?: boolean
  toggleFold?: () => void
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
  const fold = props.fold ?? false
  const toggleFold = props.toggleFold ?? (() => {})
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ paddingLeft: `${INDENT_WIDTH * object.depth}px`, ...style }}
    >
      <div className={clsxm('flex gap-2 bg-white px-1 py-1', result && 'opacity-50')}>
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
        {object.type === 'GROUP' && (
          <button
            className='rounded-sm bg-black bg-opacity-0 hover:bg-opacity-30'
            onClick={toggleFold}
          >
            {fold ? <IcCaretRight /> : <IcCaretDown />}
          </button>
        )}
        {name}
      </div>
    </div>
  )
}

const LayersInfo: FC<LayersInfoProps> = ({ crdtClient }) => {
  const [activeLayer, setActiveLayer] = useState<SVGLayerObject | null>(null)
  const [initialActiveDepth, setInitialActiveDepth] = useState(0)
  const { layers, setLayers, foldedLayers, toggleFold } = useLayers({ crdtClient })
  const activeLayerId = activeLayer?.id ?? null

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      setLayers(({ layers }) => {
        const id = e.active.id
        const layerIndex = layers.findIndex((ly) => ly.id === id)
        if (layerIndex === -1) return layers
        const layer = layers[layerIndex]
        setActiveLayer(layer)
        setInitialActiveDepth(layer.depth)
        const k = skipChildren(layers, layerIndex)
        return [...layers.slice(0, layerIndex + 1), ...layers.slice(k)]
      })
    },
    [setLayers]
  )

  const onDragOver = useCallback(
    (e: DragOverEvent) => {
      setLayers(({ layers, foldedLayers }) => {
        const activeId = e.active.id
        const overId = e.over?.id
        if (overId === undefined) return layers
        const activeLayerIndex = layers.findIndex((ly) => ly.id === activeId)
        const overLayerIndex = layers.findIndex((ly) => ly.id === overId)
        if (activeLayerIndex === -1) return layers
        if (overLayerIndex === -1) return layers
        const oldLeft = e.active.rect.current.initial?.left
        const newLeft = e.active.rect.current.translated?.left
        if (!oldLeft || !newLeft) return layers
        return updateDepth(
          arrayMove(layers, activeLayerIndex, overLayerIndex),
          activeId as string,
          initialActiveDepth,
          oldLeft,
          newLeft,
          foldedLayers
        )
      })
    },
    [setLayers, initialActiveDepth]
  )

  const onDragMove = useCallback(
    (e: DragMoveEvent) => {
      if (!activeLayerId) return
      const oldLeft = e.active.rect.current.initial?.left
      const newLeft = e.active.rect.current.translated?.left
      if (!oldLeft || !newLeft) return
      setLayers(({ layers }) => updateDepth(layers, activeLayerId, initialActiveDepth, oldLeft, newLeft, foldedLayers))
    },
    [activeLayerId, setLayers, initialActiveDepth, foldedLayers]
  )

  const onDragEnd = useCallback(
    (_e: DragEndEvent) => {
      if (!activeLayerId) return
      const activeIndex = layers.findIndex((ly) => ly.id === activeLayerId)
      const activeDepth = layers[activeIndex].depth
      let parentIndex = activeIndex - 1
      let insertIndex = 0
      while (parentIndex >= 0 && layers[parentIndex].depth >= activeDepth) {
        if (layers[parentIndex].depth === activeDepth) insertIndex += 1
        parentIndex -= 1
      }
      const parentId = parentIndex >= 0 ? layers[parentIndex].id : null
      crdtClient.moveObject(parentId, activeLayerId, insertIndex)
      setActiveLayer(null)
    },
    [layers, activeLayerId, crdtClient]
  )

  const onClickAddGroup = useCallback(() => {
    crdtClient.addGroup(null, {})
  }, [crdtClient])
  return (
    <DndContext
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragMove={onDragMove}
    >
      <SortableContext
        items={layers.map((it) => it.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className='px-1'>
          <Button
            className='w-full'
            onClick={onClickAddGroup}
          >
            Add Group
          </Button>
        </div>
        <div className='flex h-full flex-col gap-[1px] overflow-x-hidden overflow-y-scroll px-1 pt-2'>
          {layers.map((it) => (
            <LayerItem
              key={it.id}
              object={it}
              result={it.id === activeLayerId}
              fold={it.id in foldedLayers}
              toggleFold={() => toggleFold(it.id)}
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
              fold={activeLayer.id in foldedLayers}
              overlay
            />
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}

export default LayersInfo
