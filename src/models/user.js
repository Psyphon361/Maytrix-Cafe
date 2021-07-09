const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var findOrCreate = require("mongoose-findorcreate");

const shared_data = require("../shared-data/shared-vars");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: false,
            trim: true,
            default: "NONAME",
        },

        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is invalid!");
                }
            },
        },

        password: {
            type: String,
            trim: true,
            minlength: 6,
            default: "NOPASS",
        },

        fname: {
            type: String,
            default: "*_*",
            required: true,
            trim: true,
        },

        lname: {
            type: String,
            default: "*_*",
            required: true,
            trim: true,
        },

        org_name: {
            type: String,
            default: "*_*",
            required: true,
            trim: true,
        },

        empID: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("ID number must be positive!");
                }
            },
            required: true,
        },

        phone: {
            type: Number,
            default: 0,
            required: true,
        },

        id_card: {
            type: String,
            required: true,
            default: "IDCARD",
        },

        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    },

    {
        timestamps: true,
    }
);

// GENERATE AUTH TOKEN USING JWT
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, "psyphon");

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        shared_data.valid_user = false;
        return undefined;
        // throw new Error("Unable to login!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        shared_data.valid_user = false;
        return undefined;
        // throw new Error("Unable to login!");
    }

    shared_data.valid_user = true;
    return user;
};

// HASH PLAIN TEXT PASSWORDS
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

module.exports = User;
