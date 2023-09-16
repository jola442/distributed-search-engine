// import axios from 'axios'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'



function SearchBar() {
    const location = useLocation();
    const [searchOption, setSearchOption] = useState("all")
    const [searchText, setSearchText] = useState("")
    const navigate = useNavigate();

    useEffect(() => {
        setSearchOption("all");
        if(!(location.pathname + location.search).includes("?")){
            setSearchText("")
        };
        
    }, [location])
    

    function handleSearchOptionChanged(event){
        setSearchOption(event.target.value);
    }

    function handleSearchTextChanged(event){
        setSearchText(event.target.value);
    }

    function handleKeyDown(event){
        if(event.key == "Enter"){
            return search()
        }
    }


    function search(){
        console.log(searchText, searchOption)
    
        let body = "/products?name=";
        let option = searchOption;
        let url;
        
        if(option === "all"){
            url = body + searchText;
        }

        else if(option === "inStock"){
            url = body + searchText + "&" + option + "=true";
        }
         
        console.log(url);

        setSearchText("");
        axios.get(url).then( res => {
            navigate(url);
            console.log(res.data);         
        })
    }

  return (
    <div className='search-bar'>
        <select value={searchOption} id="search-options" name="search-options" onChange={handleSearchOptionChanged}>
            <option value="all">All</option>
            <option value='inStock'>In Stock</option>  
        </select>

        <div className='search-textbox-div'>
            <input id="search-textbox" value={searchText} onKeyDown={handleKeyDown} onChange={handleSearchTextChanged} type="text" name="search-textbox" placeholder='Search products...'></input>
        </div>

        <div className='search-button'>
            <button onClick={search}>
                <FaSearch />
            </button>
        </div>
    </div>
  )
}

export default SearchBar