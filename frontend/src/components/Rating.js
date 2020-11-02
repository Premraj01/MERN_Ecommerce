/** @format */

import React from 'react'
import { BsStarFill, BsStarHalf, BsStar } from 'react-icons/bs'
import PropTypes from 'prop-types'

const Rating = ({ value, text, color }) => {
  return (
    <div className='rating'>
      <span>
        <i style={{ color }} className='rating-icons'>
          {value >= 1 ? (
            <BsStarFill />
          ) : value >= 0.5 ? (
            <BsStarHalf />
          ) : (
            <BsStar />
          )}
        </i>
      </span>
      <span>
        <i style={{ color }} className='rating-icons'>
          {value >= 2 ? (
            <BsStarFill />
          ) : value >= 1.5 ? (
            <BsStarHalf />
          ) : (
            <BsStar />
          )}
        </i>
      </span>
      <span>
        <i style={{ color }} className='rating-icons'>
          {value >= 3 ? (
            <BsStarFill />
          ) : value >= 2.5 ? (
            <BsStarHalf />
          ) : (
            <BsStar />
          )}
        </i>
      </span>
      <span>
        <i style={{ color }} className='rating-icons'>
          {value >= 4 ? (
            <BsStarFill />
          ) : value >= 3.5 ? (
            <BsStarHalf />
          ) : (
            <BsStar />
          )}
        </i>
      </span>
      <span>
        <i style={{ color }} className='rating-icons'>
          {value >= 5 ? (
            <BsStarFill />
          ) : value >= 4.5 ? (
            <BsStarHalf />
          ) : (
            <BsStar />
          )}
        </i>
      </span>

      <span>{text && text}</span>
    </div>
  )
}
Rating.defaultProps = {
  color: '#f8e825',
}

Rating.propTypes = {
  /*value: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,*/
  color: PropTypes.string,
}

export default Rating
