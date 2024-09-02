const db = require('../DataBase/db.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs')
const Cloudinary_upload = require('../Utility/cloudinary.js')


module.exports.signup = async (req, res) => {
    const data = req.body
    try {
        const hashpassword = await bcrypt.hash(data.password, 10)
        data.password = hashpassword
        const usersaved = await db.User(data).save()
        const token = await jwt.sign({ id: usersaved._id }, process.env.SECRET_KEY)
        res.json({
            message: "Successfully Register",
            token
        })

    } catch (error) {
        console.log(error)
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const userexist = await db.User.findOne({ email })
        if (userexist) {
            const result = await bcrypt.compare(password, userexist.password)
            if (result) {
                const token = await jwt.sign({ id: userexist._id }, process.env.SECRET_KEY)
                res.json({
                    message: "Successfully Login",
                    token
                })
            } else {
                res.status(404).json({ error: "Enter Valid Email and Password" });
            }
        }
        else {
            res.status(404).json({ error: "Enter Valid Email and Password" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something Went Wrong" });
    }
}

module.exports.get_users = async (req, res) => {
    try {
        const { id } = req.user
        const username = await db.User.findById(id).select('name')
        const chat_users = await db.Chat.find({
            $or: [
                { 'message.from': id },
                { 'message.to': id }
            ]
        })

        if (chat_users.length == 0) {
            return res.status(200).json({
                username, id, all_user: []
            })
        }

        let all_ids = []
        const handlechat = new Promise((resolve, reject) => {
            const unique_ids = new Set()

            chat_users.map((user) => {
                let to = ''
                if (user.message.from.toString() === id) {
                    to = user.message.to.toString()
                }
                else {
                    to = user.message.from.toString()
                }
                if (!unique_ids.has(to)) {
                    unique_ids.add(to)
                }

            })
            unique_ids.forEach((user) => {
                all_ids.push({ '_id': user })
            })
            resolve(all_ids)
        })

        let all_user
        handlechat.then((data) => {
            const fetch = async (data) => {
                try {
                    all_user = await db.User.find({
                        $or: data
                    }).select('name')
                    res.json({ username, id, all_user })
                } catch (error) {
                    console.log(error)
                }
            }
            fetch(data)
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something Went Wrong" });
    }
}

module.exports.get_all_chat = async (req, res) => {
    try {
        const { id } = req.user
        const data = req.params.id

        const { name } = await db.User.findById(data).select('name')
        const chats = await db.Chat.find({
            $or: [
                { $and: [{ 'message.from': id }, { 'message.to': data }] },
                { $and: [{ 'message.from': data }, { 'message.to': id }] }
            ]
        });
        res.status(200).json({
            id, name, chats
        })

    } catch (error) {
        console.log(error)
    }
}

module.exports.save_msg = async (req, res) => {
    try {
        const msg = req.body
        const { id } = req.user
        const data = {
            message: {
                from: id,
                to: msg.id,
                text: msg.text
            },
            time: msg.time
        }
        await db.Chat(data).save()
        res.status(200).json({
            message: "Send Successfully"
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports.search_user = async (req, res) => {
    try {
        const { search } = req.body
        const search_user = await db.User.find({
            name: { $regex: search, $options: 'i' }
        }).select('name')
        console.log(search_user)
        res.status(200).json({
            search_user
        })
    } catch (error) {
        res.status(500).json({
            meg: "Internal Server Error"
        })
        console.log(error)
    }

}

module.exports.uploadStatus = async (req, res) => {
    try {
        const file = req.file
        const { caption } = req.body
        const status_data = await Cloudinary_upload(file.path)
        const Status = {
            Userid: req.user.id,
            post_url: status_data,
            caption,
        }
        const { _id } = await db.Status(Status).save()
        await db.User.findByIdAndUpdate(req.user.id, {
            $push: {
                status: _id
            }
        })
        fs.unlinkSync(file.path)
        res.status(200).json({
            message: "Successfully Updated"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.get_status = async (req, res) => {
    try {
        const data = req.body
        const other_status = await db.User.find({
            _id: data
        }).select('name status').populate('status')
        const userstatus = await db.User.findById(req.user.id).select('status').populate('status')
        res.status(200).json({
            other_status, userstatus
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports.deletestatus = async (req, res) => {
    try {
        const { statusid } = req.body
        const data = await db.Status.findByIdAndDelete(statusid)
        res.json({
            msg: "Deleted Succesfully"
        })
    } catch (error) {
        console.log(error)
    }
}