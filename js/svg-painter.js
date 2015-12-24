/*POINTER EVENTS*/
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.clear();

var SVGNS = "http://www.w3.org/2000/svg",
    XLINKNS = "http://www.w3.org/1999/xlink",
    TAU = 2 * Math.PI,
    SYS_FONTS = "-apple-system, '.SFNSText-Regular', 'San Francisco', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif",
    skins = ["#FFDFC4", "#F0D5BE", "#EECEB3", "#E1B899", "#E5C298", "#FFDCB2", "#E5B887", "#E5A073", "#E79E6D", "#DB9065", "#CE967C", "#C67856", "#BA6C49", "#A57257", "#F0C8C9", "#DDA8A0", "#B97C6D", "#A8756C", "#AD6452", "#5C3836", "#CB8442", "#BD723C", "#704139", "#A3866A", "#870400", "#710101", "#430000", "#5B0001", "#302E2E"],
    COLORS = ["#000000", "#000033", "#000066", "#000099", "#0000CC", "#0000FF", "#003300", "#003333", "#003366", "#003399", "#0033CC", "#0033FF", "#006600", "#006633", "#006666", "#006699", "#0066CC", "#0066FF", "#009900", "#009933", "#009966", "#009999", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#00FF00", "#00FF33", "#00FF66", "#00FF99", "#00FFCC", "#00FFFF", "#330000", "#330033", "#330066", "#330099", "#3300CC", "#3300FF", "#333300", "#333333", "#333366", "#333399", "#3333CC", "#3333FF", "#336600", "#336633", "#336666", "#336699", "#3366CC", "#3366FF", "#339900", "#339933", "#339966", "#339999", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#33FF00", "#33FF33", "#33FF66", "#33FF99", "#33FFCC", "#33FFFF", "#660000", "#660033", "#660066", "#660099", "#6600CC", "#6600FF", "#663300", "#663333", "#663366", "#663399", "#6633CC", "#6633FF", "#666600", "#666633", "#666666", "#666699", "#6666CC", "#6666FF", "#669900", "#669933", "#669966", "#669999", "#6699CC", "#6699FF", "#66CC00", "#66CC33", "#66CC66", "#66CC99", "#66CCCC", "#66CCFF", "#66FF00", "#66FF33", "#66FF66", "#66FF99", "#66FFCC", "#66FFFF", "#990000", "#990033", "#990066", "#990099", "#9900CC", "#9900FF", "#993300", "#993333", "#993366", "#993399", "#9933CC", "#9933FF", "#996600", "#996633", "#996666", "#996699", "#9966CC", "#9966FF", "#999900", "#999933", "#999966", "#999999", "#9999CC", "#9999FF", "#99CC00", "#99CC33", "#99CC66", "#99CC99", "#99CCCC", "#99CCFF", "#99FF00", "#99FF33", "#99FF66", "#99FF99", "#99FFCC", "#99FFFF", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC6666", "#CC6699", "#CC66CC", "#CC66FF", "#CC9900", "#CC9933", "#CC9966", "#CC9999", "#CC99CC", "#CC99FF", "#CCCC00", "#CCCC33", "#CCCC66", "#CCCC99", "#CCCCCC", "#CCCCFF", "#CCFF00", "#CCFF33", "#CCFF66", "#CCFF99", "#CCFFCC", "#CCFFFF", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF6666", "#FF6699", "#FF66CC", "#FF66FF", "#FF9900", "#FF9933", "#FF9966", "#FF9999", "#FF99CC", "#FF99FF", "#FFCC00", "#FFCC33", "#FFCC66", "#FFCC99", "#FFCCCC", "#FFCCFF", "#FFFF00", "#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC", "#FFFFFF"],
    transparent = "transparent",
    black = "#000000",
    white = "#ffffff",
    PIANO_BASE = Math.pow(2, 1 / 12),
    audio = window.AudioContext && new AudioContext(),
    OSCILLATORS = [];

function piano(n) {
  return 440 * Math.pow(PIANO_BASE, n - 49);
}

//setup audio or a polyfill for requestAnimationFrame for when CodePen displays pens in profile views.
var IS_IN_GRID = false,
    initAudio = null,
    play = null,
    noteOn = null,
    noteOff = null,
    MAX_NOTE_COUNT = navigator.maxTouchPoints + 1;

if (audio && audio.createGain) {
  var out = audio.createGain(),
      minNote = 0;
  out.connect(audio.destination);

  initAudio = function (mn, maxNote) {
    var type = arguments.length <= 2 || arguments[2] === undefined ? "sawtooth" : arguments[2];

    minNote = mn || 0;
    for (var i = 0; i < MAX_NOTE_COUNT; ++i) {
      var gn = audio.createGain();
      gn.gain.value = 0;
      var o = audio.createOscillator();
      o.type = type;
      o.frequency.value = 0;
      o.connect(gn);
      o.start();
      gn.connect(out);
      OSCILLATORS.push({
        osc: o,
        gain: gn
      });
    }
  };

  noteOn = function (volume, i) {
    var n = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    var o = OSCILLATORS[n % OSCILLATORS.length],
        f = piano(minNote + parseFloat(i) + 1);
    o.osc.frequency.setValueAtTime(f, 0);
    o.gain.gain.value = parseFloat(volume);
    return o;
  };

  noteOff = noteOn.bind(undefined, 0);

  play = function (i, volume, duration) {
    var n = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    if (OSCILLATORS.length == 0) {
      initAudio(0, 88);
    }
    var o = noteOn(volume, i, n);
    if (o) {
      if (o.timeout) {
        clearTimeout(o.timeout);
        o.timeout = null;
      }
      o.timeout = setTimeout(function () {
        noteOff(i, n);
        o.timeout = null;
      }, duration * 1000);
    }
  };
} else {
  IS_IN_GRID = true;

  // a polyfill to fix animation for the CodePen front-page
  (function () {
    var startT = null;
    window.requestAnimationFrame = function (thunk) {
      setTimeout(function () {
        if (startT == null) {
          startT = Date.now();
        }
        thunk(Date.now() - startT);
      }, 16);
    };
  })();

  initAudio = noteOn = noteOff = play = function () {};
}

Math.randomRange = function (min, max) {
  return Math.random() * (max - min) + min;
};
Math.randomInt = function (min, max) {
  return Math.floor(Math.randomRange(max == undefined ? 0 : min, max == undefined ? min : max));
};
Math.randomSteps = function (min, max, steps) {
  return min + Math.randomInt(0, (1 + max - min) / steps) * steps;
};

Array.prototype.random = function () {
  return this[Math.randomInt(0, this.length)];
};

function group() {
  var g = document.createElementNS(SVGNS, "g");
  Array.prototype.forEach.call(arguments, g.appendChild.bind(g));
  return g;
}

function svg() {
  var g = document.createElementNS(SVGNS, "svg");
  Array.prototype.forEach.call(arguments, g.appendChild.bind(g));
  return g;
}

function makeTransform() {
  var args = Array.prototype.slice.call(arguments),
      name = args.shift(),
      units = args.shift(),
      params = args.map(function (a) {
    return a + units;
  }).join(',');

  return name + "(" + params + ")";
}

SVGElement.prototype.setAttr = function (ns, attr, val) {
  this.setAttributeNS(ns, attr, val);
  return this;
};

var identity = function identity() {},
    translate = function translate(x, y) {
  var units = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
  return makeTransform("translate", units, x, y);
},
    rotate = function rotate(a) {
  var units = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];
  return makeTransform("rotate", units, a);
},
    scale = function scale(x, y) {
  return makeTransform("scale", "", x, y);
},
    use = function use(name) {
  return document.createElementNS(SVGNS, "use").link(name);
},
    rect = function rect(x, y, w, h) {
  return document.createElementNS(SVGNS, "rect").setAttr(null, "x", x).setAttr(null, "y", y).setAttr(null, "width", w).setAttr(null, "height", h);
},
    path = function path() {
  return document.createElementNS(SVGNS, "path");
};

