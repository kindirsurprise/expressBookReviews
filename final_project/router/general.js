const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register the new user
    users.push({ username, password }); // In a real application, password should be hashed
    return res.status(201).json({ message: "User registered successfully" });
});


// Get the list of books available using async-await
public_users.get('/', (req, res) => {
    new Promise((resolve, reject) => {
        resolve(books);  // Wrap books in a promise
    }).then((booksList) => {
        res.status(200).json(booksList);  // Send books when promise resolves
    }).catch((error) => {
        res.status(500).json({ message: 'Error fetching book list' });
    });
});

public_users.get('/isbn/:isbn', async (req, res) => {
    // Step 1: Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    try {
        // Step 2: Check if the book exists in the database
        const book = books[isbn]; // Assuming books is an object with ISBN as the key

        // Step 3: If book exists, return it; otherwise return an error message
        if (book) {
            return res.status(200).json(book); // Return book details as JSON
        } else {
            return res.status(404).json({ message: "Book not found" }); // Book not found
        }
    } catch (error) {
        console.error("Error fetching book details:", error); // Log the error
        return res.status(500).json({ message: 'Error fetching book details' }); // Handle errors
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    // Step 1: Retrieve the author from the request parameters
    const author = req.params.author;

    try {
        // Step 2: Obtain all keys for the ‘books’ object
        const bookKeys = Object.keys(books);
        const matchingBooks = []; // Array to hold books by the specified author

        // Step 3: Iterate through the 'books' object and check for matching authors
        for (const isbn of bookKeys) {
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn, ...books[isbn] }); // Push matching book with its ISBN
            }
        }

        // Step 4: Return the matching books or an error message
        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);  // Return matching books as JSON
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error); // Log the error
        return res.status(500).json({ message: 'Error fetching books by author' }); // Handle errors
    }
});

// Get book details based on title
public_users.get('/title/:title', (req, res) => {
    // Step 1: Retrieve the title from the request parameters
    const title = req.params.title;

    // Step 2: Obtain all keys for the ‘books’ object
    const bookKeys = Object.keys(books);
    const matchingBooks = []; // Array to hold books with the specified title

    // Step 3: Create a Promise to find matching books
    const findBooksByTitle = new Promise((resolve, reject) => {
        bookKeys.forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn, ...books[isbn] }); // Push matching book with its ISBN
            }
        });
        
        // Step 4: Resolve or reject the promise based on the matching books found
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("No books found with this title")); // Reject if no matching books found
        }
    });

    // Step 5: Handle the promise result
    findBooksByTitle
        .then((books) => {
            res.status(200).json(books); // Return matching books as JSON
        })
        .catch((error) => {
            if (error.message === "No books found with this title") {
                res.status(404).json({ message: "No books found with this title" }); // Handle not found
            } else {
                console.error("Error fetching books by title:", error); // Log the error
                res.status(500).json({ message: 'Error fetching books by title' }); // Handle errors
            }
        });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   // Step 1: Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Step 2: Check if the book exists in the database
    if (books[isbn]) {
        // Step 3: Return the reviews for the specified ISBN
        const reviews = books[isbn].reviews;
        return res.status(200).send(JSON.stringify(reviews, null, 4));  // Pretty-printing the reviews
    } else {
        // Step 4: Return an error message if the book is not found
        return res.status(404).json({ message: "Book not found" });
    }
});


// Register a new user
public_users.post('/register', function (req, res) {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register the new user
    users.push({ username, password }); // In a real application, password should be hashed
    return res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
