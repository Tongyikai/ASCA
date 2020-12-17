
nameRule = /[^\u4e00-\u9fa5]/; // 只能輸入中文
emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
blankRule = /(^s*)|(s*$)/g;
passwordRule = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\w\s]).{8,16}$/;
telephoneRule = /^(\d{7,8})$/;
mobileRule = /^09[0-9]{8}$/;

// 檢查是否輸入了空白 (沒有輸入或輸入空白為 true，文字包含空白字符為 false)
function checkBlank(input) {
    if (input.replace(blankRule, "").length == 0) {
        return true;
    }

    if (input == "") return true;
    var regulation = "^[ ]+$";
    var re = new RegExp(regulation);
    return re.test(input);
}

// 檢查文字中是否包含空白
function checkBlankInTheWord(input) {
    let str = input.split("");

    for (i = 0; i < str.length; i++) {
        if (str[i] == " ") {
            return true;
        }
    }
    return false;
}

// 檢查姓氏與名字長度
function checkNameLength(name) {
    if (name.length > 5) return false;
    return true;
}

// 檢查命名是否為中文 (沒有輸入或輸入中文為 true，不是中文或包函空白字符為 false)
function checkNameIsChinese(name) {
    if (nameRule.test(name)) return false;
    return true;
}

// 檢查電子郵件格式是否正確
function checkEmail(email) {
    if (email.search(emailRule)!= -1) return true;
    return false;
}

function checkTelephoneNumber(telephoneNumber) {
    if (telephoneRule.test(telephoneNumber)) return true;
    return false;
}

function checkMobileNumber(mobileNumber) {
    if (mobileRule.test(mobileNumber)) return true;
    return false;
}

/* **********************************************************
                            AJAX                            *
*********************************************************** */
const httpRequest = new XMLHttpRequest();

httpRequest.onload = function() {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
        let jsonObject = JSON.parse(httpRequest.responseText);

        // console.log("處理回應: " + httpRequest.responseText);
        // console.log("JSON: " + jsonObject);


        // 取得個人資料
        // console.log("json 裡有沒有 key 是avatar: " + jsonObject.hasOwnProperty('avatar'));
        if (jsonObject["avatar"] != undefined) {
            // console.log("jsonObject 裡有 key = avatar");
            getAvatar(jsonObject.avatar);
        }
        if (jsonObject["updateProfile"] != undefined) {
            alert("onload: " + jsonObject.updateProfile);
        }
    }
}

httpRequest.onerror = function() {
    alert("Can't connect to this network.");
}

// 檢查密碼必須包含至少 8 個字元，可以混合使用英文字母、數字和符號 (僅限 ASCII 標準字元)
function checkPassword(password) {
    return passwordRule.test(password);
}

// 檢查出生年月日是否正確
function checkDateOfBirth(year, month, day) {
    let limitInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let isLeap = new Date(year, 1, 29).getDate() === 29;

    if (isLeap) {
        limitInMonth[1] = 29;
    }
    return day <= limitInMonth[month - 1];
}

// 使用者"取得"的基本資料
function getProfileData() {
    // console.log("開始檢查 Authorization");
    // console.log("location.pathname: " + location.pathname);
    
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)authorization\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // console.log("authorization: " + cookieValue);

    if (cookieValue !== "") {
        httpRequest.open("POST", "http://127.0.0.1:8888/getProfileData", false);
        httpRequest.setRequestHeader("Authorization", "Bearer " + cookieValue);
        httpRequest.send();
    }
}

function getAvatar(avatarBase64) {
    let bigAvatar = document.getElementById("big_avatar");
    let smallAvatar = document.getElementById("small_avatar");
    bigAvatar.src = avatarBase64;
    smallAvatar.src = avatarBase64;
}

/* **********************************************************
                       AJAX Send Form                       *
*********************************************************** */
window.addEventListener( 'load', function() {
    console.log( "window.addEventListener" );

    function sendData() {
        const FD = new FormData( form );
        httpRequest.addEventListener( "load", function( event ) {
            alert( "Server: " + event.target.responseText );
        });
        httpRequest.addEventListener( "error", function( event ) {
            alert( 'Oops! Something went wrong.' );
        });
        httpRequest.open( "POST", "http://127.0.0.1:8888/updateProfile" );
        httpRequest.send( FD );
    }

    const form = document.getElementById( "edit_ContentForm" );
    form.addEventListener( "submit", function ( event ) {
        event.preventDefault();
        if (changesToYourProfile()) sendData();
    });
});

