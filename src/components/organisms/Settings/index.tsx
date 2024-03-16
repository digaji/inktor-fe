import { Dialog } from '@headlessui/react'
import { FC, useState } from 'react'

import IcGear from '@/assets/icons/ic-gear.svg?react'
import Button from '@/components/atoms/Button'
import DialogBox from '@/components/atoms/DialogBox'
import Toggle from '@/components/atoms/Toggle'
import CrdtClient from '@/components/molecules/Crdt'
import { EngineContext } from '@/components/molecules/RenderingEngine/type'
import Benchmark from '@/components/organisms/Benchmark'
import clsxm from '@/utils/clsxm'

interface Settings {
  propBarVisible: boolean
  logic: string
  setLogic: React.Dispatch<React.SetStateAction<string>>
  client: CrdtClient
  context: EngineContext
}

const Settings: FC<Settings> = ({ propBarVisible, logic, setLogic, client, context }) => {
  const WASM = 'WASM'
  const JS = 'JS'

  const [isOpen, setIsOpen] = useState(false)
  const [enabled, setEnabled] = useState(logic === WASM)

  const handleToggle = () => {
    const newState = !enabled
    setEnabled(newState)

    if (newState) {
      setLogic(WASM)
      client.setSvgDoc(WASM)
    } else {
      setLogic(JS)
      client.setSvgDoc(JS)
    }
  }

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div
        className={clsxm(
          propBarVisible ? 'right-[340px]' : 'right-4',
          'absolute top-3 flex items-center justify-center transition-all duration-150'
        )}
      >
        <button
          type='button'
          onClick={openModal}
          className='rounded-md bg-white p-2 font-medium text-black drop-shadow-xl transition hover:bg-inktor-cyan hover:text-white focus:outline-none focus-visible:ring-2'
        >
          <IcGear />
        </button>
      </div>

      <DialogBox
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <Button
          text={'X'}
          onClick={closeModal}
          className='absolute left-3 top-3 px-2 py-1'
        />

        <Dialog.Title
          as='h3'
          className='text-xl font-medium leading-6 text-gray-900'
        >
          Settings
        </Dialog.Title>

        <p className='text-lg text-gray-500'>WASM or JS</p>

        <div className='py-2'>
          <Toggle
            enabled={enabled}
            handleToggle={handleToggle}
          />
        </div>

        <Benchmark
          client={client}
          context={context}
          closeSettings={closeModal}
        />
      </DialogBox>
    </>
  )
}

export default Settings
