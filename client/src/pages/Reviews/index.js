import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import "./index.css"
import MobileNavbar from '../../components/MobileNavbar';
import {v4 as uuidv4} from "uuid";

function Reviews() {
    const location = useLocation();
    const [reviews, setReviews] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(location.pathname).then(res => {
            console.log(res.data);
            setReviews(res.data.reviews);
        }).catch( (err) => {
            setError(err.response.data);
        })
    }, [location])

    if(!reviews){
        if(error){
            return <>
                <MobileNavbar></MobileNavbar>
                <p className='no-results'>{error}</p>
                </>
        }
        return;
    }
    

    return (
        <>
            <MobileNavbar></MobileNavbar>
            <div className='reviews-container'>
                <p><b>Reviews: </b>
                {reviews.length >= 1? reviews.map( (review, index) => {
                    if(index === reviews.length-1){
                    return <span key={uuidv4()}>{review}</span>
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