const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
    name: {
        type: String,
        required: true
    },

    price:{
        type:Number,
        default:0,
        min:[0, "The price of the product cannot be negative"]
    },

    stock:{
        type:Number,
        default:0,
        min:[0, "The stock of the product cannot be negative"]
    },

	dimensions: {
		type: {
			x: {type: Number},
			y: {type: Number},
			z: {type: Number}
		},
		default: {
			x: 1,
			y: 1,
			z: 1
		}
    },

    reviews:{
        type:[Number],
        default:[],
        validate: {
            validator: (arr) => {
                for(let i = 0; i < arr.length; ++i){
                    if(typeof(arr[i]) !== "number" || arr[i] < 1 || arr[i] > 10){
                        return false;
                    }
                }
                return true;
            },
            message: "Please enter a number from 1 to 10"
        }
}

});


productSchema.query.byName = function(name){
    return this.where({name: new RegExp(name, 'i')});
}

productSchema.query.inStock = function(name){
    return this.where({name: new RegExp(name, 'i'), stock:{$gt:0}});
}

module.exports = mongoose.model("Product", productSchema);
