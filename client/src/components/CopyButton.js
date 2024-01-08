import Button from 'react-bootstrap/Button'
import { useEffect, useState } from 'react'

const CopyButton = ({ onClick , showCopied }) => {
    const [copy, setCopy] = useState(false)

    useEffect(() => {
        let timer;

        if (showCopied) { // user clicked copy button
            setCopy(true)

            timer = setTimeout(() => {
                setCopy(false)
            }, 2000); // 3000 milliseconds = 3 seconds

            return () => clearTimeout(timer);
        }
    }, [showCopied])



    return (
        <Button variant={copy ? 'success' : 'primary'}onClick={onClick}>Copy</Button>
    )   
}

export default CopyButton