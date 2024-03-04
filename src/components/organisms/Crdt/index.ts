import { PartialSVGCircle, SVGCircle, SVGDoc, SVGDocTree } from '@inktor/inktor-crdt-rs'

import Circle from '@/components/atoms/Circle'
import { EngineContext } from '@/components/organisms/RenderingEngine/type'
import { getClientId, getCrdtData, saveCrdtData } from '@/utils/storage'
import PeerGroupClient from '@/webrtc'

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
      if (!data) return ''
      return data
    })
    this.peerGroupClient.setOnMessageReceived((message: string) => {
      this.svgDoc.merge(message)
      this.remoteChangeListener()
    })
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

  setRender(render: () => void, renderToolbar?: () => void) {
    this.render = render
    this.changeListener = () => {
      this.onChange()
      this.render()

      if (renderToolbar) {
        renderToolbar()
      }
    }
    this.remoteChangeListener = () => {
      this.onChange(true)
      this.render()

      if (renderToolbar) {
        renderToolbar()
      }
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

  //   get_rectangle(rectangle_id: string): SVGRectangle | undefined;
  //   add_rectangle(group_id: string | undefined, partial_rectangle: PartialSVGRectangle): void;
  //   edit_rectangle(rectangle_id: string, edits: PartialSVGRectangle): void;
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

  removeObject(object_id: string): void {
    this.svgDoc.remove_object(object_id)
    this.changeListener()
  }

  //   remove_path_point(path_id: string, point_id: string): void;
  //   save(): string | undefined;
  //   load(data: string): void;
  //   broadcast(): string;
  //   merge(oplog: string): void;

  children(): SVGDocTree {
    return this.svgDoc.children()
  }

  testInitialCircles(): Circle[] {
    return []
  }
}

export const convertUtility = (tree: SVGDocTree, crdtClient: CrdtClient, engineContext: EngineContext) => {
  const circles = tree.children.flatMap((it) => {
    if (it.type !== 'CIRCLE') return []

    return [
      new Circle(
        it.id,
        it.pos.x,
        it.pos.y,
        it.radius,
        it.stroke_width,
        it.opacity,
        it.fill,
        it.stroke,
        engineContext,
        crdtClient
      ),
    ]
  })

  return circles
}

export default CrdtClient
