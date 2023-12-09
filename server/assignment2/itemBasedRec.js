const TEST_FILE_NAMES = ["parsed-data-trimmed.txt"]
const NEIGHBOURHOOD_SIZES= [5];
// const TEST_FILE_NAMES = ["test.txt"]
// const NEIGHBOURHOOD_SIZES= [2];
const THRESHOLDS = [0.5]
let fs = require('fs').promises;
let path = require('path');

//Input: filename - the name of the data file
//Output: An object containing the an array of user names (users), item names (items) and a 2D array of item ratings (ratingsMatrix)
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

//Input: ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//Output: meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
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

//Input: userIdx - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       itemIdx - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       oldValue - The value of the rating before it wa
//Output: an updated meanMap that reflects the change in the rating of the item at <itemIdx> by the user at <userIdx>
function updateMeanMap(userIdx, itemIdx, ratingsMatrix, meanMap, oldValue){
    //updating the meanMap to reflect the rating was taken out in the leave-one-out cross-validation strategy
    if(ratingsMatrix[userIdx][itemIdx] == 0){
        let old_sum = meanMap[userIdx].avg * meanMap[userIdx].count;
        let old_count = meanMap[userIdx].count;
        let excludeNum = oldValue;
        let new_sum = old_sum - excludeNum;
        let new_count = old_count - 1;
        let new_avg = new_sum/new_count;
        meanMap[userIdx] = {avg: new_avg, count: new_count};
    }

    //updating the meanMap to reflect the rating was brought back in after the leave-one-out cross-validation strategy
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

//Input: ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//Output: itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
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

//Input: i - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       j - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//Output: An updated itemsRatings object that reflects the rating change
function updateItemRatings(i, j, ratingsMatrix, itemRatings){
    if(ratingsMatrix[i][j] == 0){
        itemRatings[j].delete(i)
    }

    else{
        itemRatings[j].add(i)
    }

    return itemRatings
}   

//Input: ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//Output: ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
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


//Input: userIdx - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       itemIdx - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//Output: ratingsDiffMatrix - an updated ratingsDiffMatrix that reflects the change in the rating of the item at <itemIdx> by the user at <userIdx>    
function updateRatingsDiffMatrix(userIdx, itemIdx, ratingsMatrix, ratingsDiffMatrix, meanMap, itemRatings){
    let userRatingDiffs = ratingsDiffMatrix[userIdx]

    //if the rating was taken out
    if(ratingsMatrix[userIdx][itemIdx] == 0){
        itemRatings[itemIdx].delete(userIdx);
    }

    //if the rating was brought back in
    else{
        itemRatings[itemIdx].add(userIdx)
    }
    
    //recalculating the ratingDiffMatrix for the user at <userIdx>
    for(let i = 0; i < userRatingDiffs.length; ++i){
        if(ratingsMatrix[userIdx][i] === 0){
            userRatingDiffs[i] = "NA"
        }

        else{
            userRatingDiffs[i] = ratingsMatrix[userIdx][i] - meanMap[userIdx].avg
            itemRatings[i].add(userIdx)
        }
    }
 

    return ratingsDiffMatrix;
}

//Input: itemA, itemB - indicies of the items in items
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//Output: A float representing the adjusted cosine similarity between the two items
function getSimilarity(itemA, itemB, ratingsDiffMatrix, itemRatings){
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
 
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

    let sim = numerator/ ((Math.sqrt(denomA)) * (Math.sqrt(denomB)))

    if(!isNaN(sim)){
        return sim
    }

    return 0
}

//Input: ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//Output: simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the item at index i and the item at index j
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


//Input: userIdx - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       itemIdx - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       simMatrix - an m x m matrix where m is the number of items and the entry at simMatrix[i][j] is the similarity between the item at index i and the item at index j
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//Output: simMatrix - an updated simMatrix that reflects the change in the rating of the item at <itemIdx> by the user at <userIdx>   
function updateSimMatrix(userIdx, itemIdx, ratingsMatrix, ratingsDiffMatrix, simMatrix, itemRatings){
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

//Input: similarities - an object with item indicies as keys and their similarities with a specified item as values
//       k - the number of neighbours
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: a sorted 2D array (by absolute similarity values), the first element of each inner array is the item index, the second element is the similairity with a specified item
function getTopKNeighbours(similarities, k, hasNegativeSims){
    let similaritiesList = Object.entries(similarities);
    similaritiesList = hasNegativeSims? similaritiesList.filter(entry => (entry[1] > 0 || entry[1] < 0)): similaritiesList.filter(entry => (entry[1] > 0))
    // similaritiesList = similaritiesList.sort( (a, b) => (b[1]-a[1]) );
    similaritiesList = similaritiesList.sort( (a, b) => (Math.abs(b[1])-Math.abs(a[1])) );
    return similaritiesList.slice(0, k);
}

//Input: similarities - an object with item indicies as keys and their similarities with a specified item as values
//       t - the threshold
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: a sorted 2D array of items with similarites greater than t. The first element of each inner array is the item index, the second element is the similairity with a specified item
function getNeighboursAboveThreshold(similarities, t, hasNegativeSims){
    let similaritiesList = Object.entries(similarities);
    similaritiesList = hasNegativeSims? similaritiesList.filter(entry => (Math.abs(entry[1]) > t)):similaritiesList.filter(entry => (entry[1] > t))
    return similaritiesList
}


//Input: users - an array of user names
//       items - an array of item names
//       userIdx - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       itemIdx - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an m x m matrix where m is the number of items and the entry at simMatrix[i][j] is the similarity between the item at index i and the item at index j
//       k - the number of most similar neighbours to select
//       t - the threshold of similarity
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: predictedRating - a float representing the user at <userIdx>'s predicted rating of the item at <itemIdx>.
function predictRating(users, items, userIdx, itemIdx, ratingsMatrix, meanMap, simMatrix, k, t, hasNegativeSims){
    let user_avg = meanMap[userIdx].avg
    let similaritiesList = []
    if(k){
        similaritiesList = getTopKNeighbours(simMatrix[itemIdx], k, hasNegativeSims)
    }

    else if(t){
        similaritiesList = getNeighboursAboveThreshold(simMatrix[itemIdx], t, hasNegativeSims)
    }


    let numerator = 0;
    let denominator = 0;

    for(let j = 0; j < similaritiesList.length; ++j){
        let i = similaritiesList[j][0]
        let r_ui = ratingsMatrix[userIdx][i]
        let sim_ip = similaritiesList[j][1]
        if(sim_ip < 0 )continue
                
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
    // console.log("Predicting for item", items[itemIdx])
    // console.log("Found", similaritiesList.length, "valid neighbours:")
    // for(let i = 0; i < similaritiesList.length; ++i){
    //     console.log(i+1 + ".", items[similaritiesList[i][0]], "sim = ", similaritiesList[i][1])
    // }
    // console.log()
    // console.log("Predicted rating:", predictedRating, "\n")
    return predictedRating
}

//Input: users - an array of user names
//       items - an array of item names
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an m x m matrix where m is the number of items and the entry at simMatrix[i][j] is the similarity between the item at index i and the item at index j
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//       k - the number of most similar neighbours to select
//       t - the threshold of similarity
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: [predMatrix, predCount]
//        predMatrix - a 2D matrix where each entry corresponds to the predicted rating if the rating at ratingsMatrix was taken out in the leave-one-out cross-validation strategy
//        predCount - the number of predictions made
function populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, k, t, hasNegativeSims){
    let predMatrix = []
    let predCount = 0

    for(let i = 0; i < ratingsMatrix.length; ++i){
        let innerArr = []
        for(let j = 0; j < ratingsMatrix[0].length; ++j){
            let predictedRating = 0
            //predict the ratings of all non-zero ratings provided by users
            if(ratingsMatrix[i][j] !== 0){
                //change the rating of the item we want to predict to 0 and store its actual rating
                let oldValue = ratingsMatrix[i][j]
                ratingsMatrix[i][j] = 0

                //update the necessary data structures to reflect the change
                meanMap = updateMeanMap(i, j, ratingsMatrix, meanMap, oldValue)
                itemRatings = updateItemRatings(i, j, ratingsDiffMatrix, itemRatings)
                ratingsDiffMatrix = updateRatingsDiffMatrix(i, j, ratingsMatrix, ratingsDiffMatrix, meanMap, itemRatings)
                let updatedSimMatrix = updateSimMatrix(i, j, ratingsMatrix, ratingsDiffMatrix, simMatrix, itemRatings)

                predictedRating = predictRating(users, items, i, j, ratingsMatrix, meanMap, updatedSimMatrix, k, t, hasNegativeSims)

                //reset the rating of the item back to its original value
                ratingsMatrix[i][j] = oldValue
                meanMap = updateMeanMap(i, j, ratingsMatrix, meanMap, 0)

                //update the necessary data structures to reflect the change
                itemRatings = updateItemRatings(i, j, ratingsMatrix, itemRatings)
                ratingsDiffMatrix = updateRatingsDiffMatrix(i, j, ratingsMatrix, ratingsDiffMatrix, meanMap, itemRatings)
                predCount++;
            }
            innerArr.push(predictedRating)
        }
        predMatrix.push(innerArr)
    }
    return [predMatrix, predCount]
}

//Input: predMatrix - a 2D matrix where each entry corresponds to the predicted rating if the rating at ratingsMatrix was taken out in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       predCount - the number of predictions made
//Output: a float representing the mean absolute error between the predicted ratings and the actual ratings
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

//Input: users - an array of user names
//       items - an array of item names
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an m x m matrix where m is the number of items and the entry at simMatrix[i][j] is the similarity between the item at index i and the item at index j
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//This function runs tests on the provided dataset, selecting similar items using the top-k neighbours method
function testTopKNeighbours(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings){
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;
    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
    }

    
    hasNegativeSims = true;
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Including Negative Similarities")
    console.log("-----------------------------------------------------------")

    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
    }

}

