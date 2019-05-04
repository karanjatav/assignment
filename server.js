var express = require("express");
var app = express();

var passport = require("passport")
var passportLocal = require("passport-local")
var passportLocalMongoose = require("passport-local-mongoose")
var bodyParser = require("body-parser")
var user = require("./models/user")
var mongoose = require("./models/conn")
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended:true}));

app.use(require("express-session")({
    secret: "**** you all bitc***",
    resave: false,
    saveUninitialized: false
}));

port = 3000
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
  
    
    next();
  })

app.get("/",(req,res)=>{
    res.render('home.ejs')
});

app.get("/logout",(req,res)=>{
        req.logout();
        
        res.redirect("/")
    })



app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.post("/register",(req,res)=>{
    
    user.register(new user({username:req.body.username,
    	email:req.body.email,
    	age:req.body.age}),req.body.password,(err,data)=>{

        if(err)
        {
        	res.send({
        		statuscode:400,
        		error:"Wrong parameters",
        		message:"Please check the entered parameters"
        	})
            console.log(err)
            // req.flash("error","user with same username already exist")
            return res.render("register.ejs")
        }
        passport.authenticate("local")(req,res,function(){
                          
                           res.send({
        		statuscode:200,
        		data:{
        			username:req.body.username,
        			email:req.body.email,
        			age:req.body.age
        		}
        	})
            // res.render("takeimage.ejs")
           res.redirect("/")
            
        })
    })


})

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.post("/login",(req,res,next)=>{


    passport.authenticate("local",(err,User,info)=>{

        if(err)
        {   
        	res.send({
        		statuscode:400,
        		error:"Wrong parameters",
        		message:"Please check the entered parameters"
        	})
            return(next(err))
        }
        if(!User)
        {   
          	res.send({
        		statuscode:400,
        		error:"invalid user",
        		message:"User not found"
        	})
            return res.redirect("/login")
        }
        req.logIn(User,function(err){
            if(err)
            {   
                res.send({
        		statuscode:400,
        		error:"Wrong parameters",
        		message:"Please check the parameters"
        	})
                return next(err)
            }
            user.find({username:User.username}).then((data)=>{
                if(data)
                {
                    // console.log(data)

                    res.send({
        		statuscode:200,
                message:"User Logged In",
        		data:data
        	})
                     
                    return res.redirect("/");
                }
            }).catch((e)=>{
                
                return next(e)
            })
            
        })
    
    })(req,res,next);
    });


    function isLoggedIn(req ,res ,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}


app.listen( port,()=>
{
    console.log("server has started");
})    