var world = {
	minx:0,
	miny:0,
	maxx:1000,
	maxy:1000
}
var camera = {
	x:0,
	y:0,
};
var players = {};
var points = [];
var spikes = [];
var w = 500, h = 400;
var me = null, keys = {w:false,a:false,s:false,d:false};

$( document ).ready(function() {
	var canvas =  document.getElementsByTagName("canvas")[0];
	var context = canvas.getContext('2d');
	
	function grid(){
		context.lineWidth = 1;
		context.strokeStyle = '#EEE';
		for (x = 0; x <= w; x += 20) {
			context.moveTo(x - camera.x % 20, 0);
			context.lineTo(x - camera.x % 20, h);
			for (y = 0; y <= h; y += 20) {
				context.moveTo(0, y - camera.y % 20);
				context.lineTo(w, y - camera.y % 20);
			}
		}
		context.stroke();
	}
	function drawPoint(point){		
		context.beginPath();	
		context.arc(point.x - camera.x, point.y - camera.y, 10, 0, 2 * Math.PI, false);
		context.fillStyle = point.colour;
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();	
	}
	function drawSpike(spike){
		context.beginPath();
		context.moveTo(spike.x - camera.x, spike.y-25 - camera.y);
		context.lineTo(spike.x - 25 - camera.x, spike.y+25 - camera.y);
		context.lineTo(spike.x + 25 - camera.x, spike.y+25 - camera.y);
		context.closePath();
		
		context.lineWidth = 2;
		context.strokeStyle = '#666666';
		context.stroke();

		context.fillStyle = "#CC0000";
		context.fill();
	}
	function drawPlayer(player){
		context.beginPath();	
		context.arc(player.x - camera.x, player.y - camera.y, player.radius, 0, 2 * Math.PI, false);
		context.fillStyle = player.colour;
		context.fill();
		context.lineWidth = 2;
		context.strokeStyle = '#666666';
		context.stroke();	
		
		var textheight = player.radius-18;
		if (textheight < 18) textheight = 18;
		if (textheight > 32) textheight = 32;
		context.textAlign="center"; 
		context.textBaseline="middle";
		context.font = textheight+"px Sans-serif";
		context.lineWidth = 3;
		context.strokeText(player.name, player.x - camera.x, player.y - camera.y);
		context.fillStyle = 'white';
		context.fillText(player.name, player.x - camera.x, player.y - camera.y);

		context.font = textheight/2+"px Sans-serif";
		context.lineWidth = 2;
		context.strokeText(Math.ceil(player.radius), player.x - camera.x, player.y - camera.y - textheight);
		context.fillStyle = 'white';
		context.fillText(Math.ceil(player.radius), player.x - camera.x, player.y - camera.y - textheight);
	}

	var socket = io.connect('/');
	$(document).keydown(function(e){
		var key = e.which;
		if(key == 65) keys.a = true;
		else if(key == 87) keys.w = true;
		else if(key == 68) keys.d = true;
		else if(key == 83) keys.s = true;
		socket.emit('move', keys);
	});

	$(document).keyup(function(e){
		var key = e.which;
		if(key == 65) keys.a = false;
		else if(key == 87) keys.w = false;
		else if(key == 68) keys.d = false;
		else if(key == 83) keys.s = false;
		socket.emit('move', keys);
	});
	$('form').submit(function(e){
		e.preventDefault();
		var name = $('#name').val(), colour = $('#colour').val();
		console.log("Joining");
		socket.emit('join', name, colour);
	});
	socket.on('addPoint', function(point){
		points.push(point);
	});
	socket.on('removePoint', function(index){
		points.splice(index, 1);
	});
	socket.on('addSpike', function(spike){
		spikes.push(spike);
	});
	socket.on('removeSpike', function(index){
		spikes.splice(index, 1);
	});
	socket.on('id', function(id,po,sp){
		console.log("Recieved id and points");
		me = id;
		points = po;
		spikes = sp;
	});
	socket.on('update', function(pl){
		console.log("Updated players, now drawing");
		players = pl;
		
		camera.x = players[me].x - w/2;
		camera.y = players[me].y - h/2;
		if(camera.x < world.minx) camera.x = world.minx;
		if(camera.y < world.miny) camera.y = world.miny;
		if(camera.x+w > world.maxx) camera.x = world.maxx-w;
		if(camera.y+h > world.maxy) camera.y = world.maxy-h;
		
		context.clearRect(0,0,w,h);
		grid();
		for (var i in points) if (points.hasOwnProperty(i)) {drawPoint(points[i]);};
		for (var i in spikes) if (points.hasOwnProperty(i)) {drawSpike(spikes[i]);};
		for (var i in players) if (players.hasOwnProperty(i)) {drawPlayer(players[i]);};
	});
});