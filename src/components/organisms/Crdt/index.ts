import { PartialSVGCircle, PartialSVGRectangle, SVGCircle, SVGDoc, SVGDocTree, SVGRectangle } from "@inktor/inktor-crdt-rs";
import { getClientId, getCrdtData, saveCrdtData } from '@/utils/storage';
import Circle from "@/components/atoms/Circle";
import { EngineContext } from "../RenderingEngine/type";
import PeerGroupClient from "@/webrtc";
import Rectangle from "@/components/atoms/Rectangle";

// What does the CRDT client do?
//   When application first loads
//     - Get replica id
//     - Load previous state to CRDT.
//     - Re render current canvas.
//   When the application changes CRDT:
//     - Make changes to svg doc
//     - save svg doc changes to local storage.
//     - re render state in editor
//     - broadcast changes to other clients.
//   When a remote change message is received:
//     - Apply change to CRDT.
//     - Save new state to local storage.
//     - Re render the current canvas.

class CrdtClient {

    svgDoc: SVGDoc
    peerGroupClient: PeerGroupClient
    changeListener: () => void
    remoteChangeListener: () => void
    render: () => void
    groupId: string
    constructor() {
        this.svgDoc = SVGDoc.new(getClientId())
        this.changeListener = () => {
            this.onChange()
        }
        this.remoteChangeListener = () => {
            this.onChange(true)
        }
        this.render = () => {}
        const crdtData = getCrdtData()
        if (crdtData) this.svgDoc.load(crdtData)

        this.groupId = location.pathname.substring(1)
        this.peerGroupClient = new PeerGroupClient(this.groupId)
        this.peerGroupClient.setOnNewMembersSendMessage(() => {
            const data = this.svgDoc.save()
            if (!data) return ""
            return data
        })
        this.peerGroupClient.setOnMessageReceived((message: string) => {
            this.svgDoc.merge(message)
            this.remoteChangeListener()
        });
    }

    onChange(noBroadcast?: boolean) {
        const crdtData = this.svgDoc.save()
        if (crdtData) {
            saveCrdtData(crdtData)
        }
        if (!noBroadcast) {
            const message = this.svgDoc.broadcast()
            this.peerGroupClient.sendMessageToGroup(message)
        }
    }

    setRender(render: () => void) {
        this.render = render
        this.changeListener = () => {
            this.onChange()
            this.render()
        }
        this.remoteChangeListener = () => {
            this.onChange(true)
            this.render()
        }
    }

//   get_group(group_id: string): SVGGroup | undefined;
//   add_group(group_id: string | undefined, partial_group: PartialSVGGroup): void;
    getCircle(circle_id: string): SVGCircle | undefined {
        return this.svgDoc.get_circle(circle_id)
    }

    addCircle(group_id: string | undefined, partial_circle: PartialSVGCircle): void {
        this.svgDoc.add_circle(group_id, partial_circle)
        this.changeListener()
    }

    editCircle(circle_id: string, edits: PartialSVGCircle): void {
        this.svgDoc.edit_circle(circle_id, edits)
        this.changeListener()
    }

    getRectangle(rectangle_id: string): SVGRectangle | undefined {
        return this.svgDoc.get_rectangle(rectangle_id)
    }

    addRectangle(group_id: string | undefined, partial_rectangle: PartialSVGRectangle): void {
        this.svgDoc.add_rectangle(group_id, partial_rectangle)
        this.changeListener()
    }

    editRectangle(rectangle_id: string, edits: PartialSVGRectangle): void {
        this.svgDoc.edit_rectangle(rectangle_id, edits)
        this.changeListener()
    }

//   get_path(path_id: string): SVGPath | undefined;
//   add_path(group_id: string | undefined, partial_path: PartialSVGPath): void;
//   edit_path(path_id: string, partial_path: PartialSVGPath): void;
//   edit_group(group_id: string, partial_group: PartialSVGGroup): void;
//   edit_path_point_type(path_id: string, point_id: string, command_type: SVGPathCommandType): void;
//   edit_path_point_pos(path_id: string, point_id: string, new_pos: Vec2): void;
//   edit_path_point_handle1(path_id: string, point_id: string, new_handle1: Vec2): void;
//   edit_path_point_handle2(path_id: string, point_id: string, new_handle2: Vec2): void;
//   add_point_to_path(path_id: string, command: SVGPathCommandType, pos: Vec2): void;
//   move_object_to_group(object_id: string, group_id: string, index: number): void;
//   move_object_to_root(object_id: string, index: number): void;
//   remove_object(object_id: string): void;
//   remove_path_point(path_id: string, point_id: string): void;
//   save(): string | undefined;
//   load(data: string): void;
//   broadcast(): string;
//   merge(oplog: string): void;
    children(): SVGDocTree {
        return this.svgDoc.children()
    }
}

export const convertUtility = (
    tree: SVGDocTree, 
    crdtClient: CrdtClient,
    engineContext: EngineContext
) => {
    const circles = tree.children
        .flatMap((it): (Circle | Rectangle)[] => {
            if (it.type === "CIRCLE")
            return [new Circle(it.id, it.pos.x, it.pos.y, it.radius, engineContext, crdtClient)]
            if (it.type === "RECTANGLE")
            return [new Rectangle(it.id, it.pos.x, it.pos.y, it.height, it.width, engineContext, crdtClient)]
            return []
        });
    return circles
}

export default CrdtClient