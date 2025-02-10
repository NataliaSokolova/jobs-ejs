const express = require("express");
require("express-async-errors");
require("dotenv").config(); // Load environment variables

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const bodyParser = require("body-parser");

const app = express();

// MongoDB session store setup
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // Trust the first proxy
  sessionConfig.cookie.secure = true; // Use secure cookies in production
}

app.use(session(sessionConfig));

// Flash messages middleware
app.use(flash());

// Middleware to make flash messages available in templates
app.use((req, res, next) => {
  res.locals.errors = req.flash("error");
  res.locals.info = req.flash("info");
  next();
});

// Set up EJS as the view engine
app.set("view engine", "ejs");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.render("secretWord", { secretWord: req.session.secretWord });
});

app.post("/secretWord", (req, res) => {
  const secretWord = req.body.secretWord.toUpperCase();
  if (secretWord[0] === "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with P.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send(err.message);
});

// Start the server
const port = process.env.PORT || 3000;
const startServer = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();