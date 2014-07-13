var STATE_OUTSIDE = -1;
var STATE_EMPTY = 0;

var EAST = 1;
var WEST = 2;
var NORTHWEST = 3;
var NORTHEAST = 4;
var SOUTHWEST = 5;
var SOUTHEAST = 6;

var Board = function() {
    var elements = new Array();
    for (row=0; row<7; row++) {
        elements[row] = new Array();
        for (col = 0; col < 7; col ++) {
            var state = STATE_EMPTY;
            if ((row + col) < 3) {
                state = STATE_OUTSIDE;
            }
            else if ((row + col) >= 10) {
                state = STATE_OUTSIDE;
            }
            elements[row][col] = state;
        }
    }

    function forEach(todo) {
        for (row=0; row<7; row++) {
            for (col = 0; col < 7; col ++) {
                var value = elements[row][col];
                if (value != STATE_OUTSIDE) {
                    todo(col, row, elements[row][col]);
                }
            }
        }
    }

    function set(x,y,state) {
        elements[y][x] = state;
    }

    function gapsBefore(x,y) {
        var tally = 0;
        for (col=0; col<x; col++) {
            if (elements[y][col] == STATE_EMPTY) {
                tally = tally + 1;
            }
        }
        console.log("tally("+x+","+y+")="+tally);
        return tally;
    }

    function moveCellsLeft() {
        for (row=0; row<7; row++) {
            var shift = 0;
            for (col = 0; col < 7; col ++) {
                var value = elements[row][col];
                if (value != STATE_OUTSIDE) {
                    if (value == STATE_EMPTY) {
                        shift++;
                    } else {
                    }                        
                }
            }
        }
    }

    return {
        "forEach": forEach,
        "set": set,
        "gapsBefore": gapsBefore,
        "moveCellsLeft": moveCellsLeft
    }; 
}

var Game = function() {
    var canvas = document.getElementById('canvas');
    var canvasCtx = null;
    var buf = null;
    var bufCtx = null;
    var board = Board();

    //check whether browser supports getting canvas context
    if (canvas && canvas.getContext) {
        canvasCtx = canvas.getContext('2d');
        buf = document.createElement('canvas');
        buf.width = canvas.width;
        buf.height = canvas.height;
        bufCtx = buf.getContext('2d');
    }

    function drawCircle(context, xCenter, yCenter, radius, fillStyle, lineWidth = 0, lineStyle = -1) {
    //    console.log("drawCircle(...,"+xCenter+","+yCenter+","+radius+","+fillStyle+","+lineWidth+","+lineStyle);
        context.beginPath();
        context.arc(xCenter, yCenter, radius, Math.PI * 2, false);
        bufCtx.closePath();
        context.lineWidth = lineWidth;
        if (lineWidth > 0) {
            context.strokeStyle = lineStyle;
            context.stroke();
        }
        context.fillStyle = fillStyle;
        context.fill();
    }


    function drawBoard() {
        var radius = 20;
        var gap = 26;
        var skew = Math.sqrt(3) /2;
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, bufCtx.width, bufCtx.height);
        board.forEach(function(x,y,state) {
            var xCenter = (x+y/2)*gap*2 +100;
            var yCenter = y*gap*skew*2 + 50;
            drawCircle(bufCtx, xCenter, yCenter, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var yCenter = y*gap*skew*2 + 50;
                var xCenter = (x+y/2)*gap*2 +100;
                var color = "#" + (15*256 + state * 2).toString(16);
                drawCircle(bufCtx, xCenter, yCenter, radius -2, color);
            }
        });
    }

    function drawBoardMovingLeft(animationProgress = 0) {
        var radius = 20;
        var gap = 26;
        var skew = Math.sqrt(3) /2;
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, bufCtx.width, bufCtx.height);
        board.forEach(function(x,y,state) {
            var xCenter = (x+y/2)*gap*2 +100;
            var yCenter = y*gap*skew*2 + 50;
            drawCircle(bufCtx, xCenter, yCenter, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var yCenter = y*gap*skew*2 + 50;
                var xCenter = (x+y/2)*gap*2 +100;
                var newPos = (x-board.gapsBefore(x,y));
                var distance = (x-newPos) * gap * 2 * animationProgress;
                var color = "#" + (15*256 + state * 2).toString(16);
                var xdelta = -distance;
                drawCircle(bufCtx, xCenter + xdelta, yCenter, radius -2, color);
            }
        });
        console.log(animationProgress);
    }

    function demo() {
        board.set(4,2, 1);
        board.set(2,4, 2);
        board.set(6,3, 3);
        board.set(5,3, 4);
        board.set(4,3, 5);
        board.set(2,3, 6);
        drawBoard();
        document.onkeyup = keyEvent;
        canvasCtx.drawImage(buf, 0, 0);
    }

    function animate(startTime, duration, frameDrawer, onCompletion) {
        // update
        var time = (new Date()).getTime() - startTime;
        var completion = time * 1.0 / duration;
        if (completion > 1.0) {
            completion = 1.0;
        }
        frameDrawer(completion);
        canvasCtx.drawImage(buf, 0, 0);
        // request new frame
        if (completion < 1.0) {
            requestAnimFrame(function() {
              animate(startTime, duration, frameDrawer, onCompletion);
            });
        } else {
            onCompletion();
        }
    }

    function keyEvent(ev) {
        console.log("keycode = "+ev.keyCode);
        if (ev.keyCode == 37) { // left
            animate((new Date()).getTime(), 100, drawBoardMovingLeft, board.moveCellsLeft);
            return false;
        }
        if (ev.keyCode == 39) { // right
            //animate((new Date()).getTime(), 100, drawBoardMovingRight, moveCellsRight);
            return false;
        }
        if (ev.keyCode == 40) { // down
            animate((new Date()).getTime(), 100);
            return false;
        }
        return true;
    }

    return {
        "demo": demo,
        "board": board
    };
}();

window.requestAnimFrame = (function(callback) {
    return  window.requestAnimationFrame 
        || window.webkitRequestAnimationFrame 
        || window.mozRequestAnimationFrame 
        || window.oRequestAnimationFrame 
        || window.msRequestAnimationFrame 
        || function(callback) {
          window.setTimeout(callback, 1000 / 100);
        };
      })();

Game.demo();

