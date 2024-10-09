# Search Engine Implementation

This project is a search engine that crawls and indexes web pages, allowing users to perform searches through a web-based client. The search engine supports ranking results using the PageRank algorithm and integrates with a distributed search service on OpenStack for scalability.

## Features
- **Web Crawler**: Crawls two sets of pages: a fruit dataset and Wikipedia pages.
- **RESTful API**: Provides search functionality, supporting queries for both datasets.
- **Frontend**: A browser-based client that allows users to perform searches and view ranked results.
- **Database**: Stores crawled data in MongoDB, including PageRank values for each page.

## Project Structure

- **`client/`**: Contains the frontend built using JavaScript and React.
- **`server/`**: Contains the backend powered by Node.js and Express, including the web crawler and RESTful API.

### Key Files

- **`server/init.js`**  
  This script crawls the fruit dataset, starting from a designated URL. The crawled pages are stored in a MongoDB database.

- **`server/personalCrawler.js`**  
  This script crawls Wikipedia pages, storing relevant data in MongoDB. It is used to collect and index information for user searches on Wikipedia.

- **`server/pageRank.js`**  
  This generates and stores the page rank of each page according the number of incoming and outgoing links
  
## How to Run

### Running the Backend
1. Install dependencies:
   cd server
   npm install
2. Populate the database (drop the current database, crawl the fruit pages and the wikipedia pages, generate and store the page ranks)
   node init.js
   node personalCrawler.js
   node pageRank.js
3. Run the server
   node server.js

### Running the Frontend
1. Install dependencies
   cd client
   npm install
   npm start
