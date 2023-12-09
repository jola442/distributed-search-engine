const TEST_FILE_NAMES = ["assignment2-data.txt"]
const NEIGHBOURHOOD_SIZES= [0,5,10,20,30,50,70,100,150];
const THRESHOLDS = [-1,0.1,0.2,0.4,0.5,0.7,0.9,1.0]
let fs = require('fs').promises;
let path = require('path');

//Input: The name of the file in server/lab6
//Output: A n x m matrix where n is the number of users and m is the number of items
async function extractUserInfo(filename){
    try {
        let fileContent = await fs.readFile(filename, 'utf8');
        let lines = fileContent.trim().split('\n');
        let users = lines[1].trim().split(' ');
        let items = lines[2].trim().split(' ');
        let ratings = [];
        for (let i = 3; i < lines.length; i++) {
          let userRatings = lines[i].trim().split(' ').map(Number);
          ratings.push(userRatings);
        }
        let parsedData = {
            users,
            items,
            ratings
        }
        return parsedData;
      } catch (err) {
        console.error('Error reading the file:', err);
      }
}

function populateMeanMap(ratingsMatrix){
    //meanMap = {userIdx: {avg: 20, count: 5}}
    const meanMap = {};

    for(let userIdx = 0; userIdx < ratingsMatrix.length; userIdx++){
        const userRatings = ratingsMatrix[userIdx];

        let sum = 0;
        let count = 0;

        for(let itemIndex = 0; itemIndex < userRatings.length; itemIndex++ ){
            if(userRatings[itemIndex] !== 0){
                sum += userRatings[itemIndex];
                count++;
            }
        }


        if(count > 0){
            const average = sum/count;
            meanMap[userIdx] = {avg: average, count: count };
        }

        else{
            meanMap[userIdx] = {avg:0, count:0}
        }
    }
    return meanMap;
}

//Input: ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//       userIdx is the user index of the rating being predicted
//       itemIdx is the item index of the rating being predicted
//       meanMap is an object of the form {0: {avg: 20, count: 5}} where 0 is the user index
//Output: an updated meanMap that excludes the rating at ratingsMatrix[userIdx][itemIdx] from the map
function updateMeanMap(userIdx, itemIdx, ratingsMatrix, meanMap, oldValue){
    if(!meanMap[userIdx]){
        // console.log(userIdx)
        // console.log(meanMap)
    }
   
    if(ratingsMatrix[userIdx][itemIdx] == 0){
        let old_sum = meanMap[userIdx].avg * meanMap[userIdx].count;
        let old_count = meanMap[userIdx].count;
        let excludeNum = oldValue;
        let new_sum = old_sum - excludeNum;
        let new_count = old_count - 1;
        let new_avg = new_sum/new_count;
        meanMap[userIdx] = {avg: new_avg, count: new_count};
    }

    else{
        let old_sum = meanMap[userIdx].avg * meanMap[userIdx].count;
        let old_count = meanMap[userIdx].count;
        let includeNum = ratingsMatrix[userIdx][itemIdx];
        let new_sum = old_sum + includeNum;
        let new_count = old_count + 1;
        let new_avg = new_sum/new_count;
        meanMap[userIdx] = {avg: new_avg, count: new_count};
    }
 

    return meanMap;
}

function populateItemRatings(ratingsMatrix){
    let itemRatings = {}
    for(let i = 0; i < ratingsMatrix.length; ++i){
        for(let j = 0; j < ratingsMatrix[0].length; ++j){
            if(!itemRatings[j]){
                itemRatings[j] = new Set();
            }

            if(ratingsMatrix[i][j] !== 0){
                itemRatings[j].add(i)
            }
        }
    }
    
    return itemRatings
}

function updateItemRatings(i, j, ratingsMatrix, itemRatings){
    // console.log(itemRatings)
    if(ratingsMatrix[i][j] == 0){
        itemRatings[j].delete(i)
        // console.log("deleting i from itemRatings["+j+"]", itemRatings[j])
    }

    else{
        itemRatings[j].add(i)
        // console.log("adding",i, "to itemRatings["+j+"]", itemRatings[j])
    }

    return itemRatings
}   

