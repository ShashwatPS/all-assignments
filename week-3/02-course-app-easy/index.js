const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let idcount  =1;


const userauthentication = (req,res,next)=>{
  const {username, password} = req.headers;
  const user = USERS.find(a=>a.username===username && a.password===password);
  if(user){
    req.user = user;
    next();}
  else{
    res.status(403).json({message: "User authentication failed"});
  }
};
const adminauthentication = (req,res,next)=>{
  const { username, password } = req.headers;

  const admin = ADMINS.find(a=>a.username===username && a.password === password)
  if(admin)
    next();
  else{
    res.status(403).json({message: "Admin authentication failed"});
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin = req.body;
  const adminFound = ADMINS.find(item=>item.username===admin.username);
  if(adminFound)
    res.status(403).json({message: "Admin already exists"});
  else{
    ADMINS.push(admin);
    res.status(200).json({message: "Admin created successfully"});
  }
});

app.post('/admin/login', adminauthentication,(req, res) => {
  res.json({message: "Logged in successfully"});
});

app.post('/admin/courses', adminauthentication,(req, res) => {
  const course = req.body;
  course.id = idcount;
  idcount++;
  COURSES.push(course);
  res.json({message: "Course created successfully", courseId: course.id});
});

app.put('/admin/courses/:courseId',adminauthentication, (req, res) => {
  const courseId = parseInt(req.params.id);
  const course = COURSES.find(a=>a.id === courseId);
  if(course){
    Object.assign(course,req.body);
    res.json({message: "Course updated successfully"});
  }
  else{
    res.status(404).json({message: "Course not found"});
  }
});

app.get('/admin/courses', adminauthentication,(req, res) => {
  res.json({courses: COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: []
  }
  USERS.push(user);
  res.json({message: "User created successfully"});
});

app.post('/users/login', userauthentication,(req, res) => {
  res.json({message: "Logged in Sucessfully"});
});

app.get('/users/courses',userauthentication, (req, res) => {
  let filteredCourses = [];
  for(let i=0;i<COURSES.length;i++){
    if(COURSES[i].published)
      filteredCourses.push(COURSES[i]);
  }
  res.json({courses: filteredCourses});
});

app.post('/users/courses/:courseId', userauthentication,(req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c=>c.id === courseId && c.published)
  if(course){
    req.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully"});
  }
  else{
    res.status(404).json({message: "Course not found or not available"});
  }
});

app.get('/users/purchasedCourses',userauthentication, (req, res) => {
  const purchasedCourses = COURSES.filter(c=> req.user.purchasedCourses.includes(c.id));
  res.json({purchasedCourses});
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
