import $ from 'jquery';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
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

var BgSound = function BgSound(option) {
  var supportaudio = !!document.createElement("audio");
  var volume = 1;
  var self = this;
  var cursrc = "";
  var curstate;
  var shouldplay = false;
  var defaultOption = {
    file: "",
    loop: true,
    volume: 1,
    autoplay: true,
    onplay: function onplay() {},
    onpause: function onpause() {}
  };
  option = $.extend(defaultOption, option);
  self.init = function () {
    var soundAudio = $("#SOUND_AUDIO");
    var soundWrap = $("body");
    if (soundWrap.length == 0) {
      $(function () {
        self.init();
      });
      return;
    }
    if (soundAudio.length == 0) {
      var soundaudio_outer = $('<div id="SOUND_AUDIO_outer"></div>');
      soundaudio_outer.css({
        position: "absolute",
        width: 100,
        height: 100,
        top: "-500%"
      });
      soundWrap.append(soundaudio_outer);
      var audiostr;
      if (supportaudio) {
        audiostr = '<audio preload="auto" id="SOUND_AUDIO" class="SOUND_AUDIO"></audio>';
      } else {
        audiostr = '<embed id="SOUND_AUDIO"></embed>';
      }
      soundaudio_outer.append(audiostr);
    }
    soundAudio = $("#SOUND_AUDIO");
    self.audioElement = soundAudio[0];
    self.setAudio();
    if (option.autoplay) {
      var _touchPlayZhibo = function touchPlayZhibo() {
        // alert("touchplayer");
        self.play();
        $(document).unbind("touchstart", _touchPlayZhibo);
        $(document).unbind("mousedown", _touchPlayZhibo);
      }; //
      if (DEVICE.isWeixin && (typeof WeixinJSBridge === "undefined" ? "undefined" : _typeof(WeixinJSBridge)) != "object") {
        if (typeof WeixinJSBridgeReady === "undefined") {
          if (document.addEventListener) {
            document.addEventListener("WeixinJSBridgeReady", function () {
              self.play();
            }, false);
          } else {
            $(document).bind("touchstart", _touchPlayZhibo);
            $(document).bind("mousedown", _touchPlayZhibo);
          }
        }
      } else {
        try {
          if (self.audioElement.paused) {
            self.audioElement.load();
            self.audioElement.oncanplay = function () {
              self.play();
            };
            $(document).bind("touchstart", _touchPlayZhibo);
            $(document).bind("mousedown", _touchPlayZhibo);
          }
        } catch (error) {}
      }
    }
    self.bind();
  };
  self.bind = function () {
    if (!self.audioElement) {
      return;
    }
    if (supportaudio) {
      self.audioElement.addEventListener("playing", function () {
        if (typeof option.onplay == "function") {
          option.onplay();
        }
      }, false);
      self.audioElement.addEventListener("pause", function () {
        if (typeof option.onpause == "function") {
          option.onpause();
        }
      }, false);
      self.audioElement.addEventListener("ended", function () {
        if (typeof option.onpause == "function") {
          option.onpause();
        }
      }, false);
      //self.bindBackRun();
    }
  };
  self.setAudio = function (thisoption) {
    if (_typeof(thisoption) == "object") {
      option = $.extend(option, thisoption);
    }
    if (cursrc != option.file) {
      SOUND_AUDIO.src = option.file;
      cursrc = option.file;
    }
    if (supportaudio) {
      if (!option.loop) {
        SOUND_AUDIO.removeAttribute("loop");
      } else {
        SOUND_AUDIO.loop = "loop";
      }
      if (!option.autoplay) {
        SOUND_AUDIO.removeAttribute("autoplay");
      } else {
        SOUND_AUDIO.autoplay = "autoplay";
      }
      SOUND_AUDIO.volume = option.volume;
      volume = option.volume;
    } else {
      if (!option.loop) {
        SOUND_AUDIO.removeAttribute("loop");
      } else {
        SOUND_AUDIO.loop = true;
      }
      if (!option.autoplay) {
        SOUND_AUDIO.removeAttribute("autostart");
      } else {
        SOUND_AUDIO.autoplay = true;
      }
    }
  };
  self.play = function (thisoption) {
    if (_typeof(thisoption) == "object") {
      option = $.extend(option, thisoption);
      self.setAudio();
    } else if (typeof thisoption == "string") {
      option.file = thisoption;
      self.setAudio();
    }
    self.resume();
    if (!supportaudio) {
      if (typeof option.onplay == "function") {
        option.onplay();
      }
    }
    curstate = "play";
  };
  self.pause = function (huanchun) {
    if (!self.audioElement) return;
    if (DEVICE.isiOS || !supportaudio) {
      huanchun = false;
    }
    if (typeof huanchun == "undefined") {
      huanchun = true;
    }
    if (self.volumeclock) {
      clearInterval(self.volumeclock);
      self.volumeclock = null;
    }
    //self.audioElement.pause();
    if (huanchun) {
      volume = self.audioElement.volume;
      self.volumeclock = setInterval(function () {
        volume -= 0.2;
        if (volume <= 0) {
          volume = 0;
          self.audioElement.volume = 0;
          clearInterval(self.volumeclock);
          self.volumeclock = null;
          self.audioElement.pause();
          return;
        } else {
          self.audioElement.volume = volume;
        }
      }, 100);
    } else {
      //self.audioElement.volume = 0;
      self.audioElement.pause();
    }
    if (!supportaudio) {
      if (typeof option.onpause == "function") {
        option.onpause();
      }
    }
    curstate = "pause";
  };
  self.stop = function (huanchun) {
    self.pause(huanchun);
    self.audioElement.load();
  };
  self.resume = function () {
    if (!self.audioElement) return;
    if (!DEVICE.isiOS) {
      if (self.volumeclock) {
        clearInterval(self.volumeclock);
        self.volumeclock = null;
      }
      volume = self.audioElement.volume;
      try {
        self.audioElement.play();
      } catch (error) {
        // console.log(error);
      }
      self.volumeclock = setInterval(function () {
        volume += 0.2;
        if (volume >= option.volume) {
          self.audioElement.volume = option.volume;
          clearInterval(self.volumeclock);
          self.volumeclock = null;
          return;
        } else {
          self.audioElement.volume = volume;
        }
      }, 100);
    } else {
      //self.audioElement.load();
      self.audioElement.play();
    }
    curstate = "play";
  };
  self.bindBackRun = function () {
    if (option.backrun) {
      return;
    }
    // if (DEVICE.isWeixin) {
    // 	return;
    // }
    // Get Browser Specific Hidden Property
    function hiddenProperty(prefix) {
      if (typeof document["hidden"] != "undefined") {
        return "hidden";
      }
      if (prefix) {
        return prefix + "Hidden";
      } else {
        return "hidden";
      }
    }

    // Get Browser Specific Visibility State
    function visibilityState(prefix) {
      if (prefix) {
        return prefix + "VisibilityState";
      } else {
        return "visibilityState";
      }
    }
    // Get Browser Specific Event
    function visibilityEvent(prefix) {
      if (prefix) {
        return prefix + "visibilitychange";
      } else {
        return "visibilitychange";
      }
    }
    var prefix = PREFIX.js;
    // console.log(PREFIX);
    var hidden = hiddenProperty(prefix);
    var visibilityState = visibilityState(prefix);
    var visibilityEvent = visibilityEvent(prefix);
    //console.log(visibilityEvent);
    document.addEventListener(visibilityEvent, visibleChange, false);
    document.addEventListener("visibilitychange", visibleChange, false);
    function visibleChange(event) {
      // console.log(event);
      // console.log(document[hidden]);
      if (!document[hidden]) {
        // The page is visible.
        //console.log("show");
        if (shouldplay) {
          console.log("重新播放");
          self.resume(true);
        }
      } else {
        // console.log("hide");
        // console.log("暂停播放");
        // The page is hidden.
        // console.log(curstate);
        if (curstate == "play") {
          shouldplay = true;
          self.pause(true);
        } else {
          shouldplay = false;
        }
      }
    }
  };
  self.init();
};

export { BgSound as default };
//# sourceMappingURL=index.js.map
