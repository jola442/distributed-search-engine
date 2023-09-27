const express = require('express');
let router = express.Router();
const Order = require("./OrderModel")

router.get("/", respondWithOrders);
router.get("/:id", respondWithOrder);
router.post("/", createOrder)

//This function checks that all products in the order exist and the quantity < stock
async function isValidOrder(orderObj) {
    try {
      const productsInOrder = orderObj.products;
  
      for (const productItem of productsInOrder) {
        const product = await Product.findOne({ _id: productItem.productID });
  
        if (!product) {
          return false; // Product does not exist
        }
  
        if (productItem.quantity > product.stock) {
          return false; // Insufficient stock
        }
      }
  
      return true; // All products are valid
    } catch (err) {
      console.error(err);
      return false;
    }
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


async function createOrder(req, res) {
    try {
      const orderData = req.body;
      
      // Check if the order is valid
      if (!isValidOrder(orderData)) {
        res.status(400).send("Invalid order");
        return;
      }
  
      // Create and save the order
      const order = new Order(orderData);
      await order.save();
  
      // Update product stock after order creation
      for (const productItem of order.products) {
        const product = await Product.findOne({ _id: productItem.productID });
        product.stock -= productItem.quantity;
        await product.save();
      }
  
      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  }
  
module.exports = router; 
