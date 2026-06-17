document.addEventListener("DOMContentLoaded", function () {
    const foodId = window.location.pathname.split('/')[2];
    console.log("Food ID:", foodId);  // نمایش ID غذا برای بررسی

    // دریافت اطلاعات غذا
    fetch(`/api/menu-items-edit/${foodId}/`, {
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        console.log("Response status for food data fetch:", response.status);  // نمایش وضعیت پاسخ
        if (!response.ok) {
            throw new Error('Failed to fetch food data');
        }
        return response.json();
    })
    .then(data => {
        console.log("Food data fetched:", data);  // نمایش داده‌های دریافت شده

        // پر کردن فرم با اطلاعات غذا
        document.getElementById('name').value = data.item_name;
        document.getElementById('category').value = data.item_category;
        document.getElementById('description').value = data.item_description;
        document.getElementById('price').value = data.item_price;

        const foodImage = document.getElementById('food-image');
        if (data.item_image) {
            foodImage.src = data.item_image;
        } else {
            foodImage.src = '/static/images/default_food.jpg';
        }
    })
    .catch(error => {
        console.error('Error fetching food data:', error);
        alert('خطا در دریافت اطلاعات غذا. لطفاً دوباره تلاش کنید.');
    });

    // ارسال اطلاعات فرم
    document.getElementById('edit-food-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('item_name', document.getElementById('name').value);
        formData.append('item_category', document.getElementById('category').value);
        formData.append('item_description', document.getElementById('description').value);
        formData.append('item_price', document.getElementById('price').value);

        // افزودن تصویر به فرم دیتا (در صورت انتخاب شدن)
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('item_image', imageFile);
        }
        

        console.log("Form data to be sent:", formData);  // نمایش داده‌های فرم قبل از ارسال

        fetch(`/api/menu-items-edit/${foodId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Token ' + localStorage.getItem('token')
            },
            body: formData
        })
        .then(response => {
            console.log("Response status for food data update:", response.status);  // نمایش وضعیت پاسخ

            if (!response.ok) {
                return response.json().then(errData => {
                    console.error("Error data from response:", errData);  // نمایش داده‌های خطای پاسخ
                    throw new Error(JSON.stringify(errData));
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Food data updated successfully:", data);  // نمایش داده‌های موفقیت‌آمیز
            alert('اطلاعات غذا با موفقیت ذخیره شد.');
        })
        .catch(error => {
            console.error('Error updating food data:', error);
            alert('خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.');
        });
    });
});


