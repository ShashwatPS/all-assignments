const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const express = require('express');
const app = express();

app.use(express.json());

const SECRET = "My_Secret_Key";

const userSchema = new mongoose.Schema({
  username: {type: String},
  password: String,
  purchasedCourses: [{type: mongoose.Schema.Types.ObjectId,ref: 'Course'}]
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
})

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean
})

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course',courseSchema);

const authenticateJwt = (req,res,next)=>{
  const authHeader = req.headers.authorization;
  if(authHeader){
    const token = authHeader.split(' ')[1];
    jwt.verify(token,SECRET, (err,user)=>{
      if(err){
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  }
  else{
    res.sendStatus(401);
  }
};

mongoose.connect("mongodb+srv://ShashwatPS:s@cluster0.1alkv6j.mongodb.net/courses",{useNewUrlParser: true, useUnifiedTopology: true});

app.post('/admin/signup', (req, res) => {
  const {username,password} = req.body;
  function callback(admin){
    if(admin){
      res.status(403).json({message: "Admin already exists"});
    }
    else{
      const obj = {username: username, password: password};
      const newAdmin = new Admin(obj);
      newAdmin.save();
      const token = jwt.sign({username, role: 'admin'}, SECRET, {expiresIn: '1h'});
      res.json({message: 'Admin created successfully', token});
    }
  }
  Admin.findOne({username}).then(callback);
});

app.post('/admin/login', async (req, res) => {
  const {username, password} = req.headers;
  const admin = await Admin.findOne({username, password});
  if(admin){
    const token = jwt.sign({username, role: 'admin'},SECRET, {expiresIn: '1h'});
    res.json({message: "Logged in successfully",token});
  }
  else{
    res.status(403).json({message: 'Invalid username or password'});
  }
});

app.post('/admin/courses', async(req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({message: "Course created Successfully", courseId: course.id});
});

app.put('/admin/courses/:courseId', (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId)
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
