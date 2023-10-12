const express = require('express');
const Page = require('./pageModel');
let router = express.Router();

router.get("/", respondWithPages);
router.get("/popular", respondWithPopularPages);
router.get("/:id", respondWithPage);

async function respondWithPages(req, res){
  let queryText = req.params.text;         // the search text the user is querying
  //find the documents in the database that contain queryText in page.content.pText, where page is a document from the database
  //perform the indexing according to the elasticlunr example Dave gave on these documents
  //return [{url: http://example.com, title: sampleTitle, searchScore: 2.4}], top 10 sorted searchScore
}

async function respondWithPage(req, res){
    const pageId = req.params.id;
    console.log(pageId)
    try{
        const page = await Page.findById(pageId);

        if(!page){
            res.status(404).json({error: 'the page cannot be found'});
            return;
        }

        console.log(page);
        //JSON with the neccessary information
        const response = {
            url: page.url,
            incomingLinks: page.incomingLinks,
        };

        res.json(response);

    } catch(error){
        console.error(error);
        res.status(500).json({error: 'server error'});
    }

}

async function respondWithPopularPages(req, res) {
    try {
      const popularPages = await Page.aggregate([
        {
          $project: {
            url: 1,
            incomingLinksCount: { $size: '$incomingLinks' },
          },
        },
        { $sort: { incomingLinksCount: -1 } },
        { $limit: 10 },
      ]);
  
      //  JSON with the required information
      const response = popularPages.map((page) => ({
        url: page.url,
        incomingLinks: page.incomingLinksCount,
      }));
  
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'server error' });
    }
  }
  
module.exports = router;
