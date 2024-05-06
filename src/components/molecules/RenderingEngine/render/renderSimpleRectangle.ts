import { Color } from '@inktor/inktor-crdt-rs'

import { configFill, configStroke } from './renderUtils'

const drawRect = (
  ctx: CanvasRenderingContext2D,
  data: { x: number; y: number; width: number; height: number; drawStroke: boolean }
) => {
  ctx.beginPath()
  ctx.rect(data.x, data.y, data.width, data.height)
  ctx.fill()

  if (data.drawStroke) {
    ctx.stroke()
  }
}

const renderSimpleRectangleCtx =
  (ctx: CanvasRenderingContext2D) =>
  (data: {
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
    const drawStroke = (data.stroke && data.stroke.width > 0) ?? false
    configStroke(ctx, data)
    configFill(ctx, data)
    drawRect(ctx, { ...data, drawStroke })
  }

export default renderSimpleRectangleCtx
