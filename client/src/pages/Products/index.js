import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation } from 'react-router-dom';
import {v4 as uuidv4} from "uuid";
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';


function Products() {
  const [products, setProducts] = useState(null);

  const location = useLocation();
  useEffect(() => {
    axios.get(location.pathname + location.search).then( res => {
      console.log(res.data);
      setProducts(res.data);
    }).catch((err) => {
      console.log(err.response.data);
    })
  }, [location])
  
  if(!products){
    return null;
  }

  return (
    <>
      <MobileNavbar></MobileNavbar>
      <div className='products-container'>
        {products.map ( (product) => (
          <Link to={"/products/"+ product.id} key={uuidv4()}>{product.name}</Link>
        ))}

      </div>
    </>

  )
}

export default Products