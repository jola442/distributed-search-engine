import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';

function Product() {
  const [product, setProduct] = useState(null);
  const [review, setReview] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    axios.get(location.pathname + location.search).then( res => {
      console.log(res.data);
      setProduct(res.data);
    })
  }, [location])
  
  if(!product){
    return null;
  }

  function addReview(){
    axios.post(location.pathname + "/reviews", {review}).then(res => {
      if(res.status === 200){
        navigate(location.pathname);
      }
    }).catch( (err) => {
      if(err.response.status == 400){
        alert(err.response.data);
      }
    })
  }


  return (
    <>
      <MobileNavbar></MobileNavbar>
      <div className='product-container'>
        <p><b>Name: </b>{product.name}</p>
        <p><b>ID: </b> {product.id}</p>
        <p><b>Price: </b> {product.price}</p>
        <p><b>Dimensions: </b> {"x: " + product.dimensions.x + " y: " + product.dimensions.y + " z: " + product.dimensions.z}</p>
        <p><b>Stock: </b>{product.stock}</p>
        <p><b>Reviews: </b>
          {product.reviews? product.reviews.map( (review, index) => {
            if(index === product.reviews.length-1){
              return <span>{review}</span>
            }

            else{
              return <span>{review + ", "}</span>
            }
          }):<span>No reviews yet</span>}
        </p>

        <Link to={location.pathname+"/reviews"}>View Reviews</Link><br></br>
        <button name="add-review" className='add-review' onClick={addReview}>Add Review</button>
        <input type="text" id="review" name="review" placeholder='1-10' onChange={ (e) => {setReview(e.target.value)}}></input>
      </div>
    </>

  )
}

export default Product