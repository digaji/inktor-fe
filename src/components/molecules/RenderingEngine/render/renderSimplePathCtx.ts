import { Color } from '@inktor/inktor-crdt-rs'

import { PathCommand } from '@/components/molecules/Crdt'
import { Vec2 } from '@/utils/Vec2'

import { configFill, configStroke } from './renderUtils'

export const adjustPathCommandHandles = (points: PathCommand[]): [PathCommand[], boolean] => {
  const res: PathCommand[] = []
  let prevPos: Vec2 | null = null
  let isClosed = false
  for (const point of points) {
    if (point.type === 'START') {
      res.push({ ...point })
      prevPos = Vec2.new(point.pos.x, point.pos.y)
    } else if (point.type === 'LINE') {
      res.push({ ...point })
      prevPos = Vec2.new(point.pos.x, point.pos.y)
    } else if (point.type === 'BEZIER' && prevPos !== null) {
      const pos = Vec2.new(point.pos.x, point.pos.y)
      const handle1 = Vec2.new(point.handle1.x, point.handle1.y).add(prevPos)
      const handle2 = Vec2.new(point.handle2.x, point.handle2.y).add(pos)

      res.push({
        id: point.id,
        type: 'BEZIER',
        pos: { x: pos.x(), y: pos.y() },
        handle1: { x: handle1.x(), y: handle1.y() },
        handle2: { x: handle2.x(), y: handle2.y() },
      })
      prevPos = pos
    } else if (point.type === 'BEZIER_QUAD' && prevPos !== null) {
      const pos = Vec2.new(point.pos.x, point.pos.y)
      const handle = Vec2.new(point.handle.x, point.handle.y).add(prevPos)

      res.push({
        id: point.id,
        type: 'BEZIER_QUAD',
        pos: { x: pos.x(), y: pos.y() },
        handle: { x: handle.x(), y: handle.y() },
      })
      prevPos = pos
    } else if (point.type === 'CLOSE') {
      isClosed = true
      break
    }
  }
  return [res, isClosed]
}

export const convertPathPointsToScreen = (points: PathCommand[], canvasToScreen: (p: Vec2) => Vec2): PathCommand[] => {
  const res: PathCommand[] = []
  for (const point of points) {
    if (point.type === 'START') {
      const pos = Vec2.new(point.pos.x, point.pos.y)
      const screenPos = canvasToScreen(pos)
      res.push({ id: point.id, type: point.type, pos: { x: screenPos.x(), y: screenPos.y() } })
    } else if (point.type === 'LINE') {
      const pos = Vec2.new(point.pos.x, point.pos.y)
      const screenPos = canvasToScreen(pos)
      res.push({ id: point.id, type: point.type, pos: { x: screenPos.x(), y: screenPos.y() } })
    } else if (point.type === 'BEZIER') {
      const pos = Vec2.new(point.pos.x, point.pos.y)
      const handle1 = Vec2.new(point.handle1.x, point.handle1.y)
      const handle2 = Vec2.new(point.handle2.x, point.handle2.y)

      const screenPos = canvasToScreen(pos)
      const screenHandle1 = canvasToScreen(handle1)
      const screenHandle2 = canvasToScreen(handle2)

      res.push({
        id: point.id,
        type: 'BEZIER',
        pos: { x: screenPos.x(), y: screenPos.y() },
        handle1: { x: screenHandle1.x(), y: screenHandle1.y() },
        handle2: { x: screenHandle2.x(), y: screenHandle2.y() },
      })
    } else if (point.type === 'BEZIER_QUAD') {
      const pos = Vec2.new(point.pos.x, point.pos.y)
      const handle = Vec2.new(point.handle.x, point.handle.y)
      const screenPos = canvasToScreen(pos)
      const screenHandle = canvasToScreen(handle)
      res.push({
        id: point.id,
        type: point.type,
        pos: { x: screenPos.x(), y: screenPos.y() },
        handle: { x: screenHandle.x(), y: screenHandle.y() },
      })
    }
  }
  return res
}

export const derivePathHandles = (
  points: PathCommand[],
  paramCanvasToScreen?: (p: Vec2) => Vec2
): [{ p1: Vec2; p2: Vec2 }[], Vec2[]] => {
  const lines: { p1: Vec2; p2: Vec2 }[] = []
  const handles: Vec2[] = []
  let prevPos: Vec2 | null = null
  const canvasToScreen = paramCanvasToScreen ?? ((p: Vec2) => p)
  for (const point of points) {
    if (point.type === 'CLOSE') break
    const pos = Vec2.new(point.pos.x, point.pos.y)
    handles.push(canvasToScreen(pos))
    if (point.type === 'BEZIER') {
      if (prevPos !== null) {
        lines.push({
          p1: canvasToScreen(prevPos.copy()),
          p2: canvasToScreen(Vec2.new(point.handle1.x, point.handle1.y)),
        })
        handles.push(canvasToScreen(Vec2.new(point.handle1.x, point.handle1.y)))
      }
      lines.push({ p1: canvasToScreen(pos.copy()), p2: canvasToScreen(Vec2.new(point.handle2.x, point.handle2.y)) })
      handles.push(canvasToScreen(Vec2.new(point.handle2.x, point.handle2.y)))
    } else if (point.type === 'BEZIER_QUAD') {
      if (prevPos === null) continue
      lines.push({ p1: canvasToScreen(prevPos.copy()), p2: canvasToScreen(Vec2.new(point.handle.x, point.handle.y)) })
      lines.push({ p1: canvasToScreen(pos.copy()), p2: canvasToScreen(Vec2.new(point.handle.x, point.handle.y)) })

      handles.push(canvasToScreen(Vec2.new(point.handle.x, point.handle.y)))
    }
    prevPos = pos.copy()
  }
  return [lines, handles]
}

const drawPath = (
  ctx: CanvasRenderingContext2D,
  data: { points: PathCommand[]; closed: boolean; drawStroke: boolean }
) => {
  ctx.beginPath()

  for (const point of data.points) {
    if (point.type === 'START') {
      ctx.moveTo(point.pos.x, point.pos.y)
    } else if (point.type === 'LINE') {
      ctx.lineTo(point.pos.x, point.pos.y)
    } else if (point.type === 'BEZIER') {
      ctx.bezierCurveTo(point.handle1.x, point.handle1.y, point.handle2.x, point.handle2.y, point.pos.x, point.pos.y)
    } else if (point.type === 'BEZIER_QUAD') {
      ctx.bezierCurveTo(point.handle.x, point.handle.y, point.handle.x, point.handle.y, point.pos.x, point.pos.y)
    }
  }

  if (data.closed) {
    ctx.fill()
  }

  if (data.drawStroke) {
    ctx.stroke()
  }
}

const renderSimplePathCtx =
  (ctx: CanvasRenderingContext2D) =>
  (data: {
    opacity: number
    fill: Color
    stroke?: {
      color: Color | string
      width: number
    }
    points: PathCommand[]
    closed: boolean
  }) => {
    const drawStroke = (data.stroke && data.stroke.width > 0) ?? false
    configStroke(ctx, data)
    configFill(ctx, data)
    drawPath(ctx, { ...data, drawStroke })
  }

export default renderSimplePathCtx
