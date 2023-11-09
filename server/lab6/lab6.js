
const TEST_FILE_NAMES = ["test1.txt", "test2.txt", "test3.txt"]
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

//Input: userA and userB are the integers representing the user names e.g userA = 1 is for user1
//Output: float representing Pearson Correlation Coefficient
function pearsonCorrelation(userA, userB){
    let num = 0; // numerator
    let denomA = 0;
    let denomB = 0;
    let meanA = 0;
    let meanB = 0;



    // the mean values for the two uses: userA and userB

    for(let i = 0; i < userA.length; i++){
        meanA += userA[i];
        meanB +=userB[i];
    }
    meanA /= userA.length;
    meanB /= userB.length;


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

//Input: A n x m matrix where n is the number of users and m is the number of items
//Output: An array of two elements representing the user index and the item index of the missing matrix entry
function getMissingRating(matrix){

}

//Input: user is an integer representing the user name e.g user = 1 for user1
//       itemNum is an integer representing the number of the item
//Output: integer representing user's predicted rating for item itemNum
function predictRating(user, itemNum){

}


// for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
//     let filename = TEST_FILE_NAMES[i]
//     const userItemMatrix = extractUserInfo(filename)
// }