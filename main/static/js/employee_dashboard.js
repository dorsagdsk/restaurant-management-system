document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }
    loadOrders('pending');
});

// function loadOrders(status) {
//     const url = `/api/employee/order/?status=${status}`;

//     fetch(url, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Token ' + localStorage.getItem('token'),
//         }
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("Failed to fetch orders");
//             }
//             return response.json();
//         })
//         .then(data => {
//             const mainContent = document.querySelector('.main-content');
//             mainContent.innerHTML = '';

//             if (data.length === 0) {
//                 mainContent.innerHTML = `<p>هیچ سفارشی برای وضعیت "${status}" وجود ندارد.</p>`;
//                 return;
//             }

//             data.forEach(order => {
//                 const orderCard = document.createElement('div');
//                 orderCard.className = 'order-card';

//                 let foodsHTML = '';
//                 order.order_items.forEach(item => {
//                     foodsHTML += `
//                         <div class="food-item">
//                             <img src="${item.food.image}" alt="${item.food.name}" width="100">
//                             <p>${item.food.name}</p>
//                             <p>تعداد: ${item.quantity}</p>
//                             <p>قیمت کل: ${item.total_price} تومان</p>
//                         </div>
//                     `;
//                 });

//                 orderCard.innerHTML = `
//                     <h3>سفارش شماره ${order.id}</h3>
//                     <h2>سفارش دهنده: ${order.user_name}</h2>
//                     <p>وضعیت: ${order.order_status}</p>
//                     <p>آدرس: ${order.delivery_address.city}, ${order.delivery_address.neighborhood}</p>
//                     <div class="order-items">
//                         ${foodsHTML}
//                     </div>
//                     <div class="order-actions">
//                     ${order.order_status === 'pending' ? `
//                     <button onclick="updateOrderStatus(${order.id}, 'confirmed')">تأیید</button>
//                     <button onclick="updateOrderStatus(${order.id}, 'canceled')">لغو</button>
//                     ` : ''}
//                 </div>
//                 `;

//                 mainContent.appendChild(orderCard);
//             });
//         })
//         .catch(error => {
//             console.error('Error loading orders:', error);
//             showAlert('مشکلی در بارگذاری اطلاعات وجود دارد.', 'error'); // آلارم خطا
//         });
// }

function loadOrders(status) {
    const url = `/api/employee/order/?status=${status}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('token'),
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }
        return response.json();
    })
    .then(data => {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = '';

        if (data.length === 0) {
            mainContent.innerHTML = `<p>هیچ سفارشی برای وضعیت "${status}" وجود ندارد.</p>`;
            return;
        }

        data.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';

            let foodsHTML = '';
            order.order_items.forEach(item => {
                foodsHTML += `
                    <div class="food-item">
                        <img src="${item.ordered_menu_item.image}" alt="${item.ordered_menu_item.name}" width="100">
                        <p>${item.ordered_menu_item.name}</p>
                        <p>تعداد: ${item.ordered_quantity}</p>
                        <p>قیمت کل: ${item.ordered_menu_item.item_price * item.ordered_quantity} تومان</p>
                    </div>
                `;
            });

            orderCard.innerHTML = `
                <h3>سفارش شماره ${order.id}</h3>
                <h2>سفارش دهنده: ${order.ordered_by_user.username}</h2>
                <p>وضعیت: ${order.order_status}</p>
                <p>آدرس: ${order.delivery_address.city_name}, ${order.delivery_address.neighborhood_name}</p>
                <div class="order-items">
                    ${foodsHTML}
                </div>
                <div class="order-actions">
                    ${order.order_status === 'pending' ? `
                        <button onclick="updateOrderStatus(${order.id}, 'confirmed')">تأیید</button>
                        <button onclick="updateOrderStatus(${order.id}, 'canceled')">لغو</button>
                    ` : ''}
                </div>
            `;

            mainContent.appendChild(orderCard);
        });
    })
    .catch(error => {
        console.error('Error loading orders:', error);
        showAlert('مشکلی در بارگذاری اطلاعات وجود دارد.', 'error'); // آلارم خطا
    });
}
function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem('token');
    const url = `/api/employee/order/${orderId}/update/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`, // ارسال توکن
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(), // ارسال CSRF
        },
        body: JSON.stringify({ status: newStatus })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update order status");
            }
            return response.json();
        })
        .then(data => {
            showAlert('سفارش با موفقیت تغییر وضعیت  یافت!', 'success'); // آلارم موفقیت

            // alert(`وضعیت سفارش به ${newStatus} تغییر یافت.`);
            loadOrders('pending'); // بروزرسانی لیست سفارش‌های معلق
        })
        .catch(error => {
            console.error('Error updating order status:', error);
          showAlert('مشکلی در بارگذاری اطلاعات وجود دارد.', 'error'); // آلارم خطا
        });
}

function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
}


function showAlert(message, type) {
    const alertContainer = document.createElement('div');
    alertContainer.classList.add('alert', `alert-${type}`);
    alertContainer.innerText = message;

    // اضافه کردن آلارم به صفحه
    document.body.appendChild(alertContainer);

    // مخفی کردن آلارم بعد از چند ثانیه
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}

