import { db } from "../db.js"
export const renderReviewForm = async (req,res) => {
        const {reviewId,bookId}=req.params
    try{
     if(reviewId){
            const reviewResult = await db.query('SELECT * FROM reviews WHERE id=$1',[reviewId])
            const foundReview= reviewResult.rows[0]
            const booksResult= await db.query('SELECT * FROM BOOKS WHERE id=$1',[bookId])
            res.render('reviews/reviewForm.ejs',{review:foundReview,book:booksResult.rows[0]})   
        }else{
            const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [bookId])
            const foundBook = bookResult.rows[0];               
          res.render('reviews/reviewForm.ejs',{review:null,book:foundBook})
    }
    }catch(err){
        res.render('error.ejs', { message: err.message })
    }
}

export const addReview =async (req,res)=>{
    const{review,recommendation,rating,date_read} = req.body
    const {bookId}= req.params
    const user_id=req.session.user.id
    try{
        const result = await db.query(`INSERT INTO reviews (review,rating,recommendation,date_read,created_at,book_id,user_id) VALUES ($1,$2,$3,$4::date,NOW(),$5,$6) RETURNING *`,
            [review,rating,recommendation,date_read,bookId,user_id])
            res.redirect(`/books/${bookId}`) 
    }catch(err){
          res.render('error.ejs', { message: err.message })
    
    }
}

export const editReview = async (req,res) => {
     const{review,recommendation,rating} =req.body
     const {reviewId,bookId} =req.params
     try{
        const result = await db.query(`UPDATE reviews SET rating = $1,review=$2,recommendation=$3,updated_at=NOW() WHERE id = $4 RETURNING *`,[rating,review,recommendation,reviewId])
        const editedBook = result.rows[0]
        res.redirect(`/books/${bookId}`)
     }catch(err){
res.render('error.ejs', { message: err.message })

     }
     
}
export const deleteReview =async (req,res) => {
    const {reviewId,bookId} = req.params
    try{
        const deletedResult= await db.query(`DELETE FROM reviews WHERE id = $1 RETURNING *`,[reviewId])
        if(deletedResult.rows.length>0){
            return res.redirect(`/books/${bookId}`)
            // res.json('review deleted successfuly')
        }
        return res.render('error.ejs',{message:'Your Review not found'})       
    }catch(err){
            res.render('error.ejs', { message: err.message })
        }
}