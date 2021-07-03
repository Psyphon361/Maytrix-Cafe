const url = require("url");

require("./db/mongoose");
require("./oauth/google");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const app = express();
const User = require("./models/user");
const auth = require("./middleware/auth");
const passport = require("passport");

app.locals.email_flag = false;

app.use(express.json()); // for parsing application/json
app.use(cookieParser());

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cookieSession({
        name: "Maytrix",
        keys: ["key1", "key2"],
    })
);

const port = process.env.PORT;

// Define paths for express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");

// Setup ejs engine
app.set("view engine", "ejs");
app.set("views", viewsPath);

// Setup static directory to serve`
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

app.post("/signin", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );

        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
        });

        res.redirect("/");
    } catch (e) {
        res.status(400).send();
    }
});

app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Maytrix Cafe | Sign Up",
    });
});

app.post("/signup", async (req, res) => {
    app.locals.email_flag = false;
    const user = new User(req.body);

    console.log(user.email);

    const existing_user = await User.findOne({ email: user.email });

    console.log(existing_user);

    if (existing_user) {
        app.locals.email_flag = true;
        res.redirect("/signup");
    }

    try {
        await user.save();
        // sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
        });

        res.status(201).redirect("/register"); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
    } catch (e) {
        res.status(400);
    }
});

app.get("/register", auth, async (req, res) => {
    const user = req.user;

    if (!(user.fname == "*_*")) {
        // ALREADY REGISTERED USERS NOT ALLOWED TO ACCESS /register
        res.redirect("/");
    }

    res.render("registration-form", {
        title: "Maytrix Cafe | Register",
        email: user.email,
    });
});

app.post("/register", auth, async (req, res) => {
    console.log(req.user);
    const requestedUpdates = Object.keys(req.body);
    const allowedUpdates = ["fname", "lname", "org_name", "empID", "phone"];

    const isValidOperation = requestedUpdates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const user = req.user;

        requestedUpdates.forEach((update) => (user[update] = req.body[update]));
        await user.save();

        res.status(201).redirect("/");
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/signup" }),
    async function (req, res) {
        const user = req.user;

        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
        });

        res.status(201).redirect("/register"); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
    }
);

app.listen(3000, function () {
    console.log("Server started on port 3000!");
});
