import { FC } from 'react'

import clsxm from '@/utils/clsxm'

interface Indicator {
  logic: string
}

const Indicator: FC<Indicator> = ({ logic }) => {
  return (
    <p
      className={clsxm(
        'absolute left-3 top-2 w-auto rounded-md p-2 text-xl font-bold shadow-toolbar transition-all duration-300',
        logic === 'WASM' ? 'bg-purple-500 text-white' : 'bg-yellow-300'
      )}
    >
      {logic}
    </p>
  )
}

export default Indicator
