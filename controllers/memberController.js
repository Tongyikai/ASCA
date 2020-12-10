/*
Create Operations
Read Operations
Update Operations
Delete Operations
*/

let email = require("../public/json/email.json");
let fs = require("fs");

const { json } = require('body-parser');
const UNDEFINED = "none";
const EMAIL_LIST_PATH = "./public/json/email.json";
const config = require("../config/developmentConfig"); 
const DEFAULT_AVATAR_NAME = "avatar";
const DEFAULT_AVATAR = config.defaultAvatar;

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://" + config.mongodb.user + ":" + config.mongodb.password + "@" + config.mongodb.host + "/" + config.mongodb.database;
// const client = new MongoClient(uri, { useUnifiedTopology: true });

const encryption = require("../models/encryption");
const jwt = require("jsonwebtoken");

let userMemberID;

function updateJSON() {
    fs.readFile(EMAIL_LIST_PATH, (err, fileData) => {
        if (err) {
            return console.error(err);
        }

        let data = fileData.toString();
        email = JSON.parse(data);
    });
}

function writeJSON(newData) {
    fs.readFile(EMAIL_LIST_PATH, function(err, fileData) { // 先將原本的json檔讀出來
        if (err) {
            return console.error(err);
        }

        let data = fileData.toString(); // 將二進制數據轉換為字串符
        data = JSON.parse(data); // 將字串符轉為 json 對象

        data.EmailList.push(newData);

        let str = JSON.stringify(data); // 因為寫入文件 json 只認識字符串或二進制數 需要將json對象轉換成字符串
        fs.writeFile(EMAIL_LIST_PATH, str, function(err) {
            if (err) {
                console.log(err);
            }
            console.log("Add data to ./public/json/email.json");
            updateJSON(); // 更新 json檔案，目前的是一開始載入的檔案
        });
    });
}

function tokenExist(token) {
    console.log("----- parse token -----");
    let decoded;
    let tokenCorrect;
    jwt.verify(token, config.secret, err => {
        if (err) {
            console.log("err: " + err);
            tokenCorrect = false;
        } else {   
            decoded = jwt.verify(token, config.secret);
            console.log(decoded);
            console.log("會員ID: " + decoded.memberID);
            userMemberID = decoded.memberID; // 驗證token正確同時取得memberID
            tokenCorrect = true;
        }
    });
    return tokenCorrect;
}

/* ************************************************
*	exports methods 
************************************************ */
function emailExist(searchEmail) { 
    for (var i = 0; i < email.EmailList.length; i++) {
        if (email.EmailList[i].email == searchEmail) {
            console.log("電子郵件已經註冊: " + email.EmailList[i].email);
            userMemberID = email.EmailList[i].memberID; // 查尋email存在的同時也取得memberID
            return true;
        }
    }
    return false;
}

function createMember(familyName, givenName, email, password, yearOfBirth, monthOfBirth, dayOfBirth, gender, callback) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    client.connect(err => {
        if (err) throw err;
        const memberCounters = client.db(config.mongodb.database).collection(config.mongodb.memberCountersCollection);
        const member = client.db(config.mongodb.database).collection(config.mongodb.memberCollection);
        const dateTime = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }); // 取得目前的時間+台北的時區(存入資料庫才是會當地的時間)
        const encryptionPassword = encryption(password); // 加密
    
        memberCounters.find({ _id: "memberID" }).toArray(function(err, result) {
            if (err) throw err;
            var memberID = result[0].sequence_value + 1;
            console.log("count=" + memberID);
    
            member.insertOne({ memberID: memberID,
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
                            update_date: UNDEFINED,
                            create_date: dateTime
                }, function(err, res) {     
                if (err) throw err;
                console.log("member insert success");
    
                memberCounters.updateOne({ _id: "memberID" }, { $set: { sequence_value: memberID } }, function(err, res) { 
                    if (err) throw err;
                    console.log("memberCounters update success");
                    
                    writeJSON({ memberID: memberID, email: email });
                    client.close();
                    callback();
                });
            });
        });
    });
    console.log("createMember finish.");
}

function logInMember(email, password, callback) {
    if (emailExist(email)) { // 判斷是否存在這組電子郵件
        // 取得memberID
        console.log("會員的ID: " + userMemberID);
        console.log("會員的password: " + password);

        // 驗證密碼
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect(err => {
            if (err) throw err;
            const member = client.db(config.mongodb.database).collection(config.mongodb.memberCollection);
            member.find({ "memberID": userMemberID }).toArray((err, result) => {
                if (err) throw err;
                console.log("資料庫的密碼: " + result[0].password);

                if (encryption(password) == result[0].password) {
                    console.log("密碼正確");
                    const token = jwt.sign({ algorithm: "HS256", exp: Math.floor(Date.now() / 1000) + (60 * 60), memberID: userMemberID }, config.secret);
                    client.close();
                    callback(token);

                } else {
                    // 密碼錯誤
                    console.log("密碼錯誤");
                    callback("passwordIncorrect");
                }
            });
        });

    } else {
        // email不存在
        console.log("email不存在");
        callback("emailIncorrect");
    }
}

function logInWithTokenMember(token, callback) {
    if (tokenExist(token)) {
        callback("true");
    } else {
        callback("false");
    }
}

function updateProfileMember() {

}

function getProfileData(token, callback) {
    if (tokenExist(token)) {
        console.log("取得會員的頭像");

        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect(err => {
            if (err) throw err;
            const member = client.db(config.mongodb.database).collection(config.mongodb.memberCollection);
            member.find({ "memberID": userMemberID }).toArray((err, result) => {
                if (err) throw err;
                console.log("會員的頭像: " + result[0].avatar);
                callback(result[0].avatar);
            });
        });

    } else {
        console.log("token錯誤");
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