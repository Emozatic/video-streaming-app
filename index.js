const express= require("express");
const app= express();
const mongoose= require("mongoose");
const path= require("path");
const Video= require("./models/videos");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/youtube');

}

main()
.then(()=>{console.log("connected to db")})
.catch((err)=>{console.log(err)});



//index route
app.get("/home",async(req,res)=>{
    let allVideos=await Video.find({});
    res.render("home.ejs",{allVideos});
});

//show route
app.get("/home/show/:id",async(req,res)=>{
    let{id}=req.params;
    let allVideos=await Video.find({});
    let showVideo= await Video.findById(id);
    res.render("show.ejs",{showVideo, allVideos});
})

//new route
app.get("/home/upload",(req,res)=>{
    res.render("new.ejs");
})

//post route for upload
app.post("/home",async(req,res)=>{
    let newVideo= new Video(req.body.new);
    await newVideo.save().then((res)=>{console.log(res)});
    res.redirect("/home");
})

const port= 8000;
app.listen(port,()=>{
    console.log(`app is listening at ${port}`);
})