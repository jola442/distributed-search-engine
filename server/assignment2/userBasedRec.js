
const TEST_FILE_NAMES = ["assignment2-data.txt"]
const NEIGHBOURHOOD_SIZES= [50];
const THRESHOLDS = [1.0]
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


//Input: correlations is an object with user indicies as keys and their correlations with a specified user as values
//Output: a sorted 2D array (by correlation values), the first element of each inner array is the user index, the second element is the correlation with a specified user,
function getTopKNeighbours(correlations, k, hasNegativeSims){
    let correlationsList = Object.entries(correlations);
    correlationsList = hasNegativeSims? correlationsList.filter(entry => (entry[1] > 0 || entry[1] < 0)): correlationsList.filter(entry => (entry[1] > 0))
    // correlationsList = correlationsList.sort( (a, b) => (b[1]-a[1]) );
    correlationsList = correlationsList.sort( (a, b) => (Math.abs(b[1])-Math.abs(a[1])) );
    return correlationsList.slice(0, k);
}

function getNeighboursAboveThreshold(correlations, t, hasNegativeSims){
    let correlationsList = Object.entries(correlations);
    correlationsList = hasNegativeSims? correlationsList.filter(entry => (Math.abs(entry[1]) > t)):correlationsList.filter(entry => (entry[1] > t))
    return correlationsList
}



// 0 1 2 3
// 4 4 2 1
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

function updateSimMatrix(userIdx, itemIdx, ratingsMatrix, meanMap, simMatrix){
    
    //given that a user's predicted rating of an item is to be calculated,
    //calculate the similarity between the user and all other users who have rated the item
    for(let i = 0; i < ratingsMatrix.length; ++i){
        if(i == userIdx) continue
        //if user i rated the item 
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

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//       correlations is an object where each property is the index of a userB and the value is the similarity between user (input from this function) and userB
//Output: integer representing user's predicted rating for item itemNum
function predictRating(users, items, user, itemNum, ratingsMatrix, meanMap, simMatrix, k, t, hasNegativeSims){
    let r_a_mean = meanMap[user].avg
    let correlationsList = []

    if(k){
        correlationsList = getTopKNeighbours(simMatrix[user], k, hasNegativeSims)
    }

    else if(t){
        correlationsList = getNeighboursAboveThreshold(simMatrix[user], t, hasNegativeSims)
    }


    let numerator = 0;
    let denominator = 0;
    for(let i = 0; i < correlationsList.length; ++i){
        let b_idx = correlationsList[i][0]
        let b_corr = correlationsList[i][1]
        let r_b_p = ratingsMatrix[b_idx][itemNum]
        if(r_b_p == 0) continue
        let r_b_mean = meanMap[b_idx].avg

        numerator += (b_corr * (r_b_p - r_b_mean));
        denominator += b_corr
    }

    // let predictedRating = r_a_mean + numerator/denominator
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

    // console.log("Predicting for user:", users[user])
    // console.log("Predicting for item", items[itemNum])
    // console.log("Found", correlationsList.length, "valid neighbours:")
    // for(let i = 0; i < correlationsList.length; ++i){
    //     console.log(i+1 + ". User", users[correlationsList[i][0]], "sim = ", correlationsList[i][1])
    // }
    // console.log()
    // console.log("Predicted rating:", predictedRating, "\n")
    return predictedRating

}

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

function testTopKNeighbours(users, items, ratingsMatrix, meanMap, simMatrix){
    //let startTime = performance.now();
    //console.log(startTime);
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;
    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let startTime = performance.now();
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
        let endTime = performance.now();
        let finalTime = (endTime - startTime)/1000;
        console.log("Execution time = ", finalTime);

    }

    
    hasNegativeSims = true;
    console.log("-----------------------------------------------------------")
    console.log("Top-K Neighbours Including Negative Similarities")
    console.log("-----------------------------------------------------------")

    for(let j = 0; j < NEIGHBOURHOOD_SIZES.length; ++j){
        let startTime = performance.now();
        let k = NEIGHBOURHOOD_SIZES[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, k, null, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Neighbourhood Size", k)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
        let endTime = performance.now();
        let finalTime = (endTime - startTime)/1000;
        console.log("Execution time = ", finalTime);
    }

}

function testNeighboursAboveThreshold(users, items, ratingsMatrix, meanMap, simMatrix){
    console.log("-----------------------------------------------------------")
    console.log("Threshold Ignoring Negative Similarities")
    console.log("-----------------------------------------------------------")
    let hasNegativeSims = false;

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let startTime = performance.now();
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
        let endTime = performance.now();
        let finalTime = (endTime - startTime)/1000;
        console.log("Execution time = ", finalTime);
    }

    
    hasNegativeSims = true;
    console.log("-----------------------------------------------------------")
    console.log("Threshold Including Negative Similarities")
    console.log("-----------------------------------------------------------")

    for(let j = 0; j < THRESHOLDS.length; ++j){
        let startTime = performance.now();
        let t = THRESHOLDS[j]
        let [predMatrix, predCount] = populatePredMatrix(users, items, ratingsMatrix, meanMap, simMatrix, null, t, hasNegativeSims)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount) 
        console.log("Threshold:", t)
        console.log("Total predictions", predCount)
        console.log("MAE =", MAE, "\n")
        let endTime = performance.now();
        let finalTime = (endTime - startTime)/1000;
        console.log("Execution time = ", finalTime);
    }
}

//for every missing index, perform 
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

// We want to take a rating out and use all the other ratings to predict that rating
// Then compare the rating we took out to our predicted rating
// We need a way to recalculate user ratings averages and similarities without having to recompute the whole thing
// testset_u is the ratings predicted for user u
// MAE is the sum of all the absolute errors for each user / the sum of the number of predictions made for each user

//Edge cases:
// If a rating is 0, we do not take it out or perform a prediction on it
// If the denominator of a calculation is 0, this should not be included as a real prediction.
// Instead, a suitable “best guess” to make in any of these cases would be the average rating score of the user 
//(remember to compute it by ignoring the current rating that we are predicting). 
// If the neighbourhood size is X but we don't have X neighbours we should use as many as possible
// The neighbours must have also rated the item we are predicting the rating for.


//find a fast way to find the set of items both users have reviewed without iterating over everything
//recalculate the similarity for the user that was changed

main();


