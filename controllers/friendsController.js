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

function getMemberEmailFromToken( token ) {
    let decoded;
    jwt.verify( token, config.secret, err => {
        if ( err ) {
            console.log( "err: " + err );
            return "";
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
                    console.log( "****** ***** ** " + result[0].email );
                    
                });
            });
            return "";
        }
    });
}

function addFriend( token, email ) {
    let memberID = getMemberIDFromToken( token );
    // let addNewFriendMemberID = getMemberIDFromEmail( email );

    const client = new MongoClient( uri, { useUnifiedTopology: true } );
    client.connect( err => {
        if ( err ) throw err;
        const friends = client.db( config.mongodb.data ).collection( config.mongodb.friendsCollection ); 

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
function addNewFriendsToMyself( token, email ) {
    if ( tokenExist( token ) ) {
        if ( checkEmail( email ) && emailExist( email ) ) {
            console.log( "增加成為好友的email存在，表示可以加好友" );
            if ( getMemberEmailFromToken( token ) == email ) {
                console.log( "使用者輸入的是自己的email" );
            }
            // addFriend( token, email );
        } else {
            console.log( ERROR_MESSAGE_1 );
        }
    }
}

module.exports = {
    addNewFriendsToMyself
}