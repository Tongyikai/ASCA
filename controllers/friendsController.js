emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;

let email = require( "../public/json/email.json" );
const MongoClient = require( "mongodb" ).MongoClient;
const config = require( "../config/developmentConfig" ); 
const uri = "mongodb://" + config.mongodb.user + ":" + config.mongodb.password + "@" + config.mongodb.host + "/" + config.mongodb.database;
const jwt = require( "jsonwebtoken" );

const ERROR_MESSAGE_1 = "查無此email";

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

function getMemberEmailFromToken( token, callback ) {
    let decoded;
    // let email;

    jwt.verify( token, config.secret, err => {
        if ( err ) {
            console.log( "err: " + err );
        } else {   
            decoded = jwt.verify( token, config.secret );
            console.log( decoded );

            // 用 token 拿到的 memberID 取得資料庫使用者自己的email
            const client = new MongoClient( uri, { useUnifiedTopology: true } );
            client.connect( err => {
                if ( err ) throw err;
                const member = client.db( config.mongodb.data ).collection( config.mongodb.memberCollection );
                member.find( { memberID: decoded.memberID } ).toArray( function( err, result ) {
                    if ( err ) throw err;
                    console.log( "用 token 拿到的 memberID 取得資料庫使用者自己的email: " + result[0].email );
                    callback( result[0].email );
                    // email = result[0].email;
                });
            });
        }
    });
}

function sameEmail( email1, email2 ) {
    if ( email1 == email2 ) return true;
    return false;
}

// $addToSet：向陣列中新增元素，若陣列本身含有該元素，則不新增，否則，新增，這樣就避免了陣列中的元素重複現象；
// $push：向陣列尾部新增元素，但它不管陣列中有沒有該元素，都會新增。
// 查詢好友名單是否有這組email
function searchEmailExistInFriends( token, email, callback ) {
    let memberID = getMemberIDFromToken( token );
    let addNewFriendMemberID = getMemberIDFromEmail( email );

    const client = new MongoClient( uri, { useUnifiedTopology: true } );
    client.connect( err => {
        if ( err ) throw err;
        const friendList = client.db( config.mongodb.data ).collection( config.mongodb.friendListCollection ); 

        friendList.find( { memberID: memberID } ).toArray( function( err, result ) {
            if ( err ) throw err;
                console.log( "---------------查詢好友名單是否有這組email----------------" );
                console.log( result );
            if ( result == "" ) {
                console.log( "-----創立好友名單" );
                friendList.insertOne( { memberID: memberID, friends: [] } );
                console.log( "-----" + email + " 加到好友名單裡" );
                friendList.updateOne( { memberID: memberID }, { $push: { friends: addNewFriendMemberID } } );
                callback( "加為好友!" );
            } else {
                console.log( "-----存在-----好友名單---並顯示出所有好友memberID" );
                let array = result[0].friends;
                console.log( array );
                console.log( "-----檢查: " + email + " 是不是己經是好友" );

                switch( array.indexOf( addNewFriendMemberID ) ) {
                    case -1:
                        console.log( "-----找不到 不是好友, 增加到好友名單中" );
                        friendList.updateOne( { memberID: memberID }, { $push: { friends: addNewFriendMemberID } } );
                        callback( "+加為好友!" );
                        break;
                    default:
                        console.log( "-----已經是好友" );
                        callback( "已經存在您的好友名單!" );
                }
            }
        });
    });
}

function addFriend( token, email ) {
    let memberID = getMemberIDFromToken( token );
    // let addNewFriendMemberID = getMemberIDFromEmail( email );

    const client = new MongoClient( uri, { useUnifiedTopology: true } );
    client.connect( err => {
        if ( err ) throw err;
        const friends = client.db( config.mongodb.data ).collection( config.mongodb.friendListCollection ); 

        friends.find( { memberID: memberID } ).toArray( function( err, result ) {
            if ( err ) throw err;
            console.log( result );
            console.log( "-------------------------------" );
        });
    });
}

/* ************************************************
    加好友
************************************************* */
function addNewFriendsToMyself( token, email, callback ) {
    if ( tokenExist( token ) ) {
        if ( checkEmail( email ) && emailExist( email ) ) {
            console.log( "*1.   增加成為好友的email存在，表示可以加好友" );
            getMemberEmailFromToken( token, ( e ) => {
                console.log( "*2.   拿到自己的email: " + e );
                if ( sameEmail( email, e ) ) {
                    console.log( "這組email是你自己");
                } else {
                    searchEmailExistInFriends( token, email, function( message ) {
                        console.log( "*3.   檢查朋友");
                        callback( message );
                    });
                }
            });
        } else {
            console.log( "email格式有問題或可能不是會員成員" );
            callback( "email格式有問題或可能不是會員成員" );
        }
    } else {
        console.log( "驗證沒有過" );
    }
}

module.exports = {
    addNewFriendsToMyself
}