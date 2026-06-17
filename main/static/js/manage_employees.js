document.addEventListener('DOMContentLoaded', function () {
    // بررسی اینکه آیا توکن موجود است و کاربر ادمین است
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // if (!token || userRole !== 'admin') {
    //     // در صورتی که توکن وجود نداشته باشد یا کاربر ادمین نباشد، هدایت به صفحه ورود
    //     window.location.href = '/login/'; // آدرس صفحه ورود شما
    // } else {
    // اگر کاربر وارد شده باشد و ادمین باشد، اطلاعات داشبورد را بارگذاری کنید
    loadEmployee();
    // }
});

// بارگذاری اطلاعات داشبورد ادمین (مثل غذاها، کاربران و غیره)
function loadEmployee() {

    // دریافت لیست کارمندان
    fetch('/api/employees/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Employee List:', data); // نمایش لیست کارمندان در کنسول
            displayEmployeeList(data); // نمایش لیست کارمندان در UI
        })
        .catch(error => console.error('Error fetching employee data:', error));
}

// نمایش لیست کارمندان در UI
function displayEmployeeList(employees) {
    const employeeListElement = document.getElementById('employee-list');
    employees.forEach(employee => {
        const employeeCard = document.createElement('div');
        employeeCard.classList.add('employee-card');
        employeeCard.innerHTML = `
            <h3>${employee.first_name} ${employee.last_name}</h3>
            <p>نام کاربری: ${employee.username}</p>
            <p>نقش: ${employee.role}</p>
            <div class="employee-card-actions">
                <button class="edit-btn" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i> ویرایش
                </button>
                <button class="delete-btn" onclick="deleteEmployee(${employee.id})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
        employeeListElement.appendChild(employeeCard);
    });
}

// ویرایش کارمند
function editEmployee(employeeId) {
    window.location.href = `/edit_employees/${employeeId}/`;


}

// حذف کارمند
function deleteEmployee(employeeId) {
    fetch(`/api/delete-employees/${employeeId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('token')
        }
    })
        .then(response => {
            if (response.status === 204) {
                alert('کارمند با موفقیت حذف شد');
                location.reload();
                const employeeCard = document.querySelector(`[data-id='${employeeId}']`);
                if (employeeCard) employeeCard.remove(); // حذف کارت کارمند از DOM
            } else {
                alert('مشکلی پیش آمد');
            }
        })
        .catch(error => console.error('Error deleting employee:', error));
}

// لاگ اوت
