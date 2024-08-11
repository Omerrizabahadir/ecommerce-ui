const BASE_PATH = "http://localhost:8080/";

function submitForm() {
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: {
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            district: document.getElementById('district').value,
            postCode: document.getElementById('postCode').value,
            addressLine: document.getElementById('addressLine').value
        }
    };

    console.log("Form Data: ", formData);

    fetch(BASE_PATH + "customer/register", {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                // Show error message to user
                displayError(errorData.message || "Kayıt isteği başarısız");
                // Show alert message aynı email ile girilirse uyarı verecek
                alert(errorData.message || "Kayıt isteği başarısız");
                throw new Error(errorData.message || "Kayıt isteği başarısız");
            });
        }
        return response.json();
    }).then(data => {
        console.log("Registration successful:", data);
        window.location.href = "login.html";
    }).catch(error => {
        // Handle unexpected errors
        console.error('Error:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    });
}
//veritabanımda kayıtlı email ile giriş yaparsa hata verecek
function displayError(message) {
    // Get or create error message container
    let errorContainer = document.getElementById('error-message');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-message';
        errorContainer.className = 'alert alert-danger d-none';
        document.querySelector('.container').prepend(errorContainer);
    }
    
    errorContainer.textContent = message;
    errorContainer.classList.remove('d-none'); // Show the error message
}
