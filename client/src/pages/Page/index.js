import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {v4 as uuidv4} from "uuid";
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';

function page() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    axios.get(location.pathname + location.search).then( res => {
      console.log(res.data);
      setPage(res.data);
    }).catch((err) => {
      setError(err.response.data);
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
        <p><b>URL: </b> {page.url}</p>
        <p><b>Score: </b> {page.score}</p>
        <p><b>Page Rank: </b> {page.pr}</p>
        <p><b>Outgoing Links: </b>
          {page.outgoingLinks? page.outgoingLinks.map( (link, index) => {
            if(index === page.outgoingLinkss.length-1){
              return <span key={uuidv4}>{link}</span>
            }

            else{
              return <span key={uuidv4}>{link + ", "}</span>
            }
          }):<span>No Outgoing Links</span>}
        </p>
        <p><b>Incoming Links: </b>
          {page.incomingLinks? page.incomingLinks.map( (link, index) => {
            if(index === page.incomingLinkss.length-1){
              return <span key={uuidv4}>{link}</span>
            }

            else{
              return <span key={uuidv4}>{link + ", "}</span>
            }
          }):<span>No Incoming Links</span>}
        </p>
        <p><b>Most Frequent Words: </b>
          {page.wordFrequency? page.wordFrequency.map( (wordList, index) => {
            if(index === page.wordFrequencys.length-1){
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
      </div>
    </>

  )
}

export default page