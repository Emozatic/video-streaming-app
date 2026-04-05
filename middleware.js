const Video= require("./models/videos");
const Comment= require("./models/comments");
module.exports.isloggedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error", "you must be logged- In");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner=async (req,res,next)=>{
    let{id}= req.params;
    let video= await Video.findById(id);
    if(!video.owner.equals(res.locals.currUser._id)){
        req.flash("error", "you don't have permission");
        return res.redirect(`/home/${id}`);
    }
    next();
}

module.exports.isCommentOwner=async (req,res,next)=>{
    let {id, commentId}= req.params;
    let comment= await Comment.findById(commentId);
    if(!comment.author.equals(res.locals.currUser._id)){
        req.flash("error", "you don't do that");
        return res.redirect(`/home/${id}`)
    }
next();
}

