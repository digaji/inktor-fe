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
        // Custom STUN/TURN servers help when connecting when a client is behind a NAT
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

    // open a connection to the peerjs server
    this.peerClient = getPeerClient()
    this.peerClient.on('open', (id) => {
      // Define for every connection from different clients
      this.peerClient.on('connection', (conn) => {
        // when we receive data from another client, call the oneMessageReceived handler
        conn.on('data', (data) => {
          const res = z.string().safeParse(data)
          if (!res.success) return
          this.onMessageReceived(res.data)
        })
      })

      // When the connection is open save the peer id
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

    // clear polling from previous join group.
    if (this.pollRoomIntervalId) {
      clearInterval(this.pollRoomIntervalId)
    }

    // room member polling, makesure client is connected to all other clients
    // in the same room
    this.pollRoomIntervalId = setInterval(async () => {
      this.roomId = getGroupId()
      if (!this.roomId) {
        return
      }

      // hit join room endpoint in peer server
      await joinRoom(peerId, this.roomId)

      // get room members of current room
      const newMemberIds = await roomMembers(this.roomId)

      // diff is members that previously weren't in the room that we are in.
      // This could be because we changed rooms or new users are joining the room we are in.
      const diff = newMemberIds.filter((it) => !this.memberIds.has(it) && it !== this.peerId)

      // open a new webrtc connection to new clients in our room
      for (const newMember of diff) {
        const conn = this.peerClient.connect(newMember)
        const opening = new Promise<null>((resolve, _) => conn.on('open', () => resolve(null)))
        await opening

        this.memberIds.set(newMember, conn.connectionId)
      }

      // remove old webrtc connections to clients no longer in the same room
      const oldMemberIds = this.memberIds.keys()
      for (const oldMemberId of oldMemberIds) {
        if (!newMemberIds.includes(oldMemberId)) {
          this.memberIds.delete(oldMemberId)
        }
      }

      // if there are new clients in our room, we want to send the current state of
      // our document to them
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
        conn.send(message)
      } catch (err) {
        continue
      }
    }
  }
}

export default PeerGroupClient
