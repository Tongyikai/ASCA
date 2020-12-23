/*
Create Operations
Read Operations
Update Operations
Delete Operations
*/

const fs = require( "fs" );
const MongoClient = require( "mongodb" ).MongoClient;
const config = require( "../config/developmentConfig" ); 
const uri = "mongodb://" + config.mongodb.user + ":" + config.mongodb.password + "@" + config.mongodb.host + "/" + config.mongodb.database;
const encryption = require( "../models/encryption" );
const jwt = require( "jsonwebtoken" );
// const base64Code = require("../models/base64CodeModel");
const modifyProfile = require( "../models/modifyProfile" );

let email = require( "../public/json/email.json" );
const { json } = require( 'body-parser' );

const UNDEFINED = "none";
const EMAIL_LIST_PATH = "./public/json/email.json";
const DEFAULT_AVATAR_NAME = "avatar";
const DEFAULT_AVATAR = config.defaultAvatar;
const TRUE = "true";
const FALSE = "false";

function updateJSON() {
    console.log( "====================================================================       更新Json文件" );
    fs.readFile( EMAIL_LIST_PATH, ( err, fileData ) => {
        if ( err ) {
            return console.error( err );
        }
        let data = fileData.toString();
        email = JSON.parse( data );
    });
}

function writeJSON( newData ) {
    console.log( "====================================================================      寫入email到Json文件" );
    fs.readFile( EMAIL_LIST_PATH, function( err, fileData ) { // 先將原本的json檔讀出來
        if ( err ) {
            return console.error( err );
        }
        let data = fileData.toString(); // 將二進制數據轉換為字串符
        data = JSON.parse( data ); // 將字串符轉為 json 對象
        data.EmailList.push( newData );
        let str = JSON.stringify( data ); // 因為寫入文件 json 只認識字符串或二進制數 需要將json對象轉換成字符串
        fs.writeFile( EMAIL_LIST_PATH, str, function( err ) {
            if ( err ) {
                console.log( err );
            }
            updateJSON(); // 更新 json檔案，目前的是一開始載入的檔案
        });
    });
}

function tokenExist( token ) {
    console.log( "====================================================================      token 驗證" );
    let decoded;
    let tokenCorrect;
    jwt.verify( token, config.secret, err => {
        if ( err ) {
            console.log( "err: " + err );
            tokenCorrect = false;
        } else {   
            decoded = jwt.verify( token, config.secret );
            console.log( decoded );
            console.log( "tokenExist - 會員ID: " + decoded.memberID );
            // memberIDFromToken = decoded.memberID; // 驗證token正確同時取得memberID
            tokenCorrect = true;
        }
    });
    return tokenCorrect;
}

function getMemberIDFromToken( token ) {
    console.log( "====================================================================      用token取得memberID" );
    let decoded;
    let memberID;
    jwt.verify( token, config.secret, err => {
        if ( err ) {
            console.log( "err: " + err );
        } else {
            decoded = jwt.verify( token, config.secret );
            memberID = decoded.memberID
        }
    });
    return memberID;
}

function getMemberIDFromEmail( searchEmail ) {
    console.log( "====================================================================      用email取得memberID" );
    for ( var i = 0; i < email.EmailList.length; i++ ) {
        if ( email.EmailList[ i ].email == searchEmail ) {
            return email.EmailList[ i ].memberID;
        }
    }
    return "0";
}

/* ************************************************
*	              exports methods                 *
************************************************* */
function emailExist( searchEmail ) { 
    console.log( "====================================================================      查尋email是否存在" );
    for ( var i = 0; i < email.EmailList.length; i++ ) {
        if ( email.EmailList[ i ].email == searchEmail ) {
            // console.log("電子郵件已經註冊: " + email.EmailList[i].email);
            // memberIDFromEmail = email.EmailList[i].memberID; // 查尋email存在的同時也取得memberID
            return true;
        }
    }
    return false;
}

function createMember( familyName, givenName, email, password, yearOfBirth, monthOfBirth, dayOfBirth, gender, callback ) {
    console.log( "====================================================================      建立一個新會員成員" );
    const client = new MongoClient( uri, { useUnifiedTopology: true } );
    client.connect( err => {
        if ( err ) throw err;
        const memberCounters = client.db( config.mongodb.database ).collection( config.mongodb.memberCountersCollection );
        const member = client.db( config.mongodb.database ).collection( config.mongodb.memberCollection );
        const dateTime = new Date().toLocaleString( "zh-TW", { timeZone: "Asia/Taipei" } ); // 取得目前的時間+台北的時區(存入資料庫才是會當地的時間)
        const encryptionPassword = encryption( password ); // 加密
    
        memberCounters.find( { _id: "memberID" } ).toArray( function( err, result ) {
            if ( err ) throw err;
            var memberID = result[ 0 ].sequence_value + 1; //會員總數累加
            member.insertOne( { memberID: memberID,
                                  avatar: DEFAULT_AVATAR,
                              avatarName: DEFAULT_AVATAR_NAME,
                              familyName: familyName, 
                               givenName: givenName,
                                   email: email,
                                password: encryptionPassword,
                             yearOfBirth: yearOfBirth,
                            monthOfBirth: monthOfBirth,
                              dayOfBirth: dayOfBirth,
                                  gender: gender,
                             currentCity: UNDEFINED,
                                hometown: UNDEFINED,
                       telephoneAreaCode: UNDEFINED,
                         telephoneNumber: UNDEFINED,
                            mobileNumber: UNDEFINED,
                                facebook: UNDEFINED,
                             update_date: UNDEFINED,
                             create_date: dateTime
                            }, 
                            function( err, res ) {
                                if ( err ) throw err;
                                memberCounters.updateOne( { _id: "memberID" }, { $set: { sequence_value: memberID } }, function( err, res ) { 
                                    if ( err ) throw err;
                                    writeJSON( { memberID: memberID, email: email } );
                                    client.close();
                                    callback();
                                });
                            });
        });
    });
    console.log( "createMember finish." );
}

