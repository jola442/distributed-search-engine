const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
let router = express.Router();

router.get("/", respondWithFruits);
router.get("/:id", respondWithFruit);

//send back JSON with {_id, name, url, title, score, pr}
async function respondWithFruit(req, res){

}

//send back JSON with {_id, url, title, pr, incomingLinks, outgoingLinks, wordFrequency}
async function respondWithFruits(req, res){

}


module.exports = router;
