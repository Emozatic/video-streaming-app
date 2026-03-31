const express= require("express");
const app= express();
const port= 8000;
const ExpressError= require("./ExpressError");
app.listen(port,()=>{
    console.log("app is listening at 8000");
})

//middleware for api token

const checkToken=app.use((req,res,next)=>{
    let apiToken= "28112005";
    let{token}=req.query;
    console.log(token);
    if(token===apiToken){
        next();
    }
    throw new ExpressError("Invalid API token",401);
})

app.get("/",checkToken,(req,res)=>{
    res.send("data");
})