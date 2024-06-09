import { SVGDoc as SVGDocJs } from '@inktor/inktor-crdt-js'
import {
  Color,
  PartialSVGCircle,
  PartialSVGGroup,
  PartialSVGPath,
  PartialSVGRectangle,
  SVGCircle,
  SVGDoc as SVGDocRs,
  SVGDocTree,
  SVGGroup,
  SVGPath,
  SVGPathCommand,
  SVGPathCommandType,
  SVGRectangle,
  Vec2,
} from '@inktor/inktor-crdt-rs'

import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import { EngineContext } from '@/components/molecules/RenderingEngine/type'
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

export type PathCommand = SVGPathCommand
export type SVGColor = Color

class CrdtClient {
  svgDoc: SVGDocRs
  peerGroupClient: PeerGroupClient
  changeListener: () => void
  remoteChangeListener: () => void

  // only for subscribers that are not the crdt client itself.
  mutateSubscribers: Map<number, () => void>
  render: () => void
  groupId: string
  logic: string | null

  constructor(logic: string | null) {
    this.logic = logic
    this.svgDoc = this.createSVGDoc(getClientId(), this.logic)
    this.mutateSubscribers = new Map()
    this.changeListener = () => {
      this.onChange()
      this.notifyMutateSubscribers()
    }

    this.remoteChangeListener = () => {
      this.onChange(true)
      this.notifyMutateSubscribers()
    }

    this.render = () => {}
    const crdtData = getCrdtData()
    if (crdtData) this.svgDoc.load(crdtData)

    this.groupId = location.pathname.substring(1)
    this.peerGroupClient = new PeerGroupClient(() => location.pathname.substring(1))
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

  createSVGDoc(docId: string, logic: string | null) {
    if (logic === 'WASM') {
      return SVGDocRs.new(docId)
    } else {
      return SVGDocJs.new(docId)
    }
  }

  setSvgDoc(logic: string | null) {
    this.svgDoc = this.createSVGDoc(getClientId(), logic)

    const crdtData = getCrdtData()
    if (crdtData) this.svgDoc.load(crdtData)
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

  private notifyMutateSubscribers() {
    for (const [_id, callback] of this.mutateSubscribers) {
      callback()
    }
  }

  addMutateSubsriber(callback: () => void): number {
    const subscriberId = Math.floor(Math.random() * 1_000_000)
    this.mutateSubscribers.set(subscriberId, callback)
    return subscriberId
  }

  removeMutateSubscriber(subscriberId: number) {
    if (this.mutateSubscribers.has(subscriberId)) {
      this.mutateSubscribers.delete(subscriberId)
    }
  }

  private onChange(noBroadcast?: boolean) {
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
      this.notifyMutateSubscribers()
    }

    this.remoteChangeListener = () => {
      this.onChange(true)
      this.render()

      if (renderToolbar) {
        renderToolbar()
      }
      this.notifyMutateSubscribers()
    }
  }

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

  getPath(path_id: string): SVGPath | undefined {
    return this.svgDoc.get_path(path_id)
  }

  addPath(group_id: string | undefined, partial_path: PartialSVGPath): void {
    this.svgDoc.add_path(group_id, partial_path)
    this.changeListener()
  }

  editPath(path_id: string, partial_path: PartialSVGPath): void {
    this.svgDoc.edit_path(path_id, partial_path)
    this.changeListener()
  }

  //   edit_group(group_id: string, partial_group: PartialSVGGroup): void;

  editPathPointType(path_id: string, point_id: string, command_type: SVGPathCommandType): void {
    this.svgDoc.edit_path_point_type(path_id, point_id, command_type)
    this.changeListener()
  }

  editPathPointPos(path_id: string, point_id: string, new_pos: Vec2): void {
    this.svgDoc.edit_path_point_pos(path_id, point_id, new_pos)
    this.changeListener()
  }

  editPathPointHandle1(path_id: string, point_id: string, new_handle1: Vec2): void {
    this.svgDoc.edit_path_point_handle1(path_id, point_id, new_handle1)
    this.changeListener()
  }

  editPathPointHandle2(path_id: string, point_id: string, new_handle2: Vec2): void {
    this.svgDoc.edit_path_point_handle2(path_id, point_id, new_handle2)
    this.changeListener()
  }

  addPointToPath(path_id: string, command: SVGPathCommandType, pos: Vec2): void {
    this.svgDoc.add_point_to_path(path_id, command, pos)
    this.changeListener()
  }

  moveObject(group_id: string | null, object_id: string, index: number) {
    if (group_id) {
      this.svgDoc.move_object_to_group(object_id, group_id, index)
    } else {
      this.svgDoc.move_object_to_root(object_id, index)
    }
    this.changeListener()
  }

  addGroup(group_id: string | null, partial_group: PartialSVGGroup) {
    if (group_id === null) {
      this.svgDoc.add_group(undefined, partial_group)
    } else {
      this.svgDoc.add_group(group_id, partial_group)
    }
    this.changeListener()
  }

  removeObject(object_id: string): void {
    this.svgDoc.remove_object(object_id)
    this.changeListener()
  }

  removePathPoint(path_id: string, point_id: string): void {
    this.svgDoc.remove_path_point(path_id, point_id)
    this.changeListener()
  }

  //   save(): string | undefined;
  //   load(data: string): void;
  //   broadcast(): string;
  //   merge(oplog: string): void;

  children(): SVGDocTree {
    return this.svgDoc.children()
  }
}

const convertUtilityAux = (group: SVGGroup, crdtClient: CrdtClient, engineContext: EngineContext) => {
  const objects = group.children.flatMap((it): (Circle | Rectangle | Path)[] => {
    if (it.type === 'CIRCLE')
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

    if (it.type === 'RECTANGLE')
      return [
        new Rectangle(
          it.id,
          it.pos.x,
          it.pos.y,
          it.height,
          it.width,
          it.stroke_width,
          it.opacity,
          it.fill,
          it.stroke,
          engineContext,
          crdtClient
        ),
      ]
    if (it.type === 'PATH')
      return [new Path(it.id, it.points, it.stroke_width, it.opacity, it.fill, it.stroke, engineContext, crdtClient)]
    if (it.type === 'GROUP') return convertUtilityAux(it, crdtClient, engineContext)
    return []
  })
  return objects
}

export const convertUtility = (tree: SVGDocTree, crdtClient: CrdtClient, engineContext: EngineContext) => {
  const objects = tree.children.flatMap((it): (Circle | Rectangle | Path)[] => {
    if (it.type === 'CIRCLE')
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

    if (it.type === 'RECTANGLE')
      return [
        new Rectangle(
          it.id,
          it.pos.x,
          it.pos.y,
          it.height,
          it.width,
          it.stroke_width,
          it.opacity,
          it.fill,
          it.stroke,
          engineContext,
          crdtClient
        ),
      ]

    if (it.type === 'PATH')
      return [new Path(it.id, it.points, it.stroke_width, it.opacity, it.fill, it.stroke, engineContext, crdtClient)]
    if (it.type === 'GROUP') return convertUtilityAux(it, crdtClient, engineContext)
    return []
  })
  return objects
}

export default CrdtClient
