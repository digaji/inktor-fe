import CrdtClient, { SVGColor } from "@/components/organisms/Crdt"
import { EngineContext } from "@/components/organisms/RenderingEngine/type"
import { Vec2 } from "@/utils/Vec2"

class Rectangle {
    readonly id: string
    readonly pos: Vec2
    readonly height: number
    readonly width: number
    readonly stroke_width: number
    readonly opacity: number
    readonly fill: SVGColor
    readonly stroke: SVGColor
    engineContext: EngineContext
    crdtClient: CrdtClient

    constructor(
        id: string,
        x: number,
        y: number,
        height: number,
        width: number,
        stroke_width: number,
        opacity: number,
        fill: SVGColor,
        stroke: SVGColor,
        engineContext: EngineContext,
        crdtClient: CrdtClient
    ) {
        this.id = id
        this.pos = Vec2.new(x, y)
        this.height = height
        this.width = width
        this.stroke_width = stroke_width
        this.opacity = opacity
        this.fill = fill
        this.stroke = stroke
        this.engineContext = engineContext
        this.crdtClient = crdtClient
    }

    canDrag(mousePos: Vec2) {
        const xWithin = this.pos.x() <= mousePos.x() && mousePos.x() <= this.pos.x() + this.width
        const yWithin = this.pos.y() <= mousePos.y() && mousePos.y() <= this.pos.y() + this.height
        return xWithin && yWithin
    }

    canResize(mousePos: Vec2) {
        const resizeHandlePos = this.pos.add(Vec2.new(
            this.width, 
            this.height
        ))
        const closeEnough = mousePos.dist(resizeHandlePos) <= this.engineContext.getResizeHandleScreenRadius()
        const isModeResize = this.engineContext.getState() === "RESIZE"
        return closeEnough && isModeResize
    }

    onMouseDown(mousePos: Vec2) {
        if (
            this.canResize(mousePos)
            && this.engineContext.requestResizing(this.id)
        ) {
            return
        }

        if (this.canDrag(mousePos)
            && this.engineContext.requestDragging(this.id, this.pos)
        ) {
            return
        }
    }

    onMouseMove(mousePos: Vec2) {
        if (this.engineContext.isResizing(this.id)) {
            const diff = mousePos.sub(this.pos)
            const newHeight = diff.y()
            const newWidth = diff.x()
            this.crdtClient.editRectangle(this.id, { height: newHeight, width: newWidth })
            return true
        }

        if (this.engineContext.isDragging(this.id)) {
            const prevMousePos = this.engineContext.getDraggingLastMousePos()
            const prevPos = this.engineContext.getDraggingLastObjectPos()
            const pos = mousePos.sub(prevMousePos).add(prevPos)
            const x = Math.floor(pos.x())
            const y = Math.floor(pos.y())
            this.crdtClient.editRectangle(this.id, { pos: { x, y }})
            return true
        }
        return false
    }

    onMouseUp() {

    }

    // canDrag(mousePos: Vec2) {
        
    // }
}

export default Rectangle