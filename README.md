# Dự Án NodeJS RESTful Web Service (Dự Án 1 / Lab 6)

Hệ thống RESTful API xây dựng bằng **Node.js**, **Express.js** và **MongoDB (Mongoose)** quản lý Sản phẩm (Products), Danh mục (Categories), Người dùng (Users) và Hóa đơn (Bills).

---

## 🛠 Công Nghệ Sử Dụng

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (qua Mongoose ODM)
- **View Engine**: Handlebars (`hbs`)
- **Dev Tool**: `nodemon`

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu môi trường
- Đã cài đặt [Node.js](https://nodejs.org/) (khuyên dùng Node 18 hoặc 20 LTS trở lên).
- Đã cài đặt và khởi động [MongoDB](https://www.mongodb.com/try/download/community) trên máy (cổng mặc định: `27017`).

### 2. Cài đặt thư viện (Dependencies)
Mở Terminal / PowerShell và chuyển vào thư mục `duan1`:

```bash
cd duan1
npm install
```

> **Lưu ý:** Thư mục `node_modules` đã được loại trừ qua `.gitignore` để repo GitHub luôn nhẹ và tải nhanh. Lệnh `npm install` sẽ tự động tải toàn bộ thư viện cần thiết dựa trên file `package.json`.

### 3. Cấu hình cơ sở dữ liệu
Đường dẫn kết nối MongoDB mặc định nằm trong file `app.js`:
```javascript
mongodb://127.0.0.1:27017/duan1
```
Hãy đảm bảo dịch vụ MongoDB (MongoDB Compass / mongod service) đang chạy trước khi khởi động ứng dụng.

### 4. Khởi chạy Server

- **Chế độ phát triển (Tự reload khi sửa code - Khuyên dùng):**
  ```bash
  npm run dev
  ```
- **Chế độ thông thường:**
  ```bash
  npm start
  ```

Server sẽ chạy tại địa chỉ:
```
http://localhost:3000
```

---

## 📖 Danh Sách API (RESTful Endpoints)

### 1. Quản lý Sản phẩm (`/products`)

| Chức năng | Method | URL | Ghi chú |
| :--- | :--- | :--- | :--- |
| Lấy tất cả sản phẩm | `GET` | `/products` | Kèm thông tin `status` (ẩn/hiện) |
| Chi tiết sản phẩm | `GET` | `/products/:id` | Tìm theo `_id` |
| Tìm theo danh mục | `GET` | `/products/category/:id` | |
| Tìm kiếm theo tên | `GET` | `/products/search/:name` | Tìm kiếm gần đúng (regex) |
| Thêm sản phẩm mới | `POST` | `/products` | |
| Sửa sản phẩm | `PUT` / `PATCH` | `/products/:id` | Hỗ trợ sửa thông tin & ẩn/hiện (`status`) |
| API `changeproduct` | `PUT` / `PATCH` | `/products/changeproduct/:id` | |
| Ẩn / Hiện sản phẩm | `PATCH` | `/products/:id/status` | Tự động toggle hoặc nhận body `status` |
| Xóa sản phẩm | `DELETE` | `/products/:id` | |

#### Ví dụ Body sửa sản phẩm (`PUT /products/:id`):
```json
{
  "name": "Asus ROG Strix G16",
  "price": 32000000,
  "quantity": 10,
  "description": "Laptop gaming cao cấp",
  "category": "64a1b2c3d4e5f6a7b8c9d0e1",
  "stock": 10,
  "sold": 2,
  "status": true
}
```
*(Đặt `"status": false` để ẩn sản phẩm, `"status": true` để hiển thị lại).*

---

### 2. Quản lý Danh mục (`/categories`)

| Chức năng | Method | URL | Ghi chú |
| :--- | :--- | :--- | :--- |
| Lấy tất cả danh mục | `GET` | `/categories` | Kèm thông tin `status` |
| Chi tiết danh mục theo ID | `GET` | `/categories/:id` | |
| Chi tiết theo tên | `GET` | `/categories/name/:name` | |
| Thêm danh mục | `POST` | `/categories` | |
| Sửa danh mục | `PUT` / `PATCH` | `/categories/:id` | Sửa tên, mô tả & ẩn/hiện |
| Ẩn / Hiện danh mục | `PATCH` | `/categories/:id/status` | Đổi trạng thái hoặc toggle |
| Xóa danh mục | `DELETE` | `/categories/:id` | |

#### Ví dụ Body sửa danh mục (`PUT /categories/:id`):
```json
{
  "name": "Laptop Gaming",
  "description": "Các dòng laptop hiệu năng cao",
  "status": true
}
```

---

### 3. Quản lý Người dùng (`/users`)

| Chức năng | Method | URL | Ghi chú |
| :--- | :--- | :--- | :--- |
| Lấy tất cả người dùng | `GET` | `/users` | Không lộ mật khẩu |
| Chi tiết người dùng | `GET` | `/users/:id` | |
| Thêm người dùng (Đăng ký) | `POST` | `/users` | |
| Sửa người dùng | `PUT` / `PATCH` | `/users/:id` | Sửa họ tên, phone, role, status... |
| Khóa / Mở khóa (Ẩn/Hiện) | `PATCH` | `/users/:id/status` | Đổi trạng thái hoặc toggle |
| Xóa người dùng | `DELETE` | `/users/:id` | |

#### Ví dụ Body khóa/mở khóa tài khoản (`PATCH /users/:id/status`):
```json
{
  "status": false
}
```
*(Đặt `"status": false` để khóa/ẩn tài khoản, `"status": true` để mở khóa).*

---

### 4. Quản lý Hóa đơn (`/bills`)

| Chức năng | Method | URL | Ghi chú |
| :--- | :--- | :--- | :--- |
| Lấy danh sách hóa đơn | `GET` | `/bills` | Kèm thông tin khách hàng (populate) |
| Chi tiết hóa đơn | `GET` | `/bills/:id` | |

---

## 📌 Các Lệnh Git Để Đẩy Lên GitHub

Sau khi cấu hình xong, để đẩy dự án lên GitHub:

```bash
# 1. Kiểm tra trạng thái file (node_modules đã được bỏ qua tự động)
git status

# 2. Thêm tất cả file mã nguồn vào commit
git add .

# 3. Tạo commit
git commit -m "feat: complete lab 6 restful api with full CRUD and status toggle"

# 4. Thêm remote và đẩy lên GitHub (thay URL bằng repo của bạn)
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git branch -M main
git push -u origin main
```
