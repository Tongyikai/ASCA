
nameRule = /[^\u4e00-\u9fa5]/;//只能輸入中文
emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
blankRule = /(^s*)|(s*$)/;
passwordRule = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\w\s]).{8,16}$/;

//檢查是否輸入了空白
function checkBlank(input) {
    if (input.replace(/(^s*)|(s*$)/g, "").length == 0) {
        return true;
    }

    if (input == "") return true;
    var regulation = "^[ ]+$";
    var re = new RegExp(regulation);
    return re.test(input);
}

//檢查姓氏與名字長度
function checkNameLength(name) {
    if (name.length > 5) return false;
    return true;
}

//檢查命名是否為中文
function checkNameIsChinese(name) {
    if (nameRule.test(name)) return false;
    return true;
}

//檢查電子郵件格式是否正確
function checkEmail(email) {
    if (email.search(emailRule)!= -1) return true;
        return false;
}

//AJAX
var httpRequest = new XMLHttpRequest();
var isEmailAvailable;

httpRequest.onload = function() {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
        var jsonObject = JSON.parse(httpRequest.responseText);

        console.log("處理回應: " + httpRequest.responseText);
        console.log("JSON: " + jsonObject);
        console.log("emailAvailable is: " + jsonObject.emailAvailable);

        if (jsonObject.emailAvailable == "true") {
            isEmailAvailable = true;
        } else {
            isEmailAvailable = false;
        }

        if (jsonObject.createMember == "success") {
            console.log("收到Server註冊成功的回應");
            window.location.href = "http://127.0.0.1:8888/index";
        }
    }
}

httpRequest.onerror = function() {
    alert("Can't connect to this network.");
}
// document.write('<script src="../HTTPServer/emailController.js"></script>');//引用另一個js

//檢查電子郵件是否存在(避免註冊重複的電子郵件)
function checkEmailAvailable(searchEmail) {
    httpRequest.open("GET", "http://127.0.0.1:8888/signUp/check?email=" + searchEmail, false);
    httpRequest.send();

    return isEmailAvailable;
}

//檢查密碼必須包含至少 8 個字元，可以混合使用英文字母、數字和符號 (僅限 ASCII 標準字元)
function checkPassword(password) {
    return passwordRule.test(password);
}

//檢查出生年月日是否正確
function checkDateOfBirth(year, month, day) {
    var limitInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var isLeap = new Date(year, 1, 29).getDate() === 29;

    if (isLeap) {
        limitInMonth[1] = 29;
    }

    return day <= limitInMonth[month - 1];
}

//傳送使用者註冊的基本資料
function registerForUser(familyName, givenName, email, password, bYear, bMonth, bDay, gender) {
    // console.log("客戶端註冊資訊準備用POST傳給伺服器");
    httpRequest.open("POST", "http://127.0.0.1:8888/userRegister", false);
    httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    httpRequest.send("familyName=" + familyName + 
                     "&givenName=" + givenName +
                     "&email=" + email +
                     "&password=" + password +
                     "&bYear=" + bYear + 
                     "&bMonth=" + bMonth +
                     "&bDay=" + bDay +
                     "&gender=" + gender
                     );
}