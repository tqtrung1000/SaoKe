const express = require('express');
const path = require('path'); // Thêm dòng này để sử dụng path
const session = require('express-session'); // Thêm dòng này để sử dụng session
const app = express();
const port = 3000;

// Import router
const dataRouter = require('./routers');

// Sử dụng session
app.use(session({
    secret: 'your_secret_key',//khóa bí mật
    resave: false,//không lưu lại session
    saveUninitialized: true//lưu lại session
}));

// Sử dụng router
app.use('/api', dataRouter);

// Phục vụ tệp tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
