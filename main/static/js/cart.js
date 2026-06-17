// تابع برای بارگذاری اطلاعات سبد خرید از API
async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch('/api/cart/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('خطا در بارگذاری سبد خرید');
        }

        const cartData = await response.json();
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = ''; // پاک کردن محتوای قبلی

        let totalPrice = 0;

        cartData.cart_items.forEach(item => {
            totalPrice += item.total_price;

            const cartItem = document.createElement('li');
            cartItem.classList.add('cart-item');

            cartItem.innerHTML = `
                <img src="${item.menu_item.image || '/static/images/default_food.jpg'}" alt="${item.menu_item.name}">
                <div class="cart-item-details">
                    <p class="cart-item-title">${item.menu_item.name}</p>
                    <p class="cart-item-price">${item.menu_item.item_price} تومان</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="changeQuantity(${item.menu_item.id}, -1)">-</button>
                        <span>${item.item_quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity(${item.menu_item.id}, 1)">+</button>
                        <button class="quantity-btn" onclick="removeCartItem(${item.menu_item.id})">حذف</button>
                        

                    </div>
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        // به روزرسانی جمع کل
        document.getElementById('total-price').innerText = `${cartData.total_price} تومان`;

    } catch (error) {
        console.error('Error loading cart:', error);
        showAlert('خطا در بارگذاری سبد خرید');
    }
}


async function changeQuantity(itemId, newQuantity) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch(`/api/cart/item/${itemId}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify({ quantity: newQuantity }),
            
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'خطا در به‌روزرسانی تعداد آیتم');
        }

        const updatedItem = await response.json();
        showAlert('تعداد آیتم با موفقیت به‌روزرسانی شد.');
        loadCart(); // به‌روزرسانی نمایش سبد خرید

    } catch (error) {
        console.error('Error:', error);
        showAlert('خطا در ارتباط با سرور');
    }
}


// حذف آیتم از سبد خرید
async function removeCartItem(itemId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch(`/api/cart/item/${itemId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'خطا در حذف آیتم از سبد خرید');
        }

        showAlert('آیتم با موفقیت از سبد خرید حذف شد.');
        loadCart(); // به‌روزرسانی نمایش سبد خرید

    } catch (error) {
        console.error('Error:', error);
        showAlert('خطا در ارتباط با سرور');
    }
}



// تابع برای بارگذاری آدرس‌ها از API
// async function loadAddresses() {
// const token = localStorage.getItem('token');
// if (!token) {
//     showAlert('لطفاً ابتدا وارد شوید.');
//     window.location.href = '/login/';
//     return;
// }

// try {
//     const response = await fetch('/api/addresses/', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Token ${token}`,
//             'Content-Type': 'application/json',
//         },
//     });

//     if (!response.ok) {
//         throw new Error('خطا در بارگذاری آدرس‌ها');
//     }

//     const addresses = await response.json();
//     console.log('Addresses:', addresses); // بررسی پاسخ API

//     const addressDropdown = document.getElementById('address-dropdown');
//     addressDropdown.innerHTML = '<option value="">لطفاً یک آدرس انتخاب کنید</option>';

//     addresses.forEach(address => {
//         const fullAddress = `
//             ${address.city || ''}, 
//             ${address.neighborhood || ''}, 
//             ${address.block || ''}, 
//             کدپستی: ${address.postal_code || ''}, 
//             ${address.country || ''}
//         `.trim().replace(/,\s*,/g, ',').replace(/,\s*$/, ''); // حذف کاماهای اضافی

//         const option = document.createElement('option');
//         option.value = address.id;
//         option.textContent = fullAddress || 'آدرس ناموجود';
//         addressDropdown.appendChild(option);
//     });

//     // فعال‌سازی دکمه ثبت سفارش فقط زمانی که آدرس انتخاب شده باشد
//     addressDropdown.addEventListener('change', () => {
//         document.getElementById('place-order-btn').disabled = addressDropdown.value === "";
//     });
    
// } catch (error) {
//     console.error('Error loading addresses:', error);
//     showAlert('خطا در بارگذاری آدرس‌ها');
// }
// }

// async function placeOrder() {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         showAlert('لطفاً ابتدا وارد شوید.');
//         window.location.href = '/login/';
//         return;
//     }

//     const selectedAddress = document.getElementById('address-dropdown').value;
//     if (!selectedAddress) {
//         showAlert('لطفاً یک آدرس انتخاب کنید.');
//         return;
//     }

//     const discountCode = document.getElementById('discount-code').value;

//     try {
//         const response = await fetch('/api/checkout/', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Token ${token}`,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 delivery_address_id: selectedAddress,
//                 discount_code: discountCode  // ارسال کد تخفیف به API
//             }),
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'خطا در ثبت سفارش');
//         }

//         const orderData = await response.json();
//         showAlert('سفارش شما با موفقیت ثبت شد!');
//         window.location.href = '/show-order-customer/';

//     } catch (error) {
//         console.error('Error placing order:', error);
//         showAlert(error.message || 'خطا در ثبت سفارش');
//     }
// }
// نمایش پیغام هشدار یا موفقیت
function showAlert(message) {
    const alertMessage = document.getElementById('alertMessage');
    if (alertMessage) {
        alertMessage.style.display = 'block';  // نمایش پیغام
        alertMessage.textContent = message;   // تعیین متن پیغام
    } else {
        alert(message); // در صورتی که `alertMessage` پیدا نشد، از alert استفاده کن
    }
}

// بارگذاری آدرس‌ها
async function loadAddresses() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch('/api/addresses/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('خطا در بارگذاری آدرس‌ها');
        }

        const addresses = await response.json();
        console.log('Addresses:', addresses);

        const addressDropdown = document.getElementById('address-dropdown');
        addressDropdown.innerHTML = '<option value="">لطفاً یک آدرس انتخاب کنید</option>';

        addresses.forEach(address => {
            const fullAddress = `
                ${address.city || ''}, 
                ${address.neighborhood || ''}, 
                ${address.block || ''}, 
                کدپستی: ${address.postal_code || ''}, 
                ${address.country || ''}
            `.trim().replace(/,\s*,/g, ',').replace(/,\s*$/, ''); // حذف کاماهای اضافی

            const option = document.createElement('option');
            option.value = address.id;
            option.textContent = fullAddress || 'آدرس ناموجود';
            addressDropdown.appendChild(option);
        });

        // فعال‌سازی دکمه ثبت سفارش فقط زمانی که آدرس انتخاب شده باشد
        addressDropdown.addEventListener('change', () => {
            document.getElementById('place-order-btn').disabled = addressDropdown.value === "";
        });

        document.getElementById('place-order-btn').addEventListener('click', async () => {
            await placeOrder();
        });

    } catch (error) {
        console.error('Error loading addresses:', error);
        showAlert('خطا در بارگذاری آدرس‌ها');
    }
}

