const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
// Define JWT secret key
const JWT_SECRET = 'RGI8cVGG5pxC1VDZe59QhQY6SbJ1yogMdQXsFclUK4xBHwIVtPaR8og8qoZVRaqkDbLUBPFvoPnBC2XhHwKQIg=='; // Replace with a secure key


let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.token = token;
  req.session.userId = username;
  req.session.save();
  console.log("User stored in session:", req.session.userId);
  console.log("Token stored in session:", req.session.token);
  console.log(req.session.id);
  return res.status(200).json({ token });
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const { review } = req.query;
  const { isbn } = req.params;
  
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded.username;

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
      books[isbn] = { reviews: [] };
    }

    const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
    
    if (existingReviewIndex !== -1) {
      books[isbn].reviews[existingReviewIndex].review = review;
    } else {
      books[isbn].reviews.push({ username, review });
    }

    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization'];
  const { isbn } = req.params;
  
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    const initialLength = books[isbn].reviews.length;
    books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== username);
    
    if (books[isbn].reviews.length === initialLength) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
