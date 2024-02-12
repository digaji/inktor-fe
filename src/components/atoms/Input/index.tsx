import React, { InputHTMLAttributes, memo } from 'react'

import clsxm from '@/utils/clsxm'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ ...rest }, ref) => {
  return (
    // <div className='relative'>
    <input
      ref={ref}
      {...rest}
      className={clsxm(
        'block w-full rounded-lg border-2 border-gray-800 px-2 py-2',
        'text-4xl text-black placeholder-gray-500 focus:border-gray-900 focus:outline-0 focus:ring-0',
        // 'lg:py-[12px] lg:pl-[60px] lg:leading-[28px]',
        rest.className
      )}
    />
    // </div>
  )
})

export default memo(Input)
