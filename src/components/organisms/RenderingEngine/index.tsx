import { Vec2 } from '@/utils/Vec2'
import { MouseContext, MouseWheel, MouseScroll } from '../Canvas/types'
import Circle from '@/components/atoms/Circle'
import Grid from '@/components/atoms/Grid'
import { EngineContext, EngineState } from './type'
import CrdtClient, { convertUtility } from '@/components/organisms/Crdt'
import Rectangle from '@/components/atoms/Rectangle'

class RenderingEngine {
  objects: (Circle | Rectangle)[]
  grid: Grid
  mouseDown: boolean
  lastMousePos: Vec2
  viewOffset: Vec2
  lastViewOffset: Vec2
  currentMousePos: Vec2
  screenWidth: number
  screenHeight: number
  screenScale: number
  state: EngineState
  context: EngineContext
  currentDraggingId: string | null
  currentResizingId: string | null
  currentDraggingData: {
    lastMouseCanvasPos: Vec2,
    lastObjectCanvasPos: Vec2
  }

  crdtClient: CrdtClient

  static resizeHandleScreenSize: number = 5

  constructor() {
    this.screenWidth = 0
    this.screenHeight = 0
    this.screenScale = 1
    this.currentDraggingId = null
    this.currentResizingId = null
    this.state = "NORMAL"
    this.currentDraggingData = {
      lastMouseCanvasPos: Vec2.zero(),
      lastObjectCanvasPos: Vec2.zero()
    }
    this.context = {
      getState: () => {
        return this.state
      },
      getResizeHandleScreenRadius: () => RenderingEngine.resizeHandleScreenSize,
      isDragging: (objectId: string) => this.currentDraggingId === objectId,
      isResizing: (objectId: string) => this.currentResizingId === objectId,
      getDraggingLastMousePos: () => this.currentDraggingData.lastMouseCanvasPos,
      getDraggingLastObjectPos: () => this.currentDraggingData.lastObjectCanvasPos,
      requestDragging: (objectId: string, objectCanvasPos: Vec2) => {
        this.currentResizingId = null
        this.currentDraggingId = objectId
        this.currentDraggingData = {
          lastMouseCanvasPos: this.screenToCanvas(this.currentMousePos),
          lastObjectCanvasPos: objectCanvasPos
        }
        return true
      },
      requestResizing: (objectId: string) => {
        this.currentResizingId = objectId
        this.currentDraggingId = null
        return true
      },
    }

    this.currentMousePos = Vec2.zero()
    this.lastMousePos = Vec2.zero()
    this.viewOffset = Vec2.zero()
    this.lastViewOffset = Vec2.zero()

    this.mouseDown = false
    this.grid = Grid(50, 10, 10)
    this.objects = []

    this.crdtClient = new CrdtClient()
    this.crdtClient.setRender(() => {
      const tree = this.crdtClient.children()
      this.objects = convertUtility(tree, this.crdtClient, this.context)
    })
    const tree = this.crdtClient.children()
    this.objects = convertUtility(tree, this.crdtClient, this.context)
  }

  setAddCircle() {
    this.crdtClient.addCircle(undefined, { pos: { x: 0, y: 0 }, radius: 25 })
  }

  setAddRectangle() {
    this.crdtClient.addRectangle(undefined, { pos: { x: 0, y: 0 }, height: 100, width: 150 })
  }

  screenToCanvas(pos: Vec2) {
    return pos.sub(this.viewOffset).scale(1 / this.screenScale)
  }

  canvasToScreen(canvasPos: Vec2) {
    return canvasPos.scale(this.screenScale).add(this.viewOffset)
  }

  onMouseDown(ctx: MouseContext) {
    this.mouseDown = true
    this.lastMousePos = ctx.pos.copy()
    this.lastViewOffset = this.viewOffset.copy()

    const mousePos = this.screenToCanvas(ctx.pos)

    this.objects.forEach((object) => {
      if (!(object.canDrag(mousePos) || object.canResize(mousePos))) return
      object.onMouseDown(mousePos)
    })
  }

  onMouseScroll(wheel: MouseWheel) {
    if (wheel.scroll === MouseScroll.SCROLL_DOWN && this.screenScale <= 0.8) return
    if (wheel.scroll === MouseScroll.SCROLL_UP && this.screenScale >= 2) return

    const oldMousePos = this.screenToCanvas(this.currentMousePos)

    if (wheel.scroll === MouseScroll.SCROLL_UP) {
      this.screenScale *= 1.1
    } else {
      this.screenScale *= 0.9
    }

    // adjust offset
    const mousePosChange = this.canvasToScreen(oldMousePos).sub(this.currentMousePos)
    this.viewOffset = this.viewOffset.sub(mousePosChange)
  }

  onMouseMove(ctx: MouseContext) {
    this.currentMousePos = ctx.pos.copy()
    const mousePos = this.screenToCanvas(ctx.pos)

    for (const object of this.objects) {
      const moving = object.onMouseMove(mousePos)
      if (moving) return
    }

    if (this.mouseDown) {
      const mouseDiff = ctx.pos.sub(this.lastMousePos)
      this.viewOffset = this.lastViewOffset.add(mouseDiff)
    }
  }

  onMouseUp() {
    this.mouseDown = false
    this.currentDraggingId = null
    this.currentResizingId = null

    for (const object of this.objects) {
      object.onMouseUp()
    }
  }

  setNormalMode() {
    this.state = "NORMAL"
  }