function text(txt, size) {
  var elem = document.createElementNS(SVGNS, "text");
  elem.appendChild(document.createTextNode(txt));
  return elem.setAttr(null, "font-size", size).setAttr(null, "font-family", "Verdana").setAttr(null, "color", "currentColor");
}

SVGElement.prototype.fill = function (color) {
  return this.setAttr(null, "fill", color);
};

SVGElement.prototype.bg = SVGElement.prototype.fill;

SVGElement.prototype.stroke = function (color) {
  return this.setAttr(null, "stroke", color);
};

SVGElement.prototype.strokeWidth = function (size) {
  return this.setAttr(null, "stroke-width", size);
};

SVGElement.prototype.fg = function (color) {
  return this.setAttr(null, "color", color);
};

SVGElement.prototype.link = function (id) {
  return this.setAttr(XLINKNS, "href", id);
};

SVGElement.prototype.d = function (val) {
  return this.setAttr(null, "d", val);
};

SVGElement.prototype.ID = function (val) {
  return this.setAttr(null, "id", val);
};

function transform() {
  var args = Array.prototype.slice.call(arguments),
      elem = args.shift(),
      t = args.join(' ');
  if (elem instanceof SVGElement) {
    elem.setAttr(null, "transform", t);
  } else {
    elem.style.transform = t;
  }
  return elem;
}