function logInMember( email, password, callback ) {
    console.log( "====================================================================      輸入email and password 登入" );
    if ( emailExist( email ) ) { // 判斷是否存在這組電子郵件
        // 取得memberID
        var memberID = getMemberIDFromEmail( email );

        // 驗證密碼
        const client = new MongoClient( uri, { useUnifiedTopology: true } );
        client.connect( err => {
            if ( err ) throw err;
            const member = client.db( config.mongodb.database ).collection( config.mongodb.memberCollection );
            member.find( { "memberID": memberID } ).toArray( ( err, result ) => {
                if ( err ) throw err;
                console.log( "資料庫的密碼: " + result[ 0 ].password );
                if ( encryption( password ) == result[ 0 ].password ) {
                    const token = jwt.sign( { algorithm: "HS256", exp: Math.floor( Date.now() / 1000 ) + ( 60 * 60 ), memberID: memberID }, config.secret );
                    client.close();
                    callback( token );
                } else {
                    // 密碼錯誤
                    callback( "passwordIncorrect" );
                }
            });
        });
    } else {
        // email不存在
        callback( "emailIncorrect" );
    }
}

function logInWithTokenMember( token, callback ) {
    console.log( "====================================================================      帶有token登入" );
    if ( tokenExist( token ) ) {
        callback( TRUE );
    } else {
        callback( FALSE );
    }
}

function updateProfileMember( token, familyName, givenName, yearOfBirth, monthOfBirth, dayOfBirth, gender, currentCity, hometown, telephoneAreaCode, telephoneNumber, mobileNumber, facebook, avatar, callback ) {
    console.log( "====================================================================      修改會員基本資料" );
    var items;
    var balls;
    if ( tokenExist( token ) ) {
        let memberID = getMemberIDFromToken( token );
        modifyProfile( familyName, givenName, yearOfBirth, monthOfBirth, dayOfBirth, gender, currentCity, hometown, telephoneAreaCode, telephoneNumber, mobileNumber, facebook, avatar, (modifyItems, lottoBalls ) => {
            items = modifyItems; // 包裝成好幾組的格式 { $set: { "key":"value" } }
            balls = lottoBalls; // 要修改的 key 
        });
        const client = new MongoClient( uri, { useUnifiedTopology: true } );
        client.connect( err => {
            if ( err ) throw err;
            const member = client.db( config.mongodb.database ).collection( config.mongodb.memberCollection );
            let whereStr = { "memberID": memberID };
            for ( var i = 0; i < balls.length; i++ ) {
                var updateStr = items[ balls[ i ] ]; // 符合要修改的格式 { $set: { "key":"value" } }
                member.updateOne( whereStr, updateStr, ( err, result ) => {
                    if ( err ) throw err;
                    // console.log(result);
                });
            }
        });
        console.log( "修改" );
        callback( "updateProfileSuccess" );
    } else {
        console.log( "會員修改個人資料---token錯誤" );
        callback( "updateProfileError" );
    }
}

function getProfileData( token, callback ) {
    console.log( "====================================================================      取得會員的個人資料" );
    profileData = {
            avatar: "",
        familyName: "",
         givenName: "",
             email: "",
       yearOfBirth: "",
      monthOfBirth: "",
        dayOfBirth: "",
            gender: "",
       currentCity: "",
          hometown: "",
 telephoneAreaCode: "",
   telephoneNumber: "",
      mobileNumber: "",
          facebook: "",
    };

    if ( tokenExist( token ) ) {
        let memberID = getMemberIDFromToken( token );
        const client = new MongoClient( uri, { useUnifiedTopology: true } );
        client.connect( err => {
            if ( err ) throw err;
            const member = client.db( config.mongodb.database ).collection( config.mongodb.memberCollection );
            member.find( { "memberID": memberID } ).toArray( ( err, result ) => {
                if ( err ) throw err;
                // console.log(result);
                profileData.avatar              = result[ 0 ].avatar;
                profileData.familyName          = result[ 0 ].familyName;
                profileData.givenName           = result[ 0 ].givenName;
                profileData.email               = result[ 0 ].email;
                profileData.yearOfBirth         = result[ 0 ].yearOfBirth;
                profileData.monthOfBirth        = result[ 0 ].monthOfBirth;
                profileData.dayOfBirth          = result[ 0 ].dayOfBirth;
                profileData.gender              = result[ 0 ].gender;
                profileData.currentCity         = result[ 0 ].currentCity;
                profileData.hometown            = result[ 0 ].hometown;
                profileData.telephoneAreaCode   = result[ 0 ].telephoneAreaCode;
                profileData.telephoneNumber     = result[ 0 ].telephoneNumber;
                profileData.mobileNumber        = result[ 0 ].mobileNumber;
                profileData.facebook            = result[ 0 ].facebook;
                callback( profileData );
            });
        });
    } else {
        console.log( "取得會員的頭像---token錯誤" );
    }
}

module.exports = {
    emailExist,
    createMember,
    logInMember,
    logInWithTokenMember,
    updateProfileMember,
    getProfileData
}