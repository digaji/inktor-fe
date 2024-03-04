import { SVGCircle } from '@inktor/inktor-crdt-rs'
import { FC, useCallback } from 'react'
import { RgbaColor, RgbaColorPicker } from 'react-colorful'

import IcTrash from '@/assets/icons/ic-trash.svg?react'
import Circle from '@/components/atoms/Circle'
import ColorPicker from '@/components/atoms/ColorPicker'
import CrdtClient from '@/components/organisms/Crdt'
import { useColorPicker } from '@/hooks/useColorPicker'
import rgbaToHex from '@/utils/rgbaToHex'

interface PropertiesBar {
  client: CrdtClient
  selected: SVGCircle
  setSelected: React.Dispatch<React.SetStateAction<Circle | undefined>>
  onClickDelete: () => void
  setRenderPropbar: (fn: () => void) => void
}

const PropertiesBar: FC<PropertiesBar> = ({ client, selected, setSelected, onClickDelete, setRenderPropbar }) => {
  const fillPicker = useColorPicker()
  const strokePicker = useColorPicker()

  const [fillRed, fillGreen, fillBlue, fillOpacity] = selected.fill
  const [strokeRed, strokeGreen, strokeBlue, strokeOpacity] = selected.stroke

  const onChangeX = useCallback(
    (s: string) => {
      const x = parseInt(s)
      if (selected === undefined) return
      if (Number.isNaN(x)) return

      const pos = structuredClone(selected.pos)
      pos.x = x
      client.editCircle(selected.id, { pos })
    },
    [client, selected]
  )

  const onChangeY = useCallback(
    (s: string) => {
      const y = parseInt(s)
      if (selected === undefined) return
      if (Number.isNaN(y)) return

      const pos = structuredClone(selected.pos)
      pos.y = y
      client.editCircle(selected.id, { pos })
    },
    [client, selected]
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

  const onChangeStrokeWidth = useCallback(
    (s: string) => {
      const strokeWidth = parseInt(s)
      if (selected === undefined) return
      if (Number.isNaN(strokeWidth)) return

      client.editCircle(selected.id, { stroke_width: strokeWidth })
    },
    [client, selected]
  )

  const onChangeOpacity = useCallback(
    (s: string) => {
      const opacity = parseFloat(s)
      if (selected === undefined) return
      if (Number.isNaN(opacity)) return

      client.editCircle(selected.id, { opacity: opacity })
    },
    [client, selected]
  )

  const onChangeFill = useCallback(
    (color: RgbaColor) => {
      if (selected === undefined) return

      client.editCircle(selected.id, { fill: [color.r, color.g, color.b, color.a] })
    },
    [client, selected]
  )

  const onChangeStroke = useCallback(
    (color: RgbaColor) => {
      if (selected === undefined) return

      client.editCircle(selected.id, { stroke: [color.r, color.g, color.b, color.a] })
    },
    [client, selected]
  )

  setRenderPropbar(() => {
    setSelected(selected as unknown as Circle)
  })

  return (
    <section
      className='absolute right-0 flex h-screen w-80 flex-col gap-2 divide-y-2 bg-white p-2'
      onClick={() => {
        fillPicker.hideColorPicker()
        strokePicker.hideColorPicker()
      }}
    >
      <h1 className='text-xl'>Circle</h1>

      <div className='flex justify-between p-1'>
        <label className='text-lg'>X: {selected.pos.x}</label>

        <input
          min={-100}
          max={100}
          value={selected.pos.x}
          type='range'
          onChange={(e) => onChangeX(e.target.value)}
        />
      </div>

      <div className='flex justify-between p-1'>
        <label className='text-lg'>Y: {selected.pos.y}</label>

        <input
          min={-100}
          max={100}
          value={selected.pos.y}
          type='range'
          onChange={(e) => {
            onChangeY(e.target.value)
          }}
        />
      </div>
      <div className='flex justify-between p-1'>
        <label className='text-lg'>Radius: {selected.radius}</label>

        <input
          min={0}
          max={150}
          value={selected.radius}
          type='range'
          onChange={(e) => {
            onChangeRadius(e.target.value)
          }}
        />
      </div>

      <div className='flex justify-between p-1'>
        <label className='text-lg'>Stroke Width: {selected.stroke_width}</label>

        <input
          min={0}
          max={150}
          value={selected.stroke_width}
          type='range'
          onChange={(e) => {
            onChangeStrokeWidth(e.target.value)
          }}
        />
      </div>

      <div className='flex justify-between p-1'>
        <label className='text-lg'>Opacity: {selected.opacity}</label>

        <input
          min={0}
          max={1}
          step={0.01}
          type='range'
          value={selected.opacity}
          onChange={(e) => {
            onChangeOpacity(e.target.value)
          }}
        />
      </div>

      <div className='flex flex-col gap-1 p-1'>
        <label className='text-lg'>Fill: {rgbaToHex(selected.fill)}</label>

        <ColorPicker
          pickerColor={selected.fill}
          onClick={() => {
            fillPicker.toggleColorPicker()
            strokePicker.hideColorPicker()
          }}
        >
          {fillPicker.show && (
            <RgbaColorPicker
              style={{ position: 'absolute', zIndex: 5, left: '4em' }}
              onChange={onChangeFill}
              color={{ r: fillRed, g: fillGreen, b: fillBlue, a: fillOpacity }}
            />
          )}
        </ColorPicker>
      </div>

      <div className='flex flex-col gap-1 p-1'>
        <label className='text-lg'>Stroke: {rgbaToHex(selected.stroke)}</label>

        <ColorPicker
          pickerColor={selected.stroke}
          onClick={() => {
            strokePicker.toggleColorPicker()
            fillPicker.hideColorPicker()
          }}
        >
          {strokePicker.show && (
            <RgbaColorPicker
              style={{ position: 'absolute', zIndex: 5, left: '4em' }}
              onChange={onChangeStroke}
              color={{ r: strokeRed, g: strokeGreen, b: strokeBlue, a: strokeOpacity }}
            />
          )}
        </ColorPicker>

        <IcTrash
          className='mt-4 h-12 w-12 rounded-md p-1 transition-all duration-150 hover:cursor-pointer hover:bg-red-500'
          onClick={onClickDelete}
        />
      </div>
    </section>
  )
}

export default PropertiesBar
