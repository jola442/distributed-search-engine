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
          <>
            <p>{page.title}</p>
            <Link to={page.url} key={uuidv4()}>{page.url}</Link>
            <p>{page.searchScore}</p>
          </>
   
          
        )):<p><b>No results</b></p>}

      </div>
    </>

  )
}

export default Pages