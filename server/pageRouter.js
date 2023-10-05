const express = require('express');
const Page = require('./pageModel');
let router = express.Router();


router.get("/:id", respondWithPage);
router.get("/popular", respondWithPopularPages);




async function respondWithPage(){
    const pageId = req.params.id;
    try{
        const page = await page.findById(pageId);
        if(!page){
            return res.status(404).json({error: 'the page cannot be found'});
        }

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
  
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'server error' });
    }
  }
  
module.exports = router;
