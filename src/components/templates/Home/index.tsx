import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { FC, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Home: FC = () => {
  const [roomId, setRoomId] = useState('')
  const navigate = useNavigate()

  const handleChangeRoomId = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    setRoomId(e.target.value)
  }, [])

  const createRoomId = () => {
    return Math.random().toString(36).slice(2).substring(0, 6)
  }

  const handleCreateRoom = () => {
    const roomId = createRoomId()
    setRoomId(roomId)

    navigate(roomId)
  }

  return (
    <main className='mx-auto mt-6 flex flex-col items-center gap-6'>
      <h1 className='text-8xl font-bold tracking-wide'>Inktor</h1>

      <div className='flex flex-col items-center gap-4'>
        <Button
          text='Create'
          textClassName='text-4xl'
          onClick={() => handleCreateRoom()}
        />

        <div className='flex items-center gap-4'>
          <p className='whitespace-nowrap text-4xl font-bold'>Room ID:</p>

          <Input
            id='roomId'
            type='text'
            placeholder={'Enter Room ID'}
            value={roomId}
            onChange={handleChangeRoomId}
          />

          <Button
            text='Join'
            href={`/${roomId}`}
            textClassName='text-4xl'
          />
        </div>
      </div>
    </main>
  )
}

export default Home
