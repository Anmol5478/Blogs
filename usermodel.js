const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/test');


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const blogschema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  recomended: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});



const Blogmodel = mongoose.model('blogs', blogschema);
const usermodel = mongoose.model('todoUser', UserSchema);

module.exports = {usermodel, Blogmodel}; ;