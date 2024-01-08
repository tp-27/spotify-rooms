import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.min.css"
import { useState, useEffect } from 'react'
import KeyForm from './KeyForm'
import Key from './Key'
import io from 'socket.io-client'

// const socket = io.connect('http://localhost:3001') // url from backend server

const Listen = ({ user, onListen }) => {
    const [listenOpt, setListen] = useState('')
    const [message, setMessage] = useState('')
    const [msgReceived, setMsgRcvd] = useState('')
    const [conn, setConn] = useState('none')
    const [keyContainer, setKeyContainer] = useState(false)
    const [keyForm, showKeyForm] = useState(false)
    const [show, setShow] = useState(false)
    const [room, setRoom] = useState(false)
    const [key, setKey] = useState('')


    // attempt to join a room
    const onSubmit = async (sessionKey) => {
        console.log(sessionKey)

        // check if the key exists in db
        const res = await fetch('http://localhost:3001/join/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionKey: sessionKey,
                user: user
            })
        })

        const connection = await res.json()

        if (connection.status === 'success') { 
            let roomName = connection.room.sessionName
            // socket.emit('join_room', { room: room })
            onListen(sessionKey, roomName) // pass room info back to parent
            setShow(false) // hide modal
        } else {
            setConn('fail')
        }

        console.log(connection)

        // connect client to the session
    }

    // shows the join room form
    const joinRoom = () => {
        if (keyContainer) { // if make room container exists then remove
            setKeyContainer(false) 
        }

        if (!keyForm) { 
            showKeyForm(true)
        }
    }

    // shows the create room form
    const makeRoom = () => {
        if (keyForm) { // if key form from join room exists
            showKeyForm(false) // remove key form
        }

        if (!keyContainer) { // if key not showing show it
            setKeyContainer(true)
        }
    }

    // callback when new room is created
    const newRoom = (key, name) => {
        setKey(key)
        setRoom(name)
        // onListen(key, name)
    }

    const openAuth = async () => {
        try {
            console.log('login');
            const response = await fetch('http://localhost:3001/auth')
            const data = await response.json()
    
            window.location.href = data
            
        } catch (error) {
            console.log('Unable to authenticate Spotify: ' + error);
        }
    }

    const handleClick = (event) => {
        setListen(event.target.getAttribute('data-value'))
        handleOpen() // show modal
    }


    const handleClose = () => {
        setShow(false)

        if (key && room) {
            onListen(key, room)
        }
    }


    const handleOpen = () => setShow(true)

    // const sendMessage = () => {
    //     socket.emit("send_message", { message: "Hello", room }) // emit to back end 
    // }

    // useEffect(() => {
    //     socket.on('receive_message', (data) => {
    //         setMsgRcvd(data.message)
    //     })
    // }, [socket])


    return (
        <div className="listen-select">
            <h1>i want to listen</h1>
            <div className="btn-container">
                <Button size="lg" data-value="alone">alone</Button>
                <Button size="lg" data-value="friend" onClick={handleClick}>with a friend</Button>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Listening Rooms</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Button className="key-btn" size="lg" onClick={joinRoom}>Join room</Button>
                    <Button className="key-btn" size="lg" onClick={makeRoom} id="make">Make room</Button>
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'flex-start' }}>
                    {keyForm && <KeyForm onSubmit={onSubmit} status={conn}/>}
                    {keyContainer && <Key user={user} newRoom={newRoom}/>}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Listen 

