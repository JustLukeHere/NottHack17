var players = {};
var points = [];
var spikes = [];
var world = {
	minx:0,
	miny:0,
	maxx:1000,
	maxy:1000,
	minpoints:30,
	spikes:10,
}
var colours =["cyan","forestgreen","fuchsia","orange","gold"];
var w=500, h=400;

function spikeCreate(){
	return {
		x: Math.random()*(world.maxx-world.minx)+world.minx,
		y: Math.random()*(world.maxy-world.miny)+world.miny,
	};
}
function spikesAdd(){
	var newspike = spikeCreate(), attempts = 0, valid = false;
	while(valid=false && attempts < 5){
		attempts++;
		valid = true;
		newspike.x =  Math.random()*(world.maxx-world.minx)+world.minx;
		newspike.y = Math.random()*(world.maxy-world.miny)+world.miny;
		for (var i in players) if (players.hasOwnProperty(i)) {
			if (Math.hypot(newspike.x-players[i].x, newspike.y-players[i].y) <= (players[i].radius + 20)){
				valid = false;
			}
		}
	}
	spikes.push(newspike);
	io.sockets.emit('addSpike',newspike);
	if(spikes.length < 10)
		spikesAdd();
}


function pointCreate(){
	return {
		x: Math.random()*(world.maxx-world.minx)+world.minx,
		y: Math.random()*(world.maxy-world.miny)+world.miny,
		colour: colours[Math.floor(Math.random()*(colours.length-1))],
	};
}
function pointsAdd(){
	if(Math.random()*100 > 90 && points.length<100){
		var newpoint = pointCreate(), attempts = 0, valid = false;
		while(valid=false && attempts < 5){
			attempts++;
			valid = true;
			newpoint.x =  Math.random()*(world.maxx-world.minx)+world.minx;
			newpoint.y = Math.random()*(world.maxy-world.miny)+world.miny;
			for (var i in players) if (players.hasOwnProperty(i)) {
				if (Math.hypot(newpoint.x-players[i].x, newpoint.y-players[i].y) <= (players[i].radius + 20)){
					valid = false;
				}
			}
		}
		points.push(newpoint);
		io.sockets.emit('addPoint',newpoint);
	}
	if(points.length < world.minpoints)
		pointsAdd();
}

function playerCreate(name, colour){
	return {
		name: name,
		radius: 25,
		x: 50,
		y: 50,
		keys: {w: false, a: false, s: false, d: false},
		colour: colour,
		spawn: function(){
			this.radius = 25;
			var valid = false;
			while(valid==false){
				valid = true;
				this.x = Math.random()*(w-this.radius*2) + this.radius*2;
				this.y = Math.random()*(h-this.radius*2) + this.radius*2;
				for (var j in players) if (players.hasOwnProperty(j) && players[j]!==this) {
					if (Math.hypot(players[j].x-this.x, players[j].y-this.y) <= (this.radius + players[j].radius)){
						valid = false;
					}
				}
				for (var j in spikes) if (spikes.hasOwnProperty(j) && spikes[j]!==this) {
					if (Math.hypot(spikes[j].x-this.x, spikes[j].y-this.y) <= (this.radius + 15)){
						valid = false;
					}
				}
			}
		},
		move: function(){
			if(this.y-4>world.miny) if(this.keys.w == true)this.y-=4;
			if(this.x-4>world.minx) if(this.keys.a == true)this.x-=4;
			if(this.y+4<world.maxy) if(this.keys.s == true)this.y+=4;
			if(this.x+4<world.maxx) if(this.keys.d == true)this.x+=4;
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

for(var x = 0; x< 50; x++)pointsAdd();
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
		client.emit('id', client.id, points, spikes);
		client.emit('update',players);
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
					if (Math.hypot(players[i].x-item.x, players[i].y-item.y) <= (players[i].radius + 20)){
						players[i].radius = toRadius(toMass(players[i].radius) + 200); 
						object.splice(index, 1);
						io.sockets.emit('removePoint',index);
					}
				});
				spikes.forEach(function(item, index, object) {
					if (Math.hypot(players[i].x-item.x, players[i].y-item.y) <= (players[i].radius + 15)){
						players[i].spawn(); 
						object.splice(index, 1);
						io.sockets.emit('removeSpike',index);
						spikesAdd();
					}
				});
				for (var j in players) if (players.hasOwnProperty(j) && i!=j) {
					if (Math.hypot(players[i].x-players[j].x, players[i].y-players[j].y) <= (players[i].radius + players[j].radius) && toMass(players[i].radius)*1.2>=toMass(players[j].radius)){
						players[i].radius = toRadius(toMass(players[i].radius) + toMass(players[j].radius)); 
						players[j].spawn();
					}
					if (Math.hypot(players[j].x-players[i].x, players[j].y-players[i].y) <= (players[i].radius + players[j].radius) && toMass(players[j].radius)*1.2>=toMass(players[i].radius)){
						players[j].radius = toRadius(toMass(players[i].radius) + toMass(players[j].radius)); 
						players[i].spawn();
					}
				};
				if(players[client.id])
					io.sockets.emit('update',players);
			}
		}
		pointsAdd();
	}
	function init(){
		spikesAdd();
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(update, 30);
	}
});
