import { SVGCircle, SVGPath, SVGRectangle } from '@inktor/inktor-crdt-rs'

import { CombinedElement } from '@/types/elements'

export const useAssertions = () => {
  const isCircle = (selected: CombinedElement): selected is SVGCircle => {
    return (selected as SVGCircle).radius !== undefined
  }

  const isRect = (selected: CombinedElement): selected is SVGRectangle => {
    return (selected as SVGRectangle).height !== undefined
  }

  const isPath = (selected: CombinedElement): selected is SVGPath => {
    return (selected as SVGPath).points !== undefined
  }

  return {
    isCircle,
    isRect,
    isPath,
  }
}
