const express = require('express');
let router = express.Router();
const Order = require("./OrderModel")

router.get("/", respondWithOrders);
router.get("/:id", respondWithOrder);
router.post("/", createOrder)

//This function checks that all products in the order exist and the quantity < stock
function isValidOrder(orderObj){

}

async function respondWithOrders(req, res) {
    try {
      // Simplified query to retrieve all orders
        const results = await Order.find({});
        if(results){
            res.status(200).json(results);
        }
    } catch(err){
        console.log(err);
        res.status(404).send("No results")
    }
  }
  

  async function respondWithOrder(req, res){
    try{
        // Simplified query to retrieve a specific orders
        let order = await Order.findOne({_id:req.params.id});

        if(order){
            res.status(200).json(order);
        }
    }

    catch(err){
        res.status(404).send("This resource does not exist");
    }

    finally{
        return;
    }

}

function createOrder(req, res){
    
}

module.exports = router; 
