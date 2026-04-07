const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const Comment= require("./comments")
let videoSchema= new Schema({
    title:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    thumbnail:{
        url:String,
        filename:String,
    },
    video:{
        url:String,
        filename:String,
    },
    comments:[{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
    
},{timestamps:true});

//mongoose post middleware for comment deletions
videoSchema.post("findOneAndDelete",async(post)=>{  
    console.log("Post Triggered");
    if(post){
        let res= await Comment.deleteMany({_id:{$in:post.comments}});
        console.log(res);
    }
})

module.exports= mongoose.model("Video",videoSchema);