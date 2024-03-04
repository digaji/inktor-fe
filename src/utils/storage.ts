export const generateId = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const result = Array.from({ length }, () => {
    return chars.charAt(Math.floor(Math.random() * chars.length))
  })
  return result.join('')
}

const REPLICA_ID_KEY = 'replica_id'

export const getClientId = () => {
  const replicaId = localStorage.getItem(REPLICA_ID_KEY)
  if (replicaId === null) {
    const replicaId = generateId(5)
    localStorage.setItem(REPLICA_ID_KEY, replicaId)
    return replicaId
  }
  return replicaId
}

const CRDT_DATA_KEY = () => `CRDT_DATA_${getClientId()}`

export const getCrdtData = () => {
  const res = localStorage.getItem(CRDT_DATA_KEY())
  return res
}

export const saveCrdtData = (crdtData: string) => {
  localStorage.setItem(CRDT_DATA_KEY(), crdtData)
}
