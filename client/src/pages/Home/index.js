import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MobileNavbar from '../../components/MobileNavbar'
import "./index.css"
import axios from 'axios'



function Home() {
  const [name, setName] = useState(null);
  const [price, setPrice] = useState(null);
  const [stock, setStock] = useState(null);
  const [dimensions, setDimensions] = useState({})
  const navigate = useNavigate();

  function handleChange(e){
    let name = e.target.name;
    let value = e.target.value;
    console.log(name)
    console.log(value);
    setDimensions( oldValue => ({...oldValue, [name]:value}));
  }

  useEffect( () => {
    console.log(dimensions)
  }, [dimensions])

  function createProduct(){
    axios.post("/products", {name, price, stock, dimensions:{x:dimensions.x, y: dimensions.y, z:dimensions.z}}).then(res => {
      if(res.status === 201){
        navigate("/products/" + res.data.id)
      }
    }).catch(err => {
      alert(err.response.data)
    })
  }

  return (
    <>
      <MobileNavbar></MobileNavbar>
      <div className='home-container'>
        <h1>Create Product</h1>
        <span><b>Name: </b></span>
        <input type='text' name="name" id="name" value={name} onChange={(e) => {setName(e.target.value)}}></input><br></br>
        <span><b>Price: </b></span>
        <input type='text' name="stock" id="stock" value={stock} onChange={(e) => {setStock(e.target.value)}}></input><br></br>
        <span><b>Stock: </b></span>
        <input type='text' name="price" id="price" value={price} onChange={(e) => {setPrice(e.target.value)}}></input><br></br>
        <span><b>X Dimension: </b></span>
        <input type='text' name="x" id="x" value={dimensions.x} onChange={handleChange}></input><br></br>
        <span><b>Y Dimension: </b></span>
        <input type='text' name="y" id="y" value={dimensions.y} onChange={handleChange}></input><br></br>
        <span><b>Z Dimension: </b></span>
        <input type='text' name="z" id="z" value={dimensions.z} onChange={handleChange}></input><br></br>
        <button className='create-product' onClick={createProduct}>Create Product</button>
      </div>

    </>
    
  )
}

export default Home