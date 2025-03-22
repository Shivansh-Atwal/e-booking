const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV',
        allowed_formats: ["jpeg", "png", "jpg"]
    },
});

module.exports = { cloudinary,storage, };


const upload = multer({ 
    storage: multer.memoryStorage() // Store files in memory
  });
  

  // Route to handle image upload
  router.post('/upload', upload.single('listing[image]'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "wanderlust_DEV",
          upload_preset: "wanderlust_unsigned"  // Add the preset name here
        },
        (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
  
          res.status(200).json({ 
            message: "File uploaded successfully", 
            imageUrl: result.secure_url 
          });
        }
      );
  
      // Convert buffer to stream and pipe it to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });