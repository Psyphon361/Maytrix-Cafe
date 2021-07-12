const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [
        {
            item: {
                type: String,
            },
        },
    ],

    items_cost: [
        {
            cost: {
                type: Number,
            },
        },
    ],

    items_count: [
        {
            count: {
                type: Number,
            },
        },
    ],

    categories: [
        {
            category: {
                type: String,
            },
        },
    ],

    order_placed: {
        type: Boolean,
        required: true,
    },

    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
