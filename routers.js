const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const {
    getDataFromDatabase,//lấy dữ liệu từ cơ sở dữ liệu  
    readAndProcessFile,//đọc và xử lý file
    searchTransactions,//tìm kiếm giao dịch
    serveSearchPage,//hiển thị trang tìm kiếm
    serveRegisterPage,//hiển thị trang đăng ký
    registerUser,//đăng ký người dùng
    serveLoginPage,//hiển thị trang đăng nhập
    loginUser,//đăng nhập người dùng
    handleSearchResults,//xử lý kết quả tìm kiếm
    getUserInfo,//lấy thông tin người dùng
    getData,//lấy dữ liệu từ file
    updateData,//cập nhật dữ liệu từ file vào cơ sở dữ liệu
    isAuthenticated//kiểm tra xem người dùng đã đăng nhập hay chưa
} = require('./node');


// Route để lấy thông tin người dùng
router.get('/user-info', isAuthenticated, getUserInfo);

// Route để xử lý tìm kiếm (bảo vệ bằng middleware isAuthenticated)
router.get('/search-results', isAuthenticated, handleSearchResults);

// Định nghĩa route để lấy dữ liệu
router.get('/get-data', getData);

// Định nghĩa route để cập nhật dữ liệu từ file output.txt lên cơ sở dữ liệu
router.get('/update-data', updateData);

// Định nghĩa route để lấy dữ liệu từ file
router.get('/get-file', (req, res) => {
    console.log('get-file');
    // Thêm logic để xử lý route này nếu cần
});

// Route để hiển thị trang tìm kiếm (bảo vệ bằng middleware isAuthenticated)
router.get('/search', isAuthenticated, serveSearchPage);

// Route để hiển thị trang đăng ký
router.get('/register', serveRegisterPage);

// Route để xử lý đăng ký người dùng
router.post('/register', express.urlencoded({ extended: true }), registerUser);

// Route để hiển thị trang đăng nhập
router.get('/login', serveLoginPage);

// Route để xử lý đăng nhập người dùng
router.post('/login', express.urlencoded({ extended: true }), loginUser);

module.exports = router;
