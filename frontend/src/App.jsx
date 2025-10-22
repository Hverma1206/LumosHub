import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  // Restore room and user from localStorage on mount
  useEffect(() => {
    const savedRoom = localStorage.getItem('currentRoom')
    const savedUser = localStorage.getItem('userName')
    
    if (savedRoom && savedUser) {
      setCurrentRoom(savedRoom)
      setUserName(savedUser)
    }
  }, [])

  const handleJoinRoom = (roomId, name) => {
    setCurrentRoom(roomId)
    setUserName(name)
    
    // Persist to localStorage
    localStorage.setItem('currentRoom', roomId)
    localStorage.setItem('userName', name)
    
    navigate(`/editor/${roomId}`)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setUserName('')
    
    // Clear from localStorage
    localStorage.removeItem('currentRoom')
    localStorage.removeItem('userName')
    
    navigate('/room-join')
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
      </header>
      <main className="app-main">
        <Outlet context={{ handleJoinRoom, currentRoom, userName }} />
      </main>
    </div>
  )
}

export default App
