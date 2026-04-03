import {db} from '../db.js'
import axios from 'axios';

export const getBookCover = async(title,author)=>{
    try{
        const response = await axios.get("https://openlibrary.org/search.json",{
            params:{
                title:title,
                author: author
            }
        })
        if(response.data.docs.length===0){
          return "/placeholder.jpg"
      }
     const result= response.data.docs[0].cover_i
      return result ? (`https://covers.openlibrary.org/b/id/${result}-M.jpg`): "/placeholder.jpg"
    }
    catch(err){
           return "/placeholder.jpg"
    }
}
export const checkBookExists= async(title)=>{
    const result= await db.query(`SELECT id FROM books where title ILIKE $1`,[title])
    if(result.rows.length>0){
        return result.rows[0].id
    }
    return null;
}

export const getAllBooks = async (req,res)=>{
    try{
       const sort =req.query.sort|| 'recent' 
       const genre= req.query.genre || ''
       const search =req.query.search || ''
        const sortOptions={
        'recent': 'books.created_at DESC',
        'highest_rated': 'avg_rating DESC NULLS LAST',
        'most_reviewed': 'review_count DESC NULLS LAST',
    } 
    const orderBy= sortOptions[sort] || 'books.created_at DESC'
    const conditions = []
        const values = []

        if (search) {
      
            values.push(`%${search}%`)
            conditions.push(`(books.title ILIKE $${values.length} OR books.author ILIKE $${values.length})`)
        }

        if (genre) {
            values.push(genre)
            conditions.push(`book_genres.genre_id = $${values.length}`)
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result= await db.query(`SELECT books.id,books.title,books.author,books.cover_url,books.created_at, ROUND(AVG(reviews.rating),1) as avg_rating, COUNT(reviews.id) as review_count FROM books LEFT JOIN reviews on books.id=reviews.book_id LEFT JOIN book_genres on books.id = book_genres.book_id LEFT JOIN genres on genres.id=book_genres.genre_id ${whereClause}  GROUP BY books.id ORDER BY ${orderBy}`,values)
    const genresResult = await db.query('SELECT * FROM genres ORDER BY name')
    const books = result.rows 
    const user=req.session.user|| null 
    res.render("books/index.ejs",{books,user,sort,search,selectedGenre:genre,genres:genresResult.rows}); 
    } catch(err){
      res.status(500).render("error", { message: "Server error" })
    }
    
}

export const getBook =async (req,res)=>{
    const {bookId} = req.params
    const user = req.session.user || null
    try{
        const bookResult = await db.query(`
            SELECT 
            books.id,
            books.title,
            books.author,
            books.cover_url,
            books.created_at,
            ARRAY_AGG(genres.name) AS genres,
            ROUND(AVG(reviews.rating),1) as avg_rating
            FROM books
            LEFT JOIN book_genres ON books.id = book_genres.book_id
            LEFT JOIN genres ON genres.id = book_genres.genre_id
            LEFT JOIN reviews ON books.id = reviews.book_id
            WHERE books.id = $1
            GROUP BY books.id
            `,[bookId])
            const foundBook= bookResult.rows[0];
            if(!foundBook){
                return res.redirect('/')
            }
            const reviewResult = await db.query(`
                SELECT 
                reviews.id,
                reviews.review,
                reviews.rating,
                reviews.recommendation,
                reviews.date_read,
                reviews.created_at,
                reviews.user_id,
                users.name AS reviewer_name
                FROM reviews
                LEFT JOIN users on reviews.user_id=users.id
                WHERE reviews.book_id = $1
                ORDER BY reviews.created_at DESC
                `,[bookId])
                const reviews = reviewResult.rows;
             
               const userReview = user
                ? reviews.find(r => r.user_id === user.id)
                : null
                res.render('books/view.ejs',{book:foundBook,reviews,userReview,user});
    }catch(err){
        res.render('error.ejs',{message:err.message})
    }
}
export const renderAddpage = async (req,res) => {
    try{
        if(!req.session.user){
        return res.redirect('/login')

    }
    const genreResults= await db.query(`SELECT * FROM genres`)
    const foundGenres= genreResults.rows;
    res.render('books/add.ejs',{genres:foundGenres,user:req.session.user})
;
    }catch(err){
        res.render('error.ejs',{message:err.message})
    }
 
}
export const addBook =async (req,res) => {
    try{
    const {title,author,genre,review,rating,recommendation,date_read} = req.body
    const booktitle=title.trim()
    const bookAuthor=author.trim()
    const checkBook = await checkBookExists(booktitle)
    if(checkBook){
        return res.redirect(`/books/${checkBook}`)
    } else{
        const cover_url = await getBookCover(booktitle,bookAuthor)

    const bookresult = await db.query(`INSERT INTO books (title,author,cover_url,created_at) VALUES ($1,$2,$3,NOW()) RETURNING * `,[booktitle,bookAuthor,cover_url])
    const newBook = bookresult.rows[0]
    const newBookId = newBook.id
    const genres = genre 
        ?  Array.isArray(genre)?genre:[genre]
        :[];
    for (const genreId of genres){
        await db.query('INSERT into book_genres (book_id,genre_id)  VALUES ($1,$2) ',[newBookId,genreId])
    }
  
    const reviewResult = await db.query(`INSERT INTO reviews (review,rating,recommendation,date_read,book_id,user_id) VALUES ($1,$2,$3,$4::date,$5,$6)`,[review,rating,recommendation,date_read,newBookId,req.session.user.id])
    res.redirect(`/books/${newBookId}`)
    // res.json({ message: 'Book added', bookId: newBookId })
    }
    }catch(err){
        res.render('error.ejs',{message:err.message})
       
    }
     
}