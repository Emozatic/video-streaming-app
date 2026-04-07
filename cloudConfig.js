const cloudinary= require("cloudinary").v2;
const{CloudinaryStorage}= require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage= new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:"streamhub-DEV",
        resource_type:"auto",
        allowed_formats:['png', 'jpg', 'jpeg'],
        upload_preset: process.env.CLOUD_UPLOAD_PRESET
    }
});

module.exports= {cloudinary, storage}