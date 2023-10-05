const Product = require("./ProductModel")
const Order = require('./OrderModel');
const products = require("./products.json");
let productsInserted = 0;
let ordersInserted = 0;

const mongoose = require("mongoose");
const uri = "mongodb://127.0.0.1/eCommerceDB" 

mongoose.connect(uri, {useNewUrlParser:true});
db = mongoose.connection;

db.on("connected", function(){
    console.log("Database is connected successfully")
})

db.on("disconnected", function(){
    console.log("Database is disconnected successfully")
})

db.on("error", console.error.bind(console, "connectection error:"));

db.once('open', async function() {
    try {
      await mongoose.connection.db.dropDatabase();
      console.log("Dropped database. Starting re-creation.");
      await main();
    } catch (err) {
      console.error("Error dropping or recreating database:");
      console.error(err);
    }
  });
  

async function main(){
    try{
        for(let i = 0; i < products.length; ++i){
            delete products[i].id;
            let prod = new Product(products[i]);
            const productsArr = [
                {
                productID: prod._id,
                quantity: 2
                },
            ]
    
            const order1 = new Order({
                name: "Stephen",
                products: productsArr
            });
            await order1.save();
            ordersInserted++;
            await prod.save();
            productsInserted++;
        }
        

    }

    catch(err){
        console.log(err.message);
    }

    finally{
        console.log("Inserted", productsInserted, "products");
        console.log("Inserted", ordersInserted, "orders");
        return;
    }
}


//Required module (install via NPM)
const Crawler = require("crawler");

const crawler = new Crawler({
    maxConnections : 10, //use this for parallel, rateLimit for individual
    //rateLimit: 10000,

    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$; //get cheerio data, see cheerio docs for info

            console.log("Keywords: " + $("meta[name=Keywords]").attr("content"));
            console.log("\n\n");
            console.log("Description: " + $("meta[name=Description]").attr("content"));
            console.log("\n\n");
            console.log("Title: " + $("title").text());
            console.log("\n\n");
            //console.log("Body: " + $("body").text());
            console.log("Paragraphs: " + $("p").text());

            //Link text can be useful
            console.log("Link and Paragraph Text: " + $("a,p").text());

        }
        done();
    }
});

//Perhaps a useful event
//Triggered when the queue becomes empty
//There are some other events, check crawler docs
crawler.on('drain',function(){
    console.log("Done.");
});

//Queue a URL, which starts the crawl
crawler.queue('https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html');
//c.queue('https://www.w3schools.com/tags/tag_meta.asp');
//c.queue("https://www.w3schools.com/jquery/jquery_selectors.asp")
