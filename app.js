import express from "express";
import "express-async-errors"; // No need to assign it; just import it
import dotenv from "dotenv"; // Import dotenv
dotenv.config(); // Load environment variables
import env from "dotenv";
import connectDB from "./db/connect.js";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import passportInit from "./passport/passportInit.js";
import connectMongoDBSession from "connect-mongodb-session";
import bodyParser from "body-parser";
import storeLocals from "./middleware/storeLocals.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import secretWordRouter from "./routes/secretWord.js";
import auth from "./routes/auth.js";
import jobsRouter from "./routes/jobs.js";
import helmet from 'helmet';
import xssClean from 'xss-clean';
import rateLimit from "express-rate-limit";

const MongoDBStore = connectMongoDBSession(session);

env.config();

const app = express();

app.use(express.static("public"));

app.use(
  helmet({
    hsts: false,                  // Disable HTTPS enforcement
  })
);
app.use(xssClean());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(sessionParms));
app.use(flash());
app.use((req, res, next) => {
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  next();
});
app.use(storeLocals);
passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", "./views");

// secret word handling
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", sessionRoutes);
app.use("/secretWord", auth, secretWordRouter);

app.use("/jobs", auth, jobsRouter);

const port = process.env.PORT || 3000;
await connectDB(process.env.MONGO_URI);

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();