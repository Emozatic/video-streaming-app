const mongoose=require("mongoose");
const {Schema}= mongoose;
const Video= require("../models/videos");
const Comment= require("../models/comments")
const User= require("../models/user");


//index route
module.exports.index= async(req,res)=>{
    let allVideos=await Video.find({});
    res.render("home.ejs",{allVideos});
}

//new route
module.exports.new= async(req,res)=>{
  res.render("new.ejs");   
}

//post for new/upload
module.exports.postUpload=async(req,res)=>{
    console.log(req.file);
    if(!req.file){
        req.flash("error","Please upload a video");
        return res.redirect("/home");
    }

    const thumbnailFile= req.files.thumbnail[0];
    const videoFile= req.files.video[0];

    const thumbnailResult= await cloudinary.uploader.upload(thumbnailFile.path);
    const videoResult= await cloudinary.uploader.upload(videoFile.path, {resource_type: "video"});

    let newVideo= new Video(req.body.new);

    newVideo.thumbnail={
        url: thumbnailResult.secure_url,
        filename: thumbnailResult.public_id,
    };

    newVideo.video={
        url: videoResult.secure_url,
        filename: videoResult.public_id,
    }
    newVideo.owner= req.user._id;

    const savedVideo= await newVideo.save();
    console.log(savedVideo);
    
    req.flash("success","New Video Uploaded");
    res.redirect("/home");
}


//show route
module.exports.show=async(req,res)=>{
    
        let{id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            req.flash("error","Video not found");
            return res.redirect("/home")
        }
        let allVideos=await Video.find({});
        let showVideo= await Video.findById(id).populate("comments");
        if(!showVideo){
            req.flash("error","Video not found");
            return res.redirect("/home");
        }
        res.render("show.ejs",{showVideo, allVideos});
}



//edit route
module.exports.edit= async(req,res)=>{
      let {id}= req.params;
       let videoDetails= await Video.findById(id);
       if(!videoDetails){
        throw new ExpressError("Video not found",404);
       };
        res.render("edit.ejs",{videoDetails});
}

//put for edit
module.exports.putEdit=async(req,res)=>{
        let {id}= req.params;
        let updated=await Video.findByIdAndUpdate(id,{...req.body.edit});
        console.log(updated);
        req.flash("success","Video Updated");
        res.redirect("/home");
}

//destroy route
module.exports.destroy= async(req,res)=>{
    let {id}= req.params;
    let deletedVideo= await Video.findByIdAndDelete(id);
    console.log(deletedVideo);
    req.flash("success","Video Deleted");
    res.redirect("/home");
}


//comment route
module.exports.comment=async(req,res)=>{
        let {id}= req.params;
        let video= await Video.findById(id).populate({path:"comments", populate:{path:"author", model:"User"}});;
        let newComment= new Comment({comment: req.body.comments});
        newComment.author= req.user.id;
        console.log(video.comments);
        video.comments.push(newComment);
        await newComment.save();
        await video.save();
        req.flash("success","Comment Added");
        res.redirect(`/home/${id}`);
}


//delete comment
module.exports.deleteComment= async(req,res)=>{
     let {id, commentId}= req.params;
    let video= await Video.findById(id);
    video.comments.pull({_id: commentId});
    await video.save();
    req.flash("success","Comment Deleted");
    res.redirect(`/home/${id}`);
}