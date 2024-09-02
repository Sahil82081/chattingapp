const express = require("express")
const app = express()
const { createServer } = require('http')
const server = createServer(app)
const socket = require("socket.io")
const route = require('../routes/apiroutes')
const cors = require('cors')

require('dotenv').config();


const corsOptions = {
    origin: process.env.DOMAIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length'],
    credentials: true
};


app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', route)

const io = socket(server, {
    cors: process.env.DOMAIN
})

const onlineusers = new Map()

io.on('connection', (socket) => {

    socket.on('msg-send', ({ id, text,time }) => {
        const chat_id = onlineusers.get(id)
        if (chat_id) {
            socket.to(chat_id).emit("receive-msg", {text,time})
        }

    })
    
    socket.on('save-user', (data) => {
        onlineusers.set(data, socket.id)
        io.emit('online-users', Array.from(onlineusers.keys()));
    })

    socket.on("Calling", ({ id, offer }) => {
        const userSocket = onlineusers.get(id)
        for (const [userid, socketID] of onlineusers.entries()) {
            if (socket.id == socketID) {
                socket.to(userSocket).emit("Incomming-Calling", { offer, userid })
            }
        }
    })

    socket.on("InCall-Accepted", ({ Ansoffer, userid }) => {
        const userSocket = onlineusers.get(userid)
        socket.to(userSocket).emit("Call-Accepted", Ansoffer)
    })

    socket.on('disconnect', () => {
        
        for (const [userid, socketID] of onlineusers.entries()) {
            if (socket.id == socketID) {
                onlineusers.delete(userid)
            }
        }
        io.emit('online-users', Array.from(onlineusers.keys()));
    })
})

app.get('/', (req, res) => {
    res.send("Hello")
})

server.listen(8000, () => {
    console.log('Server was Started')
})