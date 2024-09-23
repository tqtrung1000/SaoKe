const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');

let mang = [];//mảng lưu dữ liệu trước khi xử lý
let mangNew = [];//mảng lưu dữ liệu sau khi xử lý

// đọc file và lưu vào mảng....................................................................................
function readAndProcessFile() {
    fs.readFile('output.txt', 'utf8', (err, data) => {//đọc file
        mang = data.split('\n').map(line => line.trim());//lưu file vào mảng
        getDate();
        saveToDatabase(mangNew);
    });
}

// kiểm tra xem có phải là ngày tháng hay không............................................................
function isDateFormat(str) {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(str);
}

// lấy ra các ngày tháng....................................................................................
function getDate() {
    for (let i = 0; i < mang.length; i++) {
        while (isDateFormat(mang[i])) {
            processTransactionLine(mang[i + 2])
            mangNew.push(mang[i] + " " + mang[i + 1] + " " + processTransactionLine(mang[i + 2]).amount + " " + concatenateContent(i + 2));
            i += 3; // Di chuyển đến dòng tiếp theo sau khi xử lý 3 dòng
            if (i >= mang.length) break; // Kiểm tra để tránh vượt quá độ dài của mảng
        }
    }
}

// Hàm để nối nội dung giao dịch......................................................................................
function concatenateContent(startIndex) {
    let content = processTransactionLine(mang[startIndex]).content;
    let i = startIndex + 1;
    while (i < mang.length && !isDateFormat(mang[i])) {
        content += " " + mang[i].trim();
        i++;
    }
    // Xóa nội dung từ "Page..." đến dòng chứa ngày tháng tiếp theo
    let cleanedContent = content;
    const pageIndex = content.indexOf('Page');
    if (pageIndex !== -1) {
        let endIndex = i;
        while (endIndex < mang.length && !isDateFormat(mang[endIndex])) {
            endIndex++;
        }
        cleanedContent = content.substring(0, pageIndex).trim();
        if (endIndex < mang.length) {
            cleanedContent += ' ' + mang[endIndex];
        }
    }
    content = cleanedContent;
    return content;
}

// xử lý trích ra tiền và content....................................................................................
function processTransactionLine(line) {
    // Tìm vị trí của dấu chấm đầu tiên
    const firstDotIndex = line.indexOf('.');

    if (firstDotIndex === -1) {
        return { amount: null, content: line.trim() };
    }

    // Tìm vị trí của dấu chấm thứ hai
    const secondDotIndex = line.indexOf('.', firstDotIndex + 1);

    let amountStr, content;

    if (secondDotIndex !== -1 && secondDotIndex - firstDotIndex === 4) {
        // Nếu có dấu chấm thứ hai và cách dấu chấm đầu 3 ký tự
        amountStr = line.substring(0, secondDotIndex);
        content = line.substring(secondDotIndex + 1).trim();
    } else {
        // Nếu chỉ có một dấu chấm hoặc dấu chấm thứ hai không đúng vị trí
        amountStr = line.substring(0, firstDotIndex + 4);
        content = line.substring(firstDotIndex + 4).trim();
    }

    // Loại bỏ các ký tự không phải số từ đầu chuỗi amount
    amountStr = amountStr.replace(/^[^\d]+/, '');

    return {
        amount: amountStr,
        content: content.length > 0 ? content : " "
    };
}

