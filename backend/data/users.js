/** @format */

import bcrypt from 'bcryptjs'

const users = [
  {
    name: { fname: 'Admin', lname: 'User' },
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: { fname: 'john', lname: 'doe' },
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: { fname: 'jane', lname: 'doe' },
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
]

export default users
