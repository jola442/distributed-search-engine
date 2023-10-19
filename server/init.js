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
    updatePageRank()
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

async function updatePageRank(){
    let pages = await Page.find().select("-content.pText -incomingLinks");
    let numPages = pages.length;
    // console.log(pages)
    let twoDList = []
    for(let i = 0; i < numPages; ++i){
        let row = []
        for(let j = 0; j < numPages; ++j){
            if(i == j){
                row.push(0)
            }

            else{
                if(pages[i].outgoingLinks.includes(pages[j]._id)){
                    row.push(1)
                }

                else{
                    row.push(0)
                }
            }
        }
        // console.log("row before normalization:", row)
        if(row.every( (entry) => (entry === 0))){
            row = row.map( () => (1/pages.length));
        }

        else{
            let one_count = 0
            row.forEach( (entry) => {
                if(entry === 1){
                    one_count++;
                }
            })
            row = row.map( (entry) => {
                if(entry === 1){
                    // console.log("Entry:",entry)
                    // console.log("One Count:",one_count)
                    entry = 1/one_count;
                }
                return entry;
            })
            // console.log("row after normalization:", row)
        }
        twoDList.push(row)
    }

    const A = new Matrix(twoDList);
    let alpha = 0.1
    let ones_matrix = new Matrix(numPages, numPages).fill(1);
    P =  (1-alpha) * A + alpha * ones_matrix/numPages


    //Other's parts


    //initialize euclidean_distance, current, prev

    //pi_init = 1 x N matrix where the entire row sums up to 1

    //while (euclidean distance < 0.0001):
        //prev = current
        //current = pi_init * P (matrix multiplication)
        //euclidean_distance = calculate between current and previous
}