SVGElement.prototype.trans = function () {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(this);
  return transform.apply(window, args);
};

CanvasRenderingContext2D.prototype.roundedRect = function (x, y, width, height) {
  var radius = arguments.length <= 4 || arguments[4] === undefined ? 5 : arguments[4];
  var fill = arguments.length <= 5 || arguments[5] === undefined ? true : arguments[5];
  var stroke = arguments.length <= 6 || arguments[6] === undefined ? false : arguments[6];

  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
  if (fill) {
    this.fill();
  }
  if (stroke) {
    this.stroke();
  }
};

CanvasRenderingContext2D.prototype.circle = function (x, y, radius) {
  var fill = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
  var stroke = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

  this.beginPath();
  this.arc(x, y, radius, 0, TAU, false);
  if (fill) {
    this.fill();
  }
  if (stroke) {
    this.stroke();
  }
};

function animate(update, paint, resize) {
  var lt = null,
      dt = 0,
      st = 1000 / 60,
      mt = st * 3,
      ft = st / 1000,
      onpaint = function onpaint(t) {
    requestAnimationFrame(onpaint);
    if (lt != null) {
      dt += t - lt;
      while (dt >= st) {
        if (dt < mt) {
          update(ft, t - lt);
        }
        dt -= st;
      }
      if (paint) {
        paint();
      }
    }
    lt = t;
  };
  requestAnimationFrame(onpaint);
  if (resize) {
    window.addEventListener("resize", resize, false);
    resize();
  }
}

// This function is what is called a "Higher-order function", i.e. it is a function that takes a function as a parameter. Think of it as a function that doesn't know how to do the entire job, but it knows how to do some of it, and asks for the rest of the job as a parameter. It's a convenient way to be able to combine different bits of functionality without having to write the same code over and over again.
function FCT(thunk, evt) {
  // for every point that has changed (we don't need to update points that didn't change, and on the touchend event, there is no element for the most recently released finger in the regular "touches" property).
  for (var i = 0; i < evt.changedTouches.length; ++i) {
    // call whatever function we were given. It's going to be one of start/move/end above, and as you can see, we're overriding the default value of the idx parameter.
    thunk.call(this, evt.changedTouches[i], evt.changedTouches[i].identifier);
  }
  evt.preventDefault();
}

