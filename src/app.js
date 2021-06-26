const path = require("path");
const express = require("express");

const app = express();

const port = process.env.PORT || 3000;

// Define paths for express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");

// Setup ejs engine
app.set("view engine", "ejs");
app.set("views", viewsPath);

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

app.get("/", (req, res) => {
    res.render("home", {
        title: "Maytrix Cafe | Home",
    });
});

app.get("/menu", (req, res) => {
    res.render("menu", {
        title: "Maytrix Cafe | Menu",
    });
});

app.get("/about", (req, res) => {
    res.render("aboutus", {
        title: "Maytrix Cafe | About Us",
    });
});

app.get("/contact", (req, res) => {
    res.render("contactus", {
        title: "Maytrix Cafe | Contact Us",
    });
});

app.get("/signin", (req, res) => {
    res.render("signin", {
        title: "Maytrix Cafe | Log In",
    });
});

app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Maytrix Cafe | Sign Up",
    });
});


app.listen(port, function() {
    console.log("Server started on port 3000!");
});
