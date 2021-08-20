const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const videoRoutes = require("./routes/video.routes");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("./models/user.model");
const routes = require("./routes/user.routes");

// ------------------------------------------------------------------------------
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const app = express();

const PORT = process.env.PORT || 5000;

mongoose.connect("mongodb://localhost:27017/said").then(() => {
  console.log("Connected to the Database successfully");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: "JWT token has expired, please login to obtain a new one",
      });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

app.use("/", routes);
// app.listen(PORT, () => {
//   console.log("Server is listening on Port:", PORT);
// });

require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: "JWT token has expired, please login to obtain a new one",
      });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});
// ------------------------------------------------------------------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
// jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

// routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/video", videoRoutes);


// Routes ----------------------------------------------
// app.use("/api/posts", require("./routes/post.routes"));
// app.use("/api/user", require("./routes/user.routes"));
// app.use("/api/video", require("./routes/video.routes"));
// app.use("/api/message", require("./routes/message.routes"));

app.listen(5000, function () {
  console.log(`listening on port ...`, 5000);
});
