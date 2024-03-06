import { SVGPathCommand, SVGPathCommandType } from '@inktor/inktor-crdt-rs'
import { FC, useCallback } from 'react'
import { z } from 'zod'

import IcTrash from '@/assets/icons/ic-trash.svg?react'
import ConfigInput from '@/components/organisms/ConfigInput'
import CrdtClient from '@/components/organisms/Crdt'

interface ConfigurationPathCommandRowProps {
  pathId: string
  data: SVGPathCommand
  client: CrdtClient
}

const getPathCommandPosX = (command: SVGPathCommand) => {
  if (command.type === 'CLOSE') return 0
  return command.pos.x
}

const getPathCommandPosY = (command: SVGPathCommand) => {
  if (command.type === 'CLOSE') return 0
  return command.pos.y
}

const getPathCommandHandle1X = (command: SVGPathCommand) => {
  if (command.type === 'CLOSE') return 0
  if (command.type === 'LINE') return 0
  if (command.type === 'START') return 0
  if (command.type === 'BEZIER') {
    return command.handle1.x
  }

  return command.handle.x
}

const getPathCommandHandle1Y = (command: SVGPathCommand) => {
  if (command.type === 'CLOSE') return 0
  if (command.type === 'LINE') return 0
  if (command.type === 'START') return 0
  if (command.type === 'BEZIER') {
    return command.handle1.y
  }

  return command.handle.y
}

const getPathCommandHandle2X = (command: SVGPathCommand) => {
  if (command.type === 'BEZIER') return command.handle2.x
  return 0
}

const getPathCommandHandle2Y = (command: SVGPathCommand) => {
  if (command.type === 'BEZIER') return command.handle2.y
  return 0
}

const PathCommandType = z
  .literal('START')
  .or(z.literal('LINE'))
  .or(z.literal('CLOSE'))
  .or(z.literal('BEZIER'))
  .or(z.literal('BEZIER_REFLECT'))
  .or(z.literal('BEZIER_QUAD'))
  .or(z.literal('BEZIER_QUAD_REFLECT'))

const ConfigurationPathCommandRow: FC<ConfigurationPathCommandRowProps> = ({ pathId, data, client }) => {
  const onChangeSelection = useCallback(
    (v: string) => {
      const parseType = PathCommandType.safeParse(v)
      if (!parseType.success) return

      const type = parseType.data
      switch (type) {
        case 'START':
          client.editPathPointType(pathId, data.id, SVGPathCommandType.START)
          break
        case 'LINE':
          client.editPathPointType(pathId, data.id, SVGPathCommandType.LINE)
          break
        case 'CLOSE':
          client.editPathPointType(pathId, data.id, SVGPathCommandType.CLOSE)
          break
        case 'BEZIER':
          client.editPathPointType(pathId, data.id, SVGPathCommandType.BEZIER)
          break
        case 'BEZIER_QUAD':
          client.editPathPointType(pathId, data.id, SVGPathCommandType.BEZIER_QUAD)
          break
      }
    },
    [client, data, pathId]
  )

  const onChangePosX = useCallback(
    (value: string) => {
      const x = parseInt(value)
      if (Number.isNaN(x)) return

      const y = structuredClone(getPathCommandPosY(data))
      const pos = { x, y }

      client.editPathPointPos(pathId, data.id, pos)
    },
    [client, data, pathId]
  )

  const onChangePosY = useCallback(
    (value: string) => {
      const y = parseInt(value)
      if (Number.isNaN(y)) return

      const x = structuredClone(getPathCommandPosX(data))
      const pos = { x, y }

      client.editPathPointPos(pathId, data.id, pos)
    },
    [client, data, pathId]
  )

  const onChangeHandle1X = useCallback(
    (value: string) => {
      const x = parseInt(value)
      if (Number.isNaN(x)) return

      const y = structuredClone(getPathCommandHandle1Y(data))
      const handle = { x, y }

      client.editPathPointHandle1(pathId, data.id, handle)
    },
    [client, data, pathId]
  )

  const onChangeHandle1Y = useCallback(
    (value: string) => {
      const y = parseInt(value)
      if (Number.isNaN(y)) return

      const x = structuredClone(getPathCommandHandle1X(data))
      const handle = { x, y }

      client.editPathPointHandle1(pathId, data.id, handle)
    },
    [client, data, pathId]
  )

  const onChangeHandle2X = useCallback(
    (value: string) => {
      const x = parseInt(value)
      if (Number.isNaN(x)) return

      const y = structuredClone(getPathCommandHandle2Y(data))
      const handle = { x, y }

      client.editPathPointHandle2(pathId, data.id, handle)
    },
    [client, data, pathId]
  )

  const onChangeHandle2Y = useCallback(
    (value: string) => {
      const y = parseInt(value)
      if (Number.isNaN(y)) return

      const x = structuredClone(getPathCommandHandle2X(data))
      const handle = { x, y }

      client.editPathPointHandle2(pathId, data.id, handle)
    },
    [client, data, pathId]
  )

  const onClickDelete = useCallback(() => {
    client.removePathPoint(pathId, data.id)
  }, [client, data, pathId])

  return (
    <>
      <select
        className='col-span-2 w-full rounded-md border border-black bg-white p-1'
        value={data.type}
        onChange={(e) => onChangeSelection(e.target.value)}
      >
        <option value='START'>Start</option>
        <option value='LINE'>Line</option>
        <option value='CLOSE'>Close</option>
        <option value='BEZIER'>Bezier</option>
        <option value='BEZIER_QUAD'>Bezier Quad</option>
      </select>

      <ConfigInput
        command={getPathCommandPosX}
        data={data}
        onChange={onChangePosX}
      />

      <ConfigInput
        command={getPathCommandPosY}
        data={data}
        onChange={onChangePosY}
      />

      <ConfigInput
        command={getPathCommandHandle1X}
        data={data}
        onChange={onChangeHandle1X}
      />

      <ConfigInput
        command={getPathCommandHandle1Y}
        data={data}
        onChange={onChangeHandle1Y}
      />

      <ConfigInput
        command={getPathCommandHandle2X}
        data={data}
        onChange={onChangeHandle2X}
      />

      <ConfigInput
        command={getPathCommandHandle2Y}
        data={data}
        onChange={onChangeHandle2Y}
      />

      <IcTrash
        className='h-9 w-9 rounded-md bg-red-400 p-1 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-500'
        onClick={onClickDelete}
      />
    </>
  )
}

export default ConfigurationPathCommandRow
