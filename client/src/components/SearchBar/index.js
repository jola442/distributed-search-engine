// import axios from 'axios'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'



function SearchBar() {
    const location = useLocation();
    const [searchOption, setSearchOption] = useState("all")
    const [searchText, setSearchText] = useState("")
    const [checked, setChecked] = useState(false);
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate();
    const DEFAULT_SEARCH_OPTION = "fruits";

    useEffect(() => {
        setSearchOption(DEFAULT_SEARCH_OPTION);
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
        
        // if(option === "all"){
        //     url = body + searchText;
        // }

        // else if(option === "inStock"){
        //     url = body + searchText + "&" + option + "=true";
        // }

        if(option === "fruits"){
            body = "/fruits?q="
            url  = body + searchText;
            url += checked?"&boost=true&limit=" + limit:"&limit="+limit;
        }

        else if(option === "personal"){
            body = "/personal?q="
            url  = body + searchText;
            url += checked?"&boost=true&limit=" + limit:"&limit="+limit;
        }
         
        console.log(url);

        setSearchText("");
        axios.get(url).then( res => {
            navigate(url);
            console.log(res.data);         
        }).catch( (err) => {
            navigate(url);
            console.log(err)
        })
    }

  return (
    <>
        <div className='search-bar'>
            <select value={searchOption} id="search-options" name="search-options" onChange={handleSearchOptionChanged}>
                {/* <option value="all">All Products</option>
                <option value='inStock'>In Stock Products</option> */}
                <option value='fruits'>Fruits</option>  
                <option value='personal'>Personal</option>  
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
        

        <label for='boost'><b>Boost</b></label>
        <input id="boost-checkbox" value="boost" type='checkbox' onChange={(e) => (setChecked(e.target.checked))}></input>      
        <label for='limit'><b>Limit</b></label>
        <input id="limit" type="number" value={limit} max={50} min = {1} step={1} onChange={(e) => (setLimit(e.target.value))}></input>
    </>
  )
}

export default SearchBar