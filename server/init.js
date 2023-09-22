const Product = require("./ProductModel")
const products = require("./products.json");
let productsInserted = 0;

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
            await prod.save();
            productsInserted++;
        }
    }

    catch(err){
        console.log(err.message);
    }

    finally{
        console.log("Inserted", productsInserted, "products");
        return;
    }
}