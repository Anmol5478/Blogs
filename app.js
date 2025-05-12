const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const {usermodel , Blogmodel}  = require('./usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dp3j1lxga', // Replace with your Cloudinary cloud name
    api_key: '747177168456589',       // Replace with your Cloudinary API key
    api_secret: 'FuJgVJfu7k92AoXhYTEsV3DVJZ4'  // Replace with your Cloudinary API secret
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'user_profiles', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
    },
});

const upload = multer({ storage: storage });

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) {
      return res.redirect('/login'); // Redirect to login if no token
  }

  try {
      const decoded = jwt.verify(token, 'secret'); // Verify token
      const user = await usermodel.findOne({ email: decoded.email }); // Find user by email
      if (!user) {
          return res.redirect('/login'); // Redirect if user not found
      }
      req.user = user; // Set user in req
      next(); // Proceed to the next middleware/route
  } catch (error) {
      console.error(error);
      res.redirect('/login'); // Redirect to login on error
  }
};


app.get('/', (req, res) => {
  res.render('index');

});

app.get(("/login"), (req, res) => {
  res.render('login');
}
);
app.post('/login', async (req, res) => {
  let {email, password} = req.body;
  let user= await usermodel.findOne({email});
  if(!user){
      return res.status(400).send('User not found');
  }
  bcrypt.compare(password, user.password, (err, result) => {
      if(result){
          let token = jwt.sign({email}, 'secret');
          res.cookie('token', token);
          res.redirect("/blog/write");
      }else{
          res.status(400).send('Invalid credentials');
      }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
}
);
app.post('/register', async (req, res) => {  
  let {username, email, password} = req.body;  
  bcrypt.genSalt(10,(err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => { 
          let createduser= await usermodel.create({
              username,
              email,
              password: hash,
              Image: req.file // Save the Cloudinary image URL
              
          });

         let token = jwt.sign({email}, 'secret');
         res.cookie('token', token);
          res.redirect("/dashboard");
      });  
  });
}
);

app.get("/blogs/:id", async (req, res) => {
  const blog = await Blogmodel.findById(req.params.id);
  res.render("readmore", { blog });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
}
);

app.get('/blog/write', (req, res) => {
  res.render("blog")
});

app.post('/blog/write', async (req, res) => {
  try {
      // Convert the "recomended" field to a Boolean
      const blogData = {
          title: req.body.title,
          content: req.body.content,
          recomended: req.body.recomended === 'on' // Convert "on" to true, otherwise false
      };

      // Save the blog to the database
      const newBlog = await Blogmodel.create(blogData);
      res.redirect('/blogs'); // Redirect to the list of blogs after saving
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while saving the blog.');
  }
});
app.get('/dashboard', authenticateUser, async (req, res) => {
  const user = req.user; // User is now set by the middleware
  const userBlogs = await Blogmodel.find({ author: user._id }); // Fetch blogs written by the user
  res.render('dashboard', { user, userBlogs });
});
app.get('/blogs', async (req, res) => {
  let blogs= await Blogmodel.find();
  res.render('Allblogs', {blogs});
}
);
app.listen(3000)