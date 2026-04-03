const express= require("express");
const app= express();
const cookieParser= require("cookie-parser");
const expressSession= require("express-session");

const port= 8000;


app.use(cookieParser("secretCode"));
app.use(expressSession({secret:"secretString",resave:false, saveUninitialized:true}));

app.get("/test", (req,res)=>{
    res.send("success");
})

app.get("/reqCount",(req,res)=>{
    if(req.session.count){
        req.session.count++;
    }
    else{
        req.session.count=1;    
    }
    res.send(`you have visited this page ${req.session.count} times`);
})

//signed Cookie
app.get("/signedCookie",(req,res)=>{
    res.cookie("made-in","India",{signed:true})
    res.send("cookie sent");
})

//verify signed cookie
app.get("/verifyCookie",(req,res)=>{
    console.log(req.cookies);
    console.log(res.signedcookies)
    res.send("verified");
})

app.get("/",(req,res)=>{
    res.send("Hii I am cookie");
    console.log(req.cookies);
})

//cookies
app.get("/getcookies",(req,res)=>{
    res.cookie("name","Lucky");
    res.cookie("age",20);
    console.log(req.cookies);
    res.send("how are you");
})

app.listen(port,()=>{
    console.log("app is listening at 8000");
})