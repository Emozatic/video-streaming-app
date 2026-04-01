const mongoose= require("mongoose");
const {Schema}= mongoose;

main()
.then(()=>{console.log("connected to mongodb")})
.catch((err)=>{console.log(err)})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/realtionPractise3');
}

const userSchema= new Schema({
    name:String,
    email:String,
})

const postSchema= new Schema({
    title:String,
    likes:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

const User= mongoose.model("User",userSchema);
const Post= mongoose.model("Post",postSchema);

const addDetails=async()=>{
    let user= await User.findOne({username:"Lucky"});

    let post2= new Post({
        title:"Next",
        likes:1000       
    });
    post2.user=user;
    //await user1.save().then((res)=>{console.log(res)});
    await post2.save().then((res)=>{console.log(res)});
}
addDetails();