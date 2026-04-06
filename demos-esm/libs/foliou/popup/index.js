import $ from 'jquery';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

var resizeSensor$1 = {exports: {}};

var resizeSensor = resizeSensor$1.exports;
var hasRequiredResizeSensor;
function requireResizeSensor() {
  if (hasRequiredResizeSensor) return resizeSensor$1.exports;
  hasRequiredResizeSensor = 1;
  (function (module, exports) {

    /**
     * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
     * directory of this distribution and at
     * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
     */
    (function (root, factory) {
      {
        module.exports = factory();
      }
    })(typeof window !== "undefined" ? window : resizeSensor, function () {
      // Make sure it does not throw in a SSR (Server Side Rendering) situation
      if (typeof window === "undefined") {
        return null;
      }
      // Only used for the dirty checking, so the event callback count is limited to max 1 call per fps per sensor.
      // In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
      // would generate too many unnecessary events.
      var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
        return window.setTimeout(fn, 20);
      };

      /**
       * Iterate over each of the provided element(s).
       *
       * @param {HTMLElement|HTMLElement[]} elements
       * @param {Function}                  callback
       */
      function forEachElement(elements, callback) {
        var elementsType = Object.prototype.toString.call(elements);
        var isCollectionTyped = "[object Array]" === elementsType || "[object NodeList]" === elementsType || "[object HTMLCollection]" === elementsType || "[object Object]" === elementsType || "undefined" !== typeof jQuery && elements instanceof jQuery ||
        //jquery
        "undefined" !== typeof Elements && elements instanceof Elements; //mootools
        var i = 0,
          j = elements.length;
        if (isCollectionTyped) {
          for (; i < j; i++) {
            callback(elements[i]);
          }
        } else {
          callback(elements);
        }
      }

      /**
       * Get element size
       * @param {HTMLElement} element
       * @returns {Object} {width, height}
       */
      function getElementSize(element) {
        if (!element.getBoundingClientRect) {
          return {
            width: element.offsetWidth,
            height: element.offsetHeight
          };
        }
        var rect = element.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }

      /**
       * Class for dimension change detection.
       *
       * @param {Element|Element[]|Elements|jQuery} element
       * @param {Function} callback
       *
       * @constructor
       */
      var _ResizeSensor = function ResizeSensor(element, callback) {
        var observer;

        /**
         *
         * @constructor
         */
        function EventQueue() {
          var q = [];
          this.add = function (ev) {
            q.push(ev);
          };
          var i, j;
          this.call = function (sizeInfo) {
            for (i = 0, j = q.length; i < j; i++) {
              q[i].call(this, sizeInfo);
            }
          };
          this.remove = function (ev) {
            var newQueue = [];
            for (i = 0, j = q.length; i < j; i++) {
              if (q[i] !== ev) newQueue.push(q[i]);
            }
            q = newQueue;
          };
          this.length = function () {
            return q.length;
          };
        }

        /**
         *
         * @param {HTMLElement} element
         * @param {Function}    resized
         */
        function attachResizeEvent(element, resized) {
          if (!element) return;
          if (element.resizedAttached) {
            element.resizedAttached.add(resized);
            return;
          }
          element.resizedAttached = new EventQueue();
          element.resizedAttached.add(resized);
          element.resizeSensor = document.createElement("div");
          element.resizeSensor.dir = "ltr";
          element.resizeSensor.className = "resize-sensor";
          var style = "position: absolute; left: -10px; top: -10px; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden; max-width: 100%";
          var styleChild = "position: absolute; left: 0; top: 0; transition: 0s;";
          element.resizeSensor.style.cssText = style;
          element.resizeSensor.innerHTML = '<div class="resize-sensor-expand" style="' + style + '">' + '<div style="' + styleChild + '"></div>' + "</div>" + '<div class="resize-sensor-shrink" style="' + style + '">' + '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' + "</div>";
          element.appendChild(element.resizeSensor);
          var computedStyle = window.getComputedStyle(element);
          var position = computedStyle ? computedStyle.getPropertyValue("position") : null;
          if ("absolute" !== position && "relative" !== position && "fixed" !== position) {
            element.style.position = "relative";
          }
          var expand = element.resizeSensor.childNodes[0];
          var expandChild = expand.childNodes[0];
          var shrink = element.resizeSensor.childNodes[1];
          var dirty, rafId;
          var size = getElementSize(element);
          var lastWidth = size.width;
          var lastHeight = size.height;
          var initialHiddenCheck = true,
            resetRAF_id;
          var resetExpandShrink = function resetExpandShrink() {
            expandChild.style.width = "100000px";
            expandChild.style.height = "100000px";
            expand.scrollLeft = 100000;
            expand.scrollTop = 100000;
            shrink.scrollLeft = 100000;
            shrink.scrollTop = 100000;
          };
          var _reset = function reset() {
            // Check if element is hidden
            if (initialHiddenCheck) {
              if (!expand.scrollTop && !expand.scrollLeft) {
                // reset
                resetExpandShrink();

                // Check in next frame
                if (!resetRAF_id) {
                  resetRAF_id = requestAnimationFrame(function () {
                    resetRAF_id = 0;
                    _reset();
                  });
                }
                return;
              } else {
                // Stop checking
                initialHiddenCheck = false;
              }
            }
            resetExpandShrink();
          };
          element.resizeSensor.resetSensor = _reset;
          var onResized = function onResized() {
            rafId = 0;
            if (!dirty) return;
            lastWidth = size.width;
            lastHeight = size.height;
            if (element.resizedAttached) {
              element.resizedAttached.call(size);
            }
          };
          var onScroll = function onScroll() {
            size = getElementSize(element);
            dirty = size.width !== lastWidth || size.height !== lastHeight;
            if (dirty && !rafId) {
              rafId = requestAnimationFrame(onResized);
            }
            _reset();
          };
          var addEvent = function addEvent(el, name, cb) {
            if (el.attachEvent) {
              el.attachEvent("on" + name, cb);
            } else {
              el.addEventListener(name, cb);
            }
          };
          addEvent(expand, "scroll", onScroll);
          addEvent(shrink, "scroll", onScroll);

          // Fix for custom Elements
          requestAnimationFrame(_reset);
        }
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(function (element) {
            forEachElement(element, function (elem) {
              callback.call(this, {
                width: elem.contentRect.width,
                height: elem.contentRect.height
              });
            });
          });
          if (element !== undefined) {
            forEachElement(element, function (elem) {
              observer.observe(elem);
            });
          }
        } else {
          forEachElement(element, function (elem) {
            attachResizeEvent(elem, callback);
          });
        }
        this.detach = function (ev) {
          if (typeof ResizeObserver != "undefined") {
            forEachElement(element, function (elem) {
              observer.unobserve(elem);
            });
          } else {
            _ResizeSensor.detach(element, ev);
          }
        };
        this.reset = function () {
          element.resizeSensor.resetSensor();
        };
      };
      _ResizeSensor.reset = function (element, ev) {
        forEachElement(element, function (elem) {
          elem.resizeSensor.resetSensor();
        });
      };
      _ResizeSensor.detach = function (element, ev) {
        forEachElement(element, function (elem) {
          if (!elem) return;
          if (elem.resizedAttached && typeof ev === "function") {
            elem.resizedAttached.remove(ev);
            if (elem.resizedAttached.length()) return;
          }
          if (elem.resizeSensor) {
            if (elem.contains(elem.resizeSensor)) {
              elem.removeChild(elem.resizeSensor);
            }
            delete elem.resizeSensor;
            delete elem.resizedAttached;
          }
        });
      };
      return _ResizeSensor;
    });
  })(resizeSensor$1, resizeSensor$1.exports);
  return resizeSensor$1.exports;
}

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

