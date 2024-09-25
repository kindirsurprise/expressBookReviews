const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

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

    return res.status(200).json({ message: "Login successful", token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    // Step 1: Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Step 2: Check if the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Step 3: Store the review, using the username as the key (from JWT session)
    const username = req.username; // Make sure the auth middleware sets req.username
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added successfully", book });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    // Step 1: Retrieve the book using the provided ISBN
    const book = books[isbn];

    // Step 2: Check if the book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Step 3: Check if the user has a review for this book
    const username = req.username;  // Assume req.username is set by the authentication middleware
    const reviews = book.reviews;

    if (!reviews[username]) {
        return res.status(403).json({ message: "No review found for this user" });
    }

    // Step 4: Delete the user's review
    delete reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
