var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var pointsCounter = 0;
var canvasDrawing = $('#canvas_drawing');
var ctxDrawing = canvasDrawing[0].getContext('2d');
var canvasUI= $('#canvas_ui');
var ctxUI = canvasUI[0].getContext('2d');
var points = [
    { x: 100, y: 500  },
    { x: 50, y: 150  },
    { x: 500, y: 200  },
];
var voyager = { x: 150, y: 300 };
var thread = null;

var pointsAreUserDefined = false;

function plot(canvas, x, y, size, color) {
    if(!color) color = "#FF0000";
    if(!size) size = 1;

    canvas.fillStyle = color;
    canvas.fillRect(x - size / 2 , y - size / 2, size, size);
    canvas.fill();
}

function plotDrawing(x, y, size, color) {
    plot(ctxDrawing, x, y, size, color);
}

function plotUI(x, y, size, color) {
    plot(ctxUI, x, y, size, color);
}

function calculateOriginalPoints() {
    points = [
        {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT * 10 / 100,
        },
        {
            x: CANVAS_WIDTH * 10 / 100,
            y: CANVAS_HEIGHT * 95 / 100,
        },
        {
            x: CANVAS_WIDTH * 90 / 100,
            y: CANVAS_HEIGHT * 95 / 100,
        },
    ];
}

function voyage(voyager) {
    var dest = points[Math.random()*3|0];
    voyager.x = (dest.x + voyager.x)/2;
    voyager.y = (dest.y + voyager.y)/2;
    plotDrawing(voyager.x,voyager.y,1,"#0000FF");
    pointsCounter++;
}

function drawCornerPoints() {
    _.forEach(points, function(point) {
        plotUI(point.x,point.y,5);
    });
}

function superVoyage() {
    for(var i = 0 ; i < 10 ; i++) {
        voyage(voyager);
    }
    $('.points').text(pointsCounter);
}

function stop() {
    if (!_.isNil(thread)) {
        clearInterval(thread);
        thread = null;
    }
}

function clearCanvas(uiToo = false) {
    if(!uiToo) uiToo = false;

    pointsCounter = 0
    $('.points').text(pointsCounter);

    ctxDrawing.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (uiToo) {
        ctxUI.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawCornerPoints();
    }
}

function onPoint(x, y) {
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

    function updateCursor(canvas, event) {
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
                pointsAreUserDefined = true;
                clearCanvas(true);
            }
        }
    }

    $(canvasUI).mousemove(function( event ) {
        hoveredPointCalculated = false;
        updateCursor(this, event);
        updatePoint(event);
    });

    $(canvasUI).mousedown(function( event ) {
        updateCursor(this, event);
        grabbedPoint = getHoveredPoint(event);
        updatePoint(event);
    });

    $(canvasUI).mouseup(function( event ) {
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
    $('.CanvasArea').width(width);
    $('.CanvasArea').height(height);
    ctxDrawing.canvas.width = width;
    ctxDrawing.canvas.height = height;
    ctxUI.canvas.width = width;
    ctxUI.canvas.height = height;

    if (!pointsAreUserDefined) {
        calculateOriginalPoints();
    }

    clearCanvas(true);
}

$(window).resize(function() {
    resizeCanvas();
});

resizeCanvas();
calculateOriginalPoints();
drawCornerPoints();
start();
setupControls();
