document.getElementById('logout-button').addEventListener('click', function() {
    fetch('/api/logout/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,  // ارسال توکن در هدر
        },
        credentials: 'include',  // ارسال کوکی‌ها
    })
    .then(response => {
        if (response.ok) {
            // حذف داده‌های ذخیره‌شده در localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('username');

            alert('You have been logged out successfully!');
            window.location.href = '/login/';  // هدایت کاربر به صفحه ورود
        } else {
            response.json().then(data => alert(data.detail || 'Logout failed.'));
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
});
