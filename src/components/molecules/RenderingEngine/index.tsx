import { Color } from '@inktor/inktor-crdt-rs'

import Circle from '@/components/atoms/Circle'
import Grid from '@/components/atoms/Grid'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import { MouseContext, MouseScroll, MouseWheel } from '@/components/molecules/Canvas/types'
import CrdtClient, { convertUtility, PathCommand } from '@/components/molecules/Crdt'
import rgbaToHex from '@/utils/rgbaToHex'
import { Vec2 } from '@/utils/Vec2'

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

    this.objects.forEach((object) => {
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
    this.state = 'NORMAL'
  }

  setResizeMode() {
    this.state = 'RESIZE'
  }

  renderSimple(ctx: CanvasRenderingContext2D) {
    const renderCircle = (data: {
      x: number
      y: number
      r: number
      stroke?: {
        color: Color | string
        width: number
      }
      opacity: number
      fill: Color
      shadow?: {
        color: Color | string
        blur: number
      }
    }) => {
      const shadow = data.shadow
      const stroke = data.stroke

      if (shadow) {
        if (typeof shadow.color === 'string') {
          ctx.shadowColor = shadow.color
        } else {
          ctx.shadowColor = rgbaToHex(shadow.color)
        }
        ctx.shadowBlur = shadow.blur
      }

      if (stroke) {
        if (typeof stroke.color === 'string') {
          ctx.strokeStyle = stroke.color
        } else {
          const strokeColor: Color = [...stroke.color]
          strokeColor[3] *= data.opacity
          ctx.strokeStyle = rgbaToHex(strokeColor)
        }
        ctx.lineWidth = stroke.width
      }

      const fill: Color = [...data.fill]
      fill[3] *= data.opacity

      ctx.fillStyle = rgbaToHex(fill)

      ctx.beginPath()
      ctx.arc(data.x, data.y, data.r, 0, 2 * Math.PI)
      ctx.fill()

      if (shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }

      if (stroke && stroke.width > 0) {
        ctx.stroke()
      }
    }

    const renderRectangle = (data: {
      x: number
      y: number
      width: number
      height: number
      stroke?: {
        color: Color | string
        width: number
      }
      opacity: number
      fill: Color
      shadow?: {
        color: Color | string
        blur: number
      }
    }) => {
      const stroke = data.stroke

      if (stroke) {
        if (typeof stroke.color === 'string') {
          ctx.strokeStyle = stroke.color
        } else {
          const strokeColor: Color = [...stroke.color]
          strokeColor[3] *= data.opacity
          ctx.strokeStyle = rgbaToHex(strokeColor)
        }
        ctx.lineWidth = stroke.width
      }

      const fill: Color = [...data.fill]
      fill[3] *= data.opacity

      ctx.fillStyle = rgbaToHex(fill)

      ctx.beginPath()
      ctx.rect(data.x, data.y, data.width, data.height)
      ctx.fill()

      if (stroke && stroke.width > 0) {
        ctx.stroke()
      }
    }

    const renderPath = (data: {
      opacity: number
      fill: Color
      stroke?: {
        color: Color | string
        width: number
      }
      points: PathCommand[]
    }) => {
      const stroke = data.stroke

      if (stroke) {
        if (typeof stroke.color === 'string') {
          ctx.strokeStyle = stroke.color
        } else {
          ctx.strokeStyle = rgbaToHex(stroke.color)
        }
        ctx.lineWidth = stroke.width
      }

      const fill = data.fill
      fill[fill.length - 1] = data.opacity

      ctx.fillStyle = rgbaToHex(fill)

      ctx.beginPath()

      let isClosed = false
      let prevPos: Vec2 | null = null

      for (const point of data.points) {
        if (point.type === 'START') {
          const pos = Vec2.new(point.pos.x, point.pos.y)
          const screenPos = this.canvasToScreen(pos)

          ctx.moveTo(screenPos.x(), screenPos.y())
          prevPos = pos
        } else if (point.type === 'LINE') {
          const pos = Vec2.new(point.pos.x, point.pos.y)
          const screenPos = this.canvasToScreen(pos)

          ctx.lineTo(screenPos.x(), screenPos.y())
          prevPos = pos
        } else if (point.type === 'BEZIER') {
          if (prevPos === null) continue
          const pos = Vec2.new(point.pos.x, point.pos.y)
          const screenPos = this.canvasToScreen(pos)
          const handle1 = Vec2.new(point.handle1.x, point.handle1.y).add(prevPos)
          const screenHandle1 = this.canvasToScreen(handle1)
          const handle2 = Vec2.new(point.handle2.x, point.handle2.y).add(pos)
          const screenHandle2 = this.canvasToScreen(handle2)

          ctx.bezierCurveTo(
            screenHandle1.x(),
            screenHandle1.y(),
            screenHandle2.x(),
            screenHandle2.y(),
            screenPos.x(),
            screenPos.y()
          )

          prevPos = pos
        } else if (point.type === 'BEZIER_QUAD') {
          if (prevPos === null) continue

          const pos = Vec2.new(point.pos.x, point.pos.y)
          const screenPos = this.canvasToScreen(pos)
          const handle = Vec2.new(point.handle.x, point.handle.y).add(prevPos)
          const screenHandle = this.canvasToScreen(handle)

          ctx.bezierCurveTo(
            screenHandle.x(),
            screenHandle.y(),
            screenHandle.x(),
            screenHandle.y(),
            screenPos.x(),
            screenPos.y()
          )

          prevPos = pos
        } else if (point.type === 'CLOSE') {
          isClosed = true
          break
        }
      }

      if (isClosed) {
        ctx.fill()
      } else {
        ctx.stroke()
      }
    }

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
    const points = path.points
    const stroke = {
      color: path.stroke,
      width: path.stroke_width,
    }

    renderSimple.path({ opacity, fill, stroke, points })
    if (this.state !== 'RESIZE') return

    // Rendering handles
    let prevPos: Vec2 | null = null
    ctx.strokeStyle = '#0c8ce9'
    ctx.lineWidth = 1.5

    for (const point of points) {
      if (point.type === 'CLOSE') continue

      const pos = Vec2.new(point.pos.x, point.pos.y)
      const screenPos = this.canvasToScreen(pos)

      if (point.type === 'BEZIER') {
        if (prevPos !== null) {
          const handle1 = Vec2.new(point.handle1.x, point.handle1.y).add(prevPos)
          const handle1ScreenPos = this.canvasToScreen(handle1)
          const prevScreenPos = this.canvasToScreen(prevPos)

          renderSimple.line({
            x1: prevScreenPos.x(),
            y1: prevScreenPos.y(),
            x2: handle1ScreenPos.x(),
            y2: handle1ScreenPos.y(),
          })
        }

        const handle2 = Vec2.new(point.handle2.x, point.handle2.y).add(pos)
        const handle2ScreenPos = this.canvasToScreen(handle2)

        renderSimple.line({
          x1: screenPos.x(),
          y1: screenPos.y(),
          x2: handle2ScreenPos.x(),
          y2: handle2ScreenPos.y(),
        })
      }

      if (point.type === 'BEZIER_QUAD') {
        if (prevPos === null) continue

        const prevScreenPos = this.canvasToScreen(prevPos)
        const handle = Vec2.new(point.handle.x, point.handle.y).add(prevPos)
        const handleScreenPos = this.canvasToScreen(handle)

        renderSimple.line({
          x1: prevScreenPos.x(),
          y1: prevScreenPos.y(),
          x2: handleScreenPos.x(),
          y2: handleScreenPos.y(),
        })

        renderSimple.line({
          x1: screenPos.x(),
          y1: screenPos.y(),
          x2: handleScreenPos.x(),
          y2: handleScreenPos.y(),
        })
      }
      prevPos = pos
    }

    prevPos = null

    for (const point of points) {
      if (point.type === 'CLOSE') continue

      const pos = Vec2.new(point.pos.x, point.pos.y)
      const screenPos = this.canvasToScreen(pos)

      renderSimple.handle({ x: screenPos.x(), y: screenPos.y() })

      if (point.type === 'BEZIER') {
        if (prevPos !== null) {
          const handle1 = Vec2.new(point.handle1.x, point.handle1.y).add(prevPos)
          const handle1ScreenPos = this.canvasToScreen(handle1)
          renderSimple.handle({ x: handle1ScreenPos.x(), y: handle1ScreenPos.y() })
        }

        const handle2 = Vec2.new(point.handle2.x, point.handle2.y).add(pos)
        const handle2ScreenPos = this.canvasToScreen(handle2)

        renderSimple.handle({ x: handle2ScreenPos.x(), y: handle2ScreenPos.y() })
      }

      if (point.type === 'BEZIER_QUAD') {
        if (prevPos === null) continue

        const handle = Vec2.new(point.handle.x, point.handle.y).add(prevPos)
        const handleScreenPos = this.canvasToScreen(handle)

        renderSimple.handle({ x: handleScreenPos.x(), y: handleScreenPos.y() })
      }
      prevPos = pos
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
      width: rectangle.stroke_width,
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
    const pX = screenCirclePos.x()
    const pY = screenCirclePos.y()
    const r = circle.radius * this.screenScale
    const stroke = {
      color: circle.stroke,
      width: circle.stroke_width,
    }
    const opacity = circle.opacity
    const fill = circle.fill

    renderSimple.circle({ x: pX, y: pY, r, stroke: stroke, opacity: opacity, fill: fill })

    if (this.state === 'RESIZE') {
      renderSimple.handle({ x: pX + r, y: pY })
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

    const canResize = this.objects.some((o) => {
      o.canResize(this.screenToCanvas(this.currentMousePos))
    })

    if (canResize) {
      ctx.canvas.style.cursor = 'ew-resize'
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.renderGrid(this.grid, ctx)

    for (let i = 0; i < this.objects.length; i++) {
      const object = this.objects[i]

      if (object instanceof Circle) {
        this.renderCircle(object, ctx)
      } else if (object instanceof Rectangle) {
        this.renderRectangle(object, ctx)
      } else if (object instanceof Path) {
        this.renderPath(object, ctx)
      }
    }
  }
}

export default RenderingEngine
