import bcrypt from "bcrypt";
import { db } from "../db.js";
import crypto from 'crypto'
const SaltRounds=10
import {sendResetEmail} from "../utils/sendResetEmail.js";
import {sendVerifyEmail} from "../utils/sendVerifyEmail.js";

export const renderRegister = (req, res) => {
    if(req.session.user) return res.redirect('/')
  res.render("auth/register.ejs",{error:null});
};

export const renderLogin = (req, res) => {
    if(req.session.user) return res.redirect('/')
  res.render("auth/login.ejs",{redirect:req.query.redirect||'',error:null});
};

// REGISTER
export const registerUser = async (req, res) => {
  const { name,email, password,} = req.body;
    if(!name||!email||!password) return res.render("auth/register.ejs",{error:'All fields must be filled'})
    if(password.length<8) return res.render('auth/register.ejs',{error:'Password must be at least 8 characters'})

  try {
    const result = await db.query("SELECT id from users WHERE email =$1",[email.toLowerCase().trim()])

    if(result.rows.length>0){
        return res.render("auth/register.ejs",{error: "An account with this email already exists"})
    }
    const hashedPassword = await bcrypt.hash(password, SaltRounds);
    const token=crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 3600000);
    await db.query(
      "INSERT INTO users (name, email, passwordhash,is_verified,verific_token,verific_token_expiry) VALUES ($1, $2,$3,false,$4,$5)",
      [name.trim(),email.toLowerCase().trim(), hashedPassword,token,expiry]
    );
   await sendVerifyEmail(email,token)
   res.render('auth/register.ejs',{message:'Check your email for a verify link!'})
   
  } catch (err) {
    res.render("error", { message:err.message });
  }
};


export const verifyUser=async (req,res) => {
  const token = req.query.token
  try{
    const result= await db.query('SELECT * FROM users WHERE verific_token = $1 AND verific_token_expiry > NOW()',[token])
  if(result.rows.length===0){
    res.render('auth/verifyUser',{error:'This Link is invalid'})
  }else{
    await db.query('UPDATE users SET is_verified=True,verific_token=NULL,verific_token_expiry=NULL WHERE verific_token=$1',[token])
    res.render('auth/verifyUser.ejs',{success:true})
  }
  }catch(err){
    res.render("error", { message: err.message })
  }
  
}
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user) {
      return res.render("auth/verifyUser.ejs", { error: "No account found with that email." });
    }

    if (user.is_verified) {
      return res.render("auth/login.ejs", { message: "Account already verified. Please login." });
    }
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiry = new Date(Date.now() + 3600000); 

    await db.query(
      "UPDATE users SET verific_token = $1, verific_token_expiry = $2 WHERE email = $3",
      [newToken, newExpiry, email.toLowerCase().trim()]
    );

    // 5. Send the new email
    await sendVerifyEmail(email, newToken);

    res.render("auth/verifyUser.ejs", { message: "A new link has been sent to your inbox!" });

  } catch (err) {
    res.render("error", { message: err.message });
  }
};
// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const redirect = req.query.redirect || ''
    if(!email||!password) 
      return res.render('auth/login.ejs',{redirect,error:'Email and password are required'})
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email.toLowerCase().trim()]
    );
    if(result.rows.length===0){
        return res.render('auth/login.ejs',{redirect,error:'User does not exist.Create account'}) 
    }
       const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.passwordhash);
         if (isMatch) {
          if(!user.is_verified){
            return res.render("auth/verifyUser.ejs", { 
            error: "Your account is not verified yet. Please check your email or request a new link below.",
            email: user.email 
        });
          }
      req.session.user = {
            id: user.id,
            email: user.email,
            name:user.name,
            is_admin:user.is_admin
          };
          console.log(req.session.user)
          let target = redirect;
          if (!target.startsWith('/') || target.startsWith('//')) {
              target = '/';
          }
          res.redirect(target);
          ; 
        
    }else{
       return res.status(401).render("auth/login.ejs", {redirect,error: "Invalid email or password",})
        // /return res.json({error:"Invalid email or password"})
    }
    
  } catch (err) {
    res.render("error", { message: err.message });
  }
};


export const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
    //res.json('Logout Successful')
  });
};
export const renderForgotPassword = async (req,res) => {
  res.render('auth/forgotPassword',{error:null,message:null})
}
export const renderResetPassword = async (req,res) => {
  res.render('auth/newPassword',{error:null,token:req.query.token})
}

export const ForgotPassword = async (req,res) => {
  const {email}= req.body
  try{
    if(!email) return res.render('auth/forgotPassword.ejs',{error:'Email is required'})

      const foundResult =await db.query('SELECT * FROM users WHERE email=$1',[email.toLowerCase()])
    if(foundResult.rows.length===0){
    return res.render('auth/forgotPassword.ejs',{error:'User does not exist.Create account'})
    }
    const user = foundResult.rows[0]
    const token=crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 3600000);
    const updateResult=await db.query('UPDATE users SET reset_token=$1,token_expiry=$2 WHERE email=$3',
      [token,expiry,email.toLowerCase()])
    await sendResetEmail(email,token) 
    res.render('auth/forgotPassword.ejs', { message: 'Check your email for a reset link!' });  
  }
  
 catch(err){
      res.render('error.ejs',{message:err.message})
 }
}

export const setNewPassword= async (req,res) => {
  const token= req.query.token
  const {newPassword}= req.body;
   if (!newPassword) return res.render('auth/newPassword.ejs',{error:'This field is required',token})
  if(newPassword.length<8)return res.render('auth/newPassword.ejs',{error:'Password must be at least 8 characters',token})
    try{
  const result = await db.query('SELECT * FROM users WHERE reset_token=$1 AND token_expiry>NOW()',
    [token])
    if(result.rows.length>0){
      const user=result.rows[0]
      const isSamePassword=await bcrypt.compare(newPassword,user.passwordhash)
      if(isSamePassword){
         return res.render('auth/newPassword.ejs', {
    error: 'New password cannot be the same as your old password.',
    token
  });
      }
      const hashedPassword= await bcrypt.hash(newPassword,SaltRounds)
    await db.query('UPDATE users SET passwordhash=$1,reset_token=NULL,token_expiry=NULL WHERE reset_token=$2',[hashedPassword,token])
    res.redirect('/login?message=Password updated!');
    } else {
      res.render('auth/newPassword.ejs', { error: 'Link is invalid.' });
    }
 
  }catch(err){
    res.render('error.ejs', { message: err.message });
  }
  
}