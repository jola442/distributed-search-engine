
const TEST_FILE_NAMES = ["test1.txt", "test2.txt", "test3.txt"]
const NEIGHBOURHOOD_SIZE = 2;
let fs = require('fs').promises;
let path = require('path');

//Input: The name of the file in server/lab6
//Output: A n x m matrix where n is the number of users and m is the number of items
async function extractUserInfo(filename){
    try {
        let fileContent = await fs.readFile(filePath, 'utf8');
        let lines = fileContent.trim().split('\n');
        let [userCount, itemCount] = lines[0].split(' ').map(Number);
        let ratings = [];
        for (let i = 3; i < lines.length; i++) {
          let userRatings = lines[i].split(' ').map(Number);
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


//Input: user - userIndex
//       ratingsMatrix
//Output: Average rating of the user
function calculateMean(user, ratingsMatrix){
    let sum = 0
    let userRatings = ratingsMatrix[user]
    for(let i = 0; i < userRatings.length; ++i){
        if(userRatings[i] !== -1){
            sum += userRatings[i]
        }
    }

    return sum/userRatings.length;
}

function getMaxCorrelations(correlations){
    correlationsList = Object.entries(correlations);
    correlationsList.sort( (a, b) => (b[1]-a[1]) );
    return correlationsList.slice(0, NEIGHBOURHOOD_SIZE);
}

//Input: userA and userB are the integers representing the user names e.g userA = 1 is for user1
//Output: float representing Pearson Correlation Coefficient
function pearsonCorrelation(userA, userB, ratingsMatrix){

}

function getPearsonCorrelations(userA, ratingsMatrix){

    let correlations = {}
    for(let userB = 0; userB < ratingsMatrix.length; ++userB){
        if(i !== userA){
            correlations[userB] = correlations.pearsonCorrelation(userA, userB, ratingsMatrix)
        }
    }

    return correlations;
}

//Input: A n x m matrix where n is the number of users and m is the number of items
//Output: An array of two elements representing the user index and the item index of the missing matrix entry
function getMissingRatings(ratingsMatrix){

}

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//Output: integer representing user's predicted rating for item itemNum
function predictRating(user, itemNum, ratingsMatrix, correlations){
    let r_a_mean = calculateMean(user, ratingsMatrix)
    let correlationsList = getMaxCorrelations(correlations)
    let numerator = 0;
    let denominator = 0;
    for(let i = 0; i < correlationsList; ++i){
        let b_idx = correlationsList[0]
        let b_corr = correlationsList[1]
        let r_b_p = ratingsMatrix[b_idx][itemNum]
        let r_b_mean = calculateMean()
        numerator += (b_corr * (r_b_p - r_b_mean));
        denominator += b_corr
    }

    let predictedRating = r_a_mean + numerator/denominator;
    return predictedRating;

}

//for every missing index, perform 
function main(){
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let parsedData = extractUserInfo(filename)
        let ratingsMatrix = parsedData.ratings;
        let numUsers = parsedData.userCount;
        let numItems = parsedData.itemCount;
        let missingIndicies = getMissingRating(ratingsMatrix)

        //Predict the rating for every user with a missing rating
        for(let j = 0; j < missingIndicies.length; ++j){
            let userIdx = missingIndicies[i][0]
            let itemIdx = missingIndicies[i][1]
            let correlations = getPearsonCorrelations(userIdx)
            let predictedRating = predictRating(userIdx, itemIdx, correlations)
            ratingsMatrix[userIdx][itemIdx] = predictedRating
        }

        console.log("Output for:",filename)
        console.log(matrix)
    }
}


