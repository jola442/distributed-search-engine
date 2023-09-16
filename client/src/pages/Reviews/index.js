import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';

function Reviews() {
    const location = useLocation();
    const [reviews, setReviews] = useState(null);

    useEffect(() => {
        axios.get(location.pathname).then(res => {
            console.log(res.data);
            setReviews(res.data);
        })
    }, [location])

    if(!reviews){
        return null;
    }
    

    return (
        <>
            <MobileNavbar></MobileNavbar>
            <div className='reviews-container'>
                <p><b>Reviews: </b>
                {reviews.length >= 1? reviews.map( (review, index) => {
                    if(index === reviews.length-1){
                    return <span>{review}</span>
                    }

                    else{
                    return <span>{review + ", "}</span>
                    }
                }):<span>No reviews yet</span>}
                </p>
            </div>

        </>

    )
}

export default Reviews