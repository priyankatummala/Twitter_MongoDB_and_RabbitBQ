
/**
 * Module dependencies.
 */
var ejs=require("ejs");
var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path');

var mq_client = require('./rpc/client');

var app = express();
var assert = require('assert');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);


var mongoSessionConnectURL = "mongodb://localhost:27017/twitter"; 
var expressSession = require("express-session"); 
var mongoStore = require("connect-mongo")(expressSession); 
var mongo = require("./routes/mongo");  //Database configuration file 
var requestsession={};

app.use(expressSession({  
	secret: 'cmpe273_teststring',  
	resave: false,  //don't save session if unmodified  
	saveUninitialized: false, // don't create session until something stored  
	duration: 30 * 60 * 1000,     
	expires: new Date(Date.now() + 3600000),
	activeDuration: 5 * 60 * 1000,
	cookie: {maxAge: 10 * 60 * 1000},
	store: new mongoStore({   url: mongoSessionConnectURL 
})
}));
app.use(express.bodyParser());
app.use(express.cookieParser());


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


app.get('/users', user.list);
app.get('/', function(req,res){

	ejs.renderFile('./views/signin.ejs',function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
});

app.get('/home',function(req,res){

	ejs.renderFile('./views/successLogin.ejs',function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});

});
app.post('/signin',function(req,res){
	console.log("in /signin");
	console.log(req);
	var password = req.param("password");
	password = bcrypt.hashSync(password, salt);
		
	var msg_payload = {"type": "signin","username":req.param("username"),"password": password};
	var emailId=req.param("username");
	console.log("emailId is:"+emailId);
	
	mq_client.make_request('login_queue',msg_payload, function(err,results){
		console.log("results" + results);
		if(err){
			throw err;
			
		}
		else 
		{
			req.session.username=emailId;
			console.log(req.session.username);
			res.send(results);

		}  
	});

	//}
});


app.get('/loadPage', function(req,res){
	//home.loadPage(req, res);
	var msg_payload ={"type": "loadpage","username":req.session.username};
	mq_client.make_request('home_queue', msg_payload, function(err,results){
		console.log("load results" + results);
		if(err){
			throw err;
		}
		else 
		{

			res.send(results);

		}  
	});

});

app.get('/followSuggestion', function(req,res){
	
		var msg_payload ={"type": "followSuggestion","username":req.session.username};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});
		
		});

app.get('/fetchTweets', function(req,res){
	var msg_payload ={"type": "fetchTweets","username":req.session.username};
	mq_client.make_request('home_queue', msg_payload, function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{

			res.send(results);

		}  
	});

});

app.post('/searchmembers', function(req,res){
	var msg_payload ={"type": "searchmembers","username":req.session.username,"searchTerm":req.param("searchTerm")};
	mq_client.make_request('home_queue', msg_payload, function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{

			res.send(results);

		}  
	});

});

app.get('/searchTweets', function(req,res){
	console.log("insearch tweets");
	if(req.session.username){
		console.log("session valid");
		
		var viewpath=path.join(__dirname, './views', 'search.ejs');
		console.log(viewpath);
		
		
		ejs.renderFile(viewpath,function(err, result) {
			console.log("Hello");
			// render on success
			if (!err) {
				console.log("Not Error");
				
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);
			}
		});

		
	}
	else
		res.redirect('/');
	

});

app.post('/registerTweet',function(req,res){
	
	if(req.session.username){
		var msg_payload ={"type": "registerTweet","username":req.session.username, "tweet":req.param("tweet")};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});	
		
	}
	else
		res.redirect('/');
});

app.post('/retweet', function(req,res){
	
	if(req.session.username)
	{
		var msg_payload ={"type": "registerTweet","username":req.session.username, "tweet":req.param("tweet")};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});

	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}

});



app.post('/sessionChk', function(req,res){
	if(req.session.username)
	{
				var response = {};
				response.value="Success";
				res.send(response);
	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}
});

app.get('/profile',function(req,res){
	if(req.session.username)
	{
		console.log("in home.profile");
		
		var viewpath=path.join(__dirname, './views', 'profile.ejs');
		console.log(viewpath);
		ejs.renderFile(viewpath,function(err, result) {
			console.log("Hello");
			// render on success
			if (!err) {
				console.log("Not Error");
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);
			}
		});

	}//Session set when user Request our app via URL
	
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}
});

app.get('/logout', function (req,res){
	req.session.destroy();
	var viewpath=path.join(__dirname, './views', 'signin.ejs');
	console.log(viewpath);
	ejs.renderFile(viewpath,function(err, result) {
		console.log("Hello");
		// render on success
		if (!err) {
			console.log("Not Error");
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
});

app.get('/fetchfollowing', function(req,res){
	
	if(req.session.username)
	{
		var msg_payload ={"type": "fetchfollowing","username":req.session.username};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});

	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}

});



app.get('/fetchfollowers', function(req,res){
	if(req.session.username)
	{
		var msg_payload ={"type": "fetchfollowers","username":req.session.username};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});

	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}


});
app.post('/profileUpdate',function(req,res){
	if(req.session.username)
	{
		var msg_payload ={"type": "profileUpdate","username":req.session.username, "bday" :  req.param("bday"), "contact" : req.param("contact"), "location" : req.param("location")};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});

	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}
});

app.get('/searchTweets', function(req,res){
	
	if(req.session.username)
	{
		var msg_payload ={"type": "searchTweets"};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});

	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}

});

app.post('/popTweets', function(req,res){
	if(req.session.username){
		var msg_payload ={"type": "popTweets"};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});
	}
	else
	{
		console.log("homeloggingout")
		res.redirect('/');	
	}


});

app.post('/signup', function(req,res){

	ejs.renderFile('./views/signup.ejs',function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
	
});


app.post('/aftersignup', function(req,res){
	var password = req.param("password");
	password = bcrypt.hashSync(password, salt);
		var msg_payload ={"type": "aftersignup", "username" : req.param("uname"), "firstname" : req.param("Fname"), "lastname": req.param("Lname"), "password": password, "thandle":req.param("THandle")};
		mq_client.make_request('home_queue', msg_payload, function(err,results){
			console.log("signup result   "+results);
			if(err){
				throw err;
			}
			else 
			{

				res.send(results);

			}  
		});
	

});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
