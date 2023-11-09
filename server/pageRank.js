const Page = require("./pageModel");
const mongoose = require("mongoose");
const {Matrix} = require("ml-matrix");
const config = require("./config.js")

mongoose.connect(config.MONGO_DB_URI, {useNewUrlParser:true});
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
        updatePageRank("fruits")
        updatePageRank("personal")
    } catch (err) {
      console.error("Error dropping or recreating database:");
      console.error(err);
    }

    finally{
        return;
    }
});

async function updatePageRank(type){
    let pages = await Page.find({type}).select("-content.pText -incomingLinks");
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
            // console.log("row after normalization", row)
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
                    entry = 1/one_count;
                }
                return entry;
            })
        }
        twoDList.push(row)
    }

    //normalized numPages x numPages adjacency matrix
    const A = new Matrix(twoDList);

    //teleport to a random node with probability alpha
    let alpha = 0.1      

    // numPages x numPages matrix of 1s
    let ones_matrix = new Matrix(numPages, numPages).fill(1);

    //numPages x numPages matrix
    P = A.mul(1 - alpha).add(ones_matrix.mul(alpha / numPages));

    //1 x numPages matrix
    let pi_init = Matrix.zeros(1, numPages)

    // Generate random row and column indices
    // const randomRowIndex = Math.floor(Math.random() * 1);
    const randomColIndex = Math.floor(Math.random() * numPages);

    // Set the random value to 1
    pi_init.set(0, randomColIndex, 1);

    let euclideanDistance = 1;
    let previous = pi_init;
    let current;

    let i = 0;

    while (euclideanDistance >= 0.0001){
        current = previous.mmul(P);
        euclideanDistance = eucFunc(previous.data, current.data);
        previous = current;
        ++i;
    }


    console.log("Loop ran", i, "times")


    function eucFunc(a, b) {
        return Math.hypot(...a.map((row, i) => Math.hypot(...row.map((val, j) => b[i][j] - val))));
    }

    let pageResults = []

    for(let i = 0; i < pages.length; ++i){
        try{
            await Page.findOneAndUpdate({url:pages[i].url}, {pageRank:current.get(0, i)});
            page = pages[i]
            pageResults[i] = {url: pages[i].url, pageRankVal: current.get(0,i)}
        }

        catch(err){
            console.log(err);
        }
    }

    // pageResults = pageResults.sort( (a, b) => (b.pageRankVal-a.pageRankVal)).slice(0,25)

    // console.log(pageResults)
}

