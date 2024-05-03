import { SVGCircle, SVGPath, SVGRectangle } from '@inktor/inktor-crdt-rs'
import { ColorPicker, InputNumber } from 'antd'
import { FC } from 'react'

import IcTrash from '@/assets/icons/ic-trash.svg?react'
import Button from '@/components/atoms/Button'
import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import ConfigurationPathCommandRow from '@/components/molecules/ConfigurationPathCommandRow'
import CrdtClient from '@/components/molecules/Crdt'
import { useAssertions } from '@/hooks/useAssertions'
import { useColorPicker } from '@/hooks/useColorPicker'
import { useOperations } from '@/hooks/useOperations'
import clsxm from '@/utils/clsxm'

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
      className={clsxm(
        'absolute right-0 flex h-screen w-80 flex-col gap-2 border-l-2 border-gray-200 bg-white p-2 transition-all duration-150',
        assertions.isPath(selected) && 'w-5/12'
      )}
      onClick={() => {
        fillPicker.hideColorPicker()
        strokePicker.hideColorPicker()
      }}
    >
      <div className='flex justify-between p-1'>
        <h1 className='text-lg text-gray-600'>{selectedType}</h1>

        <IcTrash
          className='h-9 w-9 rounded-md p-1 transition-all duration-150 hover:cursor-pointer hover:bg-red-500'
          onClick={onClickDelete}
        />
      </div>

      {(assertions.isCircle(selected) || assertions.isRect(selected)) && (
        <div className='flex justify-between px-2'>
          <div className='flex gap-2 p-1'>
            <InputNumber
              addonBefore='X'
              value={selected.pos.x}
              type='number'
              size='small'
              onChange={(val) => val && elementOperations.onChangeX(val.toString())}
              changeOnWheel
              stringMode
            />
          </div>
          <div className='flex items-center gap-2 p-1'>
            {/* <label className='flex aspect-square h-full items-center justify-center text-sm text-gray-600'>Y</label> */}
            <InputNumber
              addonBefore='Y'
              value={selected.pos.y}
              type='number'
              size='small'
              onChange={(val) => val && elementOperations.onChangeY(val.toString())}
              changeOnWheel
              stringMode
            />
          </div>
        </div>
      )}

      {assertions.isCircle(selected) && (
        <div className='flex justify-between p-1 px-3'>
          {/* <label className='text-lg'>R</label> */}

          <InputNumber
            addonBefore='R'
            value={selected.radius}
            type='number'
            size='small'
            onChange={(val) => val && elementOperations.onChangeRadius(val.toString())}
            changeOnWheel
            stringMode
            min={0}
            className='w-full'
          />
          {/* <input
            min={0}
            max={150}
            value={selected.radius}
            type='range'
            onChange={(e) => {
              elementOperations.onChangeRadius(e.target.value)
            }}
          /> */}
        </div>
      )}

      {assertions.isRect(selected) && (
        <div className='flex justify-between px-2'>
          <div className='flex items-center gap-2 p-1'>
            {/* <label className='flex aspect-square h-full items-center justify-center text-sm text-gray-600'>W</label> */}
            <InputNumber
              addonBefore='W'
              value={selected.width}
              type='number'
              size='small'
              onChange={(val) => val && elementOperations.onChangeWidth(val.toString())}
              changeOnWheel
              stringMode
              min={0}
            />
          </div>
          <div className='flex items-center gap-2 p-1'>
            {/* <label className='flex aspect-square h-full items-center justify-center text-sm text-gray-600'>H</label> */}
            <InputNumber
              addonBefore='H'
              value={selected.height}
              type='number'
              size='small'
              onChange={(val) => val && elementOperations.onChangeHeight(val.toString())}
              changeOnWheel
              stringMode
              min={0}
            />
          </div>
        </div>
      )}

      <div className='flex justify-between px-2'>
        <div className='flex items-center gap-2 p-1'>
          {/* <div className='flex aspect-square h-full items-center justify-center text-sm text-gray-600'>
            <img
              src='/strokewidthicon.svg'
              alt='stroke width icon'
              className='h-5 w-5'
            />
          </div> */}

          <InputNumber
            addonBefore={
              <div className='h-4 w-4'>
                <img
                  src='/strokewidthicon.svg'
                  alt='stroke width icon'
                  className='h-full'
                />
              </div>
            }
            value={selected.stroke_width}
            type='number'
            size='small'
            onChange={(val) => val && elementOperations.onChangeStrokeWidth(val.toString())}
            changeOnWheel
            stringMode
            min={0}
          />
        </div>
        <div className='flex items-center gap-2 p-1'>
          {/* <label className='flex aspect-square h-full items-center justify-center text-sm text-gray-600'>O</label> */}
          <InputNumber
            addonBefore={
              <div className='h-4 w-4'>
                <img
                  src='/opacity.svg'
                  alt='opacity icon'
                  className='h-full'
                />
              </div>
            }
            value={selected.opacity}
            type='number'
            size='small'
            onChange={(val) => val && elementOperations.onChangeOpacity(val.toString())}
            changeOnWheel
            stringMode
            step={0.01}
            min={0}
            max={1}
          />
          {/* <input
            min={0}
            max={1}
            step={0.01}
            type='range'
            value={selected.opacity}
            onChange={(e) => {
              elementOperations.onChangeOpacity(e.target.value)
            }}
          /> */}
        </div>
      </div>
      <div className='flex flex-col gap-3 p-1 px-3'>
        <ColorPicker
          showText={(color) => <span>Fill: {color.toHexString()}</span>}
          value={`rgba(${fillRed}, ${fillGreen}, ${fillBlue}, ${fillOpacity})`}
          onChange={(c) => {
            elementOperations.onChangeFill(c.toRgb())
          }}
        />
        <ColorPicker
          showText={(color) => <span>Stroke: {color.toHexString()}</span>}
          value={`rgba(${strokeRed}, ${strokeGreen}, ${strokeBlue}, ${strokeOpacity})`}
          onChange={(c) => {
            elementOperations.onChangeStroke(c.toRgb())
          }}
        />
        {/* <label className='text-lg'>Fill: {rgbaToHex(selected.fill)}</label>

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
        </ColorPicker> */}
      </div>

      <div className='flex flex-col gap-1 p-1'>
        {/* <label className='text-lg'>Stroke: {rgbaToHex(selected.stroke)}</label>

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
        </ColorPicker> */}
      </div>

      {assertions.isPath(selected) && (
        <div className='p-1'>
          <div className='grid grid-cols-9 items-center gap-2 text-center text-lg'>
            <p className='col-span-2'>Command</p>
            <p>X</p>
            <p>Y</p>
            <p>H1 X</p>
            <p>H1 Y</p>
            <p>H2 X</p>
            <p>H2 Y</p>
            <p />

            {selected.points.map((p) => (
              <ConfigurationPathCommandRow
                key={p.id}
                pathId={selected.id}
                data={p}
                client={client}
              />
            ))}
          </div>

          <Button
            className='mt-2'
            text='Add Path'
            onClick={elementOperations.onClickAddPathCommand}
          />
        </div>
      )}
    </section>
  )
}

export default PropertiesBar
