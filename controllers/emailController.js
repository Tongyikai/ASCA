var email = require('../public/json/email.json');

function searchExistEmail(searchEmail) {
    var isExist = false;

    for (var i = 0; i < email.EmailList.length; i++) {

        // console.log("email: " + email.EmailList[i].email + "-----search: " + searchEmail);

        if (email.EmailList[i].email == searchEmail) {
            console.log("電子郵件已經註冊: " + email.EmailList[i].email);
            isExist = true;
        }
    }
    return isExist;
}

module.exports = {
    searchExistEmail
}