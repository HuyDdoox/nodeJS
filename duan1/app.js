var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// kết nối cơ sở dữ liệu
var mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/duan1")
  .then(() => {
    console.log("Kết nối thành công");
  })
  .catch((err) => {
    console.log("Kết nối thất bại: ", err);
  });



//khai báo router
var indexRouter = require("./routes/index"); //nhúng indexRouter từ thư mục routes vào file app.js
var usersRouter = require("./routes/users"); //localhost:3000/users
var categoriesRouter = require("./routes/categories"); //localhost:3000/categories
var productsRouter = require("./routes/products"); //localhost:3000/products
var billsRouter = require("./routes/bills");


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//sử dụng router để client gọi
app.use("/", indexRouter); //localhost:3000/
app.use("/users", usersRouter); //localhost:3000/users
app.use("/categories", categoriesRouter);//localhost:3000/categories
app.use("/products", productsRouter); //localhost:3000/products
app.use("/bills", billsRouter);

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

module.exports = app;
