const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = Schema({
    productID:{
        type: Schema.ObjectId,
        ref: "Product",
        required: true
    },

    quantity:{
        type:Number,
        required:true,
        min:[1, "The product quantity must be at least 1"]
    }
})

const orderSchema = Schema({
    name: {
        type: String,
        required: true
    },

    products:[orderItemSchema]
});


module.exports = mongoose.model("Order", orderSchema);