var ResizeSensor = requireResizeSensor();
//弹窗
var wh;
function queryEle(str) {
  if (typeof str == "string") {
    return $(str);
  }
  if (str instanceof $) {
    if (str.length == 1) {
      return str[0];
    } else {
      var arr = [];
      str.each(function () {
        arr.push($(this)[0]);
      });
      str = arr;
    }
  }
  return str;
}
var Popup = function Popup(coverEle, options) {
  coverEle = queryEle(coverEle);
  if (!coverEle) {
    return;
  }
  // console.log(coverEle);
  coverEle = $(coverEle);
  if (!window.Popup_curhtmlOverFlow) {
    window.Popup_curhtmlOverFlow = $("html").css("overflow");
  }
  var defaultOption = {
    animation: DEVICE.support_css3("transform") ? "scale" : "fade",
    time: 300,
    video: null,
    //内嵌的视频对象
    auto: true,
    padding: 20,
    //弹窗距离上下的距离
    replace: true,
    //窗口模式 replaceF 表示当已经有一个窗口打开时，将会替换当前窗口
    zIndex: 3000,
    scrollObj: "this",
    opacity: 0.85,
    fixbody: true,
    autoCenter: true,
    closeOnClickModal: true,
    startShow: function startShow(obj) {},
    endShow: function endShow(obj) {},
    startHide: function startHide(obj) {},
    endHide: function endHide(obj) {}
  };
  options = $.extend(defaultOption, options);
  var self = this;
  self.animation = options.animation;
  self.curCover = [];
  self.curZindex = options.zIndex;
  self.time = options.time;
  self.scrollArray = {};
  if (typeof window.Popupcoverid == "undefined") {
    window.Popupcoverid = 0;
  }
  self.init = function () {
    //添加遮罩层
    if ($("#overlay").length < 1) {
      $("body").append("<div style='position: fixed!important;_position:fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: " + self.curZindex + "; background: rgb(0, 0, 0);display:none;' id='overlay'><div style='position: fixed!important;_position:fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 0;display:block;overflow-y:scroll' id='lock'></div></div>");
    }
    self.setCoverInit();
    self.bind();
  };
  this.setCoverInit = function () {
    //初始化弹窗的位置
    coverEle.each(function () {
      $(this).css({
        display: "block",
        opacity: 0,
        top: "10000%"
      });
      $(this).css({
        zIndex: self.curZindex,
        left: "50%",
        marginTop: -$(this).outerWidth() / 2 + "px",
        marginLeft: -$(this).outerWidth() / 2 + "px"
      });
      $(this).attr("data-state", "hide");
      $(this).attr("data-gcoverid", window.Popupcoverid++);
    });
    coverEle.css({
      position: "fixed"
    });
  };
  this.setVideo = function (video) {
    //设置视频
    options.video = video;
  };
  this.bind = function () {
    $(window).bind("resize", function () {
      //窗口resize 时候 重新设置 当前显示的弹窗 位置
      setTimeout(function () {
        for (var i in self.curCover) {
          self.setCover(self.curCover[i]);
        }
      }, 10);
    });
    coverEle.each(function () {
      //绑定 close 和confirm 关闭弹窗
      var $this = $(this);
      // console.log($(this).find(".close,.confirm,.Popup_close"));
      $(this).find(".close,.confirm,.Popup_close").unbind("click").bind("click", function (event) {
        event.stopPropagation();
        self.hide($this);
      });
    });
    if (!!options.closeOnClickModal) {
      $("#overlay").click(function () {
        self.hide();
      });
    }
  };
  function isAutoHeight(obj) {
    obj = $(obj);
    if (!!obj.css("max-height")) {
      return false;
    }
    var oldheight = obj.height();
    var testdiv = $('<div style="position:relative;width:100%;height:10px;"></div>');
    obj.append(testdiv);
    var newheight = obj.height();
    testdiv.remove();
    var offset = newheight - oldheight;
    return Math.abs(offset - 10) <= 5;
  }
  this.setScroll = function (obj, scrollobj) {
    //设置弹窗滚动
    wh = document.body.clientHeight;
    scrollobj.addClass("Popup_SCROLLER");
    // console.log(isAutoHeight(obj));
    if (isAutoHeight(obj)) {
      scrollobj.css({
        height: "auto",
        maxHeight: "none"
      });
      wh = $(window).height();
      if (scrollobj.outerHeight() > wh - options.padding * 2) {
        var paddh = scrollobj.outerHeight() - scrollobj.height();
        var maxheight = wh - options.padding * 2 - paddh;
        if (maxheight < 0) {
          maxheight = wh * 0.1;
        }
        scrollobj.css({
          maxHeight: maxheight
        });
        scrollobj.css({
          overflow: "auto"
        });
      }
    } else {
      obj.css({
        overflow: "auto"
      });
    }

    // if (typeof scrollobj.data('Popupcoverid') == 'undefined' && scrollobj.height() > obj.height()) {
    //     scrollobj.height(obj.height());
    // }
    if (DEVICE.isPc) ; else {
      //如果是移动端 设置回弹；禁用body的滚动，别切确保弹窗只绑定一次；
      scrollobj.css({
        "-webkit-overflow-scrolling": "touch"
      });
      var startPoint, endPoint;
      if (DEVICE.isMobile && typeof scrollobj.data("bindEvent") == "undefined") {
        scrollobj[0].addEventListener("touchstart", function (event) {
          startPoint = event.changedTouches[0].pageY;
        });
        scrollobj[0].addEventListener("touchmove", function (event) {
          endPoint = event.changedTouches[0].pageY;
          if (endPoint - startPoint > 0) {
            if (scrollobj.scrollTop() > 0) {
              event.stopPropagation();
            }
          } else if (scrollobj.scrollTop() + scrollobj.height() < scrollobj[0].scrollHeight) {
            event.stopPropagation();
          } else ;
          startPoint = endPoint;
        });
        scrollobj.attr("data-bindEvent", true);
      }
    }
  };
  this.setCover = function (obj) {
    //窗口变化是改变当前弹窗的样式
    if (typeof obj == "undefined" || !obj || obj.attr("data-state") == "hide") {
      return;
    }
    var coverHeight;
    wh = document.body.clientHeight;
    obj.each(function () {
      if (options.scrollObj) {
        //容许出滚动条
        if (options.scrollObj == "this") {
          var coverScroll = $(this).find(".scroller");
          if (coverScroll.length == 0) {
            coverScroll = $(this);
          }
          self.setScroll($(this), coverScroll);
        } else {
          self.setScroll($(this), $(this).find(options.scrollObj));
        }
      } else {
        $(this).css({
          overflow: "visible"
        });
      }
      coverHeight = $(this).outerHeight();
      $(this).css({
        top: "50%",
        left: "50%",
        marginTop: -coverHeight / 2,
        marginLeft: -$(this).outerWidth() / 2
      });
    });
  };
  this.resize = function (obj, cssobj) {
    obj.css(cssobj);
  };
  this.show = function (obj, animation, time, callbFn) {
    obj = $(queryEle(obj));
    if ((_typeof(obj) != "object" || !obj) && coverEle.length == 1) {
      //在初始化弹窗的时候只有一个元素时，默认缺省 obj参数
      if (typeof obj == "function") {
        callbFn = obj;

        // obj = coverEle;
      }
      if (typeof obj == "number") {
        if (!!animation) {
          callbFn = animation;
        }
        animation = null;
        time = obj;
      }
      if (typeof obj == "string") {
        if (!!time) {
          callbFn = time;
        }
        if (!!animation) {
          time = animation;
        }
        animation = obj;
      }
      obj = coverEle;
    }
    if (_typeof(obj) != "object" || !obj || obj.attr("data-state") == "show" || obj.attr("data-state") == "showing") {
      return;
    }
    //缺省obj后面的各种参数
    if (typeof animation == "function") {
      callbFn = animation;
      animation = self.animation;
    } else if (typeof animation == "undefined" || !animation) {
      animation = self.animation;
    }
    if (typeof time == "function") {
      callbFn = time;
      time = self.time;
    } else if (typeof time == "undefined" || !time) {
      time = self.time;
    }
    var callback = function callback() {
      //监听div 高度的变化
      obj.each(function () {
        if (!!$(this).data("resizesensor")) {
          return;
        } else {
          var that = this;
          $(this).attr("data-resizesensor", 1);
          if (!!options.autoCenter) {
            new ResizeSensor($(this)[0], function (el) {
              self.setCover($(that));
            });
          }
        }
      });
      obj.attr("data-state", "show");
      options.endShow(obj);
      if (typeof callbFn == "function") {
        callbFn();
      }
    };
    options.startShow(obj);
    if (options.auto && options.video) {
      options.video.play();
    }
    obj.attr("data-state", "showing");
    obj.attr("data-animation", animation);
    self.setCover(obj);
    //判断窗口模式 是否需要关闭原来的窗口
    self.curCover.push(obj);
    self.showoverlay(time);
    if (self.curCover.length > 1 && options.replace) {
      self.hide(self.curCover[self.curCover.length - 2], animation);
    }
    self.curZindex++;
    if (DEVICE.isIe7) {
      obj.stop().css({
        zIndex: self.curZindex,
        opacity: 1,
        display: "block",
        marginLeft: -obj.outerWidth() / 2 + "px",
        marginTop: -obj.outerHeight() / 2 + "px"
      });
      callback();
    } else if (animation == "fade") {
      obj.stop().css({
        zIndex: self.curZindex,
        opacity: 1,
        display: "block",
        marginLeft: -obj.outerWidth() / 2 + "px",
        marginTop: -obj.outerHeight() / 2 + "px"
      }).animate({
        opacity: 1,
        display: "block"
      }, time, "swing", function () {
        callback();
      });
    } else if (animation == "fadedown") {
      obj.css({
        zIndex: self.curZindex,
        marginTop: -obj.outerHeight() / 2 - 150 + "px",
        marginLeft: -obj.outerWidth() / 2 + "px",
        opacity: 0,
        display: "block"
      }).stop().animate({
        marginTop: -obj.outerHeight() / 2 + "px",
        opacity: 1
      }, time, "swing", function () {
        callback();
      });
    } else if (animation == "fadeup") {
      obj.css({
        zIndex: self.curZindex,
        marginTop: -obj.outerHeight() / 2 + 150 + "px",
        marginLeft: -obj.outerWidth() / 2 + "px",
        opacity: 0,
        display: "block"
      }).stop().animate({
        marginTop: -obj.outerHeight() / 2 + "px",
        opacity: 1
      }, time, "swing", function () {
        callback();
      });
    } else if (animation == "scale") {
      obj.stop();
      Animate.set(obj, {
        zIndex: self.curZindex,
        marginTop: -obj.outerHeight() / 2 + "px",
        marginLeft: -obj.outerWidth() / 2 + "px",
        opacity: 0,
        top: "50%",
        left: "50%",
        scale: 0.5,
        display: "block"
      });
      //console.log(obj);
      Animate.to(obj, {
        marginTop: -obj.outerHeight() / 2 + "px",
        opacity: 1,
        scale: 1
      }, time, "ease-in-out", function () {
        // alert(1);
        callback();
      });
    }
  };
  this.hide = function (obj, animation, time, callbFn) {
    if (!obj && self.curCover.length > 0) {
      for (var i in self.curCover) {
        console.log(self.curCover[i]);
        self.hide(self.curCover[i], animation, time, callbFn);
      }
      return;
    }
    if (typeof obj == "undefined" || !obj || obj.attr("data-state") == "hide" || obj.attr("data-state") == "hiding") {
      return;
    }
    obj = $(obj);
    if (typeof animation == "function") {
      callbFn = animation;
      animation = undefined;
    }
    if (typeof animation == "undefined" || !animation) {
      if (typeof obj.data("animation") != "undefined") {
        animation = obj.data("animation");
      } else {
        animation = self.animation;
      }
    }
    if (typeof time == "function") {
      callbFn = time;
      time = self.time;
    } else if (typeof time == "undefined" || !time) {
      time = self.time;
    }
    obj.attr("data-state", "hiding");
    var callback = function callback() {
      // if (self.curCover.length == 0) {
      //     $('html').css({
      //         overflow: window.Popup_curhtmlOverFlow
      //     });
      //     $('html').css({
      //         marginRight: 0
      //     });
      // }
      obj.attr("data-state", "hide");
      if (typeof callbFn == "function") {
        callbFn();
      }
      if (options.video) {
        options.video.stop();
      }
      options.endHide(obj);
    };
    options.startHide(obj);
    self.curZindex--;
    if (DEVICE.isIe7) {
      obj.stop().hide();
      callback();
    } else if (animation == "fade") {
      obj.stop().animate({
        opacity: 0
      }, time * 0.6, "swing", function () {
        obj.css({
          top: "1000%"
        });
        callback();
      });
    } else if (animation == "fadedown") {
      obj.each(function () {
        var $this = $(this);
        $(this).stop().animate({
          marginTop: -$(this).outerHeight() / 2 - 150 + "px",
          opacity: 0
        }, time, "swing", function () {
          $this.css({
            top: "1000%"
          });
          callback();
        });
      });
    } else if (animation == "fadeup") {
      obj.each(function () {
        var $this = $(this);
        $(this).stop().animate({
          marginTop: -$(this).outerHeight() / 2 + 150 + "px",
          opacity: 0
        }, time, "swing", function () {
          $this.css({
            top: "1000%"
          });
          callback();
        });
      });
    } else if (animation == "scale") {
      obj.each(function () {
        var $this = $(this);
        $(this).stop();
        Animate.to(this, {
          scale: 0.5,
          opacity: 0
        }, time, "ease-in-out", function () {
          $this.css({
            top: "1000%",
            display: "none"
          });
          callback();
        });
      });
    }
    self.hideoverlay(time);
    for (var i in self.curCover) {
      if (obj.data("Popupcoverid") == self.curCover[i].data("Popupcoverid")) {
        self.curCover.splice(i, 1);
        break;
      }
    }
  };
  this.showoverlay = function (time) {
    if (!!self.overclock) {
      clearTimeout(self.overclock);
      self.overclock = null;
    }
    self.curZindex++;
    if (self.curCover.length > 1) {
      $("#overlay").css({
        zIndex: self.curZindex
      });
    } else {
      if ($("#overlay").css("display") == "none") {
        $("#overlay").css({
          opacity: "0",
          display: "block"
        });
      }
      $("#overlay").css({
        zIndex: self.curZindex
      });

      // if(DEVICE.isPc){
      $("#overlay").stop().animate({
        opacity: options.opacity
      }, time, function () {});
      // }
      // else{
      //     $("#overlay").stop().css3({display:'block',opacity:0},function(){
      //         $("#overlay").transfrom({
      //             opacity: options.opacity
      //         }, time, function () {});
      //     })
      // }
      $("#lock").show();
      if (!window.Popup_curhtmlOverFlow) {
        var htmlover = $("html").css("overflow");
        var bodyover = $("body").css("overflow");
        window.Popup_curhtmlOverFlow = htmlover;
        if (bodyover != "hidden") {
          window.Popup_curhtmlOverFlow = bodyover;
        }
      }
      if (!!options.fixbody) {
        canttouch();
      }
    }
  };
  this.hideoverlay = function (time) {
    self.curZindex--;
    if (!!self.overclock) {
      clearTimeout(self.overclock);
      self.overclock = null;
    }
    if (self.curCover.length > 1) {
      self.overclock = setTimeout(function () {
        self.overclock = null;
        $("#overlay").css({
          zIndex: self.curZindex - 1
        });
      }, time);
    } else {
      var hideCallback = function hideCallback() {
        $("#overlay").css({
          display: "none",
          zIndex: self.curZindex - 1
        });
        if (!!options.fixbody) {
          cantouch();
        }
      };
      // if(DEVICE.isPc){
      $("#overlay").stop().animate({
        opacity: 0
      }, time, hideCallback);
      // }
      // else{
      //     $("#overlay").stop().transfrom({
      //         'opacity': 0
      //     }, time, hideCallback);
      // }
      $("#lock").css({
        overflowY: "hidden"
      });
      $("#lock").fadeOut(time);
    }
  };
  this.init();
};
//各种需要用到的函数
function canttouch() {
  var scrollbar = getScrollBarWidth();
  if (!scrollbar.hasscroll) {
    $("#lock").css({
      overflowY: "hidden",
      zIndex: self.curZindex
    });
    $("html").css({
      overflow: "hidden"
    });
  } else {
    $("#lock").css({
      overflowY: "scroll"
    });
    $("html").css({
      overflow: "hidden"
    });
    $("html").css({
      marginRight: scrollbar.vertical
    });
  }
  if (!DEVICE.isMobile) {
    return;
  }
  document.addEventListener("touchmove", touchmovePrevent, false);
}
function cantouch() {
  $("html").css({
    overflow: window.Popup_curhtmlOverFlow
  });
  $("html").css({
    marginRight: 0
  });
  if (!DEVICE.isMobile) {
    return;
  }
  document.removeEventListener("touchmove", touchmovePrevent);
}
function touchmovePrevent(e) {
  e.preventDefault();
}
var __scrollBarWidth = 0;
function getScrollBarWidth() {
  var wh = $(window).height();
  if (DEVICE.isMobile || !(document.body.style.overflow != "hidden" && document.body.scroll != "no" && document.body.scrollHeight > wh)) {
    return {
      vertical: 0,
      hasscroll: false
    };
  }
  if (__scrollBarWidth) return __scrollBarWidth;
  var scrollBarHelper = document.createElement("div");
  // if MSIE
  // 如此设置的话，scroll bar的最大宽度不能大于100px（通常不会）。
  scrollBarHelper.style.cssText = "overflow:scroll;width:100px;height:100px;";
  // else OTHER Browsers:
  // scrollBarHelper.style.cssText = "overflow:scroll;";
  document.body.appendChild(scrollBarHelper);
  if (scrollBarHelper) {
    __scrollBarWidth = {
      horizontal: scrollBarHelper.offsetHeight - scrollBarHelper.clientHeight,
      vertical: scrollBarHelper.offsetWidth - scrollBarHelper.clientHeight,
      hasscroll: true
    };
  }
  document.body.removeChild(scrollBarHelper);
  return __scrollBarWidth;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
_defineProperty(Popup, "plugin", function (libFlag) {
  if (!!libFlag && !!libFlag.fn) {
    (function (libFlag) {
      libFlag.fn.fPopup = function (params) {
        return new Popup($(this), params);
      };
    })(libFlag);
  }
  return Popup;
});

export { Popup as default };
//# sourceMappingURL=index.js.map