// ثبت سفارش
async function placeOrder() {
    const token = localStorage.getItem('token');
    console.log('placeOrder called');

    if (!token) {
        showAlert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    const selectedAddress = document.getElementById('address-dropdown').value;
    if (!selectedAddress) {
        showAlert('لطفاً یک آدرس انتخاب کنید.');
        return;
    }

    const discountCode = document.getElementById('discount-code') ? document.getElementById('discount-code').value : '';
    console.log('Selected Address:', selectedAddress);
    console.log('Discount Code:', discountCode);

    try {
        const response = await fetch('/api/checkout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                delivery_address_id: selectedAddress,
                discount_code: discountCode  // ارسال کد تخفیف به API
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'خطا در ثبت سفارش');
        }

        const orderData = await response.json();
        showAlert('سفارش شما با موفقیت ثبت شد!');
        window.location.href = '/show-order-customer/';

    } catch (error) {
        console.error('Error placing order:', error);
        showAlert(error.message || 'خطا در ثبت سفارش');
    }
}

// در ابتدای بارگذاری صفحه، آدرس‌ها بارگذاری می‌شوند.
document.addEventListener('DOMContentLoaded', loadAddresses);



async function applyDiscount() {
const token = localStorage.getItem('token');
if (!token) {
    showAlert('لطفاً ابتدا وارد شوید.');
    window.location.href = '/login/';
    return;
}

const discountCode = document.getElementById('discount-code').value;
if (!discountCode) {
    showAlert('لطفاً کد تخفیف را وارد کنید.');
    return;
}

try {
    const response = await fetch('/api/apply-discount/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discount_code: discountCode }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در اعمال کد تخفیف');
    }

    const data = await response.json();
    const discountedPrice = data.discounted_price;

    // نمایش قیمت تخفیف‌خورده
    document.getElementById('discounted-price').innerText = `${discountedPrice} تومان`;

} catch (error) {
    console.error('Error applying discount:', error);
    showAlert(error.message || 'خطا در اعمال کد تخفیف');
}
}
function showAlert(message, duration = 3000) {
const alertBox = document.getElementById('custom-alert');
const alertMessage = document.getElementById('alert-message');

// تنظیم متن پیام
alertMessage.innerText = message;

// نمایش هشدار
alertBox.classList.remove('hidden');
alertBox.classList.add('visible');

// مخفی کردن بعد از مدت‌زمان مشخص
setTimeout(() => {
    alertBox.classList.remove('visible');
    setTimeout(() => alertBox.classList.add('hidden'), 500); // تاخیر برای انیمیشن
}, duration);
}

document.addEventListener('DOMContentLoaded', () => {
// بارگذاری سبد خرید و آدرس‌ها هنگام بارگذاری صفحه
loadCart();
loadAddresses();
document.getElementById('place-order-btn').addEventListener('click', placeOrder);


});
