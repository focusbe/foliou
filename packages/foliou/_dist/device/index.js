(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.Device = factory());
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

	return DEVICE;

})));
