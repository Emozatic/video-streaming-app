const mongoose= require("mongoose");
const {Schema}= mongoose;

const commentSchema= new Schema({
    comment:String,
    createdAt:{
        type:Date,
        default:Date.now(),
    }
})

const Comment= mongoose.model("Comment",commentSchema);
module.exports=Comment;