/*
Create Operations
Read Operations
Update Operations
Delete Operations
*/

let email = require("../public/json/email.json");
let fs = require("fs");

const { json } = require('body-parser');
const UNDEFINED = "undefined";
const config = require("../config/developmentConfig");

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://" + config.mongodb.user + ":" + config.mongodb.password + "@" + config.mongodb.host + "/" + config.mongodb.database;
const client = new MongoClient(uri, { useUnifiedTopology: true });

const encryption = require("../models/encryption");
const jwt = require("jsonwebtoken");

let userMemberID;

function writeJSON(newData) {
    fs.readFile("./public/json/email.json", function(err, fileData) { //先將原本的json檔讀出來
        if (err) {
            return console.error(err);
        }

        let data = fileData.toString(); //將二進制數據轉換為字串符
        data = JSON.parse(data); //將字串符轉為 json 對象

        data.EmailList.push(newData);

        let str = JSON.stringify(data); //因為寫入文件 json 只認識字符串或二進制數 需要將json對象轉換成字符串
        fs.writeFile("./public/json/email.json", str, function(err) {
            if (err) {
                console.log(err);
            }
            console.log("Add data to ./public/json/email.json");
        });
    });
}

function emailExist(searchEmail) {
    let isExist = false;

    for (var i = 0; i < email.EmailList.length; i++) {
        if (email.EmailList[i].email == searchEmail) {
            console.log("電子郵件已經註冊: " + email.EmailList[i].email);
            userMemberID = email.EmailList[i].memberID;
            isExist = true;
        }
    }
    return isExist;
}

function createMember(familyName, givenName, email, password, birthYear, birthMonth, birthDay, gender, callback) {
    client.connect(err => {
        if (err) throw err;
        const memberCounters = client.db(config.mongodb.database).collection(config.mongodb.memberCountersCollection);
        const member = client.db(config.mongodb.database).collection(config.mongodb.memberCollection);

        const dateTime = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }); //取得目前的時間+台北的時區(存入資料庫才是會當地的時間)

        const encryptionPassword = encryption(password); //加密
    
        memberCounters.find({ _id: "memberID" }).toArray(function(err, result) {
            if (err) throw err;
            var memberID = result[0].sequence_value + 1;
            console.log("count=" + memberID);
    
            member.insertOne({ memberID: memberID, 
                             familyName: familyName, 
                              givenName: givenName,
                                  email: email,
                               password: encryptionPassword,
                              birth_year: birthYear,
                             birth_month: birthMonth,
                               birth_day: birthDay,
                                 gender: gender,
                                    img: UNDEFINED,
                               img_name: UNDEFINED,
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
    if (emailExist(email)) { // 判斷有這組電子郵件
        // 取得memberID
        console.log("會員的ID: " + userMemberID);
        console.log("會員的password: " + password);

        const token = jwt.sign({ algorithm: "HS256", exp: Math.floor(Date.now() / 1000) + (60 * 60), data: userMemberID }, config.secret);
        console.log("token: " + token);
        callback();
    }
}

module.exports = {
    emailExist,
    createMember,
    logInMember
}