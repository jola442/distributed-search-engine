const express = require('express');
let router = express.Router();
let products = require("./products.json");

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
function respondWithProducts(req, res){
    let results = [];
    if(req.query.name){
        results = products.filter( (product) => (product.name === req.query.name));
    }

    else{
        results = products;
    }

    if(req.query.inStock){
        results = products.filter( (product) => (product.stock > 0));
    }


    if(results.length > 1){
        res.status(200).json(results);
    }

    else{
        res.status(404).send("This resource does not exist");
    }

}


function isValidProduct(product){
    let isPriceValid = !(Number.isNaN(Number(product.price)));
    let isStockValid = !(Number.isNaN(Number(product.stock)));
    let isDimensionsXValid = !(Number.isNaN(Number(product.dimensions.x)));
    let isDimensionsYValid = !(Number.isNaN(Number(product.dimensions.y)));
    let isDimenisonsZValid = !(Number.isNaN(Number(product.dimensions.z)));

    return isPriceValid && isStockValid && isDimensionsXValid && isDimensionsYValid && isDimenisonsZValid;
}

// 2. A way to create a new product by accepting a JSON string containing the name, price,
// x/y/z dimensions, and initial stock quantity of the product.
function createProduct(req, res){
    if(!isValidProduct(req.body)){
        res.status(400).send("Ensure that price, stock, dimensions.x, dimensions.y and dimensions.z are numbers");
        return;
    }

    let newProductID = products[products.length-1].id + 1;
    products.push({name:req.body.name, price:req.body.price, stock:req.body.stock, dimensions:req.body.dimensions, id: newProductID});
    res.status(200).send("Product added successfully");
}

// 3. A way to retrieve and view a specific product (i.e., by ID), which must show all of that
// product's associated information. The server should support the client requesting either
// JSON or HTML representations.
function respondWithProduct(req, res){
    let product;
    for(let i = 0; i < products.length; ++i){
        if(products[i].id == req.params.id){
            product = products[i];
            break;
        }
    }

    if(product){
        res.status(200).json(product);
    }

    else{
        res.status(404).send("This resource does not exist");
    }

}

// 4. A way to add a review for a specific product. For now, a review for a product can simply
// be a rating from 1-10.
function createReview(req, res){
    let newReview = Number(req.body.review);
    let isValidReview = !Number.isNaN(newReview) && [1,2,3,4,5,6,7,8,9,10].includes(newReview);


    if(isValidReview){
        for(let i = 0; i < products.length; ++i){
            if(products[i].id === Number(req.params.id)){
                if(products[i].reviews){
                    products[i].reviews.push(newReview);
                }

                else{
                    products[i].reviews = [newReview];
                }
              
                res.status(200).send("Added review");
                return;
            }
        }

        res.status(400).send("You sent a request to a resource that does not exist");
    }

    else{
        res.status(400).send("Ensure that the review is a number from 1-10")
    }
}

// A way to retrieve and view only the reviews for a specific product. The server should
// support the client requesting either JSON or HTML representations.
function respondWithReviews(req, res){
    let reviews = [];
    for(let i = 0; i < products.length; ++i){
        if(products[i] === Number(req.params.id)){
            reviews = products[i].reviews;
            res.status(200).json(reviews);
            return;
        }

    }

    res.status(404).send("This resource does not exist");
}

module.exports = router;