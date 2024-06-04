import { SVGDocTree, SVGGroup } from '@inktor/inktor-crdt-rs'

type SVGLayerCircle = { type: 'CIRCLE'; id: string; depth: number }
type SVGLayerRectangle = { type: 'RECTANGLE'; id: string; depth: number }
type SVGLayerPath = { type: 'PATH'; id: string; depth: number }
type SVGLayerGroup = { type: 'GROUP'; id: string; depth: number }

export type SVGLayerObject = SVGLayerCircle | SVGLayerRectangle | SVGLayerPath | SVGLayerGroup

const deriveLayersAux = (group: SVGGroup, depth: number): SVGLayerObject[] => {
  const layers: SVGLayerObject[] = []

  for (const ob of group.children) {
    if (ob.type === 'GROUP') {
      layers.push({
        type: 'GROUP',
        id: ob.id,
        depth: depth + 1,
      })
      layers.push(...deriveLayersAux(ob, depth + 1))
    } else if (ob.type === 'CIRCLE') {
      layers.push({
        type: 'CIRCLE',
        id: ob.id,
        depth: depth + 1,
      })
    } else if (ob.type === 'PATH') {
      layers.push({
        type: 'PATH',
        id: ob.id,
        depth: depth + 1,
      })
    } else if (ob.type === 'RECTANGLE') {
      layers.push({
        type: 'RECTANGLE',
        id: ob.id,
        depth: depth + 1,
      })
    }
  }

  return layers
}

const deriveLayers = (tree: SVGDocTree): SVGLayerObject[] => {
  const layers: SVGLayerObject[] = []
  for (const ob of tree.children) {
    if (ob.type === 'GROUP') {
      layers.push({
        type: 'GROUP',
        id: ob.id,
        depth: 0,
      })
      const children = deriveLayersAux(ob, 0)
      layers.push(...children)
    } else if (ob.type === 'CIRCLE') {
      layers.push({
        type: 'CIRCLE',
        id: ob.id,
        depth: 0,
      })
    } else if (ob.type === 'PATH') {
      layers.push({
        type: 'PATH',
        id: ob.id,
        depth: 0,
      })
    } else if (ob.type === 'RECTANGLE') {
      layers.push({
        type: 'RECTANGLE',
        id: ob.id,
        depth: 0,
      })
    }
  }
  return layers
}

export default deriveLayers
