import { FC } from 'react'
import { Switch } from '@headlessui/react'

interface Toggle {
  enabled: boolean
  handleToggle: () => void
}

const Toggle: FC<Toggle> = ({ enabled, handleToggle }) => {
  return (
    <Switch
      checked={enabled}
      onChange={handleToggle}
      className={`${enabled ? 'bg-purple-500' : 'bg-yellow-300'}
          relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-lg transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
    >
      <span className='sr-only'>CRDT Setting</span>
      <span
        aria-hidden='true'
        className={`${enabled ? 'translate-x-[39px]' : 'translate-x-0'}
            pointer-events-none inline-block h-[36px] w-[36px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  )
}

export default Toggle
