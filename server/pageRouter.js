const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
let router = express.Router();

router.get("/", respondWithPages);
router.get("/popular", respondWithPopularPages);
router.get("/:id", respondWithPage);

async function respondWithPages(req, res){
  let queryText = req.query.text;

  const results = await Page.find({ 'content.pText': { $regex: new RegExp(queryText, 'i') } });
  console.log('results:', results.length);  
  try{
    const index = elasticlunr(function () {
      this.addField('url');
      this.addField('content.pText');
      this.setRef('url');
    });
    results.forEach((result) => {
      const doc = {
        url: result.url, // Replace 'url' with the actual field name in your result object
        "content.pText": result.content.pText, // Replace 'content' with the actual field name in your result object
      };
      index.addDoc(doc);
     
    });

    let response = index.search(queryText, {}).sort( (a, b) => b.score - a.score).slice(0,10);

    res.status(200).json(response);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'server error' });
  
}
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
