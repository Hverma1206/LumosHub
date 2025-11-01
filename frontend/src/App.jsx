import { Outlet } from 'react-router-dom'
import './App.css'
import { Analytics } from "@vercel/analytics/next"

function App() {
  return (
    <div className="app-container">
      <Outlet />
      <Analytics />
    </div>
  )
}

export default App
