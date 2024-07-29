

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// API
const authRouter = require("./app/api/routes/auth");
const documentRouter = require("./app/api/routes/document");
const userRouter = require("./app/api/routes/user");

var app = express();
const URL = '/api/v1';
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
// API
app.use(`${URL}/auth`, authRouter);
app.use(`${URL}/document`, documentRouter);
app.use(`${URL}/user`, userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//boniw
const port = process.env.PORT || 9006;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//end
module.exports = app;
