/** @format */

import React from 'react'
import { Spinner } from 'react-bootstrap'

const Message = (props) => {
  return (
    <Spinner
      animation='grow'
      role='status'
      size='sm'
      style={{
        width: '100px',
        height: '100px',
        margin: 'auto',
        display: 'block',
      }}>
      <span class='sr-only'>Loading...</span>
    </Spinner>
  )
}

Message.propTypes = {}

export default Message
