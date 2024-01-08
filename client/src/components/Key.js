import { useState, useRef } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import KeyContainer from './KeyContainer'
import '../index.css';

const Key = ({ user, newRoom }) => {
    const [key, setKey] = useState('')
    const [room, setRoom] = useState('')

    const getKey = async (e) => {
        // get room name
        if (room === '') {
            alert('Please enter a room name')
            return
        } 

        // get a new key from server
        const newSession = await fetch('http://localhost:3001/key/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionUser: [user],
                sessionName: room 
            })
        })

        const newKey = await newSession.json()
        console.log(newKey)
        setKey(newKey.sessionKey) // set the new key
        newRoom(newKey.sessionKey, newKey.sessionName) // pass key back to parent
    }

    const onInput = (e) => {
        setRoom(e.target.value)
    }

    return (
        <>
            {!key ? 
                <Form style={{ width: "100%" }}> 
                    <Form.Label>Name:</Form.Label>
                    <Form.Control type="text" onChange={onInput} value={room} />
                    <Button variant="primary" type="submit" onClick={getKey}>
                        Submit
                    </Button>
                </Form> :
                <>
                    <KeyContainer roomKey={key}/>
                </>
            } 
        </>
    )
}

export default Key