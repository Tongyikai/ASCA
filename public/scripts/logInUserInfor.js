const httpRequest = new XMLHttpRequest();

httpRequest.onload = function() {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
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