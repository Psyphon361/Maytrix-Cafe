const express = require("express");
const router = new express.Router();
const Order = require("../models/order");
const User = require("../models/user");
const Menu = require("../models/menu");
const shared_data = require("../shared-data/shared-vars");
const jwt = require("jsonwebtoken");

router.post("/add-to-cart/:food", async (req, res) => {
    if (!shared_data.user_is_authenticated) {
        res.redirect("/signin");
    } else {
        const userID = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)._id;
        const user = await User.findOne({ _id: userID }).exec();

        if (user.fname === "*_*") {
            res.redirect("/register");
        } else {
            var order;

            const cart = await Order.findOne({
                $and: [{ customer_id: userID }, { order_placed: false }],
            }).exec();

            if (cart) {
                order = cart;
            } else {
                order = new Order();
            }

            const food_name = req.params.food;
            const food = await Menu.findOne({ food_name }).exec();
            let food_quantity = req.body.quantity;

            if (!food_quantity) {
                food_quantity = 1;
            }

            let index = 0;
            let includes = 0;

            for (; index < order.items.length; index++) {
                if (order.items[index].item === food_name) {
                    includes = 1;
                    break;
                }
            }

            if (includes) {
                const new_cost =
                    parseInt(order.items_cost[index].cost) +
                    parseInt(food.food_price * food_quantity);
                const new_count =
                    parseInt(order.items_count[index].count) +
                    parseInt(food_quantity);

                order.items_cost[index].cost = new_cost;
                order.items_count[index].count = new_count;
            } else {
                order.items = order.items.concat({ item: food_name });
                order.items_cost = order.items_cost.concat({
                    cost: food.food_price * food_quantity,
                });

                order.items_count = order.items_count.concat({
                    count: food_quantity,
                });

                order.categories = order.categories.concat({
                    category: food.food_type,
                });
                order.order_placed = false;
                order.customer_id = userID;
            }

            res.redirect("/menu/" + food.food_type);

            await order.save();
        }
    }
});

router.get("/remove/:item", async (req, res) => {
    const order = await Order.findById(req.query.id).exec();

    let index = 0;

    for (; index < order.items.length; index++) {
        if (order.items[index].item === req.params.item) {
            break;
        }
    }

    order.items.splice(index, 1);
    order.items_cost.splice(index, 1);
    order.items_count.splice(index, 1);
    order.categories.splice(index, 1);

    await order.save();

    if(order.items.length === 0) {
        Order.findOneAndDelete({_id: order._id}).exec();
    }

    res.redirect("/cart");
});

router.get("/cart", async (req, res) => {
    if (!shared_data.user_is_authenticated) {
        res.redirect("/signin");
    } else {
        const userID = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)._id;
        const user = await User.findOne({ _id: userID }).exec();

        const cart = await Order.findOne({
            $and: [{ customer_id: userID }, { order_placed: false }],
        }).exec();

        res.render("cart", {
            title: "Maytrix | Your Cart",
            shared_data,
            cart,
        });
    }
});

module.exports = router;
