/*
Create Operations
Read Operations
Update Operations
Delete Operations
*/

var email = require('../public/json/email.json');
var jsonOperations = require("../public/scripts/jsonOperations");

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

function createMember(familyName, givenName, email, password, birthYear, birthMonth, birthDay, gender, callback) {
    client.connect(err => {
        if (err) throw err;
        const memberCounters = client.db("ASCA_DB").collection("memberCounters");
        const member = client.db("ASCA_DB").collection("member");
    
        memberCounters.find({ _id: "memberID" }).toArray(function(err, result) {
            if (err) throw err;
            var memberID = result[0].sequence_value + 1;
            console.log("count=" + memberID);
    
            member.insertOne({ memberID: memberID, 
                             familyName: familyName, 
                              givenName: givenName,
                                  email: email,
                               password: password,
                              birthYear: birthYear,
                             birthMonth: birthMonth,
                               birthDay: birthDay,
                                 gender: gender 
            }, function(err, res) { 
                if (err) throw err;
                console.log("insert success");
    
                memberCounters.updateOne({ _id: "memberID"}, {$set: { sequence_value: memberID }}, function(err, res) { 
                    if (err) throw err;
                    console.log("update success");
                    
                    jsonOperations.writeJSON("./public/json/email.json", { memberID: memberID, email: email });
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