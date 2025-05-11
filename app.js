const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const usermodel = require('./usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');

});

app.get(("/login"), (req, res) => {
  res.render('login');
}
);

// app.post('/login', async (req, res) => {
//   app.post('/login', async (req, res) => {
//     let {email, password} = req.body;
//     let user= await userModel.findOne({email});
//     if(!user){
//         return res.status(400).send('User not found');
//     }
//     bcrypt.compare(password, user.password, (err, result) => {
//         if(result){
//             let token = jwt.sign({email}, 'secret');
//             res.cookie('token', token);
//             res.redirect('/');
//         }else{
//             res.status(400).send('Invalid credentials');
//         }
//     });
// });
// }
// );

app.get('/register', (req, res) => {
  res.render('register');
}
);
app.post('/register', async (req, res) => {

    const createdUser = await usermodel.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    });
    console.log('User created:', createdUser);
    res.send('User created', createdUser);
  

  
});
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
}
);
app.listen(3000)