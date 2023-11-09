
const TEST_FILE_NAMES = ["test1.txt", "test2.txt", "test3.txt"]

//Input: The name of the file in server/lab6
//Output: An array of user names in the specified file
function extractUserNames(filename){

}

//Input: The name of the file in server/lab6
//Output: An array of user names in the specified file
function extractItemNames(filename){

}

//Input: The name of the file in server/lab6
//Output: A n x m matrix where n is the number of users and m is the number of items
function extractUserRatings(filename){

}



//Input: The name of the file in server/lab6
//Output: A n x m matrix where n is the number of users and m is the number of items
function extractUserRatings(filename){

}

function calculateMean(user, ratingsMatrix){
    let sum = 0
    let userRatings = ratingsMatrix[user]
    for(let i = 0; i < userRatings.length; ++i){
        if(userRatings[i] !== -1){
            sum += userRatings[i]
        }
    }

    return sum/NUM_ITEMS
}

//Input: userA and userB are the integers representing the user names e.g userA = 1 is for user1
//Output: float representing Pearson Correlation Coefficient
function pearsonCorrelation(userA, userB, ratingsMatrix){

}

function getPearsonCorrelations(userA, ratingsMatrix){
    // let correlations = []
    // for(let i = 0; i < )
}

//Input: A n x m matrix where n is the number of users and m is the number of items
//Output: An array of two elements representing the user index and the item index of the missing matrix entry
function getMissingRatings(ratingsMatrix){

}

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//Output: integer representing user's predicted rating for item itemNum
function predictRating(user, itemNum, ratingsMatrix, correlations){
    let r_a_mean = 0
}

//for every missing index, perform 
function main(){
    for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
        let filename = TEST_FILE_NAMES[i]
        let ratingsMatrix = extractUserInfo(filename)
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


