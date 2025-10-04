import { useState } from 'react'
import './RoomJoin.css'

const RoomJoin = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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

  const handleQuickJoin = (quickRoomId) => {
    if (!userName.trim()) {
      alert('Please enter your name first')
      return
    }
    onJoinRoom(quickRoomId, userName.trim())
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

          <div className="room-actions">
            <div className="create-room">
              <h3>Create New Room</h3>
              <p>Start a new collaborative session</p>
              <button
                onClick={handleCreateRoom}
                className="create-button"
                disabled={!userName.trim()}
              >
                🚀 Create Room
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="join-room">
              <h3>Join Existing Room</h3>
              <p>Enter the room ID shared with you</p>
              <div className="input-group">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter Room ID"
                  className="room-input"
                  maxLength={10}
                />
                <button
                  onClick={handleJoinRoom}
                  className="join-button"
                  disabled={!userName.trim() || !roomId.trim()}
                >
                  🔗 Join Room
                </button>
              </div>
            </div>
          </div>

          <div className="quick-join">
            <h3>Quick Join</h3>
            <p>Join popular public rooms</p>
            <div className="quick-rooms">
              <button
                onClick={() => handleQuickJoin('PUBLIC')}
                className="quick-room-button"
                disabled={!userName.trim()}
              >
                🌍 Public Room
              </button>
              <button
                onClick={() => handleQuickJoin('DEMO')}
                className="quick-room-button"
                disabled={!userName.trim()}
              >
                🎯 Demo Room
              </button>
              <button
                onClick={() => handleQuickJoin('PRACTICE')}
                className="quick-room-button"
                disabled={!userName.trim()}
              >
                💪 Practice Room
              </button>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h3>✨ Features</h3>
          <ul>
            <li>🔄 Real-time collaborative editing</li>
            <li>🎨 Syntax highlighting for multiple languages</li>
            <li>▶️ Code execution with live output</li>
            <li>📱 Responsive design for all devices</li>
            <li>🔒 Private rooms with custom IDs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RoomJoin
