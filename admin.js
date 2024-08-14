
const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/macbook/Documents/GitHub/ecommerce/"
const jwtToken = localStorage.getItem('jwtToken');

let currentProductId = 0;

async function addProduct(){
    //backendedkine uygun bir ürün oluşturmalıyız.Aşağıdaki ürün ekleme oluşturulurken isimlerinin admin.html deki id lerle aynı olmasına dikkat et
    const fileInput = document.getElementById('productImage');                              //backend'in product modelinde image'ını buraya productImage olarak aldık
    const productName = document.getElementById('productName').value;                         //backend'in product modelinde ürün ismini burada productName aldık
    const productPrice = document.getElementById('productPrice').value;                       //backend'in product modelinde ürün fiyatı burada productPrice aldık
    const productUnitsInStock = document.getElementById('productUnitsInStock').value;         //backend'in product modelinin ürün unitsInStock bilgisi burada productUnitsInStock aldık
    const productCategoryId = document.getElementById('categorySelect').value;             //backend'i categoryId burada productCategoryId
    const productActive = document.getElementById('productActive').checked;                     //backend'i active burada productActive

    //admin.html de form olarak bu ürünler gösterilecek
    //formData'yı backende istek atarken dataları göndermek için oluşturuyoruz
    /*const formData ve  const productData yapma nedenimiz. Swaggerda ürün ekleme isteği atarken bir file oluşturuldu işte bunu const formData ile burada yaptık
    const productData ile de --> swaggerda ürün ekleme isteği atarken ürünün adı,fiyatı,stok bilgisi,category id si ve actif mi vardı.JSON OLARAK OLUŞTURMUŞTUK Buda oraya karşılık oluşturuldu*/
    const formData = new FormData();                  //formData: Daha önce oluşturulmuş bir FormData nesnesidir. Bu nesneye veri eklenir ve genellikle bir POST isteği ile sunucuya gönderilir.
    console.log("formData")
    formData.append('file', fileInput.files[0]);     //append-->FormData nesnesine file ekliyoruz. Bu metod iki parametre alır:ilk parametre key. yani sunucufile anahtarı ile veriyi alır. -- ikinci parametre value -->nesnenin file[0] dan itibaren ürünü ekler


    const productData = {                           //ürünün bilgilerini tutacak değişken
        //ürünün key, value değerleri.Soldakiler backend asağıdakiler frontend.ÖR: name->keyi productName value su
        //swagger POST product/create te bir image birde ürün bilgileri yani 2 ayrı data aldığı için ürün ayrı image ayrı girildi
        name: productName,
        price: productPrice,
        unitsInStock: productUnitsInStock,
        categoryId: productCategoryId,
        active: productActive
    };
    formData.append('product', new Blob([JSON.stringify(productData)],{ type: 'application/json'}));   //append ile product verileri ekleme
    console.log("post product")
    await fetch(BASE_PATH + "product/create", {      //asyncron old için await kullandık
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        body: formData
    }).then(response => {
        if(!response.ok){
            showFailAlert('Product add is unsuccessfull ');
            throw new Error("Product add request failed status code :" + response.status)
            
        }
      
        return response.json()      //json a çevir
        
    }).then(data => {
        console.log(data)
         //modalı kapatacak
         hideProductModal('addProductModal') //admin.html de addproduct -> id ="addProductModal" ---modalı kapat
         clearModalValues(); 
         showSuccessAlert('Product added successfully');  //Ürün başarıyla eklendi alerti
         getAllProduct();      //tüm ürünleri getir
        
    }).catch(error => {
        console.error("Error :" , error);
    });
}
    //getAllProduct() metodunuda sayfa ilk açılınca ürünler yüklendiyse sayfayı dinleyip getirecek
    //Bütün ürünleri çekecez. getAllProduct() ı addEventListener ın orada çağırmalıyız--> sayfa yüklenince ürünleri getirsin
    async function getAllProduct(){
        try{
            const response = await fetch(BASE_PATH + "product/all", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer ' + jwtToken
                } 
            });
            if(!response.ok){
                throw new Error("Failed to get products, response status :" + response.status)
            }
            const productList = await response.json();
            console.log("productList : ",productList)
            await renderProductTable(productList);          //alınan ürünleri tabloya ekle
           
        }catch(error){
            console.error("error : ", error)
    } 
    }

    //ürün tablosunu oluştururken admin.html deki admin contente göre burayı hazırladık
    async function renderProductTable(productList){
        const productTableBody = document.getElementById('productTableBody');    //admin html deki <tbody> nin id sini aldık . Çünkü ürünler oraya dinamik ekleniyor
        productTableBody.innerHTML = "";

        productList.forEach(product => {
            const row = productTableBody.insertRow();                       //tabloda row oluşturur. Bu satırda(rowda) -> name,price unitstock image active olacak
            row.innerHTML = `
                <td>${product.name}</td>        
                <td>${product.price}</td>
                <td>${product.unitsInStock}</td>
                <td>${product.categoryId}</td>
                <td><img src="${BASE_IMAGE_PATH}${product.image}" alt="${product.name}" width="100"></td>   
                <td>${product.active ? "Yes" : "No"}</td>
                <td>
                <button class="btn btn-warning" onclick="updateProduct(${product.id})">Update</button>  
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                <td>
            `;
        });  
    }

    //kategorileri backendden çekmek, api-call
    async function fethCategories() {
        console.log("jwt : " + jwtToken);
        try {
        const response = await fetch(BASE_PATH + "category", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        if (!response.ok) {
            console.error("response status :" + response.status)
            throw new Error("Failed to get categories, response status : " + response.status)
        }
        const data = await response.json();
        console.log(data);
        displayCategoriesWithSelectMenu(data);     // Kategorileri select menüsüne ekle
        displayCategories(data)                         //kategoriyi ekranda göster
    
    }catch(error) {
        console.error("Error fetching categories: ", error);
         if (error.status === 403) { //TODO: status undefined geliyor.
        window.location.href = "login.html"
        }
        }
    }

    //display kategori ve display product eklenecek
    function displayCategories(categories) {
        const categorySelect = document.getElementById('categorySelect');
        categorySelect.innerHTML = ''; // öncedeki kategorileri temizle.

    categories.forEach(category => {
        const option = document.createElement('option');  //categorySelect option ile kullanılır.değerler için
        option.value = category.id;
        option.text = category.name;
        categorySelect.appendChild(option);

    });
}   

    //success alert için
    function showSuccessAlert(message) {
        let alert = document.getElementById('success-alert');
        alert.style.display = 'block';
        alert.style.opacity = 1;       //buraya kadar html sayfasında tablonun altında alert görünüyor

        //mesaj içeriğini  alert içine yerleştir
        let alertMessage = document.getElementById('successAlertMessage');
        alertMessage.textContent = message;

        setTimeout (() => {
            let opacity = 1;
            let timer = setInterval (() => {
                if(opacity <= 0.1){
                    clearInterval(timer);
                    alert.style.display = 'none';
                } else {
                    opacity -= 0.1;                // Opasiteyi azalt
                    alert.style.opacity = opacity;
                }
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

    /*admin.html de DELETE MODAL içindeki data-bs-dismiss="modal" ile modal çıktığında istediğimizde x 'ya basarak kapatmamsı gerekliydi. Ancak çalışmadı 
        hocada showDeleteProductModal() ve hideProductModal() ekleyerek kapanmasını admin.js tarafından yaptı*/
        function showDeleteProductModal(productId) {
            currentProductId = productId
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteProductModal'))
            modal.show();
        }

        //admin.html de bu -> <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Cancel</button> yoktu bunu ekleyince hideProductModal() metoduna gerek kalmadı
        function hideProductModal(modalId){
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId))
            modal.hide();
        }
        //addProduct ta ürünü eklerkemesini yapar gibi ekliyoruz ancak bunları boş göndersin diye value ların karşılığı '' boş olacak.addProduct modalı açılınca sayfada ürünü ekledikten sonra modalın resmini name'ini,fiyatını... boşaltacak
        function clearModalValues(){
            document.getElementById('productImage').value = '';
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productUnitsInStock').value = '';
            document.getElementById('categorySelect').value = ''; //******** */
            document.getElementById('productActive').checked = '';
        }

        //DİKKAT-->admin.html de buton içindeki data-bs-target 'ı burada kullanma!!!!UpdateProduct ta modal ürün güncellemesinden sonmra açılmalı. Eğer data-bs-target kullanırsan hemen modalı açıyor
        //${} kullanarak product'ın name 'ini value olarak parametre olarak içine gömüyoruz.yoksa string olarak yazılan çıkar. böylece name değeri ne ise örneğin Macbook pro14  -<macbook pro 14 valuesunu koyar
   
//---------------------------------DELETE-------------------------------
       
        //Delete işlemi (methodu)
        function deleteProduct(productId){
            if(!productId){
                console.log("Product id is undefined or invalid")
                return;
            }
            currentProductId = productId;

            //Delete Confirm Modalını gösterme
            const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
            confirmDeleteModal.show();
        }
        //Onay butonuna tıklanınca method ile delete yapma işlevi--->admin.html de butona onclick="confirmDeletion()" ekle. eğer method ile yaparsan sonuna currentProductId=null; } ile kapat
         function confirmDeletion(){
            if(currentProductId === 0){    
                console.error('No product ID available for deletion.');
                return;      
        }
        /*
        //Onay butonuna tıklamayı dinleyerek silme işlemi-->admin.html deki butonun id="confirmDeleteButton" sini al.DİKKAT dinleyerek kapatırken sona  currentProductId=null; }); olarak kapat
        /*document.getElementById('confirmDeleteButton').addEventListener('click', () => {
            if(currentProductId === null) {
                console.error("No product ID available for deletion.")
                return;
            }
        */
    
    fetch(BASE_PATH + "product/" + currentProductId, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            
            throw new Error(`Product deletion request failed status code: ${response.status}`);
        }
       
        showSuccessAlert('Product is successfully deleted!')
        getAllProduct();                                        //sildikten sonra tekrar ürünleri çekecek ve render edecek
        hideProductModal('confirmDeleteButton');
        
        
    }).catch(error => {
        console.log("Error : ", error);
    });
    const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.hide();

    currentProductId=null;  //ürün id 'si sıfırla
    }

// Kategorileri select menü  ile gösteren fonksiyon
//fetchCategories() json veri alındıktan sonra displayCategoriesWithSelectMenu()eklemelisin
    function displayCategoriesWithSelectMenu(categories){
        const categorySelect = document.getElementById('updateProductCategorySelect');
        categorySelect.innerHTML = '';          // mevcut seçenekleri temizle

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.text = category.name;
            categorySelect.appendChild(option);
        });

    }

