const express = require('express');
const path = require('path');
const app = express();
let productRouter = require("./productRouter");


app.listen(process.env.PORT || 5000);
app.use(express.json());
// app.use(cors());
app.use("/products", productRouter);






// 5. A way to retrieve and view only the reviews for a specific product. The server should
// support the client requesting either JSON or HTML representations.

console.log("Server listening at http://localhost:5000");