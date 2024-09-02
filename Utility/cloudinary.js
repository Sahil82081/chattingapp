
const { v2 } = require('cloudinary')
const cloudinary = v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const Cloudinary_upload = async (localpath) => {
    try {
        if (!localpath) {
            return null
        }
        const res = await cloudinary.uploader.upload(localpath,
            { resource_type: 'auto' })
        return res.url;
    } catch (error) {
        console.log(error)
    }
}
module.exports = Cloudinary_upload