// 人像目錄
let avatarMenu = document.querySelector(".avatar_Menu");
avatarMenu.addEventListener("click", function() {
    this.classList.toggle("active");
});

// 編輯視窗
let edit = document.getElementById("edit");
let editProfileButton = document.getElementById("edit_profile_btn");
let editCloseButton = document.getElementsByClassName("edit_closeButton")[0];
editProfileButton.onclick = function() {
    edit.style.display = "block";
}
editCloseButton.onclick = function() {
    edit.style.display = "none";
}

//登出
let logoutButton = document.getElementById("logout");
logoutButton.onclick = () => {
    alert(document.cookie);
    document.cookie = "authorization=";
    alert(document.cookie);
    console.log("登出		登出			登出");
    window.location.href = "http://127.0.0.1:8888/index";
}

// 限制上傳圖片的大小
const UPLOAD_AVATAR_MAX_SIZE = 1*1024*1024; 
const ERROR_MESSAGE = "上傳的附件檔案不能超過 1 Mega Byte";
let uploadAvatarMaxSizeCorrect = true;

var loadFile = function(event) {
    let uploadAvatar = document.getElementById("edit_uploadAvatar");

    // 上傳的檔案如果大於限制顯示警告
    if (uploadAvatar.files[0].size > UPLOAD_AVATAR_MAX_SIZE) {
        uploadAvatarMaxSizeCorrect = false;
        alert(ERROR_MESSAGE);
    } else {
        uploadAvatarMaxSizeCorrect = true;
        // let bigAvatar = document.getElementById("big_avatar");
        // let smallAvatar = document.getElementById("small_avatar");
        // bigAvatar.src = URL.createObjectURL(uploadAvatar.files[0]);
        // smallAvatar.src = URL.createObjectURL(uploadAvatar.files[0]);
        avatar = uploadAvatar;
        console.log("頭像 - 修改 可以");
        // formFieldsName.push("avatar");
        // formFieldsValue.push(uploadAvatar);
    }
}

function cancelUploadAvatar() {
    document.getElementById("edit_uploadAvatar").value = "";
    uploadAvatarMaxSizeCorrect = true;
}

// 出生年月日參數
function showYear() {
    let options = "<option>年</option>";
    for (var i = 1900; i <= 2020; i++) {
        options += ("<option>" + i + "</option>");
    }
    document.getElementById("edit_yearBox").innerHTML = options;
}

function showMonth() {
    let options = "<option>月</option>";
    for (var i = 1; i <= 12; i++) {
        options += ("<option>" + i + "</option>");
    }
    document.getElementById("edit_monthBox").innerHTML = options;
}

function showDay() {
    let options = "<option>日</option>";
    for (var i = 1; i <= 31; i++) {
        options += ("<option>" + i + "</option>");
    }
    document.getElementById("edit_dayBox").innerHTML = options;
}

