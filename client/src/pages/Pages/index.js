import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation } from 'react-router-dom';
import {v4 as uuidv4} from "uuid";
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';


function Pages() {
  const [pages, setPages] = useState(null);

  const location = useLocation();
  useEffect(() => {
    axios.get(location.pathname + location.search).then( res => {
      console.log(res.data);
      setPages(res.data);
    }).catch((err) => {
      console.log(err.response.data);
      setPages([])
    })
  }, [location])
  
  if(!pages){
    return null;
  }

  return (
    <>
      <MobileNavbar></MobileNavbar>
      <div className='pages-container'>
        {pages.length > 0?pages.map ( (page) => (
          <div key={uuidv4()} >
            <Link to={"/"+page._id}>{page.title}</Link>
            <Link to={page.url} target="_blank" rel="noreferrer noopener"><b>URL: </b>{page.url}</Link>
            <p><b>Score: </b>{page.score}</p>
            <p><b>Page Rank: </b>{page.pr}</p>
          </div>
   
          
        )):<p><b>No results</b></p>}

      </div>
    </>

  )
}

// 1. The URL to the original page
// 2. The title of the original page
// 3. The computed search score for the page
// 4. The PageRank of the page within your crawled network
// 5. A link to view the data your search engine has for this page. This must include at least
// the URL, title, list of incoming links to this page, list of outgoing links from this page, and
// word frequency information for the page (e.g., banana occurred 6 times, apple occurred
// 9 times, etc.). You can also display any additional data you produced during the crawl.

export default Pages