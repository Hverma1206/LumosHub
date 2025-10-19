import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { authService } from './utils/authService'
import './App.css'

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  const handleJoinRoom = (roomId, name) => {
    setCurrentRoom(roomId)
    setUserName(name)
    navigate(`/editor/${roomId}`)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setUserName('')
    navigate('/room-join')
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentRoom(null)
    setUserName('')
    navigate('/login')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>LumosHub</h1>
        {currentRoom && (
          <div className="room-header">
            <span className="room-info">Room: {currentRoom} | User: {userName}</span>
            <button onClick={handleLeaveRoom} className="leave-button">
              Leave Room
            </button>
          </div>
        )}
        {currentRoom && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </header>
      <main className="app-main">
        <Outlet context={{ handleJoinRoom, currentRoom, userName }} />
      </main>
    </div>
  )
}

export default App
