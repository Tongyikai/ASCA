const httpRequest = new XMLHttpRequest();

httpRequest.onload = function() {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
        var jsonObject = JSON.parse(httpRequest.responseText);
        console.log("處理回應: " + httpRequest.responseText);
        console.log("伺服器傳來: " + jsonObject);
        getAvatar(jsonObject.avatar);
    }
}

httpRequest.onerror = function() {
    alert("Can't connect to this network.");
}

function getProfileData() {
    console.log("開始檢查 Authorization");
    console.log("location.pathname: " + location.pathname);
    
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)authorization\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    console.log("authorization: " + cookieValue);

    if (cookieValue !== "") {
        httpRequest.open("POST", "http://127.0.0.1:8888/getProfileData", false);
        httpRequest.setRequestHeader("Authorization", "Bearer " + cookieValue);
        httpRequest.send();
    }
}

function displayBase64Image(placeholder, base64Image) {
    var image = document.createElement("img");
    image.onload = function() {
        placeholder.innerHTML = "";
        placeholder.appendChild(this);
    }
    image.src = base64Image;

}

function getAvatar(avatarBase64) {
    let bigAvatar = document.getElementById("big_Avatar");
    let smallAvatar = document.getElementById("small_Avatar");
    bigAvatar.src = avatarBase64;
    smallAvatar.src = avatarBase64;
}
