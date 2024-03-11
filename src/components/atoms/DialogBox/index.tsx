import { Dialog, Transition } from '@headlessui/react'
import { FC, Fragment, ReactNode } from 'react'

import clsxm from '@/utils/clsxm'

interface DialogBox {
  children: ReactNode
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isWide?: boolean
  className?: string
}

const DialogBox: FC<DialogBox> = ({ children, isOpen, setIsOpen, isWide, className }) => {
  const closeModal = () => {
    setIsOpen(false)
  }

  return (
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
              <Dialog.Panel
                className={clsxm(
                  'relative flex w-full max-w-md transform flex-col gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all',
                  isWide && 'max-w-xl',
                  className
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default DialogBox
