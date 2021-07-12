const express = require("express");
const router = new express.Router();
const Menu = require("../models/menu");
const shared_data = require("../shared-data/shared-vars");

router.get("/menu/:type", async (req, res) => {
    var food_type = req.params.type;
    food_type = food_type.charAt(0).toUpperCase() + food_type.slice(1);
    const types = [food_type];

    let foods = await Menu.find().where("food_type").in(types).exec();
    // console.log(foods);

    const title = "Maytrix Cafe | " + food_type + " Menu";
    res.render("menu", {
        title,
        foods,
        shared_data,
    });
});

module.exports = router;

// router.post("/new-item", async (req, res) => {
//     menu = new Menu(req.body);

//     try {
//         // console.log("SAVING");
//         await menu.save();
//         // sendWelcomeEmail(user.email, user.name);
//         // const token = await user.generateAuthToken();

//         // res.cookie("jwt", token, {
//         //     httpOnly: true,
//         //     secure: false,
//         // });

//         res.status(201).send(menu); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
//     } catch (e) {
//         res.status(400);
//     }
// });
