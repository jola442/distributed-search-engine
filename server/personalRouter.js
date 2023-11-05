const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
let router = express.Router();
const NAMES = "Jola Ajayi, Stephen Akinpelu, Ayomide Awonaya";
const MAX_WORD_FREQUENCY = 10;

router.get("/", respondWithPersonalPages);
router.get("/:id", respondWithPersonalPage);

//send back JSON with {_id, url, title, pr, incomingLinks, outgoingLinks, wordFrequency}
async function respondWithPersonalPage(req, res) {
  try {
    const id = req.params.id;
    const page = await Page.findOne({ _id: id, type: "personal" }).populate([
      {path:"incomingLinks", select:"url -_id"},
      {path:"outgoingLinks", select:"url -_id"}
    ]
      );
    if (page) {
      // Calculate word frequency
      const words = page.content.pText.split(/\s+/).filter( (word) => (word !== ""));
      let wordFrequencySet = {}; //stores the word as the key and its index in wordFrequency as a value
      let wordFrequency = [] //2D array with each word as an array of [word, wordCount]

      for (let i = 0; i < words.length; ++i) {
          const word = words[i]
          if (wordFrequencySet.hasOwnProperty(word)) {
              let index = wordFrequencySet[word]
              wordFrequency[index][1]++;
          } else {
              wordFrequencySet[word] = wordFrequency.length;
              wordFrequency.push([word, 1]);
          }
      }

      //remove empty strings and sort wordFrequency
      wordFrequency = wordFrequency.sort((a, b) => (b[1]-a[1])).slice(0, MAX_WORD_FREQUENCY);

      // Create the response object
      const response = {
        _id:page._id,
        name: NAMES,
        url: page.url,
        title: page.content.title,
        pr: page.pageRank,
        incomingLinks:page.incomingLinks.map( (link) => (link.url)),
        outgoingLinks:page.outgoingLinks.map( (link) => (link.url)),
        wordFrequency,
      };
      res.status(200).json(response);
    } else {
      res.status(404).json({ error: 'Personal page not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//send back JSON with {_id, name, url, title, score, pr}
async function respondWithPersonalPages(req, res){
  let queryText = req.query.q;
  console.log("got here");
  console.log(queryText)
  let boost = req.query.boost === "true";
  let limit = Number(req.query.limit);
  let results;
  // let results = [];

  if (isNaN(limit) || limit < 1 || limit > 50){
      console.log("limit must be greater than 1 or less than 50")
      limit = 10
  }
  if(queryText){
    results = await Page.find({ $text: { $search: queryText } }).exec();
  }
  else{
    results = await Page.find({
      'content.pText': { $exists: true, $ne: "" }
    }).limit(limit);

  }

  // res.json(results);

  
  let boostSearch = boost = true;

  console.log('results:', results.length);  
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
      // Attach the id and pageRank from the original results
      _id: results.find(r => r.url === entry.ref)._id,
      pageRankVal: results.find(r => r.url === entry.ref).pageRank
    })).sort((a, b) => (b.score * b.pageRankVal) - (a.score * a.pageRankVal));
  }
    else{
      response = response.map(entry => ({
        ...entry,
        // Attach the id and pageRank from the original results
        _id: results.find(r => r.url === entry.ref)._id,
        pageRankVal: results.find(r => r.url === entry.ref).pageRank
      })).sort((a, b) => (b.score - a.score));
    }
  
    if(!queryText || response.length < limit){
      let addDoc = limit - response.length;
      let existingUrls = response.map(entry => entry.ref);
      let randomDocs = await Page.aggregate([
        { $match: { url: { $nin: existingUrls }, type: "personal" } },
        { $sample: { size: addDoc } }
      ]);
      //let addDocs = await Page.find().limit(addDoc);
      randomDocs.forEach((result) => {
        response.push({
          url: result.url,
          "content.pText": result.content.pText,
          pageRankVal : result.pageRank,
          _id: result._id
        })
    })
  }

    response = response.slice(0,limit);
    console.log("response",response)

    //let response = index.search(queryText, {}).sort( (a, b) => b.score - a.score).slice(0,10);
    
    const promises = response.map(async (entry) => {
      console.log("url",entry.ref);
      let contentObj = await Page.findOne({ url: entry.url }).select("content.title").exec();
      entry.title = contentObj.content.title;
      entry.url = entry.url;
      entry.score = 0;
      delete entry.ref;
      return entry;
    });

    const resolvedResponse = await Promise.all(promises);
    console.log("Response",response.map( (r) => (r.url)));
    res.status(200).json(response);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'server error' });
  
}
}

module.exports = router;

//send back JSON with {_id, url, title, pr, incomingLinks, outgoingLinks, wordFrequency}



module.exports = router;
