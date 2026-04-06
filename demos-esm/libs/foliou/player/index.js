import $ from 'jquery';

function _typeof$1(o) {
  "@babel/helpers - typeof";

  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof$1(o);
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

var prefix$1 = function prefix() {
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
var PREFIX = prefix$1();

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
      switch (_typeof$1(jsonObj)) {
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
    if (!!json && _typeof$1(json) == "object") {
      for (var i in json) {
        type = _typeof$1(json[i]);
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
    if (!!searchArr && _typeof$1(searchArr) == "object") {
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
  if (_typeof$1(styles) != "object" || !element) {
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
    if ((_typeof$1(obj) != "object" || !obj) && coverEle.length == 1) {
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
    if (_typeof$1(obj) != "object" || !obj || obj.attr("data-state") == "show" || obj.attr("data-state") == "showing") {
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
          cantouch$1();
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
function cantouch$1() {
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

var img$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowZTNhNGJhMC00ZGMzLTkxNGMtYWViMy0wNjJiMDJmMjI4YjgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0UzMUNCMEMyRDQ1MTFFQUEwOUZCNzNENDI2QTAwMzQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0UzMUNCMEIyRDQ1MTFFQUEwOUZCNzNENDI2QTAwMzQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDllNjgzNzMtNzA0ZC1lODQ0LWE1OWUtNjcyNmUxMDYwY2IxIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6Yzk3NDlkY2ItZTVhMy1lZjQzLTg2ZjEtYzAwZDZlODEwMDU5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+QtLzzQAAAdtJREFUeNrsmT1LAzEYx+9EpYKddNFVBXHwXVGcWnRQurm4tQp+BL+Ag7g7iBYFBxcX33DTyUkdbAURHNSprS06CA6iNP6DAcNhwd49aXvH88CPXpL2Lj/ukj652EIIKwhRZwUkWIRFWIRFSKMB2H4X6QIpcA5a/CwSAT1gAvT5WUQEcbCLoIjw9MsiLMIiLMIiLGIy6l38JgSWVLqxAop+FYmCZXXcCeYJc6gmEANX4Mn0o3UHMuo4DraJFk3N4BDsgSO1GDMq8gimQVaVE2DLo4yU2AdTqvxW7l12O9hvHDLy8Uq6PFcYHIBJ7dxz4Ku8BYIQXugHWfEbyT++s6i1RxxtYXCqtadBu5u+eBWRDICc1pnNf4qQSVCJSAYdMhslRKKaxBmVBKWIZAg8a51bV/UJrW4chBwSKa8S1CKSYZDXOrkK4lo5Bo4dEm0U16YWkYyAgtbZB/VZBBkTEhLb0EbPKDgBrSXa5Qu7GW36rtmk8VKlGi+VkDCd/V4omVet7trxR0oWdgX2EMfAGiiABZAzcRGbN0N9vLDqALOg0arQi2mVUb+DXZCnEtmxfrYGqhG9KsMmebTSVVrWfoJbysEub3O3y+Wxl/gA9zxrsQiLsAiL1GR8CzAA4lcEsSgLxSMAAAAASUVORK5CYII=";

var html5_tpl = "<div class=\"Player_container\">\n\t<div class=\"Player_container_inner\" style=\"width:100%;height:100%\">\n\t\t<div class=\"Player_video\"><video style=\"background-color:#000;\" playsinline=\"isiPhoneShowPlaysinline\" webkit-playsinline=\"isiPhoneShowPlaysinline\" x-webkit-airplay=\"\" preload=\"true\"></video></div>\n\n\t\t<div class=\"Player_overlay_poster\">\n\t\t\t<div class=\"Player_poster_img\"></div>\n\t\t</div>\n\t</div>\n</div>\n<div class=\"Player_option_wraper\">\n\t<div class=\"Player_overlay_option\">\n\t\t<span class=\"Player_button_play\">\n\t\t\t<svg class=\"txp_icon txp_icon_play_lg\" viewBox=\"0 0 68 68\">\n\t\t\t\t<use xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_play_lg\"></use>\n\t\t\t</svg>\n\t\t</span>\n\t\t<span class=\"Player_loading Player_none\"></span>\n\t</div>\n\n\t<div class=\"Player_controls hidden\">\n\t\t<div class=\"Player_controls_bg\"></div>\n\n\t\t<div class=\"Player_button Player_play_button\">\n\t\t\t<button type=\"button \" title=\"播放/暂停\" data-status=\"play\">\n\t\t\t\t<svg class=\"txp_icon txp_icon_play\" viewBox=\"0 0 60 60\">\n\t\t\t\t\t<use class=\"txp_svg_play\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_play\"></use>\n\n\t\t\t\t\t<use class=\"txp_svg_pause\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_pause\"></use>\n\n\t\t\t\t\t<use class=\"txp_svg_stop\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_stop\"></use>\n\n\t\t\t\t\t<use class=\"txp_svg_replay\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_replay\"></use>\n\t\t\t\t</svg>\n\t\t\t</button>\n\t\t</div>\n\n\t\t<div class=\"Player_time_rail\">\n\t\t\t<span class=\"Player_time_total\">\n\t\t\t\t<span class=\"Player_time_loaded\" style=\"width: 1%;\"></span>\n\t\t\t\t<span class=\"Player_time_current\" style=\"width: 0px;\"><span class=\"Player_time_handle\"><em></em></span></span>\n\t\t\t</span>\n\t\t\t<span class=\"Player_time_panel\" style=\"color:#fff\"> <span class=\"Player_time_panel_current\">00:00</span> <span class=\"Player_time_panel_split\">/</span> <span class=\"Player_time_panel_total\">00:00</span> </span>\n\t\t</div>\n\t\t<a class=\"Player_download_btn\" href=\"javascript:void(0)\" title=\"下载\"> </a>\n\t\t<div class=\"tvp_button Player_fullscreen_button tvp_fullscreen\">\n\t\t\t<button type=\"button\" title=\"切换全屏\">\n\t\t\t\t<svg class=\"txp_icon txp_icon_fullscreen\" viewBox=\"0 0 24 24\">\n\t\t\t\t\t<use class=\"txp_svg_fullscreen\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_fullscreen\"></use>\n\n\t\t\t\t\t<use class=\"txp_svg_fullscreen_true\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#txp_svg_fullscreen_true\"></use>\n\t\t\t\t</svg>\n\t\t\t</button>\n\t\t</div>\n\t</div>\n</div>\n<div id=\"Player_loading\">\n\t<svg viewBox=\"0 0 100 100\">\n\t\t<path d=\"M 50 50 m -40 0 a 40 40 0 1 0 80 0  a 40 40 0 1 0 -80 0\" fill=\"none\" opacity=\"0.5\" stroke=\"#ccc\" stroke-width=\"4\"></path>\n\t\t<path d=\"M 50 50 m -40 0 a 40 40 0 1 0 80 0  a 40 40 0 1 0 -80 0\" fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" class=\"Play_Loading_Progress_path\" transform=\"rotate(90,50,50)\" stroke-width=\"5\"></path>\n\t\t<style>\n\t\t\t.Play_Loading_Progress_path {\n\t\t\t\tstroke-dasharray: 252.2px, 252.2px;\n\t\t\t\tstroke-dashoffset: 252.2px;\n\t\t\t\ttransition: stroke-dashoffset 0.6s ease 0s, stroke 0.6s ease 0s;\n\t\t\t\ttransform: rotateZ(90deg);\n\t\t\t\ttransform-origin: 50% 50%;\n\t\t\t}\n\t\t</style>\n\t</svg>\n</div>\n<div id=\"Player_svg\">\n\t<svg class=\"txp_svg_sprite\" display=\"none\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n\t\t<symbol id=\"txp_svg_play_lg\" viewBox=\"0 0 100 100\">\n\t\t\t<circle cx=\"50\" cy=\"50\" r=\"50\" style=\"fill:#222;fill-opacity:0.75\"></circle>\n\t\t\t<path transform=\"translate(36, 33)\" d=\"M0.6,2C0.6,2,0,3.5,0,16.9C0,30.3,0.6,32,0.6,32c0,1.5,1.6,2.5,2.9,1.8c0,0,3-0.5,15.2-6.6c12.2-6.1,14.2-8.4,14.2-8.4c1.5-0.7,1.5-2.8,0-3.6c0,0-3.3-3.1-14.2-8.6C7.9,1.1,3.5,0.2,3.5,0.2C2.1-0.5,0.6,0.5,0.6,2z\" style=\"fill:#fff;\"></path>\n\t\t</symbol>\n\n\t\t<symbol id=\"txp_svg_play\" viewBox=\"0 0 56 56\">\n\t\t\t<path d=\"M14.569 13.867s-.563 1.42-.563 14.059.563 14.188.563 14.188a1.925 1.925 0 0 0 2.8 1.677s2.938-.442 14.763-6.211 13.8-7.914 13.8-7.914a1.859 1.859 0 0 0 0-3.352s-3.24-2.875-13.8-8.095c-10.444-5.165-14.767-6.029-14.767-6.029a1.924 1.924 0 0 0-2.796 1.677z\" style=\"fill:#fff\"></path>\n\t\t</symbol>\n\n\t\t<symbol id=\"txp_svg_fullscreen\" viewBox=\"0 0 48 48\">\n\t\t\t<path d=\"M9.5 37h10a1.5 1.5 0 0 1 0 3h-10a1.5 1.5 0 0 1 0-3zm0-10a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-3 0v-10A1.5 1.5 0 0 1 9.5 27zM8.43 37.353L19.353 26.43a1.545 1.545 0 1 1 2.185 2.184L10.614 39.538a1.545 1.545 0 1 1-2.184-2.185zM28.5 8h10a1.5 1.5 0 0 1 0 3h-10a1.5 1.5 0 0 1 0-3zm10 0A1.5 1.5 0 0 1 40 9.5v10a1.5 1.5 0 0 1-3 0v-10A1.5 1.5 0 0 1 38.5 8zM26.43 19.354L37.353 8.43a1.545 1.545 0 0 1 2.185 2.184L28.614 21.538a1.545 1.545 0 0 1-2.184-2.184z\" style=\"fill:#fff\"></path>\n\t\t</symbol>\n\n\t\t<symbol id=\"txp_svg_fullscreen_true\" viewBox=\"0 0 48 48\">\n\t\t\t<path style=\"fill:#fff\" d=\"M39.538 10.615L31.153 19H37.5a1.5 1.5 0 0 1 0 3h-10a1.5 1.5 0 0 1-1.386-.937 1.52 1.52 0 0 1-.114-.735V10.5a1.5 1.5 0 0 1 3 0v6.283l8.353-8.353a1.545 1.545 0 1 1 2.185 2.185zM20.5 39a1.5 1.5 0 0 1-1.5-1.5v-6.347l-8.386 8.385a1.545 1.545 0 1 1-2.184-2.184L16.783 29H10.5a1.5 1.5 0 0 1 0-3h9.828a1.518 1.518 0 0 1 .733.113A1.5 1.5 0 0 1 22 27.5v10a1.5 1.5 0 0 1-1.5 1.5z\"></path>\n\t\t</symbol>\n\n\t\t<symbol id=\"txp_svg_pause\" viewBox=\"0 0 56 56\">\n\t\t\t<path style=\"fill:#fff\" d=\"M39 49a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4 4 4 0 0 1 4 4v34a4 4 0 0 1-4 4zm-22 0a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4 4 4 0 0 1 4 4v34a4 4 0 0 1-4 4z\"></path>\n\t\t</symbol>\n\n\t\t<symbol id=\"txp_svg_replay\" viewBox=\"0 0 32 32\">\n\t\t\t<path style=\"fill:#fff\" d=\"M18 30a13.956 13.956 0 0 1-9.9-4.1l2.121-2.121A11 11 0 1 0 7 16h4.006L5.5 22 0 16h4a14 14 0 1 1 14 14z\"></path>\n\t\t</symbol>\n\n\t\t<symbol style=\"fill:#fff\" id=\"txp_svg_download\" viewBox=\"0 0 32 32\">\n\t\t\t<path d=\"M25 31H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6h1v3a4 4 0 0 0-4 4v15a4 4 0 0 0 4 4h15a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4V2h1a6 6 0 0 1 6 6v17a6 6 0 0 1-6 6zm-7.32-7.616A1.473 1.473 0 0 1 16.5 24a1.307 1.307 0 0 1-.227-.052 1.389 1.389 0 0 1-.352-.081 1.445 1.445 0 0 1-.239-.16 1.356 1.356 0 0 1-.209-.139c-.013-.013-.016-.03-.028-.043s-.045-.025-.061-.047L9.4 17.458a1.445 1.445 0 0 1 0-2.036 1.424 1.424 0 0 1 2.024 0L15 19.019V1.5a1.5 1.5 0 1 1 3 0v17.489l3.546-3.567a1.424 1.424 0 0 1 2.024 0 1.445 1.445 0 0 1 0 2.036z\"></path>\n\t\t</symbol>\n\t</svg>\n</div>\n";

var img = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABkAAD/7gAOQWRvYmUAZMAAAAAB/9sAhAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgICAgICAgICAgIDAwMDAwMDAwMDAQEBAQEBAQIBAQICAgECAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wAARCAAyADIDAREAAhEBAxEB/8QAigAAAgMBAQEBAAAAAAAAAAAABAcAAQIDBgUKAQEAAwEBAAAAAAAAAAAAAAAAAQIFAwQQAAICAQMDAgUDAgcAAAAAAAECBAUDERIGACEHMVFBYSIyExQ0FzMmoVJTY1QWNhEAAgICAQMDBAIDAQAAAAAAAQIAESEDMVESBEEiE2FxgZEyBcHRYiP/2gAMAwEAAhEDEQA/APx910CxuLOBTVFdYW1vay4lfV1lZDz2FhZT50hIsODBhw0zSZMyXnfZixKpyZXGxAzsqtUWTSgk/ScIEciqNzaqoG4s3YKvfVn9dgB0HfQ7jp66gGtDTAgxNKwZQw1GoB0III+RB9vcdj8CR36A2LiX1MSiwGvuF3aahSygNrsLFQ5G09gS3y6gWzdiglquh04v9mq5sgAe5bQ6fW2NVmxxrSvnVsnNBrLPFHsIkiFIy1t1XRbinsMeGVjxZWhW1RPwSo2UDZnjZseVCyOrGzKVNNzz+DkH8jMQLqInNkJYN3OhBADqugUhiqjJhkYd2YjaWZG2jQ6NoF6a2bVs+RK7j1iOc4/5pIRQX80hgV+xf5pOQHEgbECVHmfKFYKGIPN/qxndyHRuRai9nnaz3FV3gZvg9Kr6fb1iJfeqL9RICglmYsQoBIYuzEn6WGhJ7FjoPYZJDaj2OCGETQcFd2hB2bwraIxGjEhd5VXZdp7KST6jUd+pUlz2oCWq6HS6v94oZsgAe5bRsQK6t8cV0HlPKq+Jb8wtYcW14Pwa2hx51bUV1lExzK3yD5DqpUeRilwLGCccrj/H5SbLfFttbBDTLEhci0E7PB0jdsovsyqiiQcgObx/HhcqQc4Z0aYtrCysbmwsLi4sJttb20+bZ21tYys06xtbSfKyy7CznzpOTPJnTZ8zM+bLmyZMmTLkcuzuxLHxO+3Y5fdXynJr1+uevJGaOLPMiB9ViTpEwVJYnVNumgVkV1J1Q7m+xip26EAhtBpu2sQIr3h7IKxHI+nmg+hbzR+TKVJdd3mt1xAugVtv6jzWMTqXI/8AZjKEf+4CG5Dq9w/sFOAPJwPueAB65FAWB3Me1e5vbKlwvINdfSBVtbWeOK2ByflMOBccxtIuCy4Rwa2wRbCsqa+dGWXXeQfIddLwycE6BYwlSTx6gkqcdwmy0sENN+jg8i56dY8LR826hsbIXkg5Ac3/AM8LlSpzhnRg2KxpcxaWFhZXNnPu7iwnWlzazpVpa21nLkTrOztJsx7CdZT5cnNlk57KZPyPnz5M75ny5m3Zg+QFjnt/7Od3kWdxN/T7568noTyeZe4Ko0VV7fSAoA10AUaADcWYAAfEk/M+vQksbbmRL6RJ0iUWA19wu7TUKWUBtdhYqHI2nsCW+XUC2bsUEtV0OnF/s1XNkAD3LaNWvrq3xxXweVcproVrzG2hQ7ThPCLWHjnV1TWz4+OdU+QvIVTITJglRZsDKJXHqGYj4rfCUtLHC1MkSJyHSUavC1L5G3O1ge0Cjj07g2CrDIBsZtg4J1yrh3X4zXZD9Mnmpvhk82BkVCwDfzWpf6MeT8WXHu8yPkRvxbWxpzR1Oxf+wn+4+m0n+1B272C+dy1kkHpRNszdtdzNlmskk5PPXq+Kgv8AERL70xoAx0VEAZm10UINrFiddoVhp3J7kAE9ZT9yMV2AhhO06KwZQw1GoB0III+RB9vcdj8CR36gGxcS+piZLBfXQD01LKO+m4agsCAwVtDppqpGupAI2KAFk+gkE0LjWr66t8cV0HlPKq+Jb8wtIka04RwW2hx51bT19hFxy67yB5DqpUeRilQLCF+OTx/j0pNltj22tihpliwuRaChPA1fLto7HNhRkhhYDG/pjtypBzhnVpU2LEWljYWVzZz7q3sZtrcWs+VZ2tvYy5E+xtLSZNefOs5s2TmzZ5c+bPyPny5s2TOc+V9+T8jDe3gcHa52+TZ3k3jj75znkj0NizzJgIRuwOzaqBFQpvTscehIYjJsIQDTfv2jTeQx0qe5nGwn3CRHQUPmptoVm81b9y/WpbzScm7Em8ejeacoVgC2h5wd2MhuQ6HkWtaf2CEsVXeBm8A1gV+Ptm4iZDKoAZgNNQSz6sNDtJcFi/Zjt3abWbsvsMs631e1xTRNaj3X7/xffj/c/wDD+795/tff8uufeIqfZ49cHj1zEulqqW6yQTIyR4HIYItaczGiZcdfOmVDvjr7g08845WKLPxy6+TkxjHLjyYrZYuXvof4dh2HJ9JDC1ocwGxsLK5spt1cWM61uLOZnsrS1s5smwsrGxlyjOlz5s6VkfPKnyJjtly5spcZsp3uhI6rsI8jYd++/lPTjAoQuFqCKNFVe30gKANdAFGgA3FmAAHxJPzPr1UksbbmTL6RMFSWJ1TbpoFZFdSdUO5vsYqduhAIbQabtrECK94eyCsT0/KuVWXMrPBeXWGE968ZMN7eYEkJacvn45Gd25LyjLlkZo03lE6I+PDNl4cUdrJ8Rlzv1VhmkzM/o3728h/kfD/6AH+InlNmf/Ni/bfi+zL93+n/AFv6P+Py68fYYud+usSdIk6RJ0iTpEnSJOkT/9k=";

//Do setup work here
//获取前缀
//检测是否支持flash
// var checkFlash = function checkFlash() {
//     if (typeof window.ActiveXObject != "undefined") {
//         return new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
//     } else {
//         return navigator.plugins["Shockwave Flash"];
//     }
// };
//检测是否支持HTML5
function checkVideo() {
  var ua = navigator.userAgent;
  var ualow = ua.toLowerCase();
  var isIE11 = ualow.toLowerCase().indexOf("trident") > -1 && ualow.indexOf("rv") > -1;
  if (DEVICE.isIe && !isIE11) {
    return false;
  }
  if (!!document.createElement("video").canPlayType) {
    var vidTest = document.createElement("video");
    var oggTest = vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');
    if (!oggTest) {
      var h264Test = vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      if (!h264Test) {
        return false;
      } else {
        if (h264Test == "probably") {
          return true;
        } else {
          return false;
        }
      }
    } else {
      if (oggTest == "probably") {
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}
var prefix = PREFIX;
function Player(container, options, videoindex) {
  container = $(container);
  if (!container || container.length == 0) return;
  if (typeof videoindex == "undefined") {
    if (typeof window.PlayervideoIndex == "undefined") {
      window.PlayervideoIndex = 0;
    }
    videoindex = window.PlayervideoIndex++;
  }
  var ismicro = navigator.appName.indexOf("Microsoft") != -1;
  var self = this;
  var player;
  var defaultoption = {
    file: "",
    width: "100%",
    muted: false,
    height: "auto",
    auto: false,
    mode: "auto",
    debug: false,
    image: "",
    version: "v2",
    volume: 1,
    download: false,
    loop: false,
    toolbar: true,
    ratio: 0.6,
    //高宽比例
    swf: "//siteres.ztgame.com/site/js/gplayer/v3/gplayer.swf",
    color: "#FF9000",
    fillColor: "#fff",
    fullScreen: false,
    onComplete: function onComplete(index) {},
    onPlay: function onPlay(index) {},
    onPause: function onPause(index) {},
    onReplay: function onReplay(index) {},
    onInit: function onInit(index) {},
    onResize: function onResize(index) {},
    mobile: {},
    pc: {}
  };
  if (DEVICE.isMobile) {
    options = $.extend(options, options.mobile);
  } else {
    options = $.extend(options, options.pc);
  }
  options = $.extend(defaultoption, options);
  options.width = options.width.toString();
  options.height = options.height.toString();
  var curmode;
  function choosemode(curfile) {
    if (options.mode == "auto") {
      if (checkVideo()) {
        return "html5";
      }
      return "flash";
    } else {
      return options.mode;
    }
  }
  function setup() {
    var mode = choosemode();
    if (!mode) {
      console.log("当前视频格式不支持");
      return;
    }
    if (curmode != mode) {
      player = null;
      if (mode == "html5") {
        player = new Html5Player();
        self.videoElement = player.videoElement;
      } else if (mode = "flash") {
        player = new flashPlayer();
      }
      bindPlayerFun();
    }
  }
  var e = {
    mp4: "video/mp4",
    vorbis: "audio/ogg",
    ogg: a + "video/ogg",
    webm: "video/webm",
    aac: "audio/mp4",
    mp3: "audio/mpeg",
    hls: "application/vnd.apple.mpegurl"
  };
  var formats = {
      mp4: e.mp4,
      f4v: e.mp4,
      m4v: e.mp4,
      mov: e.mp4,
      m4a: e.aac,
      f4a: e.aac,
      aac: e.aac,
      mp3: e.mp3,
      ogv: e.ogg,
      ogg: e.vorbis,
      oga: e.vorbis,
      webm: e.webm,
      m3u8: e.hls,
      hls: e.hls
    },
    a = "video",
    a = {
      flv: a,
      f4v: a,
      mov: a,
      m4a: a,
      m4v: a,
      mp4: a,
      aac: a,
      f4a: a,
      mp3: "sound",
      smil: "rtmp",
      m3u8: "hls",
      hls: "hls"
    };
  //html5视频播放器

  function Html5Player() {
    curmode = "html5";
    if (!isNaN(options.width)) {
      options.width = options.width + "px";
    }
    if (!isNaN(options.height)) {
      options.height = options.height + "px";
    }
    var self = this;
    var videoplayer, videoElement, changedtime, playbtn, Playervideowrap, timehander, controlbar, loading, Playercontainer, optiondiv, controlbarclock, playpausbtn, totaltimepanel, currenttimepanel, playedbar, totaltime, fullscreen_button, Playeroverlayposter, PlayerTimeTotal;
    var colorhex = hexToRGB(options.color);
    var dockcolor1 = options.color;
    var dockcolor2 = options.color;
    var dockcolor3 = options.color;
    if (colorhex) {
      dockcolor1 = "rgba(" + colorhex[0] + "," + colorhex[1] + "," + colorhex[2] + ",1)";
      dockcolor2 = "rgba(" + colorhex[0] + "," + colorhex[1] + "," + colorhex[2] + ",0.3)";
      dockcolor3 = "rgba(" + colorhex[0] + "," + colorhex[1] + "," + colorhex[2] + ",0.9)";
    }
    var controlhtml = "";
    if ($("#Player_template").length == 0) {
      var gaplyer_template = document.createElement("script");
      gaplyer_template.setAttribute("id", "Player_template");
      var body = document.getElementsByTagName("body")[0];
      body.appendChild(gaplyer_template);
      $(gaplyer_template).append($(html5_tpl));
      // $(".Player_download_btn")
    }
    var videocontainner = $("#Player_template .Player_container").prop("outerHTML");
    videocontainner = $(videocontainner);
    videocontainner.addClass("Player_container_" + videoindex);
    if (options.toolbar) {
      controlhtml = $("#Player_template .Player_option_wraper").prop("outerHTML");
      videocontainner.find(".Player_container_inner").append(controlhtml);
    }
    if (options.download) {
      var downloadVideo = function downloadVideo(src, name, progress) {
        if (!!fileResponse) {
          startDownload();
          progress(1);
          return;
        }
        function startDownload() {
          var url = window.URL.createObjectURL(fileResponse);
          var a = document.createElement("a");
          a.href = url;
          a.download = name;
          a.click();
        }
        var x = new XMLHttpRequest(); //禁止浏览器缓存；否则会报跨域的错误
        x.open("GET", src + "?t=" + new Date().getTime(), true);
        x.responseType = "blob";
        x.onload = function (e) {
          fileResponse = x.response;
          startDownload();
        };
        x.onprogress = function (e) {
          //console.log(e);
          var percent = parseInt(e.loaded / e.total * 100) / 100;
          progress(percent);
        };
        x.send();
      };
      var fileResponse = null;
      var downloadBtn = videocontainner.find(".Player_download_btn");
      var downimg = new Image();
      downimg.src = img$1;
      downloadBtn.append(downimg);
      if (DEVICE.isWeixin) {
        downloadBtn.click(function () {
          alert("请使用手机自带浏览器打开");
        });
      } else {
        // try {
        // 	document.domain = "ztgame.com";
        // } catch (error) {

        // }
        // downloadBtn
        // 	.attr("download", typeof options.download == "string" ? options.download : "video.mp4")
        // 	.attr("target", "_blank")
        // 	.attr("href", options.file);
        var isDownloading = false;
        var getDomain = function getDomain(url) {
          var domain = url.split("/"); //以“/”进行分割
          if (domain[2]) {
            domain = domain[2];
          } else {
            domain = ""; //如果url不正确就取空
          }
          return domain;
        };
        downloadBtn.click(function () {
          if (!!isDownloading) {
            return;
          }
          if (!!getDomain(options.file) && getDomain(window.location.href)) {
            var url = options.file;
            var a = document.createElement("a");
            a.href = url;
            a.download = name;
            a.click();
            return;
          }
          if (options.file) isDownloading = true;
          var progressBar = videocontainner.find(".Player_Download_Progress");
          if (progressBar.length == 0) {
            videocontainner.append("<div class='Player_Download_Progress'>" + $("#Player_loading").html() + "</div>");
            progressBar = videocontainner.find(".Player_Download_Progress");
            progressBar.append("<img src='" + img$1 + "'/ >");
          }
          var svgPath = progressBar.find(".Play_Loading_Progress_path");
          downloadVideo(options.file, typeof options.download == "string" ? options.download : "", function (percent) {
            var dashoffset = 252.2 * (1 - percent);
            svgPath.css({
              strokeDashoffset: dashoffset
            });
            if (percent == 1) {
              progressBar.remove();
              isDownloading = false;
            }
          });
        });
      }
    } else {
      videocontainner.find(".Player_download_btn").hide();
    }
    videocontainner.css({
      width: options.width,
      height: options.height == "auto" ? "" : options.height
    });
    videocontainner.find(".Player_container_inner").hide();
    function addsvgwrap() {
      if ($("#Player_template #Player_svg").length > 0) {
        $("body").append($("#Player_template #Player_svg"));
      }
    }
    function init() {
      if (options.toolbar) {
        addsvgwrap();
      }
      container.html("");
      container.append(videocontainner);
      Playercontainer = videocontainner;
      Playercontainer.find(".Player_container_inner").show();
      Playervideowrap = Playercontainer.find(".Player_video");
      playbtn = Playercontainer.find(".Player_button_play");
      loading = Playercontainer.find(".Player_loading");
      controlbar = Playercontainer.find(".Player_controls");
      optiondiv = Playercontainer.find(".Player_overlay_option");
      playpausbtn = controlbar.find(".Player_play_button");
      currenttimepanel = controlbar.find(".Player_time_panel_current");
      totaltimepanel = controlbar.find(".Player_time_panel_total");
      controlbar.find(".Player_time_loaded");
      playedbar = controlbar.find(".Player_time_current");
      playedbar.css({
        background: options.color
      });
      if (!!options.toolbar) {
        playedbar.find("em")[0].style.cssText = "background:" + dockcolor3 + "; background:-webkit-radial-gradient(50% 50%,circle closest-side, " + dockcolor1 + " 31%," + dockcolor2 + " 100%)";
      }
      timehander = controlbar.find(".Player_time_handle");
      Playeroverlayposter = Playercontainer.find(".Player_poster_img");
      totaltime = 0;
      controlbar.find(".Player_time_rail");
      fullscreen_button = controlbar.find(".Player_fullscreen_button ");

      // videoElement.style.width = options.width;
      // videoElement.style.height = options.height;

      PlayerTimeTotal = controlbar.find(".Player_time_total");
      if (!!options.image) {
        self.setPoster(options.image);
      }
      // if (options.image) {
      // videoElement.load();
      // Playervideowrap.append(videoElement);
      videoElement = Playervideowrap.find("video")[0];
      var fullElement = DEVICE.isMobile ? videoElement : container.find(".Player_container_inner")[0];
      videoplayer = videoElement;
      self.videoplayer = videoElement;
      self.videoElement = videoElement;
      videoElement.style.background = "#000";
      videoElement.autoplay = options.auto;
      videoElement.volume = options.volume;
      videoElement.loop = options.loop;
      videoElement.style.display = "none";
      videoElement.muted = options.muted;
      self.setVideoUrl(options.file, options.image);
      setTimeout(function () {
        videoElement.style.display = "block";
        options.onInit(videoindex);
      }, 20);

      //videoElement = document.createElement("video");

      // addEvent('abort', function() {
      //     console.log('abort');
      // });
      addEvent("canplay", function () {
        //console.log('canplay');
        loading.hide();
      });
      addEvent("canplaythrough", function () {
        //console.log('canplaythrough');
        loading.hide();
      });
      // addEvent('durationchange', function() {
      //     console.log('durationchange');
      // });

      addEvent("ended", function () {
        options.onComplete(videoindex);
        Playeroverlayposter.fadeIn(100);
        playbtn.show();
        playpausbtn.removeClass("Player_pause");
        playpausbtn.addClass("Player_play");
      });
      addEvent("error", function () {
        //console.log('error');
      });
      addEvent("loadeddata", function () {
        totaltime = videoElement.duration;
        totaltimepanel.html(getformattime(videoElement.duration));
        // if (!!totaltimepanel && totaltimepanel.length > 0) {
        //     timerail.css({
        //         paddingRight: timerail.find('.Player_time_panel').width() + 10
        //     });
        // }
      });
      // addEvent('loadedmetadata', function() {
      //     console.log('loadedmetadata');

      // });
      // addEvent('loadstart', function() {
      //     console.log('loadstart');
      // });
      addEvent("pause", function () {
        playbtn.show();
        playpausbtn.removeClass("Player_pause");
        playpausbtn.addClass("Player_play");
        loading.hide();
        options.onPause(videoindex);
      });
      addEvent("play", function () {
        Playeroverlayposter.stop().fadeOut();
        playbtn.hide();
        options.onPlay(videoindex);
        loading.hide();
        playpausbtn.removeClass("Player_play");
        playpausbtn.addClass("Player_pause");
        if (options.fullScreen) {
          launchFullscreen(fullElement);
        }
      });
      addEvent("playing", function () {
        //console.log('playing');
        Playeroverlayposter.stop().fadeOut();
        playbtn.hide();
        options.onPlay(videoindex);
        loading.hide();
        playpausbtn.removeClass("Player_play");
        playpausbtn.addClass("Player_pause");
      });
      addEvent("progress", function () {
        //console.log('progress');
        var buffered = videoElement.buffered;
        if (buffered.length > 0) {
          buffered.end(buffered.length - 1);
        }
        //var percent = Math.floor(endtime/totaltime)*100+'%';
        //console.log(percent);
        //loadedbar.css({width:percent});
      });
      // addScreenChange(null, function(isFullscreen) {
      //     alert('document fullscreenchange');
      //     if (typeof(isFullscreen) == 'undefined') {
      //         isFullscreen = fullscreenElement();
      //     }
      //     if (isFullscreen) {
      //         $(".tvp_fullscreen").addClass('tvp_fullscreen_true');
      //     } else {
      //         $(".tvp_fullscreen").removeClass('tvp_fullscreen_true');
      //     }
      // });
      addScreenChange(fullElement, function (isFullscreen) {
        //alert('video fullscreenchange');
        if ((typeof isFullscreen === "undefined" ? "undefined" : _typeof(isFullscreen)) == "object") {
          isFullscreen = fullscreenElement();
        }
        if (isFullscreen) {
          $(".tvp_fullscreen").addClass("tvp_fullscreen_true");
        } else {
          $(".tvp_fullscreen").removeClass("tvp_fullscreen_true");
          if (!!options.fullScreen && !!options.Popup) {
            options.Popup.hide();
          }
        }
      });

      // addScreenChange(null, function(isFullscreen) {
      //     console.log(typeof(isFullscreen));
      //     //alert('video fullscreenchange');
      //     if (typeof(isFullscreen) == 'object') {
      //         isFullscreen = fullscreenElement();
      //     }
      //     if (isFullscreen) {
      //         $(".tvp_fullscreen").addClass('tvp_fullscreen_true');
      //     } else {
      //         $(".tvp_fullscreen").removeClass('tvp_fullscreen_true');
      //     }
      // });

      function fullscreenElement() {
        var fullscreenEle = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement || document.oFullscreenElement;
        //注意：要在用户授权全屏后才能获取全屏的元素，否则 fullscreenEle为null
        return fullscreenEle;
      }

      // addEvent('ratechange', function() {
      //     console.log('ratechange');
      // });
      addEvent("seeked", function () {
        //console.log('seeked');
        loading.hide();
      });
      // addEvent('seeking', function() {
      //     console.log('seeking');
      // });
      // addEvent('stalled', function() {
      //     console.log('stalled');
      // });
      // addEvent('suspend', function() {
      //     console.log('suspend');
      // });
      addEvent("timeupdate", function () {
        var currenttime = getformattime(videoElement.currentTime);
        var percent = parseInt(videoElement.currentTime / totaltime * 100) + "%";
        playedbar.css({
          width: percent
        });
        currenttimepanel.html(currenttime);
      });
      // addEvent('volumechange', function(){
      //     console.log('volumechange');
      // });

      addEvent("waiting", function () {
        //console.log('waiting');
        loading.show();
        playbtn.hide();
      });
      if (options.toolbar) {
        var startHandle = function startHandle(e) {
          handertouched = true;
          startx = e.originalEvent.pageX ? e.originalEvent.pageX : e.originalEvent.touches[0].clientX;
          if (!!window.isXuanzhuan) {
            startx = e.originalEvent.pageY ? e.originalEvent.pageY : e.originalEvent.touches[0].clientY;
          }
          videoElement.pause();
          showcontrolbar();
        };
        var moveHandle = function moveHandle(e) {
          if (handertouched) {
            //console.log(e.originalEvent);
            curtouchx = e.originalEvent.pageX ? e.originalEvent.pageX : e.originalEvent.touches[0].clientX;
            if (!!window.isXuanzhuan) {
              curtouchx = e.originalEvent.pageY ? e.originalEvent.pageY : e.originalEvent.touches[0].clientY;
            }
            movetoucx = curtouchx - startx;
            startx = curtouchx;
            settimebar(movetoucx);
            showcontrolbar();
          }
        };
        var endHandle = function endHandle(e) {
          if (handertouched) {
            //console.log(e.originalEvent);
            curtouchx = e.originalEvent.pageX ? e.originalEvent.pageX : e.originalEvent.changedTouches[0].clientX;
            if (!!window.isXuanzhuan) {
              curtouchx = e.originalEvent.pageY ? e.originalEvent.pageY : e.originalEvent.changedTouches[0].clientY;
            }
            movetoucx = curtouchx - startx;
            startx = curtouchx;
            // console.log(movetoucx);
            settimebar(movetoucx, true);
            handertouched = false;
            showcontrolbar();
          }
        };
        var toggleFullScreen = function toggleFullScreen() {
          if (fullscreenElement()) {
            exitFullscreen(fullElement);
          } else {
            launchFullscreen(fullElement);
          }
          showcontrolbar();
        };
        playbtn.click(function (e) {
          e.stopPropagation();
          self.play();
          showcontrolbar();
        });
        var isdbclick = false;
        var isclicked = false;
        optiondiv.dblclick(function (e) {
          isdbclick = true;
          toggleFullScreen();
          e.stopPropagation();
        });
        optiondiv.click(function () {
          if (isclicked) {
            return;
          }
          isclicked = true;
          setTimeout(function () {
            if (!isdbclick) {
              //self.pause();
              showcontrolbar();
            }
            isdbclick = false;
            isclicked = false;
          }, 200);
        });
        if (DEVICE.isPc) {
          container.find(".Player_container").hover(function () {
            showcontrolbar();
          }, function () {
            hidecontrolbar();
          });
          container.addClass("Player_pc");
        } else {
          container.addClass("Player_mobile");
        }
        playpausbtn.click(function () {
          if (videoElement.paused || videoElement.ended) {
            self.play();
          } else {
            self.pause();
          }
          // console.log(videoElement.currentTime);
        });
        var startx, curtouchx, movetoucx;
        var handertouched = false;
        // timehander.click(function(){
        //     alert(1);
        // });
        timehander.bind("touchstart", function (e) {
          notouch();
          startHandle(e);
        });
        timehander.bind("mousedown", function (e) {
          startHandle(e);
          showcontrolbar();
        });
        PlayerTimeTotal.bind("click", function (e) {
          var offsetx = e.pageX - PlayerTimeTotal.offset().left;
          offsetx = offsetx - playedbar.width();
          if (isNaN(offsetx)) {
            offsetx = 0;
          }
          settimebar(offsetx, true);
          showcontrolbar();
        });
        timehander.bind("touchmove", function (e) {
          moveHandle(e);
        });
        $("body").bind("mousemove", function (e) {
          moveHandle(e);
        });
        timehander.bind("touchend", function (e) {
          endHandle(e);
          cantouch();
        });
        $("body").bind("mouseup", function (e) {
          endHandle(e);
        });
        fullscreen_button.click(function () {
          toggleFullScreen();
        });
      }
    }
    var curbarwidth, changperchent, seektime;
    function settimebar(changetime, seek) {
      if (!options.toolbar) {
        return;
      }
      if (typeof seek == "undefined") seek = false;
      curbarwidth = playedbar.width();
      changedtime = curbarwidth + changetime;
      if (changedtime < 0) {
        changedtime = 0;
      }
      if (changedtime > PlayerTimeTotal.width()) {
        changedtime = PlayerTimeTotal.width();
      }
      changperchent = changedtime / PlayerTimeTotal.width();
      if (seek) {
        seektime = changperchent * totaltime;
        videoElement.currentTime = seektime;
        self.play();
      }
      playedbar.css({
        width: changperchent * 100 + "%"
      });
    }
    function showcontrolbar() {
      if (!options.toolbar) {
        return;
      }
      if (!controlbarclock) {
        controlbar.stop().removeClass("hidden").animate({
          opacity: 1
        }, 300, function () {});
      } else {
        clearTimeout(controlbarclock);
        controlbarclock = null;
      }
      controlbarclock = setTimeout(function () {
        hidecontrolbar();
      }, 5000);
    }
    function hidecontrolbar() {
      if (!!controlbarclock) {
        clearTimeout(controlbarclock);
        controlbarclock = null;
      }
      controlbar.stop().animate({
        opacity: 0
      }, 300, function () {
        controlbar.addClass("hidden");
        controlbarclock = null;
      });
    }
    function launchFullscreen(element) {
      //此方法不可以在異步任務中執行，否則火狐無法全屏
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitEnterFullScreen) {
        element.webkitEnterFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.oRequestFullscreen) {
        element.oRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
    }
    function exitFullscreen(element) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (element.msExitFullscreen) {
        document.msExitFullscreenn();
      } else if (element.oExitFullscreen) {
        document.oExitFullscreenn();
      }
    }
    function addEvent(event, callback) {
      videoElement.addEventListener(event, callback, false);
      videoElement.addEventListener("webkit" + ucfirst(event), callback, false);
      videoElement.addEventListener("ms" + ucfirst(event), callback, false);
      videoElement.addEventListener("moz" + ucfirst(event), callback, false);
      videoElement.addEventListener("o" + ucfirst(event), callback, false);
    }
    function ucfirst(str) {
      var str = str.toLowerCase();
      var strarr = str.split(" ");
      var result = "";
      for (var i in strarr) {
        result += strarr[i].substring(0, 1).toUpperCase() + strarr[i].substring(1) + " ";
      }
      return result;
    }
    function addScreenChange(element, callback) {
      element = !!element ? element : document;
      element.addEventListener("fullscreenchange", callback);
      element.addEventListener("webkitfullscreenchange", callback);
      element.addEventListener("mozfullscreenchange", callback);
      element.addEventListener("MSFullscreenChange", callback);
      element.addEventListener("oFullscreenChange", callback);
      element.addEventListener("webkitendfullscreen", function () {
        callback(false);
      });
      element.addEventListener("webkitbeginfullscreen", function () {
        callback(true);
      });
    }
    function addsources(videoElement, files) {
      if (typeof files == "string") {
        addsource(videoElement, files);
      } else if ((typeof files === "undefined" ? "undefined" : _typeof(files)) == "object") {
        for (var i = 0; i < files.length; i++) {
          addsource(videoElement, files[i]);
        }
      }
    }
    function addsource(videoElement, fileurl) {
      var sourceElement = document.createElement("source");
      sourceElement.src = fileurl;
      sourceElement.type = formats[getsuffix(fileurl)];
      videoElement.appendChild(sourceElement);
    }
    function getformattime(second) {
      second = parseInt(second);
      var result = "";
      var h = Math.floor(second / (60 * 60));
      second = second - h * (60 * 60);
      var m = Math.floor(second / 60);
      second = second - m * 60;
      if (h < 10) h = "0" + h;
      if (m < 10) m = "0" + m;
      if (second < 10) second = "0" + second;
      if (h != "00") {
        result += h + ":";
      }
      result += m + ":" + second;
      return result;
    }
    this.play = function () {
      //videoElement.load();
      videoElement.play();
    };
    this.pause = function () {
      videoElement.pause();
    };
    this.stop = function () {
      videoElement.pause();
      videoElement.currentTime = 0;
    };
    this.setVolume = function (value) {
      if (value > 1) {
        value = 1;
      }
      videoElement.volume = value;
    };
    this.setPoster = function (imageurl) {
      if (typeof imageurl == "undefined") {
        imageurl = "";
      }
      Playeroverlayposter.attr("data-pic", imageurl);
      Playeroverlayposter.css({
        backgroundImage: "url(" + imageurl + ")"
      });
    };
    this.setVideoUrl = function (fileurl, imageurl) {
      if (!fileurl) {
        return;
      }
      videoplayer.pause();
      var childNodes = videoElement.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        videoElement.removeChild(childNodes[i]);
      }
      addsources(videoElement, fileurl);
      this.setPoster(imageurl);
      // videoElement.poster = imageurl;
      Playeroverlayposter.stop().show();
      playbtn.show();
      loading.hide();
      videoplayer.load();
    };
    this.setVideo = this.setVideoUrl;
    init();
  }
  //flash播放器
  function flashPlayer() {
    var self = this;
    var isflashloaded = false;
    var flashloadedCallbacks = [];
    function init() {
      if (typeof window.playerindex == "undefined") {
        window.playerindex = 0;
      } else {
        window.playerindex++;
      }
      if (!isNaN(options.width)) {
        options.width = options.width + "px";
      } else if (options.width.indexOf("%") < 0) {
        options.width = "100%";
      }
      if (!isNaN(options.height)) {
        options.height = options.height + "px";
      }
      options.file = getFilePath(options.file);
      self.videoid = "Player_video" + playerindex;
      self.currentvideo = options.file;
      var imghtml = "";
      var imgshowcss = "display:none;";
      if (options.image) {
        imgshowcss = "display:block;";
      }
      if (options.toolbar) {
        imghtml = '<div class="Player_video_popup_image" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:10;background:#000 url(' + options.image + ") no-repeat center;background-size:cover;" + imgshowcss + '"><a href="javascript:void(0)" class="Player_video_play_btn" style="outline:none;width:67px;height:67px;position:absolute;left:50%;top:50%;z-index:20;display:block;margin-left:-34px;margin-top:-34px;transition: all 0.3s;-moz-transition: all 0.3s;-webkit-transition: all 0.3s;-o-transition: all 0.3s;"></a><div class="Player_black_bg" style="width:100%;height:100%;position:absolute;background:#000;opacity:0.3;filter:alpha(opacity=30);z-index:15;"></div></div>';
      }
      var outterHeight = "";
      var innerTop = "";
      var objHeight = "100px";
      if (options.height == "auto") {
        if (DEVICE.isIe7 || DEVICE.isIe6) {
          outterHeight = "1px";
        } else {
          outterHeight = "0";
        }
        innerTop = "-120%";
      } else {
        outterHeight = options.height;
        innerTop = 0;
        objHeight = "100%";
      }
      var objectHtml = "";
      if (!ismicro) {
        objectHtml = '<embed style="vertical-align:top;" id="' + self.videoid + '" flashvars="setContainerSize=setContainerSize' + window.playerindex + "&toolbar=" + options.toolbar + "&videoUrl=" + options.file + "&getUserComplete=videoComplete" + window.playerindex + "&flashComplete=flashLoaded" + window.playerindex + '"src="' + options.swf + '" quality="high" width="100%" height="100%" name="flashResize" wmode="Opaque" align="middle" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer_cn" bgcolor="#000000" />';
      } else {
        objectHtml = '<object style="vertical-align:top;" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%" align="middle" id="' + self.videoid + '">' + '<param name="allowScriptAccess" value="always" />' + '<param name="allowFullScreen" value="true" />' + '<param name="movie" value="' + options.swf + '"/>' + '<param name="bgcolor" value="#000000" />' + '<param name="wmode" value="Opaque">' + '<param name="quality" value="high" />' + '<param name="FlashVars" value="setContainerSize=setContainerSize' + window.playerindex + "&toolbar=" + options.toolbar + "&videoUrl=" + options.file + "&getUserComplete=videoComplete" + window.playerindex + "&flashComplete=flashLoaded" + window.playerindex + '"/>' + "</object>";
      }
      var html = "<div class='video_wrap_outter' style='width:" + options.width + ";height:" + outterHeight + ";position:relative;overflow:hidden;'><div style='position:relative;top:" + innerTop + ";width:100%;height:" + objHeight + ";' class='video_wrap_inner' id=video_wrap_inner_" + self.videoid + ">" + imghtml + objectHtml + "</div></div>";
      container.html(html);
      window["videoComplete" + window.playerindex] = function () {
        if (options.loop) {
          player.play();
          options.onReplay(videoindex);
        } else {
          $(".Player_video_popup_image").fadeIn();
          options.onComplete(videoindex);
        }
      };
      var video_wrap_outter = container.find(".video_wrap_outter");
      var video_wrap_inner = container.find(".video_wrap_inner");
      window["setContainerSize" + window.playerindex] = function (array) {
        self.videosize = array;
        if (options.height == "auto") {
          setHeight();
        } else {
          video_wrap_outter.height(options.height);
          video_wrap_inner.css({
            top: 0,
            height: "100%"
          });
        }
      };
      if (options.version == "v1") {
        options.onInit(videoindex);
        if (options.auto) {
          setTimeout(function () {
            self.play();
          }, 1000);
        }
      } else {
        window["flashLoaded" + window.playerindex] = function () {
          isflashloaded = true;
          options.onInit(videoindex);
          if (options.auto) {
            setTimeout(function () {
              self.play();
            }, 500);
          }
          for (var i in flashloadedCallbacks) {
            if (_typeof(flashloadedCallbacks[i] == "function")) {
              flashloadedCallbacks[i]();
            }
          }
        };
      }
      container.find(".Player_video_popup_image").hover(function () {
        $(this).find(".Player_black_bg").stop().animate({
          opacity: 0.6
        }, 300);
        $(this).find(".Player_video_play_btn").css(prefix.css + "transform", "scale(1.1)");
      }, function () {
        $(this).find(".Player_black_bg").stop().animate({
          opacity: 0.3
        }, 300);
        $(this).find(".Player_video_play_btn").css(prefix.css + "transform", "none");
      });
      container.find(".Player_video_play_btn").click(function () {
        self.play();
      });
      function setHeight(resizeRun) {
        var width, height;
        if (options.height == "auto" || typeof resizeRun != "undefined") {
          if (options.width.indexOf("%") > -1) {
            width = video_wrap_outter.width();
            // if (typeof(resizeRun) == 'undefined') {
            //     $(window).resize(function() {
            //         setHeight(true);
            //     });
            // }
          } else {
            width = parseInt(options.width);
          }
          height = width * self.videosize[1] / self.videosize[0];
          // height = width * options.ratio;
          video_wrap_inner.css({
            top: 0,
            height: "100%"
          });
          if (options.resizeAnimate) {
            video_wrap_outter.animate({
              height: height
            }, 300);
          } else {
            video_wrap_outter.height(height);
          }
          // options.height = "100%";
          options.onResize(videoindex, height);
        } else {
          video_wrap_outter.height("100%");
          video_wrap_inner.css({
            top: 0,
            height: "100%"
          });
        }
      }
    }
    function getElement() {
      var e = document.getElementById(self.videoid);
      if (e) {
        return e;
      } else {
        return false;
      }
    }
    this.play = function () {
      if (isflashloaded) {
        container.find(".Player_video_popup_image").fadeOut();
        setTimeout(function () {
          getElement().resumeVideo();
        }, 100);
        options.onPlay(videoindex);
      } else {
        flashloadedCallbacks.push(function () {
          container.find(".Player_video_popup_image").fadeOut();
          setTimeout(function () {
            getElement().resumeVideo();
          }, 100);
          options.onPlay(videoindex);
        });
      }
    };
    this.pause = function () {
      if (!!getElement()) {
        if (!!getElement().pauseVideo) {
          getElement().pauseVideo();
        }
      }
    };
    this.stop = function () {
      this.pause();
    };
    this.setVolume = function () {};
    this.setVideoUrl = function (url, image) {
      getElement().setVideoUrl(url);
      self.currentvideo = url;
      if (typeof image == "undefined") {
        image = null;
      }
      if (image) {
        container.find(".Player_video_popup_image").css({
          backgroundImage: "url(" + image + ")"
        }).fadeIn(300);
      } else {
        container.find(".Player_video_popup_image").hide();
      }
      // }
    };
    init();
  }
  function getsuffix(name) {
    var strs = name.split(".");
    return strs[strs.length - 1];
  }
  function bindPlayerFun() {
    if (!!player) {
      for (var i in player) {
        if (typeof player[i] == "function") {
          self[i] = player[i];
        }
      }
    }
  }
  setup();
}
function getCurUrl() {
  var ur = window.location.protocol + "//" + window.location.host + window.location.pathname;
  var pathArr = window.location.pathname.split("/");
  var ur2 = ur;
  if (pathArr[pathArr.length - 1].indexOf(".") > -1) {
    ur2 = ur2.replace(pathArr[pathArr.length - 1], "");
  }
  return ur2;
}
function getFilePath(file) {
  if (file.indexOf("http://") < 0 && file.indexOf("https://") < 0) {
    file = getCurUrl() + file;
  }
  return file;
}
function pcPopupVideo(options) {
  var self = this;
  var popupobj;
  if (!!options.pc) {
    options = $.extend(options, options.pc);
  }
  var popupoptions = $.extend({}, options);
  var videooptions = $.extend({}, options);
  videooptions.auto = false;
  var resizeCall = videooptions.onResize;
  videooptions.onResize = function (videoindex, height) {
    self["popup"].resize(self.popupobj, {
      height: height,
      marginTop: -height / 2
    });
    if (typeof resizeCall == "function") {
      resizeCall();
    }
  };
  if ($(".POPUP-Player").length < 1) {
    var closebtnbg;
    closebtnbg = img;
    popupobj = '<div class="POPUP-Player" style="display:none;background:#000;"><a style="width:50px;height:50px;background:url(' + closebtnbg + ') no-repeat center;position:absolute;top:0;right:-50px;display:block;" class="POPUP-Player-CLOSE close" href="javascript:void(0)"></a><div id="POPUP-Player-CONTAINER"></div></div>';
    popupobj = $(popupobj);
    $("body").append(popupobj);
  } else {
    popupobj = $(".POPUP-Player");
  }
  popupoptions = $.extend(popupoptions, {
    animation: "fade",
    scrollObj: false
  });
  this["popup"] = new Popup(popupobj, popupoptions);
  videooptions.popup = {
    hide: function hide() {
      self["popup"].hide(popupobj);
    }
  };
  this["video"] = new Player(popupobj.find("#POPUP-Player-CONTAINER"), videooptions);
  this["popup"].setVideo(this["video"]);
  this.popupobj = $(".POPUP-Player");
  this.play = function (url, image) {
    popupobj = $(".POPUP-Player");
    if (typeof url != "undefined") {
      self["video"].setVideoUrl(url, image);
    }
    self["popup"].show(popupobj);
  };
  this.setVideoUrl = self["video"].setVideoUrl;
  this.pause = function () {
    popupobj = $(".POPUP-Player");
    self["popup"].hide(popupobj);
  };
}
function mobilePopupVideo(options) {
  // if (DEVICE.isMobile) {
  if (!!options.mobile) {
    options = $.extend(options, options.mobile);
  }
  var defaultOptions = {
    backText: "关闭"
  };
  options = $.extend(defaultOptions, options);
  var videooptions = $.extend({}, options);
  var self = this;
  videooptions.auto = false;
  if ($(".VIDEOBG").length == 0) {
    var videobg = $('<div class="VIDEOBG"></div>');
    $("body").append(videobg);
    videobg.css({
      width: "100%",
      height: "100%",
      background: "#000",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 999999,
      display: "none",
      alignItems: "center"
    });
    // var topbar = $('<div class="VIDEOTOP"></div>');
    var finish = $('<a href="javascript:void(0)" class="VIDEO-FINISH"> </a>');
    videobg.append(finish);
    // topbar.append(finish);
    var videoWrap = $('<div id="VIDEOWRAP"></div>');
    videobg.append(videoWrap);
  } else {
    var videoWrap = $("#VIDEOWRAP");
  }
  videooptions.Popup = {
    hide: playEnd
  };
  this["video"] = new Player(videoWrap, videooptions);
  this.play = function (file, img) {
    notouch();
    $(".VIDEOBG").show();
    $(".VIDEOBG")[0].style.visibility = "visible";
    self["video"].setVideoUrl(file, img);
    self["video"].play();
    $(".VIDEO-FINISH").unbind("click").click(function () {
      playEnd();
    });
  };
  this.pause = function () {
    playEnd();
  };
  this.setVideoUrl = self["video"].setVideoUrl;
  function playEnd() {
    if (typeof options.endHide == "function") {
      options.endHide();
    }
    if (typeof options.endHide == "function") {
      options.endHide();
    }
    self["video"].pause();
    $(".VIDEOBG").hide();
    $(".VIDEOBG")[0].style.visibility = "hidden";
    cantouch();
  }
}
function notouch() {
  document.addEventListener("touchmove", bodyScroll, false);
}
function cantouch() {
  document.removeEventListener("touchmove", bodyScroll, false);
}
function bodyScroll(e) {
  e.preventDefault();
}
function popupVideo() {
  if (DEVICE.isMobile) {
    return mobilePopupVideo;
  } else {
    return pcPopupVideo;
  }
}
function PlayerSET(allset) {
  if (typeof allset != "undefined" && allset) {
    $(".Player-CONTAINER").each(function () {
      $(this).html("");
      $(this).removeClass("Player-SETTED");
    });
  }
  if ($(".Player-CONTAINER").not($(".Player-SETTED")).length > 0) {
    $(".Player-CONTAINER").not($(".Player-SETTED")).each(function () {
      var pcwidth = $(this).data("pcwidth");
      if (!pcwidth) {
        pcwidth = "100%";
      }
      var mwidth = $(this).data("mwidth");
      if (!mwidth) {
        mwidth = "100%";
      }
      var pcheight = $(this).data("pcheight");
      if (!pcheight) {
        pcheight = "auto";
      }
      var mheight = $(this).data("mheight");
      if (!mheight) {
        mheight = "auto";
      }
      var pcoptionHeight = "100%";
      var mobileoptionHeight = "100%";
      if (DEVICE.isMobile) {
        $(this).css({
          width: mwidth,
          height: mheight
        });
      } else {
        $(this).css({
          width: pcwidth,
          height: pcheight
        });
      }
      if (pcheight == "auto") {
        pcoptionHeight = "auto";
      }
      if (mheight == "auto") {
        mobileoptionHeight = "auto";
      }
      var options = {
        mobile: {
          file: $(this).data("file"),
          width: "100%",
          height: mobileoptionHeight,
          auto: $(this).data("auto"),
          image: $(this).data("image"),
          volume: 1,
          loop: $(this).data("loop")
        },
        pc: {
          file: $(this).data("file"),
          width: "100%",
          height: pcoptionHeight,
          auto: $(this).data("auto"),
          image: $(this).data("image"),
          volume: 1,
          loop: $(this).data("loop")
        }
      };
      $(this).Player(options);
      $(this).addClass("Player-SETTED");
    });
  }
}

// _defineProperty(Player, "popup", popupVideo());
// _defineProperty(Player, "plugin", function(Flag) {
//     if (Flag && Flag.fn) {
//         (function(Flag) {
//             Flag.fn.Player = function(params) {
//                 var result = [];
//                 if (typeof window.PlayervideoIndex == "undefined") {
//                     window.PlayervideoIndex = 0;
//                 }
//                 this.each(function(index) {
//                     result.push(new Player($(this), params, PlayervideoIndex));
//                     PlayervideoIndex++;
//                     // $(this).data('Player', new Player($(this), params));
//                 });
//                 if (result.length <= 1) {
//                     return result[0];
//                 }
//                 return result;
//             };
//         })(Flag);
//     }
//     return Player;
// });

function myPlayer(container, options) {
  if (!container) {
    container = {};
  }
  if (!options) {
    options = container;
    popupVideo().call(this, options);
  } else {
    Player.call(this, container, options);
  }
}
$(function () {
  PlayerSET();
});
function cutHex(h) {
  return h.charAt(0) == "#" ? h.substring(1, 7) : h;
}
function hexToRGB(color) {
  var hex = "";
  if (color.indexOf("rgb") == 0) {
    hex = color.replace("rgb(", "").replace("rgba(", "").replace(")", "");
  } else if (color.indexOf("#") == 0) {
    color = color.replace("#", "");
    if (color.length == 3) {
      color = color.replace("#", "");
      color = color + color;
    }
    hex = parseInt(cutHex(color).substring(0, 2), 16) + "," + parseInt(cutHex(color).substring(2, 4), 16) + "," + parseInt(cutHex(color).substring(4, 6), 16);
  }
  if (hex) {
    hex = hex.split(",");
  }
  return hex;
}

export { myPlayer as default };
//# sourceMappingURL=index.js.map
