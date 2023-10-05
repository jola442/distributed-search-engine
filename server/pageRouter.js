const express = require('express');
let router = express.Router();

router.get("/", respondWithPages);
router.get("/:id", respondWithPage);
router.get("/popular", respondWithPopularPages);


async function respondWithPages(){

}

async function respondWithPage(){

}

async function respondWithPopularPages(){

}