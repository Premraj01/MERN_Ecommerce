/** @format */

import bcrypt from 'bcryptjs'

const users = [
  {
    fname: 'Admin',
    lname: 'User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    fname: 'john',
    lname: 'doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    fname: 'jane',
    lname: 'doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
]

export default users
