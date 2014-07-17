var STATE_OUTSIDE = -10;
var STATE_EMPTY = -1;

var GRID_SIZE = 5; // 7 works too.
var HALFWAY = Math.floor(GRID_SIZE/2);

// contains most game logic, not really concerned with presentation
var Board = function() {
    var ACTION_NONE = 0;
    var ACTION_STAY = 1;
    var ACTION_DROP = 2;
    var ACTION_SQUISH = 3;
    var dropActions = make2DArray(GRID_SIZE, ACTION_STAY);
    var dropTargets = make2DArray(GRID_SIZE, 0);
    var dropTops = new Array();
    var elements = make2DArray(GRID_SIZE, function(row, col) {
        var diagonal = row + col;
        return (diagonal < HALFWAY || diagonal >= (GRID_SIZE+HALFWAY))
            ? STATE_OUTSIDE : STATE_EMPTY;
 
    });

    for (col=0; col <GRID_SIZE; col++) {
        dropTops[col]=bottomActiveRow(col);
    }


    function make2DArray(size, populatorFunction) {
        if (!(populatorFunction instanceof Function)) {
            var value = populatorFunction;
            populatorFunction = function(row,col) { return value; }
        }
        var elements = new Array();
        for (var row=0; row<GRID_SIZE; row++) {
            elements[row] = new Array();
            for (col = 0; col < 7; col++) {
                elements[row][col] = populatorFunction(row, col);
            }
        }
        return elements;
    }

    function forEach(todo) {
        for (var row=0; row<GRID_SIZE; row++) {
            for (var col = 0; col < GRID_SIZE; col++) {
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

    function get(x,y) {
        return elements[y][x];
    }

    function getRandomInt(uptil) {
        return Math.floor(Math.random() * uptil);
    }

    function bottomActiveRow(col)
    {
        return (col > HALFWAY) ? (GRID_SIZE - col+ 2) : (GRID_SIZE - 1);
    }

    function topActiveRow(col)
    {
        return (col < HALFWAY) ? (HALFWAY - col) : 0;
    }

    function createDropPlan() {
        var moves = 0;
        for (var col = 0; col < GRID_SIZE; col++) {
            moves += dropPlanColumnProcess(col);
        }
        return moves;
    }

    function dropPlanColumnProcess(col)
    {
        var topActive = topActiveRow(col);
        var bottom = bottomActiveRow(col);
        var writePos = bottom + 1;
        var squishingAllowed = false;
        var previousWriteValue = -10;
        var moves = 0;
        for (var row = bottom; row >= topActive; row--) {
            var current = elements[row][col];
            var todo = ACTION_NONE;
            if (current == STATE_EMPTY) {
                // writePos doesn't change since empty cells collapse
                todo = ACTION_NONE;
            } else {
                if (squishingAllowed && current == previousWriteValue) {
                    // writePos doesn't change - squishing overwrites previous write
                    todo = ACTION_SQUISH;
                    squishingAllowed = false;
                    moves++;
                } else {
                    writePos--; // fillin' up
                    if (row < writePos) {
                        todo = ACTION_DROP; // movin' down
                        moves++;
                    }
                    else {
                        todo = ACTION_STAY; // goin' nowhere
                    }
                    squishingAllowed = true;
                }
                previousWriteValue = current;
            }
            dropActions[col][row] = todo;
            dropTargets[col][row] = writePos;
        }
        dropTops[col] = writePos;
        return moves;
    }

    function applyDropPlan()
    {
        for (var col = 0; col < GRID_SIZE; col++) {
            var top = topActiveRow(col);
            for (var row = bottomActiveRow(col); row >= top; row--) {
                var todo = dropActions[col][row];
                var target = dropTargets[col][row]
                switch (todo) {
                    case ACTION_DROP:
                        elements[target][col] = elements[row][col];
                        elements[row][col] = STATE_EMPTY;
                        break;
                    case ACTION_SQUISH:
                        elements[target][col] = elements[row][col] + 1;
                        elements[row][col] = STATE_EMPTY;
                        break;
                }
            }
        }
    }

    function getDropTarget(col, row) {
        return dropTargets[col][row];
    }

    function addRandomCell() {
        var freetotal = 0;
        var free = new Array();
        for (col = 0; col < GRID_SIZE; col++) {
            free[col] =  dropTops[col] - topActiveRow(col);
            freetotal += free[col];
        }
        if (freetotal <= 0) {
            // game should end here
            return;
        }
        var selection = getRandomInt(freetotal);
        var col = 0;
        while(col<GRID_SIZE) {
           if (selection < free[col])
                break;
           selection-= free[col++];
        }
        var row = getRandomInt(free[col]) + topActiveRow(col);
        var newvalue = 1 + getRandomInt(7);
        elements[row][col] = newvalue;
        return [col, row];
    }

    function rotateClockwise()
    {
        for (var radius = 1; radius <= HALFWAY; radius++) {
            var top = HALFWAY - radius;
            var bottom = HALFWAY + radius;
            var left = HALFWAY - radius;
            var right = HALFWAY + radius;
            for (var pos = 0; pos < radius; pos++) {
                var first = elements[bottom][HALFWAY - pos];
                elements[bottom][HALFWAY - pos] = elements[HALFWAY + pos][right - pos];
                elements[HALFWAY + pos][right - pos] = elements[top + pos][right];
                elements[top + pos][right] = elements[top][HALFWAY + pos];
                elements[top][HALFWAY + pos] = elements[HALFWAY - pos][left + pos];
                elements[HALFWAY - pos][left + pos] = elements[bottom - pos][left];
                elements[bottom - pos][left] = first;
            }
        }
    }

    function rotateAnticlockwise()
    {
        for (var radius = 1; radius <= HALFWAY; radius++) {
            var top = HALFWAY - radius;
            var bottom = HALFWAY + radius;
            var left = HALFWAY - radius;
            var right = HALFWAY + radius;
            for (var pos = 0; pos < radius; pos++) {
                var first = elements[bottom][HALFWAY - pos];
                elements[bottom][HALFWAY - pos] = elements[bottom - pos][left];
                elements[bottom - pos][left] = elements[HALFWAY - pos][left + pos];
                elements[HALFWAY - pos][left + pos] = elements[top][HALFWAY + pos];
                elements[top][HALFWAY + pos] = elements[top + pos][right];
                elements[top + pos][right] = elements[HALFWAY + pos][right - pos];
                elements[HALFWAY + pos][right - pos] = first;
            }
        }
    }
    return {
        "forEach": forEach,
        "set": set,
        "get": get,
        "createDropPlan": createDropPlan,
        "applyDropPlan": applyDropPlan,
        "rotateCellsClockwise": rotateClockwise,
        "rotateCellsAnticlockwise": rotateAnticlockwise,
        "addRandomCell": addRandomCell,
        "getDropTarget": getDropTarget
    }; 
}

// concerned with drawing and event handling
var Game = function() {
    var canvas = document.getElementById('canvas');
    var canvasCtx = null;
    var buf = null;
    var bufCtx = null;
    var board = Board();
    var radius = 20;
    var gap = 26;
    var skew = Math.sqrt(3) /2;

    //check whether browser supports getting canvas context
    if (canvas && canvas.getContext) {
        canvasCtx = canvas.getContext('2d');
        buf = document.createElement('canvas');
        buf.width = canvas.width;
        buf.height = canvas.height;
        bufCtx = buf.getContext('2d');
        bufCtx.font = "15px Arial, Helvetica, Verdana, sans-serif";
        bufCtx.textAlign = "center";
        bufCtx.textBaseline = "middle";
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

    function getCenter(x, y) {
        return {
            x: x*gap*skew*2 + 100,
            y: (y+x/2)*gap*2 + 50
        };
    }

    var rotationCenter = getCenter(HALFWAY,HALFWAY);

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

    function colorOfState(state) {
        var red = (state) & 15;
        var green = (state*5) & 15;
        var blue = (state*7) & 15;
        return "#" + red.toString(16) + green.toString(16) + blue.toString(16);
    }

    function drawBoard() {
        var radius = 20;
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, buf.width, buf.height);
        board.forEach(function(x,y,state) {
            var center = getCenter(x,y);
            drawCircle(bufCtx, center.x, center.y, radius, '#fff', 20,'#000');
            if (state != STATE_EMPTY) {
                drawCellAt(center.x, center.y, state);
            }
        });
    }

    function drawBoardMovingDown(animationProgress = 0) {
        //console.log("drawboardmoving down "+animationProgress);
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, buf.width, buf.height);
        board.forEach(function(x,y,state) {
            var center = getCenter(x,y);
            drawCircle(bufCtx, center.x, center.y, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var center = getCenter(x,y);
                var newPos = board.getDropTarget(x,y);
                var distance = (newPos-y) * gap * 2 * animationProgress;
                drawCellAt(center.x, center.y + distance, state);
            }
        });
        //console.log(animationProgress);
    }

    function drawCellAt(x,y,state) {
        var color = colorOfState(state);
        drawCircle(bufCtx, x, y, radius -2, color);
        bufCtx.fillStyle = '#000';
        bufCtx.fillText(state, x+1, y+1);
        bufCtx.fillStyle = '#fff';
        bufCtx.fillText(state, x-1, y);
    }

    function drawBoardRotating(direction, animationProgress = 0) {
        var angle = direction *(Math.PI /3) * animationProgress;
        var sina = Math.sin(angle);
        var cosa = Math.cos(angle);
         
        //console.log("drawboardmoving down "+animationProgress);
        bufCtx.fillStyle = '#fff';
        bufCtx.fillRect(0,0, buf.width, buf.height);
        board.forEach(function(x,y,state) {
            var center = getRotatedCenter(x,y,sina,cosa);
            drawCircle(bufCtx, center.x, center.y, radius, '#fff', 20,'#000');
        });
        board.forEach(function(x,y,state) {
            if (state != STATE_EMPTY) {
                var center = getRotatedCenter(x,y,sina,cosa);
                drawCellAt(center.x, center.y, state);
            }
        });
        //console.log(animationProgress);
    }

    function demo() {
        for (var t=0; t<GRID_SIZE; t++) {
            board.addRandomCell();
        }
        document.onkeyup = keyEvent;
        drawBoard();
        canvasCtx.drawImage(buf, 0, 0);
    }

    function animate(startTime, duration, frameDrawer, onCompletion) {
        // update
        var time = (new Date()).getTime() - startTime;
        var completion = time * 1.0 / duration;
        //console.log("animate completion = "+completion);
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
        //console.log("keycode = "+ev.keyCode);
        if (ev.keyCode == 37) { // left
            var drawer = function(pos) { drawBoardRotating(1, pos); }
            animate((new Date()).getTime(), 100, drawer, board.rotateCellsClockwise);
            ev.returnValue= false;
            ev.preventDefault = true;
            return false;
        }
        if (ev.keyCode == 39) { // right
            var drawer = function(pos) { drawBoardRotating(-1, pos); }
            animate((new Date()).getTime(), 100, drawer, board.rotateCellsAnticlockwise);
            ev.returnValue= false;
            ev.preventDefault = true;
            return false;
        }
        if (ev.keyCode == 40) { // down
            var count = board.createDropPlan();
            if (count > 0) {
                //console.log("moving down");
                animate((new Date()).getTime(), 100, drawBoardMovingDown, function() {
                    board.applyDropPlan();
                    bits = board.addRandomCell();
                    drawBoard();

                    canvasCtx.drawImage(buf, 0, 0);
                });
            }
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

