document.getElementById("date-range-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    // گرفتن بخش پیام‌ها
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    // ابتدا پیام‌های خطا و موفقیت را مخفی می‌کنیم
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    // بررسی تاریخ‌ها
    if (new Date(startDate) > new Date(endDate)) {
        errorMessage.textContent = "تاریخ پایان باید بعد از تاریخ شروع باشد.";
        errorMessage.style.display = "block";
        return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (startDate > today || endDate > today) {
        errorMessage.textContent = "تاریخ‌ها نباید در آینده باشند.";
        errorMessage.style.display = "block";
        return;
    }

    try {
        const response = await fetch(`/api/orders-report?start_date=${startDate}&end_date=${endDate}`);
        if (!response.ok) {
            throw new Error(`گزارش بارگذاری نشد: ${response.statusText}`);
        }

        const data = await response.json();

        // نمایش گزارش
        document.getElementById("report-results").classList.remove("hidden");
        document.getElementById("total-revenue").textContent = `${data.total_income} تومان`;

        const ordersTableBody = document.getElementById("orders-table-body");
        ordersTableBody.innerHTML = "";

        data.orders.forEach(order => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.user_name}</td>
                <td>${order.status}</td>
                <td>${order.created_at}</td>
                <td>${order.total_price} تومان</td>
            `;

            ordersTableBody.appendChild(row);
        });

        // نمایش پیام موفقیت
        successMessage.textContent = "گزارش با موفقیت ایجاد شد!";
        successMessage.style.display = "block";

    } catch (error) {
        console.error(error);
        // نمایش پیام خطا
        errorMessage.textContent = "یک خطا در بارگذاری گزارش رخ داده است: " + error.message;
        errorMessage.style.display = "block";
    }
});