//---------------------------UPDATE-----------------------------
    //ürünü güncelleme
    function updateProduct(productId){
        //fetch ile --> product/productId'ye swagger'a GET isteği atıyor, sonra isteğin json tipinde olsun , token'ı al, response kısmı--> cevap geldiyse json 'a çevir ve json döndür, yoksa hata at
        fetch(BASE_PATH + "product/" + productId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        }).then(response => {
            if(!response.ok){
                throw new Error("Product getting request failed status code : ", response.status)
            }
            return response.json();
        }).then(product => {
            //update için modal'ı elimizle dolduruyoruz.
            document.getElementById('updateProductId').value = product.id;                           //bunun için admin html'de <input> oluşturdu type'ını hidden yaptı --> görünmeyecek.Bunu <input>u koyma nedeni saveUpdateProduct() metodunda id sini alabilmek
            document.getElementById('updateProductName').value = product.name;                       //git admin.html'de modal kısmından ürün name'inin id'sini  al (id="updateProductName") ve bu id için value olarak Backend'den gelen değeri yani(productName)'yi koy.value=product.name html sayfasında girilen ürünün ismidir
            document.getElementById('updateProductPrice').value = product.price;
            document.getElementById('updateProductUnitsInStock').value = product.unitsInStock;
            document.getElementById('updateProductActive').checked = product.active;
            //Mevcut category seçimi ayarlama
            //admin.html deki <select id="updateProductCategorySelect" ekledim
            document.getElementById('updateProductCategorySelect').value = product.categoryId;     

            //Resim alanını boşaltacak
            document.getElementById('updateProductImage').value = '';

            //modalı göster
            //moodala ürünü güncelledik.Şimdi MODAL'ı js tarafından açacağız
            const updateProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'))  // Returns a Bootstrap modal instance. updateProductModal admin.html 'de div in id si 
            updateProductModal.show();
        }).catch(error => {
            console.error('Error :', error);
        });
    }

    //güncellenen ürünü kaydetme
    function saveUpdateProduct(){
        //şimdi ürünün gerekli verilerini alacak. burda set etme yok.Sadece value'ları alacak Sonra fetch ile PUT isteği atacak
        const updateProductId = document.getElementById('updateProductId').value;                        //admin.html'deki Update Moadal içindeki id ler
        const updateProductName = document.getElementById('updateProductName').value;
        const updateProductPrice = document.getElementById('updateProductPrice').value;
        const updateProductUnitsInStock = document.getElementById('updateProductUnitsInStock').value;
        const updateProductCategoryId = document.getElementById('updateProductCategorySelect').value;          //ürün güncellenirkende select menu deki -->id yi eklicez<select id="updateProductCategorySelect"
        const updateProductActive = document.getElementById('updateProductActive').checked;

        const updateProductImage = document.getElementById('updateProductImage'); //foto varsada yoksada güncellemede fotoyu verecek 
        //Backend2e product JSON olarak göndermemiz gerekiyor. ilki bakendeki key,ikincisi frontendeki value
        const productData = {
            id: updateProductId,                        //id->key, updateProductId-Zvalue
            name: updateProductName,
            price: updateProductPrice,
            unitsInStock: updateProductUnitsInStock,
            categoryId: updateProductCategoryId,
            active: updateProductActive
        };
    
        const formData = new FormData();                                                                      //formData nesnesi oluştur
        formData.append('file', feditedSelectedImage = updateProductImage.files[0]);                          //file'ı ilk dosya olarak otomatik ekleyecek.feditedSelectedImage değişkenine updateProductImage input elementinden alınan ilk dosyayı atıyorsunuz. Yani, feditedSelectedImage ve updateProductImage.files[0] aynı dosyayı referans eder.
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));    //Blob nesnesi, veri (bu örnekte JSON) ile birlikte bir veri kümesi oluşturur. Blob ile veri göndermek, genellikle FormData içinde JSON verisi göndermek için kullanılır.  yani productData sını bir json veri kümesine dönüştürüp product nesnesinin içine ekleyecek

        fetch(BASE_PATH + "product/update", {   //product/update 'e swagger'a PUT isteği at
            method: 'PUT',
            body: formData,  //tüm datayı çekmesi için
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        }).then(response => {
            if(!response.ok){
                throw new Error("Product updating request failed status code : " , response.status)

            }
            getAllProduct();
            closeUpdateProductModal();
            showSuccessAlert('Product is successfully updated!')          //ürün başarıyla eklendi alerti
        }).catch(error => {
            console.error("Error : ",error)
        });
    }
            //update'in Modalını kapatma
            async function closeUpdateProductModal(){
                console.log("modal close")
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'))   // Returns a Bootstrap modal instance
                modal.hide();
    }
        // her şey yüklendiyse sayfa ilk açıldığında tüm ürünleri getirsin
        document.addEventListener('DOMContentLoaded', async () => {

                
                await getAllProduct();
                await fethCategories();
               
            });

       