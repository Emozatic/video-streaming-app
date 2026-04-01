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
    thumbnail:String,
    video:{
        url:String,
    },
    comments:[{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }]
    
},{timestamps:true});

module.exports= mongoose.model("Video",videoSchema);