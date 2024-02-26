import { Vec2 } from "@/utils/Vec2"

export type EngineState = "RESIZE" | "NORMAL"

export interface EngineContext {
  getState: () => EngineState
  getResizeHandleScreenRadius: () => number
  requestDragging: (objectId: string, objectPos: Vec2) => boolean
  requestResizing: (objectId: string) => boolean
  getDraggingLastMousePos: () => Vec2
  getDraggingLastObjectPos: () => Vec2
  isDragging: (objectId: string) => boolean
  isResizing: (objectId: string) => boolean
}
