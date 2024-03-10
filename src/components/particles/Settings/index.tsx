import { Dialog, Transition } from '@headlessui/react'
import { FC, Fragment, useState } from 'react'

import IcGear from '@/assets/icons/ic-gear.svg?react'
import Button from '@/components/atoms/Button'
import Toggle from '@/components/atoms/Toggle'
import CrdtClient from '@/components/organisms/Crdt'
import clsxm from '@/utils/clsxm'

interface Settings {
  propBarVisible: boolean
  logic: string
  setLogic: React.Dispatch<React.SetStateAction<string>>
  client: CrdtClient
}

const Settings: FC<Settings> = ({ propBarVisible, logic, setLogic, client }) => {
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

  const closeModal = () => {
    setIsOpen(false)
  }

  const openModal = () => {
    setIsOpen(true)
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

      <Transition
        appear
        show={isOpen}
        as={Fragment}
      >
        <Dialog
          as='div'
          className='relative z-10'
          onClose={closeModal}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='flex w-full max-w-md transform flex-col gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-xl font-medium leading-6 text-gray-900'
                  >
                    Settings
                  </Dialog.Title>

                  <p className='text-lg text-gray-500'>Wasm or JS</p>

                  <div className='py-2'>
                    <Toggle
                      enabled={enabled}
                      handleToggle={handleToggle}
                    />
                  </div>

                  <Button
                    text={'Close'}
                    onClick={closeModal}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Settings
