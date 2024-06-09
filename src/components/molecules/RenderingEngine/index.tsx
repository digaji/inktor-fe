import Circle from '@/components/atoms/Circle'
import Grid from '@/components/atoms/Grid'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import { MouseContext, MouseScroll, MouseWheel } from '@/components/molecules/Canvas/types'
import CrdtClient, { convertUtility } from '@/components/molecules/Crdt'
import { Vec2 } from '@/utils/Vec2'

import renderSimpleCircleCtx from './render/renderSimpleCircle'
import renderSimplePathCtx, {
  adjustPathCommandHandles,
  convertPathPointsToScreen,
  derivePathHandles,
} from './render/renderSimplePathCtx'
import renderSimpleRectangleCtx from './render/renderSimpleRectangle'
import { EngineContext, EngineState } from './type'

class RenderingEngine {
  objects: (Circle | Rectangle | Path)[]
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
    lastMouseCanvasPos: Vec2
    lastObjectCanvasPos: Vec2
  }
  renderPropbarCallback: () => void
  selected: Circle | Rectangle | Path | undefined

  logic: string
  crdtClient: CrdtClient

  static resizeHandleScreenSize: number = 6

  constructor(logic: string) {
    this.screenWidth = 0
    this.screenHeight = 0
    this.screenScale = 1
    this.currentDraggingId = null
    this.currentResizingId = null
    this.state = 'NORMAL'
    this.currentDraggingData = {
      lastMouseCanvasPos: Vec2.zero(),
      lastObjectCanvasPos: Vec2.zero(),
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
          lastObjectCanvasPos: objectCanvasPos,
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

    this.renderPropbarCallback = () => {}

    this.logic = logic
    this.crdtClient = new CrdtClient(this.logic)
    this.crdtClient.setRender(
      () => {
        const tree = this.crdtClient.children()
        this.objects = convertUtility(tree, this.crdtClient, this.context)
      },
      () => {
        this.renderPropbar()
      }
    )

    const tree = this.crdtClient.children()
    this.objects = convertUtility(tree, this.crdtClient, this.context)
    this.selected = undefined
  }

  setAddCircle() {
    this.crdtClient.addCircle(undefined, { pos: { x: 0, y: 0 }, radius: 25 })
  }

  setAddRectangle() {
    this.crdtClient.addRectangle(undefined, { pos: { x: 0, y: 0 }, height: 100, width: 150 })
  }

  iterateObjectsReverse(cb: (object: Circle | Rectangle | Path) => boolean | void): boolean {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const object = this.objects[i]
      const res = cb(object)
      if (res) {
        return true
      }
    }
    return false
  }

  setAddPath() {
    this.crdtClient.addPath(undefined, {
      points: [
        { type: 'START', pos: { x: 0, y: 0 } },
        { type: 'BEZIER', pos: { x: 50, y: 0 }, handle1: { x: 0, y: -50 }, handle2: { x: 0, y: -50 } },
        {
          type: 'BEZIER_QUAD',
          pos: { x: 0, y: 50 },
          handle: { x: 0, y: 50 },
        },
      ],
    })
  }

  screenToCanvas(pos: Vec2) {
    return pos.sub(this.viewOffset).scale(1 / this.screenScale)
  }

  canvasToScreen(canvasPos: Vec2) {
    return canvasPos.scale(this.screenScale).add(this.viewOffset)
  }

  renderPropbar() {
    this.renderPropbarCallback()
  }

  setRenderPropbar(renderPropbar: () => void) {
    this.renderPropbarCallback = renderPropbar
  }

  onMouseDown(ctx: MouseContext) {
    this.mouseDown = true
    this.lastMousePos = ctx.pos.copy()
    this.lastViewOffset = this.viewOffset.copy()

    const mousePos = this.screenToCanvas(ctx.pos)

    this.selected = undefined

    this.iterateObjectsReverse((object) => {
      if (!(object.canDrag(mousePos) || object.canResize(mousePos))) return

      object.onMouseDown(mousePos)
      this.selected = object
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

    const returnEarly = this.iterateObjectsReverse((object) => {
      const moving = object.onMouseMove(mousePos)
      if (moving) return true
    })
    if (returnEarly) return

    if (this.mouseDown) {
      const mouseDiff = ctx.pos.sub(this.lastMousePos)
      this.viewOffset = this.lastViewOffset.add(mouseDiff)
    }
  }

  onMouseUp() {
    this.mouseDown = false
    this.currentDraggingId = null
    this.currentResizingId = null

    this.iterateObjectsReverse((object) => {
      object.onMouseUp()
    })
  }

  setNormalMode() {
    this.state = 'NORMAL'
  }

  setResizeMode() {
    this.state = 'RESIZE'
  }

  renderSimple(ctx: CanvasRenderingContext2D) {
    const renderCircle = renderSimpleCircleCtx(ctx)

    const renderRectangle = renderSimpleRectangleCtx(ctx)

    const renderPath = renderSimplePathCtx(ctx)

    const renderHandle = ({ x, y }: { x: number; y: number }) => {
      renderCircle({
        x: x,
        y: y,
        r: RenderingEngine.resizeHandleScreenSize,
        fill: [255, 255, 255, 1],
        shadow: {
          color: 'black',
          blur: 5,
        },
        stroke: {
          color: '#0c8ce9',
          width: 1.5,
        },
        opacity: 1,
      })
    }

    const renderLine = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => {
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    return {
      circle: renderCircle,
      rectangle: renderRectangle,
      path: renderPath,
      handle: renderHandle,
      line: renderLine,
    }
  }

  renderPath(path: Path, ctx: CanvasRenderingContext2D) {
    const renderSimple = this.renderSimple(ctx)
    const opacity = path.opacity
    const fill = path.fill
    const [adjustedPoints, closed] = adjustPathCommandHandles(path.points)
    const points = convertPathPointsToScreen(adjustedPoints, (p) => this.canvasToScreen(p))
    const [lines, handles] = derivePathHandles(adjustedPoints, (p) => this.canvasToScreen(p))
    const stroke = {
      color: path.stroke,
      width: path.stroke_width * this.screenScale,
    }

    renderSimple.path({
      opacity,
      fill,
      stroke,
      points,
      closed,
    })

    if (this.state !== 'RESIZE') return

    // Rendering handles
    ctx.strokeStyle = '#0c8ce9'
    ctx.lineWidth = 1.5
    for (const line of lines) {
      renderSimple.line({ x1: line.p1.x(), y1: line.p1.y(), x2: line.p2.x(), y2: line.p2.y() })
    }

    for (const handle of handles) {
      renderSimple.handle({ x: handle.x(), y: handle.y() })
    }
  }

  renderRectangle(rectangle: Rectangle, ctx: CanvasRenderingContext2D) {
    const renderSimple = this.renderSimple(ctx)
    const screenPos = this.canvasToScreen(rectangle.pos)
    const pX = screenPos.x()
    const pY = screenPos.y()
    const height = rectangle.height * this.screenScale
    const width = rectangle.width * this.screenScale
    const stroke = {
      color: rectangle.stroke,
      width: rectangle.stroke_width * this.screenScale,
    }
    const opacity = rectangle.opacity
    const fill = rectangle.fill

    renderSimple.rectangle({ x: pX, y: pY, height, width, stroke, opacity, fill })

    if (this.state === 'RESIZE') {
      renderSimple.handle({
        x: pX + width,
        y: pY + height,
      })
    }
  }

  renderCircle(circle: Circle, ctx: CanvasRenderingContext2D) {
    const renderSimple = this.renderSimple(ctx)
    const screenCirclePos = this.canvasToScreen(circle.pos)
    const x = screenCirclePos.x()
    const y = screenCirclePos.y()
    const r = circle.radius * this.screenScale
    const stroke = {
      color: circle.stroke,
      width: circle.stroke_width * this.screenScale,
    }
    const opacity = circle.opacity
    const fill = circle.fill

    renderSimple.circle({ x, y, r, stroke, opacity, fill })

    if (this.state === 'RESIZE') {
      renderSimple.handle({ x: x + r, y })
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

    const canDrag = this.objects.some((o) => o.canDrag(this.screenToCanvas(this.currentMousePos)))
    ctx.canvas.style.cursor = 'initial'

    if (canDrag) {
      ctx.canvas.style.cursor = 'grab'
    }

    if (this.mouseDown) {
      ctx.canvas.style.cursor = 'grabbing'
    }

    const canResize = this.objects.some((o) => o.canResize(this.screenToCanvas(this.currentMousePos)))
    if (canResize) {
      ctx.canvas.style.cursor = 'ew-resize'
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.renderGrid(this.grid, ctx)

    this.iterateObjectsReverse((object) => {
      if (object instanceof Circle) {
        this.renderCircle(object, ctx)
      } else if (object instanceof Rectangle) {
        this.renderRectangle(object, ctx)
      } else if (object instanceof Path) {
        this.renderPath(object, ctx)
      }
    })
  }
}

export default RenderingEngine
