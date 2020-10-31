/** @format */

import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()
import {
  getProductById,
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from '../controllers/productControllers.js'
import Product from '../models/productModel.js'

router.route('/').get(getProducts).post(protect, admin, createProduct)

router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct)

export default router
