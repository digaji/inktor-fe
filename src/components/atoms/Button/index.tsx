import clsxm from '@/utils/clsxm'
import { FC, MouseEventHandler } from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps {
  text: string
  href?: string
  onClick?: MouseEventHandler
  className?: string
  textClassName?: string
}

const Button: FC<ButtonProps> = ({ text, href, onClick, className, textClassName }) => {
  return (
    <div
      className={clsxm(
        'relative flex justify-center rounded-lg border-2 border-black bg-white px-4 py-2 text-black',
        className
      )}
      onClick={onClick}
    >
      <p className={textClassName}>{text}</p>

      {href && (
        <Link to={href}>
          <span className='absolute inset-0' />
        </Link>
      )}
    </div>
  )
}

export default Button
