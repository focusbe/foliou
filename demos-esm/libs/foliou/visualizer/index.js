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

function Visualizer(options) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!window.AudioContext) {
    if (ztUtil.isdev) {
      alert("浏览器不支持audiocontext，插件visualizer无法使用");
    }
    return;
  }
  if (_typeof(options) != "object") {
    return;
  }
  var defaultOptionis = {
    file: "",
    auto: true,
    fps: 60,
    onReady: function onReady() {},
    onPlay: function onPlay() {},
    onPause: function onPause() {},
    onUpdate: function onUpdate() {}
  };
  options = Object.assign(defaultOptionis, options);
  if (!options.file) {
    return;
  }
  var self = this;
  this.audioEl = null;
  this.state = "loading";
  this.context = new window.AudioContext();
  this.duration = 0;
  var audioBufferSourceNode = this.context.createBufferSource();
  var gainNode = this.context.createGain();
  var analyser = this.context.createAnalyser();
  var bufferLength = analyser.frequencyBinCount; // 返回的是 analyser的fftsize的一半
  var dataArray = new Uint8Array(bufferLength);
  var offsetTime = -1;
  var soundBuff;
  var getFile = function getFile(url, cb) {
    // alert(url);
    //url 线上音频地址
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function () {
      var audioData = request.response; // 请求回来的arraybuffer的音频文件
      //下面就是解码操作 buffer节点
      cb(audioData);
    };
    request.onerror = function () {
      aert("加载失败");
      c(false);
    };
    request.send();
  };
  var decodeAudioData = function decodeAudioData(audioData) {
    self.context.decodeAudioData(audioData, function (buffer) {
      soundBuff = buffer;
      self.duration = buffer.duration;
      audioBufferSourceNode.buffer = buffer;
      audioBufferSourceNode.loop = true;
      if (!!self.audioEl) {
        gainNode.gain.value = 0;
      } else {
        gainNode.gain.value = 1;
      }
      gainNode.connect(self.context.destination);
      audioBufferSourceNode.connect(analyser);
      analyser.connect(gainNode);
      offsetTime = self.context.currentTime;
      self.state = "loaded";
      var starttime = !!self.audioEl ? self.audioEl.currentTime : 0;
      audioBufferSourceNode.start(0, starttime);
      options.onReady();
      if (!self.audioEl) {
        if (self.context.state == "running") {
          options.onPlay();
        } else {
          self.resume();
        }
      }
    });
  };
  function init() {
    if (DEVICE.isiOS) {
      //ios 用audiocontext 在静音下没有声音。用audio播放音乐
      this.audioEl = document.createElement("audio");
      audioEl.src = options.file;
      audioEl.loop = true;
      audioEl.addEventListener("play", function () {
        options.onPlay();
        self.context.resume();
      }, false);
      audioEl.addEventListener("pause", function () {
        options.onPause();
        self.context.suspend();
      }, false);
      audioEl.addEventListener("ended", function () {
        options.onPause();
        self.context.suspend();
      }, false);
      var lasttime = 0,
        curtime;
      audioEl.addEventListener("timeupdate", function () {
        curtime = new Date().getTime();
        if (!soundBuff || curtime - lasttime < 1000) {
          return;
        }
        lasttime = curtime;
        if (!!audioBufferSourceNode) {
          audioBufferSourceNode.stop();
          audioBufferSourceNode = null;
        }
        audioBufferSourceNode = self.context.createBufferSource();
        audioBufferSourceNode.buffer = soundBuff;
        audioBufferSourceNode.connect(analyser);
        analyser.connect(gainNode);
        audioBufferSourceNode.start(0, audioEl.currentTime);
        options.onUpdate(self.getFrequency(), self.getCurrentTime());
      }, false);
    } else {
      self.context.onstatechange = function () {
        if (self.context.state == "running") {
          if (self.state == "loading") {
            return;
          }
          options.onPlay();
        } else {
          options.onPause();
        }
      };
      var _draw = function draw() {
        // console.log(self.state);
        if (self.state == "running" || self.state == "loaded") {
          options.onUpdate(self.getFrequency(), self.getCurrentTime());
        }
        window.requestAnimationFrame(_draw);
      };
      _draw();
    }
  }
  this.getCurrentTime = function () {
    if (!!self.audioEl) {
      return audioEl.currentTime;
    }
    if (offsetTime < 0) {
      return 0;
    }
    return (this.context.currentTime - offsetTime) % self.duration;
  };
  this.pause = function () {
    if (!!self.audioEl) {
      audioEl.pause();
    }
    self.context.suspend();
  };
  this.resume = function () {
    if (!!self.audioEl) {
      audioEl.play();
    }
    self.context.resume();
  };
  this.getFrequency = function () {
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  };
  if (options.auto) {
    getFile(options.file, decodeAudioData);
    if (typeof WeixinJSBridgeReady === "undefined") {
      if (document.addEventListener) {
        document.addEventListener("WeixinJSBridgeReady", function () {
          self.resume();
        }, false);
      }
    }
    self.resume();
  }
  init();
}

export { Visualizer as default };
//# sourceMappingURL=index.js.map
