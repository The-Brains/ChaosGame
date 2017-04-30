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
    pointsCounter = 0
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();
    $('.points').text(pointsCounter);
}

function onPoint(x,y) {
    var pointOver = null;
    _.forEach(points, function(point) {
        var dx = x - point.x;
        var dy = y - point.y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 10) {
            pointOver = point;
        }
    });
    return pointOver;
}

function setupControls() {
    var hoveredPointCalculated = false;
    var hoveredPoint = null;
    var grabbedPoint = null;
    function getHoveredPoint(event) {
        if(!hoveredPointCalculated) {
            hoveredPoint = onPoint(event.offsetX, event.offsetY);
            hoveredPointCalculated = true;
        }
        return hoveredPoint;
    }

    function updateCursor(canvas,event) {
        $(canvas).css('cursor',
                grabbedPoint
                ? 'grabbing'
                : getHoveredPoint(event)
                ? 'grab'
                : 'auto');
    }

    function updatePoint(event) {
        if (event.buttons & 1) {
            if(grabbedPoint) {
                grabbedPoint.x = event.offsetX;
                grabbedPoint.y = event.offsetY;
                drawCornerPoints();
                clearCanvas();
            }
        }
    }

    $(canvas).mousemove(function( event ) {
        hoveredPointCalculated = false;
        updateCursor(this, event);
        updatePoint(event);
    });
    $(canvas).mousedown(function( event ) {
        updateCursor(this, event);
        grabbedPoint = getHoveredPoint(event);
        updatePoint(event);
    });
    $(canvas).mouseup(function( event ) {
        grabbedPoint = null;
        updateCursor(this, event);
    });
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

function resizeCanvas() {
    const width = $('.CanvasArea').width();
    const height = $(window).height() - $('header').height() - 16;
    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    clearCanvas();
}

$(window).resize(function() {
    resizeCanvas();
});

resizeCanvas();

start();

setupControls();
