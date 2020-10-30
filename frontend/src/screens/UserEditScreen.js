/** @format */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainder from '../components/FormContainder'
import { getUserDetails, updateUserAdmin } from '../actions/userActions'
import { USER_UPDATE_ADMIN_RESET } from '../constants/userConstants'

const UserEditScreen = ({ match, history }) => {
  const userId = match.params.id

  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')

  const dispatch = useDispatch()

  const userDetails = useSelector((state) => state.userDetails)
  const { loading, error, user } = userDetails

  const userUpdateAdmin = useSelector((state) => state.userUpdateAdmin)
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = userUpdateAdmin

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_ADMIN_RESET })
      history.push('/admin/userlist')
    } else {
      if (!user.fname || user._id !== userId) {
        dispatch(getUserDetails(userId))
      } else {
        setFname(user.fname)
        setLname(user.lname)
        setEmail(user.email)
        setIsAdmin(user.isAdmin)
      }
    }
  }, [dispatch, userId, user, history])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUserAdmin({ _id: userId, fname, lname, email, isAdmin }))
  }

  return (
    <>
      <Link to='/admin/userlist' className='btn btn-light'>
        Go Back
      </Link>
      <FormContainder>
        <h1>Edit User</h1>
        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant='danger'>{error}</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='fname'>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type='text'
                placeholder={fname}
                value={fname}
                onChange={(e) => setFname(e.target.value)}></Form.Control>
            </Form.Group>

            <Form.Group controlId='lname'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type='text'
                placeholder={lname}
                value={lname}
                onChange={(e) => setLname(e.target.value)}></Form.Control>
            </Form.Group>
            <Form.Group controlId='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type='email'
                placeholder={email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}></Form.Control>
            </Form.Group>
            <Form.Group controlId='isAdmin'>
              <Form.Check
                type='checkbox'
                label='Is Admin'
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}></Form.Check>
            </Form.Group>

            <Button type='submit' variant='primary'>
              Update
            </Button>
          </Form>
        )}
      </FormContainder>
    </>
  )
}

export default UserEditScreen
