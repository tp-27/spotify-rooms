import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react'

const KeyForm = ({ onSubmit, status }) => {
    const [friendKey, setKey] = useState('')

    const onInput = (event) => {
        setKey(event.target.value)
    }

    const handleKeySubmit = (e) => {
        e.preventDefault()
        
        if (friendKey === '') {
            alert('Please enter a key')
        } else {
            onSubmit(friendKey)
        }
    }

    const styleStatusMsg = () => {
        let color 

        if (status === 'success') {
            color = 'green'
        } else {
            color = 'red'
        }

        const css = {
            color: color,
            marginLeft: "10px"
        }

        return css
    }

    return (
        <Form style={{ width: "100%" }}>
            <Form.Label>
                Friend's Key 
                {status !== 'none' && 
                    <span style={styleStatusMsg()}>
                      {status}
                    </span>
                }

            </Form.Label>
            <Form.Control 
                type="text"
                onChange={onInput}
                value={friendKey}    
            />
            <Button variant="primary" type="submit" onClick={handleKeySubmit}>
                Submit
            </Button>
        </Form>
    )
}


export default KeyForm