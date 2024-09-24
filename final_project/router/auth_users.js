const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (!isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user
    users.push({ username, password }); // Remember to hash passwords in a real app!
    return res.status(201).json({ message: "User registered successfully" });
});

const isValid = (username)=>{ //returns boolean
    return !users.find(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(user => user.username === username);
  return user && user.password === password; // This checks if user exists and password matches
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const isAuthenticated = authenticatedUser(username, password);

    if (!isAuthenticated) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, 'seckey', { expiresIn: '1h' });

    // Save the token to the session
    req.session.token = token;

    return res.status(200).json({ message: "Login successful" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query; // Get review from query parameters
    const { isbn } = req.params; // Get ISBN from request parameters
    const username = req.session.username; // Get username from session

    // Check if the user is authenticated
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Check if the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Find the book by ISBN
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify the review
    book.reviews[username] = review; // Update or add review for the user

    return res.status(200).json({ message: "Review added/modified successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
