var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var pointsCounter = 0;
var canvas = $('#canvas');
var ctx = canvas[0].getContext('2d');
var points = [
    { x: 100, y: 500  },
    { x: 50, y: 150  },
    { x: 500, y: 200  },
];
var voyager = { x: 150, y: 300 };
var thread = null;

function plot(x, y, size, color) {
    if(!color) color = "#FF0000";
    if(!size) size = 1;

    ctx.fillStyle = color;
    ctx.fillRect(x,y,size,size);
    ctx.fill();
}

function voyage(voyager) {
    var dest = points[Math.random()*3|0];
    voyager.x = (dest.x + voyager.x)/2;
    voyager.y = (dest.y + voyager.y)/2;
    plot(voyager.x,voyager.y,1,"#0000FF");
    pointsCounter++;
}

function drawCornerPoints() {
    _.forEach(points, function(point) {
        plot(point.x,point.y,5);
    });
}

function superVoyage() {
    for(var i = 0 ; i < 10 ; i++) {
        voyage(voyager);
    }
    drawCornerPoints();
    $('.points').text(pointsCounter);
}

function stop() {
    if (!_.isNil(thread)) {
        clearInterval(thread);
        thread = null;
    }
}

function clearCanvas() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();
}

function start() {
    if (_.isNil(thread)) {
        thread = setInterval(
            function() {
                superVoyage();
            },
            1
        );
    }
}

start();