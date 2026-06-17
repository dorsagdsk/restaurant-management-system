document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    // ارسال درخواست به API پروفایل و دریافت اطلاعات کاربر
    try {
        const response = await fetch('/api/profile/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token, // ارسال توکن برای احراز هویت
            },
        });

        if (!response.ok) {
            throw new Error('خطا در دریافت اطلاعات کاربر');
        }

        const userData = await response.json();
        console.log('اطلاعات کاربر:', userData);

        // نمایش اطلاعات کاربر در صفحه
        document.getElementById('username').innerText = userData.username || '---';
        document.getElementById('first_name').innerText = userData.first_name || '---';
        document.getElementById('last_name').innerText = userData.last_name || '---';
        document.getElementById('email').innerText = userData.email || '---';
        document.getElementById('phone_number').innerText = userData.phone_number || '---';

        // نمایش آدرس‌ها
        const addressesList = document.getElementById('addresses-list');
        addressesList.innerHTML = ''; // پاک کردن لیست قبلی آدرس‌ها
        if (userData.addresses && userData.addresses.length > 0) {
            userData.addresses.forEach(address => {
                const li = document.createElement('li');
                li.textContent = `${address.city}, ${address.neighborhood}, ${address.block}, ${address.postal_code}, ${address.country}`;
                addressesList.appendChild(li);
            });
        } else {
            const noAddressesMessage = document.createElement('li');
            noAddressesMessage.textContent = 'هیچ آدرسی موجود نیست';
            addressesList.appendChild(noAddressesMessage);
        }
    } catch (error) {
        console.error('خطا در بارگذاری اطلاعات پروفایل:', error);
        alert('خطا در بارگذاری اطلاعات پروفایل');
    }

    // تعریف دکمه‌ها و فرم‌ها
    const addAddressBtn = document.getElementById('add-address-btn');
    const addAddressForm = document.getElementById('add-address-form');
    const addressForm = document.getElementById('address-form');

    // بررسی اینکه آیا دکمه وجود دارد
    if (!addAddressBtn || !addAddressForm || !addressForm) {
        console.error('یکی از عناصر یافت نشد');
        return;
    }

    // دکمه اضافه کردن آدرس جدید
    addAddressBtn.addEventListener('click', function() {
        addAddressForm.style.display = 'block';  // نمایش فرم اضافه کردن آدرس
    });

    // ارسال فرم آدرس جدید
    addressForm.addEventListener('submit', async function(event) {
        event.preventDefault();  // جلوگیری از ارسال پیش‌فرض فرم

        // گرفتن اطلاعات فرم
        const city = document.getElementById('city').value;
        const neighborhood = document.getElementById('neighborhood').value;
        const block = document.getElementById('block').value;
        const postalCode = document.getElementById('postal_code').value;
        const country = document.getElementById('country').value;

        try {
            const response = await fetch('/api/profile/address/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token,  // ارسال توکن برای احراز هویت
                },
                body: JSON.stringify({
                    city: city,
                    neighborhood: neighborhood,
                    block: block,
                    postal_code: postalCode,
                    country: country,
                }),
            });

            if (!response.ok) {
                throw new Error('خطا در ارسال آدرس');
            }

            const newAddress = await response.json();
            console.log('آدرس جدید اضافه شد:', newAddress);

            // آدرس جدید را به لیست آدرس‌ها اضافه کن
            const addressesList = document.getElementById('addresses-list');
            const li = document.createElement('li');
            li.textContent = `${newAddress.city}, ${newAddress.neighborhood}, ${newAddress.block}, ${newAddress.postal_code}, ${newAddress.country}`;
            addressesList.appendChild(li);

            // پنهان کردن فرم بعد از ارسال
            addAddressForm.style.display = 'none';
        } catch (error) {
            console.error('خطا در ارسال آدرس:', error);
            alert('خطا در ارسال آدرس');
        }
    });
});
