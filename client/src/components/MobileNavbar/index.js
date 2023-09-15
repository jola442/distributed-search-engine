import { NavLink } from "react-router-dom"
import { useState, useEffect, useRef} from "react"
import { FaBars, FaTimes } from "react-icons/fa"
import NavLinks from "../NavLinks"

export default function MobileNavbar() {
    const [navLinksVisible, setNavLinksVisible] = useState(false);

    function showNavLinks(){
        setNavLinksVisible(!navLinksVisible)
    }

  return (
    <>
    <nav className="mobile-nav">
        <div className="logo">
            {/* <NavLink to = "/">
                <img src="../../logo.png" alt="logo" style={{width: "120px", height:"64px"}}></img>
            </NavLink> */}
        </div>
        {!navLinksVisible && <div className="bars nav-icon" onClick={showNavLinks}>
            <FaBars/>
        </div>}

        {navLinksVisible &&<div className="x nav-icon" onClick={showNavLinks}>
            <FaTimes/>
        </div>}
        {/* {navLinksVisible && <NavLinks/>} */}
    </nav>
    <NavLinks isMobile={true} isVisible={navLinksVisible}></NavLinks>
    </>

    
  )
}

