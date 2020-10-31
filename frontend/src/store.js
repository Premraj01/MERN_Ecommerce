/** @format */

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import {
  productListReducers,
  productDetailsReducers,
  productDeleteReducers,
  productCreateReducers,
} from './reducers/productReducers'

import { cartReducer } from './reducers/cartReducers'
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateAdminReducer,
} from './reducers/userReducers'
import {
  orderCreateReducer,
  orderDetailsReducer,
  orderPayReducer,
  orderListMyReducer,
} from './reducers/orderReducers'

const reducer = combineReducers({
  productList: productListReducers,
  productDetails: productDetailsReducers,
  productDelete: productDeleteReducers,
  productCreate: productCreateReducers,
  cart: cartReducer,
  userLogin: userLoginReducer,
  userDetails: userDetailsReducer,
  userRegister: userRegisterReducer,
  userUpdate: userUpdateReducer,
  userList: userListReducer,
  userDelete: userDeleteReducer,
  userUpdateAdmin: userUpdateAdminReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderListMy: orderListMyReducer,
})

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : []

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {}

const initialState = {
  cart: {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
  },
  userLogin: {
    userInfo: userInfoFromStorage,
  },
}

const middleware = [thunk]

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
)

export default store
