import Listen from './components/Listen'
import User from './components/User'
import Room from './components/Room'
import SpotifyPlayer from './components/SpotifyPlayer'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react'
import { Spotify } from 'react-spotify-embed'
import './index.css'


function App() {
    const [user, setUser] = useState('')
    const [name, setName] = useState('')
    const [listening, setListen] = useState(false) 
    const [room, setRoom] = useState('')
    const [key, setKey] = useState('')
    const [auth, setAuth] = useState(false)

    // Get the user's name and initiate authentification
    const onSubmit = async (e, name) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:3001/login', {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name: name })
            })   
            
            const data = await res.json()
            console.log(data)
            if (data.message === 'Success') {
                localStorage.setItem('userId', data.userId)
                localStorage.setItem('auth', true)
                localStorage.setItem('name', name)
                window.location.href = data.url
                setAuth(true)
                setName(name)
            }
            // if (data.message === 'Success') {
            //     localStorage.setItem('userId', data.userId)
            //     setGetUserName(false) // don't need to get user's name
            // } else {
            //     alert('Please authenticate to use this application.')
            //     setGetUserName(true)
            // }

        } catch (error) {
            console.log('Unable to start listening: ' + error)
        }
    }

    const onListen = (sessionKey, roomName) => {
        setKey(sessionKey)
        setRoom(roomName)
        console.log("Listening in room: " + roomName + sessionKey)
        setListen(true)
    }

    useEffect(() => {
        const auth = localStorage.getItem('auth')
        const name = localStorage.getItem('name')

        setAuth(auth)        
        setName(name)
    })

    // const logout = () => {
    //     setToken('') 
    //     window.localStorage.removeItem('token') // remove token from local storage
    // }

    return (
        <div className="container">                
            <div className="content-body">
                { !name && <User onSubmit={onSubmit}/> }
                { auth && <Listen user={name} onListen={onListen} / >}



            </div>
            
        </div>

    )
}

export default App
