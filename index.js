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

//demo user
// app.get("/demoUser",async(req,res)=>{
//     let fakeUser= new User({
//         email:"lk@gmail.com",
//         username:"lucky"
//     })
//     let registeredUser= await User.register(fakeUser,"lucky123");
//     res.send(registeredUser);   
// })

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

app.post("/login",passport.authenticate("local",{failureFlash:true}),asyncWrap(async(req,res)=>{
    req.flash("success","welcome back!");
    res.redirect("/home");
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
app.get("/home",asyncWrap(async(req,res)=>{
    let allVideos=await Video.find({});
    res.render("home.ejs",{allVideos});
}));

//new route
app.get("/home/new",isloggedIn,asyncWrap(async(req,res)=>{
    res.render("new.ejs");
}));

//show route
app.get("/home/:id",isloggedIn,asyncWrap(async(req,res)=>{
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
}));

//post route for upload
app.post("/home",isloggedIn,validateListing,asyncWrap(async(req,res)=>{
    let newVideo= new Video(req.body.new);
    await newVideo.save().then((res)=>{console.log(res)});
    req.flash("success","New Video Uploaded");
    res.redirect("/home");
}));

//Edit route
app.get("/home/edit/:id",isloggedIn,asyncWrap(async(req,res)=>{
    let {id}= req.params;
   let videoDetails= await Video.findById(id);
   if(!videoDetails){
    throw new ExpressError("Video not found",404);
   };
    res.render("edit.ejs",{videoDetails});
}));

app.put("/home/:id",validateListing,asyncWrap(async(req,res)=>{
    let {id}= req.params;
    let updated=await Video.findByIdAndUpdate(id,{...req.body.edit});
    console.log(updated);
    req.flash("success","Video Updated");
    res.redirect("/home");
}));

//Destroy Route
app.delete("/home/:id",isloggedIn,asyncWrap(async(req,res)=>{
    let {id}= req.params;
    let deletedVideo= await Video.findByIdAndDelete(id);
    console.log(deletedVideo);
    req.flash("success","Video Deleted");
    res.redirect("/home");
}));

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
app.post("/home/:id/comments",validComment,asyncWrap(async(req,res)=>{    
    let {id}= req.params;
    let video= await Video.findById(id);
    let newComment= new Comment({comment: req.body.comments});
    video.comments.push(newComment);
    await newComment.save();
    await video.save();
    req.flash("success","Comment Added");
    res.redirect(`/home/${id}`);
}));

//Delete comment route

app.delete("/home/:id/comments/:commentId",asyncWrap(async(req,res)=>{
    let {id, commentId}= req.params;
    let video= await Video.findById(id);
    video.comments.pull({_id: commentId});
    await video.save();
    req.flash("success","Comment Deleted");
    res.redirect(`/home/${id}`);
}));



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