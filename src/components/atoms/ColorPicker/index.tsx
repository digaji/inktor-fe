import { DetailedHTMLProps, FC, HTMLAttributes } from 'react'

type ColorPicker = DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  pickerColor: [number, number, number, number]
}

const ColorPicker: FC<ColorPicker> = ({ onClick, children, pickerColor, ...props }) => {
  const [red, green, blue, opacity] = pickerColor

  return (
    <div className='relative flex items-start'>
      <button
        style={{ background: `rgba(${red}, ${green}, ${blue}, ${opacity})` }}
        className='h-3 w-10 cursor-pointer border border-black'
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()

          if (onClick) {
            onClick(e)
          }
        }}
        {...props}
      />
      {children}
    </div>
  )
}

export default ColorPicker
