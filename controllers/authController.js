import bcrypt from "bcrypt";
import { db } from "../db.js";
const SaltRounds=10

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

    await db.query(
      "INSERT INTO users (name, email, passwordhash) VALUES ($1, $2,$3)",
      [name.trim(),email.toLowerCase().trim(), hashedPassword]
    );
    res.redirect("/login");
   
  } catch (err) {
    res.render("error", { message: "Something went wrong.Pls try again" });
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

         if (!isMatch) {
         return res.status(401).render("auth/login.ejs", {redirect,error: "Invalid email or password",})
        // /return res.json({error:"Invalid email or password"})
        
    }
    req.session.user = {
      id: user.id,
      email: user.email,
      name:user.name
    };
    console.log(req.session.user)
    let target = redirect;
    if (!target.startsWith('/') || target.startsWith('//')) {
        target = '/';
    }
    res.redirect(target);
    ;
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

export const DeleteUser = async (req,res) => {
  
}