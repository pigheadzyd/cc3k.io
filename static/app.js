requirejs(["helper/init", "graphic"], function(init, graphic) {
	var clientId;
	var map;
  var graphic
	screenWidth = init.width;
  var socket = io();
  var sendMouseAction = false;

  //this function runs for every 0.1s
  run = function () {
    sendMouseAction = true;
  }
  setInterval(run, 200);

  window.onkeydown = function(e) {
      var key = e.keyCode ? e.keyCode : e.which;
      socket.emit('k',key);
  }

  function getDeirection(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - (rect.right - rect.left) / 2) / (rect.right - rect.left) * 2,
      y: (evt.clientY - (rect.bottom - rect.top) / 2) / (rect.bottom - rect.top) * 2
    }
  }

  // this message will only recieved once
  socket.on('map', function(m){
    map = m;
    graphic = graphic.init(m, init.canvas, init.context, init.cellWidth, socket);
    function getMousePosition(e) {
        var pos = getDeirection(init.canvas, e);
        posx = pos.x;
        posy = pos.y;
        if (sendMouseAction) {
          socket.emit('mousePos', pos);
          sendMouseAction = false;
        }
    }
    window.addEventListener('mousemove', getMousePosition, false);
  });

  socket.on('login', function(){
    graphic.login();
  })

  socket.on('event', function(m){
    graphic.drawMap(m);
  })

  socket.on('id', function(id){
    clientId = id
  });

  socket.on('message', function(message) {
    switch(message) {
      case 'dead':
        graphic.dead();
        break;
    }
  })

  socket.on('effect', function(effect) {
    graphic.addEffect(effect);
  });

  socket.on('effects', function(effects) {
    for(i in effects.locations){
      graphic.addEffect({type: effects.type, duration: effects.duration, location: effects.locations[i]});
    }
  });
});

