document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    console.log('Token:', localStorage.getItem('token'));

    // بررسی اگر توکن وجود نداشته باشد
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }

    // نمایش نام کاربری
    if (username) {
        document.getElementById('username-display').innerText = username;
    }

    // بارگذاری غذاهای پرطرفدار
    setTimeout(async () => await loadPopularFoods(), 100); // ایجاد تاخیر کوچک
});

async function loadPopularFoods() {
    console.log('Fetching popular foods...');
    document.getElementById('title_food').innerText = `غذاهای پرطرفدار`; // تغییر عنوان به دسته‌بندی انتخاب شده

    try {
        const response = await fetch('/api/popular-foods/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + localStorage.getItem('token'),
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to fetch popular foods');
        }

        const data = await response.json();
        console.log('Fetched foods:', data);

        const foodListElement = document.getElementById('food-list');
        foodListElement.innerHTML = ''; // پاک کردن محتوای قدیمی

        if (data.length > 0) {
            data.forEach(food => {
                const foodCard = document.createElement('div');
                foodCard.classList.add('food-card');

                foodCard.innerHTML = `
                    <img src="${food.image || '/static/images/default_food.jpg'}" alt="${food.name}" class="food-card-image">
                    <div class="food-card-content">
                        <h3 class="food-card-title">${food.name}</h3>
                        <p>دسته بندی : ${food.category_details ? food.category_details.name : 'دسته‌بندی ندارد'}</p> <!-- بررسی وجود category_details -->
                        <p class="food-card-description">توضیحات: ${food.description}</p>
                        <p class="food-card-price">قیمت: ${food.price} تومان</p>
                        <p class="food-card-rating">امتیاز: ${'⭐'.repeat(Math.round(food.rating || 0))}</p>
                        <button class="add-to-cart-button" data-food-id="${food.id}">
                            <i class="fa fa-shopping-cart"></i> افزودن به سبد خرید
                        </button>
                    </div>
                `;

                foodListElement.appendChild(foodCard);
            });

            // اضافه کردن event listener به دکمه‌ها
            const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    const foodId = e.target.getAttribute('data-food-id');
                    await addToCart(foodId);
                });
            });
        } else {
            foodListElement.innerHTML = '<p>غذای پرطرفداری یافت نشد.</p>';
        }
    } catch (error) {
        console.error('Error fetching popular foods:', error);
        document.getElementById('food-list').innerHTML = '<p>خطا در بارگذاری غذاهای پرطرفدار.</p>';
    }
}

