import { SVGCircle, SVGPath, SVGRectangle } from '@inktor/inktor-crdt-rs'

import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'

type CustomElement = Circle | Rectangle | Path
export type CustomSVGElement = SVGCircle | SVGRectangle | SVGPath
export type CombinedElement = CustomSVGElement | CustomElement