// 所有城市參數
const CITY = ["台北市", "新北市", "基隆市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "台南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"];
function showCity() {
    let options = "<option>城市</option>";
    for (var i = 0; i < 21; i++) {
        options += ("<option>" + CITY[i] + "</option>");
    }
    document.getElementById("edit_currentCity").innerHTML = options;
    document.getElementById("edit_hometown").innerHTML = options;
}

// 市內電話區域參數
const TELEPHONE_AREA_CODE = ["02", "03", "037", "04", "049", "05", "06", "07", "08", "089", "082", "0826", "0836"];
function showTelephoneAreaCode() {
    let options = "<option>區碼</option>"
    for (var i = 0; i < 13; i++) {
        options += ("<option>" + TELEPHONE_AREA_CODE[i] + "</option>");
    }
    document.getElementById("edit_telephoneAreaCode").innerHTML = options;
}

let formFieldsName = [];    
// let formFieldsValue = [];
let avatar;
let familyName;
let givenName;
let year;
let month;
let day;
let gender;
let currentCity;
let hometown;
let telephoneAreaCode;
let telephoneNumber;
let mobileNumber;
let facebook;
const YEAR_CHARACTER = "年";
const MONTH_CHARACTER = "月";
const DAY_CHARACTER = "日";
const CITY_NAME = "城市";
const AREA_CODE = "區碼";
const BLANK = "";
// 您的個人資料更改
function changesToYourProfile() {
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)authorization\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    document.getElementById("edit_token").value = cookieValue;

    safeCount = 6;

    familyName = document.getElementById("edit_familyName").value;
    givenName = document.getElementById("edit_givenName").value;
    year = document.getElementById("edit_yearBox").value;
    month = document.getElementById("edit_monthBox").value;
    day = document.getElementById("edit_dayBox").value;
    gender = document.querySelector('input[name="gender"]:checked').value
    currentCity = document.getElementById("edit_currentCity").value;
    hometown = document.getElementById("edit_hometown").value;
    telephoneAreaCode = document.getElementById("edit_telephoneAreaCode").value;
    telephoneNumber = document.getElementById("edit_telephoneNumber").value;
    mobileNumber = document.getElementById("edit_mobileNumber").value;
    facebook = document.getElementById("edit_facebook").value;

    // 檢查使用者輸入的資訊
    const ERROR_MESSAGE_1 = "文字不要包函空白字符";
    const ERROR_MESSAGE_2 = "文字長度超過5個字";
    const ERROR_MESSAGE_3 = "只限輸入中文";
    const ERROR_MESSAGE_4 = "出生年月日不是正確的日期";
    const ERROR_MESSAGE_5 = "請輸入完整的出生日期";
    const ERROR_MESSAGE_6 = "市話不正確";
    const ERROR_MESSAGE_7 = "請輸入完整的電話區碼 + 號碼";
    const ERROR_MESSAGE_8 = "手機號碼不正確";
    const ERROR_MESSAGE_9 = "臉書連接不正確";

    if (!checkBlank(familyName)) {
        if (checkBlankInTheWord(familyName)) {
            safeCount--;
            console.log("姓 - 字有包函空白字符      safeCount=" + safeCount);
            alert(ERROR_MESSAGE_1);
        } else if (!checkNameLength(familyName)) {
            safeCount--;
            console.log("姓 - 文字長度超過5個字     safeCount=" + safeCount);
            alert(ERROR_MESSAGE_2);
        } else if (!checkNameIsChinese(familyName)) {
            safeCount--;
            console.log("姓 - 不是中文      safeCount=" + safeCount);
            alert(ERROR_MESSAGE_3);
        } else {
            console.log("姓 - 修改 可以");
            // formFieldsName.push("familyName");
            // formFieldsValue.push(familyName);
        }
    } else {
        console.log("姓 - 不修改");
    }

    if (!checkBlank(givenName)) {
        if (checkBlankInTheWord(givenName)) {
            safeCount--;
            console.log("名 - 字有包函空白字符      safeCount=" + safeCount);
            alert(ERROR_MESSAGE_1);
            
        } else if (!checkNameLength(givenName)) {
            safeCount--;
            console.log("名 - 文字長度超過5個字     safeCount=" + safeCount);
            alert(ERROR_MESSAGE_2);
            
        } else if (!checkNameIsChinese(givenName)) {
            safeCount--;
            console.log("名 - 不是中文      safeCount=" + safeCount);
            alert(ERROR_MESSAGE_3);
            
        } else {
            console.log("名 - 修改 可以");
            // formFieldsName.push("givenName");
            // formFieldsValue.push(givenName);
        }
    } else {
        console.log("名 - 不修改");
    }

    if (year != YEAR_CHARACTER && month != MONTH_CHARACTER && day != DAY_CHARACTER) {
        if (checkDateOfBirth(year, month, day)) {
            console.log("出生 - 修改 可以");
            // formFieldsName.push("birthday");
        } else {
            safeCount--;
            console.log("出生 - 修改 不是正確的日期     safeCount=" + safeCount);
            alert(ERROR_MESSAGE_4);
        }
    } else if (year == YEAR_CHARACTER && month == MONTH_CHARACTER && day == DAY_CHARACTER) {
        console.log("出生 - 不修改");
    } else {
        safeCount--;
        console.log("出生 - 修改 請輸入完整的出生日期       safeCount=" + safeCount);
        alert(ERROR_MESSAGE_5);
    }

    // formFieldsName.push("gender");
    console.log("性別 - " + gender);

    if (currentCity == CITY_NAME) {
        console.log("現居 - 不修改");
    } else {
        console.log("現居 - 修改");
        // formFieldsName.push("currentCity");
    }

    if (hometown == CITY_NAME) {
        console.log("家鄉 - 不修改");
    } else {
        console.log("家鄉 - 修改");
        // formFieldsName.push("hometown");
    }

    if (telephoneAreaCode != AREA_CODE || !checkBlank(telephoneNumber)) {
        if (telephoneAreaCode != AREA_CODE && !checkBlank(telephoneNumber)) {
            if (checkTelephoneNumber(telephoneNumber)) {
                console.log("市話 - 修改 可以");
                // formFieldsName.push("telephoneNumber");
            } else {
                safeCount--;
                console.log("市話 - 修改 不正確     safeCount=" + safeCount);
                alert(ERROR_MESSAGE_6);
            }
        } else {
            safeCount--;
            console.log("市話 - 修改 請輸入完整     safeCount=" + safeCount);
            alert(ERROR_MESSAGE_7);
        }
    } else {
        console.log("市話 不修改");
    }

    if (!checkBlank(mobileNumber)) {
        if (!checkMobileNumber(mobileNumber)) {
            safeCount--;
            console.log("手機 - 修改 不正確     safeCount=" + safeCount);
            alert(ERROR_MESSAGE_8);
        } else {
            console.log("手機 修改 可以");
            // formFieldsName.push("mobileNumber");
        }
    } else {
        console.log("手機 不修改");
    }

    if (!checkBlank(facebook)) {
        if (checkBlankInTheWord(facebook) || facebook.length > 50) {
            safeCount--;
            console.log("facebook - 修改 不正確     safeCount=" + safeCount);
            alert(ERROR_MESSAGE_9);

        } else {
            console.log("facebook 修改 可以");
            // formFieldsName.push("facebook");
        }
    } else {
        console.log("facebook 不修改");
    }

    if (safeCount < 6 || !uploadAvatarMaxSizeCorrect) {
        alert("不行提交");
        return false;
    }

    alert("可以提交");
    changeFormFieldsNOW();
    return true;
}

