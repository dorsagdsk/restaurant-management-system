document.addEventListener('DOMContentLoaded', function () {
    const foodList = document.getElementById('food-list');
    const apiUrl = '/api/menu-items/'; // آدرس API

    // دریافت لیست غذاها از API
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // توکن احراز هویت
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.item_name}</td>
                    <td>${item.item_category}</td>
                    <td>${item.item_price} تومان</td>
                    <td>
                        <img src="${item.item_image}" alt="${item.item_name}" style="width: 100px; height: 100px; object-fit: cover;">
                    </td>
                    <td>
                        <a href="/edit-food/${item.id}/" class="edit-btn">ویرایش</a>
                        <button class="delete-btn" data-id="${item.id}">حذف</button>
                    </td>
                `;
                foodList.appendChild(row);
            });

            // افزودن رویداد حذف
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const foodId = this.getAttribute('data-id');
                    deleteFood(foodId);
                });
            });
        })
        .catch(error => console.error('خطا در دریافت لیست غذا:', error));

    // تابع حذف غذا
    function deleteFood(foodId) {
        const deleteUrl = `/api/menu-items-delete/${foodId}/`; // آدرس API حذف
        fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                if (response.ok) {
                    alert('غذا با موفقیت حذف شد!');
                    location.reload(); // بارگذاری مجدد صفحه
                } else {
                    alert('خطا در حذف غذا');
                }
            })
            .catch(error => console.error('خطا در حذف غذا:', error));
    }
});
