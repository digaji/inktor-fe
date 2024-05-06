import { Color } from '@inktor/inktor-crdt-rs'

import { configFill, configShadow, configStroke } from './renderUtils'

const drawCircle = (ctx: CanvasRenderingContext2D, data: { x: number; y: number; r: number; drawStroke: boolean }) => {
  // Draw Circle
  ctx.beginPath()
  ctx.arc(data.x, data.y, data.r, 0, 2 * Math.PI)
  ctx.fill()

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  if (data.drawStroke) {
    ctx.stroke()
  }
}

const renderSimpleCircleCtx =
  (ctx: CanvasRenderingContext2D) =>
  (data: {
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
    const drawStroke = (data.stroke && data.stroke.width > 0) ?? false

    configShadow(ctx, data)
    configStroke(ctx, data)
    configFill(ctx, data)
    drawCircle(ctx, { ...data, drawStroke })
  }

export default renderSimpleCircleCtx
