import express from 'express'
import {
   renderReviewForm,
    addReview, 
    editReview, 
    deleteReview 
} from '../controllers/reviewController.js'
const router = express.Router();

router.get('/books/:bookId/reviews/add',renderReviewForm);
router.get('/books/:bookId/reviews/:reviewId/edit',renderReviewForm);
router.post('/books/:bookId/reviews/add',addReview);
router.post('/books/:bookId/reviews/:reviewId/edit',editReview);
router.post('/books/:bookId/reviews/:reviewId/delete',deleteReview);


export default router;