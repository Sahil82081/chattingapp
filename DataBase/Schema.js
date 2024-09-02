const { Schema } = require("mongoose")

const UserScheme = {
    name: String,
    email: String,
    password: String,
    status: [{
        type: Schema.Types.ObjectId,
        ref: "Status"
    }]
}

const Message = {
    message: {
        from: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        text: String,
    },
    time: String
}

const Status_Schema = {
    Userid: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post_url: String,
    caption: String,
    views: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '24h' 
    }
}
module.exports = { UserScheme, Message, Status_Schema }