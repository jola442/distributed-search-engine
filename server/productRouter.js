const express = require('express');
let router = express.Router();
let products = require("./products.json");
const Product = require("./ProductModel")

//GET request to /products
router.get("/", respondWithProducts);

//GET request to /products/:id
router.get("/:id", respondWithProduct);

//GET request to /products/:id/reviews
router.get("/:id/reviews", respondWithReviews);

//POST request to /products
router.post("/", createProduct);

//POST request to /products/:id/reviews
router.post("/:id/reviews", createReview);





// 1. A way to search for products. You must support the ability to search by name. You must
// also support the ability to search for all products or only products that are in stock. It
// should be possible to specify both a name search parameter and an all/in-stock search.
async function respondWithProducts(req, res){
    let results = [];
    try{
        if(req.query.name){

            //if the query string has a name and an inStock parameter
            if(req.query.inStock){

                //search for products in stock by name
                results = await Product.find().inStock(req.query.name);
            }

            //if the query string has a name parameter but no inStock parameter
            else{
                //search for products only by name
                results = await Product.find().byName(req.query.name);
            }
    
        }

  
        else{

            //if the query string has an inStock parameter and no name parameter 
            if(req.query.inStock){
                
                //search for products with stock greater than 0
                results = await Product.find({stock: {$gt: 0}});
            }

            //if the query string is just /products (no name or inStock parameters)
            else{
                results = await Product.find();
            }

        }


        res.status(200).json(results);
    }

    catch(err){
        console.log(err);
        res.status(404).send("No results")
    }

    finally{
        return;
    }

}

// 2. A way to create a new product by accepting a JSON string containing the name, price,
// x/y/z dimensions, and initial stock quantity of the product.
async function createProduct(req, res){
    try{
        let newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct)
    }

    catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }

    finally{
        return;
    }
}

// 3. A way to retrieve and view a specific product (i.e., by ID), which must show all of that
// product's associated information. The server should support the client requesting either
// JSON or HTML representations.
async function respondWithProduct(req, res){
    try{
        let product = await Product.findOne({_id:req.params.id});

        if(product){
            res.status(200).json(product);
        }
    }

    catch(err){
        res.status(404).send("This resource does not exist")
    }

    finally{
        return;
    }
}

// 4. A way to add a review for a specific product. For now, a review for a product can simply
// be a rating from 1-10.
async function createReview(req, res){
    let review = req.body.review;
    try {
        review = Number(review);
        console.log(review);
        let product = await Product.findOne({_id:req.params.id});
    
        product.reviews.push(review);
        await product.save();
        res.status(200).send("Added review");
     } 
    catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }

    finally{
        return;
    }
}

// A way to retrieve and view only the reviews for a specific product. The server should
// support the client requesting either JSON or HTML representations.
async function respondWithReviews(req, res){
    let reviews = [];
    
    try {
        reviews = await Product.findOne({_id:req.params.id}).select({_id:0, reviews:1});
        console.log(reviews);
        res.status(200).json(reviews);

    } catch (err) {
        console.log(err);
        res.status(404).send("This resource does not exist");
    }

    finally{
        return;
    }

}

module.exports = router;