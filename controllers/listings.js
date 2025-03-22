const Listing = require("../models/listing.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const storage = multer.memoryStorage();
const upload = multer({storage:storage});


module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs"); 
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate: {
            path:"author",
        },
    })
    .populate("owner");
    if(!listing) {
        req.flash("error","Listing Does'nt Exits !");
        res.redirect("/listings")
    }
    console.log(listing);
    res.render("listings/test.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    
    
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
            let url = result.secure_url;
            let filename = result.original_filename;
            const listing = new Listing(req.body.listing);
            newListing.owner = req.user._id;
            newListing.image = { url,filename};
            
            req.flash("success", "New Listing Created successfully!");
            res.redirect("/listings");
            }
          );
      
          // Convert buffer to stream and pipe it to Cloudinary
          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        } catch (error) {
          res.status(500).json({ error: "Server error" });
        }
        await newListing.save();
    };


module.exports.editListing = async (req,res,next)=>{
    
        let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error","Listing Does'nt Exits !");
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{listing});
    
};

module.exports.updateListing =async (req,res,next)=>{
    let {id} = req.params;
    let listing =  await Listing.findByIdAndUpdate(id,{...req.body.listing});

    // if(typeof req.file != "undefined") {
    //     let url = req.file.path;
    //     let filename = req.file.filename;
    //     listing.image = {url ,filename};
    //     await listing.save();
    // }
    if(typeof req.file != "undefined") {
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
        let url = result.secure_url;
        let filename = result.original_filename;
        const listing = new Listing(req.body.listing);
        listing.image = { url,filename};
        }    
      );
    }

     req.flash("success"," Listing Updatedsuccessfully !");
     res.redirect(`/listings/${id}`);  

};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted successfully !");
    res.redirect("/listings");
}

module.exports.bookListing = async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate: {
            path:"author",
        },
    })
    .populate("owner");
    res.render("listings/test.ejs",{listing})

}