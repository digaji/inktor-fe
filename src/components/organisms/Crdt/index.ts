import { Color, PartialSVGCircle, PartialSVGPath, PartialSVGRectangle, SVGCircle, SVGDoc, SVGDocTree, SVGPath, SVGPathCommand, SVGPathCommandType, SVGRectangle, Vec2 } from "@inktor/inktor-crdt-rs";

import Circle from "@/components/atoms/Circle";
import Path from "@/components/atoms/Path";
import Rectangle from "@/components/atoms/Rectangle";
import { getClientId, getCrdtData, saveCrdtData } from '@/utils/storage';
import PeerGroupClient from "@/webrtc";

import { EngineContext } from "../RenderingEngine/type";

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

export type PathCommand = SVGPathCommand;
export type SVGColor = Color;

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

//   move_object_to_group(object_id: string, group_id: string, index: number): void;
//   move_object_to_root(object_id: string, index: number): void;
//   remove_object(object_id: string): void;
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
}

export const convertUtility = (
    tree: SVGDocTree, 
    crdtClient: CrdtClient,
    engineContext: EngineContext
) => {
    const circles = tree.children
        .flatMap((it): (Circle | Rectangle | Path)[] => {
          if (it.type === "CIRCLE")
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
          if (it.type === "RECTANGLE")
          return [new Rectangle(
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
            )]
          if (it.type === "PATH")
          return [new Path(
            it.id, 
            it.points, 
            it.stroke_width,
            it.opacity,
            it.fill,
            it.stroke,
            engineContext, 
            crdtClient
          )]
          return []
        });
  return circles
}

export default CrdtClient
