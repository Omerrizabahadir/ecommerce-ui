const BASE_PATH = "http://localhost:8080/"


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

    console.log("form datası : ", formData);

    fetch(BASE_PATH + "customer/register", {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Kayıt isteği başarısız durum kodu : " + response.status)
        }
        return response.json()
    }).then(data => {
        console.log(data)
        window.location.href = "login.html"
    }).catch(error => {
        console.error('Error:', error);
    });
}