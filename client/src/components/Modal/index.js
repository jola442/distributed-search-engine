import { memo, useState } from 'react'
import ReactDom  from 'react-dom';
import "./index.css"
import {v4 as uuidv4} from "uuid";
import { FaTimes } from "react-icons/fa"
import DOMPurify from 'dompurify';
import axios from 'axios';
import {useLocation, useNavigate } from 'react-router-dom';



const Modal = ( {title, isOpen, closeModal, role}) => {

    const [name, setName] = useState("");
    const navigate = useNavigate();
    const location = useLocation();


    function addPerson(){
        axios.post("/movies/"+title+"/"+role.toLowerCase()+"s", {name, title}).then( () =>{
            closeModal();
            // navigate(location.pathname + location.search);
            // window.location.reload();
            }                
        );
    
        // if(input != null){
        //     let data = {name:input, title:movieTitle};
        //     var xhttp = new XMLHttpRequest();
        //     xhttp.onreadystatechange = function() {
        //     if (this.readyState == 4 && this.status == 200) {
        //         alert("Writer added successfully");
        //         window.location.reload();
        //     }
        //     else if(this.readyState == 4 && this.status == 400){
        //         alert("Unable to add writer");
        //     }
        //     };
        //     xhttp.open("POST", "/movies/"+movieTitle+"/writers", true);
        //     xhttp.setRequestHeader("Content-type","application/json");
        //     xhttp.send(JSON.stringify(data));
        // }
    }

    function onCloseClicked(event){
        closeModal();
    }

  return ReactDom.createPortal(
    <>
        {isOpen &&
        <>
        <div className='modal-overlay' onClick={onCloseClicked}>
        <div className='modal-container' onClick={(e) => {e.stopPropagation()}}>
            <div className='close-button' onClick={onCloseClicked}> <FaTimes/></div>

            <p><b>{"Enter the new " + role.toLowerCase() + "'s name"}</b></p>
            <input type='textbox' value={name} name={name} onChange={(e) => {setName(e.target.value)}}></input>
            <button onClick={addPerson}>{"Add " + role}</button>
        </div>
            
        </div>
        
         </>} 
      
    </>, 
    document.getElementById("modal"))
}

export default memo(Modal)