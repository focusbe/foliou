(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.Touch = factory());
}(this, (function () { 'use strict';

	var DEVICE = (function () {
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
		var supportCss3 = function (prop) {
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
		var supportTag = function (tagname, attr) {
			if (!attr) {
				return !!document.createElement(tagname);
			} else {
				return !!(attr in document.createElement(tagname));
			}
		};
		var ieVersion = function () {
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
	})();

	/**
	    @author:pengzai
	    @blog:http://foliou.focusbe.com
	    @github:https://github.com/focusbe/foliou
	**/
	var Touch = function (element, callbacks) {
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
				_temptouch = { pageX: e.pageX, pageY: e.pageY };
			} else {
				return;
			}
			startPosition = { x: _temptouch.pageX, y: _temptouch.pageY };
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
				_temptouch = { pageX: e.pageX, pageY: e.pageY };
			} else {
				return;
			}
			delta = { x: _temptouch.pageX - startPosition.x, y: _temptouch.pageY - startPosition.y };
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
				_temptouch = { pageX: e.pageX, pageY: e.pageY };
			} else {
				return;
			}

			if (typeof callbacks.end == "function") {
				delta = { x: _temptouch.pageX - startPosition.x, y: _temptouch.pageY - startPosition.y };
				if (typeof callbacks.end == "function") {
					callbacks.end(delta, e);
				}
			}
		};
		this._init();
	};

	return Touch;

})));
