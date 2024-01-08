import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'
import '../index.css'

const User = ({ onSubmit }) => {
    const [submit, setSubmit] = useState(false)
    const [name, setName] = useState('')

    const onInput = (e) => {
        e.preventDefault()

        if (e.target.value != '') {
            setSubmit(true)
            setName(e.target.value)
        } else {
            setSubmit(false)
        }
    }

    const handleOnSubmit = (e) => {
        e.preventDefault()
        console.log(name)
        onSubmit(e, name)
    }

    return (
        <div className="user">
            <h1>hey there</h1>
            <Form style={{ display: "flex" }}>
                <Form.Control 
                    type="text"
                    placeholder="name"    
                    onInput={onInput}
                />
                {submit && 
                    <Button 
                        variant="primary" 
                        type="submit" 
                        style={{ marginLeft: "10px" }}
                        onClick={handleOnSubmit}
                    >
                        Submit
                    </Button>
                }
              
            </Form>  
        </div>
    )
}

export default User