var fs = require("fs");

function writeJSON(path, newData) {
    fs.readFile(path, function(err, fileData) { //先將原本的json檔讀出來
        if (err) {
            return console.error(err);
        }

        var data = fileData.toString(); //將二進制數據轉換為字串符
        data = JSON.parse(data); //將字串符轉為 json 對象

        data.EmailList.push(newData);

        var str = JSON.stringify(data); //因為寫入文件 json 只認識字符串或二進制數 需要將json對象轉換成字符串
        fs.writeFile(path, str, function(err) {
            if (err) {
                console.log(err);
            }
            console.log("Add data to " + path);
        });
    });
}

module.exports = {
    writeJSON
}