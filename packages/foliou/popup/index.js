/**
    @author:pengzai
    @blog:http://foliou.focusbe.com
    @github:https://github.com/focusbe/foliou
**/
import $ from 'jquery';
import DEVICE from "../device/index";
var ResizeSensor = require("./lib/resizeSensor");
import Animate from "../animate/index";
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

var Popup = function (coverEle, options) {
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
		video: null, //内嵌的视频对象
		auto: true,
		padding: 20, //弹窗距离上下的距离
		replace: true, //窗口模式 replaceF 表示当已经有一个窗口打开时，将会替换当前窗口
		zIndex: 3000,
		scrollObj: "this",
		opacity: 0.85,
		fixbody: true,
		autoCenter: true,
		closeOnClickModal: true,
		startShow: function startShow(obj) { },
		endShow: function endShow(obj) { },
		startHide: function startHide(obj) { },
		endHide: function endHide(obj) { }
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
			$(this)
				.find(".close,.confirm,.Popup_close")
				.unbind("click")
				.bind("click", function (event) {
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
			obj.css({ overflow: "auto" });
		}

		// if (typeof scrollobj.data('Popupcoverid') == 'undefined' && scrollobj.height() > obj.height()) {
		//     scrollobj.height(obj.height());
		// }
		if (DEVICE.isPc) {
		} else {
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
						} else {
							// console.log('不能滚动了');
						}
					} else if (scrollobj.scrollTop() + scrollobj.height() < scrollobj[0].scrollHeight) {
						event.stopPropagation();
					} else {
						// console.log('不能滚动了');
					}
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
		if ((typeof obj != "object" || !obj) && coverEle.length == 1) {
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
		if (typeof obj != "object" || !obj || obj.attr("data-state") == "show" || obj.attr("data-state") == "showing") {
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
			obj.stop()
				.css({
					zIndex: self.curZindex,
					opacity: 1,
					display: "block",
					marginLeft: -obj.outerWidth() / 2 + "px",
					marginTop: -obj.outerHeight() / 2 + "px"
				})
				.animate(
					{
						opacity: 1,
						display: "block"
					},
					time,
					"swing",
					function () {
						callback();
					}
				);
		} else if (animation == "fadedown") {
			obj.css({
				zIndex: self.curZindex,
				marginTop: -obj.outerHeight() / 2 - 150 + "px",
				marginLeft: -obj.outerWidth() / 2 + "px",
				opacity: 0,
				display: "block"
			})
				.stop()
				.animate(
					{
						marginTop: -obj.outerHeight() / 2 + "px",
						opacity: 1
					},
					time,
					"swing",
					function () {
						callback();
					}
				);
		} else if (animation == "fadeup") {
			obj.css({
				zIndex: self.curZindex,
				marginTop: -obj.outerHeight() / 2 + 150 + "px",
				marginLeft: -obj.outerWidth() / 2 + "px",
				opacity: 0,
				display: "block"
			})
				.stop()
				.animate(
					{
						marginTop: -obj.outerHeight() / 2 + "px",
						opacity: 1
					},
					time,
					"swing",
					function () {
						callback();
					}
				);
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
			Animate.to(
				obj,
				{
					marginTop: -obj.outerHeight() / 2 + "px",
					opacity: 1,
					scale: 1
				},
				time,
				"ease-in-out",
				function () {
					// alert(1);
					callback();
				}
			);
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
			obj.stop().animate(
				{
					opacity: 0
				},
				time * 0.6,
				"swing",
				function () {
					obj.css({
						top: "1000%"
					});
					callback();
				}
			);
		} else if (animation == "fadedown") {
			obj.each(function () {
				var $this = $(this);
				$(this)
					.stop()
					.animate(
						{
							marginTop: -$(this).outerHeight() / 2 - 150 + "px",
							opacity: 0
						},
						time,
						"swing",
						function () {
							$this.css({
								top: "1000%"
							});
							callback();
						}
					);
			});
		} else if (animation == "fadeup") {
			obj.each(function () {
				var $this = $(this);
				$(this)
					.stop()
					.animate(
						{
							marginTop: -$(this).outerHeight() / 2 + 150 + "px",
							opacity: 0
						},
						time,
						"swing",
						function () {
							$this.css({
								top: "1000%"
							});
							callback();
						}
					);
			});
		} else if (animation == "scale") {
			obj.each(function () {
				var $this = $(this);
				$(this).stop();

				Animate.to(
					this,
					{
						scale: 0.5,
						opacity: 0
					},
					time,
					"ease-in-out",
					function () {
						$this.css({
							top: "1000%",
							display: "none"
						});
						callback();
					}
				);
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
			$("#overlay")
				.stop()
				.animate(
					{
						opacity: options.opacity
					},
					time,
					function () { }
				);
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
			var hideCallback = function () {
				$("#overlay").css({
					display: "none",
					zIndex: self.curZindex - 1
				});
				if (!!options.fixbody) {
					cantouch();
				}
			};
			// if(DEVICE.isPc){
			$("#overlay")
				.stop()
				.animate(
					{
						opacity: 0
					},
					time,
					hideCallback
				);
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
		Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
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
export default Popup;