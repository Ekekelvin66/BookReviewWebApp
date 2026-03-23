import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
const port=process.env.PORT || 3000
const app=express();
import bookRoutes from './routes/bookRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { requireAuth } from './middleware/requireAuth.js';
import session from 'express-session'

app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(express.json());

app.set("view engine","ejs");



app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        maxAge:1000*60*60*24
    }
}))
app.use('/',authRoutes)
app.use('/',requireAuth,bookRoutes)


app.listen(port,()=>{
    console.log(`Server is listerning on http://localhost:${port}`)
})