async function addToCart(foodId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('لطفاً ابتدا وارد حساب کاربری خود شوید.');
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch(`/api/cart/add/${foodId}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: 1 })
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        const data = await response.json();
        console.log('Add to cart response:', data);
        showToast('محصول به سبد خرید افزوده شد.');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('خطا در افزودن محصول به سبد خرید');
    }
}

// async function filterFoods(category) {
//     console.log(`Filtering foods by category: ${category}`);
//     document.getElementById('title_food').innerText = `${category}`;

//     const categoryMap = {
//         'دسرها': 'dessert',
//         'نوشیدنی‌ها': 'beverage',
//         'فست فود': 'fast_food',
//         'غذای ایرانی': 'traditional_food'
//     };

//     const categoryEn = categoryMap[category];

// console.log('Category:', category); // نمایش دسته‌بندی انتخابی
// console.log('Category En:', categoryEn); // نمایش مقدار معادل انگلیسی


//     try {
//         const response = await fetch(`/api/foods_filter/?category=${category}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Token ' + localStorage.getItem('token'),
//             }
//         });

//         if (!response.ok) {
//             console.error('Error:', response.statusText); // نمایش خطای HTTP
//             throw new Error('Failed to fetch filtered foods');
//         }

//         const data = await response.json();
//         console.log('Filtered foods data:', data); // نمایش داده‌ها در کنسول

//         if (data && data.results) {
//             console.log('Filtered foods results:', data.results);
//         }

//         const foodListElement = document.getElementById('food-list');
//         foodListElement.innerHTML = ''; // Clear existing foods

//         if (data.results.length > 0) {
//             data.results.forEach(food => {
//                 const foodCard = document.createElement('div');
//                 foodCard.classList.add('food-card');
//                 foodCard.innerHTML = `
//                     <img src="${food.item_image || '/static/images/default_food.jpg'}" alt="${food.item_name}" class="food-card-image">
//                     <div class="food-card-content">
//                         <h3 class="food-card-title">${food.item_name}</h3>
//                         <p class="food-card-category">دسته‌بندی: ${food.item_category || 'نامشخص'}</p>
//                         <p class="food-card-description">توضیحات: ${food.item_description || 'ندارد'}</p>
//                         <p class="food-card-price">قیمت: ${food.item_price} تومان</p>
//                         <p class="food-card-rating">امتیاز: ${'⭐'.repeat(Math.round(food.average_rating || 0))}</p>
//                         // <button class="add-to-cart-button" data-food-id="${food.id}">
//                         //     <i class="fa fa-shopping-cart"></i> افزودن به سبد خرید
//                         // </button>
//                     </div>
//                 `;
//                 foodListElement.appendChild(foodCard);
//             });
//         } else {
//             foodListElement.innerHTML = '<p>غذای مربوط به این دسته‌بندی یافت نشد.</p>';
//         }
//     } catch (error) {
//         console.error('Error fetching filtered foods:', error);
//         document.getElementById('food-list').innerHTML = '<p>خطا در بارگذاری غذاها.</p>';
//     }
// }
async function filterFoods(category) {
    console.log(`Filtering foods by category: ${category}`);
    document.getElementById('title_food').innerText = `${category}`;

    const categoryMap = {
        'دسرها': 'dessert',
        'نوشیدنی‌ها': 'beverage',
        'فست فود': 'fast_food',
        'غذای ایرانی': 'traditional_food'
    };

    const categoryEn = categoryMap[category];

    console.log('Category:', category); // نمایش دسته‌بندی انتخابی
    console.log('Category En:', categoryEn); // نمایش مقدار معادل انگلیسی

    try {
        const response = await fetch(`/api/foods_filter/?category=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + localStorage.getItem('token'),
            }
        });

        if (!response.ok) {
            console.error('Error:', response.statusText); // نمایش خطای HTTP
            throw new Error('Failed to fetch filtered foods');
        }

        const data = await response.json();
        console.log('Filtered foods data:', data); // نمایش داده‌ها در کنسول

        const foodListElement = document.getElementById('food-list');
        foodListElement.innerHTML = ''; // پاک کردن غذاهای موجود

        if (data.results.length > 0) {
            data.results.forEach(food => {
                const foodCard = document.createElement('div');
                foodCard.classList.add('food-card');
                foodCard.innerHTML = `
                    <img src="${food.item_image || '/static/images/default_food.jpg'}" alt="${food.item_name}" class="food-card-image">
                    <div class="food-card-content">
                        <h3 class="food-card-title">${food.item_name}</h3>
                        <p class="food-card-category">دسته‌بندی: ${food.item_category || 'نامشخص'}</p>
                        <p class="food-card-description">توضیحات: ${food.item_description || 'ندارد'}</p>
                        <p class="food-card-price">قیمت: ${food.item_price} تومان</p>
                        <p class="food-card-rating">امتیاز: ${'⭐'.repeat(Math.round(food.average_rating || 0))}</p>
                        <button class="add-to-cart-button" data-food-id="${food.id}">
                            <i class="fa fa-shopping-cart"></i> افزودن به سبد خرید
                        </button>
                    </div>
                `;
                foodListElement.appendChild(foodCard);
            });

            // اضافه کردن Event Listener به دکمه‌های «افزودن به سبد خرید»
            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const foodId = e.target.closest('button').dataset.foodId; // دریافت ID غذا
                    addToCart(foodId); // فراخوانی تابع افزودن به سبد خرید
                });
            });
        } else {
            foodListElement.innerHTML = '<p>غذای مربوط به این دسته‌بندی یافت نشد.</p>';
        }
    } catch (error) {
        console.error('Error fetching filtered foods:', error);
        document.getElementById('food-list').innerHTML = '<p>خطا در بارگذاری غذاها.</p>';
    }
}

async function addToCart(foodId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('لطفاً ابتدا وارد حساب کاربری خود شوید.');
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch(`/api/cart/add/${foodId}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: 1 })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(errorData.message || 'Failed to add item to cart');
        }

        const data = await response.json();
        console.log('Add to cart response:', data);
        showToast('محصول به سبد خرید افزوده شد.');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('خطا در افزودن محصول به سبد خرید');
    }
}

// تابع نمایش Toast برای اطلاع‌رسانی
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


document.getElementById('logout-button').addEventListener('click', async function (event) {
    event.preventDefault();

    try {
        // ارسال درخواست به API لاگ‌اوت
        const response = await fetch('/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            // موفقیت در لاگ‌اوت
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');

            // تنظیم کوکی‌ها به مقدار خالی برای حذف آن‌ها
            document.cookie.split(";").forEach(function (cookie) {
                let name = cookie.split("=")[0].trim();
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            });

            showToast('Successfully logged out!');
            window.location.href = 'http://127.0.0.1:8000';
        } else {
            // مدیریت خطا
            const data = await response.json();
            showToast(data.detail || 'Error logging out.');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred during logout.');
    }
});
// // Show Custom Alert
// function showToast(message) {
//     const toast = document.getElementById('toast');
//     const messageElement = document.getElementById('toast-message');
//     messageElement.textContent = message;

//     // نمایش پیغام
//     toast.className = "toast show";

//     // مخفی کردن پیغام بعد از 3 ثانیه
//     setTimeout(function () {
//         toast.className = toast.className.replace("show", "");
//     }, 3000);
// }
