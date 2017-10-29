var players = {};
var points = [];
var world = {
	minx:0,
	miny:0,
	maxx:1000,
	maxy:1000,
	maxpoints:100
}
var colours =["lightred","cyan","forestgreen","fuchsia","orange","gold"];
var w = 500, h = 400;

function pointCreate(){
	return {
		x: Math.random()*(world.maxx-world.minx),
		y: Math.random()*(world.maxy-world.miny),
		colour: colours[Math.floor(Math.random()*(colours.length-1))],
	};
}
function pointsAdd(){
	if(Math.random()*100 > 80 && points.length < 50){
		var newpoint = pointCreate(), attempts = 0, valid = false;
		while(valid=false && attempts < 5){
			attempts++;
			valid = true;
			newpoint.x =  Math.random()*(world.maxx-world.minx);
			newpoint.y = Math.random()*(world.maxy-world.miny);
			for (var i in players) if (players.hasOwnProperty(i)) {
				if (Math.hypot(newpoint.x-players[i].x, newpoint.y-players[i].y) <= (players[i].radius + 20)){
					valid = false;
				}
			}
		}
		points.push(newpoint);
		io.sockets.emit('addPoint',newpoint);
	}
	if(points.length < 5)
		pointsAdd();
}

function playerCreate(name, colour){
	return {
		name: name,
		radius: 25,
		x: -100,
		y: -100,
		keys: {w: false, a: false, s: false, d: false},
		colour: colour,
		spawn: function(){
			this.radius = 25;
			this.x = Math.random()*(w-this.radius*2) + this.radius*2;
			this.y = Math.random()*(h-this.radius*2) + this.radius*2;
		},
		move: function(){
			if(this.y-1>world.miny) if(this.keys.w == true)this.y-=2;
			if(this.x-1>world.minx) if(this.keys.a == true)this.x-=2;
			if(this.y+1<world.maxy) if(this.keys.s == true)this.y+=2;
			if(this.x+1<world.maxx) if(this.keys.d == true)this.x+=2;
		},
	};
}
function toMass(radius){
	return Math.ceil(Math.PI*Math.pow(radius,2));
}
function toRadius(mass){
	return Math.sqrt(mass/Math.PI);
}

var express = require('express');  
var app = express();  
var path = require('path');
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));  
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/index.html');
});
server.listen(8080);  
io.sockets.on('connection', function(client) {
	init();
	client.on('disconnect', function() {
		console.log("Player left: ", client.id);
		delete players[client.id];
	});
	client.on('join', function(name, colour) {
		console.log("Player joined: ",client.id);
		players[client.id] = playerCreate(name,colour);
		players[client.id].spawn();
		client.emit('id', players[client.id], points, players);
	});
	client.on('move',function(k){
		if(players[client.id])players[client.id].keys = k;
	});
	function update(){
		for (var i in players) if (players.hasOwnProperty(i)) {
			playerx = players[i].x;
			playery = players[i].y;
			players[i].move();
			if(players[i].x != playerx || players[i].y != playery){
				points.forEach(function(item, index, object) {
					if (Math.hypot(item.x-players[i].x, item.y-players[i].y) <= (item.radius + 20)){
						hit.radius = toRadius(toMass(hit.radius) + 50); 
						object.splice(index, 1);
						console.log("Removed point");
						io.sockets.emit('removePoint',index);
					}
				});
				if(players[client.id])
					io.sockets.emit('update',players,players[client.id].x, players[client.id].y);
			}
		}
		pointsAdd();
	}
	function init(){
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(update, 16);
	}
});
