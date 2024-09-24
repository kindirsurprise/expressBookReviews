const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
   const token = req.headers['authorization']; // Token is expected in the Authorization header

    if (!token) {
        return res.status(403).json({ message: "Access denied, no token provided" });
    }

    // Verify the token
   jwt.verify(token.split(' ')[1], "your_secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // If valid, store the username from the token in the request for use in other routes
        req.username = decoded.username;
        next(); // Proceed to the next middleware or route handler
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
