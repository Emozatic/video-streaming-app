const express= require("express");
const app= express();
const mongoose= require("mongoose");
const path= require("path");
const Video= require("./models/videos");
const methodOverride=  require("method-override")
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError");
const asyncWrap= require("./utils/wrapAsync");
const { videoSchema }= require("./schema");
const { validateListing }= require("./utils/validateListing");

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





//index route
app.get("/home",asyncWrap(async(req,res)=>{
    let allVideos=await Video.find({});
    res.render("home.ejs",{allVideos});
}));

//new route
app.get("/home/new",asyncWrap(async(req,res)=>{
    res.render("new.ejs");
}));

//show route
app.get("/home/:id",asyncWrap(async(req,res)=>{
    let{id}=req.params;
    let allVideos=await Video.find({});
    let showVideo= await Video.findById(id);
    res.render("show.ejs",{showVideo, allVideos});
}));

//post route for upload
app.post("/home",validateListing,asyncWrap(async(req,res)=>{
    let result= videoSchema.validate(req.body.new);
    if(result.error){
        let msg= result.error.details.map(el=>el.message).join(",");
        throw new ExpressError(msg,400);
    };
    let newVideo= new Video(req.body.new);
    await newVideo.save().then((res)=>{console.log(res)});
    res.redirect("/home");
}));

//Edit route
app.get("/home/edit/:id",asyncWrap(async(req,res)=>{
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
    res.redirect("/home");
}));

//Destroy Route
app.delete("/home/:id",asyncWrap(async(req,res)=>{
    let {id}= req.params;
    let deletedVideo= await Video.findByIdAndDelete(id);
    console.log(deletedVideo);
    res.redirect("/home");
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