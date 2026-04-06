import $ from 'jquery';

var DEVICE = function () {
  var ua = navigator.userAgent;
  var ualow = ua.toLowerCase();
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  var ispc = true;
  var ismobile = false;
  var ie6 = !-[1] && !window.XMLHttpRequest;
  var ie7 = ua.search(/MSIE 7/i) != -1;
  var ie8 = ua.search(/MSIE 8/i) != -1;
  for (var v = 0; v < Agents.length; v++) {
    if (ua.indexOf(Agents[v]) > 0) {
      ispc = false;
      ismobile = true;
      break;
    }
  }
  var supportCss3 = function supportCss3(prop) {
    var div = document.createElement("div"),
      vendors = "ms Ms O Moz Webkit".split(" ");
    if (prop in div.style) return true;
    prop = prop.replace(/^[a-z]/, function (val) {
      return val.toUpperCase();
    });
    for (var i in vendors) {
      if (vendors[i] + prop in div.style) {
        return true;
      }
    }
    return false;
  };
  var supportTag = function supportTag(tagname, attr) {
    if (!attr) {
      return !!document.createElement(tagname);
    } else {
      return !!(attr in document.createElement(tagname));
    }
  };
  var ieVersion = function ieVersion() {
    var matchers = navigator.userAgent.match(/MSIE (\d+)/);
    var version = matchers && matchers[1];
    return version;
  };
  return {
    isAndroid: ua.indexOf("Android") > -1 || ua.indexOf("Adr") > -1,
    isiOS: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    isWeixin: ualow.match(/MicroMessenger/i) == "micromessenger",
    isPc: ispc,
    isMobile: ismobile,
    isQQ: ualow.match(/QQ/i) == "qq" && ualow.match(/QQBrowser/i) != "qqbrowser",
    isQQBrowser: ualow.match(/QQBrowser/i) == "qqbrowser",
    isIe6: ie6,
    isIe: window.ActiveXObject ? true : false,
    isIe7: ie7,
    isIe8: ie8,
    ieVersion: ieVersion(),
    supportCss3: supportCss3,
    support_css3: supportCss3,
    supportTag: supportTag
  };
}();

/**
    @author:pengzai
    @blog:http://foliou.focusbe.com
    @github:https://github.com/focusbe/foliou
**/
var Touch = function Touch(element, callbacks) {
  var startPosition, delta;
  var _self = this;
  var _startEvent, _moveEvent, _endEvent;
  var _temptouch;
  var _isTouched = false;
  this._init = function () {
    if (!element) {
      console.warn()("缺少参数");
      return;
    }
    if (DEVICE.isMobile) {
      _startEvent = "touchstart";
      _moveEvent = "touchmove";
      _endEvent = "touchend";
    } else {
      _startEvent = "mousedown";
      _moveEvent = "mousemove";
      _endEvent = "mouseup";
    }
    _self.bind();
  };
  this.bind = function () {
    element.addEventListener(_startEvent, _self._startHandle, false);
    document.addEventListener(_moveEvent, _self._moveHandle, false);
    element.addEventListener(_endEvent, _self._endHandle, false);
    document.addEventListener(_endEvent, _self._endHandle, false);
  };
  this.unbind = function () {
    element.removeEventListener(_startEvent, _self._startHandle, false);
    document.removeEventListener(_moveEvent, _self._moveHandle, false);
    element.removeEventListener(_endEvent, _self._endHandle, false);
    document.removeEventListener(_endEvent, _self._endHandle, false);
  };
  this._startHandle = function (e) {
    _isTouched = true;
    if (!!e.touches) {
      _temptouch = e.touches[0];
    } else if (typeof e.pageX != "undefined" && typeof e.pageY != "undefined") {
      _temptouch = {
        pageX: e.pageX,
        pageY: e.pageY
      };
    } else {
      return;
    }
    startPosition = {
      x: _temptouch.pageX,
      y: _temptouch.pageY
    };
    if (typeof callbacks.start == "function") {
      callbacks.start(startPosition, e);
    }
  };
  this._moveHandle = function (e) {
    if (!_isTouched) {
      return;
    }
    if (!!e.changedTouches && typeof e.changedTouches != "undefined") {
      _temptouch = e.changedTouches[0];
    } else if (typeof e.pageX != "undefined" && typeof e.pageY != "undefined") {
      _temptouch = {
        pageX: e.pageX,
        pageY: e.pageY
      };
    } else {
      return;
    }
    delta = {
      x: _temptouch.pageX - startPosition.x,
      y: _temptouch.pageY - startPosition.y
    };
    if (typeof callbacks.move == "function") {
      callbacks.move(delta, e);
    }
  };
  this._endHandle = function (e) {
    if (!_isTouched) {
      return;
    }
    _isTouched = false;
    if (!!e.changedTouches && typeof e.changedTouches != "undefined") {
      _temptouch = e.changedTouches[0];
    } else if (typeof e.pageX != "undefined" && typeof e.pageY != "undefined") {
      _temptouch = {
        pageX: e.pageX,
        pageY: e.pageY
      };
    } else {
      return;
    }
    if (typeof callbacks.end == "function") {
      delta = {
        x: _temptouch.pageX - startPosition.x,
        y: _temptouch.pageY - startPosition.y
      };
      if (typeof callbacks.end == "function") {
        callbacks.end(delta, e);
      }
    }
  };
  this._init();
};

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