//Input: ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: A matrix where each entry is the user's rating of the product - the user's average rating
function populateRatingsDiffMatrix(ratingsMatrix, meanMap){
    const numRows = ratingsMatrix.length;
    const numCols = ratingsMatrix[0].length;
    let itemRatings = {}

    //calculate the rating difference matrix
    const diffMatrix = [];
    for(let i = 0; i < numRows; i++){
        diffMatrix.push([]);
        for(let j =0; j < numCols; j++){
            if(ratingsMatrix[i][j] === 0){
                diffMatrix[i].push('NA');
            } else{
                if(!itemRatings[j]){
                    itemRatings[j] = new Set();
                }
                itemRatings[j].add(i)
                diffMatrix[i].push(ratingsMatrix[i][j] - meanMap[i].avg);
            }
        }
    }
    return diffMatrix
}


//change ratingsDiffMatrix position to NA
//recalculate ratingsMatrixDiff entries for that user


function updateRatingsDiffMatrix(userIdx, itemIdx, ratingsMatrix, ratingsDiffMatrix, meanMap, itemRatings){
    let userRatingDiffs = ratingsDiffMatrix[userIdx]
    // console.log("meanMap in updateRatingsDiffMatrix()", meanMap)
    // console.log("userRatingDiffs", userRatingDiffs)
    // console.log("itemRatings before func", itemRatings)

    if(ratingsMatrix[userIdx][itemIdx] == 0){
        // console.log("itemRatings", itemRatings)
        itemRatings[itemIdx].delete(userIdx);
        // console.log("after deleting", userIdx, "from itemRatings["+itemIdx+"]", itemRatings)
    }

    else{
        // console.log("itemRatings", itemRatings)
        itemRatings[itemIdx].add(userIdx)
        // console.log("after adding", userIdx, "to itemRatings["+itemIdx+"]", itemRatings)

    }
    
    for(let i = 0; i < userRatingDiffs.length; ++i){
        if(ratingsMatrix[userIdx][i] === 0){
            userRatingDiffs[i] = "NA"
        }

        else{
            // console.log(ratingsMatrix[userIdx][i], "-", meanMap[userIdx].avg, "=", ratingsMatrix[userIdx][i] - meanMap[userIdx].avg)
            userRatingDiffs[i] = ratingsMatrix[userIdx][i] - meanMap[userIdx].avg
            itemRatings[i].add(userIdx)
        }
    }
 
    // console.log("ratingsDiff after func",ratingsDiffMatrix)
    // console.log("itemRatings after func", itemRatings)
    

    return ratingsDiffMatrix;
}

//Input: itemA and itemB are the integers representing the indicies of the items in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: float representing the adjusted cosine similarity between the two items
function getSimilarity(itemA, itemB, ratingsDiffMatrix, itemRatings){
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
    // let itemA_Matrix = [];
    // let itemB_Matrix = []
    // for (let i = 0; i < ratingsDiffMatrix.length; ++i) {
    //     itemA_Matrix.push(ratingsDiffMatrix[i][itemA]);
    //     itemB_Matrix.push(ratingsDiffMatrix[i][itemB]);
    // }
    // if(itemA == 49){console.log(itemRatings)}

    if(!itemRatings.hasOwnProperty(itemA) || !itemRatings.hasOwnProperty(itemB)){
        return 0
    }
    let usersWhoRatedItemA = itemRatings[itemA]
    let usersWhoRatedItemB = itemRatings[itemB]
    
    const usersWhoRatedBothItems = new Set([...usersWhoRatedItemA].filter(value => usersWhoRatedItemB.has(value)));

    for(const user of usersWhoRatedBothItems){
        numerator += ratingsDiffMatrix[user][itemA] * ratingsDiffMatrix[user][itemB];
        denomA += Math.pow(ratingsDiffMatrix[user][itemA], 2)
        denomB += Math.pow(ratingsDiffMatrix[user][itemB], 2)
    }
    // for(let i = 0; i < ratingsDiffMatrix.length; ++i){
    //     if (itemA_Matrix[i] !== "NA" && itemB_Matrix[i] !== "NA") {
            // numerator += (itemA_Matrix[i]) * (itemB_Matrix[i]);
            // denomA += Math.pow(itemA_Matrix[i], 2)
            // denomB += Math.pow(itemB_Matrix[i], 2)
    //     }
    // }

    let sim = numerator/ ((Math.sqrt(denomA)) * (Math.sqrt(denomB)))

    if(!isNaN(sim)){
        return sim
    }

    return 0
}

function populateSimMatrix(ratingsMatrix, ratingsDiffMatrix, itemRatings){
    let simMatrix = []
    for(let i = 0; i < ratingsMatrix[0].length; ++i){
        itemSimilarities = []
        for(let j = 0; j < ratingsMatrix[0].length; ++j){
            if(i == j){
                itemSimilarities.push(0)

            }

            else{
                if(simMatrix[j] && simMatrix[j][i]){
                    itemSimilarities.push(simMatrix[j][i])
                }

                else{
                    let sim = getSimilarity(i, j, ratingsDiffMatrix, itemRatings)
                    itemSimilarities.push(sim)
                }
     
            }
        }
        simMatrix.push(itemSimilarities)
    }
    return simMatrix;
}


