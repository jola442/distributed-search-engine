
const TEST_FILE_NAMES = ["parsed-data-trimmed.txt"]
const NEIGHBOURHOOD_SIZES= [5];
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

//Input: userA and userB are the integers representing the indicies of the users in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: float representing Pearson Correlation Coefficient
function pearsonCorrelation(userA, userB, ratingsMatrix, meanMap){
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
 
    let meanA = meanMap[userA].avg
    let meanB = meanMap[userB].avg
    let A_ratings = ratingsMatrix[userA]
    let B_ratings = ratingsMatrix[userB]

    count = 0
    for(let i = 0; i < A_ratings.length; ++i){
        if(A_ratings[i] !== 0 && B_ratings[i] !== 0){
            count++
            numerator += (A_ratings[i] - meanA) * (B_ratings[i] - meanB);
            denomA += Math.pow(A_ratings[i] - meanA, 2)
            denomB += Math.pow(B_ratings[i] - meanB, 2)
        }
    }

   

    let corr =  numerator/ ((Math.sqrt(denomA)) * (Math.sqrt(denomB)))
    if(!isNaN(corr)){
        return corr
    }

    return 0
}


//Input: correlations - an object with user indicies as keys and their similarities with a specified user as values
//       k - the number of neighbours
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: a sorted 2D array (by absolute similarity values), the first element of each inner array is the item index, the second element is the correlation with a specified user
function getTopKNeighbours(correlations, k, hasNegativeSims){
    let correlationsList = Object.entries(correlations);
    correlationsList = hasNegativeSims? correlationsList.filter(entry => (entry[1] > 0 || entry[1] < 0)): correlationsList.filter(entry => (entry[1] > 0))
    // correlationsList = correlationsList.sort( (a, b) => (b[1]-a[1]) );
    correlationsList = correlationsList.sort( (a, b) => (Math.abs(b[1])-Math.abs(a[1])) );
    return correlationsList.slice(0, k);
}

//Input: correlations - an object with item indicies as keys and their similarities with a specified item as values
//       t - the threshold
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: a sorted 2D array of items with correlations greater than t. The first element of each inner array is the item index, the second element is the similairity with a specified item
function getNeighboursAboveThreshold(correlations, t, hasNegativeSims){
    let correlationsList = Object.entries(correlations);
    correlationsList = hasNegativeSims? correlationsList.filter(entry => (Math.abs(entry[1]) > t)):correlationsList.filter(entry => (entry[1] > t))
    return correlationsList
}


//Input: ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//Output: simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the user at index i and the user at index j
function populateSimMatrix(ratingsMatrix, meanMap){
    let simMatrix = []
    for(let i = 0; i < ratingsMatrix.length; ++i){
        userSimilarities = []
        for(let j = 0; j < ratingsMatrix.length; ++j){
            if(i == j){
                userSimilarities.push(0)

            }

            else{
                let corr = pearsonCorrelation(i, j, ratingsMatrix, meanMap)
                userSimilarities.push(corr)
            }
        }
        simMatrix.push(userSimilarities)
    }
    return simMatrix;
}

//Input: userIdx - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       itemIdx - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       ratingsDiffMatrix - a 2D matrix where each entry is <user's rating of the product - the user's average rating>
//       simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the user at index i and the user at index j
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//Output: simMatrix - an updated simMatrix that reflects the change in the rating of the item at <itemIdx> by the user at <userIdx>   
function updateSimMatrix(userIdx, itemIdx, ratingsMatrix, meanMap, simMatrix){

    for(let i = 0; i < ratingsMatrix.length; ++i){
        if(i == userIdx) continue
        //if user at index i rated the item 
        if(ratingsMatrix[i][itemIdx] !== 0){
            let corr = pearsonCorrelation(userIdx, i, ratingsMatrix, meanMap)
            simMatrix[userIdx][i] = corr
        }

        else{
            simMatrix[userIdx][i] = 0
        }
    }

    return simMatrix
}

