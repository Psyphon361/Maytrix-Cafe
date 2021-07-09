const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    food_type: {
        type: String,
        required: true,
        unique: false,
        trim: true,
    },

    food_name: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },

    food_price: {
        type: Number,
        required: true,
        unique: false,
    }
});

// menuSchema.statics.findByFoodType = async (email, password) => {
//     const user = await User.findOne({ email });

//     if (!user) {
//         throw new Error("Unable to login!");
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//         throw new Error("Unable to login!");
//     }

//     return user;
// };

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
