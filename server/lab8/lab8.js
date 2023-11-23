
// const TEST_FILE_NAMES = ["test1.txt", "test2.txt", "test3.txt"]
const TEST_FILE_NAMES = ["parsed-data-trimmed.txt"]
const NEIGHBOURHOOD_SIZE = 5;
let fs = require('fs').promises;
let path = require('path');

//Input: The name of the file in server/lab6
//Output: A n x m matrix where n is the number of users and m is the number of items
async function extractUserInfo(filename){
    try {
        let fileContent = await fs.readFile(filename, 'utf8');
        let lines = fileContent.trim().split('\n');
        let [userCount, itemCount] = lines[0].trim().split(' ').map(Number);
        let ratings = [];
        for (let i = 3; i < lines.length; i++) {
          let userRatings = lines[i].trim().split(' ').map(Number);
          ratings.push(userRatings);
        }
        let parsedData = {
            userCount,
            itemCount,
            ratings
        }
        return parsedData;
      } catch (err) {
        console.error('Error reading the file:', err);
      }
}


//Input: user - an integer representing the index of a user in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: Average rating of the user
function calculateMean(user, ratingsMatrix){
    let sum = 0
    let userRatings = ratingsMatrix[user]
    // console.log("User ratings",userRatings)
    // console.log("Ratings matrix", ratingsMatrix)
    let count = 0;
    for(let i = 0; i < userRatings.length; ++i){
        if(userRatings[i] !== -1 && userRatings[i] !== 0){
            sum += userRatings[i]
            count++;
        }
        
    }

    // console.log("Count:", count)
    // console.log("Sum:", sum)
    if(count > 0){
        return sum/count
    }

    else{
        return 0;
    }
}

//Input: userA and userB are the integers representing the indicies of the users in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: float representing Pearson Correlation Coefficient
function pearsonCorrelation(userA, userB, ratingsMatrix, meanMap){
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
    // let meanA = calculateMean(userA, ratingsMatrix);
    // let meanB = calculateMean(userB, ratingsMatrix);
    let meanA = meanMap[userA].avg
    let meanB = meanMap[userB].avg
    let A_ratings = ratingsMatrix[userA]
    let B_ratings = ratingsMatrix[userB]

    for(let i = 0; i < A_ratings.length; ++i){
        if(A_ratings[i] !== 0 && B_ratings[i] !== 0){
            numerator += (A_ratings[i] - meanA) * (B_ratings[i] - meanB);
            denomA += Math.pow(A_ratings[i] - meanA, 2)
            denomB += Math.pow(B_ratings[i] - meanB, 2)
        }
    }

    let corr =  numerator/ ((Math.sqrt(denomA)) * (Math.sqrt(denomB)))
    return {corr, numerator, denomA, denomB}
}

//check if both users rated the product, if they did update the correlation

// 0 1 2 3 4
// 2 4 5 2 0
// 1 4 3 2 1

//   0           1               2             3
// {0}  {corr:3.4, denomA}   {corr: 3.9}     {corr: 8.2}
// 
// 

//Input: userA is an integer representing the index of a user in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: An object with user indicies as keys and their correlations with user A as values
function getPearsonCorrelations(userA, ratingsMatrix){

    let correlations = {}
    for(let userB = 0; userB < ratingsMatrix.length; ++userB){
        if(userB !== userA){
            correlations[userB] = pearsonCorrelation(userA, userB, ratingsMatrix)
        }
    }

    return correlations;
}



//Input: correlations is an object with user indicies as keys and their correlations with a specified user as values
//Output: a sorted 2D array (by correlation values), the first element of each inner array is the user index, the second element is the correlation with a specified user,
function getMaxCorrelations(correlations){
    correlationsList = Object.entries(correlations);
    correlationsList.sort( (a, b) => (b[1].corr-a[1].corr) );
    return correlationsList.slice(0, NEIGHBOURHOOD_SIZE);
}




//Input: ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: A nested object. The properties of the object are user indicies. 
//The value of each property is an object that has the average rating of the user and the number of ratings of the user as properties.
//e.g  meanMap = {0: {avg: 20, count: 5}}
function populateMeanMap(ratingsMatrix){

}

//Input: ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//       userIdx is the user index of the rating being predicted
//       itemIdx is the item index of the rating being predicted
//       meanMap is an object of the form {0: {avg: 20, count: 5}} where 0 is the user index
//Output: an updated meanMap that excludes the rating at ratingsMatrix[userIdx][itemIdx] from the map
function updateMeanMap(userIdx, itemIdx, ratingsMatrix, meanMap){

}

function populateSimMatrix(ratingsMatrix){
    let simMatrix = []
    for(let i = 0; i < ratingsMatrix.length; ++i){
        userSimilarities = []
        for(let j = 0; j < ratingsMatrix[0].length; ++j){
            if(i == j){
                userSimilarities.push(0)
            }

            else{
                let [corr, numerator, denomA, denomB] = pearsonCorrelation(i, j, ratingsMatrix, meanMap)
                userSimilarities.push({corr, numerator, denomA, denomB})
            }
        }
    }
    return simMatrix;
}

