import {db} from '../db.js'
import axios from 'axios'
export const getBookCover= async(title,author)=>{
    try{
        const response = await axios.get("https://openlibrary.org/search.json",{
        params:{
            title:title,
            author:author
        }
    })
      if(response.data.docs.length===0){
       return "/placeholder.jpg"
      }
     const result= response.data.docs[0].cover_i
      return result ? (`https://covers.openlibrary.org/b/id/${result}-M.jpg`): "/placeholder.jpg"
        
    }
    catch(err){
       console.error(err);
        return "/placeholder.jpg"
    }
}

export const renderAddPage = async (req, res) => {
    res.render("add.ejs")
}
export const addBook= async (req,res)=>{        
    try{
         const {title,author,rating,review,date_read,recommendation}=req.body;
         const cover_url=await getBookCover(title,author)
         const dbresult= await db.query("INSERT INTO books (title,author,rating,review,date_read,cover_url,created_at,recommendation) VALUES ($1,$2,$3,$4,$5::date,$6,NOW(),$7) RETURNING *",
            
            [title,author,rating,review,date_read,cover_url,recommendation]
        ) 
        res.redirect("/")
    }  
    catch(err){
        console.log(err);
        res.render("error",{message:err.message})
    }
}

export const getAllBooks = async (req, res) => {
    try {
        const sort = req.query.sort || 'created_at'
        const sortOptions = {
            'created_at': 'created_at DESC',
            'rating_desc': 'rating DESC',
            'rating_asc': 'rating ASC',
            'date_read': 'date_read DESC'
        }
        const orderBy = sortOptions[sort] || 'created_at DESC'
        const result = await db.query(`SELECT * FROM books ORDER BY ${orderBy}`)
        const books = result.rows
        res.render("index.ejs", { books, sort })

    } catch (err) {
        console.error(err)
        res.status(500).render("error", { message: "Server error" })
    }
}
export const getBook = async (req,res)=>{
    const{id}=req.params
    try{
        const result= await db.query("SELECT * FROM books WHERE ID= $1",
            [id]
        )
        const foundBook=result.rows[0]
            if(!foundBook){
             return res.redirect('/')
            }  
             res.render("view.ejs",{foundBook})
            
        }catch(err){
            res.render("error",{message:"BOOK not found" })
        }
    }
export const editBookDetails = async (req,res)=>{
    const{id}=req.params
    const {rating,review,recommendation}=req.body
    try{
        const result = await db.query("UPDATE books SET rating=$1,review=$2,recommendation=$3 WHERE ID=$4 RETURNING *",
            [rating,review,recommendation,id]
        )
        const editedBook=result.rows[0]
        res.render('view.ejs',{foundBook:editedBook})
    }
    catch(err){
        res.render('error',{message:"failed to fetch book details"})
       
    }
}
export const deleteBook = async (req,res)=>{
    const {id}=req.params
    try{
     const deletedBook = await db.query("DELETE FROM books WHERE ID =$1 RETURNING *",
        [id]
    ) 
     if (deletedBook.rows.length> 0) {
      res.redirect('/');
    } else {
      res.render('error', { error: 'Book not found' })
    }
}
    catch(err){
        res.status(500).render("error",{message:err.message})
         
    }
    
}