// we want to wire up all of the event handlers to the Canvas element itself, so that the X and Y coordinates of the events are offset correctly into the container.
function E(elem, k, f, t) {
  var elems;
  if (elem instanceof String || typeof elem === "string") {
    elems = Array.prototype.slice.call(document.querySelectorAll(elem));
  } else {
    elems = [elem];
  }
  for (var i = 0; i < elems.length; ++i) {
    elem = elems[i];
    if (t) {
      elem.addEventListener(k, FCT.bind(elem, f), false);
    } else {
      elem.addEventListener(k, f.bind(elem), false);
    }
  }
  return elems;
}

function beginApp(update, render, resize, elem) {
  var lt = null,
      dt = 0,
      st = 1000 / 60,
      mt = st * 3,
      ft = st / 1000,
      points = {},
      keys = {},
      onpaint = function onpaint(t) {
    var ticker = requestAnimationFrame(onpaint);
    try {
      if (lt != null) {
        var realDT = t - lt;
        dt += realDT;
        while (dt >= st) {
          if (dt < mt) {
            update(ft, points, keys);
          }
          dt -= st;
        }
        render(realDT);
      }
    } catch (err) {
      cancelAnimationFrame(ticker);
      throw err;
    }
    lt = t;
  };

  // This function gets called the first time a mouse button is pressed or a new finger touches the screen. The idx value defaults to 10 because mouse clicks don't have an identifier value, but we need one to keep track of mouse clicks separately than touches, which do have identifier values, ending at 9.
  function setPoint(evt) {
    var idx = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    if (idx == 10) {
      evt.preventDefault();
    }

    var obj = {
      x: evt.clientX,
      y: evt.clientY,
      rx: evt.radiusX || 1,
      ry: evt.radiusY || 1,
      b: evt.buttons
    };

    if (obj.b === undefined) {
      obj.b = 1;
    } else if (obj.b > 0 && obj.rx * obj.ry === 1) {
      obj.rx = 1.5;
      obj.ry = 1.5;
    }

    points[idx] = obj;
  }

  // This function gets called anytime the mouse or one of the fingers is released. It just cleans up our tracking objects, so the next time the mouse button is pressed, it can all start over again.
  function endPoint(evt) {
    var idx = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    if (idx == 10) {
      evt.preventDefault();
    }
    delete points[idx];
  }

  function keyDown(evt) {
    keys[evt.keyCode] = true;
    keys.shift = evt.shiftKey;
    keys.ctrl = evt.ctrlKey;
    keys.alt = evt.altKey;
  }

  function keyUp(evt) {
    keys[evt.keyCode] = false;
    keys.shift = evt.shiftKey;
    keys.ctrl = evt.ctrlKey;
    keys.alt = evt.altKey;
  }

  E(elem, "mousedown", setPoint);
  E(elem, "mousemove", setPoint);
  E(elem, "mouseup", endPoint);
  E(elem, "mouseout", endPoint);
  E(elem, "touchstart", setPoint, true);
  E(elem, "touchmove", setPoint, true);
  E(elem, "touchend", endPoint, true);

  E(window, "keydown", keyDown);
  E(window, "keyup", keyUp);
  E(window, "resize", resize);

  resize();
  requestAnimationFrame(onpaint);
}

function findEverything() {
  return Array.prototype.filter.call(document.querySelectorAll("*"), function (e) {
    return e.id;
  }).reduce(function (o, e) {
    return (o[e.id] = e, o);
  }, {});
}

function onKeyCode(time, keys, code, thunk) {
  var delay = arguments.length <= 4 || arguments[4] === undefined ? 0.25 : arguments[4];

  if (!keys[code]) {
    onKeyCode.lastSwitch = onKeyCode.lastSwitch || {};
    onKeyCode.lastSwitch[code] = 0;
  }
  if (keys[code] && time - onKeyCode.lastSwitch[code] >= delay) {
    onKeyCode.lastSwitch[code] = time;
    thunk();
  }
}

