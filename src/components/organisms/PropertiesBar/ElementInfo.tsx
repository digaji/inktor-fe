import { SVGCircle, SVGPath, SVGRectangle } from '@inktor/inktor-crdt-rs'
import { ColorPicker, InputNumber } from 'antd'
import { FC } from 'react'

import IcTrash from '@/assets/icons/ic-trash.svg?react'
import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import CrdtClient from '@/components/molecules/Crdt'
import { useAssertions } from '@/hooks/useAssertions'
import { useOperations } from '@/hooks/useOperations'

interface ElementInfoProps {
  client: CrdtClient
  selected: SVGCircle | SVGRectangle | SVGPath
  setSelected: React.Dispatch<React.SetStateAction<Circle | Rectangle | Path | undefined>>
  onClickDelete: () => void
  setRenderPropbar: (fn: () => void) => void
}

const ElementInfo: FC<ElementInfoProps> = ({ client, selected, setSelected, onClickDelete, setRenderPropbar }) => {
  const elementOperations = useOperations({ client, selected })
  const selectedType = elementOperations.selectedType
  const assertions = useAssertions()

  const [fillRed, fillGreen, fillBlue, fillOpacity] = selected.fill
  const [strokeRed, strokeGreen, strokeBlue, strokeOpacity] = selected.stroke

  setRenderPropbar(() => {
    setSelected(selected as Circle | Rectangle | Path)
  })
  return (
    <>
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
        </div>
      )}

      {assertions.isRect(selected) && (
        <div className='flex justify-between px-2'>
          <div className='flex items-center gap-2 p-1'>
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
      </div>
    </>
  )
}

export default ElementInfo
