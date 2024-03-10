import { FC } from 'react'

import clsxm from '@/utils/clsxm'

interface Indicator {
  logic: string
}

const Indicator: FC<Indicator> = ({ logic }) => {
  return (
    <p
      className={clsxm(
        'absolute left-3 top-2 w-auto rounded-md p-2 text-xl shadow-toolbar transition-all duration-500',
        logic === 'WASM' ? 'bg-purple-200' : 'bg-yellow-200'
      )}
    >
      {logic}
    </p>
  )
}

export default Indicator
