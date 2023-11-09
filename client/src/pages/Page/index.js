import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {v4 as uuidv4} from "uuid";
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';

function Page() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    axios.get(location.pathname + location.search).then( res => {
      console.log(res.data);
      setPage(res.data);
    }).catch((err) => {
      // console.log(err.response.data)
      setError(err.response.data.error);
    })
  }, [location])
  
  if(!page){
    if(error){
      return <>
      <MobileNavbar></MobileNavbar>
      <p className='no-results'>{error}</p>
    </>
    }
    return null;
    // return <p className='no-results'>This page does not exist</p>;
  }


  return (
    <>
      <MobileNavbar></MobileNavbar>
      <div className='product-container'>
        <p><b>Names: </b>{page.name}</p>
        <label><b>URL: </b></label>
        <Link to={page.url} target="_blank" rel="noreferrer noopener">{page.url}</Link>
        <p><b>Page Rank: </b> {page.pr}</p>
        <p><b>Most Frequent Words: </b>
          {page.wordFrequency? page.wordFrequency.map( (wordList, index) => {
            if(index === page.wordFrequency.length-1){
              return <div key={uuidv4}>
                        <span>{wordList[0] + ": "}</span>
                        <span>{wordList[1]}</span>
                    </div>
         
            }

            else{
                return <div key={uuidv4}>
                <span>{wordList[0] + ": "}</span>
                <span>{wordList[1] + ", "}</span>
            </div>
            }
          }):<span>Nothing to show here...</span>}
        </p>
        <p><b>Outgoing Links: </b><br></br>
          {page.outgoingLinks? page.outgoingLinks.map( (link) => (<div key={uuidv4}><Link to={link} target="_blank" rel="noreferrer noopener">{link}</Link></div>))
          :<span>No Outgoing Links</span>}
        </p>
        <p><b>Incoming Links: </b><br></br>
        {page.incomingLinks? page.incomingLinks.map( (link) => (<div key={uuidv4}><Link to={link} target="_blank" rel="noreferrer noopener">{link}</Link></div>))
          :<span>No Incoming Links</span>}
        </p>

      </div>
    </>

  )
}

export default Page