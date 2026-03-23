import express from 'express'
import {getBookCover,addBook,renderAddPage,getAllBooks,getBook,editBookDetails,deleteBook} from '../controllers/bookControllers.js'
import { logoutUser } from '../controllers/authContoller.js';
const router = express.Router()

router.get("/books/add",renderAddPage);
router.post('/books/add',addBook);
router.get('/',getAllBooks);
router.get('/books/:id',getBook);
router.post('/books/:id/edit',editBookDetails);
router.post('/books/:id/delete',deleteBook);
router.post("/logout", logoutUser);

export default router;