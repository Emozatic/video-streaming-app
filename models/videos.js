const mongoose= require("mongoose");
const Schema= mongoose.Schema;

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
    
},{timestamps:true});

module.exports= mongoose.model("Video",videoSchema);