
const BASE_PATH = "http://localhost:8080/" //uygulamamıza erişilen yer.Aslında bu sunucumuzdur. Tüm dünyaya uygulamayı açtığımız yerdir.


/*login.html sayfasında submitForm() fonksiyonu göstermiştik. 
Bu fonksiyonla butona basınca 
1)Değişkenleri Almak: Fonksiyon, formdaki email ve password alanlarının değerlerini alır.
2)Form Verilerini Kullanma: 
Bu değerler, genellikle bir sunucuya gönderilir veya başka bir işleme tabi tutulur.
Örneğin, kullanıcı kimlik doğrulaması için bir sunucu tarafı API'ya gönderilebilir veya istemci tarafında doğrulama işlemleri yapılabilir.
*/


function  submitForm() {
    const email = document.getElementById('email').value;   //login.html deki email id 'sini aldık
    const password = document.getElementById('password').value;  //login.html deki password id 'sini aldık

    console.log("email : " + email)
    console.log("password : " + password)

    /*
    fetch, modern web tarayıcılarında bulunan bir API'dir ve 
    HTTP istekleri yapmak için kullanılır. fetch ile istek yapıcaz.
    burada istek atolacak path yukarda gösterdik direkt onu alıcaz
    */

    fetch(BASE_PATH + "customer/login", {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
       if (!response.ok){
            throw new Error("Login request failed status code : " + response.status)
       } 
       return response.json()
    })
    .then(data => {
        console.log(data);
        localStorage.setItem("jwtToken", data.token)
        localStorage.setItem("customerId", data.customerId)

        const role = parseJwt(data.token)

        if(role === "ROLE_ADMIN"){
            window.location.href = "admin.html"
        }else if(role === "ROLE_USER"){
            window.location.href = "index.html"
        }
    })
    .catch(error => {
        alert(error.message)
    })

}

/*
fetch fonksiyonu kullanılarak BASE_PATH + "customer/login" URL'sine POST isteği gönderilir.
body özelliği ile isteğin gövdesi belirlenir. Kullanıcı tarafından girilen email ve password JSON formatında gönderilir (JSON.stringify() ile).

İstek başarıyla gerçekleştirildiyse (response.ok durumu), yanıtın JSON formatında dönüştürülmesi sağlanır (response.json()).
Başarısız bir yanıt alınırsa (HTTP hata kodu gibi), hata fırlatılır (throw new Error()).

Başarılı bir şekilde giriş yapıldığında (data içerisinde token ve customerId gibi bilgiler alınır), bu bilgiler localStorage'a kaydedilir.
localStorage -->frontendin veritabanı gibi ama cash gibi varsay. yani sayfayı kapatıp açınca  gidebilir. 

datanın tokenını ve customerId yi localStorage'a kaydediyoruz

parseJwt() fonksiyonu ile JWT token'ından rol bilgisi alınır.
(window.location.href ile admin veya kullanıcı sayfasına yönlendirme).
Herhangi bir aşamada hata oluşması durumunda (fetch hatası veya işleme hatası), hata mesajı kullanıcıya alert() ile gösterilir.
*/


function parseJwt(token) {
    if(!token){  //Eğer token değeri yoksa veya tanımsız (null veya undefined), fonksiyon undefined olarak döner.
        return;
    }
    const base64Url = token.split('.')[1];  //token ı split et ve 1. indexi ver. Bu ilk nokta sonrası yani 2. kısma denk geliyor
    const base64 = base64Url.replace('-', '+').replace('_', '/');

    const decodedData = JSON.parse(window.atob(base64));

    //kullanıcı rolü ekrana basma
    const userRole = decodedData.authorities[0].authority
    console.log(userRole)

    return decodedData.authorities[0].authority  //token daki auhorities kısmından authority i al
}

/*
JWT token'ı üç nokta (.) ile ayrılmış üç kısma (header.payload.signature) sahiptir. 

base64Url değişkeni, payload kısmını (ikinci kısım) alır.

base64 değişkeni, URL güvenli base64 formatına dönüştürülür (- ve _ karakterlerinin yerine + ve / karakterleri getirilir).

window.atob() fonksiyonuyla base64 değeri çözümlenir (base64'den metne dönüşüm).
JSON.parse() ile çözümlenen metin JSON formatına dönüştürülür ve decodedData değişkenine atanır.


JWT --> noktalarla ayrılmıştır.Kod içerisinde 2 nokta var. 3 kısımdan oluşuyor.
ilk nktaya kadarki kısımda(1.kısım)-->(header) yer alır,
ikinci noktaya kadarki kısım(2. kısım)  base64Url -->içerik (payload),
ikinci noktadan sonraki kısım (üçüncü kısım)-->İmza (signature) 


Base64:  Bu yöntem, verilerin sadece ASCII karakterlerinden oluşan bir karakter dizisi haline getirilmesini sağlar.

base64Url: Base64Url kodlaması, Base64 ile aynı prensiplere sahiptir ancak bazı karakterlerin URL'lerde kullanılan özel karakterlerle uyumlu olacak şekilde değiştirilmiştir. Örneğin, + ve / karakterleri yerine - ve _ karakterleri kullanılır. Ayrıca, "=" karakteri padding amacıyla kullanılmaz veya işaretlenmez.

decodedData:  decodedData terimi, bu Base64Url kodlanmış verilerin çözümlenmiş ve anlamlandırılmış hali olarak düşünülebilir.
*/

/*
login hatası alırsan cross origin(CORS HATASI)bunun için Backend'e WebConfig sınıfı ekledik
*/