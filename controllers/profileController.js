import { db } from "../db.js";
export const getUserProfile = async (req,res)=>{
    const user= req.session.user;
    try{
        const result = await db.query(`
                SELECT 
                books.id AS book_id,
                books.title,
                books.cover_url,
                books.author,
                reviews.rating,
                reviews.recommendation,
                reviews.review,
                reviews.id AS review_id,
                reviews.created_at
                FROM books
                JOIN reviews ON reviews.book_id=books.id
                WHERE reviews.user_id=$1
            `,[user.id])
            const usersBooks= result.rows
            const usersBookcount=result.rows.length
            res.render('profile.ejs',{reviews:usersBooks,user,usersBookcount})
            // res.json({
            //     usersBooks, user, usersBookcount
            // })
        
    }catch(err){
        res.render('error.ejs', { message: err.message })
       
    }
}
    