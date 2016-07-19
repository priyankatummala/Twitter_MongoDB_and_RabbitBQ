
//super simple rpc server example
var amqp = require('amqp')
, util = require('util');

var login = require('./services/login')

var cnn = amqp.createConnection({host:'127.0.0.1'});



/*cnn.on('ready', function(){
	console.log("listening on login_queue");

	cnn.queue('login_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			if(message.type=="signin"){
				login.handle_request(message, function(err,res){
					
					//return index sent
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					});
				});
			}
			
		});
	});
	
	cnn.queue('following_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			login.handle_request(message, function(err,res){

				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
	
});

*/







cnn.on('ready', function(){
	console.log("listening on login_queue");

	cnn.queue('login_queue', function(req,res){
		req.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			console.log("login_queuse");
			if(message.type=="signin"){
				console.log("singin server");
				login.signin(req, message, function(req,res){
					console.log("published");
					
					//console.log(req.session.username);
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					});
				});
			}
			
			});
		});
	cnn.queue('home_queue', function(req,res){
		req.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			console.log("home_queue");
			if(message.type=="loadpage"){
				console.log("in server load page");
				
				login.loadpage(req, message, function(req,res){
					console.log("published load page");
					console.log(message.username);
					
					
					//console.log(req.session.username);
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="followSuggestion"){
				console.log("in server load page");
				
				login.followSuggestion(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="fetchTweets"){
				console.log("in server fetchTweets");
				
				login.fetchTweets(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="searchmembers"){
				//console.log("in server fetchTweets");
				
				login.searchmembers(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="registerTweet"){
				//console.log("in server fetchTweets");
				
				login.registerTweet(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="fetchfollowing"){
				//console.log("in server fetchTweets");
				
				login.fetchfollowing(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="fetchfollowers"){
				//console.log("in server fetchTweets");
				
				login.fetchfollowers(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="profileUpdate"){
				//console.log("in server fetchTweets");
				
				login.profileUpdate(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="searchTweets"){
				//console.log("in server fetchTweets");
				
				login.searchTweets(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="popTweets"){
				//console.log("in server fetchTweets");
				
				login.popTweets(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			else if(message.type=="aftersignup"){
				//console.log("in server fetchTweets");
				
				login.aftersignup(req, message, function(req,res){
					
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					}
					
					);
				});
			}
			
			});
		});
	
	cnn.queue('iii_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			login.handle_request(message, function(err,res){

				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
	
});