import CrdtClient, { SVGColor } from '@/components/organisms/Crdt'
import { EngineContext } from '@/components/organisms/RenderingEngine/type'
import { Vec2 } from '@/utils/Vec2'

class Circle {
  readonly id: string
  readonly pos: Vec2
  readonly radius: number
  readonly stroke_width: number
  readonly opacity: number
  readonly fill: SVGColor
  readonly stroke: SVGColor
  engineContext: EngineContext
  crdtClient: CrdtClient

  constructor(
    id: string,
    x: number,
    y: number,
    radius: number,
    stroke_width: number,
    opacity: number,
    fill: SVGColor,
    stroke: SVGColor,
    engineContext: EngineContext,
    crdtClient: CrdtClient
  ) {
    this.id = id
    this.pos = Vec2.new(x, y)
    this.radius = radius
    this.stroke_width = stroke_width
    this.opacity = opacity
    this.fill = fill
    this.stroke = stroke

    this.engineContext = engineContext
    this.crdtClient = crdtClient
  }

  canDrag(mousePos: Vec2) {
    return mousePos.dist(this.pos) <= this.radius
  }

  canResize(mousePos: Vec2) {
    const resizeHandlePos = this.pos.add(Vec2.new(this.radius, 0))
    const closeEnough = mousePos.dist(resizeHandlePos) <= this.engineContext.getResizeHandleScreenRadius()
    const isModeResize = this.engineContext.getState() === 'RESIZE'

    return closeEnough && isModeResize
  }

  onMouseDown(mousePos: Vec2) {
    if (this.canResize(mousePos) && this.engineContext.requestResizing(this.id)) {
      return
    }

    if (this.canDrag(mousePos) && this.engineContext.requestDragging(this.id, this.pos)) {
      return
    }
  }

  onMouseMove(mousePos: Vec2) {
    if (this.engineContext.isResizing(this.id)) {
      const newRad = Math.floor(mousePos.sub(this.pos).mag())
      // this.radius = newRad
      this.crdtClient.editCircle(this.id, { radius: newRad })
      return true
    }

    if (this.engineContext.isDragging(this.id)) {
      const prevMousePos = this.engineContext.getDraggingLastMousePos()
      const prevPos = this.engineContext.getDraggingLastObjectPos()
      const pos = mousePos.sub(prevMousePos).add(prevPos)
      const x = Math.floor(pos.x())
      const y = Math.floor(pos.y())
      this.crdtClient.editCircle(this.id, { pos: { x, y } })
      return true
    }

    return false
  }

  onMouseUp() {}
}

export default Circle
