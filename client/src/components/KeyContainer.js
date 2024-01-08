import '../index.css'
import CopyButton from './CopyButton';
import { useState, useRef } from 'react'

const KeyContainer = ({ roomKey }) => {
    const [copy, setCopy] = useState(false)
    const keyRef = useRef()

    const keyDivStyle = {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
    }

    const copyToClipboard = () => {
        const key = keyRef.current.innerText // Get the text content of the paragraph
        navigator.clipboard.writeText(key) // Use Clipboard API to copy text
            .then(() => {
                console.log('Text copied to clipboard')
                console.log(key)
            })
            .catch(err => {
                console.error('Failed to copy text: ', err)
            })
    }

    return (
        <>
        {/* <p>Key:</p> */}
        <div className="new-key-container"></div>
            <div className="new-key-container" style={keyDivStyle}>
            <div className="key-container">
                <p ref={keyRef}>{roomKey}</p>
            </div>
            <CopyButton onClick={() => copyToClipboard()} showCopied={copy} />
        </div>
        </>
    )
}

export default KeyContainer