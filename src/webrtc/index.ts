import Peer from 'peerjs'
import { z } from 'zod'

import { joinRoom, roomMembers } from '@/services/PeerService'

type MemberID = string
type ConnectionID = string

let peerClient: Peer | null = null

const getPeerClient = () => {
  if (!peerClient) {
    const host = import.meta.env.VITE_SIGNALING_SERVER_IP
    const port = import.meta.env.VITE_SIGNALING_SERVER_PORT
    const path = import.meta.env.VITE_SIGNALING_SERVER_PEERJS_PATH
    const key = import.meta.env.VITE_SIGNALING_SERVER_PEERJS_KEY

    peerClient = new Peer({
      host,
      port,
      path,
      key,
      config: {},
    })
    return peerClient
  }
  return peerClient
}

class PeerGroupClient {
  peerClient: Peer
  roomId: string | null
  peerId: string | null
  pollRoomIntervalId: number
  memberIds: Map<MemberID, ConnectionID>
  onMessageReceived: (message: string) => void
  onNewMembersSendMessage?: () => string

  constructor(groupId?: string) {
    this.memberIds = new Map()
    this.peerId = null
    this.roomId = null
    this.pollRoomIntervalId = 0

    this.onMessageReceived = () => {}
    this.peerClient = getPeerClient()
    this.peerClient.on('open', (id) => {
      this.peerClient.on('connection', (conn) => {
        conn.on('data', (data) => {
          const res = z.string().safeParse(data)
          if (!res.success) return
          this.onMessageReceived(res.data)
        })
      })

      this.peerId = id

      if (groupId) {
        this.joinGroup(groupId)
      }
    })
  }

  setOnNewMembersSendMessage(onNewMembersSendMessage: () => string) {
    this.onNewMembersSendMessage = onNewMembersSendMessage
  }

  setOnMessageReceived(onMessageReceived: (message: string) => void) {
    this.onMessageReceived = onMessageReceived
  }

  async joinGroup(groupId: string) {
    if (!this.peerId) return

    this.roomId = groupId
    await joinRoom(this.peerId, groupId)
    clearInterval(this.pollRoomIntervalId)

    this.pollRoomIntervalId = setInterval(async () => {
      if (!this.roomId) return

      console.log('joinGroup roomId ', this.roomId)

      const newMemberIds = await roomMembers(this.roomId)
      const diff = newMemberIds.filter((it) => !this.memberIds.has(it) && it !== this.peerId)

      for (const newMember of diff) {
        const conn = this.peerClient.connect(newMember)
        const opening = new Promise<null>((resolve, _) => conn.on('open', () => resolve(null)))
        await opening

        console.log('after opening')

        this.memberIds.set(newMember, conn.connectionId)
        console.log('joinGroup member(s) ', this.memberIds)
      }

      const oldMemberIds = this.memberIds.keys()

      for (const oldMemberId of oldMemberIds) {
        if (!newMemberIds.includes(oldMemberId)) {
          this.memberIds.delete(oldMemberId)
        }
      }

      if (diff.length > 0) {
        // broadcast changes to all
        if (!this.onNewMembersSendMessage) return

        const message = this.onNewMembersSendMessage()
        await this.sendMessageToGroup(message)
      }

      console.log('joinGroup member(s) end ', this.memberIds)
    }, 1000)
  }

  async sendMessageToGroup(message: string) {
    console.log('sendMessageToGroup')
    console.log('sendMessageToGroup room ' + this.roomId)
    console.log('sendMessageToGroup peer ' + this.peerId)
    console.log('sendMessageToGroup member(s) ', this.memberIds)

    if (!this.roomId || !this.peerId) return

    for (const [memberId, connId] of this.memberIds) {
      console.log('sendMessageToGroup - forLoop')
      console.log('sendMessageToGroup member ' + memberId)
      console.log('sendMessageToGroup conn ' + connId)

      if (memberId === this.peerId) continue

      const conn = this.peerClient.getConnection(memberId, connId)

      if (conn === null) continue
      if (!('send' in conn)) continue

      try {
        await conn.send(message)
      } catch (err) {
        continue
      }
    }
  }
}

export default PeerGroupClient
