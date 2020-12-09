var http = require("http");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
var memberContr = require("./controllers/memberController");
var formidable = require("formidable");


http.createServer(function(request, response) {
	let params = url.parse(request.url, true).query; // parse將字符串轉成對象，request.url = "/?email=tong"， true表示params是{ email:"tong" }， false表示params是 email=tong
	let action = url.parse(request.url, true).pathname;
	let post = "";
	
	console.log("===============	Request URL	==============="); // 帶有參數的GET會顯示出來
	console.log("帶有參數的GET會顯示出來: " + request.url);
	console.log("===============	action	===============");
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
			console.log(post.bYear);
			console.log(post.bMonth);
			console.log(post.bDay);
			console.log(post.gender);

			memberContr.createMember(post.familyName,
									 post.givenName,
									 post.email,
									 post.password,
									 post.bYear,
									 post.bMonth,
									 post.bDay,
									 post.gender,
									 function () {
										console.log("資料存入資料庫");
										response.writeHead(200, { "Content-Type": "application/json" });
										response.write(JSON.stringify({ createMember: "success" }));
										response.end();
			});
			
		} else if (request.url === "/logIn") {
			console.log("===============	logIn	===============");
			console.log("POST 請求: " + post + " 驗證.....");

			post = querystring.parse(post);
			console.log("email: " + post.email + "\n" + "password: " + post.password);

			memberContr.logInMember(post.email, post.password, function(message) {
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
			console.log("===============	logInWithToken	===============");
			console.log("POST 請求: " + post + " 驗證.....");
			
			const token = request.headers["authorization"].replace("Bearer ", "");
			memberContr.logInWithTokenMember(token, (message) => {
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
		}
	});

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
		console.log("客戶端註冊檢查email是否能使用: " + params.email);

	} else if (request.url === "/register") {
		console.log("客戶端註冊成為會員");

	} else if (request.url === "/logIn") {
		console.log("會員要登入但沒鑰匙，驗證完會發給會員鑰匙");

	} else if (request.url === "/logInWithToken") {
		console.log("會員帶著鑰匙來了 (token)");

	} else if (request.url === "/asca") {
		// sendFileContent(response, "views/profile.html", "text/html");
		sendFileContent(response, "views/asca.html", "text/html");

	} else if (request.url === "/updateProfile") {
		console.log("使用者要修改資料");

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
            console.log("fields familyName: " + fields.familyName);
            console.log("fields givenName: " + fields.givenName);
            console.log("fields gender: " + fields.gender);
            
            console.log("-----------------Image Information-------------------");
            console.log("files photo name: " + files.uploadAvatar.name);
            console.log("files photo type: " + files.uploadAvatar.type);
			console.log("files photo size: " + files.uploadAvatar.size);
		});
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
	if (memberContr.emailExist(email)) { 
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "false" })); // 如果電子郵件已經存在，就給 false 不能使用 

	} else {
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "true" }));

	}
	response.end();
}