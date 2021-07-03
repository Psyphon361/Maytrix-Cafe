const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const ifUserExists = require("../js/userExists");

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID:
                "64385892721-fb0l7mqvhpd3gfk8p79kndvg135ji05c.apps.googleusercontent.com",
            clientSecret: "WlbAfmYmI6zmrR9agXCjtE25",
            callbackURL: "http://localhost:3000/google/callback",
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({ email: profile._json.email }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);
