import CrdtClient, { PathCommand, SVGColor } from '@/components/molecules/Crdt'
import { EngineContext } from '@/components/molecules/RenderingEngine/type'
import { Vec2 } from '@/utils/Vec2'

class Path {
  readonly id: string
  readonly points: PathCommand[]
  readonly stroke_width: number
  readonly opacity: number
  readonly fill: SVGColor
  readonly stroke: SVGColor

  engineContext: EngineContext
  crdtClient: CrdtClient

  constructor(
    id: string,
    points: PathCommand[],
    stroke_width: number,
    opacity: number,
    fill: SVGColor,
    stroke: SVGColor,
    engineContext: EngineContext,
    crdtClient: CrdtClient
  ) {
    this.id = id
    this.points = points
    this.stroke_width = stroke_width
    this.opacity = opacity
    this.fill = fill
    this.stroke = stroke
    this.engineContext = engineContext
    this.crdtClient = crdtClient
  }

  private findPointCloseEnough(mousePos: Vec2): [string, Vec2] | null {
    let prevPos: Vec2 | null = null

    for (const point of this.points) {
      if (point.type === 'CLOSE') continue

      const pointPos = Vec2.new(point.pos.x, point.pos.y)
      const closeEnough = mousePos.dist(pointPos) <= this.engineContext.getResizeHandleScreenRadius()

      if (closeEnough) return [`${this.id}/${point.id}/POS`, pointPos]

      if ('handle' in point) {
        if (prevPos === null) continue
        const handlePos = prevPos.add(Vec2.new(point.handle.x, point.handle.y))
        const closeEnough = mousePos.dist(handlePos) <= this.engineContext.getResizeHandleScreenRadius()

        if (closeEnough) return [`${this.id}/${point.id}/H1`, handlePos]
      }

      if ('handle1' in point) {
        if (prevPos !== null) {
          const handle1Pos = prevPos.add(Vec2.new(point.handle1.x, point.handle1.y))
          const closeEnough = mousePos.dist(handle1Pos) <= this.engineContext.getResizeHandleScreenRadius()

          if (closeEnough) return [`${this.id}/${point.id}/H1`, handle1Pos]
        }

        const handle2Pos = pointPos.add(Vec2.new(point.handle2.x, point.handle2.y))
        const closeEnough = mousePos.dist(handle2Pos) <= this.engineContext.getResizeHandleScreenRadius()

        if (closeEnough) return [`${this.id}/${point.id}/H2`, handle2Pos]
      }
      prevPos = pointPos
    }
    return null
  }

  canDrag(mousePos: Vec2) {
    // If path this refers whether it can drag a path
    const isModeResize = this.engineContext.getState() === 'RESIZE'

    if (!isModeResize) return false

    const found = this.findPointCloseEnough(mousePos) !== null
    return found
  }

  canResize(_mousePos: Vec2) {
    return false
  }

  onMouseDown(mousePos: Vec2) {
    if (!this.canDrag(mousePos)) return
    const found = this.findPointCloseEnough(mousePos)

    if (found === null) return

    const [id, pos] = found
    this.engineContext.requestDragging(id, pos)
  }

  onMouseMove(mousePos: Vec2) {
    if (this.engineContext.isResizing(this.id)) return true

    const prevMousePos = this.engineContext.getDraggingLastMousePos()
    const prevPos = this.engineContext.getDraggingLastObjectPos()
    const pos = mousePos.sub(prevMousePos).add(prevPos)
    const posX = Math.floor(pos.x())
    const posY = Math.floor(pos.y())
    let prevPointPos: Vec2 | null = null

    for (const point of this.points) {
      if (point.type === 'CLOSE') continue

      let id = `${this.id}/${point.id}/POS`
      if (this.engineContext.isDragging(id)) {
        this.crdtClient.editPathPointPos(this.id, point.id, { x: posX, y: posY })
        return true
      }

      id = `${this.id}/${point.id}/H1`
      if (this.engineContext.isDragging(id)) {
        if (prevPointPos === null) continue

        const pos = mousePos.sub(prevMousePos).add(prevPos).sub(prevPointPos)
        const posX = Math.floor(pos.x())
        const posY = Math.floor(pos.y())

        this.crdtClient.editPathPointHandle1(this.id, point.id, { x: posX, y: posY })
        return true
      }

      id = `${this.id}/${point.id}/H2`
      if (this.engineContext.isDragging(id)) {
        if (point.type !== 'BEZIER') continue

        const pointPos = Vec2.new(point.pos.x, point.pos.y)
        const pos = mousePos.sub(prevMousePos).add(prevPos).sub(pointPos)
        const posX = Math.floor(pos.x())
        const posY = Math.floor(pos.y())

        this.crdtClient.editPathPointHandle2(this.id, point.id, { x: posX, y: posY })
        return true
      }

      prevPointPos = Vec2.new(point.pos.x, point.pos.y)
    }
    return false
  }

  onMouseUp() {}
}

export default Path
