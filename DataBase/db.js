const mongoose = require('mongoose')
require('dotenv').config()
const { UserScheme, Message,Status_Schema } = require('./Schema')


mongoose.connect(process.env.Mongodb_Password).then(() => {
    console.log("Connected to DataBase")
})

const User = mongoose.model('User', UserScheme)
const Chat = mongoose.model('Chat', Message)
const Status = mongoose.model('Status', Status_Schema)

module.exports = { User, Chat,Status }