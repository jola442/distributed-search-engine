const express = require('express');
let router = express.Router();

router.get("/", respondWithOrders);
router.get("/:id", respondWithOrder);
router.post("/", createOrder)

//This function checks that all products in the order exist and the quantity < stock
function isValidOrder(orderObj){

}

function respondWithOrders(req, res){

}

function respondWithOrder(req, res){
    
}

function createOrder(req, res){
    
}

module.exports = router; 
