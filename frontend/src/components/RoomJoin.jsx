import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import './RoomJoin.css'

const RoomJoin = () => {
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [socket, setSocket] = useState(null)
  const { handleJoinRoom } = useOutletContext()
  const navigate = useNavigate()

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL)
    setSocket(newSocket)

    // Listen for room creation
    newSocket.on('room-created', ({ roomId, userName }) => {
      handleJoinRoom(roomId, userName)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [handleJoinRoom])

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    
    if (socket) {
      socket.emit('create-room', { userName: userName.trim() })
    }
  }

  const handleJoinExistingRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }
    handleJoinRoom(roomId.trim(), userName.trim())
  }

  const handleLogout = () => {
    setUserName('')
    setRoomId('')
    if (socket) {
      socket.disconnect()
    }
    navigate('/')
  }

  return (
    <div className="room-join">
      {userName && (
        <div className="user-info">
          <span>Logged in as: <strong>{userName}</strong></span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}

      <div className="room-join-container">
        <div className="welcome-section">
          <h2>Welcome to LumosHub!</h2>
          <p>Start coding collaboratively in real-time</p>
        </div>

        <div className="form-section">
          <div className="input-group">
            <label htmlFor="userName">Your Name</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
              maxLength={20}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID or create new"
              className="room-input"
            />
          </div>
          
          <div className="buttons-group">
            <button
              onClick={handleCreateRoom}
              className="create-button"
              disabled={!userName.trim()}
            >
              Create a New Room
            </button>
            
            <button
              onClick={handleJoinExistingRoom}
              className="join-button"
              disabled={!userName.trim() || !roomId.trim()}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomJoin

