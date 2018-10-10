var touchStartCoords =  {'x':-1, 'y':-1}, // X and Y coordinates on mousedown or touchstart events.
    touchEndCoords = {'x':-1, 'y':-1},// X and Y coordinates on mouseup or touchend events.
    direction = 'undefined',// Swipe direction
    minDistanceXAxis = 30,// Min distance on mousemove or touchmove on the X axis
    maxDistanceYAxis = 30,// Max distance on mousemove or touchmove on the Y axis
    minDistanceYAxis = 30,// Min distance on mousemove or touchmove on the Y axis
    maxDistanceXAxis = 30,// Max distance on mousemove or touchmove on the X axis
    maxAllowedTime = 1000,// Max allowed time between swipeStart and swipeEnd
    startTime = 0,// Time on swipeStart
    elapsedTime = 0;// Elapsed time between swipeStart and swipeEnd

function swipeStart(e) {
  e = e ? e : window.event;
  e = ('changedTouches' in e)?e.changedTouches[0] : e;
  touchStartCoords = {'x':e.pageX, 'y':e.pageY};
  startTime = new Date().getTime();
}

function swipeMove(e){
  e = e ? e : window.event;
  // e.preventDefault();
}

function swipeEnd(e, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) {
  e = e ? e : window.event;
  e = ('changedTouches' in e)?e.changedTouches[0] : e;
  touchEndCoords = {'x':e.pageX - touchStartCoords.x, 'y':e.pageY - touchStartCoords.y};
  elapsedTime = new Date().getTime() - startTime;
  if (elapsedTime <= maxAllowedTime){
    if (Math.abs(touchEndCoords.x) >= minDistanceXAxis && Math.abs(touchEndCoords.y) <= maxDistanceYAxis){
      direction = (touchEndCoords.x < 0) ? 'left' : 'right';
      switch(direction){
        case 'left':
          onSwipeLeft(e);
          break;
        case 'right':
          onSwipeRight(e);
          break;
      }
    } else if (Math.abs(touchEndCoords.y) >= minDistanceYAxis && Math.abs(touchEndCoords.x) <= maxDistanceXAxis) {
      direction = (touchEndCoords.y < 0) ? 'up' : 'down';
      switch(direction){
        case 'up':
          onSwipeUp(e);
          break;
        case 'down':
          onSwipeDown(e);
          break;
      }
    }
  }
}

module.exports = {
  swipeStart: swipeStart,
  swipeEnd: swipeEnd,
  swipeMove: swipeMove
}