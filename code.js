var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var pointsCounter = 0;
var $canvasArea = $('.CanvasArea');
var canvasDrawing = $('#canvas_drawing');
var ctxDrawing = canvasDrawing[0].getContext('2d');
var canvasUI = $('#canvas_ui');
var $statusButton = $('.statusButton');
var ctxUI = canvasUI[0].getContext('2d');
var points = [
    { x: 100, y: 500  },
    { x: 50, y: 150  },
    { x: 500, y: 200  },
];
var voyager = { x: 0, y: 0 };
var thread = null;
var pointDrawnPerIteration = 100;

var isRunning = false;

var pointsAreUserDefined = false;

function plot(canvas, x, y, size, color) {
    if(!color) color = "#FF0000";
    if(!size) size = 1;

    canvas.beginPath();
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

function drawCircle(ctx, x, y, thickness, size, color) {
    if(!color) color = "#FF0000";
    if(!size) size = 1;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function calculateOriginalPoints() {
    points = [
        {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT * 10 / 100,
        },
        {
            x: CANVAS_WIDTH * 10 / 100,
            y: CANVAS_HEIGHT * 90 / 100,
        },
        {
            x: CANVAS_WIDTH * 90 / 100,
            y: CANVAS_HEIGHT * 90 / 100,
        },
    ];
}

function repositionPoints() {
    _.forEach(points, function(point, index) {
        if (point.x <= 0) {
            point.x = CANVAS_WIDTH * 10 / 100;
        }
        if (point.x >= CANVAS_WIDTH) {
            point.x = CANVAS_WIDTH * 90 / 100;
        }
        if (point.y <= 0) {
            point.y = CANVAS_HEIGHT * 10 / 100;
        }
        if (point.y >= CANVAS_HEIGHT) {
            point.y = CANVAS_HEIGHT * 90 / 100;
        }
    });
}

function voyage(voyager) {
    var dest = points[Math.random()*3|0];
    voyager.x = (dest.x + voyager.x)/2;
    voyager.y = (dest.y + voyager.y)/2;
    plotDrawing(voyager.x,voyager.y,1,"#0000FF");
    pointsCounter++;
}

function drawCornerPoints(selectedPoint) {
    if (!selectedPoint) selectedPoint = null;

    _.forEach(points, function(point) {
        plotUI(point.x, point.y, 6);
    });

    if (selectedPoint) {
        drawCircle(
            ctxUI,
            selectedPoint.x,
            selectedPoint.y,
            2,
            16,
            '#000000'
        );
    }
}

function updateSpeedThread(newValue) {
    pointDrawnPerIteration = newValue;
}

function superVoyage() {
    for(var i = 0 ; i < pointDrawnPerIteration ; i++) {
        voyage(voyager);
    }
    $('.points').text(pointsCounter);
}

function stop() {
    if (!_.isNil(thread) && isRunning) {
        clearInterval(thread);
        thread = null;
        isRunning = false;

        $statusButton.contents().first().replaceWith('Start');
        $statusButton.click(start);
    }
}

function redrawUI(selectedPoint) {
    ctxUI.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawCornerPoints(selectedPoint);
}

function clearCanvas(uiToo = false) {
    if(!uiToo) uiToo = false;

    pointsCounter = 0
    $('.points').text(pointsCounter);

    ctxDrawing.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (uiToo) {
        redrawUI();
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

function distance(pointA, pointB) {
    const x = pointA.x - pointB.x;
    const y = pointA.y - pointB.y;
    return Math.sqrt( x * x + y * y )
}

function setupControls() {
    var selectedPoint = null;
    var isMovingPoint = false;

    $canvasArea.mousemove(_.debounce(function(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        if (isMovingPoint) {
            points[selectedPoint.i].x = mouseX;
            points[selectedPoint.i].y = mouseY;
            pointsAreUserDefined = true;
        } else {
            selectedPoint = null;
            $canvasArea.removeClass('isInteracting');

            const distancesToPoints = _.map(points, function(point, index) {
                return {
                    point: point,
                    d: distance({
                        x: mouseX,
                        y: mouseY,
                    }, point),
                    i: index,
                };
            });
            const closestPoint = _.minBy(distancesToPoints, 'd');

            if (closestPoint.d <= 16) {
                // one point is close enough to be moved
                selectedPoint = closestPoint;
                $canvasArea.addClass('isInteracting');
            }
        }

        redrawUI(selectedPoint ? selectedPoint.point : null);
    }, 20, {
        maxWait: 50,
    }));

    $canvasArea.mousedown(function( event ) {
        if (selectedPoint) {
            isMovingPoint = true;
        }
    });

    $canvasArea.mouseup(function( event ) {
        if (selectedPoint) {
            isMovingPoint = false;
        }
    });
}

function start() {
    if (_.isNil(thread) && !isRunning) {
        wasON = true;
        thread = setInterval(
            function() {
                superVoyage();
            },
            100
        );
        isRunning = true;

        $statusButton.contents().first().replaceWith('Stop');
        $statusButton.click(stop);
    }
}

function resizeCanvas() {
    const width = $('.CanvasArea').width();
    const height = $(window).height() - $('header').height() - 16;
    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;
    $('.CanvasArea').height(height);
    ctxDrawing.canvas.width = width;
    ctxDrawing.canvas.height = height;
    ctxUI.canvas.width = width;
    ctxUI.canvas.height = height;

    if (!pointsAreUserDefined) {
        calculateOriginalPoints();
    } else {
        repositionPoints();
    }

    clearCanvas(true);
}

$(window).resize(_.debounce(resizeCanvas, 200, {
    maxWait: 1000,
}));

var wasRunning = null;

$(window).blur(function(){
    wasRunning = isRunning;
    stop();
});

$(window).focus(function(){
    if (wasRunning) {
        start();
    }
});

resizeCanvas();
calculateOriginalPoints();
drawCornerPoints();
start();
setupControls();
