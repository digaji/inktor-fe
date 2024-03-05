import { SVGCircle, SVGPath, SVGRectangle } from '@inktor/inktor-crdt-rs'
import { FC } from 'react'
import { RgbaColorPicker } from 'react-colorful'

import IcTrash from '@/assets/icons/ic-trash.svg?react'
import Circle from '@/components/atoms/Circle'
import ColorPicker from '@/components/atoms/ColorPicker'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import CrdtClient from '@/components/organisms/Crdt'
import { useAssertions } from '@/hooks/useAssertions'
import { useColorPicker } from '@/hooks/useColorPicker'
import { useOperations } from '@/hooks/useOperations'
import rgbaToHex from '@/utils/rgbaToHex'

interface PropertiesBar {
  client: CrdtClient
  selected: SVGCircle | SVGRectangle | SVGPath
  setSelected: React.Dispatch<React.SetStateAction<Circle | Rectangle | Path | undefined>>
  onClickDelete: () => void
  setRenderPropbar: (fn: () => void) => void
}

const PropertiesBar: FC<PropertiesBar> = ({ client, selected, setSelected, onClickDelete, setRenderPropbar }) => {
  const fillPicker = useColorPicker()
  const strokePicker = useColorPicker()

  const elementOperations = useOperations({ client, selected })
  const selectedType = elementOperations.selectedType
  const assertions = useAssertions()

  const [fillRed, fillGreen, fillBlue, fillOpacity] = selected.fill
  const [strokeRed, strokeGreen, strokeBlue, strokeOpacity] = selected.stroke

  setRenderPropbar(() => {
    setSelected(selected as Circle | Rectangle | Path)
  })

  return (
    <section
      className='absolute right-0 flex h-screen w-80 flex-col gap-2 divide-y-2 border-l-2 border-black bg-white p-2'
      onClick={() => {
        fillPicker.hideColorPicker()
        strokePicker.hideColorPicker()
      }}
    >
      <h1 className='text-xl'>{selectedType}</h1>

      {(assertions.isCircle(selected) || assertions.isRect(selected)) && (
        <>
          <div className='flex justify-between p-1'>
            <label className='text-lg'>X: {selected.pos.x}</label>

            <input
              min={-100}
              max={100}
              value={selected.pos.x}
              type='range'
              onChange={(e) => elementOperations.onChangeX(e.target.value)}
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
                elementOperations.onChangeY(e.target.value)
              }}
            />
          </div>
        </>
      )}

      {assertions.isCircle(selected) && (
        <div className='flex justify-between p-1'>
          <label className='text-lg'>Radius: {selected.radius}</label>

          <input
            min={0}
            max={150}
            value={selected.radius}
            type='range'
            onChange={(e) => {
              elementOperations.onChangeRadius(e.target.value)
            }}
          />
        </div>
      )}

      {assertions.isRect(selected) && (
        <>
          <div className='flex justify-between p-1'>
            <label className='text-lg'>Width: {selected.width}</label>

            <input
              min={0}
              max={500}
              value={selected.width}
              type='range'
              onChange={(e) => {
                elementOperations.onChangeWidth(e.target.value)
              }}
            />
          </div>
          <div className='flex justify-between p-1'>
            <label className='text-lg'>Height: {selected.height}</label>

            <input
              min={0}
              max={500}
              value={selected.height}
              type='range'
              onChange={(e) => {
                elementOperations.onChangeHeight(e.target.value)
              }}
            />
          </div>
        </>
      )}

      <div className='flex justify-between p-1'>
        <label className='text-lg'>Stroke Width: {selected.stroke_width}</label>

        <input
          min={0}
          max={150}
          value={selected.stroke_width}
          type='range'
          onChange={(e) => {
            elementOperations.onChangeStrokeWidth(e.target.value)
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
            elementOperations.onChangeOpacity(e.target.value)
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
              onChange={elementOperations.onChangeFill}
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
              onChange={elementOperations.onChangeStroke}
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
