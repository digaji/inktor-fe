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
    const scheme = import.meta.env.VITE_SIGNALING_SERVER_SCHEME

    peerClient = new Peer({
      secure: scheme === 'https',
      host,
      port,
      path,
      key,
      config: {
        iceServers: [{ url: 'turn:peer.inktor.bghiffar.com:3478', username: 'user01', credential: 'pass01' }],
        sdpSemantics: 'unified-plan',
      },
    })
    return peerClient
  }
  return peerClient
}

class PeerGroupClient {
  peerClient: Peer
  roomId: string | null
  peerId: string | null
  pollRoomIntervalId: NodeJS.Timeout | null
  memberIds: Map<MemberID, ConnectionID>
  onMessageReceived: (message: string) => void
  onNewMembersSendMessage?: () => string

  constructor(getGroupId?: () => string | null) {
    this.memberIds = new Map()
    this.peerId = null
    this.roomId = null
    this.pollRoomIntervalId = null

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

      if (getGroupId) {
        this.joinGroup(getGroupId)
      }
    })
  }

  setOnNewMembersSendMessage(onNewMembersSendMessage: () => string) {
    this.onNewMembersSendMessage = onNewMembersSendMessage
  }

  setOnMessageReceived(onMessageReceived: (message: string) => void) {
    this.onMessageReceived = onMessageReceived
  }

  async joinGroup(getGroupId: () => string | null) {
    if (!this.peerId) return
    const peerId = this.peerId

    if (this.pollRoomIntervalId) {
      clearInterval(this.pollRoomIntervalId)
    }

    this.pollRoomIntervalId = setInterval(async () => {
      this.roomId = getGroupId()
      if (!this.roomId) {
        return
      }
      await joinRoom(peerId, this.roomId)
      const newMemberIds = await roomMembers(this.roomId)
      const diff = newMemberIds.filter((it) => !this.memberIds.has(it) && it !== this.peerId)

      for (const newMember of diff) {
        const conn = this.peerClient.connect(newMember)
        const opening = new Promise<null>((resolve, _) => conn.on('open', () => resolve(null)))
        await opening

        this.memberIds.set(newMember, conn.connectionId)
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
    }, 1000)
  }

  async sendMessageToGroup(message: string) {
    if (!this.roomId || !this.peerId) return

    for (const [memberId, connId] of this.memberIds) {
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
