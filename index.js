
const express = require("express"),
//We need method-override to handle put requests where we add ?_method=PUT in edit.js
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer");
bodyParser = require('body-parser'),
mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1/restful_blog_app");
app = express();

 

//APP/CONFIG
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
//Configuring the app to use method-override for put requests
app.use(methodOverride("_method"));

//Configuring app to use sanitizer to disallow users to enter script tags as malicious code in forms
//This code has to be AFTER bodyParser config of app
app.use(expressSanitizer());

//Schema:
/*
title
image
body
created
*/
//MONGOOSE/MODEL/CONFIG
//First we define what the schema will be for the blog
let blogSchema = new mongoose.Schema({
    title: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1461696114087-397271a7aedc?ixlib=rb-0.3.5&s=78dcff96cbf6064e5364b5ddae86b869&dpr=1&auto=format&fit=crop&w=1000&q=80&cs=tinysrgb"
    },
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});

//Then we store the model in a variable called Blog
let Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1461696114087-397271a7aedc?ixlib=rb-0.3.5&s=78dcff96cbf6064e5364b5ddae86b869&dpr=1&auto=format&fit=crop&w=1000&q=80&cs=tinysrgb",
//     body: "This will be a test for Mongo" 
// });

//RESTFUL ROUTES

app.get('/', (req, res) => {
    res.redirect("/blogs")
});


/**INDEX ROUTE */
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                blogs: blogs
            });
        }
    });
});

/**NEW ROUTE */
app.get("/blogs/new", (req, res)=>{
    res.render("new");
});

/**CREATE ROUTE */
app.post('/blogs', (req, res) => {
    //We're sanitizing the body of the blog which is where the user can fill in malicious code
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    //create a new blog
    Blog.create(req.body.blog, (err, blog) => {
        if(err) {
            console.log(err);
        } else {
            //then redirect to the index
            res.redirect("/");
        }
    });
});




/**SHOW ROUTE */
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});


//EDIT FORM ROUTE
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
    
});


//UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
    //We're sanitizing the body of the blog which is where the user can fill in malicious code
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //We find the blog with the id and update it with what the user submitted through the update form
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});


//DESTROY ROUTE
app.delete('/blogs/:id', (req, res) => {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            //redirect somewhere
            res.redirect("/blogs");
        }
    });
    
});

app.get('*', (req, res) => {
    res.render('404');
});


app.listen(3000, () => {
    console.log('App listening on port 3000!');
});