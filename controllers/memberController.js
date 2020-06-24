/*
Create Operations
Read Operations
Update Operations
Delete Operations
*/

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://testAdmin:testAdmin123@localhost:27017/ASCA_DB";
const client = new MongoClient(uri, { useUnifiedTopology: true });

// userInfo = {
//     id = "00",
//     familyName = "00",
//     givenName = "00",
//     email = "00",
//     password = "00",
//     birthYear = "00",
//     birthMonth = "00",
//     birthDay = "00",
//     gender = "00"
// }

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
                    
                    client.close();
                    callback();
                });
            });
        });
    });
    console.log("createMember finish.");
}

module.exports = {
    createMember
}