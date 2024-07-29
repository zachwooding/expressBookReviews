const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const JWT_SECRET = 'RGI8cVGG5pxC1VDZe59QhQY6SbJ1yogMdQXsFclUK4xBHwIVtPaR8og8qoZVRaqkDbLUBPFvoPnBC2XhHwKQIg=='; // Replace with a secure key



app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Use 'true' if you're running in HTTPS, 'false' for HTTP
  }));
  
  app.use((req, res, next) => {
    console.log("Session data:", req.session);
    next();
  });
  
  app.use(express.json());

app.use("/customer/auth/*", function auth(req,res,next){
// Check if the session contains a user ID or token
console.log("Authorization check. Session:", req.session.id);
if (req.session && req.session.userId) {

    const token = req.session.token;
    console.log("Token retrieved from session:", token);
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Failed to authenticate token." });
            }
            // Token is valid, proceed
            req.userId = decoded.id;
            next();
        });
    } else {
        // No token, unauthorized access
        res.status(401).send({ message: "Unauthorized access, no token provided." });
    }
} else {
    // No session or user information, unauthorized access
    res.status(401).send({ message: "Unauthorized access, please log in."});
}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.listen(PORT,()=>console.log("Server is running"));
