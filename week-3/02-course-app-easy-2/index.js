const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const secretKey = "SuperSecret";

let ADMINS = [];
let USERS = [];
let COURSES = [];

const generateJwt =(user)=>{
  const payload = {username: user.username,};
  return jwt.sign(payload,secretKey, {expiresIn: '1h'});
}

const authenticateJwt = (req,res,next)=>{
  const authHeader  = req.headers.authorization;

  if(authHeader){
    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err,user)=>{
      if(err)
        return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
  else{
    res.sendStatus(401);
  }
};

// Admin routes
app.post('/admin/signup', (req, res) => {
   const admin = req.body;
   const existingAdmin = ADMINS.find(a=>a.username===admin.username);
   if(existingAdmin)
     res.status(403).send({message: "Admin already exists"});
   else{
     ADMINS.push(admin);
     const token = generateJwt(admin);
     res.json({message: "Admin created successfully", token});
   }
});

app.post('/admin/login', (req, res) => {
  const {username,password} = req.header;
  const admin = ADMINS.find(a=>a.username===username && a.password === password);
  if(admin){
    const token = generateJwt(admin);
    res.json({message: "Logged in successfully", token});
  }
  else{
    res.status(403).json({message: "Admin authentication failed"});
  }
});

app.post('/admin/courses', authenticateJwt,(req, res) => {
  const course = req.body;
  course.id = COURSES.length+1;
  COURSES.push(course);
  res.json({message: "Course created successfully", courseId:course.id});
});

app.put('/admin/courses/:courseId',authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(a=>a.id === courseId);
  if(course){
    Object.assign(course,req.body);
    res.json({message: "Course updated succesfully"});
  }
  else{
    res.status(404).json({message: "Course not found"});
  }
});

app.get('/admin/courses',authenticateJwt, (req, res) => {
  res.json({courses: COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = req.body;
  const existingUser = USERS.find(a=>a.username===user.username);
  if(existingUser){
    res.status(403).json({message: "User already exists"});
  }
  else{
    USERS.push(user);
    const token = generateJwt(user);
    res.json({message: "User created successfully", token});
  }
});

app.post('/users/login', (req, res) => {
  const {username,password} = req.headers;
  const user = USERS.find(a=>a.username===username && a.password===password);
  if(!user){
    const token = generateJwt(user);
    res.json({message: "Logged in Successfully",token});
  }
  else{
    res.status(403).json({messsage: "User authentication failed"});
  }
});

app.get('/users/courses', authenticateJwt,(req, res) => {
  res.json({course: COURSES});
});

app.post('/users/courses/:courseId',authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(a=>a.id === courseId);
  if(course){
    const user = req.user.username;
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json("Course Purchased Succesfully");
    }
    else{
      res.status(403).json({message: "User not found"});
    }
  }
  else{
    res.status(404).json({message: "Course not found"});
  }
});

app.get('/users/purchasedCourses', authenticateJwt,(req, res) => {
  const user = USERS.find(u=>u.username === req.user.username);
  if(user && user.purchasedCourses)
    res.json({purchasedCourses: user.purchasedCourses});
  else{
    res.status(404).json({message: "No courses purchased"});
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
