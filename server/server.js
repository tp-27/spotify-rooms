const express = require('express')
const request = require('request')
const cookieParser = require('cookie-parser')
const querystring = require('querystring')
const crypto = require('crypto');
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')
const Session = require('./models/sessionModel')
const User = require('./models/userModel')
const Token = require('./models/tokenModel');
const { error } = require('console');

const DATABASE_URL = process.env.DATABASE_URL
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3001/callback'
const STATE_KEY = 'spotify_auth_state'
const RESPONSE_TYPE = 'token'

const generateRandomString = (length) => {
    return crypto
    .randomBytes(60)
    .toString('hex')
    .slice(0, length);
}

const app = express()

// middleware   
app.use(cors({
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization'],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: "http://localhost:3000",
    preflightContinue: false,
}));

app.use(express.json())
app.use(cookieParser())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // url for client frontend
        methods: ["GET", "POST"],
    }
})

io.on('connection', (socket) => { // when user connects to socket - run this
    // console.log('User connected: ' + socket.id)

    socket.on('send_message', (data) => { // listen for an event
        console.log(data.room)
       socket.to(data.room).emit('receive_message', data) // emit an event to a specific room
    })

    socket.on('join_room', (data) => {
        console.log("user joined room!")
        console.log(data)
        socket.join(data.room) // join a room
    })

    socket.on('change_song', (data) => { // listen for song change
        console.log(data)
        socket.to(data.room).emit('new_song', data.song) // emit new song to users in room
    })
})

// routes
app.post('/login', async (req, res) => {
    try {
        let isUnique = false

        while (!isUnique) {
            // generate a new userId
            let userId = generateRandomString(16)
        
            // check if it already exsits in the db
            const user = await User.findOne({
                "userId": userId
            })

            if (!user) { // no existing user with that id
                isUnique = true 

                const data = {
                    "userId": userId,
                    "name": req.body.name,
                }
                await User.create(data) // add user to db
                
                console.log('Created userId: ' + userId)
                res.cookie('userId', userId, {
                    maxAge: 360000,
                    httpOnly: false, // accessible on by web server
                    secure: false, // snt over HTTPS only
                    sameSite: 'Lax',
                    path: '/'
                })

                res.status(200).json({ message: 'Success', userId: userId }) // send key to user
            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.post('/verify', async (req, res) => {
    let userId = req.body.userId 
    let message = 'Active token found'
    let verifiable = true
    console.log('Verifying userId: ' + userId)

    try {
        if (userId === null) {
            message = 'User Id doesn\'t exist'
            verifiable = false
            throw new Error(message)
        } 

        const user = await User.findOne({ userId: userId })
        if (!user) {
            message = 'Could not find user'
            verifiable = false
            throw new Error(message)
        }

        if (!user.accessToken) {
            verifiable = false
            throw new Error('Access token doesn\'t exist')
        }

        const token = await Token.findOne({ accessToken: user.accessToken })
        if (!token) {
            message = 'Access token not found'
            verifiable = false
            throw new Error(message)
        }

        const tokenStatus = token.status
        if (!tokenStatus) { 
            message = 'Token found but expired'
            throw new Error(message)
        }

        res.status(200).json({ verifiable: verifiable, message: message}) // found 
    } catch (error) {
        console.log(error)
        res.status(200).json({ verifiable: false, message: 'Could not verify: ' + error})
    }
})

app.get('/callback', (req, res) => {
    // callback requests refresh and access tokens
    var code = req.query.code

    var authOpts = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        },
        headers: {
            'content_type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
        json: true
    }

    request.post(authOpts, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const accessToken = body.access_token
            const refreshToken = body.refresh_token
            
            // const options = {
            //     url: 'https://api.spotify.com/v1/me',
            //     headers: { 'Authorization': 'Bearer ' + accessToken},
            //     json: true
            // }

            // store the access token for the given userId
            try {
                const filter = { userId: req.cookies['userId'] }
                const update = { accessToken: accessToken}
                const options = { new: true }

                await User.findOneAndUpdate(filter, update, options) // update user db w/ access token
            } catch (error) {
                res.status(200).json({ message: 'Unable to authorize with Spotify' })
            }

            res.redirect('http://localhost:3000/')
        } else {
            res.redirect('/#' + 
            querystring.stringify({
                error: 'invalid_token'
            }))
        }
    })
})

// returns the users in a session
app.post('/friends/', async (req, res) => {
    try {
        const session = await Session.findOne({
            "sessionKey": req.body.sessionKey
        })

        if (session) { // session exists
            res.status(200).json(session.sessionUsers)
        } else { 
            res.status(200).json({status: 'fail', message: "This room doesn't exist"})
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

// adds new user to a session if it exists
app.post('/join/', async (req, res) => {
    try {
        const session = await Session.findOne({
            "sessionKey": req.body.sessionKey
        })

        console.log(req.body.sessionKey)
        if (session) { // session exists
            const filter = { sessionKey: req.body.sessionKey } // look for room with the key
            const update = { $push: { sessionUsers: req.body.user }} // add new user to the room
            const options = { new: true } // get the updated document

            // const updSession = await Session.updateOne(filter, update) // update the session model
            const updSession = await Session.findOneAndUpdate(filter, update, options) 

            res.status(200).json({room: updSession, status: 'success', message: "You have joined the room"})
        } else { 
            res.status(200).json({status: 'fail', message: "This room doesn't exist"})
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

// give new key to client
app.post('/key/', async (req, res) => {
    try {
        let isUnique = false

        while (!isUnique) {
            // generate a new key
            let newKey = generate_key()
        
            // check if this key already exsits in the db
            const session = await Session.findOne({
                "sessionKey": req.body.sessionKey
            })

            if (!session) { // no existing session with that key
                const data = {
                    "sessionKey": newKey,
                    "sessionName": req.body.sessionName,
                    "sessionUsers": req.body.sessionUser
                }

                const newRoom = await Session.create(data) // add session to db
                isUnique = true 
                res.status(200).json(newRoom) // send key to user
            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

// generate new key
var generate_key = function() {
    return crypto.randomBytes(16).toString('base64');
};

mongoose.connect(DATABASE_URL)
.then(() => {
    console.log('Connected to MongoDB')
    server.listen(3001, () => {
        console.log('SERVER IS RUNNING')
    })
}).catch((error) => {
    console.log(error)
})