import $ from 'jquery';

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

export { Utli as default };
//# sourceMappingURL=index.js.map
