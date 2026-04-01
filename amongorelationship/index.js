const mongoose= require("mongoose")

main()
.then(()=>{console.log("connected to DB")})
.catch((err)=>{console.log(err)});

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/realtionPractise');
}

//Create Schema
const relationSchema= new mongoose.Schema({
    username:String,
    address:[{
        location:String,
        city:String
    }]
})

const Relation= mongoose.model("Relation",relationSchema);
//one to one
// const addUsers= async()=>{
//     let user1= new Relation({
//         username:"Lucky",
//         address:[{
//             location:"Haryana",
//             city:"Kalka",
//         }]
//     })
//     user1.address.push({location:"Himachal",city:"Parwanoo"})
//     user1.address.push({location:"Bihar",city:"Gopalganj"})
//     await user1.save().then((res)=>{console.log(res)});
// }
// addUsers();


const userSchema= new mongoose.Schema({
    name:String,
})
const User= mongoose.model("User",userSchema);

const videoSchema= new mongoose.Schema({
    title:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})
const Video= mongoose.model("Video",videoSchema);

const user= async()=>{
    let user1= await User.create({
        name:"Lucky"
    })
}

