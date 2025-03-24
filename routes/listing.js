process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const listingController = require("../controllers/listings.js");
const Review = require("../models/review.js");
const {isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const upload = multer({ 
  storage: multer.memoryStorage() // Store files in memory
});

const Listing = require("../models/listing.js")
// const upload = require("../multer.js"); // Import the corrected multer setup

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

//index and create
router
.route("/")
.get(wrapAsync(listingController.index))


.post(isLoggedIn,upload.single('listing[image]'), async (req, res) => {
  const newListing = new Listing(req.body.listing);

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "wanderlust_DEV",
          upload_preset: "wanderlust_unsigne",  // Add the preset name here
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
            let url = result.secure_url;
            let filename = result.original_filename;
            // newListing.owner = req.user._id;
            newListing.image = { url, filename };
            newListing.owner = req.user._id;

            console.log(newListing);
            console.log(url,filename);
            await newListing.save();
          res.status(200).redirect("/listings");
          
          
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });



//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);


//show,update and delete
router
.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,
    upload.single("listing[image]"),validateListing,
    wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(listingController.editListing));

//book route
router.get("/:id/book",isLoggedIn,
    wrapAsync(listingController.bookListing));


router.get("listing/test",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate: {
            path:"author",
        },
    })
    .populate("owner");
    res.render("listings/test.ejs");
}) 

// router.get("/:id/book", (req, res) => {
//     let {id} = req.params;
//     const listing = Listing.findById(id);
//     const { checkin, checkout } = req.body;
    
//     // Convert dates from string to Date object
//     const checkInDate = new Date(checkin);
//     const checkOutDate = new Date(checkout);

//     // Validate dates
//     if (!checkin || !checkout || checkOutDate <= checkInDate) {
//         return res.status(400).send("Invalid dates. Check-out must be after Check-in.");
//     }

//     // Calculate number of nights
//     const nights = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

//     // Fetch listing price (Mocked here, but should come from DB)
//     const listingPrice = listing.price; // Example price per night

//     // Calculate total price
//     const totalCost = nights * listingPrice;

//     // Send response (you can modify this to render a page instead)
//     res.send("hello");
// });
module.exports = router;