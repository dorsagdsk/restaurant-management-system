const registrationForm = document.getElementById('registrationForm');
const inputs = registrationForm.querySelectorAll('input');

// Validation rules
const validationRules = {
    username: value => value.length >= 8,
    email: value => /^[^\s@]+@[^\s@]+\.com$/.test(value),
    password: value => value.length >= 8,
    first_name: value => /^[a-zA-Z\u0600-\u06FF]+$/.test(value),
    last_name: value => /^[a-zA-Z\u0600-\u06FF]+$/.test(value),
    phone_number: value => /^\d{11}$/.test(value)
};

// Function to validate input
const validateInput = (input) => {
    const rule = validationRules[input.name];
    const isValid = rule ? rule(input.value) : true;

    if (isValid) {
        input.style.borderColor = "#4CAF50"; // Green border
        input.nextElementSibling.textContent = ""; // Clear error message
    } else {
        input.style.borderColor = "red"; // Red border
        input.nextElementSibling.textContent = "مقدار وارد شده صحیح نیست.";
    }

    return isValid;
};

// Add validation listeners to all inputs
inputs.forEach(input => {
    const errorSpan = document.createElement('span');
    errorSpan.style.color = "red";
    errorSpan.style.fontSize = "12px";
    input.parentElement.appendChild(errorSpan);

    input.addEventListener('input', () => validateInput(input));
});

// Form submission validation
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isFormValid = true;

    // Validate all inputs
    inputs.forEach(input => {
        const isValid = validateInput(input);
        if (!isValid) isFormValid = false;
    });

    // If form is valid, submit data to the server
    if (isFormValid) {
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            phone_number: document.getElementById('phone_number').value
        };

        // Sending the data to the server for registration
        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                // On successful registration, redirect to login page
                window.location.href = "/login/";
            } else {
                // Show error message if registration failed
                document.getElementById('responseMessage').innerText = result.detail || 'ثبت‌نام با خطا مواجه شد.';
            }
        } catch (error) {
            console.error("Error during registration:", error);
            document.getElementById('responseMessage').innerText = 'خطای سرور، لطفاً دوباره تلاش کنید.';
        }
        
    } else {
        document.getElementById('responseMessage').textContent = 'لطفاً تمام فیلدها را به درستی پر کنید.';
    }
});
