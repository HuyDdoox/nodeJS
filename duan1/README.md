# Dự Án 1 - NodeJS RESTful Web Service (Lab 6)

## 🚀 Hướng Dẫn Cài Đặt & Chạy Nhanh

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy ứng dụng:
- **Chế độ Dev (Nodemon tự reload):**
  ```bash
  npm run dev
  ```
- **Chế độ thường:**
  ```bash
  npm start
  ```

Server hoạt động tại: `http://localhost:3000`

---

## 📌 Danh Sách API Chính

### Products:
- `GET /products`: Danh sách sản phẩm (có trường `status` ẩn/hiện)
- `GET /products/:id`: Chi tiết sản phẩm
- `POST /products`: Thêm sản phẩm
- `PUT /products/:id`: Cập nhật sản phẩm & ẩn/hiện (`status: true/false`)
- `PATCH /products/:id/status`: Đổi trạng thái ẩn/hiện
- `DELETE /products/:id`: Xóa sản phẩm

### Categories:
- `GET /categories`: Danh sách danh mục
- `GET /categories/:id`: Chi tiết danh mục
- `POST /categories`: Thêm danh mục
- `PUT /categories/:id`: Cập nhật danh mục & ẩn/hiện
- `PATCH /categories/:id/status`: Đổi trạng thái ẩn/hiện
- `DELETE /categories/:id`: Xóa danh mục

### Users:
- `GET /users`: Danh sách người dùng
- `GET /users/:id`: Chi tiết người dùng
- `POST /users`: Đăng ký tài khoản
- `PUT /users/:id`: Cập nhật người dùng
- `PATCH /users/:id/status`: Khóa / Mở khóa tài khoản (ẩn/hiện)
- `DELETE /users/:id`: Xóa người dùng

### Bills:
- `GET /bills`: Danh sách hóa đơn
- `GET /bills/:id`: Chi tiết hóa đơn
