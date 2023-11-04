const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
let router = express.Router();

router.get("/", respondWithPersonalPages);
router.get("/:id", respondWithPersonalPage);

//send back JSON with {_id, name, url, title, score, pr}
// Send back JSON with {_id, name, url, title, score, pr, wordFrequency}
async function respondWithPersonalPages(req, res) {
    try {
      const id = req.params.id;
      const page = await Page.findOne({ _id: id, type: 'personal' });
      if (page) {
        const {
          _id,
          url,
          content: { title, pText },
          pr,
        } = page;
  
        // Calculate word frequency
        const words = pText.split(/\s+/);
        const wordFrequency = {};
  
        for (const word of words) {
          if (wordFrequency[word]) {
            wordFrequency[word]++;
          } else {
            wordFrequency[word] = 1;
          }
        }
  
        // Replace the placeholders with actual data
        const name = "Your Name"; // Replace with the actual name.
        const score = 4.5; // Replace with the actual score.
  
        // Create the response object
        const response = {
          _id,
          name,
          url,
          title,
          score,
          pr,
          wordFrequency,
        };
  
        res.json(response);
      } else {
        res.status(404).json({ message: 'Personal page not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  


//send back JSON with {_id, url, title, pr, incomingLinks, outgoingLinks, wordFrequency}
async function respondWithPersonalPage(req, res){

}


module.exports = router;
