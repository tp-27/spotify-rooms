import RoomHeader from './RoomHeader'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Spotify } from 'react-spotify-embed'
import { useEffect, useState } from 'react';
import '../index.css'
import io from 'socket.io-client'
import KeyContainer from './KeyContainer';

const socket = io.connect('http://localhost:3001') // url from backend server

const Room = ({ roomKey, name }) => {
    const tracks = [
            "https://open.spotify.com/track/5ihDGnhQgMA0F0tk9fNLlA?si=4472348a63dd4f84",
            "https://open.spotify.com/track/6HfOzLLjsaXsehIFEsrxTk",
            "https://open.spotify.com/track/5ihDGnhQgMA0F0tk9fNLlA?si=4472348a63dd4f83"
    ]
    const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search'
    const [track, setTrack] = useState(tracks[0])
    const [wall, setWall] = useState('bg1.jpg')
    const [users, setUsers] = useState([])

    const [query, setQuery] = useState('')
    const [queryType, setType] = useState('Song')
    let accessToken = localStorage.getItem('token')

    
    // useEffect(() => { // get this object from API call in object
    //     console.log(key)

    //     const getFriends = async () => {
    //         try {
    //             const res = await fetch('http://localhost:3001/friends/' , {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     sessionKey: key
    //                 })
    //             })
    
    //             const users = await res.json()
    //             setUsers(users)
    //             console.log(users)
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }

    //     getFriends()
    // }, [key])

    const onInput = (e) => {
        setQuery(e.target.value)
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        const input = (query).split('by')
        const track = input[0].trim()
        const artist = input[1].trim()    
        const searchQuery = `${SEARCH_ENDPOINT}?q=track%253A${track}%2520artist%253A${artist}&type=track`
        
        try {
            const res = await fetch(searchQuery, {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            })

            const data = await res.json()
            
            console.log(data)
            const items = data.tracks.items
            const tracks = []

            items.forEach((item) => {
                tracks.push( {
                    url: item.external_urls.spotify,
                    name: item.name,
                    artists: item.artists.map(artist => artist.name)    
                })
            })

            setTrack(items[0].url)

        } catch (error) {
            console.log(error)
        }

    }

    const generateSong = () => {
        let randTrack = getRandomNumberInRange()
        console.log(randTrack)
        setTrack(tracks[randTrack])
        socket.emit('change_song', { song: tracks[randTrack], room: roomKey })
    }

    const getRandomNumberInRange = () => {
        return Math.floor(Math.random() * ((tracks.length - 1) - 0 + 1)) + 0;
    }

    const changeType = (e) => {
        setType(e.target.textContent)
    }

    // const backgroundStyle = {
    //     backgroundImage: 'bg1.jpg',
    // }

    useEffect(() => { // run this whenever socket changes (receives events)
        socket.on('new_song', (data) => { 
            setTrack(data)
        })
    }, [socket]) 
    
    useEffect(() => { // run this only on initial render
        socket.emit('join_room', { room: roomKey })
    }, [])

    return (
        <div className="room">
            <div className="room-header">
                <RoomHeader name={name}/>
                <KeyContainer roomKey={roomKey}/>
            </div>

            <div className="room-body">
                <p>Search for a song (in the format)</p>
                <Form className="search-form" onSubmit={handleSearch}> 
                    <Form.Control type="text" onInput={onInput} placeholder='Trophies by Drake'/>
                    <DropdownButton id="dropdown-basic-button" title={queryType}>
                        <Dropdown.Item onClick={changeType}>Song</Dropdown.Item>
                        <Dropdown.Item onClick={changeType}>Album</Dropdown.Item>
                        <Dropdown.Item onClick={changeType}>Artist</Dropdown.Item>
                        <Dropdown.Item onClick={changeType}>Playlist</Dropdown.Item>
                    </DropdownButton>
                </Form> 
                {/* <Button className="random-btn" onClick={generateSong}>Change song</Button> */}
            </div>
            
        
            <Spotify link={track} />

            {/* <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                friends
                </Dropdown.Toggle>
        
                <Dropdown.Menu>
                    {users.map((user, index) => {
                        return <Dropdown.Item key={index}>{user}</Dropdown.Item>;
                    })}
                </Dropdown.Menu>
            </Dropdown>  */}
        </div>
       
    )
}

export default Room