import express from "express";
import userRoutes from "./routes/userRoutes.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import passport from "passport";
import mongoose from "mongoose";
import session from 'express-session'
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(passport.initialize());
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 600000 } // Adjust cookie options as needed
}));
mongoose
  .connect("mongodb://localhost:27017/bro1")
  .then((res) => {
    console.log(`databse connected succes full`);
  })
  .catch((error) => {
    console.log(error);
  });
app.set("view engine", "ejs");
app.set("views", "./Views");
app.use(bodyParser.json());
app.use(express.static("views/user"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});