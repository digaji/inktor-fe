import { Vec2 } from '@/utils/Vec2'

class Circle {
  pos: Vec2
  reg: {
    prevMousePos: Vec2
    prevPos: Vec2
  }
  state: 'RESIZE' | 'NORMAL'
  static resizeHandleScreenSize: number = 5
  radius: number
  dragging: boolean
  resizing: boolean

  constructor(x: number = 0, y: number = 0) {
    this.pos = Vec2.new(x, y)
    this.state = 'NORMAL'
    this.reg = {
      prevMousePos: Vec2.new(0, 0),
      prevPos: Vec2.new(x, y),
    }
    this.radius = 25
    this.dragging = false
    this.resizing = false
  }

  canDrag(mousePos: Vec2) {
    return mousePos.dist(this.pos) <= this.radius
  }

  canResize(mousePos: Vec2) {
    const resizeHandlePos = this.pos.add(Vec2.new(this.radius, 0))
    const closeEnough = mousePos.dist(resizeHandlePos) <= Circle.resizeHandleScreenSize
    const isModeResize = this.state === 'RESIZE'

    return closeEnough && isModeResize
  }

  onMouseDown(mousePos: Vec2) {
    if (this.canResize(mousePos)) {
      this.resizing = true
      return
    }

    if (this.canDrag(mousePos)) {
      this.dragging = true
      this.reg.prevMousePos = mousePos.copy()
      this.reg.prevPos = this.pos.copy()
    }
  }

  onMouseMove(mousePos: Vec2) {
    if (this.resizing) {
      const newRad = mousePos.sub(this.pos).mag()
      this.radius = newRad
      return true
    }

    if (this.dragging) {
      this.pos = mousePos.sub(this.reg.prevMousePos).add(this.reg.prevPos)
      return true
    }

    return false
  }

  onMouseUp() {
    this.dragging = false
    this.resizing = false
  }
}

export default Circle
