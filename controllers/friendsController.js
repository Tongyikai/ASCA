emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;

let email = require( "../public/json/email.json" );

function checkEmail( email ) {
    if ( email.search( emailRule ) != -1 ) return true;
    return false;
}

function emailExist( searchEmail ) { 
    for ( var i = 0; i < email.EmailList.length; i++ ) {
        if ( email.EmailList[ i ].email == searchEmail ) {
            return true;
        }
    }
    return false;
}

/* ************************************************
    加好友
************************************************* */
function addNewFriendsToMyself( email ) {
    if ( checkEmail( email ) ) {
        console.log( "email format correct" );
        if ( emailExist( email ) ) {
            console.log( "增加好友的email 存在" );
        }
    }
}

module.exports = {
    addNewFriendsToMyself
}