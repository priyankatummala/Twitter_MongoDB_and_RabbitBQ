var ejs = require("ejs");
//var mysql = require('./mysql');
var path=require("path");
var findHashtags = require('find-hashtags');
var response="NULL";
var NumTweets=0;
var NumFollowers=0;
var NumFollowing=0;
var alltweets="NULL";
var fullname;
var searchName="NULL";

var mongo = require('../services/mongo'); 
var mongoURL = "mongodb://localhost:27017/twitter"; 
var mongodb = require('mongodb');
var users, tweets;
var assert = require('assert');
//var bcrypt = require('bcrypt');
//var salt = bcrypt.genSaltSync(10);
var mongoSessionConnectURL = "mongodb://localhost:27017/twitter"; 
var expressSession = require("express-session"); 
var mongoStore = require("connect-mongo")(expressSession); 
//var mongo = require("./routes/mongo");  //Database configuration file 
var express = require('express');

var app = express();

var users, tweets;


mongo.connect(mongoURL, function(){ 
	console.log('Connected to mongo at: ' + mongoURL); 
	users = mongo.collection('users');
	tweets = mongo.collection('tweets');
	
});


function handle_request(msg, callback){

	var res = {};
	console.log("In handle request:"+ msg.username);

	if(msg.username == "test@email.com" && msg.password =="test"){
		res.code = "200";
		res.value = "Succes Login";

	}
	else{
		res.code = "401";
		res.value = "Failed Login";
	}
	callback(null, res);
}

exports.handle_request = handle_request;



function signin(req, msg, callback){

	var res = {};
	console.log("In signin request:"+ msg.username);

	var username = msg.username; 
	var password = msg.password; 
	console.log(username + password);
	var json_responses; 
	//password = bcrypt.hashSync(password, salt);
	
	//mongo.connect(mongoURL, function(){ 
	console.log('signin Connected to mongo at: ' + mongoURL); 
	//mongo.connect(mongoURL, function(){ 
		console.log('Connected to mongo at: ' + mongoURL); 
		users = mongo.collection('users');
		tweets = mongo.collection('tweets');
		users.findOne({username: username, password:password}, 
				function(err, user){ 
			    if (user) { 
					// This way subsequent requests will know the user is logged in.
					console.log("success");
					console.log(user);
					res.code = "200";
					res.value = "Succes Login";
					//req.session.username = user.username; 

					callback(req, res);

				} 
				else { 
					console.log("fail");
					res.code = "401";
					res.value = "Failed Login";
					callback(req, res); 
				} 
		}); 
	//}); 





}

exports.signin = signin;

function loadpage(req, msg, callback){
	
	console.log("in load page loginjs");
	//mongo.connect(mongoURL, function(){ 
		console.log('Connected to mongo at: ' + mongoURL); 
		//mongo.collection('users');
		users.findOne({username: msg.username}, 
					function(err, user){ if (user) { 
						// This way subsequent requests will know the user is logged in.
						console.log("loadpage res"+user);
						res=user;
						callback(req, res);
						
						} 
					else { 
						console.log("fail");
						res = {"statusCode" : 401}; 
						callback(req, res); 
						} 
				}); 
		//	}); 

};

exports.loadpage = loadpage;


function followSuggestion(req, msg, callback){
	
	console.log("in follow suggestion");
	var followingArr=new Array();
	var response;
	//mongo.connect(mongoURL, function(){ 
		console.log('Connected to mongo at: ' + mongoURL); 
		
		//var users = mongo.collection('users');
		//var tweet=mongo.collection('tweets');
		
		users.findOne({username : msg.username}, 
				function (err, user){
				if (user){
					console.log("fetched suggest");
					for (i =0; i< user.following.length;i++)
					{
						followingArr[i]= user.following[i].username;
								
					}
					followingArr[user.following.length]=msg.username;
					//followingArr=JSON.stringify(followingArr);
					console.log("following2: "+followingArr);
					users.find({username: {$nin : followingArr}}, {username:1, firstname: 1, lastname:1, tweets:1, thandle:1}).limit(2).toArray(function(err, docs) {
				          
						
						console.log(docs);
						response = JSON.stringify(docs);
			         
			          console.log("final resposne"+response);
			          callback(req, response);
			          
						
			          
			        });
				}
			
		});
		
		
		//});
};

exports.followSuggestion = followSuggestion;


