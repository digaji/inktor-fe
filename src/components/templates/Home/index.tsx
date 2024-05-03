import { Button, Input, Space } from 'antd'
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

  const handleJoinRoom = () => {
    navigate(roomId)
  }

  return (
    <main className='flex h-screen items-center justify-center bg-[linear-gradient(to_right,grey_1px,transparent_1px),linear-gradient(to_bottom,grey_1px,transparent_1px)] bg-[center_top_1rem] py-10 [background-size:40px_40px]'>
      <div className='relative h-[500px] w-[450px] rounded-xl bg-white drop-shadow-2xl'>
        <div className='absolute left-[50%] h-32 w-32 translate-x-[-50%] translate-y-[-50%] drop-shadow-xl'>
          <img
            src='/logo.svg'
            alt='inktor logo'
          />
        </div>
        <div className='flex h-full flex-col pt-20'>
          <div className='flex h-12 justify-center'>
            <img
              src='/inktorwritinglogo.svg'
              alt='inktor logo'
            />
          </div>
          <div className='flex flex-grow flex-col gap-3 px-9 pt-20'>
            <Space.Compact className='w-full'>
              <Input
                placeholder='Room ID'
                value={roomId}
                onChange={handleChangeRoomId}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={roomId === ''}
              >
                Join Room
              </Button>
            </Space.Compact>
            <div className='flex items-center gap-2'>
              <div className='flex-grow border-t border-gray-400' />
              <span className='text-gray-400'>or</span>
              <div className='flex-grow border-t border-gray-400' />
            </div>
            <Button
              className='w-full'
              onClick={handleCreateRoom}
            >
              Create Room
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
