document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    console.log('Token:', localStorage.getItem('token'));
    console.log('Script loaded!');


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
    document.getElementById('title_food').innerText = `غذای پرطرفدار`; // تغییر عنوان به دسته‌بندی انتخاب شده

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
                    </div>
                `
                foodListElement.appendChild(foodCard);
            });
        } else {
            foodListElement.innerHTML = '<p>غذای پرطرفداری یافت نشد.</p>';
        }
    } catch (error) {
        console.error('Error fetching popular foods:', error);
        document.getElementById('food-list').innerHTML = '<p>خطا در بارگذاری غذاهای پرطرفدار.</p>';
    }
}

const addToCart = async (foodId) => {
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

        const data = await response.json();

        if (!response.ok) {
            console.error('Response data:', data);
            throw new Error(data.error || 'Failed to add item to cart');
        }

        console.log('Add to cart response:', data);
        showToast('محصول به سبد خرید افزوده شد.');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('خطا در افزودن محصول به سبد خرید');
    }
};

// تابع برای نمایش پیام‌های Toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}



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

        if (data && data.results) {
            console.log('Filtered foods results:', data.results);
        }

        const foodListElement = document.getElementById('food-list');
        foodListElement.innerHTML = ''; // Clear existing foods

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
        } else {
            foodListElement.innerHTML = '<p>غذای مربوط به این دسته‌بندی یافت نشد.</p>';
        }
    } catch (error) {
        console.error('Error fetching filtered foods:', error);
        document.getElementById('food-list').innerHTML = '<p>خطا در بارگذاری غذاها.</p>';
    }
}

