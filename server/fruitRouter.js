const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
//const pageRank = require('./pageRank');
let router = express.Router();

router.get("/", respondWithFruits);
//router.get("/:id", respondWithFruit);

//send back JSON with {_id, name, url, title, score, pr}
async function respondWithFruits(req, res){
    let queryText = req.query.text;
    let boost = req.query.boost === "true";
    let limit = Number(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 50){
        console.log("limit must be greater than 1 or less than 50")
        limit = 10
      }
  
    const results = await Page.find({ $text: { $search: queryText } }).exec();
    //let boostSearch = boost = true;
  
    //console.log('results:', results.length);  
    try{
        const index = elasticlunr(function () {
          this.addField('content.pText');
          this.setRef('url');
          this.addField('pageRank');
        });
        results.forEach((result) => {
          const doc = {
            url: result.url,
            "content.pText": result.content.pText,
            pageRank : result.pageRank,
          };
          index.addDoc(doc);
       
      });
      let response = index.search(queryText, {});
      if (boost === true) {
          // Apply the boost based on pageRank score
      response = response.map(entry => ({
        ...entry,
        // Attach the pageRank from the original results
        pageRankVal: results.find(r => r.url === entry.ref).pageRank
      })).sort((a, b) => (b.score * b.pageRankVal) - (a.score * a.pageRankVal));
    }
      else{
        response = response.map(entry => ({
          ...entry,
          // Attach the pageRank from the original results
          pageRankVal: results.find(r => r.url === entry.ref).pageRank
        })).sort((a, b) => (b.score - a.score));
      }
      if(response.length < limit){
        let addDoc = limit - response.length;
        let existingUrls = response.map(entry => entry.ref);
        let randomDocs = await Page.aggregate([
          { $match: { url: { $nin: existingUrls } } },
          { $sample: { size: addDoc } }
        ]);
        //let addDocs = await Page.find().limit(addDoc);
        randomDocs.forEach((result) => {
          response.push({
            url: result.url,
            "content.pText": result.content.pText,
            pageRankVal : result.pageRank,
          })
      })
    }

      response = response.slice(0,limit);

      //let response = index.search(queryText, {}).sort( (a, b) => b.score - a.score).slice(0,10);
      
      const promises = response.map(async (entry) => {
        let contentObj = await Page.findOne({ url: entry.ref }).select("content.title -_id").exec();
        entry.title = contentObj.content.title;
        entry.url = entry.ref;
        delete entry.ref;
        return entry;
      });
  
      const resolvedResponse = await Promise.all(promises);
      console.log("Response",response)
      res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
    
  }
}

module.exports = router;