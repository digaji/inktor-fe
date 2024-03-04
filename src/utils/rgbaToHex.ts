import { Color } from '@inktor/inktor-crdt-rs'

const rgbaToHex = (rgba: Color) => {
  // Split the RGBA string into components and convert them to numbers
  const [r, g, b, a] = rgba

  // Helper function to convert a single value
  const toHex = (value: number): string => {
    const hex = Math.min(255, Math.max(value, 0)).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  // Convert the alpha value from 0 - 1 to 0 - 255 and round it
  const alpha = Math.round(a * 255)

  // Convert each channel to hex and concatenate
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`
}

export default rgbaToHex
