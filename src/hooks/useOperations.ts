import { SVGPathCommandType } from '@inktor/inktor-crdt-rs'
import { useCallback } from 'react'
import { RgbaColor } from 'react-colorful'

import CrdtClient from '@/components/organisms/Crdt'
import { CustomSVGElement } from '@/types/elements'

import { useAssertions } from './useAssertions'

interface UseOperations {
  client: CrdtClient
  selected: CustomSVGElement
}

export const useOperations = ({ client, selected }: UseOperations) => {
  const assertions = useAssertions()

  let selectedType = ''
  switch (true) {
    case assertions.isCircle(selected):
      selectedType = 'Circle'
      break
    case assertions.isRect(selected):
      selectedType = 'Rectangle'
      break
    case assertions.isPath(selected):
      selectedType = 'Path'
  }

  const onChangeX = useCallback(
    (s: string) => {
      const x = parseInt(s)

      if (selected === undefined) return
      if (Number.isNaN(x)) return

      if (assertions.isCircle(selected) || assertions.isRect(selected)) {
        const pos = structuredClone(selected.pos)
        pos.x = x

        switch (true) {
          case assertions.isCircle(selected):
            client.editCircle(selected.id, { pos })
            break
          case assertions.isRect(selected):
            client.editRectangle(selected.id, { pos })
        }
      }
    },
    [assertions, client, selected]
  )

  const onChangeY = useCallback(
    (s: string) => {
      const y = parseInt(s)

      if (selected === undefined) return
      if (Number.isNaN(y)) return

      if (assertions.isCircle(selected) || assertions.isRect(selected)) {
        const pos = structuredClone(selected.pos)
        pos.y = y

        switch (true) {
          case assertions.isCircle(selected):
            client.editCircle(selected.id, { pos })
            break
          case assertions.isRect(selected):
            client.editRectangle(selected.id, { pos })
        }
      }
    },
    [selected, assertions, client]
  )

  const onChangeRadius = useCallback(
    (s: string) => {
      const radius = parseInt(s)

      if (selected === undefined) return
      if (Number.isNaN(radius)) return

      client.editCircle(selected.id, { radius })
    },
    [client, selected]
  )

  const onChangeWidth = useCallback(
    (s: string) => {
      const width = parseInt(s)

      if (Number.isNaN(width)) return
      if (selected === undefined) return

      client.editRectangle(selected.id, { width })
    },
    [client, selected]
  )

  const onChangeHeight = useCallback(
    (s: string) => {
      const height = parseInt(s)

      if (Number.isNaN(height)) return
      if (selected === undefined) return

      client.editRectangle(selected.id, { height })
    },
    [client, selected]
  )

  const onClickAddPathCommand = useCallback(() => {
    client.addPointToPath(selected.id, SVGPathCommandType.START, { x: 0, y: 0 })
  }, [client, selected])

  const onChangeStrokeWidth = useCallback(
    (s: string) => {
      const strokeWidth = parseInt(s)

      if (selected === undefined) return
      if (Number.isNaN(strokeWidth)) return

      switch (true) {
        case assertions.isCircle(selected):
          client.editCircle(selected.id, { stroke_width: strokeWidth })
          break
        case assertions.isRect(selected):
          client.editRectangle(selected.id, { stroke_width: strokeWidth })
          break
        case assertions.isPath(selected):
          client.editPath(selected.id, { stroke_width: strokeWidth })
      }
    },
    [selected, assertions, client]
  )

  const onChangeOpacity = useCallback(
    (s: string) => {
      const opacity = parseFloat(s)

      if (selected === undefined) return
      if (Number.isNaN(opacity)) return

      switch (true) {
        case assertions.isCircle(selected):
          client.editCircle(selected.id, { opacity: opacity })
          break
        case assertions.isRect(selected):
          client.editRectangle(selected.id, { opacity: opacity })
          break
        case assertions.isPath(selected):
          client.editPath(selected.id, { opacity: opacity })
      }
    },
    [selected, assertions, client]
  )

  const onChangeFill = useCallback(
    (color: RgbaColor) => {
      if (selected === undefined) return

      switch (true) {
        case assertions.isCircle(selected):
          client.editCircle(selected.id, { fill: [color.r, color.g, color.b, color.a] })
          break
        case assertions.isRect(selected):
          client.editRectangle(selected.id, { fill: [color.r, color.g, color.b, color.a] })
          break
        case assertions.isPath(selected):
          client.editPath(selected.id, { fill: [color.r, color.g, color.b, color.a] })
      }
    },
    [selected, assertions, client]
  )

  const onChangeStroke = useCallback(
    (color: RgbaColor) => {
      if (selected === undefined) return

      switch (true) {
        case assertions.isCircle(selected):
          client.editCircle(selected.id, { stroke: [color.r, color.g, color.b, color.a] })
          break
        case assertions.isRect(selected):
          client.editRectangle(selected.id, { stroke: [color.r, color.g, color.b, color.a] })
          break
        case assertions.isPath(selected):
          client.editPath(selected.id, { stroke: [color.r, color.g, color.b, color.a] })
      }
    },
    [selected, assertions, client]
  )

  return {
    selectedType,
    selected,
    onChangeX,
    onChangeY,
    onChangeRadius,
    onChangeWidth,
    onChangeHeight,
    onClickAddPathCommand,
    onChangeStrokeWidth,
    onChangeOpacity,
    onChangeFill,
    onChangeStroke,
  }
}
