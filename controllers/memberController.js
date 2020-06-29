/*
Create Operations
Read Operations
Update Operations
Delete Operations
*/

var email = require('../public/json/email.json');
var fs = require("fs");

const { json } = require('body-parser');
const UNDEFINED = "undefined";

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://testAdmin:testAdmin123@localhost:27017/ASCA_DB";
const client = new MongoClient(uri, { useUnifiedTopology: true });

function emailExist(searchEmail) {
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

function writeJSON(newData) {
    fs.readFile("./public/json/email.json", function(err, fileData) { //先將原本的json檔讀出來
        if (err) {
            return console.error(err);
        }

        var data = fileData.toString(); //將二進制數據轉換為字串符
        data = JSON.parse(data); //將字串符轉為 json 對象

        data.EmailList.push(newData);

        var str = JSON.stringify(data); //因為寫入文件 json 只認識字符串或二進制數 需要將json對象轉換成字符串
        fs.writeFile("./public/json/email.json", str, function(err) {
            if (err) {
                console.log(err);
            }
            console.log("Add data to ./public/json/email.json");
        });
    });
}

function createMember(familyName, givenName, email, password, birthYear, birthMonth, birthDay, gender, callback) {
    client.connect(err => {
        if (err) throw err;
        const memberCounters = client.db("ASCA_DB").collection("memberCounters");
        const member = client.db("ASCA_DB").collection("member");
        const dateTime = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
    
        memberCounters.find({ _id: "memberID" }).toArray(function(err, result) {
            if (err) throw err;
            var memberID = result[0].sequence_value + 1;
            console.log("count=" + memberID);
    
            member.insertOne({ memberID: memberID, 
                             familyName: familyName, 
                              givenName: givenName,
                                  email: email,
                               password: password,
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

module.exports = {
    emailExist,
    createMember
}