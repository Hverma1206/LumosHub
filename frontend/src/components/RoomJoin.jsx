import { useState } from 'react'
import './RoomJoin.css'

const RoomJoin = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    const newRoomId = generateRoomId()
    onJoinRoom(newRoomId, userName.trim())
  }

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }
    onJoinRoom(roomId.trim(), userName.trim())
  }

  return (
    <div className="room-join">
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
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Enter Room ID or leave blank to create new"
              className="room-input"
              maxLength={10}
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
              onClick={handleJoinRoom}
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
        
