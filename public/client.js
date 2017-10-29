var world = {
	minx:0,
	miny:0,
	maxx:1000,
	maxy:1000,
	maxpoints:100
}
var camera = {
	x:0,
	y:0,
};
var players = {};
var points = [];
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
	function drawPlayer(player){
		context.beginPath();	
		context.arc(player.x - camera.x, player.y - camera.y, player.radius, 0, 2 * Math.PI, false);
		context.fillStyle = player.colour;
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();	
		
		context.textAlign="center"; 
		context.textBaseline="middle";
		context.font = "18px Sans-serif"
		context.lineWidth = 3;
		context.strokeText(player.name, player.x - camera.x, player.y - camera.y);
		context.fillStyle = 'white';
		context.fillText(player.name, player.x - camera.x, player.y - camera.y);

		context.font = "8px Sans-serif"
		context.lineWidth = 2;
		context.strokeText(Math.ceil(player.radius), player.x - camera.x, player.y - camera.y - 15);
		context.fillStyle = 'white';
		context.fillText(Math.ceil(player.radius), player.x - camera.x, player.y - camera.y - 15);
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
	socket.on('id', function(id,po,pl){
		console.log("Recieved id and points");;
		points = po;
		players = pl;
	});
	socket.on('update', function(pl, mex, mey){
		console.log("Updated players, now drawing");
		players = pl;
		
		context.clearRect(0,0,w,h);
		grid();
		for (var i in points) if (points.hasOwnProperty(i)) {drawPoint(points[i]);};
		for (var i in players) if (players.hasOwnProperty(i)) {drawPlayer(players[i]);};

		camera.x = mex - w/2;
		camera.y = mey - h/2;
		if(camera.x < world.minx) camera.x = world.minx;
		if(camera.y < world.miny) camera.y = world.miny;
		if(camera.x+w > world.maxx) camera.x = world.maxx-w;
		if(camera.y+h > world.maxy) camera.y = world.maxy-h;
	});
});