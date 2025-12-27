const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Skybrisk Backend API Running 🚀");
});

// error handler
app.use(errorHandler);

module.exports = app;
