const TEST_FILE_NAMES = ["test.txt", "test2.txt", "test3.txt", "test4.txt", "test5.txt"]
const USER_TO_RECOMMEND_FOR = "User1"

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

//Stevo
//Input: initItems - array of item indicies 
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//       userToExclude is a user index representing the user the system is recommending for. They should not be added to the output array
//Output: an array of user indicies representing users that have liked this item 
function getUsersThatLikedItems(items, userToExclude, ratingsMatrix){
  let userIndicies = [];
    for(let i=0; i<items.length;i++){
      let item = items[i];
      for(let j = 0; j < ratingsMatrix.length; ++j){
        if(j !== userToExclude && ratingsMatrix[j][item] == 1)
        //making sure there are no duplicates indicies in the array
        if(!userIndicies.includes(j)){
          userIndicies.push(j);
        }
    }
  }
  return userIndicies;
}

//Ayo
//Input: userIdx - index of the user
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: an array of item indicies representing items that the user at index userIdx has liked 
function getItemsThatUserLiked(userIdx, ratingsMatrix){
  const likedItems = [];
  if(userIdx < 0 || userIdx >= ratingsMatrix.length){
    console.error('wrong user index');
    return likedItems;
  }

  const userRatings = ratingsMatrix[userIdx];

  for(let i = 0; i < userRatings.length; i++){
    if(userRatings[i] === 1){
      likedItems.push(i);
    }
  }
  return likedItems

}

//Input: similarUsers - an array of user indicies that are deemed to be similar to the user the system is recommending for
//       unrecommendableItems - an array of item indicies already rated by the user that the system is recommending for
//       ratingsMatrix is an n x m matrix where n is the number of users and m is the number of items
//Output: a sorted 2D array of the form [ [itemName:str, numPaths:int]]
function generatePathsArr(similarUsers, items, unrecommendableItems, ratingsMatrix){
  //used to allow O(1) lookup time
  let pathsMap = {}
  for(let i = 0; i < similarUsers.length; ++i){
    let user = similarUsers[i]
    let userRatings = ratingsMatrix[user]
    
    for(let j = 0; j < userRatings.length; ++j){
      let itemName = items[j]
      //if the user likes the item and it can be recommended
      if(userRatings[j] == 1 && !unrecommendableItems.includes(j)){
        if(pathsMap[itemName]){
          pathsMap[itemName]++
        }

        else{
          pathsMap[itemName] = 1
        }
      }
    }
  

  }

  let pathsArr = Object.entries(pathsMap).sort( (a, b) => (b[1]-a[1]))

  return pathsArr
}

async function main(){
  for(let i = 0; i < TEST_FILE_NAMES.length; ++i){
      let filename = TEST_FILE_NAMES[i]
      let parsedData = await extractUserInfo(filename);
      let users = parsedData.users;
      let items = parsedData.items;
      let ratingsMatrix = parsedData.ratings;
      let userIdx = users.indexOf(USER_TO_RECOMMEND_FOR)
      //the items that the user the system is recommending for has already rated
      let initItems = getItemsThatUserLiked(userIdx, ratingsMatrix)
      console.log("Items that", USER_TO_RECOMMEND_FOR, "liked", initItems)
      let similarUsers = getUsersThatLikedItems(initItems, userIdx, ratingsMatrix)
      console.log("Similar users",similarUsers)
      let pathsArr = generatePathsArr(similarUsers, items, initItems, ratingsMatrix)
      console.log(filename + ":")
      console.log("Recommended items for", users[userIdx]+":")
      for(let j = 0; j < pathsArr.length; ++j){
        console.log(pathsArr[j][0], "(" + pathsArr[j][1] + ")")
      }

  }
}

//find the items that user X likes
//find the users that liked those items
//find the other items those users liked
//rank 
main()