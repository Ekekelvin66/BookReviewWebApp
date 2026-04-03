import express from 'express'
import dotenv from 'dotenv'
import session from 'express-session';
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import {requireAuth} from './middlewares/requireAuth.js'

dotenv.config();
const port=process.env.PORT || 4000
const app=express();


app.use(express.urlencoded({extended:true}));
app.use(express.static('public'))
app.use(express.json())

app.set('view engine','ejs')

app.use(session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        maxAge:1000*60*60*24*7,
        secure:false
    }

}))
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
app.use('/',authRoutes)
app.use('/',bookRoutes)
app.use('/',requireAuth,reviewRoutes)
app.use('/',requireAuth,profileRoutes)


app.listen(port,()=>{
    console.log(`Server is listening on http://localhost:${port}`)
})