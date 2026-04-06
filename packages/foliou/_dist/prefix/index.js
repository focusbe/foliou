(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.Prefix = factory());
}(this, (function () { 'use strict';

	//获取js，css3浏览器前缀
	/**
	    @author:pengzai
	    @blog:http://foliou.focusbe.com
	    @github:https://github.com/focusbe/foliou
	**/

	var prefix = function () {
		if (typeof window.getComputedStyle == "undefined") {
			return {
				dom: "",
				lowercase: "",
				css: "",
				js: ""
			};
		}
		var styles = window.getComputedStyle(document.documentElement, ""),
			pre = (Array.prototype.slice
				.call(styles)
				.join("")
				.match(/-(moz|webkit|ms)-/) ||
				(styles.OLink === "" && ["", "o"]))[1],
			dom = "WebKit|Moz|MS|O".match(new RegExp("(" + pre + ")", "i"))[1];
		return {
			dom: dom,
			lowercase: pre,
			css: "-" + pre + "-",
			js: pre == "ms" ? "ms" : pre[0].toUpperCase() + pre.substr(1)
		};
	};
	var index = prefix();

	return index;

})));
