var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");
var path = require("path");

module.exports = function getBase64Code(uploadAvatar) { // 最終回傳 Base64 code
    var fx = "";
    saveUploadAvatar(uploadAvatar, (newPath) => {
        imageBase64(newPath, (imageBase64) => {
            imagePrefix(imageBase64, (baseCode) => {
                fx += baseCode;
            });
        });
    });
    return fx;
}

// Client 上傳的圖片暫存在 uploadDir 文件夾
function saveUploadAvatar(uploadAvatar, callback) {
    let name = "i";
    let extName = path.extname(uploadAvatar.name);
    let oldPath = uploadAvatar.path;
    let newPath = "uploadDir/" + name + extName;
    fs.rename(oldPath, newPath, (err) => {
        if (!err) {
            console.log("Client 傳來的圖片 儲存在 uploadDir 文件夾");
        } else {
            throw err;
        }
    });
    // uploadDir文件夾的，圖片轉成Base64
    // imageBase64(newPath);
    callback(newPath);
}

function imageBase64(fileURL, callback) {
    let imageData = fs.readFileSync("./" + fileURL);
    let imageBase64 = imageData.toString('base64');
    // imagePrefix(imageBase64);
    callback(imageBase64);
}

function imagePrefix(base64code, callback) {
    var imagePrefix = "data:image/jpeg;base64,";
    var base64 = imagePrefix + base64code;
    callback(base64);
}