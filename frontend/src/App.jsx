import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import Auth from './pages/Auth'
import { AuthProvider } from './contexts/AuthContext'
import VideoCall from './pages/VideoCall'
import Home from './pages/homePage/Home'
import History from './pages/History'

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />}></Route>
            <Route path='/auth' element={<Auth />}></Route>
            <Route path='/home' element={<Home />}></Route>
            <Route path='/history' element={<History />}></Route>
            <Route path='/:url' element={<VideoCall />}></Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