if (!window.JSON) {
  window.JSON = {
    parse: function parse(jsonStr) {
      //return eval("(" + jsonStr + ")");
    },
    stringify: function stringify(jsonObj) {
      var result = "",
        curVal;
      if (jsonObj === null) {
        return String(jsonObj);
      }
      switch (_typeof(jsonObj)) {
        case "number":
        case "boolean":
          return String(jsonObj);
        case "string":
          return '"' + jsonObj + '"';
        case "undefined":
        case "function":
          return undefined;
      }
      switch (Object.prototype.toString.call(jsonObj)) {
        case "[object Array]":
          result += "[";
          for (var i = 0, len = jsonObj.length; i < len; i++) {
            curVal = JSON.stringify(jsonObj[i]);
            result += (curVal === undefined ? null : curVal) + ",";
          }
          if (result !== "[") {
            result = result.slice(0, -1);
          }
          result += "]";
          return result;
        case "[object Date]":
          return '"' + (jsonObj.toJSON ? jsonObj.toJSON() : jsonObj.toString()) + '"';
        case "[object RegExp]":
          return "{}";
        case "[object Object]":
          result += "{";
          for (i in jsonObj) {
            if (jsonObj.hasOwnProperty(i)) {
              curVal = JSON.stringify(jsonObj[i]);
              if (curVal !== undefined) {
                result += '"' + i + '":' + curVal + ",";
              }
            }
          }
          if (result !== "{") {
            result = result.slice(0, -1);
          }
          result += "}";
          return result;
        case "[object String]":
          return '"' + jsonObj.toString() + '"';
        case "[object Number]":
        case "[object Boolean]":
          return jsonObj.toString();
      }
    }
  };
}
var Utli = {
  log: function log(str) {
    //输出信息，只在测试环境输出
    if (!this.isdev() && !!window.console) {
      console.log(str);
    }
  },
  query: function query(str) {
    if (typeof str == "string") {
      str = $(str);
    }
    // console.log(str + "");
    var isjquery = !!str && !!str.__proto__ && !!str.__proto__.jquery;
    if (isjquery) {
      var res = [];
      if (str.length > 1) {
        str.each(function () {
          res.push(this);
        });
      } else {
        res = str[0];
      }
      //console.log(res);
      return res;
    }
    return str;
  },
  isZtgameDev: function isZtgameDev() {
    //是否是测试环境
    var winhost = window.location.host;
    return winhost.indexOf("web.ztgame.com") > -1 || winhost.indexOf("dev.ztgame.com") > -1 || winhost == "localhost";
  },
  isNaN: function isNaN(str) {
    var reg = /^[\d]+$/;
    return reg.test(str);
  },
  jsonToUrl: function jsonToUrl(json) {
    var url = "";
    var type;
    if (!!json && _typeof(json) == "object") {
      for (var i in json) {
        type = _typeof(json[i]);
        switch (type) {
          case "object":
            json[i] = JSON.stringify(json[i]);
            break;
        }
        if (!!url) {
          url += "&";
        }
        url += i + "=" + json[i];
      }
    }
    return url;
  },
  getParam: function getParam(name) {
    //获取url中的 参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },
  getAllParams: function getAllParams() {
    //获取search 所有参数
    var params = {};
    var searchStr = window.location.search.replace("?", "");
    var searchArr = searchStr.split("&");
    var temp;
    if (!!searchArr && _typeof(searchArr) == "object") {
      for (var i in searchArr) {
        if (!!searchArr[i]) {
          temp = searchArr[i].split("=");
          if (!!temp && !!temp[0]) {
            if (!!temp[1]) {
              if (temp[1] == "true") {
                temp[1] = true;
              }
              if (temp[1] == "false") {
                temp[1] = false;
              }
              if (temp[1] == "null" || temp[1] == "undefined") {
                temp[1] = null;
              }
              params[temp[0]] = temp[1];
            } else {
              params[temp[0]] = "";
            }
          }
        }
      }
    }
    return params;
  }
};

//获取js，css3浏览器前缀
/**
    @author:pengzai
    @blog:http://foliou.focusbe.com
    @github:https://github.com/focusbe/foliou
**/

var prefix = function prefix() {
  if (typeof window.getComputedStyle == "undefined") {
    return {
      dom: "",
      lowercase: "",
      css: "",
      js: ""
    };
  }
  var styles = window.getComputedStyle(document.documentElement, ""),
    pre = (Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) || styles.OLink === "" && ["", "o"])[1],
    dom = "WebKit|Moz|MS|O".match(new RegExp("(" + pre + ")", "i"))[1];
  return {
    dom: dom,
    lowercase: pre,
    css: "-" + pre + "-",
    js: pre == "ms" ? "ms" : pre[0].toUpperCase() + pre.substr(1)
  };
};
var PREFIX = prefix();

