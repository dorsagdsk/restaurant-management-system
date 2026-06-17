document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // دریافت ID کارمند از URL
    const employeeId = window.location.pathname.split('/')[2];  // فرض می‌کنیم که ID در URL به این صورت است: /edit-employee/{id}/

    // دریافت اطلاعات کارمند
    fetch(`/api/edit-employees/${employeeId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        // پر کردن فیلدها با اطلاعات کارمند
        document.getElementById('first_name').value = data.first_name;
        document.getElementById('last_name').value = data.last_name;
        document.getElementById('username').value = data.username;
        document.getElementById('role').value = data.role;
    })
    .catch(error => console.error('Error fetching employee data:', error));

    // ارسال اطلاعات فرم برای ویرایش
    const form = document.getElementById('employee-edit-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // دریافت مقادیر فرم
        const updatedEmployee = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            username: document.getElementById('username').value,
            role: document.getElementById('role').value,
        };

        // ارسال درخواست PATCH به API برای بروزرسانی اطلاعات
        fetch(`/api/edit-employees/${employeeId}/`, {
            method: 'PATCH',  // برای بروزرسانی جزئی اطلاعات
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            body: JSON.stringify(updatedEmployee)
        })
        .then(response => {
            if (response.ok) {
                alert('کارمند با موفقیت ویرایش شد');
                window.location.href = '/manage-employees/'; // یا هر صفحه دیگری که می‌خواهید پس از ویرایش هدایت کنید
            } else {
                alert('خطا در ویرایش کارمند');
            }
        })
        .catch(error => console.error('Error updating employee data:', error));
    });
});
