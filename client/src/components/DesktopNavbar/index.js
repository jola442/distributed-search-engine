import { useState, useEffect, useRef, useContext} from "react"
import { NavLink } from "react-router-dom"
import NavLinks from "../NavLinks"
import SearchBar from "../SearchBar"

export default function DesktopNavbar() {

  return (
    <nav className="desktop-nav">
        {/* <div className="logo">
            <NavLink to = "/">
                <img src="../../logo.png" alt="logo" style={{width: "120px", height:"64px"}}></img>
            </NavLink>
        </div> */}
        <NavLinks isMobile={false}/>
        <SearchBar/>
       
    </nav>
  )
}

