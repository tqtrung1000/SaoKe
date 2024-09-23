// lấy thông tin người dùng
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user-info')
        .then(response => response.json())
        .then(data => {
            document.getElementById('user-name').innerText = `Logged in as: ${data.username}`;
        });
});

// tìm kiếm giao dịch
async function searchTransactions(event) {
    event.preventDefault(); // ngăn chặn hành vi mặc định của form
    const form = event.target; // lấy form
    const query = new URLSearchParams(new FormData(form)).toString(); // lấy dữ liệu từ form  
    const response = await fetch(`/api/search-results?${query}`); // gửi dữ liệu từ form đến server
    const data = await response.json(); // lấy dữ liệu từ server
    document.getElementById('results').innerText = JSON.stringify(data.results, null, 2); // hiển thị dữ liệu
}
