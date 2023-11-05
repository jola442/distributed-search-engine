const Product = require("./ProductModel")
const Order = require('./OrderModel');
const products = require("./products.json");
const Page = require("./pageModel");
const path = require('path');
const mongoose = require("mongoose");
const Crawler = require("crawler");
const config = require("./config.json")

mongoose.connect(config.MONGO_DB_URI, {useNewUrlParser:true});
db = mongoose.connection;
db = mongoose.connection;
let initialPage = "https://en.wikipedia.org/wiki/Eden_Hazard"
// let initialPage = "https://people.scs.carleton.ca/~davidmckenney/tinyfruits/N-0.html"
let crawledPages = new Set();  //used to keep track of what pages have been crawled. O(1) access
let crawledPageList = [];  //used to determine whether a page has been crawled more than once
const MAX_CRAWLED_PAGES = 950;

db.on("connected", function(){
    console.log("Database is connected successfully")
})

db.on("disconnected", function(){
    console.log("Database is disconnected successfully")
})

db.on("error", console.error.bind(console, "connectection error:"));

db.once('open', async function() {
    try {
    //   await mongoose.connection.db.dropDatabase();
    //   console.log("Dropped database. Starting re-creation.");
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

let insertedPages = 0;
let iteration  = 0;

async function handleCurrentPage(error, res, done) {
    if(error){
        console.log(error);
    }else{
        try{
            iteration++;
            //extract the data from the current page
            let $ = res.$;
            let currentURL = res.request.uri.href;    //current page's URL
            let title = $("title").text();
            let pText = $("p").text();
            // console.log(iteration, pText);
            let links = $("a");   //an array of <a> DOM elements in the current page
            let outgoingLinks = [];   //an array that will contain the object IDs of each outgoing link of this page in the database
            let outgoingURLs = []   //an array that will contain the URLs of each outgoing link of this page in the database
            crawledPages.add(currentURL);
            crawledPageList.push(currentURL);


            // the current page might have been added as an outgoing link previously
            //find and update the current page with the crawled data
            let currPage = await Page.findOneAndUpdate({url:currentURL}, {
                url: currentURL,
                content:{
                    title: title,
                    pText: pText
                },
                type:"personal"
            }, {new:true});

                        
            // if the current page doesn't exist, create it
            if(!currPage){
                if(insertedPages < MAX_CRAWLED_PAGES){
                    let newPage = new Page({url:currentURL, content:{title, pText}, type:"personal"});
                    try{
                        currPage = await newPage.save();
                        insertedPages++;
                    }
    
                    catch(err){
                        console.error("Error saving the current page", err)
                    }
                }

            }




            if(currPage){
                //insert all outgoing links of this page into the database if they are not already in
                //because the page model must have their ._id attribute
                
                for(let i = 0; i < Math.min(links.length, MAX_CRAWLED_PAGES-crawledPageList.length); ++i){
                    let url = res.$(links[i]).attr("href");   //current outgoing link's url
                    url = new URL(url, currentURL);

                    let link = await Page.findOne({url});
                    if(!link){
                        if(insertedPages < MAX_CRAWLED_PAGES){
                            let newPage = new Page({url, type:"personal"});
                            try{
                                link = await newPage.save();
                                insertedPages++;
                            }
            
                            catch(err){
                                console.error("Error saving document", err)
                            } 
                        }
                    }

                    if(link){
                        //add this link as an outgoing link of the current page being crawled
                        outgoingLinks.push(link._id);
                        outgoingURLs.push(link.url);
                        //add the current page being crawled as an incoming link of this link
                        let newIncomingLinks = link.incomingLinks
                        newIncomingLinks.push(currPage._id);

                        try{
                             link  = await Page.findOneAndUpdate(
                                {url},
                                { $set: { incomingLinks: newIncomingLinks } },
                                { new: true } // This option ensures that the updated document is returned
                              );
                        }

                        catch(err){
                            console.log(err)
                        }

                        }
                        currPage.outgoingLinks = outgoingLinks;
        
                        try{
                            currPage = await currPage.save();
       
                        }
                        catch(err){
                            console.error("Could not save the current page", err)
                        }

                    }
                   
            }   

            
            //BFS - add all the outgoing links of the current page to the queue
            for(let i = 0; i < Math.min(outgoingURLs.length, MAX_CRAWLED_PAGES-crawledPageList.length); ++i){             
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
    console.log("There are " + results.length + " personal pages in the database");
    console.log("Only " + crawledPageList.length + " were crawled")
});

async function main(){
    try{
        crawler.queue(initialPage);
    }

    catch(err){
        console.log(err.message);
    }

    finally{
        return;
    }
}