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
    const [getUser, setGetUser] = useState(true)
    const [listening, setListen] = useState(false) 
    const [room, setRoom] = useState('')
    const [key, setKey] = useState('')
    const [auth, setAuth] = useState(false)

    // Get the user's name and initiate authentification
    const onSubmit = async (e, name) => {
        e.preventDefault()
        setUser(name)

        try {
            const res = await fetch('http://localhost:3001/listen', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name
                })
            })   
            
            const data = await res.json()
            if (data.message === 'Success') {
                localStorage.setItem('userId', data.userId)
                setGetUser(false)
            } else {
                alert('Please authenticate to use this application.')
                setGetUser(true)
            }

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
        const verifyAuth = async () => {
            try {   
                const res = await fetch('http://localhost:3001/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem('userId')
                    })
                })
                const data = await res.json()

                console.log(data)
                if (data.verifiable) {
                    setAuth(true)
                }
            } catch (error) {
                console.log(error)
            }
        }

        if (!getUser) {
            verifyAuth() // if we have already set the user's cookie 
        }
        
    }, [getUser])

    // const openAuth = async () => {
    //     try {
    //         console.log('login');
    //         const response = await fetch('http://localhost:3001/login')
    //         const data = await response.json()
    //         console.log(data)

    //         // window.location.href = data
    //     } catch (error) {
    //         console.log('Unable to authenticate Spotify: ' + error);
    //     }
    // }

    // const logout = () => {
    //     setToken('') 
    //     window.localStorage.removeItem('token') // remove token from local storage
    // }

    return (
        <div className="container">
            {/* <div className="nav">
                {!token ?
                    <Button onClick={openAuth}>Login</Button> :
                    <Button className='logout' onClick={logout}>Logout</Button>
                }
            </div> */}
                
            <div className="content-body">
                { getUser ?
                    <User onSubmit={onSubmit}/> : <Listen user={user} onListen={onListen} / >
                }       

                { auth &&  <h1>Authenticated</h1>}

                {/* { (auth && !getUser) &&   } */}
                {/* { auth && <Room roomKey={key} name={room}/>}    */}
                {/* <Room roomKey={key} name={room} /> */}
            </div>
            
        </div>

    );
}

export default App
