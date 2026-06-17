document.getElementById("add-employee-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;

    fetch("/api/add-employee/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"), // برای امنیت درخواست‌ها
        },
        body: JSON.stringify({
            username: username,
            password: password,
            first_name: firstName,
            last_name: lastName,
        }),
    })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById("add-employee-result");
            if (data.id) {
                resultDiv.textContent = "کارمند با موفقیت اضافه شد!";
                resultDiv.style.color = "green";
            } else {
                resultDiv.textContent = "خطا: " + JSON.stringify(data);
                resultDiv.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
});

// تابعی برای دریافت CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