//Input: users - an array of user names
//       items - an array of item names
//       userIdx - the user index of the rating that was changed in the leave-one-out cross-validation strategy
//       itemIdx - the item index of the rating that was changed in the leave-one-out cross-validation strategy
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the user at index i and the user at index j
//       k - the number of most similar neighbours to select
//       t - the threshold of similarity
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: predictedRating - a float representing the user at <userIdx>'s predicted rating of the item at <itemIdx>.
function predictRating(users, items, userIdx, itemIdx, ratingsMatrix, meanMap, simMatrix, k, t, hasNegativeSims){
    let r_a_mean = meanMap[userIdx].avg
    let correlationsList = []

    if(k){
        correlationsList = getTopKNeighbours(simMatrix[userIdx], k, hasNegativeSims)
    }

    else if(t){
        correlationsList = getNeighboursAboveThreshold(simMatrix[userIdx], t, hasNegativeSims)
    }


    let numerator = 0;
    let denominator = 0;
    for(let i = 0; i < correlationsList.length; ++i){
        let b_idx = correlationsList[i][0]
        let b_corr = correlationsList[i][1]
        let r_b_p = ratingsMatrix[b_idx][itemIdx]
        if(r_b_p == 0) continue
        let r_b_mean = meanMap[b_idx].avg

        numerator += (b_corr * (r_b_p - r_b_mean));
        denominator += b_corr
    }

    let predictedRating = hasNegativeSims? r_a_mean + numerator/Math.abs(denominator): r_a_mean + numerator/denominator
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
        predictedRating = r_a_mean
    }

    // console.log("Predicting for user:", users[userIdx])
    // console.log("Predicting for item", items[itemIdx])
    // console.log("Found", correlationsList.length, "valid neighbours:")
    // for(let i = 0; i < correlationsList.length; ++i){
    //     console.log(i+1 + ". User", users[correlationsList[i][0]], "sim = ", correlationsList[i][1])
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
//       simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the user at index i and the user at index j
//       itemRatings - an object that contains item indicies as properties and a set of users that have rated the item as values
//       k - the number of most similar neighbours to select
//       t - the threshold of similarity
//       hasNegativeSims - a bool representing whether to include negative similarities in the results
//Output: [predMatrix, predCount]
//        predMatrix - a 2D matrix where each entry corresponds to the predicted rating if the rating at ratingsMatrix was taken out in the leave-one-out cross-validation strategy
//        predCount - the number of predictions made
function populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, k, t, hasNegativeSims){
    let predMatrix = []
    let predCount = 0

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
                let updatedSimMatrix = updateSimMatrix(i, j, ratingsMatrix, meanMap, simMatrix)
                predictedRating = predictRating(users, items, i, j, ratingsMatrix, meanMap, updatedSimMatrix, k, t, hasNegativeSims)
                //reset the rating of the item back to its original value
                ratingsMatrix[i][j] = oldValue
                meanMap = updateMeanMap(i, j, ratingsMatrix, meanMap, 0)
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
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the user at index i and the user at index j
//This function runs tests on the provided dataset, selecting similar items using the top-k neighbours method
function testTopKNeighbours(users, items, ratingsMatrix, meanMap, simMatrix){
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;
    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, k, null, hasNegativeSims)
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
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
    }

}

//Input: users - an array of user names
//       items - an array of item names
//       ratingsMatrix - an n x m matrix where n is the number of users and m is the number of items
//       meanMap - A nested object with user indicies as properties and an object containing the average ratings and number of ratings for each user as values
//       simMatrix - an n x n matrix. The entry at simMatrix[i][j] is the similarity between the user at index i and the user at index j
//This function runs tests on the provided dataset, selecting similar items using the threshold method
function testNeighboursAboveThreshold(users, items, ratingsMatrix, meanMap, simMatrix){
    console.log("-----------------------------------------------------------")
    console.log("Threshold Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, null, t, hasNegativeSims)
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
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
    }
}


async function main(){
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let parsedData = await extractUserInfo(filename);
        let users = parsedData.users;
        let items = parsedData.items;
        let ratingsMatrix = parsedData.ratings;
        let meanMap = populateMeanMap(ratingsMatrix)
        let simMatrix = populateSimMatrix(ratingsMatrix, meanMap)
        console.log("Filename", filename)
        testTopKNeighbours(users, items, ratingsMatrix, meanMap, simMatrix)
        testNeighboursAboveThreshold(users, items, ratingsMatrix, meanMap, simMatrix)
    }
}

main();


