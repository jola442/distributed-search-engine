const elasticlunr = require("elasticlunr");
const express = require('express');
const Page = require('./pageModel');
//const pageRank = require('./pageRank');
const router = express.Router();
const NAMES = "Jola Ajayi, Stephen Akinpelu, Ayomide Awonaya";
const MAX_WORD_FREQUENCY = 10;

router.get("/", respondWithFruitPages);
router.get("/:id", respondWithFruitPage);

//send back JSON with {_id, url, title, pr, incomingLinks, outgoingLinks, wordFrequency}
async function respondWithFruitPage(req, res) {
    try {
      const id = req.params.id;
      const page = await Page.findOne({ _id: id, type: "fruits" }).populate([
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
        res.status(404).json({ error: 'Fruit page not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

//send back JSON with {_id, name, url, title, score, pr}
async function respondWithFruitPages(req, res){
  let queryText = req.query.q;
  console.log(queryText)
  let boost = req.query.boost === "true";
  let limit = Number(req.query.limit);
  let results;

  //set limit parameter
  if (isNaN(limit) || limit < 1 || limit > 50){
      console.log("limit must be greater than 1 or less than 50")
      limit = 10
  }
  //search for the page with the given parameters
  if(queryText){
    results = await Page.find({ $text: { $search: queryText }, type:"fruits" }).limit(limit).exec();
  }

  //if q='', return limit results that have non-empty paragraph text
  else{
    results = await Page.find({
      'content.pText': { $exists: true, $ne: ""},
      "type":"fruits"
    }).limit(limit);
    let response = []
    results.forEach((result) => {
      const doc = {
        _id:result._id,
        url: result.url,
        "content.pText": result.content.pText,
        pr : result.pageRank,
        title:result.content.title,
        score:0
      };
      response.push(doc);
    });
    res.status(200).json(response);
    return;
  }

  console.log("results after initial search", results.length)

  //if there still aren't up to <limit> results, add <limit>-results.length results
  if(results.length < limit){
    let addDoc = limit - results.length;
    let existingUrls = results.map(entry => entry.url);
    let randomDocs = await Page.aggregate([
      { $match: { url: { $nin: existingUrls }, type: "fruits" } },
      { $sample: { size: addDoc } }
    ]).limit(limit-results.length);
    //let addDocs = await Page.find().limit(addDoc);
    randomDocs.forEach((result) => {
      results.push(result);
      // {
      //   url: result.url,
      //   "content.pText": result.content.pText,
      //   pr : result.pageRank,
      // })
  })
  let response = []
  results.forEach((result) => {
    const doc = {
      _id:result._id,
      url: result.url,
      "content.pText": result.content.pText,
      pr : result.pageRank,
      title:result.content.title,
      score:0
    };
    response.push(doc);
  });
  res.status(200).json(response);
  return;
  // console.log("Random docs length:",randomDocs.length);
  // console.log("Results length", results.length);
}

  
  //let boostSearch = boost = true;

  //console.log('results:', results.length);  
  //calculate the search score
  try{
      const index = elasticlunr(function () {
        this.addField('title')
        this.addField('content.pText');
        this.setRef('url');
        this.addField('pageRank');
      });
      results.forEach((result) => {
        const doc = {
          url: result.url,
          "content.pText": result.content.pText,
          pr : result.pageRank,
          title:result.title
        };
        index.addDoc(doc);
     
    });
    let response = index.search(queryText, {});
    console.log("Response length", response.length);
    // console.log(response)

    //Generate response object because response only returns ref and score
    response = response.map( (entry) => {
      let result = results.find(r => r.url === entry.ref);
      // console.log("Result", result)
      entry.url = entry.ref;
      entry.title = result.content.title;
      entry._id = result._id;
      entry.pr = result.pageRank
      delete entry.ref;
      return entry;
    })


    if (boost) {
        response.sort((a, b) => (b.score * b.pr) - (a.score * a.pr));
    }

    else{
      response.sort((a, b) => (b.score - a.score));
    }
   
    console.log(response.length)
  

    // response = response.slice(0,limit);
    // console.log("response",response)

    //let response = index.search(queryText, {}).sort( (a, b) => b.score - a.score).slice(0,10);
    
    // const promises = response.map(async (entry) => {
    //   // console.log("url",entry.ref);
    //   let contentObj = await Page.findOne({ url: entry.url }).select("content.title").exec();
      // entry.title = contentObj.content.title;
      // entry.url = entry.url;
      // entry.score = 0;
      // delete entry.ref;
      // return entry;
    // });

    // const resolvedResponse = await Promise.all(promises);
    // console.log("Response",response.map( (r) => (r.url)));
    res.status(200).json(response);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'server error' });
  
}
}

module.exports = router;