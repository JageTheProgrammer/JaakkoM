// Filename - App.js

const express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
const User = require("./model/User");

let app = express();

const path = require("path");

// serve static files (html, css, frontend js)
app.use(express.static(path.join(__dirname)));


// Use your MongoDB Atlas connection string (replace <username>, <password>, <dbname>)
mongoose.connect("mongodb+srv://GT:1687@chat.cnrwgkk.mongodb.net/?retryWrites=true&w=majority&appName=CHAT", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

// Register
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render("register", { errorGeneral: "Username and password are required." });
    }
    User.register(new User({ username }), password, (err, user) => {
        if (err) {
            if (err.name === "UserExistsError") {
                return res.render("register", { errorExists: "Username already exists." });
            }
            if (err.message && err.message.toLowerCase().includes("password")) {
                return res.render("register", { errorPassword: err.message });
            }
            return res.render("register", { errorGeneral: "Registration failed. Please try again." });
        }
        passport.authenticate("local")(req, res, () => {
            res.render("register", { successMessage: "Registration successful! You are now logged in." });
        });
    });
});

// Login
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            return res.render("login", { errorGeneral: "An error occurred. Please try again." });
        }
        if (!user) {
            // info.message can be "Incorrect username" or "Incorrect password"
            if (info && info.message && info.message.toLowerCase().includes("username")) {
                return res.render("login", { errorUser: "Username not found." });
            }
            if (info && info.message && info.message.toLowerCase().includes("password")) {
                return res.render("login", { errorPassword: "Incorrect password." });
            }
            return res.render("login", { errorGeneral: "Login failed. Please try again." });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.render("login", { errorGeneral: "Login failed. Please try again." });
            }
            return res.redirect("/secret");
        });
    })(req, res, next);
});
// Logout
app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("🚀 Server started on port", port);
});