  setResizeMode() {
    this.state = "RESIZE"
  }

  renderSimple(ctx: CanvasRenderingContext2D) {
    const renderCircle = (data: {
      x: number
      y: number
      r: number
      fill?: string
      shadow?: {
        color: string
        blur: number
      }
      stroke?: {
        color: string
        width: number
      }
    }) => {
      const shadow = data.shadow
      const stroke = data.stroke

      if (shadow) {
        ctx.shadowColor = shadow.color
        ctx.shadowBlur = shadow.blur
      }

      if (stroke) {
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width
      }

      ctx.fillStyle = data.fill ?? 'black'
      ctx.beginPath()
      ctx.arc(data.x, data.y, data.r, 0, 2 * Math.PI)
      ctx.fill()

      if (shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }

      if (stroke) {
        ctx.stroke()
      }
    }

    const renderRectangle = (data: {
      x: number,
      y: number,
      width: number,
      height: number,
      fill?: string,
      stroke?: {
        color: string,
        width: number
      }
    }) => {
      const stroke = data.stroke
      if (stroke) {
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width
      }

      ctx.fillStyle = data.fill ?? "black"
      ctx.beginPath()
      ctx.rect(data.x, data.y, data.width, data.height)
      ctx.fill()
      if (stroke) {
        ctx.stroke()
      }
    }

    return {
      circle: renderCircle,
      rectangle: renderRectangle
    }
  }

  renderRectangle(rectangle: Rectangle, ctx: CanvasRenderingContext2D) {
    const renderSimple = this.renderSimple(ctx)
    const screenPos = this.canvasToScreen(rectangle.pos)
    const pX = screenPos.x()
    const pY = screenPos.y()
    const height = rectangle.height * this.screenScale
    const width = rectangle.width * this.screenScale

    renderSimple.rectangle({ x: pX, y: pY, height, width, fill: "black" })

    if (this.state === "RESIZE") {
      renderSimple.circle({
        x: pX + width,
        y: pY + height,
        r: RenderingEngine.resizeHandleScreenSize,
        fill: 'white',
        shadow: {
          color: 'black',
          blur: 5
        },
        stroke: {
          color: '#0c8ce9',
          width: 1.5
        }
      })
    }
  }

  renderCircle(circle: Circle, ctx: CanvasRenderingContext2D) {
    const renderSimple = this.renderSimple(ctx)
    const screenCirclePos = this.canvasToScreen(circle.pos)
    const pX = screenCirclePos.x()
    const pY = screenCirclePos.y()
    const r = circle.radius * this.screenScale

    renderSimple.circle({ x: pX, y: pY, r, fill: 'black' })

    if (this.state === 'RESIZE') {
      renderSimple.circle({
        x: pX + r,
        y: pY,
        r: RenderingEngine.resizeHandleScreenSize,
        fill: 'white',
        shadow: {
          color: 'black',
          blur: 5,
        },
        stroke: {
          color: '#0c8ce9',
          width: 1.5,
        },
      })
    }
  }

  renderGrid(grid: Grid, ctx: CanvasRenderingContext2D) {
    const screenStart = this.canvasToScreen(Vec2.zero())
    const screenSource = Vec2.zero()
    const screenDest = Vec2.new(ctx.canvas.width, ctx.canvas.height)

    const screenCellSize = grid.cellSize * this.screenScale
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)'
    const initialX = Math.max(
      screenStart.x(),
      Math.floor((screenSource.x() - screenStart.x()) / screenCellSize) * screenCellSize + screenStart.x()
    )

    const initialY = Math.max(
      screenStart.y(),
      Math.floor((screenSource.y() - screenStart.y()) / screenCellSize) * screenCellSize + screenStart.y()
    )

    ctx.lineWidth = 0.5
    let x = initialX

    while (x <= screenDest.x()) {
      ctx.beginPath()
      ctx.moveTo(x, screenSource.y())
      ctx.lineTo(x, screenDest.y())
      ctx.stroke()
      x += screenCellSize
    }

    x = initialX - screenCellSize
    while (x >= 0) {
      ctx.beginPath()
      ctx.moveTo(x, screenSource.y())
      ctx.lineTo(x, screenDest.y())
      ctx.stroke()
      x -= screenCellSize
    }

    let y = initialY
    while (y <= screenDest.y()) {
      ctx.beginPath()
      ctx.moveTo(screenSource.x(), y)
      ctx.lineTo(screenDest.x(), y)
      ctx.stroke()
      y += screenCellSize
    }

    y = initialY - screenCellSize
    while (y >= 0) {
      ctx.beginPath()
      ctx.moveTo(screenSource.x(), y)
      ctx.lineTo(screenDest.x(), y)
      ctx.stroke()
      y -= screenCellSize
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    this.screenHeight = ctx.canvas.height
    this.screenWidth = ctx.canvas.width

    if (this.mouseDown) {
      ctx.canvas.style.cursor = 'grabbing'
    } else {
      ctx.canvas.style.cursor = 'initial'
    }

    const canResize = this.objects.some((o) => {
      o.canResize(this.screenToCanvas(this.currentMousePos))
    })

    if (canResize) {
      ctx.canvas.style.cursor = 'ew-resize'
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.renderGrid(this.grid, ctx)

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const object = this.objects[i]
      if (object instanceof Circle) {
        this.renderCircle(object, ctx)
      }  else if (object instanceof Rectangle) {
        this.renderRectangle(object, ctx)
      }
    }
  }
}

export default RenderingEngine
