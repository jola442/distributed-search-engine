const Product = require("./ProductModel")
const Order = require('./OrderModel');
const products = require("./products.json");
const Page = require("./pageModel");
const path = require('path');
const mongoose = require("mongoose");
const Crawler = require("crawler");
const {Matrix} = require("ml-matrix");

const uri = "mongodb://127.0.0.1/eCommerceDB"
let productsInserted = 0;
let ordersInserted = 0;

 

mongoose.connect(uri, {useNewUrlParser:true});
db = mongoose.connection;
let initialPage = 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html';
// let initialPage = "https://people.scs.carleton.ca/~davidmckenney/tinyfruits/N-0.html"
let crawledPages = new Set();  //used to keep track of what pages have been crawled. O(1) access
let crawledPageList = [];  //used to determine whether a page has been crawled more than once

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
    //   await crawlPages();
    } catch (err) {
      console.error("Error dropping or recreating database:");
      console.error(err);
    }

    finally{
        return;
    }
});

const crawler = new Crawler({
    maxConnections : 10, //connections in parallel
    // rateLimit: 10000,
    callback : handleCurrentPage
});

async function handleCurrentPage(error, res, done) {
    if(error){
        console.log(error);
    }else{
        try{
            //extract the data from the current page
            let $ = res.$;
            let currentURL = res.request.uri.href;    //current page's URL
            let title = $("title").text();
            let pText = $("p").text();
            let links = $("a");   //an array of <a> DOM elements in the current page
            let outgoingLinks = [];   //an array that will contain the object IDs of each outgoing link of this page in the database
            let outgoingURLs = []   //an array that will contain the URLs of each outgoing link of this page in the database
            crawledPages.add(currentURL);
            crawledPageList.push(currentURL);
            // console.log("Crawling", currentURL);

            //check if the current page is already in the database, insert it if not
            let currPage = await Page.findOneAndUpdate({url:currentURL}, {
                url: currentURL,
                content:{
                    title: title,
                    pText: pText
                },
            }, {upsert:true, new:true});

            if(currPage){
                //insert all outgoing links of this page into the database if they are not already in
                //because the page model must have their ._id attribute
                for(let i = 0; i < links.length; ++i){
                    let url = res.$(links[i]).attr("href");   //current outgoing link's url
                    url = new URL(url, currentURL); 
                    let link = await Page.findOneAndUpdate( {url}, {
                        url: url,
                    }, {upsert:true, new:true});

                    if(!link){
                        console.log("Could not add or find this page");
                    }

                    else{
                        //add this link as an outgoing link of the current page being crawled
                        outgoingLinks.push(link._id);
                        outgoingURLs.push(link.url);
                        //add the current page being crawled as an incoming link of this link
                        link.incomingLinks.push(currPage._id);
                        await link.save();            
                    }
                }

            }   

            currPage = await Page.findOneAndUpdate({url:currentURL}, {outgoingLinks},{upsert:true, new:true});
            
            //BFS - add all the outgoing links of the current page to the queue
            for(let i = 0; i < outgoingURLs.length; ++i){
                let outgoingURL = outgoingURLs[i];
                if(outgoingURL && !crawledPages.has(outgoingURL)){
                    crawler.queue(outgoingURL);
                    crawledPages.add(outgoingURL);
                }
            }
        }

        catch(err){
            console.log(err);
        }

    }
    done();
}

//Perhaps a useful event
//Triggered when the queue becomes empty
//There are some other events, check crawler docs
crawler.on('drain', async function(){
    let results = await Page.find();
    console.log("There are " + results.length + " pages in the database");
    console.log("Only " + crawledPageList.length + " were crawled")
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
        crawler.queue(initialPage);
        

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

function updatePageRank(){
    //Jola's part
    


    let euclideanDistance = -1;
    let previous = new Matrix([[1, 0, 0]]);
    let current = new Matrix([[1, 0, 0]]); //([1/6, 2/3, 1/6])
    //let euclideanDistance = (a, b) =>
    //  Math.hypot(...Object.keys(a).map(k => b[k] - a[k]))


    while (euclideanDistance < 0.00001){
    current = previous.mmul(P);
    console.log("previous");
    console.log(previous);
    console.log("current");
    console.log(current);
    euclideanDistance = eucFunc(previous.data, current.data);
    console.log(euclideanDistance);
    previous = current;
    console.log("next iteration");



    }
    //console.log(euclideanDistance);


    function eucFunc(a, b) {
    return Math.hypot(...a.map((row, i) => Math.hypot(...row.map((val, j) => b[i][j] - val))));
    }
}
