        $(document).ready(function() {
            // بارگذاری کدهای تخفیف موجود
            function loadDiscounts() {
                $.ajax({
                    url: '/api/discounts/', // مسیر API برای دریافت کدهای تخفیف
                    method: 'GET',
                    success: function(data) {
                        let tableBody = $('#discount_table tbody');
                        tableBody.empty();  // خالی کردن جدول قبل از نمایش داده‌ها
                        data.forEach(discount => {
                            tableBody.append(`
                                <tr id="discount_${discount.id}">
                                    <td>${discount.code}</td>
                                    <td>${discount.discount_percentage}</td>
                                    <td>${discount.expiration_date}</td>
                                    <td>
                                        <button class="delete_discount" data-id="${discount.id}">حذف</button>
                                    </td>
                                </tr>
                            `);
                        });
                    },
                    error: function() {
                        alert('خطا در بارگذاری کدهای تخفیف');
                    }
                });
            }

            loadDiscounts(); // بارگذاری اولیه کدهای تخفیف

            // دکمه "اضافه کردن کد تخفیف"
            $('#add_discount').click(function() {
                $('#add_discount_form').show();
            });

            // دکمه "لغو"
            $('#cancel_add').click(function() {
                $('#add_discount_form').hide();
            });

            // ارسال فرم اضافه کردن کد تخفیف
            $('#save_discount').click(function() {
                const code = $('#code').val();
                const discount_percentage = $('#discount_percentage').val();
                const expiration_date = $('#expiration_date').val();

                // اعتبارسنجی فرم
                if (code.length !== 8) {
                    alert('کد تخفیف باید 8 کاراکتر باشد.');
                    return;
                }

                if (new Date(expiration_date) <= new Date()) {
                    alert('تاریخ انقضا باید در آینده باشد.');
                    return;
                }

                if (isNaN(discount_percentage)) {
                    alert('درصد تخفیف باید یک عدد باشد.');
                    return;
                }

                // ارسال درخواست به API برای ایجاد کد تخفیف
                $.ajax({
                    url: '/api/discounts/', // مسیر API برای ایجاد کد تخفیف
                    method: 'POST',
                    data: JSON.stringify({
                        "code": code,
                        "discount_percentage": discount_percentage,
                        "expiration_date": expiration_date
                    }),
                    contentType: 'application/json',
                    success: function(data) {
                        alert('کد تخفیف با موفقیت اضافه شد.');
                        $('#add_discount_form').hide();
                        // loadDiscounts(); // بارگذاری دوباره کدهای تخفیف
                         location.reload();
                    },
                    error: function() {
                        alert('خطا در ایجاد کد تخفیف');
                    }
                });
            });

            // حذف کد تخفیف
            $(document).on('click', '.delete_discount', function() {
                const discountId = $(this).data('id');
                $.ajax({
                    url: `/api/discounts/${discountId}/delete/`, // مسیر API برای حذف کد تخفیف
                    method: 'DELETE',
                    success: function() {
                        $(`#discount_${discountId}`).remove(); // حذف ردیف کد تخفیف از جدول
                        alert('کد تخفیف با موفقیت حذف شد.');
                    },
                    error: function() {
                        alert('خطا در حذف کد تخفیف');
                    }
                });
            });
        });