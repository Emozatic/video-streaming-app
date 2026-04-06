require("dotenv").config();
console.log(process.env.CLOUD_API_SECRET)
console.log(process.env.CLOUD_API_KEY)
console.log(process.env.CLOUD_NAME)
const express= require("express");
const app= express();
const mongoose= require("mongoose");
const path= require("path");
const Video= require("./models/videos");
const methodOverride=  require("method-override")
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError");
const asyncWrap= require("./utils/wrapAsync");
const {videoSchema}= require("./schema");
const Comment= require("./models/comments");
const {commentSchema}= require("./schema");
const session= require("express-session");
const flash= require("connect-flash");
const localStreategy =require("passport-local");
const User= require("./models/user");
const passport = require("passport");
const {isloggedIn}= require("./middleware");
const { register } = require("module");
const {saveRedirectUrl}=require("./middleware")
const {isOwner}= require("./middleware");
const {isCommentOwner}= require("./middleware");
const listingController= require("./controller/listing")
const multer= require("multer");
const {storage}= require("./cloudConfig");
const upload= multer({storage});

app.set("view engine","ejs");
app.engine("ejs",ejsMate);
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/youtube');

}

main()
.then(()=>{console.log("connected to db")})
.catch((err)=>{console.log(err)});


//session option
const sessionOption={
    secret:"supersecret",
    resave:"false",
    saveUninitialized:true,
    cookies:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}

app.use(session(sessionOption));
app.use(flash());



app.use(passport.initialize());//initialize passport
app.use(passport.session());//initialize session for users
passport.use(new localStreategy(User.authenticate()));//help to authenticate user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser= req.user;
    next();
})


const validateListing= (req,res,next)=>{
    let result= videoSchema.validate(req.body.new);
    if(result.error){
        let msg= result.error.details.map(el=>el.message).join(",");
        throw new ExpressError(msg,400);
    }
    next();
};


//sigup route
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});

app.post("/signup",asyncWrap(async(req,res)=>{
    try{
        let {email, username, password}= req.body;
    const registeredUser= await User.register(new User({email,username}),password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "new user registered");
    res.redirect("/home");
    })
    
    }
    catch(err){
    req.flash("error",err.message);
    res.redirect("/signup")
    }
}));

//login route
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureFlash:true}),asyncWrap(async(req,res)=>{
    req.flash("success","welcome back!");
    // res.redirect("/home");
    let redirectUrl= res.locals.redirectUrl || "/home" ;
    res.redirect(redirectUrl);
}));

//logout route
app.get("/logout", (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged-out")
        res.redirect("/home")
    })
})


//index route
app.get("/home",asyncWrap(listingController.index))

//new route
app.get("/home/new",isloggedIn,asyncWrap(listingController.new));

//show route
app.get("/home/:id",asyncWrap(listingController.show));

//post route for upload
app.post("/home",isloggedIn,upload.single("new[thumbnail]"),validateListing,asyncWrap(listingController.postUpload));

//Edit route
app.get("/home/edit/:id",isloggedIn,asyncWrap(listingController.edit));

app.put("/home/:id",isloggedIn,isOwner,validateListing,asyncWrap(listingController.putEdit));

//Destroy Route
app.delete("/home/:id",isloggedIn,isOwner,asyncWrap(listingController.destroy));

//function for comment validation
const validComment= (req,res,next)=>{
    let{err}= commentSchema.validate(req.body);
    if(err){
        let msg= err.details.map(el=>el.message).join(",");
        throw new ExpressError(msg,400);
    }
    else{
        next()
    }
}

//Commet route
app.post("/home/:id/comments",isloggedIn,validComment,asyncWrap(listingController.comment));

//Delete comment route

app.delete("/home/:id/comments/:commentId",isloggedIn,isCommentOwner,asyncWrap(listingController.deleteComment));



//Errror handling middleware
app.use((err,req,res,next)=>{
    console.log(err);
    let{status=500,message}= err;
    res.render("error.ejs",{err});
})

const port= 8000;
app.listen(port,()=>{
    console.log(`app is listening at ${port}`);
})