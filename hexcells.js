var STATE_OUTSIDE = -10;
var STATE_EMPTY = -1;

var EAST = 1;
var WEST = 2;
var NORTHWEST = 3;
var NORTHEAST = 4;
var SOUTHWEST = 5;
var SOUTHEAST = 6;

var Board = function() {
    var elements = new Array();
    var spare = new Array();
    for (var row=0; row<7; row++) {
        elements[row] = new Array();
        spare[row] = new Array();
        for (col = 0; col < 7; col ++) {
            var state = STATE_EMPTY;
            if ((row + col) < 3) {
                state = STATE_OUTSIDE;
            }
            else if ((row + col) >= 10) {
                state = STATE_OUTSIDE;
            }
            elements[row][col] = state;
            spare[row][col] = state;
        }
    }

    function forEach(todo) {
        for (var row=0; row<7; row++) {
            for (var col = 0; col < 7; col++) {
                var value = elements[row][col];
                if (!value) {
                    throw new Error("value is 0 at ("+col+","+row+")");
                }
                if (value != STATE_OUTSIDE) {
                    todo(col, row, elements[row][col]);
                }
            }
        }
    }

    function set(x,y,state) {
        elements[y][x] = state;
    }

    function gapsBelow(x,y) {
        var tally = 0;
        var collapsible = false;
        var topPos = 6;
        for (row=6; row>y; row--) {
            if (elements[row][x] == STATE_EMPTY) {
                tally = tally + 1;
            } else {
                if (topPos>row && elements[row][x]==elements[topPos][x]) 
                    tally = tally + 1;
                else
                    topPos--;
            }
        }
        console.log("tally("+x+","+y+")="+tally);
        return tally;
    }

   function getRandomInt(uptil) {
       return Math.floor(Math.random() * uptil);
   }

    function moveCellsDown() {
       var free = new Array();
       var taken = new Array();
       var freetotal = 0;
       for (col = 0; col < 7; col ++) {
           var shift = 0;
           free[col]=0;
           taken[col]=0;
           for (row=6; row>=0; row--) {
               var value = elements[row][col];
               if (value != STATE_OUTSIDE) {
                   if (value == STATE_EMPTY) {
                       shift++;
                       free[col]++;
                   } else if (shift>0) {
                        var toppos = row + shift + 1;
                        console.log("checking toppos "+toppos+ " on column "+col +" row="+row+" shift="+shift);
                        if (toppos < 7 && elements[row+shift+1][col] == value) { // if what's underneath is the same, collapse 'em
                            console.log("collapsing");
                            shift++;
                            elements[row+shift][col] = value + value;
                            free[col]++;
                        } else {
                            console.log("not collapsing");
                            elements[row+shift][col] = elements[row][col];
                            taken[col]++;
                        }
                        elements[row][col] = STATE_EMPTY;
                   }                        
               }
           }
           freetotal+=free[col];
           console.log("free rows in column "+col+" = "+free[col]);
       }
       var selection = getRandomInt(freetotal);
       var col = 0;
       while(col<7) {
           if (selection < free[col])
                break;
           selection-= free[col++];
       }
       var row = getRandomInt(free[col]);
       if (col<3)
            row += (3-col);
       var newvalue = 1 << getRandomInt(3);
       elements[row][col] = newvalue;
       console.log("adding new element at ("+row+","+col+")="+newvalue);
    }

    function rotateCellsAnticlockwise() {
        // C
        var start = elements[6][3];
        elements[6][3] = elements[6][0];
        elements[6][0] = elements[3][0];
        elements[3][0] = elements[0][3];
        elements[0][3] = elements[0][6];
        elements[0][6] = elements[3][6];
        elements[3][6] = start;

        // D
        start = elements[6][2];
        elements[6][2] = elements[5][0];
        elements[5][0] = elements[2][1];
        elements[2][1] = elements[0][4];
        elements[0][4] = elements[1][6];
        elements[1][6] = elements[4][5];
        elements[4][5] = start;

        // E
        start = elements[6][1];
        elements[6][1] = elements[4][0];
        elements[4][0] = elements[1][2];
        elements[1][2] = elements[0][5];
        elements[0][5] = elements[2][6];
        elements[2][6] = elements[5][4];
        elements[5][4] = start;

        // B
        start = elements[5][3];
        elements[5][3] = elements[5][1];
        elements[5][1] = elements[3][1];
        elements[3][1] = elements[1][3];
        elements[1][3] = elements[1][5];
        elements[1][5] = elements[3][5];
        elements[3][5] = start;

        // A
        start = elements[4][3];
        elements[4][3] = elements[4][2];
        elements[4][2] = elements[3][2];
        elements[3][2] = elements[2][3];
        elements[2][3] = elements[2][4];
        elements[2][4] = elements[3][4];
        elements[3][4] = start;

        // F
        var start = elements[5][2];
        elements[5][2] = elements[4][1];
        elements[4][1] = elements[2][2];
        elements[2][2] = elements[1][4];
        elements[1][4] = elements[2][5];
        elements[2][5] = elements[4][4];
        elements[4][4] = start;
        /*
        for (var col = 0; col < 7; col ++) {
            for (var row=0; row <7; row++) {
                var value = elements[row][col];
                if (value != STATE_OUTSIDE) {
                    var xr = col -3;
                    var yr = row -3;
                    var xprev = -yr;
                    var yprev = xr + yr;
                    console.log("("+xprev+","+yprev+") -> ("+xr+","+yr+")");
                    spare[row][col] = elements[yprev+3][xprev+3];
                }
                else {
                    spare[row][col] = STATE_OUTSIDE;
                }
            }
        }
        var temp = spare;
        elements = spare;
        spare = temp;
        */
    }

    return {
        "forEach": forEach,
        "set": set,
        "gapsBelow": gapsBelow,
        "moveCellsDown": moveCellsDown,
        "rotateCellsAnticlockwise": rotateCellsAnticlockwise
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

    var radius = 20;
    var gap = 26;
    var skew = Math.sqrt(3) /2;

    function getCenter(x, y) {
        return {
            x: x*gap*skew*2 + 100,
            y: (y+x/2)*gap*2 + 50
        };
    }

    var rotationCenter = getCenter(3,3);

    function getRotatedCenter(x, y,sina, cosa) {
        var orig = getCenter(x,y);
        var x2 = orig.x - rotationCenter.x;
        var y2 = orig.y - rotationCenter.y;
        var xr = x2 * cosa - y2 * sina;
        var yr = x2 * sina + y2 * cosa;
        return {
            x: rotationCenter.x + xr,
            y: rotationCenter.y + yr,
        };
    }

    function drawBoard() {
        var radius = 20;
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, buf.width, buf.height);
        board.forEach(function(x,y,state) {
            var center = getCenter(x,y);
            drawCircle(bufCtx, center.x, center.y, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var center = getCenter(x,y);
                var color = "#" + (15*256 + state * 2).toString(16);
                drawCircle(bufCtx, center.x, center.y, radius -2, color);
            }
        });
    }

    function drawBoardMovingDown(animationProgress = 0) {
        console.log("drawboardmoving down "+animationProgress);
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, buf.width, buf.height);
        board.forEach(function(x,y,state) {
            var center = getCenter(x,y);
            drawCircle(bufCtx, center.x, center.y, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var center = getCenter(x,y);
                var newPos = (y+board.gapsBelow(x,y));
                var distance = (newPos-y) * gap * 2 * animationProgress;
                var color = "#" + (15*256 + state * 2).toString(16);
                var ydelta = distance;
                drawCircle(bufCtx, center.x, center.y + ydelta, radius -2, color);
            }
        });
        console.log(animationProgress);
    }

    function drawBoardRotating(animationProgress = 0) {
        var angle = -(Math.PI /3) * animationProgress;
        var sina = Math.sin(angle);
        var cosa = Math.cos(angle);
         
        console.log("drawboardmoving down "+animationProgress);
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, buf.width, buf.height);
        board.forEach(function(x,y,state) {
            var center = getRotatedCenter(x,y,sina,cosa);
            drawCircle(bufCtx, center.x, center.y, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var center = getRotatedCenter(x,y,sina,cosa);
                var color = "#" + (15*256 + state * 2).toString(16);
                drawCircle(bufCtx, center.x, center.y, radius -2, color);
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
        console.log("animate completion = "+completion);
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
            return false;
        }
        if (ev.keyCode == 39) { // right
            animate((new Date()).getTime(), 100, drawBoardRotating, board.rotateCellsAnticlockwise);
            ev.returnValue= false;
            ev.preventDefault = true;
            return false;
        }
        if (ev.keyCode == 40) { // down
            console.log("pressed down key");
            animate((new Date()).getTime(), 100, drawBoardMovingDown, function() {
                board.moveCellsDown();
                drawBoard();
            });
            ev.returnValue= false;
            ev.preventDefault = true;
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

