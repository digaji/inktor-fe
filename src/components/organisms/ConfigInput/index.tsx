import { SVGPathCommand } from '@inktor/inktor-crdt-rs'
import { FC } from 'react'

import Input from '@/components/atoms/Input'

interface ConfigInput {
  command: (command: SVGPathCommand) => number
  data: SVGPathCommand
  onChange: (value: string) => void
}

const ConfigInput: FC<ConfigInput> = ({ command, data, onChange }) => {
  return (
    <Input
      type='number'
      className='rounded-md border border-black p-1 text-base focus:ring'
      value={command(data)}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default ConfigInput
