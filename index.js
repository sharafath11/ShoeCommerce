import express from "express";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import bodyParser from "body-parser";
import dotenv from "dotenv";
import passport from "passport";
import mongoose from "mongoose";
import session from 'express-session'
import MongoStore from 'connect-mongo';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(passport.initialize());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:"mongodb+srv://jdtbcajdt:WEfrMmAFC3RZdiV5@cluster7.24ktr.mongodb.net/"
    ,
    ttl: 14 * 24 * 60 * 60, // Set a time-to-live (TTL) of 14 days
    autoRemove: 'native' // Automatically remove expired sessions
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true, // Helps prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie expires in 7 days
  }
}));

mongoose
  .connect(process.env.MONOGOURL)
  .then((res) => {
    console.log(`databse connected succes full`);
  })
  .catch((error) => {
    console.log(error);
  });



app.set("view engine", "ejs");
app.set("views", "./Views");
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(express.static('public')); 
app.use(express.static("views/user"));
app.use(express.static("views/admin"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use((req, res, next) => {
  res.status(404).render('user/404');
});
app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