function changeFormFieldsNOW() {
    formObj = {
          bit_avatar:   document.getElementById("big_avatar"),
        small_avatar:   document.getElementById("small_avatar"),
          familyName:   document.getElementById("profile_familyName"),
           givenName:   document.getElementById("profile_givenName"),
            birthday:   document.getElementById("profile_birthday"),
              gender:   document.getElementById("profile_gender"),
         currentCity:   document.getElementById("profile_currentCity"),
            hometown:   document.getElementById("profile_hometown"),
     telephoneNumber:   document.getElementById("profile_telephoneNumber"),
        mobileNumber:   document.getElementById("profile_mobileNumber"),
            facebook:   document.getElementById("profile_facebook"),
    };
    if (avatar.size > 0) {
        formObj.bit_avatar.src = URL.createObjectURL(avatar.files[0]);
        formObj.small_avatar.src = URL.createObjectURL(avatar.files[0]);
    }
    if (familyName != BLANK) {
        formObj.familyName.innerHTML = familyName;
    }
    if (givenName != BLANK) {
        formObj.givenName.innerHTML = givenName; 
    }
    if (year != YEAR_CHARACTER && month != MONTH_CHARACTER && day != DAY_CHARACTER) {
        formObj.birthday.innerHTML = year + "年" + month + "月" + day + "日";
    }
    formObj.gender.innerHTML = gender;
    if (currentCity != CITY_NAME) {
        formObj.currentCity.innerHTML = currentCity;
    }
    if (hometown != CITY_NAME) {
        formObj.hometown.innerHTML = hometown;
    }
    if (telephoneNumber != BLANK) {
        formObj.telephoneNumber.innerHTML = telephoneAreaCode + "-" + telephoneNumber;
    }
    if (mobileNumber != BLANK) {
        formObj.mobileNumber.innerHTML = mobileNumber;
    }
    if (facebook != BLANK) {
        formObj.facebook.href = facebook;
        formObj.facebook.innerHTML = facebook;
    }
}

showYear();
showMonth();
showDay();
showCity();
showTelephoneAreaCode();
getProfileData();