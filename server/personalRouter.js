const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
let router = express.Router();

router.get("/", respondWithPersonalPages);
router.get("/:id", respondWithPersonalPage);

//send back JSON with {_id, name, url, title, score, pr}
async function respondWithPersonalPages(req, res){

}


//send back JSON with {_id, url, title, pr, incomingLinks, outgoingLinks, wordFrequency}
async function respondWithPersonalPage(req, res){

}


module.exports = router;