//Input: users - an array of user names
//       items - an array of item names
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an m x m matrix where m is the number of items and the entry at simMatrix[i][j] is the similarity between the item at index i and the item at index j
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//This function runs tests on the provided dataset, selecting similar items using the threshold method
function testNeighboursAboveThreshold(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings){
    console.log("-----------------------------------------------------------")
    console.log("Threshold Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
    }

    
    hasNegativeSims = true;
    console.log("-----------------------------------------------------------")
    console.log("Threshold Including Negative Similarities")
    console.log("-----------------------------------------------------------")

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
    }
}

async function main(){
    console.time("main")
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let parsedData = await extractUserInfo(filename);
        let users = parsedData.users;
        let items = parsedData.items;
        let ratingsMatrix = parsedData.ratings;
        let meanMap = populateMeanMap(ratingsMatrix)
        let itemRatings = populateItemRatings(ratingsMatrix)
        let ratingsDiffMatrix = populateRatingsDiffMatrix(ratingsMatrix, meanMap)
        let simMatrix = populateSimMatrix(ratingsMatrix, ratingsDiffMatrix, itemRatings)
        console.log("Filename", filename)
        testTopKNeighbours(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings)
        testNeighboursAboveThreshold(users, items, ratingsMatrix, ratingsDiffMatrix, meanMap, simMatrix, itemRatings)
    }
    console.timeEnd("main")
}


main();
