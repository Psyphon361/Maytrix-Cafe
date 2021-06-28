const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            // validate(value) {
            //     if (!validator.isEmail(value)) {
            //         throw new Error("Email is invalid!");
            //     }
            // },
        },

        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            // validate(value) {
            //     if (value.toLowerCase().includes("password"))
            //         throw new Error(
            //             "Password must not include the string password"
            //         );
            // },
        },
    },

    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

// fname: {
//     type: String,
//     required: true,
//     trim: true,
// },

// lname: {
//     type: String,
//     required: true,
//     trim: true,
// },

// age: {
//     type: Number,
//     default: 0,
//     validate(value) {
//         if (value < 0) {
//             throw new Error("Age must be positive!");
//         }
//     },
// },

// tokens: [
//     {
//         token: {
//             type: String,
//             required: true,
//         },
//     },
// ],

// avatar: {
//     type: Buffer,
// },
// organisation: {
//     type: String,
//     required: true,
//     trim: true,
// },

// empID: {
//     type: Number,
//     default: 0,
//     validate(value) {
//         if (value < 0) {
//             throw new Error("ID number must be positive!");
//         }
//     },
//     required: true,
// },

// mobile: {
//     type: Number,
//     default: 0,
//     validate(value) {
//         if (value < 0) {
//             throw new Error("ID number must be positive!");
//         }
//     },
//     required: true,
// },
