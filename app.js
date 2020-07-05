var http = require("http");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
<<<<<<< HEAD

var emailContr = require("./public/scripts/emailController");

http.createServer(function(request, response) {
	var params = url.parse(request.url, true).query;//parse將字符串轉成對象，request.url = "/?email=tong"， true表示params是{ email:"tong" }， false表示params是 email=tong
	var action = url.parse(request.url, true).pathname;
	var post = "";
	
	console.log("Request URL: " + request.url);//帶有參數的GET會顯示出來
=======
var memberContr = require("./controllers/memberController");


http.createServer(function(request, response) {
	var params = url.parse(request.url, true).query; //parse將字符串轉成對象，request.url = "/?email=tong"， true表示params是{ email:"tong" }， false表示params是 email=tong
	var action = url.parse(request.url, true).pathname;
	var post = "";
	
	console.log("Request URL: " + request.url); //帶有參數的GET會顯示出來
>>>>>>> develop
	console.log("action: " + action);//帶有參數的GET不會顯示

	/* ************************************************
	*	POST
	************************************************ */
	request.on("data", function(chunk) {
		post += chunk;
	});

	request.on("end", function() {
		if (request.url === "/userRegister") {
<<<<<<< HEAD
			console.log("收到一個 POST 請求 " + post);
=======
			console.log("收到一個 POST 請求 " + post + " 把資料寫進資料庫....");
>>>>>>> develop
			
			post = querystring.parse(post);
			console.log(post.familyName);
			console.log(post.givenName);
			console.log(post.email);
			console.log(post.password);
			console.log(post.bYear);
			console.log(post.bMonth);
			console.log(post.bDay);
			console.log(post.gender);
<<<<<<< HEAD
=======

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
			console.log("收到一個 POST 請求 " + post);
			post = querystring.parse(post);
			console.log("PARSE POST 請求 " + post.email + "\n" + post.password);
			memberContr.logInMember(post.email, post.password, function() {
				console.log("準備回傳token");
			});
		}
	});

	/* ************************************************
	*	URL 
	************************************************ */
	if (request.url === "/index") {
<<<<<<< HEAD
		sendFileContent(response, "index.html", "text/html");

	} else if (request.url === "/") {
        sendFileContent(response, "index.html", "text/html");

	} else if (request.url === "/signUp") {
		sendFileContent(response, "signUp.html", "text/html");
=======
		sendFileContent(response, "views/index.html", "text/html");

	} else if (request.url === "/") {
        sendFileContent(response, "views/index.html", "text/html");

	} else if (request.url === "/signUp") {
		sendFileContent(response, "views/signUp.html", "text/html");
>>>>>>> develop

	} else if (action === "/signUp/check") { //action 只要判斷網域後面的URL，後面帶參數不需要考慮
		checkEmail(response, params.email);
		console.log("/signUp/check GET Request: " + params.email);

	} else if (request.url === "/userRegister") {
		console.log("Method:POST, Request: /userRegister " + post);

	} else if (request.url === "/logIn") {
		console.log("會員登入");

	} else if (/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())) {
		sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		console.log("Need File: Request --> " + request.url.toString().substring(1) + " .js");

	} else if (/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())) {
		sendFileContent(response, request.url.toString().substring(1), "text/css");
		console.log("Need File: Request --> " + request.url.toString().substring(1) + ".css");

	} else {
		console.log("找不到對應的 -- Requested URL is: " + request.url);
		response.end();
	}
	
}).listen(8888);
console.log("Server running at: http://127.0.0.1:8888/ \nNow time: " + new Date());

/* ************************************************
 * Method
 ************************************************* */
function sendFileContent(response, fileName, contentType) {
	fs.readFile(fileName, function(err, data) {
		if(err) {
			response.writeHead(404);
			response.write("Not Found!");

		} else {
<<<<<<< HEAD
			response.writeHead(200, {"Content-Type": contentType});
=======
			response.writeHead(200, { "Content-Type": contentType });
>>>>>>> develop
			response.write(data);

		}
		response.end();
	});
}

function checkEmail(response, email) {
<<<<<<< HEAD
	if (emailContr.searchExistEmail(email)) { 
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "false" }));//如果電子郵件已經存在，就給 false 不能使用 
=======
	if (memberContr.emailExist(email)) { 
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "false" })); //如果電子郵件已經存在，就給 false 不能使用 
>>>>>>> develop

	} else {
		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify({ emailAvailable: "true" }));
	}
	response.end();
}