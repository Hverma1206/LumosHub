import { useState, useEffect } from 'react'
import CodeEditor from './components/CodeEditor'
import RoomJoin from './components/RoomJoin'
import './App.css'

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [userName, setUserName] = useState('')

  const handleJoinRoom = (roomId, name) => {
    setCurrentRoom(roomId)
    setUserName(name)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setUserName('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 LumosHub - Collaborative Code Editor</h1>
        {currentRoom && (
          <div className="room-header">
            <span className="room-info">Room: {currentRoom} | User: {userName}</span>
            <button onClick={handleLeaveRoom} className="leave-button">
              Leave Room
            </button>
          </div>
        )}
      </header>
      <main className="app-main">
        {currentRoom ? (
          <CodeEditor roomId={currentRoom} userName={userName} />
        ) : (
          <RoomJoin onJoinRoom={handleJoinRoom} />
        )}
      </main>
    </div>
  )
}

export default App
