const base64Code = require( "./base64CodeModel" );
const BLANK = "";

module.exports = function availableToModify( familyName, givenName, yearOfBirth, monthOfBirth, dayOfBirth, gender, currentCity, hometown, telephoneAreaCode, telephoneNumber, mobileNumber, facebook, avatar, callback ) {
    let fieldsVALUE = [ familyName, givenName, yearOfBirth, monthOfBirth, dayOfBirth, gender, currentCity, hometown, telephoneAreaCode, telephoneNumber, mobileNumber, facebook, avatar ];
    let fieldsKEY = [ "familyName", "givenName", "yearOfBirth", "monthOfBirth", "dayOfBirth", "gender", "currentCity", "hometown", "telephoneAreaCode", "telephoneNumber", "mobileNumber", "facebook", "avatar" ];

    let lottoBalls = [];
    let modifyItems = {
        familyName: { $set: { "familyName": "" }},
         givenName: { $set: { "givenName": "" }},
       yearOfBirth: { $set: { "yearOfBirth": "" }},
      monthOfBirth: { $set: { "monthOfBirth": "" }},
        dayOfBirth: { $set: { "dayOfBirth": "" }},
            gender: { $set: { "gender": "" }},
       currentCity: { $set: { "currentCity": "" }},
          hometown: { $set: { "hometown": "" }},
 telephoneAreaCode: { $set: { "telephoneAreaCode": "" }},
   telephoneNumber: { $set: { "telephoneNumber": "" }},
      mobileNumber: { $set: { "mobileNumber": "" }},
          facebook: { $set: { "facebook": "" }},
            avatar: { $set: { "avatar": "" }}
    };

function process( index ) {
    modifyItems[ fieldsKEY[ index ] ].$set[ fieldsKEY[ index ] ] = fieldsVALUE[ index ];
    lottoBalls.push( fieldsKEY[ index ] );
}

function processForAvatar( index ) {
    let base64 = base64Code( fieldsVALUE[ index ] );
    modifyItems[ fieldsKEY[ index ] ].$set[ fieldsKEY[ index ] ] = base64;
    lottoBalls.push( fieldsKEY[ index ] );
}

    for ( var i = 0; i < 13; i++ ) {
        switch ( i ) {
            case 2:
                if ( fieldsVALUE[ i ] !== "年" ) process( i );
                break;
            case 3:
                if ( fieldsVALUE[ i ] !== "月" ) process( i );
                break;
            case 4:
                if ( fieldsVALUE[ i ] !== "日" ) process( i );
                break;
            case 6:
                if ( fieldsVALUE[ i ] !== "城市" ) process( i );
                break;
            case 7:
                if ( fieldsVALUE[ i ] !== "城市" ) process( i );
                break;
            case 8:
                if ( fieldsVALUE[ i ] !== "區碼" ) process( i );
                break;
            case 12:
                if ( fieldsVALUE[ i ].size > 0 ) processForAvatar( i );
                break;

            default:
                if ( fieldsVALUE[ i ] !== BLANK ) process( i );
        }
    }
    callback( modifyItems, lottoBalls );
}
// 收到的Form data內容 轉成 { $set: {"key":"value"}} 格式