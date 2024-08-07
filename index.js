    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");  //localStorage: Tarayıcıda veri saklamak için kullanılan bir nesnedir. Veriler anahtar-değer çiftleri olarak saklanır.getItem: localStorage API'sinin bir metodudur ve verilen anahtar adıyla ilişkilendirilmiş değeri döndürür. Eğer belirtilen anahtar localStorage'da bulunmuyorsa, bu metod null döner.
    const BASE_PATH = "http://localhost:8080/"
    const BASE_IMAGE_PATH = "/Users/macbook/Documents/GitHub/ecommerce/"

    let cartItems = [];  //card için array olarak tutacak
    /*sepetten sipariş etmedin.db ye sepete eklendi denmesi gerkmez.Sayfayı refresh edince uçsun gitsin 
    ama o sayfadaysan sayfayı refresh etmedin ve hala tutuyorsan cartItems ta tutsunki sipariş edilince backende gönderelim.*/
    //fetch kategory ve fetch product eklenecek

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

        displayCategories(data) //kategoriyi ekranda göster
    
    }catch(error) {
        console.error("Error fetching categories: ", error);
         if (error.status === 403) { //TODO: status undefined geliyor.
        window.location.href = "login.html"
        }
        }
    }
    //seçilen kategoriye göre ürünleri backendden çekmek, api-call.Ürün {;}category olarak geliyor.süslü parantez içine html inceleme ağ da tıklayınca ürünü gösterir
        async function fetchProductByCategory(categoryId) {
            const endPointUrl = BASE_PATH + "product/category/" + categoryId;
        try {
            const response = await fetch(endPointUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken
                }
            });

            if (!response.ok) {
                throw new Error("Failed to get products by category id, response status : " + response.status)
            }

            const data = await response.json();
            //console.log(data)
            displayProducts(data)
        } catch (error) {
            console.error("Error fetching products: ", error);
            if (error.status == 403) {
                window.location.href = "login.html"
            }
        }
    }
    //display kategori ve display product eklenecek
        function displayCategories(categories) {
            const categorySelect = document.getElementById("categorySelect");
            categorySelect.innerHTML = ''; // öncedeki kategorileri temizle.

        categories.forEach(category => {
            const option = document.createElement("option");  //categorySelect option ile kullanılır.değerler için
            option.value = category.id;
            option.text = category.name;
            categorySelect.appendChild(option);
            //sayfa yüklendiğinde fechCategories()->kategorileri dinle yap
        /*JS asyncrondur.Ör: 34. satırı çalıştırır cevabı beklemeden 35.satıra geçer.
        BUnedenle burada şuna dikkat etmeliyim. fethCategories() yap sonra cevabı al sonra kategoriye göre ürünü seç yapamasını istiyorum.
        Bundan  await fethCategories(); kullandık. Burada await cevabı beklemesini sağlıyor.
        Eğer bunu yapmazsan categoryi seçmeden ürüne geçer bu da category nin null olmasına neden olur.

        /*JavaScript asyncrondur. -> satırı okur işlem bitmeden hemen alt satıra geçer.
        Js'yi syncron yapmak için (await) kullanırsın.

        Java ise syncrondur. ->Adım adım satırın işlem bitene kadar orada kalır.
        Javayı asyncron yapmak için (thread) kullanırsın
        */

        });
    }
        //html de product yazının altında eklenen ürünler görünmesi için
        function displayProducts(products){
            const productList = document.getElementById("productList");
            productList.innerHTML='';

            /*html sayfasında Cart içerisinde ilk div kısmında cart div i olacak 
            bu div tüm productları tututyor. Burası index.html deki --><div id="productList"> tir.*/

            products.forEach(product => {
                console.log(product.image);
                console.log(product.name);

                const productCard = document.createElement("div"); //bootstrap teki Cart divini oluşturuyoruz.Burası her Cartın bir div idir.
                productCard.classList.add("col-md-3", "mb-4");

                const card =document.createElement("div");
                card.classList.add("card");
                

                //resmi carta ekleyecek
                const productImage = document.createElement("img");
                productImage.src = BASE_IMAGE_PATH + product.image;
                product.alt = product.name;  //ürünün resmi bozuk gelirse ismi görünsün 
                productImage.classList.add("card-img-top");
                productImage.style.maxWidth = "100%";
                productImage.maxHeight = "150px";
                
                //ürünün bilgilerini carta cardBody olarak ayrı div de eklenecek
                //sepete eklemek için yeni metot addToCart() kullandık
                //stokgörünsün istersen aşağıya  <p class = "card-text">Stock - ${product.unitsInStock}</p>
                const cardBody = document.createElement("div");
                cardBody.classList.add("cart-body");
                cardBody.innerHTML =` 
                <h5 class = "card-title">${product.name}</h5>
                <p class = "card-text">${product.price}</p>
                <button class = "btn btn-primary" onclick = 'addToCart(${JSON.stringify(product)})'>Add To Chart</button>     
            `;
                card.appendChild(productImage);
                card.appendChild(cardBody);
                productCard.appendChild(card);  
               
                productList.appendChild(productCard);  //bu productCard html deki productList e ait old. için productList içine productCard yazdık //en dıştaki div

            });

        }
        //carta ekleme addToCard() metodu
        function addToCart(product) {
            console.log(cartItems);  //cartItem sepetteki ürünleri array olarak tutuyor.
            console.log("addToCart : " + product.id);
          

            const productCountInCart = cartItems.filter(item => item.id === product.id).length;  //aynı üründen istenirse stoktakini istenilen kadar azaltıcak. elimde kalkmazsa da belirtecek
            console.log("productCountInCart : " + productCountInCart)

            if (product.unitsInStock > 0 && productCountInCart < product.unitsInStock) {
                cartItems.push(product);
                updateCart();
                updateOrderButtonVisibility(); //sepete ürün eklenince Order Now! butonu görünsün
            }
        }

        function updateCart() {
            const cart = document.getElementById("cart");
            cart.innerHTML = '';
        
            cartItems.forEach((item, index) => {    //item seçilen product 'ı tutuyor
                const cartItemElement = document.createElement("li");
                cartItemElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        
                const itemNameElement = document.createElement("span");
                cartItemElement.textContent = item.name + " - " + item.price;
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("btn", "btn-danger");
                deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        
                deleteButton.onclick = function () {  //delete butonuna basılınca ürün indexi silinecek
                    removeFromCart(index);
                    
                };
        
                cartItemElement.appendChild(itemNameElement);
                cartItemElement.appendChild(deleteButton);
                cart.appendChild(cartItemElement);
            });
        }
        //cart'tan index'i silecez. Ürün stoğu bir arttır
        function removeFromCart(index){
                cartItems.splice(index, 1)[0];  //  0. index i al 
                updateCart();
                updateOrderButtonVisibility();
        }
        function updateOrderButtonVisibility(){
            if(cartItems.length > 0) {  //sepette ürün varsa block, ürün yoksa none(gösterme)
                document.getElementById("orderButton").style.display = "block";  
            }else {
                document.getElementById("orderButton").style.display = "none";
            }
        }
        //sipariş ekleme orderNow() . ****  veya document.addEventListener() ilede yapılır
        function orderNow(){
            console.log("orderNow : ", cartItems);

            const idCountMap = new Map();                        //idCountMap adında yeni bir Map nesnesi oluşturur. Map, anahtar-değer çiftlerini depolamak için kullanılan bir veri yapısıdır. Burada, idCountMap, her bir id değerinin kaç kez geçtiğini saymak için kullanılacak.
            cartItems.forEach(item => {
                console.log(item);
                const { id } = item;    
                console.log("id : " ,id);                   //const { id } = item;: Bu satır, her bir item nesnesinden id 'leri alır.item burada dizideki her bir öğeyi temsil eder.const { id } = item; item nesnesinden sadece id özelliğini alır ve onu id adlı bir değişkene atar.

            //Check if the id exists in the map
            if (idCountMap.has(id)) {   
                console.log("idCountMap.get(id) : " , idCountMap.get(id))                        //id anahtarı idCountMap içinde mevcutsa
                 //if it exists, increment the count
                 idCountMap.set(id, idCountMap.get(id) + 1);     //mevcut değere(ürüne) 1 ekler, yani aynı id ye sahip ürünün sayısını artırır.
            }else{
                  //if it doesn't exist, add it to the map
                idCountMap.set(id, 1);                            //Eğer id anahtarı idCountMap içinde mevcut değilse, bu satır çalışır:idCountMap.set(id, 1): Bu metod, id anahtarını ve bu anahtarın sayısını 1 olarak ayarlar. Yani, id ilk defa ekleniyor ve sayısı 1 olarak başlatılıyor.
            }

            })
            idCountMap.forEach((count, id) => {                  //count value, id ise key dir
                console.log("id : ", id, "count : ",count)
                //Bu kod parçası, idCountMap içinde hangi id'lerin bulunduğunu ve her bir id'nin ne kadar tekrar ettiğini görselleştirmek için kullanışlıdır. Özellikle verileri analiz etmek ve debug işlemleri yapmak için bu tür yazdırma işlemleri yaygındır.
            });

            //elimizdeki Map 'i 1 den çok ürün olabileceği için Liste ye dönüştüreceğiz.
            var orderProductInfoList = [...idCountMap].map(([productId, quantity]) => ({productId, quantity}));       //[...] (Spread Operatörü)  bir Map nesnesindeki tüm key,value çiftlerini bir List 'e dönüştürür.**({productId, quantity}): Bu ifade, destructured productId ve quantity'yi bir nesne içinde döndürür. Yani, her bir anahtar-değer çifti { productId, quantity } şeklinde bir nesne haline getirilir.
            console.log("orderProductInfoList : ", orderProductInfoList);

            //fetch ile order'a istek atıcaz.fetch fonksiyonu, veri almak veya göndermek için kullanılır. fetch, genellikle ağ verilerini almak, REST API'leri çağırmak, form verilerini göndermek ve benzeri ağ işlemlerini gerçekleştirmek için kullanılır.
            fetch(BASE_PATH + "order", {
                method: 'POST',
                body: JSON.stringify({
                    customerId,                        //customerId tanımlanmadığı için hata verir. Yukarıya tanımlamalısın
                    orderList : orderProductInfoList   //backend 'de orderList frontend'de orderProductInfoList görünüyor 
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+ jwtToken
                }
            }).then(response => {
                if(!response.ok){
                    throw new Error("Order request failed status code :"+ response.status)
                }
                return response.json()
            }).then(data => {
                console.log(data)
                clearCart();
            })
        }
        function clearCart(){
            cartItems = [];
            updateCart();
            updateOrderButtonVisibility();   //sepette ürün varsa bloklayacak
            const categorySelect = document.getElementById("categorySelect");
            fetchProductByCategory(categorySelect.value);
        }

        //index.html yüklendikten sonra ilk çalışan yer addEventListener()
        document.addEventListener("DOMContentLoaded", async function () {
            
            updateOrderButtonVisibility();  //ilk sayfa yüklenirken kontrol et. sepette ürün var mı yok->o zaman Order Now! butonu görünmesin. silincede görümnmeyecek none dan dolayı
           
           
            //kategorileri yükle
            await fethCategories();

            //kategori seçimini dinle ve product'ları çek.
            const categorySelect = document.getElementById("categorySelect");
            categorySelect.addEventListener("change", async function () { //html sayfasında ELECTRONIC,GARDEN,COSMETIC bunlardan birini seçince yani değişirse(change) seçilen hangisi ise id sini alacak
                await fetchProductByCategory(categorySelect.value);  //categorySelect kategori seçilince-> seçilen kategoriye istek atacaz-->fetchProductByCategory() . bu metod fetcCategory() nin altında
            });
        
        })