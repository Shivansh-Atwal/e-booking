const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("./cloudConfig");

// ✅ Use Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "wanderlust_DEV",
        allowed_formats: ["jpeg", "png", "jpg"]
    }
});

const upload = multer({ storage }); // ✅ Use this for file uploads

module.exports = upload;
