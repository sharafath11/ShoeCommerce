import express from "express";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import passport from "passport";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.set("trust proxy", 1);

app.use(passport.initialize());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("database connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });

app.set("view engine", "ejs");
app.set("views", "./Views");

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.static("views/user"));
app.use(express.static("views/admin"));

app.use("/", userRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("user/404");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
