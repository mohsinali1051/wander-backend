const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost/record', { useNewUrlParser: true, useUnifiedTopology: true });

const registeredSchema = new mongoose.Schema({
  id: String,
  password: String
});

const Registered = mongoose.model('Registered', registeredSchema);


// for registration of user
app.post('/register', async (req, res) => {
  const idT = req.body.id;
  const password = req.body.password;

  const regis = await Registered.findOne({ id: idT });

    if (regis) {
      res.end('User with ID already exists in the database, Try another UserID');
    } 
    else {
      const registered = new Registered({
        id: idT,
        password: password
      });
    
      await registered.save();
      
      res.send('User registered successfully!');
    }

  
});

// for user login
app.post('/login', async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;

  const registered = await Registered.findOne({ id: id, password: password });

  if (registered) {
    res.send('Login successful!');
  } else {
    res.status(401).send('Invalid login credentials');
  }
});



// update user id
app.post('/updateID', async (req, res) => {
  const id = req.body.id;
  const newId = req.body.newid;

  // Check if a user with the new ID already exists
  const existingUser = await Registered.findOne({ id: newId });
  if (existingUser) {
    return res.status(409).send('User with new ID already exists');
  }

  // Find and update the user with the given ID
  const updatedUser = await Registered.findOneAndUpdate({ id: id }, { id: newId }, { new: true });
  if (!updatedUser) {
    return res.status(404).send('User not found');
  }

  res.send(`Updated user ID from ${id} to ${newId}`);
});


//update user password
app.post('/updatePassword', async (req, res) => {
  const id = req.body.id;
  const newPassword = req.body.newPassword;

  // Find and update the user with the given ID
  const updatedUser = await Registered.findOneAndUpdate({ id: id }, { password: newPassword }, { new: true });
  if (!updatedUser) {
    return res.status(404).send('User not found');
  }

  res.send(`Updated password for user ${id}`);
});



const blogPostSchema = new mongoose.Schema({
  title: String,
  image: String,
  description: String,
  authorID: String,
  authorName: String,
  comments: [{
    authorID: String,
    authorName: String,
    comment: String
  }]
});


const Blogs = mongoose.model('Blogs', blogPostSchema);

//createBLOGpost
app.post('/createBlog', async (req, res) => {
  const ttl = req.body.title;
  const img = req.body.image;
  const descr= req.body.description;
  const authID =req.body.authorID;
  const authName = req.body.authorName;

  const blog= new Blogs({
    title: ttl,
    image: img,
    description: descr,
    authorID: authID,
    authorName: authName
  });
  
  await blog.save();
  res.send(`New Blog post created for user ${authName}`);
});


//read BLOGposts
app.post('/readBlog', async (req, res) => {
 //means kis author ka blogs read krne
  const authID =req.body.authorID;
  const blogsposts = await Blogs.find({ authorID: authID });
  console.log(blogsposts);
  res.send(`Here are the blogs for user ${authID}`+ '\n\n'+JSON.stringify(blogsposts));
  //res.send();
});



app.post('/updateBlog', async (req, res) => {
  const ttl = req.body.title;
  const newttl = req.body.newTitle;
  const img = req.body.image;
  const descr= req.body.description;

// Check if a blog exists
const existingBlog = await Blogs.findOne({ title: ttl });
      if (existingBlog) {
        const updatedBlog = await Blogs.findOneAndUpdate(
          { title: ttl },
          { title: newttl, image: img, description: descr },
          { new: true }
        );
      }
      else {              //no blog found
        return res.status(404).send(`No blog found with Title: ${ttl}`);
      }

      res.send(`Updated Blog ID  with Title: ${ttl}`);
});
app.post('/deleteBlog', async (req, res) => {
  const title = req.body.title;
  const authID = req.body.authorID;

  const deletedBlog = await Blogs.findOneAndDelete({ title: title, authorID: authID });

  if (deletedBlog) {
    res.send(`Deleted blog with ID ${deletedBlog._id} and Title: ${deletedBlog.title}`);
  } else {
    res.status(404).send(`No blog found with Title: ${title} for Author ID: ${authID}`);
  }
});


// add comment to any post 
app.post('/addComment', async (req, res) => {
  const postTtl = req.body.title;
  const authorId = req.body.authorID;
  const authorName = req.body.authorName;
  const com = req.body.comment;

  const updatedPost = await Blogs.findOneAndUpdate(
    { title: postTtl },
    {
      $push: {
        comments: {
          authorID: authorId,
          authorName: authorName,
          comment: com
        }
      }
    },
    { new: true }
  );

  if (updatedPost) {
    res.send(updatedPost);
  } else {
    res.status(404).send(`No blog post found with ID: ${postId}`);
  }
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});