function createWorker(script) {
  var stripFunc = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  if (typeof script === "function") {
    script = script.toString();
  }

  if (stripFunc) {
    script = script.trim();
    var start = script.indexOf('{');
    script = script.substring(start + 1, script.length - 1);
  }

  var blob = new Blob([script], {
    type: "text/javascript"
  }),
      dataURI = URL.createObjectURL(blob);

  return new Worker(dataURI);
}

// Because of the significant overhead for serializing and deserializing objects between threads, if your updates are simple, but your data is large, then you will probably be able to process more of them on the main thread than you can communicate between threads. But if your processing is expensive for a relatively small amount of data, the serialization overhead might be worth the effort. Also, running expensive updates on the worker thread will keep the UI thread responsive, so even if the updates can only run at, say, 10FPS, the rendering is still running at 60FPS.

var Workerize = (function () {
  function Workerize(func) {
    var _this = this;

    _classCallCheck(this, Workerize);

    // First, rebuild the script that defines the class. Since we're dealing with pre-ES6 browsers, we have to use ES5 syntax in the script, or invoke a conversion at a point post-script reconstruction, pre-workerization.

    // start with the constructor function
    var script = func.toString(),

    // strip out the name in a way that Internet Explorer also undrestands (IE doesn't have the Function.name property supported by Chrome and Firefox)
    name = script.match(/function (\w+)\(/)[1];

    // then rebuild the member methods
    for (var k in func.prototype) {
      // We preserve some formatting so it's easy to read the code in the debug view. Yes, you'll be able to see the generated code in your browser's debugger.
      script += "\n\n" + name + ".prototype." + k + " = " + func.prototype[k].toString() + ";";
    }

    // Automatically instantiate an object out of the class inside the worker, in such a way that the user-defined function won't be able to get to it.
    script += "\n\n(function(){\n  var instance = new " + name + "();";

    // Create a mapper from the events that the class defines to the worker-side postMessage method, to send message to the UI thread that one of the events occured.
    script += "\n  if(instance.addEventListener){\n    for(var k in instance.listeners) {\n      instance.addEventListener(k, function(){\n        var args = Array.prototype.slice.call(arguments);\n        postMessage(args);\n      }.bind(this, k));\n    }\n  }";

    // Create a mapper from the worker-side onmessage event, to receive messages from the UI thread that methods were called on the object.
    script += "\n\n  onmessage = function(evt){\n    var f = evt.data.shift();\n    if(instance[f]){\n      instance[f].apply(instance, evt.data);\n    }\n  }\n\n})();";

    // The binary-large-object can be used to convert the script from text to a data URI, because workers can only be created from same-origin URIs.
    this.worker = createWorker(script, false);

    // create a mapper from the UI-thread side onmessage event, to receive messages from the worker thread that events occured and pass them on to the UI thread.
    this.listeners = {};
    this.worker.onmessage = function (e) {
      var f = e.data.shift();
      if (_this.listeners[f]) {
        _this.listeners[f].forEach(function (g) {
          return g.apply(_this, e.data);
        });
      }
    };

    // create mappers from the UI-thread side method calls to the UI-thread side postMessage method, to inform the worker thread that methods were called, with parameters.
    for (var k in func.prototype) {
      // we skip the addEventListener method because we override it in a different way, to be able to pass messages across the thread boundary.
      if (k != "addEventListener") {
        this[k] = (function () {
          // convert the varargs array to a real array
          var args = Array.prototype.slice.call(arguments);
          this.worker.postMessage(args);
        }).bind(this, k); // make the name of the function the first argument, no matter what.
      }
    }
  }

  /*BASE*/

  // Adding an event listener just registers a function as being ready to receive events, it doesn't do anything with the worker thread yet.

  Workerize.prototype.addEventListener = function addEventListener(evt, thunk) {
    if (!this.listeners[evt]) {
      this.listeners[evt] = [];
    }
    this.listeners[evt].push(thunk);
  };

  return Workerize;
})();

console.clear();
var ctrls = findEverything(),
    g = ctrls.canv.getContext("2d"),
    LINE_DIST = 10 * devicePixelRatio,
    polygons = [],
    OFF = 0,
    HOVER = 1,
    ON = 2;

function convert(p) {
  var b = ctrls.canv.getBoundingClientRect(),
      q = {
    x: ctrls.canv.width * ((p.x - b.left) / b.width - 0.5),
    y: ctrls.canv.height * ((p.y - b.top) / b.height - 0.5)
  };
  var snap = ctrls.snap.checked ? parseFloat(ctrls.snapValue.value) * devicePixelRatio : 1;
  q.x = snap * Math.round(q.x / snap);
  q.y = snap * Math.round(q.y / snap);
  return q;
}

var clickState = OFF,
    curPoint = undefined,
    layerCounter = 1,
    time = 0;

function moveUp(i) {
  if (this.previousSibling) {
    var _ref = [polygons[i], polygons[i - 1]];
    polygons[i - 1] = _ref[0];
    polygons[i] = _ref[1];

    this.parentNode.insertBefore(this, this.previousSibling);
  }
}

function moveDown(i) {
  if (this.nextSibling) {
    var _ref2 = [polygons[i], polygons[i + 1]];
    polygons[i + 1] = _ref2[0];
    polygons[i] = _ref2[1];

    if (!this.nextSibling.nextSibling) {
      var _parent = this.parentNode;
      _parent.removeChild(this);
      _parent.appendChild(this);
    } else {
      this.parentNode.insertBefore(this, this.nextSibling.nextSibling);
    }
  }
}

E(ctrls.moveUp, "click", function () {
  moveUp.call(ctrls.layers.children[ctrls.layers.selectedIndex], ctrls.layers.selectedIndex);
});

E(ctrls.moveDown, "click", function () {
  moveDown.call(ctrls.layers.children[ctrls.layers.selectedIndex], ctrls.layers.selectedIndex);
});

function startNewPolygon() {
  var opt = document.createElement("option");
  opt.appendChild(document.createTextNode("Layer " + layerCounter++));

  var startX = -1,
      startY = -1,
      isDown = false;
  E(opt, "mousedown", function (e) {
    startX = e.clientX;
    startY = e.clientY;
    isDown = true;
  });

  E(opt, "mouseout", function (e) {
    if (isDown) {
      var dx = e.clientX - startX,
          dy = e.clientY - startY,
          i = this.parentNode.selectedIndex;

      if (dy < 0) {
        moveUp.call(this, i);
      } else if (dy > 0) {
        moveDown.call(this, i);
      }
    }
  });

  E(opt, "mouseup", function (e) {
    isDown = false;
  });

  ctrls.layers.appendChild(opt);
  polygons.push({
    points: []
  });
  ctrls.layers.selectedIndex = polygons.length - 1;
}

startNewPolygon();

function update(dt, points, keys) {
  time += dt;
  var polygon = polygons[ctrls.layers.selectedIndex],
      oldClickState = clickState;
  clickState = OFF;
  for (var f in points) {
    var p = points[f],
        pressure = p.rx * p.ry;
    curPoint = convert(p);

    if (ctrls.use3Dtouch.checked) {
      if (oldClickState != ON) {
        if (pressure >= 1.7) {
          clickState = ON;
        } else if (pressure >= 1) {
          clickState = HOVER;
        } else {
          clickState = OFF;
        }
      } else if (pressure <= 1.5) {
        clickState = OFF;
      } else {
        clickState = oldClickState;
      }
    } else if (pressure > 1) {
      clickState = ON;
    }
  }

  if (oldClickState != ON && clickState == ON) {
    navigator.vibrate(25);
    polygon.points.push(curPoint);
    var completed = completePolygon(clone(polygon));
    if (completed) {
      saveCurrentPolygon();
    }
  } else if (oldClickState == ON && clickState != ON) {
    navigator.vibrate(25);
  }
}

function saveCurrentPolygon() {
  var polygon = polygons[ctrls.layers.selectedIndex];
  polygon.mirrorX = ctrls.mirrorX.checked;
  polygon.mirrorY = ctrls.mirrorY.checked;
  startNewPolygon();
}

function completePolygon(polygon, addCurrent) {
  if (polygon.mirrorX === undefined) {
    polygon.mirrorX = ctrls.mirrorX.checked;
    polygon.mirrorY = ctrls.mirrorY.checked;
  }
  var x = polygon.mirrorX ? 1 : -1,
      y = polygon.mirrorY ? 1 : -1,
      done = false,
      snap = parseFloat(ctrls.snapValue.value);
  if (addCurrent && curPoint) {
    polygon.points.push(clone(curPoint));
  }
  if (x == 1 || y == 1) {
    for (var i = polygon.points.length - 1; i >= 0; --i) {
      var p = polygon.points[i];
      var q = {
        x: x * p.x,
        y: y * p.y
      },
          dx = q.x - p.x,
          dy = q.y - p.y,
          dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > snap) {
        polygon.points.push(q);
      } else {
        done = true;
      }
    }
  }
  return done;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function drawPolygon(g, polygon, fill, stroke, lineWidth) {
  g.lineWidth = lineWidth;
  g.strokeStyle = stroke;
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(polygon[0].x, polygon[0].y);
  for (var i = 1; i < polygon.length; ++i) {
    g.lineTo(polygon[i].x, polygon[i].y);
  };
  g.closePath();
  g.stroke();
  g.fill();
}

function render() {
  g.save();
  g.translate(canv.width / 2, canv.height / 2);
  drawBG();
  if (ctrls.rotate.checked) {
    g.rotate(time);
  }
  for (var j = 0; j < polygons.length; ++j) {
    var polygon = clone(polygons[j]);

    completePolygon(polygon, j == ctrls.layers.selectedIndex);

    if (polygon.points.length > 0) {
      drawPolygon(g, polygon.points, "rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0, 0.5)", 3 * devicePixelRatio);
    }
  }
  g.restore();
}

function resize() {
  var bounds = ctrls.canv.getBoundingClientRect();
  ctrls.canv.width = bounds.width * devicePixelRatio;
  ctrls.canv.height = bounds.height * devicePixelRatio;
}

function drawAxis(l, d, axis) {
  g.beginPath();
  var dimA = (axis ? ctrls.canv.width : ctrls.canv.height) / 2,
      dimB = (axis ? ctrls.canv.height : ctrls.canv.width) / 2;
  for (var i = 0; i < dimA; i += d) {
    if (axis) {
      g.moveTo(i, -dimB);
      g.lineTo(i, dimB);
      g.moveTo(-i, -dimB);
      g.lineTo(-i, dimB);
    } else {
      g.moveTo(-dimB, i);
      g.lineTo(dimB, i);
      g.moveTo(-dimB, -i);
      g.lineTo(dimB, -i);
    }
  }
  g.lineWidth = l * devicePixelRatio;
  g.stroke();
}

function drawBG() {
  g.fillStyle = "#69f";
  g.fillRect(-ctrls.canv.width / 2, -ctrls.canv.height / 2, ctrls.canv.width, ctrls.canv.height);
  g.strokeStyle = "#ccf";
  drawAxis(0.75, LINE_DIST, true);
  drawAxis(2, LINE_DIST * 5, true);
  drawAxis(5, LINE_DIST * canv.height, true);
  drawAxis(0.75, LINE_DIST);
  drawAxis(2, LINE_DIST * 5);
  drawAxis(5, LINE_DIST * canv.width);
}

E(ctrls.mirrorX, "change", function (e) {
  if (ctrls.mirrorY.checked && ctrls.mirrorX.checked) {
    ctrls.mirrorY.checked = false;
  }
});

E(ctrls.mirrorY, "change", function (e) {
  if (ctrls.mirrorY.checked && ctrls.mirrorX.checked) {
    ctrls.mirrorX.checked = false;
  }
});

function undo() {
  var polygon = polygons[ctrls.layers.selectedIndex];
  if (polygon.points.length > 0) {
    polygon.points.pop();
  } else if (polygons.length > 1) {
    deletePolygon();
    undo();
  }
}

E(ctrls.undo, "click", undo);

function deletePolygon() {
  if (polygons.length > 1) {
    polygons.splice(ctrls.layers.selectedIndex, 1);
    ctrls.layers.removeChild(ctrls.layers.children[ctrls.layers.selectedIndex]);
    if (ctrls.layers.selectedIndex == -1) {
      ctrls.layers.selectedIndex = polygons.length - 1;
    }
  }
}

E(ctrls.deleteCurrent, "click", deletePolygon);

function toggleMenu() {
  var cs = this.parentNode.children,
      c = null;
  for (var i = 2; i < cs.length; ++i) {
    c = cs[i];
    if (c.style.display == "none") {
      c.style.display = "";
    } else {
      c.style.display = "none";
    }
  }
  if (c) {
    var collapsed = c.style.display == "none";
    this.fill(collapsed ? "rgba(0, 0, 0, 0.5)" : "transparent");
    this.fg(collapsed ? "transparent" : "rgba(0, 0, 0, 0.5)");
    this.parentNode.style.width = collapsed ? "" : "100%";
  }
}

E(".menuControl", "click", toggleMenu).forEach(function (e) {
  return toggleMenu.call(e);
});
toggleMenu.call(ctrls.layersWindow);

function save(formatter) {
  var data = clone(polygons),
      scale = parseFloat(ctrls.scale.value);
  data.pop(); // don't print out the last polygon
  for (var i = 0; i < data.length; ++i) {
    completePolygon(data[i]);
    data[i] = data[i].points;
    for (var j = 0; j < data[i].length; ++j) {
      data[i][j].x *= scale;
      data[i][j].y *= scale;
    }
  }
  ctrls.output.style.display = "block";
  ctrls.output.value = formatter(data);
}

function formatCanvas(data) {
  return drawPolygon.toString() + "\n\nvar polygons = " + JSON.stringify(data) + ";\n\nfor(var i = 0; i < polygons.length; ++i){\n  drawPolygon(g, polygons[i], \"rgba(255, 255, 255, 0.5)\", \"rgba(0, 0, 0, 0.5)\", 3);\n}";
}

function formatSVG(data) {
  var minX = Number.MAX_VALUE,
      minY = Number.MAX_VALUE,
      maxX = Number.MIN_VALUE,
      maxY = Number.MIN_VALUE,
      paths = [];

  for (var i = 0; i < data.length; ++i) {
    var polygon = data[i];
    var path = "";
    for (var j = 0; j < polygon.length; ++j) {
      var p = polygon[j];
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
      if (j === 0) {
        path += ("M" + p.x + " " + p.y).replace(" -", "-");
      } else if (polygon[j - 1].x === p.x) {
        path += "V" + p.y;
      } else if (polygon[j - 1].y === p.y) {
        path += "H" + p.x;
      } else {
        path += ("L" + p.x + " " + p.y).replace(" -", "-");
      }
    }
    paths.push(path);
  }
  var width = maxX - minX,
      height = maxY - minY,
      polys = paths.map(function (p, i) {
    return "<path id=\"poly" + i + "\" class=\"st0\" d=\"" + p + "Z\"/>";
  }).join("\n  "),
      bounds = minX + " " + minY + " " + width + " " + height;
  return "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"" + bounds + "\" width=\"" + width + "\" height=\"" + height + "\">\n  <style type=\"text/css\">\n    .st0{fill:rgba(255, 255, 255, 0.5);stroke:rgba(0, 0, 0, 0.5);stroke-width:3;}\n  </style>\n  " + polys + "\n</svg>";
}

E(ctrls.saveCanvas, "click", save.bind(undefined, formatCanvas));

E(ctrls.saveSVG, "click", save.bind(undefined, formatSVG));

E(ctrls.startNew, "click", saveCurrentPolygon);

beginApp(update, render, resize, canv);