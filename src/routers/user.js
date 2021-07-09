const { unlink } = require("fs"); // to delete the img after uploading to cloud.
require("../oauth/google");
require("../oauth/github");
const path = require("path");
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const passport = require("passport");
const multer = require("multer");
const imgbbUploader = require("imgbb-uploader");
const jwt = require("jsonwebtoken");

const shared_data = require("../shared-data/shared-vars");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },

    filename: function (req, file, cb) {
        cb(
            null,
            new Date().toISOString().replace(/:/g, "-") + file.originalname
        );
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024,
    },
    fileFilter: function (_req, file, cb) {
        checkFileType(file, cb);
    },
});

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        shared_data.valid_file_type = true;
        return cb(null, true);
    } else {
        shared_data.valid_file_type = false;
        cb(null, null);
    }
}

router.get("/", async (req, res) => {
    const token = req.cookies.jwt;

    if (token == null) {
        shared_data.user_is_authenticated = false;
    } else {
        const decoded = jwt.verify(token, "psyphon");

        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });

        if (!user) {
            shared_data.user_is_authenticated = false;
        } else {
            shared_data.user_is_authenticated = true;
        }
    }

    res.render("home", {
        title: "Maytrix Cafe | Home",
        shared_data: shared_data,
    });
});

router.get("/menu", (req, res) => {
    res.render("menu", {
        title: "Maytrix Cafe | Menu",
    });
});

router.get("/about", (req, res) => {
    res.render("aboutus", {
        title: "Maytrix Cafe | About Us",
    });
});

router.get("/contact", (req, res) => {
    res.render("contactus", {
        title: "Maytrix Cafe | Contact Us",
    });
});

router.get("/signin", (req, res) => {
    if (shared_data.user_is_authenticated) {
        res.redirect("/");
    } else {
        res.render("signin", {
            title: "Maytrix Cafe | Log In",
            shared_data: shared_data,
        });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );

        if (shared_data.valid_user == false) {
            res.redirect("/signin");
        } else {
            const token = await user.generateAuthToken();

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false,
            });

            shared_data.user_is_authenticated = true;

            res.redirect("/");
        }
    } catch (e) {
        res.status(400).send();
    }
});

router.get("/signup", (req, res) => {
    if (shared_data.user_is_authenticated) {
        res.redirect("/");
    } else {
        res.render("signup", {
            title: "Maytrix Cafe | Sign Up",
            shared_data: shared_data,
        });
    }
});

router.post("/signup", async (req, res) => {
    shared_data.email_flag = false;

    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!re.test(req.body.password)) {
        shared_data.strong_password = false;
        res.redirect("/signup");
    } else {
        shared_data.strong_password = true;

        const user = new User(req.body);

        const existing_user = await User.findOne({ email: user.email });

        if (existing_user) {
            shared_data.email_flag = true;
            res.redirect("/signup");
        } else {
            try {
                await user.save();
                // sendWelcomeEmail(user.email, user.name);
                const token = await user.generateAuthToken();

                res.cookie("jwt", token, {
                    httpOnly: true,
                    secure: false,
                });

                shared_data.user_is_authenticated = true;

                res.status(201).redirect("/register"); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
            } catch (e) {
                res.status(400);
            }
        }
    }
});

router.get("/register", auth, async (req, res) => {
    const user = req.user;

    if (!(user.fname == "*_*")) {
        // ALREADY REGISTERED USERS NOT ALLOWED TO ACCESS /register
        res.redirect("/");
    } else {
        res.render("registration-form", {
            title: "Maytrix Cafe | Register",
            email: user.email,
            shared_data,
        });
    }
});

router.post("/register", auth, upload.single("id_card"), async (req, res) => {
    if (shared_data.valid_file_type === false) {
        res.redirect("/register");
    } else {
        const requestedUpdates = Object.keys(req.body);
        const allowedUpdates = ["fname", "lname", "org_name", "empID", "phone"];

        const isValidOperation = requestedUpdates.every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).send({ error: "Invalid updates!" });
        }

        const cloud_img = await imgbbUploader(
            process.env.FILEBB_API_KEY,
            req.file.path
        );

        if (cloud_img) {
            unlink(req.file.path, (err) => {
                if (err) throw err;
            });

            req.user.id_card = cloud_img.url;
        }

        try {
            const user = req.user;
            requestedUpdates.forEach(
                (update) => (user[update] = req.body[update])
            );

            await user.save();

            shared_data.user_is_authenticated = true;

            res.status(201).redirect("/");
        } catch (e) {
            res.status(400).send(e);
        }
    }
});

// GOOGLE OAUTH

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/signup" }),
    async function (req, res) {
        const user = req.user;
        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
        });

        shared_data.user_is_authenticated = true;

        res.status(201).redirect("/register"); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
    }
);

// GITHUB OAUTH

router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/signup" }),

    async function (req, res) {
        const user = req.user;
        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
        });

        shared_data.user_is_authenticated = true;

        res.status(201).redirect("/register"); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
    }
);

router.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.redirect("/");
    } catch (e) {
        res.stautus(500).send();
    }
});

// // PASSWORD CHECK

// function checkPwd(str) {
//     if (str.length < 6) {
//         return "too_short";
//     } else if (str.search(/\d/) == -1) {
//         return "no_num";
//     } else if (str.search(/[a-zA-Z]/) == -1) {
//         return "no_letter";
//     } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
//         return "bad_char";
//     }
//     return "ok";
// }

module.exports = router;
