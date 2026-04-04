module.exports.isloggedIn= (req,res,next)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error", "you must be logged- In");
        return res.redirect("/login");
    }
    next();
}