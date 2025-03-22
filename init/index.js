const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
.then(()=>{
    console.log("Hello from database");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
   await mongoose.connect("mongodb+srv://Shivansh:S9816003623@shop.shfyv.mongodb.net/wanderlust")
}

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner: "67d131b04298b37c61632a9a"}));
    initData.data = initData.data.map((obj)=>({...obj,category:"Rooms"}));
    await Listing.insertMany(initData.data);

    console.log("Data was intialised");
};

initDB();