const express = require("express");
const path = require("path");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { logEvents } = require("./middleware/logger");
const connectDB = require("./config/dbConnect");
const userRoute = require("./routes/user");
const noteRoute = require("./routes/note");
const authRoute = require("./routes/authRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3500;

// coonection to the DB
connectDB();

// custom middleware
app.use(logger);

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// // cookies
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/notes", noteRoute);


// errorHandler middleware
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (error) => {
  console.log(error);
  logEvents(
    `${error.no}:${error.code}\t${error.syscall}\t${error.hostname}`,
    "mongoErrLog.log"
  );
});
