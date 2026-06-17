loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                alert(data.detail || 'Something went wrong!');
                throw new Error('Authentication failed');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
           console.log("Saving username:", data.username);  // چک کردن نام کاربری قبل از ذخیره کردن

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);

            switch(data.role) {
                case 'admin':
                    window.location.href = '/admin_dashboard/';
                    break;
                case 'employee':
                    window.location.href = '/employee_dashboard/';
                    break;
                case 'customer':
                    window.location.href = '/customer_dashboard/';
                    break;
                default:
                    alert('Unknown role!');
                    break;
            }
        }
        else {
            alert('نام کاربری یا رمز عبور اشتباه است.');
        }
    })
    .catch(error => {
        console.log(error);
    });
});