//ratingsMatrix
// 0 0 5 6 2
// 1 3 5 7 9

//ratingsDiffMatrix
// NA -1 1 2 -2
// -4 -2 0 2  4
function updateSimMatrix(userIdx, itemIdx, ratingsMatrix, ratingsDiffMatrix, simMatrix, itemRatings){
    // console.log("Sim Matrix", simMatrix)
    //given that a user's predicted rating of an item is to be calculated,
    //calculate the similarity between the user and all other users who have rated the item
    for(let i = 0; i < ratingsMatrix[0].length; ++i){
        if(i == itemIdx) continue

        //if the user the system is predicting for has rated the item 
        if(ratingsMatrix[userIdx][i] !== 0){
            let sim = getSimilarity(itemIdx, i, ratingsDiffMatrix, itemRatings)
            simMatrix[itemIdx][i] = sim
        }

        else{
            simMatrix[itemIdx][i] = 0
        }
    }

    return simMatrix
}

//Input: similarities is an object with item indicies as keys and their similarities with a specified item as values
//Output: a sorted 2D array (by similarity values), the first element of each inner array is the item index, the second element is the similairity with a specified item,
function getTopKNeighbours(similarities, k, hasNegativeSims){
    let similaritiesList = Object.entries(similarities);
    similaritiesList = hasNegativeSims? similaritiesList.filter(entry => (entry[1] > 0 || entry[1] < 0)): similaritiesList.filter(entry => (entry[1] > 0))
    // similaritiesList = similaritiesList.sort( (a, b) => (b[1]-a[1]) );
    similaritiesList = similaritiesList.sort( (a, b) => (Math.abs(b[1])-Math.abs(a[1])) );
    return similaritiesList.slice(0, k);
}

function getNeighboursAboveThreshold(similarities, t, hasNegativeSims){
    let similaritiesList = Object.entries(similarities);
    similaritiesList = hasNegativeSims? similaritiesList.filter(entry => (Math.abs(entry[1]) > t)):similaritiesList.filter(entry => (entry[1] > t))
    return similaritiesList
}


//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//Output: integer representing user's predicted rating for item itemNum
function predictRating(users, items, user, itemNum, ratingsMatrix, meanMap, simMatrix, k, t, hasNegativeSims){
    let user_avg = meanMap[user].avg
    let similaritiesList = []
    if(k){
        similaritiesList = getTopKNeighbours(simMatrix[itemNum], k, hasNegativeSims)
    }

    else if(t){
        similaritiesList = getNeighboursAboveThreshold(simMatrix[itemNum], t, hasNegativeSims)
    }


    // console.log("Max similarities", similaritiesList)
    let numerator = 0;
    let denominator = 0;

    for(let j = 0; j < similaritiesList.length; ++j){
        let i = similaritiesList[j][0]
        let r_ui = ratingsMatrix[user][i]
        let sim_ip = similaritiesList[j][1]
        if(sim_ip < 0 )continue
                
        // console.log(sim_ip, "*", r_ui,)
        numerator += (sim_ip * r_ui)
        denominator += sim_ip
    }

    let predictedRating = hasNegativeSims?numerator/Math.abs(denominator):numerator/denominator;

    if(!isNaN(predictedRating)){
        if(predictedRating > 5){
            predictedRating = 5
        }

        else if(predictedRating < 1){
            predictedRating = 1
        }
        predictedRating = Math.round(predictedRating*100)/100;
    }

    else{
        predictedRating = user_avg
    }

    // console.log("Predicting for user:", users[user])
    // console.log("Predicting for item", items[itemNum])
    // console.log("Found", similaritiesList.length, "valid neighbours:")
    // for(let i = 0; i < similaritiesList.length; ++i){
    //     console.log(i+1 + ".", items[similaritiesList[i][0]], "sim = ", similaritiesList[i][1])
    // }
    // console.log()
    // console.log("Predicted rating:", predictedRating, "\n")
    return predictedRating
}


function populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, k, t, hasNegativeSims){
    let predMatrix = []
    let predCount = 0
    // console.log("meanMap before loop", meanMap)

    for(let i = 0; i < ratingsMatrix.length; ++i){
        let innerArr = []
        for(let j = 0; j < ratingsMatrix[0].length; ++j){
            let predictedRating = 0
            //predict the ratings of all non-zero ratings provided by users
            if(ratingsMatrix[i][j] !== 0){
                //change the rating of the item we want to predict to 0 and remember its actual rating
                let oldValue = ratingsMatrix[i][j]
                ratingsMatrix[i][j] = 0
                meanMap = updateMeanMap(i, j, ratingsMatrix, meanMap, oldValue)
                // console.log("meanMap after 1st update", meanMap)
                itemRatings = updateItemRatings(i, j, ratingsDiffMatrix, itemRatings)
                // console.log("itemRatings before 1st update", itemRatings)
                ratingsDiffMatrix = updateRatingsDiffMatrix(i, j, ratingsMatrix, ratingsDiffMatrix, meanMap, itemRatings)
                // console.log("newRatingsDiffMatrix",ratingsDiffMatrix)
                // console.log("newItemRatings", itemRatings)
                let updatedSimMatrix = updateSimMatrix(i, j, ratingsMatrix, ratingsDiffMatrix, simMatrix, itemRatings)
                predictedRating = predictRating(users, items, i, j, ratingsMatrix, meanMap, updatedSimMatrix, k, t, hasNegativeSims)
                //reset the rating of the item back to its original value
                ratingsMatrix[i][j] = oldValue
                meanMap = updateMeanMap(i, j, ratingsMatrix, meanMap, 0)
                // console.log("meanMap after 2nd update", meanMap)
                itemRatings = updateItemRatings(i, j, ratingsMatrix, itemRatings)
                ratingsDiffMatrix = updateRatingsDiffMatrix(i, j, ratingsMatrix, ratingsDiffMatrix, meanMap, itemRatings)
                predCount++;
            }
            innerArr.push(predictedRating)
        }
        predMatrix.push(innerArr)
    }
    return [predMatrix, predCount]
    //for all ratings != 0, remove the rating and predict it
    //return predCount
}


function calculateMAE(predMatrix, ratingsMatrix, predCount){
    let numerator = 0
    for(let i = 0; i < predMatrix.length; ++i){
        for(let j = 0; j < predMatrix[0].length; ++j){
            if(ratingsMatrix[i][j] != 0){
                numerator += Math.abs(predMatrix[i][j]-ratingsMatrix[i][j])
            }
        }
    }

    MAE = numerator/predCount
    return MAE
}

function testTopKNeighbours(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings){
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;
    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let startTime = performance.now();
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        let endTime = performance.now()
        let finalTime = (endTime - startTime)/1000
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE)
        console.log("Execution time = ", finalTime, "\n")
    }

    
    hasNegativeSims = true;
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Including Negative Similarities")
    console.log("-----------------------------------------------------------")

    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let startTime = performance.now();
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        let endTime = performance.now()
        let finalTime = (endTime - startTime)/1000
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE)
        console.log("Execution time = ", finalTime, "\n")
    }

}

function testNeighboursAboveThreshold(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings){
    console.log("-----------------------------------------------------------")
    console.log("Threshold Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let startTime = performance.now();
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        let endTime = performance.now();
        let finalTime = (endTime - startTime)/1000;
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE)
        console.log("Execution time = ", finalTime, "\n")
    }

    
    hasNegativeSims = true;
    console.log("-----------------------------------------------------------")
    console.log("Threshold Including Negative Similarities")
    console.log("-----------------------------------------------------------")

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let startTime = performance.now();
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        let endTime = performance.now();
        let finalTime = (endTime - startTime)/1000;
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE)
        console.log("Execution time = ", finalTime, "\n")
    }
}

//for every missing index, perform 
async function main(){
    console.time("main")
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let parsedData = await extractUserInfo(filename);
        let users = parsedData.users;
        let items = parsedData.items;
        let ratingsMatrix = parsedData.ratings;
        console.log("populating meanMap")
        let meanMap = populateMeanMap(ratingsMatrix)
        console.log("populating itemRatings")
        let itemRatings = populateItemRatings(ratingsMatrix)
        // console.log("ItemRatings",itemRatings)
        console.log("populating ratingsDiffMatrix")
        let ratingsDiffMatrix = populateRatingsDiffMatrix(ratingsMatrix, meanMap)
        console.log("populating simMatrix")
        let simMatrix = populateSimMatrix(ratingsMatrix, ratingsDiffMatrix, itemRatings)
        console.log("done populating simMatrix...")
        
        console.log("Filename", filename)
        testTopKNeighbours(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings)
        testNeighboursAboveThreshold(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings)
    }
    console.timeEnd("main")
}


main();