var support_css3 = DEVICE.support_css3;
function upFirst(str) {
  // str = str.toLowerCase();
  var strarr = str.split(" ");
  var result = "";
  for (var i in strarr) {
    result += strarr[i].substring(0, 1).toUpperCase() + strarr[i].substring(1) + "";
  }
  return result;
}
var css3unit = {
  deg: ["rotate(.*)", "skew(.*)"],
  px: ["width", "height", "x", "y", "translate(.+)", "margin(.*)", "padding(.+)"]
};
//var transformStyle = ["scale", "rotate", "translate", "skew", "perspective"];
// function istransformstyle(style) {
//     if (style == "x" || style == "y" || style == "z") {
//         style = "translate";
//     }
//     for (var i in transformStyle) {
//         if (isSameStyle(style, transformStyle[i])) {
//             return true;
//         }
//     }
//     return false;
// }
// function isSameStyle(str1, str2) {
// 	if (str1.toLowerCase() == str2.toLowerCase()) {
// 		return true;
// 	} else {
// 		return false;
// 	}
// }

function getUnit(str) {
  var curArr;
  var returnUnit = "";
  for (var i in css3unit) {
    curArr = css3unit[i];
    for (var j in curArr) {
      if (curArr[j].indexOf('(') > -1) {
        if (str.match(new RegExp(curArr[j], "ig"))) {
          if (i == "no") {
            returnUnit = "";
          } else {
            returnUnit = i;
          }
          return returnUnit;
        }
      } else {
        if (curArr[j] == str) {
          if (i == "no") {
            returnUnit = "";
          } else {
            returnUnit = i;
          }
          return returnUnit;
        }
      }
    }
  }
  return returnUnit;
}
function css3format(styles) {
  var transformstr = "";
  var originstr = "50% 50%";
  var curvalue;
  var css2style = {};
  for (var i in styles) {
    curvalue = styles[i];
    // console.log(i);
    var unit = getUnit(i);
    if (!isNaN(curvalue)) {
      curvalue += unit;
    }
    switch (i) {
      case "translate":
        transformstr += "translate(" + curvalue + "," + curvalue + ") ";
        break;
      case "x":
        transformstr += "translateX(" + curvalue + ") ";
        break;
      case "y":
        transformstr += "translateY(" + curvalue + ") ";
        break;
      case "z":
        transformstr += "translateZ(" + curvalue + ") ";
        break;
      case "scaleX":
        transformstr += "scaleX(" + curvalue + ") ";
        break;
      case "scaleY":
        transformstr += "scaleY(" + curvalue + ") ";
        break;
      case "scaleZ":
        transformstr += "scaleZ(" + curvalue + ") ";
        break;
      case "scale":
        transformstr += "scale(" + curvalue + ") ";
        break;
      case "rotate":
        transformstr += "rotate(" + curvalue + ") ";
        break;
      case "rotateX":
        transformstr += "rotateX(" + curvalue + ") ";
        break;
      case "rotateY":
        transformstr += "rotateY(" + curvalue + ") ";
        break;
      case "rotateZ":
        transformstr += "rotateZ(" + curvalue + ") ";
        break;
      case "skewX":
        transformstr += "skewX(" + curvalue + ") ";
        break;
      case "skewY":
        transformstr += "skewY(" + curvalue + ") ";
        break;
      case "skew":
        transformstr += "skew(" + curvalue + ") ";
        break;
      case "perspective":
        transformstr += "perspective(" + curvalue + ") ";
        break;
      case "origin":
        originstr = curvalue;
        break;
      default:
        css2style[i] = curvalue;
    }
  }
  return {
    origin: originstr,
    transform: transformstr,
    css2: css2style
  };
}
function getCss3(element) {
  element = Utli.query(element);
  // console.log(element);
  var transformstr = element.style[PREFIX.js + "Transform"];
  if (!transformstr) {
    return {};
  }
  var temp = transformstr.split(" ");
  var key;
  var value;
  var temkeyvalue;
  var styleObj = {};
  for (var i in temp) {
    temkeyvalue = temp[i].split("(");
    if (temkeyvalue.length < 2) break;
    key = $.trim(temkeyvalue[0]);
    if (key == "translateX") key = "x";
    if (key == "translateY") key = "y";
    if (key == "translateZ") key = "z";
    value = $.trim(temkeyvalue[1].replace(")", "").replace("px", ""));
    styleObj[key] = value;
  }
  return styleObj;
}
function setcss3(element, style, value) {
  element = Utli.query(element);
  if (!element) {
    return;
  }
  if (element instanceof Array) {
    for (var i in element) {
      setcss3(element[i], style, value);
    }
    return;
  }
  element.style[PREFIX.js + upFirst(style)] = value;
  element.style[style] = value;
}
function setStyle(element, styles, animate, justCss3) {
  element = Utli.query(element);
  if (!element) {
    return;
  }
  if (element instanceof Array) {
    for (var i in element) {
      setStyle(element[i], styles, animate, justCss3);
    }
    return;
  }
  if (typeof animate == "undefined") animate = false;else if (typeof animate == "function") {
    callback = animate;
    animate = false;
  }
  if (!animate && support_css3("transition")) {
    var transitionstr = "all 0s linear ";
    $(element).css("transition", transitionstr);
    $(element).css(PREFIX.css + "transition", transitionstr);
  }
  var curCss3 = getCss3(element);
  var cssobj = css3format($.extend(curCss3, styles));
  element.style[PREFIX.css + "transform"] = cssobj.transform;
  $(element).css(PREFIX.css + "transform-origin", cssobj.origin);
  if (!justCss3) {
    $(element).css(cssobj.css2);
  }
}
function pauseanimation(element) {
  if (!support_css3("animation")) {
    return;
  }
  element = Utli.query(element);
  if (!element) {
    return;
  }
  setcss3(element, "animationPlayState", "paused");
}
function resumeanimation(element) {
  if (!support_css3("animation")) {
    return;
  }
  setcss3(element, "animationPlayState", "running");
}
function stopanimation(element) {
  if (!support_css3("animation")) {
    return;
  }
  element = Utli.query(element);
  if (!element) {
    return;
  }
  setcss3(element, "animationPlayState", "paused");
  setcss3(element, "animationName", "none");
  setcss3(element, "animationDuration", 0);
  setcss3(element, "animationTimingFunction", "linear");
  setcss3(element, "animationDelay", 0);
  setcss3(element, "animationIterationCount", "none");
  setcss3(element, "animationDirection", "none");
  setcss3(element, "animationFillMode", "none");
}
function runanimation(element, keyframe, options, _callback3) {
  element = Utli.query(element);
  if (!element) {
    return;
  }
  if (typeof keyframe == "undefined" || !keyframe) {
    return;
  }
  if (typeof options == "undefined" || !options) {
    options = {};
  } else if (typeof options == "function") {
    _callback3 = options;
    options = {};
  }
  if (!support_css3("animation")) {
    if (typeof _callback3 == "function") {
      _callback3();
    }
    return;
  }
  if (element instanceof Array) {
    var newcallback = null;
    for (var i in element) {
      if (i == element.length - 1 && !!_callback3) {
        newcallback = _callback3;
      }
      runanimation(element[i], keyframe, options, newcallback);
    }
    return;
  }
  var defaultOption = {
    speed: 400,
    easing: "linear",
    count: 1,
    delay: 0,
    direction: "normal",
    fillmode: "both"
  };
  options = $.extend(defaultOption, options);
  if (!isNaN(options.speed)) {
    options.speed += "ms";
  }
  if (!isNaN(options.delay)) {
    options.delay += "ms";
  }
  var thecallback = _callback3;
  setcss3(element, "animationName", keyframe);
  setcss3(element, "animationDuration", options.speed);
  setcss3(element, "animationTimingFunction", options.easing);
  setcss3(element, "animationDelay", options.delay);
  setcss3(element, "animationIterationCount", options.count);
  setcss3(element, "animationDirection", options.direction);
  setcss3(element, "animationPlayState", "running");
  setcss3(element, "animationFillMode", options.fillmode);
  if (typeof _callback3 == "undefined") {
    _callback3 = function _callback() {};
  } else {
    _callback3 = function _callback() {
      element.removeEventListener(PREFIX.js + "AnimationEnd", _callback3, false);
      element.removeEventListener("animationend", _callback3, false);
      setTimeout(function () {
        if (typeof thecallback == "function") {
          thecallback();
        }
      });
    };
  }
  element.addEventListener(PREFIX.js + "AnimationEnd", _callback3, false);
  element.addEventListener("animationend", _callback3, false);
}
function nopx(val) {
  if (!val) {
    return "";
  }
  return val.toString().replace("px", "");
}
function hasSameStyle(element, styles) {
  if (_typeof(styles) != "object" || !element) {
    return false;
  }
  var curCss3 = getCss3(element);
  var isSame = true;
  for (var i in styles) {
    if (styles[i] != curCss3[i] && nopx(styles[i]) != nopx($(element).css(i))) {
      isSame = false;
      break;
    }
  }
  return isSame;
}
function css3animate(element, styles, speed, easing, _callback2) {
  element = Utli.query(element);
  if (!element || !styles) {
    return;
  }
  if (typeof speed == "undefined") {
    speed = 400;
    easing = "linear";
  } else if (typeof speed == "function") {
    _callback2 = speed;
    speed = 400;
    easing = "linear";
  }
  if (typeof easing == "undefined") {
    easing = "linear";
  }
  if (typeof easing == "function") {
    _callback2 = easing;
    easing = "linear";
  }
  if (element instanceof Array) {
    var newcallback;
    for (var i in element) {
      if (i == element.length - 1 && !!_callback2) {
        newcallback = _callback2;
      }
      css3animate(element[i], styles, speed, easing, newcallback);
    }
    return;
  }
  if (!support_css3("transform")) {
    $(element).animate(styles, speed, easing, _callback2);
    return;
  } else if (!support_css3("transition")) {
    setStyle(element, styles, true, true);
    $(element).animate(styles, speed, easing, _callback2);
    return;
  }

  //判断是否已经是当前的属性
  if (hasSameStyle(element, styles)) {
    if (typeof _callback2 == "function") {
      setTimeout(_callback2, speed);
    }
    return;
  }
  var thecallback = _callback2;
  if (typeof _callback2 == "undefined") {
    _callback2 = function callback() {};
  } else {
    _callback2 = function callback() {
      element.removeEventListener("transitionend", _callback2, false);
      setTimeout(function () {
        if (typeof thecallback == "function") {
          thecallback();
        }
      });
    };
  }
  //console.log(support_css3("transition"));
  var duration = speed / 1000 + "s";
  var transitionstr = "all " + duration + " " + easing;
  $(element).css("transition", transitionstr);
  $(element).css(PREFIX.css + "transition", transitionstr);
  setStyle(element, styles, true);
  element.addEventListener("transitionend", _callback2, false);
}
var Animate = {
  set: function set(element, styleObj) {
    setStyle(element, styleObj, false);
  },
  getCss3: getCss3,
  to: css3animate,
  keyframe: {
    run: runanimation,
    pause: pauseanimation,
    resume: resumeanimation,
    stop: stopanimation
  }
};

