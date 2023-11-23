
const TEST_FILE_NAMES = ["test1.txt", "test2.txt", "test3.txt"]
// const TEST_FILE_NAMES = ["test2.txt"]
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

function populateMeanMap(ratingsMatrix){




    
    //meanMap = {userIdx: {avg: 20, count: 5}}
    const meanMap = {};

    for(let userIdx = 0; userIdx < ratingsMatrix.length; userIdx++){
        const userRatings = ratingsMatrix[userIdx];

        let sum = 0;
        let count = 0;

        for(let itemIndex = 0; itemIndex < userRatings.length; itemIndex++ ){
            if(!isNaN(userRatings[itemIndex])){
                sum += userRatings[itemIndex];
                count++;
            }
        }


        if(count > 0){
            const average = sum/count;

            meanMap[userIdx] = {avg: average, count: count };
        }
    }
    return meanMap;



}

// update meanMap[userIdx] to exclude the rating at ratingsMatrix[userIdx][itemIdx]
function updateMeanMap(userIdx, itemIdx, ratingsMatrix, meanMap){

}

function populateSimMatrix(ratingsMatrix){

}

function updateSimMatrix(userIdx, itemIdx, ratingsMatrix, simMatrix){

}

function populatePredMatrix(ratingsMatrix, correlations){
    //for all ratings != 0, remove the rating and predict it
    //return predCount
}

function calculateMAE(predMatrix, ratingsMatrix){
    // sum up predMatrix[i][j] - ratingsMatrix[i][j]
    // divide by predCount returned by populatePredMatrix
}


//Input: correlations is an object with user indicies as keys and their correlations with a specified user as values
//Output: a sorted 2D array (by correlation values), the first element of each inner array is the user index, the second element is the correlation with a specified user,
function getMaxCorrelations(correlations){
    correlationsList = Object.entries(correlations);
    correlationsList.sort( (a, b) => (b[1]-a[1]) );
    return correlationsList.slice(0, NEIGHBOURHOOD_SIZE);
}

//Input: userA and userB are the integers representing the indicies of the users in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: float representing Pearson Correlation Coefficient
function pearsonCorrelation(userA, userB, ratingsMatrix){
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
    let meanA = calculateMean(userA, ratingsMatrix);
    let meanB = calculateMean(userB, ratingsMatrix);
    let A_ratings = ratingsMatrix[userA]
    let B_ratings = ratingsMatrix[userB]

    for(let i = 0; i < A_ratings.length; ++i){
        if(A_ratings[i] !== -1 && B_ratings[i] !== -1){
            numerator += (A_ratings[i] - meanA) * (B_ratings[i] - meanB);
            denomA += Math.pow(A_ratings[i] - meanA, 2)
            denomB += Math.pow(B_ratings[i] - meanB, 2)
        }
    }

    return numerator/ ((Math.sqrt(denomA)) * (Math.sqrt(denomB)))
}

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

//Input: ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: An array of two elements representing the user index and the item index of the missing matrix entry
function getMissingRatings(ratingsMatrix){
    try{
        let rows = ratingsMatrix.length;
        let columns = ratingsMatrix[0].length;
        let ratingIndicies = [];
        for(let i=0; i< rows; i++){
            for(let j = 0; j < columns; j++){
                if(ratingsMatrix[i][j] == -1){
                    ratingIndicies.push([i,j]);
                }
            }
        }
        // console.log(ratingIndicies);
        return ratingIndicies;

    }catch (error) {
        console.error('Error in getMissingRatings function:', error);
    }

    return []
}

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//       correlations is an object where each property is the index of a userB and the value is the similarity between user (input from this function) and userB
//Output: integer representing user's predicted rating for item itemNum
function predictRating(user, itemNum, ratingsMatrix, correlations){
    let r_a_mean = calculateMean(user, ratingsMatrix)
    let correlationsList = getMaxCorrelations(correlations)
    let numerator = 0;
    let denominator = 0;
    for(let i = 0; i < correlationsList.length; ++i){
        let b_idx = correlationsList[i][0]
        let b_corr = correlationsList[i][1]
        let r_b_p = ratingsMatrix[b_idx][itemNum]
        let r_b_mean = calculateMean(b_idx, ratingsMatrix)

        numerator += (b_corr * (r_b_p - r_b_mean));
        denominator += b_corr
    }

    let predictedRating = r_a_mean + numerator/denominator;
    return Math.round(predictedRating*100)/100;

}

//for every missing index, perform 
async function main(){
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let parsedData = await extractUserInfo(filename);
        let ratingsMatrix = parsedData.ratings;
        let testFilename = "out-" + filename;
        let testRatingsMatrix = (await extractUserInfo(testFilename)).ratings;
        let missingIndicies = getMissingRatings(ratingsMatrix)
        let missingValues = []

        //Predict the rating for every user with a missing rating
        for(let j = 0; j < missingIndicies.length; ++j){
            let userIdx = missingIndicies[j][0]
            let itemIdx = missingIndicies[j][1]
            let correlations = getPearsonCorrelations(userIdx, ratingsMatrix)
            let predictedRating = predictRating(userIdx, itemIdx, ratingsMatrix, correlations)
            console.log("predicted rating of ratingsMatrix[" + userIdx +"][" + itemIdx +"]: " + predictedRating)
            console.log("correct rating of ratingsMatrix[" + userIdx +"][" + itemIdx +"]: " + testRatingsMatrix[userIdx][itemIdx])
            missingValues.push(predictedRating)
            // ratingsMatrix[userIdx][itemIdx] = predictedRating
        }

        for(let k = 0; k < missingValues.length; ++k){
            let userIdx = missingIndicies[k][0]
            let itemIdx = missingIndicies[k][1]
            ratingsMatrix[userIdx][itemIdx] = missingValues[k]
        }

        console.log("Output for:",filename)
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


