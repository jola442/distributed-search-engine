import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from "react-router-dom"
// import axios from "axios";

export default function NavLinks( {isMobile, isVisible}) {
  const visibleNavLinkStyle = {
    transform:"translateY(0)",
    transition:"transform 0.5s ease-in-out"
  }

  const invisibleNavLinkStyle = {...visibleNavLinkStyle, ...{transform:"translateY(-100%)"}};

  function computeStyle(){
    if(isMobile){
      if(isVisible){
        return visibleNavLinkStyle;
      }

      else{
        return invisibleNavLinkStyle;
      }
    }

    else{
      return null;
    }
  }


  return (
    <ul className={isMobile?"mobile-navList":"desktop-navList"} style={computeStyle()}>
        <li>
            <NavLink className={ ({isActive})=>{return isActive?"active":""} } to = "/">Home</NavLink>
        </li>

        <li >
            <NavLink className={ ({isActive})=>{return isActive?"active":""} } to= "/products">Products</NavLink>
        </li>
    </ul>
  )
}