var Swiper = function Swiper(container, options) {
  var self = this;
  container = $(container);
  var defaultoption = {
    mode: "auto",
    className: {
      next: "next",
      prev: "prev"
    },
    animation: "slide",
    start: 0,
    item_list: container.children(".swiper-wrapper"),
    item: container.children(".swiper-wrapper").children(".swiper-slide"),
    next_btn: null,
    prev_btn: null,
    index_btn: null,
    dock: true,
    direction: "horizontal",
    dock_trigger: "click",
    index_trigger: "click",
    time: 400,
    onClass: "active",
    autoPlay: true,
    autoDelayTime: 5000,
    loop: true,
    onStart: function onStart() {},
    onEnd: function onEnd() {}
  };
  var options = $.extend({}, defaultoption, options);
  var current = 0;
  var total = 0;
  var perDitance = 0;
  var clock = null;
  var isVer = isVer;
  var _init = function _init() {
    total = options.item.length;
    if (total <= 1) {
      return;
    }
    if (isVer) {
      imgLoaded(options.item.eq(0), function () {});
    } else {
      options.item.css({
        display: "inline-block"
      });
      options.item_list.css({
        whiteSpace: "nowrap",
        fontSize: 0
      });
    }
    //添加dock
    _addDock();
    addLoop();
    resize();
    bind();
    setAuto();
    // autoPlay();
    // self.goto(options.start);
    // judgeBtn(options.start);
  };
  var addLoop = function addLoop() {
    //添加循环的时候 两边的元素
    var clonelast = options.item.eq(total - 1).clone();
    var clonefirst = options.item.eq(0).clone();
    if (isVer) {
      clonelast.css({
        marginTop: "-100%"
      });
    } else {
      clonelast.css({
        marginLeft: "-100%"
      });
    }
    options.item_list.prepend(clonelast);
    options.item_list.append(clonefirst);
  };
  var _addDock = function _addDock() {
    if (!!options.dock) {
      if (!options.dock_wrap) {
        options.dock_wrap = $("<div class='swiper-pagination'></div>");
        container.append(options.dock_wrap);
      }
    }
    if (options.dock_wrap) {
      var dock_wrap_html = "";
      for (var i = 0; i < total; i++) {
        if (i == 0) {
          dock_wrap_html += "<span class='" + options.onClass + "'></span>";
        } else {
          dock_wrap_html += "<span></span>";
        }
      }
      options.dock_wrap.html(dock_wrap_html);
      options.dock_wrap.find("span");
    }
  };
  var setAuto = function setAuto() {
    if (!options.autoPlay) {
      return;
    }
    if (!!clock) {
      clearInterval(clock);
      clock = null;
    }
    clock = setInterval(function () {
      self.goto(current + 1);
    }, options.autoDelayTime);
  };
  var resize = function resize() {
    if (isVer) {
      perDitance = options.item.outerHeight();
      options.item.outerWidth();
      container.css({
        height: perDitance
      });
    } else {
      perDitance = options.item.outerWidth();
      options.item.outerHeight();
      options.item_list.css({
        width: perDitance
      });
    }
  };
  this.goToNext = function () {
    self.goto(current + 1);
  };
  this.goto = function (index, auto) {
    // console.log(index);
    var offset = index - current;
    Animate.to(options.item_list, {
      x: -offset * perDitance
    }, 200, function () {
      //console.log(-index * 100 + "%");
      current = index % total;
      if (current < 0) {
        current += total;
      }
      //console.log(index);
      Animate.set(options.item_list, {
        x: 0,
        left: -current * 100 + "%"
      });
      judgeBtn(current);
    });
  };
  var judgeBtn = function judgeBtn(index) {
    options.dock_wrap.find("span").removeClass(options.onClass);
    options.dock_wrap.find("span").eq(index).addClass(options.onClass);
    if (options.loop) {
      return;
    }
    if (options.next_btn && options.prev_btn) {
      if (index == total - 1) {
        options.prev_btn.css({
          opacity: 1,
          cursor: "pointer"
        }).show();
        options.next_btn.css({
          opacity: 0.8,
          cursor: "default"
        }).hide();
      } else if (index == 0) {
        options.prev_btn.css({
          opacity: 0.8,
          cursor: "default"
        }).hide();
        options.next_btn.css({
          opacity: 1,
          cursor: "pointer"
        }).show();
      } else {
        options.next_btn.css({
          opacity: 1,
          cursor: "pointer"
        }).show();
        options.prev_btn.css({
          opacity: 1,
          cursor: "pointer"
        }).show();
      }
    }
  };
  var bind = function bind() {
    container.find("img").on("mousedown", function (e) {
      e.preventDefault();
    });
    // if (options.next_btn) {
    // 	options.next_btn.bind("click", function() {
    // 		self.goto(current + 1, false, -1);
    // 	});
    // }
    // if (options.prev_btn) {
    // 	options.prev_btn.bind("click", function() {
    // 		self.goto(current - 1, false, 1);
    // 	});
    // }
    // if (options.index_btn) {
    // 	options.index_btn.bind(options.index_trigger, function() {
    // 		var index = $(this).index();
    // 		self.goto(index);
    // 	});
    // }
    // if (docks) {
    // 	docks.unbind(options.dock_trigger).bind(options.dock_trigger, function() {
    // 		var index = $(this).index();
    // 		self.goto(index);
    // 	});
    // }
    var isstart = false;
    //var oldVal = parseInt(options.item_list.css("left"));
    var offset = 0;
    self.touch = new Touch(container[0], {
      start: function start(point) {
        isstart = true;
        // lastdelay = {
        // 	x: 0,
        // 	y: 0
        // };
        //oldVal = parseInt(options.item_list.css("left"));
        setAuto();
      },
      move: function move(delta) {
        if (!isstart) {
          return;
        }
        if (options.loop) {
          offset = isVer ? delta.y : delta.x;
        } else {
          var max = perDitance;
          var x = delta.x < max ? delta.x : max;
          var y = (x - x * x / (2 * max)) / 6;
          offset = y;
        }
        // setAuto();
        // console.log(x, y);
        // if(current==0){

        // }
        if (isVer) {
          Animate.set(options.item_list, {
            y: offset
          });
        } else {
          Animate.set(options.item_list, {
            x: offset
          });
        }
      },
      end: function end(point) {
        setAuto();
        // curY = point.y + curY;
        // curX = point.x + curX;
        // Animate.to(
        // 	options.item_list,
        // 	{
        // 		x: 0
        // 	},
        // 	100
        // );
        var bili = offset / perDitance;
        // console.log(bili);
        if (Math.abs(bili) > 0.2) {
          var direc = bili / Math.abs(bili);
          self.goto(current - direc);
        } else {
          self.goto(current);
        }
      }
    });
  };
  _init();
};

export { Swiper as default };
//# sourceMappingURL=index.js.map
