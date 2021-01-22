let http = require( "http" );
let fs = require( "fs" );
let url = require( "url" );
let querystring = require( "querystring" );
let memberController = require( "./controllers/memberController" );
let formidable = require( "formidable" );
let friendsController = require( "./controllers/friendsController" );

http.createServer( function( request, response ) {
	let params = url.parse( request.url, true ).query; // parse將字符串轉成對象，request.url = "/?email=tong"， true表示params是{ email:"tong" }， false表示params是 email=tong
	let action = url.parse( request.url, true ).pathname;
	let post = "";
	
	// console.log("===============	Request URL		==============="); // 帶有參數的GET會顯示出來
	// console.log("帶有參數的GET會顯示出來: " + request.url);
	// console.log("===============		action		===============");
	// console.log("帶有參數的GET不會顯示: " + action); // 帶有參數的GET不會顯示

	/* ************************************************
	*					AJAX POST					  *
	************************************************ */
	request.on( "data", function( chunk ) {
		post += chunk;
	});

	request.on( "end", function() {
		if ( request.url === "/register" ) {
			post = querystring.parse( post );

			console.log( post.familyName );
			console.log( post.givenName );
			console.log( post.email );
			console.log( post.password );
			console.log( post.yearOfBirth );
			console.log( post.monthOfBirth );
			console.log( post.dayOfBirth );
			console.log( post.gender );

			memberController.createMember( post.familyName,
									 	   post.givenName,
									 	   post.email,
									 	   post.password,
									 	   post.yearOfBirth,
									 	   post.monthOfBirth,
									 	   post.dayOfBirth,
									 	   post.gender,
									 function() {
										response.writeHead( 200, { "Content-Type": "application/json" } );
										response.write( JSON.stringify( { createMember: "success" } ) );
										response.end();
			});
		} else if ( request.url === "/logIn" ) {
			post = querystring.parse( post );

			memberController.logInMember( post.email, post.password, function( message ) {
				// 判斷回傳的參數, message=emailIncorrect, message=passwordIncorrect, 都不是代表是一個token
				if ( message == "emailIncorrect" ) {
					response.writeHead( 200, { "Content-Type": "application/json" } );
					response.write( JSON.stringify( { authorization: "emailIncorrect" } ) );
				} else if ( message == "passwordIncorrect" ) {
					response.writeHead( 200, { "Content-Type": "application/json" });
					response.write( JSON.stringify( { authorization: "passwordIncorrect" } ) );
				} else {
					// 發給Client token
					response.writeHead( 200, { "Content-Type": "application/json" } );
					response.write( JSON.stringify( { authorization: message } ) );
				}
				response.end();
			});
		} else if ( request.url === "/logInWithToken" ) {
			const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
			memberController.logInWithTokenMember( token, ( message ) => {
				// 回傳給Client
				if ( message == "true" ) {
					response.writeHead( 200, { "Content-Type": "application/json" } );
					response.write( JSON.stringify( { authorization: message } ) );
					response.end();
				} else if ( message == "false" ) {
					response.writeHead( 200, { "Content-Type": "application/json" } );
					response.write( JSON.stringify( { authorization: message } ) );
					response.end();
				}
			});
		} else if ( request.url === "/getProfileData" ) {
			const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
			memberController.getProfileData( token, ( profileData ) => {
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { profileData: profileData } ) );
				response.end();
			});
		}
	});

	/* ************************************************
	*	                Form Data                     *
	************************************************ */
	if ( request.url == "/updateProfile" && request.method.toLowerCase() === "post" ) {

        // 實例化一個傳入表單
        let form = formidable.IncomingForm();
        // 設置文件存儲目錄
        form.uploadDir = "./uploadDir";
        // 解析傳入數據
        form.parse( request, ( err, fields, files ) => {
			if ( err ) throw err;
			
			/*
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
			console.log("-----------------	Image Information	-------------------");
			console.log("files photo : " + files.avatar);
            console.log("files photo name: " + files.avatar.name);
            console.log("files photo type: " + files.avatar.type);
			console.log("files photo size: " + files.avatar.size);
			console.log("-----------------	Image Information End	-------------------");
			*/			

			memberController.updateProfileMember( fields.token, 
												  fields.familyName,
												  fields.givenName,
												  fields.yearOfBirth,
												  fields.monthOfBirth,
												  fields.dayOfBirth,
												  fields.gender,
												  fields.currentCity,
												  fields.hometown,
												  fields.telephoneAreaCode,
												  fields.telephoneNumber,
												  fields.mobileNumber,
												  fields.facebook,
												   files.avatar,
												  ( message ) => {
													if ( message == "updateProfileSuccess" ) {
														response.writeHead( 200, { "Content-Type": "application/json" } );
														response.write( JSON.stringify( { updateProfile: message } ) );
														response.end();
													} else {
														sendFileContent( response, "views/errorView/error.html", "text/html" );
													}
												  });
			
		});
	}

	/* ************************************************
	*						URL 				      *
	************************************************ */
	if ( request.url === "/index" ) {
		sendFileContent( response, "views/index.html", "text/html" );
	} else if ( request.url === "/" ) {
		sendFileContent( response, "views/index.html", "text/html" );
	} else if ( request.url === "/signUp" ) {
		sendFileContent( response, "views/signUp.html", "text/html" );
	} else if ( action === "/signUp/check" ) { // action 只會判斷網域後面的URL，?後面帶參數不需要考慮
		checkEmail( response, params.email );
		console.log( "客戶端---註冊程序檢查email是否能使用: " + params.email );
	} else if ( request.url === "/register" ) {
		console.log( "客戶端---註冊成為會員" );
	} else if ( request.url === "/logIn" ) {
		console.log( "會員---要登入但沒鑰匙，驗證完會發給會員鑰匙" );
	} else if ( request.url === "/logInWithToken" ) {
		console.log( "會員---帶著鑰匙來了 (token)" );
	} else if ( request.url === "/asca" ) {
		console.log( "會員---正常登入，準備進入主要頁面" );
		sendFileContent( response, "views/asca.html", "text/html" );
	} else if ( request.url === "/updateProfile" ) {
		console.log( "會員---要修改資料" );
	} else if ( request.url === "/getProfileData" ) {
		console.log( "會員---需要個人資料" );
	} else if ( action === "/addNewFriend" ) { // action 只會判斷網域後面的URL，?後面帶參數不需要考慮
		console.log( "會員---要新增好友" );
		console.log("addNewFriend email: " + params.newFriendEmail);
		console.log("addNewFriend authorization: " + params.authorization);
		friendsController.addNewFriendsToMyself( params.authorization, params.newFriendEmail );
	} else if ( /^\/[a-zA-Z0-9\/]*.js$/.test( request.url.toString() )) {
		sendFileContent( response, request.url.toString().substring(1), "text/javascript" );
		console.log("Response File: " + request.url.toString().substring(1) + " .js");
	} else if ( /^\/[a-zA-Z0-9\/]*.css$/.test( request.url.toString() )) {
		sendFileContent( response, request.url.toString().substring(1), "text/css" );
		console.log( "Response File: " + request.url.toString().substring(1) + ".css" );
	} else if ( /^\/[a-zA-Z0-9\/]*.png$/.test( request.url.toString() )) {
		sendFileContent( response, request.url.toString().substring(1), "text/png" );
		console.log( "Response File: " + request.url.toString().substring(1) + ".png" );
	} else {
		console.log( "找不到對應的 --- Requested: " + request.url );
		response.end();
	}
}).listen( 8888 );console.log( "Server running at: http://127.0.0.1:8888/ \nNow time: " + new Date() );

/* ************************************************
 *                     Method                     *
 ************************************************ */
function sendFileContent( response, fileName, contentType ) {
	fs.readFile( fileName, function( err, data ) {
		if( err ) {
			response.writeHead( 404 );
			response.write( "Not Found!" );
		} else {
			response.writeHead( 200, { "Content-Type": contentType } );
			response.write( data );
		}
		response.end();
	});
}

function checkEmail( response, email ) {
	if ( memberController.emailExist( email ) ) { 
		response.writeHead( 200, { "Content-Type": "application/json" } );
		response.write( JSON.stringify( { emailAvailable: "false" } ) ); // 如果電子郵件已經存在，就給 false 不能使用 
	} else {
		response.writeHead( 200, { "Content-Type": "application/json" } );
		response.write( JSON.stringify( { emailAvailable: "true" } ) );
	}
	response.end();
}