const jwt = require('jsonwebtoken')

module.exports.userauth = async (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.status(401).json({
                error: "User is not Registered"
            })
        }
        jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
            if (error) {
                return res.status(404).json({
                    error: "Invalid Token"
                })
            }
            if (decoded) {
                req.user = decoded
                next()
            }
        })
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}