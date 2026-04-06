(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    /**
        @author:pengzai
        @blog:http://foliou.focusbe.com
        @github:https://github.com/focusbe/foliou
    **/
    (function () {
        var apiurl = 'https://sapi.ztgame.com/';
        var Factory = function ($) {
            if (!window.console || !window.console.warn) {
                window.console = {};
                window.console.warn = function (str) {
                    //alert(str);
                };
                window.console.log = function (str) {
                    //alert(str);
                };
                window.console.err = function (str) {
                    //alert(str);
                };
            }
            var levels = {
                DEBUG: 1,
                INFO: 2,
                NOTICE: 3,
                WARNING: 4,
                ERROR: 5
            };
            var jswhitelist = ['ztgame.com', 'baidu.com', 'cnzz.com', 'google-analytics.com', 'googletagmanager.com', 'superpopgames.com'];
            function arrIndexOf(arr, val) {
                if (typeof arr != 'object') {
                    return -1;
                }
                for (var i in arr) {
                    if (arr[i] == val)
                        return i;
                }
                return -1;
            }
            function bindGetHackScript() {

                if (!!document.readyState && (document.readyState == 'complete' || document.readyState == 'loaded')) {
                    setTimeout(function () {
                        getHackScript();
                    }, 500);
                    return;
                }
                var oldonload;
                if (!window.onload) {
                    oldonload = window.onload;
                }
                window.onload = function () {
                    if (typeof oldonload == 'function') {
                        oldonload();
                    }
                    setTimeout(function () {
                        getHackScript();
                    }, 500);

                };
            }

            function getHackScript() {
                var scriptsel = document.getElementsByTagName('script');
                var curSrc;
                var temparr;
                var curhost;
                var result = [];
                for (var i in scriptsel) {
                    curSrc = scriptsel[i].src;
                    if (!!curSrc && curSrc.indexOf('//') > -1) {
                        curSrc = curSrc.replace('http:', '').replace('https:', '').replace('ftp:', '').replace('file:', '').replace('//', '');
                        if (!!curSrc) {
                            temparr = curSrc.split('/');
                            if (!!temparr && temparr.length > 0) {
                                curhost = temparr[0];
                                temparr = curhost.split('.');

                                if (!!temparr && temparr.length > 1) {
                                    curhost = temparr[temparr.length - 2] + '.' + temparr[temparr.length - 1];
                                    if (arrIndexOf(jswhitelist, curhost) < 0) {
                                        result.push(scriptsel[i].src);
                                    }
                                }
                            }
                        }
                    }
                }
                if (result.length > 0) {
                    var msg = result.join(',');
                    msg = 'hack_scripts:' + msg + '';
                    report('info', msg, function () { });
                }
                return result;
            }

            function bindOnerror() {

                var olderror = window.onerror;

                window.onerror = function (msg, url, lineNo, columnNo, error) {
                    try {
                        if (typeof (olderror) == 'function') {
                            olderror();
                        }
                        if (typeof (url) == 'string') {
                            url = url.replace(/^\s+|\s+$/g, "");
                        }
                        if (!url && !lineNo && !columnNo && !error) {
                            return;
                        }
                        var message = [
                            'Message: ' + msg,
                            'URL: ' + url,
                            'Line: ' + lineNo,
                            'Column: ' + columnNo,
                            'Error object: ' + JSON.stringify(error)
                        ].join(',');
                        message = '{' + message + '}';
                        report('error', message, '', function () { });
                    } catch (err) {
                        console.warn(err);
                    }


                };
            }

            function JsontoStr(json) {
                if (!json) {
                    return '';
                }
                if (!!JSON && !!JSON.stringify) {
                    return JSON.stringify(json);
                }
                var jsonstr = '';
                var j = 0;
                for (var i in json) {
                    if (j != 0) {
                        jsonstr += ',';
                    }
                    jsonstr += '"' + i + '":"' + json[i] + '"';
                    j++;
                }
                return '{' + jsonstr + '}';
            }

            function getNetwork() {
                if (!!navigator.connection && !!navigator.connection.effectiveType) {
                    return navigator.connection.effectiveType;
                }
                return '';
            }

            function report(level, message, image, callback) {
                if (!!window.TraceDisable) {
                    return;
                }
                try {
                    if (!level || !message) {
                        return;
                    }
                    level = level.toUpperCase();
                    if (!levels[level]) {
                        var levelstr = '';
                        for (var i in levels) {
                            levelstr += i + ' | ';
                        }
                        console.warn('上报类型必须是以下其中的一个：' + levelstr);
                    }
                    if (typeof image == 'function') {
                        callback = image;
                        image = '';
                    }
                    if (!image) {
                        image = '';
                    }
                    var resolution = {
                        clientWidth: document.body.clientWidth,
                        clentHeight: document.body.clientHeight,
                        screenHeight: window.screen.availHeight,
                        screenWidth: window.screen.availWidth
                    };
                    var data = {
                        url: window.location.href,
                        level: level,
                        message: message,
                        image: image,
                        resolution: JsontoStr(resolution),
                        ua: navigator.userAgent,
                        network: getNetwork()
                    };
                    $.ajax({
                        dataType: 'jsonp',
                        url: apiurl + 'flogs/write',
                        data: data,
                        success: function (res) {
                            if (!!callback) {
                                if (!!res && !!res.status && res.status > 0) {
                                    callback(true);
                                } else {
                                    callback(false);
                                }
                            }
                        },
                        error: function () {
                            if (!!callback) {
                                callback(false);
                            }
                        }
                    });
                } catch (err) {
                    console.log('上报异常');
                    console.warn(err);
                }
            }

            try {
                bindOnerror();
                bindGetHackScript();
            } catch (error) {
                console.warn('设置onerror 上报错误失败');
            }
            var Trace = {
                report: report
            };
            return Trace;
        };

        if (typeof exports === "object") {
            // CommonJS
            module.exports = Factory(require("jquery"));
        } else if (typeof define === "function" && define.amd) {
            // AMD
            define(["jquery"], Factory);
        } else {
            // Global Variables
            if (!window.Foliou) {
                window.Foliou = {};
            }
            window.Foliou.Trace = Factory($);
        }
    })();

})));
