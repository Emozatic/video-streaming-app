const mongoose = require("mongoose");
const Video = require("../models/videos");
let data= require("./data");


async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/youtube');

}

main()
.then(()=>{console.log("connected to db")})
.catch((err)=>{console.log(err)});

const initDB= async()=>{
    await Video.deleteMany({});
    data= data.map((obj)=>({
        ...obj,owner:"69d11fd71c28899958b10dc7"
    }))
    await Video.insertMany(data);
}
initDB()
.then(()=>{console.log("DB Initialized")})
.catch((err)=>{console.log(err)});