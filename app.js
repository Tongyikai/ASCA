let http = require("http");
let fs = require("fs");
let url = require("url");
let querystring = require("querystring");
let memberController = require("./controllers/memberController");
let formidable = require("formidable");


http.createServer(function(request, response) {
	let params = url.parse(request.url, true).query; // parse將字符串轉成對象，request.url = "/?email=tong"， true表示params是{ email:"tong" }， false表示params是 email=tong
	let action = url.parse(request.url, true).pathname;
	let post = "";
	
	console.log("===============	Request URL		==============="); // 帶有參數的GET會顯示出來
	console.log("帶有參數的GET會顯示出來: " + request.url);
	console.log("===============		action		===============");
	console.log("帶有參數的GET不會顯示: " + action); // 帶有參數的GET不會顯示

	/* ************************************************
	*	AJAX POST
	************************************************ */
	request.on("data", function(chunk) {
		post += chunk;
	});

	request.on("end", function() {
		if (request.url === "/register") {
			console.log("===============	register	===============");
			console.log("POST 請求: " + post + " 把資料寫進資料庫.....");
			
			post = querystring.parse(post);

			console.log(post.familyName);
			console.log(post.givenName);
			console.log(post.email);
			console.log(post.password);
			console.log(post.yearOfBirth);
			console.log(post.monthOfBirth);
			console.log(post.dayOfBirth);
			console.log(post.gender);

			memberController.createMember(post.familyName,
									 post.givenName,
									 post.email,
									 post.password,
									 post.yearOfBirth,
									 post.monthOfBirth,
									 post.dayOfBirth,
									 post.gender,
									 function () {
										console.log("資料存入資料庫");
										response.writeHead(200, { "Content-Type": "application/json" });
										response.write(JSON.stringify({ createMember: "success" }));
										response.end();
			});
			
		} else if (request.url === "/logIn") {
			console.log("===============	logIn		===============");
			console.log("POST 請求: " + post + " 驗證.....");

			post = querystring.parse(post);
			console.log("email: " + post.email + "\n" + "password: " + post.password);

			memberController.logInMember(post.email, post.password, function(message) {
				// 判斷回傳的參數, message=emailIncorrect, message=passwordIncorrect, 都不是代表是一個token
				if (message == "emailIncorrect") {
					response.writeHead(200, { "Content-Type": "application/json" });
					response.write(JSON.stringify({ authorization: "emailIncorrect" }));

				} else if (message == "passwordIncorrect") {
					response.writeHead(200, { "Content-Type": "application/json" });
					response.write(JSON.stringify({ authorization: "passwordIncorrect" }));

				} else {
					console.log("發給Client token: " + message);
					response.writeHead(200, { "Content-Type": "application/json" });
					response.write(JSON.stringify({ authorization: message }));

				}
				response.end();
			});

		} else if (request.url === "/logInWithToken") {
			console.log("===============	logInWithToken		===============");
			console.log("POST 請求: " + post + " 驗證.....");
			
			const token = request.headers["authorization"].replace("Bearer ", "");
			memberController.logInWithTokenMember(token, (message) => {
				// 回傳給Client
				if (message == "true") {
					response.writeHead(200, { "Content-Type": "application/json" });
					response.write(JSON.stringify({ authorization: message }));
					response.end();

				} else if (message == "false") {
					response.writeHead(200, { "Content-Type": "application/json" });
					response.write(JSON.stringify({ authorization: message }));
					response.end();

				}
			});

		} else if (request.url === "/getProfileData") {
			console.log("===============	getProfileData		===============");
			const token = request.headers["authorization"].replace("Bearer ", "");
			memberController.getProfileData(token, (avatarBase64) => {

				response.writeHead(200, { "Content-Type": "application/json" });
				response.write(JSON.stringify({ avatar: avatarBase64 }));
				response.end();
			});
		}
	});

	/* ************************************************
	*	Form Data 
	************************************************ */
	if (request.url == "/updateProfile" && request.method.toLowerCase() === "post") {
		console.log("===============	updateProfile	===============");

        // 實例化一個傳入表單
        let form = formidable.IncomingForm();
        // 設置文件存儲目錄
        form.uploadDir = "./uploadDir";
        
        // 解析傳入數據
        form.parse(request, (err, fields, files) => {
			if (err) throw err;
			
			console.log("fields token: " + fields.token);
            console.log("fields familyName: " + fields.familyName);
            console.log("fields givenName: " + fields.givenName);
			console.log("fields year: " + fields.year);
			console.log("fields month: " + fields.month);
			console.log("fields day: " + fields.day);
			console.log("fields gender: " + fields.gender);
			console.log("fields currentCity: " + fields.currentCity);
			console.log("fields hometown: " + fields.hometown);
			console.log("fields telephoneAreaCode: " + fields.telephoneAreaCode);
			console.log("fields telephoneNumber: " + fields.telephoneNumber);
			console.log("fields mobileNumber: " + fields.mobileNumber);
			console.log("fields facebook: " + fields.facebook);
            console.log("-----------------Image Information-------------------");
            console.log("files photo name: " + files.uploadAvatar.name);
            console.log("files photo type: " + files.uploadAvatar.type);
			console.log("files photo size: " + files.uploadAvatar.size);
			
			memberController.updateProfileMember(files.uploadAvatar);
			
			sendFileContent(response, "views/back.html", "text/html");
		});
	}

	/* ************************************************
	*	URL 
	************************************************ */
	if (request.url === "/index") {
		sendFileContent(response, "views/index.html", "text/html");

	} else if (request.url === "/") {
		sendFileContent(response, "views/index.html", "text/html");
		
	} else if (request.url === "/signUp") {
		sendFileContent(response, "views/signUp.html", "text/html");

	} else if (action === "/signUp/check") { // action 只要判斷網域後面的URL，後面帶參數不需要考慮
		checkEmail(response, params.email);
		console.log("客戶端---註冊程序檢查email是否能使用: " + params.email);

	} else if (request.url === "/register") {
		console.log("客戶端---註冊成為會員");

	} else if (request.url === "/logIn") {
		console.log("會員---要登入但沒鑰匙，驗證完會發給會員鑰匙");

	} else if (request.url === "/logInWithToken") {
		console.log("會員---帶著鑰匙來了 (token)");

	} else if (request.url === "/asca") {
		console.log("會員---正常登入，準備進入主要頁面");
		sendFileContent(response, "views/asca.html", "text/html");

	} else if (request.url === "/updateProfile") {
		console.log("會員---要修改資料");

	} else if (request.url === "/getProfileData") {
		console.log("會員---需要個人資料");

	} else if (/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())) {
		sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		console.log("Response File: " + request.url.toString().substring(1) + " .js");

	} else if (/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())) {
		sendFileContent(response, request.url.toString().substring(1), "text/css");
		console.log("Response File: " + request.url.toString().substring(1) + ".css");

	} else if (/^\/[a-zA-Z0-9\/]*.png$/.test(request.url.toString())) {
		sendFileContent(response, request.url.toString().substring(1), "text/png");
		console.log("Response File: " + request.url.toString().substring(1) + ".png");

	} else {
		console.log("找不到對應的 --- Requested URL is: " + request.url);
		response.end();
	}

}).listen(8888);console.log("Server running at: http://127.0.0.1:8888/ \nNow time: " + new Date());

/* ************************************************
 * Method
 ************************************************* */
function sendFileContent(response, fileName, contentType) {
	fs.readFile(fileName, function(err, data) {
		if(err) {
			response.writeHead(404);
			response.write("Not Found!");

		} else {
			response.writeHead(200, { "Content-Type": contentType });
			response.write(data);

		}
		response.end();
	});
}

function checkEmail(response, email) {
	if (memberController.emailExist(email)) { 
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "false" })); // 如果電子郵件已經存在，就給 false 不能使用 

	} else {
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "true" }));

	}
	response.end();
}