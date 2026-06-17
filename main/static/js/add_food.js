// // static/js/add_food.js

// document.addEventListener("DOMContentLoaded", function () {
//     const form = document.getElementById('food-form');  // تغییر id به food-form

//     form.addEventListener('submit', function (event) {
//         event.preventDefault();

//         const formData = new FormData(form);  // تبدیل فرم به شیء FormData

//         // ارسال داده‌ها به API
//         fetch('/api/add-food/', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Token ${localStorage.getItem('token')}`,  // ارسال توکن در هدر
//             },
//             body: formData,  // ارسال داده‌های فرم به API
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.id) {
//                 alert('غذا با موفقیت اضافه شد');
//                 window.location.href = '/admin_dashboard/';  // هدایت به داشبورد ادمین
//             } else {
//                 console.error('خطا در افزودن غذا:', data);
//                 alert('خطا در افزودن غذا');
//             }
//         })
//         .catch(error => {
//             console.error('Error during food creation:', error);
//         });
//     });
// });


// fetch('/api/add-food/', {
//     method: 'POST',
//     headers: {
//         'Authorization': 'Token ' + localStorage.getItem('token')
//     },
//     body: formData
// })
// .then(response => {
//     if (!response.ok) {
//         return response.json().then(errorData => {
//             console.error('Error:', errorData);  // چاپ خطاهای جزئیات
//             return Promise.reject(errorData);
//         });
//     }
//     return response.json();  // در صورت موفقیت، پاسخ را به JSON تبدیل می‌کنیم
// })
// .then(data => {
//     console.log('Response data:', data);
//     if (data.id) {
//         alert('غذا با موفقیت اضافه شد');
//         window.location.href = '/admin_dashboard/';
//     } else {
//         alert('خطا در افزودن غذا');
//     }
// })
// .catch(error => {
//     console.error('Error during food creation:', error);
// });

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('food-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form); // ایجاد شیء FormData از فرم

        // برای بررسی اینکه تصویر به درستی به formData اضافه شده، می‌توانید این کد را استفاده کنید
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

     fetch('/api/add-food/', {
    method: 'POST',
    headers: {
        'Authorization': 'Token ' + localStorage.getItem('token')
    },
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.id) {
        alert('غذا با موفقیت اضافه شد');
        window.location.href = '/admin_dashboard/';
    } else {
        console.log('خطا در افزودن غذا:', data);  // بررسی جزئیات خطا
        alert('خطا در افزودن غذا');
    }
})
.catch(error => {
    console.error('Error:', error);
});

    });
});


