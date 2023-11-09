
const TEST_FILE_NAMES = ["test1.txt", "test2.txt", "test3.txt"]
const NEIGHBOURHOOD_SIZE = 2;
let fs = require('fs').promises;
let path = require('path');

//Input: The name of the file in server/lab6
//Output: A n x m matrix where n is the number of users and m is the number of items
async function extractUserInfo(filename){
    try {
        let fileContent = await fs.readFile(filename, 'utf8');
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


//Input: user - an integer representing the index of a user in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: Average rating of the user
function calculateMean(user, ratingsMatrix){
    let sum = 0
    let userRatings = ratingsMatrix[user]
    let count = 0;
    for(let i = 0; i < userRatings.length; ++i){
        if(userRatings[i] !== -1){
            sum += userRatings[i]
            count++;
        }
        
    }

    return sum/count;
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
function pearsonCorrelation(userA, userB,ratingsMatrix){
    let num = 0; // numerator
    let denomA = 0;
    let denomB = 0;
    let meanA = calculateMean(userA, ratingsMatrix);
    let meanB = calculateMean(userB, ratingsMatrix);

    






    

    



     
    // the numerator and denominator 


    for(let i = 0; i < userA.length; i++){

        const deviationA = userA[i] - meanA;
        const deviationB = userB[i] - meanB;

        //updating all 
        num += deviationA * deviationB;
        denomA += deviationA ** 2;
        denomB += deviationB ** 2;

    }

    const denominator = Math.sqrt(denomA) * Math.sqrt(denomB);

    if (demoninator === 0){
        return 0 
    }

    return num / denominator;




}

//Input: userA is an integer representing the index of a user in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: An object with user indicies as keys and their correlations with user A as values
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
        console.log(ratingIndicies);
    }catch (error) {
        console.error('Error in getMissingRatings function:', error);
    }
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
        if(r_b_p === -1){
            continue;
        }
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
        console.log(ratingsMatrix)
    }
}


