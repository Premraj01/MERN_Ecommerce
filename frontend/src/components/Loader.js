/** @format */

import React from 'react'
import { Spinner } from 'react-bootstrap'

const Message = (props) => {
  return (
    <Spinner
      className='spinner-grow spinner-grow-sm'
      role='status'
      style={{
        width: '60px',
        height: '60px',
        margin: 'auto',
        display: 'block',
      }}>
      <span className='sr-only'>Loading...</span>
    </Spinner>
  )
}

Message.propTypes = {}

export default Message
