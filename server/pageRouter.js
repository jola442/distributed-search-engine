const express = require('express');
const Page = require('./pageModel');
let router = express.Router();

router.get("/popular", respondWithPopularPages);
router.get("/:id", respondWithPage);

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