// lưu dữ liệu vào cơ sở dữ liệu....................................................................................
async function saveToDatabase(data) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'hoidanit',
        port: 3307
    });

    connection.connect();

    for (const entry of data) {
        const [date, code, amount, ...contentArr] = entry.split(' ');
        const content = contentArr.join(' ');

        // Chuyển đổi định dạng ngày tháng từ DD/MM/YYYY sang YYYY-MM-DD
        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month}-${day}`;

        const query = `
            INSERT INTO transactions (transaction_date, transaction_code, amount, description)
            VALUES (?, ?, ?, ?);
        `;
        const values = [formattedDate, code, amount, content];

        connection.query(query, values, (error, results, fields) => {
            console.log('Inserted:', results.insertId);
        });
    }

    connection.end();
    console.log('Đã lưu dữ liệu vào cơ sở dữ liệu');
}

// Hàm lấy dữ liệu từ cơ sở dữ liệu....................................................................................
async function getDataFromDatabase() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'hoidanit',
        port: 3307
    });

    return new Promise((resolve, reject) => {
        connection.connect();

        const query = 'SELECT * FROM transactions';
        connection.query(query, (error, results) => {
            resolve(results);
        });

        connection.end();
    });
}

// Hàm tìm kiếm dữ liệu từ cơ sở dữ liệu....................................................................................
async function searchTransactions({ transaction_date, transaction_code, amount, description }) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'hoidanit',
        port: 3307
    });

    return new Promise((resolve, reject) => {
        connection.connect();

        let query = 'SELECT * FROM transactions WHERE 1=1';
        const values = [];

        if (transaction_date) {
            query += ' AND transaction_date = ?';
            values.push(transaction_date);
        }
        if (transaction_code) {
            query += ' AND transaction_code = ?';
            values.push(transaction_code);
        }
        if (amount) {
            query += ' AND REPLACE(amount, ".", "") = REPLACE(?, ".", "")';
            values.push(amount);
        }
        if (description) {
            query += ' AND description LIKE ?';
            values.push(`%${description}%`);
        }

        connection.query(query, values, (error, results) => {
            resolve(results);
        });

        connection.end();
    });
}

// hiển thị trang tìm kiếm....................................................................................
function serveSearchPage(req, res) {
    const user = req.session.user;
    res.sendFile(path.join(__dirname, 'public', 'search.html'), {
        headers: {
            'X-User-Name': user.username
        }
    });
}

// hiển thị trang đăng ký....................................................................................
function serveRegisterPage(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
}

// đăng ký tài khoản người dùng....................................................................................
async function registerUser(req, res) {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);//mã hóa mật khẩu

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'hoidanit',
        port: 3307
    });

    connection.connect();

    // Kiểm tra xem tài khoản đã tồn tại hay chưa
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    connection.query(checkUserQuery, [username], (error, results) => {
        if (results.length > 0) {
            // Nếu tài khoản đã tồn tại
            return res.status(400).send('Username already exists');
        }

        // Nếu tài khoản chưa tồn tại, tiến hành đăng ký
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        const values = [username, hashedPassword];

        connection.query(query, values, (error, results) => {
            res.send('User registered successfully');
        });

        connection.end();
    });
}

// hiển thị trang đăng nhập....................................................................................
function serveLoginPage(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
}

// đăng nhập tài khoản người dùng....................................................................................
async function loginUser(req, res) {
    const { username, password } = req.body;

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'hoidanit',
        port: 3307
    });

    connection.connect();

    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], async (error, results) => {
        if (error) {
            return res.status(500).send('Database query error');
        }

        const user = results[0];

        // Kiểm tra xem người dùng có tồn tại hay không
        if (!user) {
            return res.status(404).send('User not found');
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Lưu thông tin đăng nhập vào session
            req.session.user = user;
            res.redirect('/api/search'); // Chuyển hướng đến trang tìm kiếm
        } else {
            res.status(401).send('Incorrect password');
        }

        connection.end();
    });
}

// xử lý kết quả tìm kiếm....................................................................................
async function handleSearchResults(req, res) {
    const results = await searchTransactions(req.query);
    res.json({
        user: req.session.user.username, // Thêm thông tin người dùng vào phản hồi
        results: results
    });
}

// lấy thông tin người dùng....................................................................................
function getUserInfo(req, res) {
    res.json({ username: req.session.user.username });
}

// lấy dữ liệu từ cơ sở dữ liệu....................................................................................
async function getData(req, res) {
    console.log('get-data');
    const data = await getDataFromDatabase();
    console.log('Data fetched from database:', data); // In dữ liệu ra console
    res.json(data);
}

// cập nhật dữ liệu từ file output.txt lên cơ sở dữ liệu....................................................................................
function updateData(req, res) {
    readAndProcessFile();
    res.send('Data update initiated');
}

// Middleware để kiểm tra xem người dùng đã đăng nhập hay chưa
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/api/login');
    }
}

module.exports = {
    getDataFromDatabase,
    readAndProcessFile,
    searchTransactions,
    serveSearchPage,
    serveRegisterPage,
    registerUser,
    serveLoginPage,
    loginUser,
    handleSearchResults,
    getUserInfo,
    getData,
    updateData,
    isAuthenticated
};