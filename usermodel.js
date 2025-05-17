const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/test');


const UserSchema = new mongoose.Schema({
  Image: {
    type: String
  },
  username: {
    type: String,
    required: true,
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
  },
  author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'todoUser', // Reference the user model
      required: true,
  },
});



const Blogmodel = mongoose.model('blogs', blogschema);
const usermodel = mongoose.model('todoUser', UserSchema);

module.exports = {usermodel, Blogmodel}; ;