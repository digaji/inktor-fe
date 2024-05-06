import { Color } from '@inktor/inktor-crdt-rs'

import rgbaToHex from '@/utils/rgbaToHex'

export const configShadow = (
  ctx: CanvasRenderingContext2D,
  data: { shadow?: { color: Color | string; blur: number } }
) => {
  const shadow = data.shadow
  if (shadow) {
    if (typeof shadow.color === 'string') {
      ctx.shadowColor = shadow.color
    } else {
      ctx.shadowColor = rgbaToHex(shadow.color)
    }
    ctx.shadowBlur = shadow.blur
  }
}

export const configStroke = (
  ctx: CanvasRenderingContext2D,
  data: {
    opacity: number
    stroke?: {
      color: Color | string
      width: number
    }
  }
) => {
  const stroke = data.stroke
  const opacity = data.opacity
  if (stroke) {
    if (typeof stroke.color === 'string') {
      ctx.strokeStyle = stroke.color
    } else {
      const strokeColor: Color = [...stroke.color]
      strokeColor[3] *= opacity
      ctx.strokeStyle = rgbaToHex(strokeColor)
    }
    ctx.lineWidth = stroke.width
  } else {
    ctx.strokeStyle = 'transparent'
    ctx.lineWidth = 0
  }
}

export const configFill = (ctx: CanvasRenderingContext2D, data: { fill: Color; opacity: number }) => {
  const fill: Color = [...data.fill]
  fill[3] *= data.opacity
  ctx.fillStyle = rgbaToHex(fill)
}
