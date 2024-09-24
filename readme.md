# Loc-Sao-Ke

## Mô tả
Dự án này là một ứng dụng Node.js để quản lý và tìm kiếm các giao dịch từ một tệp sao kê giao dịch của ngân hàng vitcombank
và lưu trữ chúng vào cơ sở dữ liệu MySQL. 
Ứng dụng cung cấp các chức năng như đăng ký, đăng nhập, tìm kiếm giao dịch và hiển thị thông tin người dùng.

## Cài đặt

### Yêu cầu
- Node.js v18.20.4 trở lên
- MySQL 5.7 trở lên
- Git

### Các bước cài đặt

1. **Clone repository:**
   mở Terminal thư mục cần chứa code và chạy lệnh sau:
   ```sh
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```
   trong đó:
   your-username: tqtrung1000
   your-repository: SaoKe

2. **Cài đặt các gói phụ thuộc:**
   ```sh
   npm install bcrypt express express-session mysql pg
   ```

3. **Cấu hình cơ sở dữ liệu:**
   - Tạo một cơ sở dữ liệu MySQL và cập nhật thông tin kết nối trong file `node.js`:
     ```javascript
     const connection = mysql.createConnection({
         host: 'localhost',
         user: 'root',
         password: '123456',
         database: 'hoidanit',
         port: 3307
     });
     ```

4. **Khởi động server:**
   ```sh
   node server.js
   ```

## Sử dụng

### Đăng ký
- Truy cập `http://localhost:3000/api/register` để đăng ký tài khoản người dùng.

### Đăng nhập
- Truy cập `http://localhost:3000/api/login` để đăng nhập.

### Tìm kiếm giao dịch
- Truy cập `http://localhost:3000/api/search` để tìm kiếm các giao dịch.

### Cập nhật dữ liệu từ file
- Truy cập `http://localhost:3000/api/update-data` để cập nhật dữ liệu từ file `output.txt` lên cơ sở dữ liệu.

### Lấy dữ liệu từ cơ sở dữ liệu
- Truy cập `http://localhost:3000/api/get-data` để lấy dữ liệu từ cơ sở dữ liệu.

## Cấu trúc dự án

