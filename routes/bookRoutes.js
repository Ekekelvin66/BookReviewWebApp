import express from "express";
import {
    getAllBooks, 
    getBook, 
    renderAddpage, 
    addBook
} from '../controllers/bookController.js'
import { requireAuth } from "../middlewares/requireAuth.js";
const router=express.Router();

router.get('/',getAllBooks)
router.get('/books/add',requireAuth,renderAddpage)
router.post('/books/add',requireAuth,addBook)
router.get('/books/:bookId',getBook)

export default router