//remove r_a_p - r_a_mean * r_b_p - r_b_mean from the numerator if ratingsMatrix[userIdx][itemIdx] != 0 for both users
function updateSimMatrix(userIdx, itemIdx, ratingsMatrix, simMatrix){
    for(let i = 0; i < ratingsMatrix.length; ++i){
        if(i == userIdx) continue
        //if user i also rated the item, remove userIdx from their correlation
        if(ratingsMatrix[i][itemIdx] !== 0){
            // simMatrix[i][userIdx].numerator -= (A_ratings[i] - meanA) * (B_ratings[i] - meanB);
            let ratingADiff = ratingsMatrix[i][itemIdx] - meanMap[i].avg
            let ratingBDiff = ratingsMatrix[userIdx][itemIdx] - meanMap[itemIdx].avg
            let oldDenomA = simMatrix[i][userIdx].denomA
            let oldDenomB = simMatrix[i][userIdx].denomB
            // simMatrix[i][userIdx].numerator -= (ratingADiff * ratingBDiff)
            // simMatrix[i][userIdx].denomA = Math.sqrt( Math.pow(2, oldDenomA) - Math.pow(2, ratingADiff) )
            // simMatrix[i][userIdx].denomB = Math.sqrt( Math.pow(2, oldDenomB) - Math.pow(2, ratingBDiff) )
            newNumerator = simMatrix[i][userIdx].numerator - (ratingADiff * ratingBDiff)
            newDenomA = Math.sqrt( Math.pow(2, oldDenomA) - Math.pow(2, ratingADiff) )
            newDenomB = Math.sqrt( Math.pow(2, oldDenomB) - Math.pow(2, ratingBDiff) )
            newCorr = newNumerator/ ((Math.sqrt(newDenomA)) * (Math.sqrt(newDenomB)))
            simMatrix[i][userIdx].numerator = newNumerator
            simMatrix[i][userIdx].denomA = newDenomA
            simMatrix[i][userIdx].denomB = Math.sqrt( Math.pow(2, oldDenomB) - Math.pow(2, ratingBDiff) )
            simMatrix[i][userIdx].corr = newCorr
        }
    }

    return simMatrix
}

function populatePredMatrix(ratingsMatrix, meanMap, simMatrix){
    let predMatrix = []
    let predCount = 0
    for(let i = 0; i < ratingsMatrix.length; ++i){
        let innerArr = []
        for(let j = 0; j < ratingsMatrix[0].length; ++i){
            //make a deep copy of ratingsMatrix
            let leaveOneOutMatrix = JSON.parse(JSON.stringify(ratingsMatrix));
            let predictedRating = 0
            if(ratingsMatrix[i][j] !== 0){
                leaveOneOutMatrix[i][j] = -1
                let updatedMeanMap = updateMeanMap(i, j, ratingsMatrix, meanMap)
                let updatedSimMatrix = updateSimMatrix(i, j, ratingsMatrix, simMatrix)
                //refactor predictRating to use simMatrix
                predictedRating = predictRating(i, j, leaveOneOutMatrix, updatedMeanMap, updatedSimMatrix)
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

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//       correlations is an object where each property is the index of a userB and the value is the similarity between user (input from this function) and userB
//Output: integer representing user's predicted rating for item itemNum
function predictRating(user, itemNum, ratingsMatrix, meanMap, simMatrix){
    // let r_a_mean = calculateMean(user, ratingsMatrix)
    let r_a_mean = meanMap[user].avg
    let correlationsList = getMaxCorrelations(simMatrix[user])
    let numerator = 0;
    let denominator = 0;
    for(let i = 0; i < correlationsList.length; ++i){
        let b_idx = correlationsList[i][0]
        let b_corr = correlationsList[i][1]
        let r_b_p = ratingsMatrix[b_idx][itemNum]
        if(r_b_p == 0) continue
        // let r_b_mean = calculateMean(b_idx, ratingsMatrix)
        let r_b_mean = meanMap[b_idx].avg

        numerator += (b_corr * (r_b_p - r_b_mean));
        denominator += b_corr
    }

    let predictedRating = r_a_mean + numerator/denominator;
    if(!isNaN(predictedRating)){
        return Math.round(predictedRating*100)/100;
    }

    else{
        return r_a_mean
    }

}

//for every missing index, perform 
async function main(){
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let parsedData = await extractUserInfo(filename);
        let ratingsMatrix = parsedData.ratings;
        let meanMap = populateMeanMap(ratingsMatrix)
        let simMatrix = populateSimMatrix(ratingsMatrix)
        let [predMatrix, predCount] = populatePredMatrix(ratingsMatrix, meanMap, simMatrix)
        let MAE = calculateMAE(predMatrix, ratingsMatrix, predCount)
        console.log("MAE = ", MAE)
        // let testFilename = "out-" + filename;
        // let testRatingsMatrix = (await extractUserInfo(testFilename)).ratings;
        // let missingIndicies = getMissingRatings(ratingsMatrix)
        // let missingValues = []

        // //Predict the rating for every user with a missing rating
        // for(let j = 0; j < missingIndicies.length; ++j){
        //     let userIdx = missingIndicies[j][0]
        //     let itemIdx = missingIndicies[j][1]
        //     let correlations = getPearsonCorrelations(userIdx, ratingsMatrix)
        //     let predictedRating = predictRating(userIdx, itemIdx, ratingsMatrix, correlations)
        //     console.log("predicted rating of ratingsMatrix[" + userIdx +"][" + itemIdx +"]: " + predictedRating)
        //     console.log("correct rating of ratingsMatrix[" + userIdx +"][" + itemIdx +"]: " + testRatingsMatrix[userIdx][itemIdx])
        //     missingValues.push(predictedRating)
        //     // ratingsMatrix[userIdx][itemIdx] = predictedRating
        // }

        // for(let k = 0; k < missingValues.length; ++k){
        //     let userIdx = missingIndicies[k][0]
        //     let itemIdx = missingIndicies[k][1]
        //     ratingsMatrix[userIdx][itemIdx] = missingValues[k]
        // }

        // console.log("Output for:",filename)
        // console.log(ratingsMatrix)

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

main();


