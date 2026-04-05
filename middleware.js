const Video= require("./models/videos");
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
        return res.redirect(`/show/${id}`);
    }
    next();
}