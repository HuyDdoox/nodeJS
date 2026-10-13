var express = require('express');
var router = express.Router();
// router luôn khai báo thư viện của nó vào khi viết router

/* GET home page. */
//localhost:3000 
router.get('/', function (req, res, next) {
  // res.json({ message: "Đây là API trang chủ" });
  res.render('index', { title: 'Express' }); // Lưu ý: Chỉ được dùng 1 trong 2 (hoặc json hoặc render)
});


//sum(a,b) => param
//localhost:3000/sum/5/10 =>3
router.get('/sum/:a/:b', function (req, res, next) {
  let a = parseFloat(req.params.a) //string ép nó thành số
  let b = parseFloat(req.params.b) //string ép nó thành số
  // const[x,y] = req.params;
  res.json({ result: a + b })
});

//sum(a,b) => query 
//localhost:3000/abc?a=5&b=10 =>3
router.get("/abc", (req, res, next) => {
  let a = parseFloat(req.query.a);    //đây là query
  let b = parseFloat(req.query.b);
  res.json({result: a + b})
});

// subtract(a,b) => query
// localhost:3000/subtract?a=10&b=5 => 5
router.get('/subtract', function(req, res, next) {
  let a = parseFloat(req.query.a);
  let b = parseFloat(req.query.b);
  res.json({ result: a - b });
});

// multiply(a,b) => params
// localhost:3000/multiply/5/10 => 50
router.get('/multiply/:a/:b', function(req, res, next) {
  let a = parseFloat(req.params.a);
  let b = parseFloat(req.params.b);
  res.json({ result: a * b });
});

// divide(a,b) => query
// localhost:3000/divide?a=10&b=0 => Error
router.get('/divide', function(req, res, next) {
  let a = parseFloat(req.query.a);
  let b = parseFloat(req.query.b);
  if (b === 0) {
    return res.status(400).json({ error: "Không thể chia cho 0" });
  }
  res.json({ result: a / b });
});

module.exports = router; // luôn exports router ra cuối cùng


// get: select ==> lấy về tức là không làm thay đổi dữ liệu
// port: insert ==> thêm dữ liệu vào db ==> Thêm mới hoàn toàn
// delete: delete ==> xóa dữ liệu trong db ==> Xóa hoàn toàn
// put: update ==> cập nhật dữ liệu trong db ==> thay đổi hoàn toàn
// patch: update ==> cập nhật dữ liệu trong db ==> thay đổi 1 phần

// fetch('https://localhost:3000/products/11') //get products by id
// fetch('http://localhost:3000/products?id=11', ) //fetch all product
