const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    image:{
        url :String,
        filename:String,
    },
    price:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        require:true,
    },
    country:{
        type:String,
        require:true,
    },
    reviews: [
        {
        type :Schema.Types.ObjectId,
        ref : "Review" 
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref: "User",
    },
    category:{
        type:String,
        enum:["Trending","Rooms","Amazing Pools","Castles","Iconic cities","Mountains","Beachfront","Camper Vans","Farms","Domes","Boat House"],
    }
});

listingSchema.post("findOneAndDelete",async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;