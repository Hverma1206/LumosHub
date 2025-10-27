import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import './RoomJoin.css'

const RoomJoin = () => {
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [socket, setSocket] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get userName from localStorage (set by OAuth callback)
    const storedUserName = localStorage.getItem('userName')
    if (storedUserName) {
      setUserName(storedUserName)
    }

    const newSocket = io(import.meta.env.VITE_BACKEND_URL)
    setSocket(newSocket)

    // Listen for room creation
    newSocket.on('room-created', ({ roomId, userName }) => {
      const trimmedRoomId = roomId.substring(0, 9)
      localStorage.setItem('currentRoom', trimmedRoomId)
      navigate(`/editor/${trimmedRoomId}`)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [navigate])

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('Please log in via Google first')
      return
    }
    
    if (socket) {
      socket.emit('create-room', { userName: userName.trim() })
    }
  }

  const handleJoinExistingRoom = () => {
    if (!userName.trim()) {
      alert('Please log in via Google first')
      return
    }
    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }
    localStorage.setItem('currentRoom', roomId.trim())
    navigate(`/editor/${roomId.trim()}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('token')
    localStorage.removeItem('currentRoom')
    setUserName('')
    setRoomId('')
    if (socket) {
      socket.disconnect()
    }
    navigate('/login')
  }

  return (
    <div className="room-join">
      {userName && (
        <div className="user-info">
          <span>Logged in as: <strong>{userName}</strong></span>
        </div>
      )}

      {userName && (
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      )}

      <div className="room-join-container">
        <div className="welcome-section">
          <h2>Welcome to LumosHub!</h2>
          <p>Start coding collaboratively in real-time</p>
        </div>

        <div className="form-section">
          {!userName && (
            <div className="input-group">
              <p style={{ color: '#8b949e', textAlign: 'center' }}>Please sign in with Google to continue</p>
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID or create new"
              className="room-input"
              disabled={!userName}
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

