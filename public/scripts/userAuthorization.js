const httpRequest = new XMLHttpRequest();

httpRequest.onload = function() {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
        var jsonObject = JSON.parse(httpRequest.responseText);
        console.log("處理回應: " + httpRequest.responseText);
        console.log("伺服器傳來: " + jsonObject);

        switch(jsonObject.authorization) {
            case "emailIncorrect":
                alert("entered incorrect");
                break;

            case "passwordIncorrect":
                alert("entered incorrect");
                break;

            case "false":
                alert("Token incorrect!!");
                break;

            case "true":
                // window.location.href = "http://127.0.0.1:8888/profile";
                window.location.href = "http://127.0.0.1:8888/asca";
                break;

            default:
                console.log("把token存在cookie裡");
                document.cookie = "authorization=" + jsonObject.authorization;
                // 拿到Server發的鑰匙 用鑰匙登入
                checkAuthorization();
        }

        // if (jsonObject.authorization != "") {
        //     console.log("把token存在cookie裡");
        //     document.cookie = "authorization=" + jsonObject.authorization;
        //     // 拿到Server發的鑰匙 用鑰匙登入
        //     checkAuthorization();
        // }
    }
}

httpRequest.onerror = function() {
    alert("Can't connect to this network.");
}

function logInForUser(email, password) {
    httpRequest.open("POST", "http://127.0.0.1:8888/logIn", false);
    httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    httpRequest.send("email=" + email + "&password=" + password);
}

function checkAuthorization() {
    console.log("開始檢查 Autorization");
    console.log("location.pathname: " + location.pathname);
    console.log("authorization: " + cookieValue);
    
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)authorization\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    if (cookieValue !== "") { // 如果authorization有值，傳給伺服器認證
        httpRequest.open("POST", "http://127.0.0.1:8888/logInWithToken", false);
        httpRequest.setRequestHeader("Authorization", "Bearer " + cookieValue);
        httpRequest.send();
    }
}