import { Dialog } from '@headlessui/react'
import { FC, useRef } from 'react'
import { useState } from 'react'

import Button from '@/components/atoms/Button'
import DialogBox from '@/components/atoms/DialogBox'
import CrdtClient from '@/components/molecules/Crdt'
import { EngineContext } from '@/components/molecules/RenderingEngine/type'
import { BenchmarkPresets, BenchmarkPresetType } from '@/config/BenchmarkPresets'
import useBenchmark from '@/hooks/useBenchmark'
import clsxm from '@/utils/clsxm'

interface Benchmark {
  client: CrdtClient
  context: EngineContext
  closeSettings: () => void
}

const Benchmark: FC<Benchmark> = ({ client, context, closeSettings }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState('')
  const initialFocusRef = useRef(null)

  const benchmarkClient = useBenchmark({ client, context })

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setSelectedPreset('')
  }

  return (
    <>
      <button
        type='button'
        onClick={openModal}
        className='w-auto rounded-md border-2 border-black bg-white p-2 font-medium text-black drop-shadow-xl transition hover:bg-inktor-cyan hover:text-white focus:outline-none focus-visible:ring-2'
      >
        Benchmark Mode
      </button>

      <DialogBox
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isWide={true}
        initialFocusRef={initialFocusRef}
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
          Benchmark
        </Dialog.Title>

        <p
          className='text-lg text-gray-500'
          ref={initialFocusRef}
        >
          Presets
        </p>

        <div className='flex justify-center gap-4'>
          {BenchmarkPresets.map((preset) => (
            <Button
              key={preset.size}
              text={preset.size.toString()}
              className={clsxm(
                'transition-all duration-150 hover:bg-inktor-cyan hover:text-white',
                selectedPreset === preset.size.toString() && 'bg-inktor-cyan text-white'
              )}
              onClick={() => setSelectedPreset(preset.size.toString())}
            />
          ))}
        </div>

        <Button
          text='Run Benchmark'
          onClick={() => {
            benchmarkClient.benchmarkPreset(selectedPreset as BenchmarkPresetType)
            closeModal()
            closeSettings()
          }}
        />

        <Button
          text='Clear Canvas'
          onClick={benchmarkClient.clearCanvas}
        />
      </DialogBox>
    </>
  )
}

export default Benchmark