function fetchTweets(req, msg, callback){
	
		var followingArr=new Array();
		var response;
		//mongo.connect(mongoURL, function(){ 
			//console.log('Connected to mongo at: ' + mongoURL); 
			
			//var users = mongo.collection('users');
			//var tweet=mongo.collection('tweets');
			console.log("in fetch tweets");
			users.findOne({username : msg.username}, 
					function (err, user){
				console.log("fetch tweets fetched user");
					if (user){
						for (i =0; i< user.following.length;i++)
						{
							followingArr[i]= user.following[i].username;
									
						}
						followingArr[user.following.length]=msg.username;
						//followingArr=JSON.stringify(followingArr);
						//console.log("following2: "+followingArr);
						tweets.find({username: {$in : followingArr}, "tweets.tweet" : {$exists : true}}, {_id:0, firstname: 1, lastname:1, tweets:1, thandle:1}).toArray(function(err, docs) {
					        console.log("docs length "+docs.length);
					        console.log(JSON.stringify(docs));
					        var str="This is #MyFirstTweet";
					        str=str.replace('#MyFirstTweet', '<a href=\"#\">#MyFirstTweet</a>');
					        console.log(str);
					       for (t=0; t<docs.length; t++){
					        	console.log("docs "+t);
								var hasharray=[];
								//console.log("docs.tweets"+docs[t].tweets);
								
								var inTweet= new Array(); 
								inTweet = docs[t].tweets;
								//console.log(inTweet);
								//console.log("inTweet.length"+inTweet.length);
								for(var i=0;i<inTweet.length; i++)
									{
										console.log("in Tweet"+inTweet[i].tweet);
										hasharray=findHashtags(inTweet[i].tweet);
										console.log("hashtags in tweet"+inTweet[i] +" are :"+hasharray);
										
										for(var j=0;j<hasharray.length;j++)
											{
												
												var str=(inTweet[i].tweet).toString();
												var str2=str.substring(str.indexOf('#'),(str.indexOf('#')+hasharray[j].length+1));
												var str1=str.toLowerCase();
												console.log("updating tweet"+str);
												console.log("replacing"+'#'+hasharray[j]);
												console.log("replacing with "+"<a href=\"#\">"+'#'+hasharray[j]+"</a>");
												var replc = '#'+hasharray[j].toString();
												console.log(replc);
												var repwith = "<a href=\"#\">"+str2+"</a>";
												var updtweet=str1.replace(replc, repwith);
														console.log("updated "+updtweet);
														docs[t].tweets[i].tweet=updtweet;	
											}
										
										
									}
								
							}
					       	response = JSON.stringify(docs);
							
							callback(req, response);
				        });
					}
				
			});
			
			
			//}); 
		
		
	};
	

	exports.fetchTweets = fetchTweets;

	exports.searchmembers=function(req, msg, callback){
		//var viewpath=path.join(__dirname, '../views', 'search.ejs');
		//console.log(viewpath);
		searchName=msg.searchTerm;
		console.log("search term is"+searchName);
		var res={};
		res.value="Success";
		callback(req, res);
		
		
	};
	
	exports.registerTweet=function(req, msg, callback){
		
		var tweet=msg.tweet;
		console.log("in registerTweet " +tweet);
		var d=new Date();
		var res = {}
			
		//mongo.connect(mongoURL, function(){ 
			console.log('Connected to mongo at: ' + mongoURL); 
					
			//		var users = mongo.collection('users');
				//	var tweets = mongo.collection('tweets');
					users.findOne({username : msg.username},
							function (err, user){
						
						tweets.update({username: msg.username},{$push : {tweets : {$each : [{tweet : msg.tweet, date : d}], $position : 0}}},
								function (err, nTweet){
							if(nTweet){
								console.log("Tweet inserted");
								res.value="Success";
								callback(req, res);
							}
						});
						
					});
				//});
		
	};

	exports.fetchfollowing=function(req, msg, callback){
		
		var followingArr=new Array();
		var response;
		//mongo.connect(mongoURL, function(){ 
			console.log('Connected to mongo at: ' + mongoURL); 
			
			//var users = mongo.collection('users');
			//var tweet=mongo.collection('tweets');
			
			users.findOne({username : msg.username}, 
					function (err, user){
					if (user){
						
						for (i =0; i< user.following.length;i++)
						{
							followingArr[i]= user.following[i].username;
									
						}
						//followerArr[user.followers.length]=req.session.username;
						//followingArr=JSON.stringify(followingArr);
						//console.log("following2: "+followingArr);
						users.find({username: {$in : followingArr}}, {username:1, firstname: 1, lastname:1, tweets:1, thandle:1}).toArray(function(err, docs) {
					          
							
							console.log(docs);
							response = JSON.stringify(docs);
				         
				          console.log("following"+response);
				          callback(req,response);
				          
							
				          
				        });
					}
				
			//});
			
			
			});

	};
	
	exports.fetchfollowers=function(req, msg, callback){
		
		var followerArr=new Array();
		var response;
		///mongo.connect(mongoURL, function(){ 
			console.log('Connected to mongo at: ' + mongoURL); 
			
			//var users = mongo.collection('users');
			//var tweet=mongo.collection('tweets');
			
			users.findOne({username : msg.username}, 
					function (err, user){
					if (user){
						
						for (i =0; i< user.followers.length;i++)
						{
							followerArr[i]= user.followers[i].username;
									
						}
						//followerArr[user.followers.length]=req.session.username;
						//followingArr=JSON.stringify(followingArr);
						//console.log("following2: "+followingArr);
						users.find({username: {$in : followerArr}}, {username:1, firstname: 1, lastname:1, tweets:1, thandle:1}).toArray(function(err, docs) {
					          
							
							console.log(docs);
							response = JSON.stringify(docs);
				         
				          console.log("followers"+response);
				          callback(req,response);
				          
							
				          
				        });
					}
				
			});
			
			
			//});

		
	};
	
	exports.profileUpdate=function(req, msg, callback){
		console.log("in prof update");
		var str=msg.bday;
		var bday=str.substring(0,10);
		console.log(bday);
		var response={};
		
		//mongo.connect(mongoURL, function(){ 
		//console.log('Connected to mongo at: ' + mongoURL); 
					
			//	var users = mongo.collection('users');
			users.findOne({username :msg.username},
							function (err, user){
						
						users.update({username: msg.username},{$set : {birthday : bday, location : msg.location, phone : msg.contact}},
								function (err, upd){
							if(upd){
								console.log("user updated");
								
								response.value = "success";
								callback(req, response);
							}
						});
						
					});
				//});
				
		
	};
	
	exports.searchTweets=function(req, msg, callback){
		
		var viewpath=path.join(__dirname, './views', 'search.ejs');
		console.log(viewpath);
		
		
		ejs.renderFile(viewpath,function(err, result) {
			console.log("Hello");
			// render on success
			if (!err) {
				console.log("Not Error");
				
				callback(req, result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);
			}
		});


		
	};
	
	exports.popTweets=function(req,msg,callback){
		
		var response;
		//mongo.connect(mongoURL, function(){ 
			console.log('Connected to mongo at: ' + mongoURL); 
			//var coll = mongo.collection('tweets'); 
			console.log(searchName);
			tweets.find({$text : {$search : searchName}}).toArray(function(err, docs) {
		          
				
			
				response = JSON.stringify(docs);
	         
				console.log("searched"+response);
	          callback(req, response);
	          
				
	          
	        });
			//}); 

		
	};
	
	
	exports.aftersignup = function(req, msg, callback){
		console.log("in signup");
		var response={};
		//password = bcrypt.hashSync(password, salt);
		
		
		//mongo.connect(mongoURL, function(){ 
			console.log('Connected to mongo at: ' + mongoURL); 
			//var users = mongo.collection('users');
			//var tweets = mongo.collection('tweets');
			users.findOne({username: msg.username}, 
					function(err, user){ if (user) { 
						// This way subsequent requests will know the user is logged in.
						console.log("user email exists");
						console.log(user);
						response.value = "User email exists";
						callback(req, response);
						} 
					}); 
			users.findOne({thandle: msg.thandle}, 
					function(err, user){ if (user) { 
						// This way subsequent requests will know the user is logged in.
						console.log("success");
						console.log(user);
						response.value = "Twitter handle exists"
						callback(req, response);
						} 
					}); 
		
			
			users.insert({username : msg.username, firstname : msg.firstname, lastname : msg.lastname, password : msg.password, thandle : msg.thandle, birthday : "", location : "", phone : "", followers : [], following : []}, 
						function(err, user){ if (user) { 
							// This way subsequent requests will know the user is logged in.
							console.log("user created");
							//console.log(user);
							tweets.insert({username : msg.username, firstname : msg.firstname, lastname : msg.lastname, thandle : msg.thandle, tweets : [] }, 
									function(err, user){ if (user) { 
										// This way subsequent requests will know the user is logged in.
										console.log("user created");
										console.log(user);
										
										
										response.value = "Success";
										callback(req,response);
										} 
									else { 
										console.log("fail");
										json_responses = {"statusCode" : 401}; 
										callback(req, json_responses); 
										} 
							}); 

							
							//req.session.username = user.username; 
							//json_responses = {"statusCode" : 200}; 
							//callback(req,json_responses);
							} 
						else { 
							console.log("fail");
							json_responses = {"statusCode" : 401}; 
							callback(req,json_responses);
							} 
				}); 
					
		//});  
		
	};