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
          res.redirect("/blogs");
      }else{
          res.status(400).send('Invalid credentials');
      }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
}
);
app.post('/register', upload.single('Image'), async (req, res) => {
  let { username, email, password } = req.body;
  
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createduser = await usermodel.create({
        username,
        email,
        password: hash,
        Image: req.file.path // Cloudinary URL will be here
      });

      let token = jwt.sign({ email }, 'secret');
      res.cookie('token', token);
      res.redirect("/dashboard");
    });
  });
});


app.get("/blogs/:id", async (req, res) => {
  const blog = await Blogmodel.findById(req.params.id);
  res.render("readmore", { blog });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
}
);

app.get('/blog/write', authenticateUser, (req, res) => {
  res.render('blog');
});

app.post('/blog/write', authenticateUser, async (req, res) => {
  try {
      const blogData = {
          title: req.body.title,
          content: req.body.content,
          recomended: req.body.recomended === 'on',
          email: req.user.email, // Automatically associate the blog with the logged-in user's email
      };

      const newBlog = await Blogmodel.create(blogData);
      res.redirect('/blogs');
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while saving the blog.');
  }
});
app.get('/dashboard', authenticateUser, async (req, res) => {
  const user = req.user; // User is now set by the middleware
  const userBlogs = await Blogmodel.find({ author: user._id }); // Fetch blogs written by the user
  res.render('dashboard', { user, userBlogs }); // Pass user and blogs to the template
});
app.get('/blogs', async (req, res) => {
  let blogs= await Blogmodel.find();
  res.render('Allblogs', {blogs});
}
);

app.get('/blogs/:id/edit', async (req, res) => {
  const blog = await Blogmodel.findById(req.params.id);
  res.render('edit', { blog });
}
);
app.post('/blogs/:id/edit', async (req, res) => {
  const { title, content, recomended } = req.body;
  await Blogmodel.findByIdAndUpdate(req.params.id, {
      title,
      content,
      recomended: recomended === 'on' // Convert "on" to true, otherwise false
  });
  res.redirect('/blogs');
}
);
app.get('/blogs/:id/delete', async (req, res) => {
  await Blogmodel.findByIdAndDelete(req.params.id);
  res.redirect('/blogs');
}
);
app.get('/blogs/:id/recomended', async (req, res) => {
  const blog = await Blogmodel.findById(req.params.id);
  blog.recomended = !blog.recomended; // Toggle the recomended status
  await blog.save();
  res.redirect('/blogs');
}
);

app.listen(3000)