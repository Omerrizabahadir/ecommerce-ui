const jwtToken = localStorage.getItem('jwtToken');
const BASE_PATH = "http://localhost:8080/"

var currentCategoryId = 0;

function getAllCategory() {
    fetch(BASE_PATH + "category", {                        //fetch istek atıyor
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {                                  //response başarısızsa hata atacak
        if (!response.ok) {
            throw new Error("Failed to get categories, response status : " + response.status)
        }
        return response.json();                             //response başarılı ise json veri dönecek
    }).then(categories => {
        displayCategories(categories)                       //category 'leri görüntüle
    }).catch(error => {
        console.error('Error:', error);
    });
}

function displayCategories(categories) {
    const categoryTableBody = document.getElementById("categoryTableBody");
    categoryTableBody.innerHTML = "";
    categories.forEach(category => {
        const row = categoryTableBody.insertRow();
        row.innerHTML = `
        <td>${category.id}</td>
        <td>${category.name}</td>
        <td>
            <button class="btn btn-warning" onclick="getCategoryAndShowModal(${category.id})">Update</button>
            <button class="btn btn-danger" onclick="showDeleteCategoryModal(${category.id})">Delete</button>
        </td>
        `;
    });
}

function getCategoryAndShowModal(categoryId) {
    
    fetch(BASE_PATH + "category/" + categoryId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Category getirme isteği başarısız durum kodu : " + response.status)
        }
        return response.json();
    }).then(category => {
        
        document.getElementById('updateCategoryId').value = category.id;
        document.getElementById('updateCategoryName').value = category.name;
        
        const updateCategoryModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateCategoryModal'))
        updateCategoryModal.show();

    }).catch(error => {
        console.error('Error:', error);
    });
}
//--------------------------------UPDATE-------------------------------
function updateCategory() {
    const categoryId = document.getElementById('updateCategoryId').value
    const categoryName = document.getElementById('updateCategoryName').value

    bodyData = JSON.stringify({
        id: categoryId,
        name: categoryName
    })

    fetch(BASE_PATH + "category/update", {
        method: 'PUT',
        body: bodyData,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Category PUT isteği başarısız durum kodu : " + response.status)
        }
        return response.json();
    }).then(category => {
        hideModal('updateCategoryModal')
        showSuccessAlert("Category updated successfully");                   //Eğer update başarılı ise alert ile ekranda gösterecek
        getAllCategory();
    }).catch(error => {
        console.error('Error:', error);
    });

}
//MODAL 'ı gizle
function hideModal(modalId) {
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId))
    deleteProductModal.hide();
}

//delete işleminde Category MODAL'ını gösterecek
function showDeleteCategoryModal(categoryId) {
    currentCategoryId = categoryId
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteCategoryModal'))
    deleteProductModal.show();
}
//-----------------------------DELETE------------------------------
async function deleteCategory() {
    if (currentCategoryId !== 0) {
        try {
            const response = await fetch(BASE_PATH + "category/" + currentCategoryId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken
                }
            });

            if (!response.ok) {
                const data = await response.json();
                if (data && data.message) {                        //data ve mesaj varsa
                    showFailAlert(data.message);                   //response başarısız ise başarısız alerti          
                }
            } else {
                showSuccessAlert('Category deleted successfully');  //response başarılın ise başarılı aleri
                getAllCategory();
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            hideModal('deleteCategoryModal');
        }
    }
}
//BAŞARILI alert 'i
function showSuccessAlert(message) {
    let alert = document.getElementById('success-alert');
    alert.style.display = 'block';
    alert.style.opacity = 1;

    let alertMessage = document.getElementById('successAlertMessage');
    alertMessage.textContent = message;
    setTimeout(() => {                          //ekranda kalma süresi
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none';
            }
            alert.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 50);
    }, 3000);
}

//BAŞARISIZ alert'i
function showFailAlert(message) {
    let alert = document.getElementById('fail-alert');
    alert.style.display = 'block';
    alert.style.opacity = 1;

    let alertMessage = document.getElementById('failAlertMessage');
    alertMessage.textContent = message;
    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none';
            }
            alert.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 50);
    }, 3000);
}
//sayfa açılınca dinle
document.addEventListener("DOMContentLoaded", async () => {
    await getAllCategory();                                                         //categorileri getir sayfa ilk açılınca
    //category add, form listener
    document.getElementById("addCategoryBtn").addEventListener("click", function () { //dinle addCategory butonuna click yapılınca categori isimlerini getir
        //form  verileri al
        const categoryName = document.getElementById("categoryName").value.trim();      //trim boşlukları temizle
        
        // addCategory butonuna basıldığında Category alanı boş ise uyarı verip boş eklenemez desin
        if(!categoryName){
            showFailAlert('Category name can not be empty!');     //Category eklenirkren boş ekleme yapmasın
            return;
        }
        showSuccessAlert('Category name add successfully!')
        
        fetch(BASE_PATH + "category/create", {                                      //POST (create) isteği ile category lere istek atıyor
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify({                                                  //json 'a çevir ismi
                name: categoryName
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error("Category create isteği başarısız durum kodu : " + response.status)
            }
            return response.json();
        }).then(category => {
            getAllCategory();                                                          //tüm category isimlerini getir                                       
        }).catch(error => {
            console.error('Error:', error);
        })
    })
});