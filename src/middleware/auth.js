const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(token == null) return res.sendStatus(401);

        const decoded = jwt.verify(token, "psyphon");

        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate" });
    }
};

module.exports = auth;
