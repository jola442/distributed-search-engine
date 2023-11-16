
const TEST_FILE_NAMES = ["testa.txt", "test1.txt", "test2.txt", "test3.txt"]
// const TEST_FILE_NAMES = ["test2.txt"]
const NEIGHBOURHOOD_SIZE = 2;
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
        if(userRatings[i] !== -1){
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

//Input: ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: A matrix where each entry is the user's rating of the product - the user's average rating
function getRatingsDiffMatrix(ratingsMatrix){

}

//Input: itemA and itemB are the integers representing the indicies of the items in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: float representing the adjusted cosine similarity between the two items
function getSimilarity(itemA, itemB, ratingsMatrix, ratingsDiffMatrix){
 
}

//Input: itemA is an integer representing the index of an item in ratingsMatrix
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: An object with user indicies as keys and their similarities with item A as values
function getSimilarities(itemA, ratingsMatrix, ratingsDiffMatrix){

    let similarities = {}
    for(let itemB = 0; itemB < ratingsMatrix.length; ++itemB){
        if(itemB !== itemA){
            similarities[itemB] = getSimilarity(itemA, itemB, ratingsMatrix, ratingsDiffMatrix)
        }
    }

    return similarities;
}

//Input: similarities is an object with item indicies as keys and their similarities with a specified item as values
//Output: a sorted 2D array (by correlation values), the first element of each inner array is the user index, the second element is the correlation with a specified user,
function getMaxSimilarities(similarities){
    similaritiesList = Object.entries(similarities);
    similaritiesList.sort( (a, b) => (b[1]-a[1]) );
    return similaritiesList.slice(0, NEIGHBOURHOOD_SIZE);
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
        // console.log(ratingIndicies);
        return ratingIndicies;

    }catch (error) {
        console.error('Error in getMissingRatings function:', error);
    }

    return []
}

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//Output: integer representing user's predicted rating for item itemNum
function predictRating(user, ratingsMatrix, similarities){
    let similaritiesList = getMaxSimilarities(similarities);
    let numerator = 0;
    let denominator = 0;

    for(let j = 0; j < similaritiesList.length; ++j){
        let i = similaritiesList[j][0]
        let sim_ip = similaritiesList[j][1]
        let r_ui = ratingsMatrix[user][i]

        numerator += sim_ip * r_ui
        denominator += sim_ip
    }

    let predictedRating = numerator/denominator;
    return predictedRating;
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
            let ratingsDiffMatrix = getRatingsDiffMatrix(ratingsMatrix)
            let similarities = getSimilarities(itemIdx, ratingsMatrix, ratingsDiffMatrix)
            let predictedRating = predictRating(userIdx, itemIdx, ratingsMatrix, similarities)
            console.log("predicted rating of ratingsMatrix[" + userIdx +"][" + itemIdx +"]: " + predictedRating)
            console.log("correct rating of ratingsMatrix[" + userIdx +"][" + itemIdx +"]: " + testRatingsMatrix[userIdx][itemIdx])
            missingValues.push(predictRating)
            // ratingsMatrix[userIdx][itemIdx] = predictedRating
        }

        for(let k = 0; k < missingValues; ++k){
            let userIdx = missingIndicies[k][0]
            let itemIdx = missingIndicies[k][1]
            ratingsMatrix[userIdx][itemIdx] = missingValues[k]
        }

        console.log("Output for:",filename)
        // console.log(ratingsMatrix)

    }
}

main();


