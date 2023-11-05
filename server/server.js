const express = require('express');
const app = express();
const productRouter = require("./productRouter");
const orderRouter = require("./orderRouter")
const pageRouter = require("./pageRouter")
const fruitRouter = require("./fruitRouter")
const personalRouter = require("./personalRouter.js")
const config = require("./config.json")

const mongoose = require("mongoose");

mongoose.connect(config.MONGO_DB_URI, {useNewUrlParser:true});
db = mongoose.connection;

db.on("connected", function(){
    console.log("Database is connected successfully")
})

db.on("disconnected", function(){
    console.log("Database is disconnected successfully")
})

db.on("error", console.error.bind(console, "connectection error:"));



app.listen(process.env.PORT || 3001);
app.use(express.json());


// app.use(cors());
app.use("/products", productRouter);
app.use("/orders", orderRouter)
app.use("/pages", pageRouter)
app.use("/fruits", fruitRouter)
app.use("/personal", personalRouter)





// 5. A way to retrieve and view only the reviews for a specific product. The server should
// support the client requesting either JSON or HTML representations.
//test

console.log("Server listening at http://localhost:3001");