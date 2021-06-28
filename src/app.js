const path = require("path");
const express = require("express");
const app = express();
const User = require("./models/user");

// const urlencodedParser = express.urlencoded({ extended: true });

app.use(express.json()) // for parsing application/json

app.use(express.urlencoded({ extended: true }))  // for parsing application/x-www-form-urlencoded

const port = process.env.PORT;

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

app.post("/signin", (req, res) => {
    console.log(req.body);

    res.render("signin", {
        title: "Maytrix Cafe | Log In",
    });
});

app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Maytrix Cafe | Sign Up",
    });
});

// app.post("/signup", (req, res) => {
//     console.log(req.body);

//     res.render("signup", {
//         title: "Maytrix Cafe | Sign Up",
//     });
// });

app.post("/signup", async (req, res) => {
    // console.log(req.body);

    const user = new User(req.body);

    console.log(user);

    try {
        await user.save();
        // sendWelcomeEmail(user.email, user.name);
        // const token = await user.generateAuthToken();
        // res.status(201).send({ user, token });

        res.status(201).send({ user });
    } catch (e) {
        res.status(400).send(e);
    }
});

app.listen(3000, function () {
    console.log("Server started on port 3000!");
});
