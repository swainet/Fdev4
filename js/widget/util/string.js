/**
 * Created by IntelliJ IDEA.
 * User: zhangfan
 * Date: 11-9-23
 * Time: 下午4:10
 * To change this template use File | Settings | File Templates.
 */
;(function($){

    $.namespace('jQuery.util.string');

    $.util.string = {
    //	/**
    //	 * 去除字符串两边空格
    //	 * @param {String} str
    //	 * @return {String}
    //	 */
    //	trim: function(str){
    //	    if(str && str.length > 0){
    //			return str.replace(/(^\s*)|(\s*$)/g, '');
    //		}
    //		return '';
    //	},
        /**
         * 字符串是否为空
         * @param {String} str
         * @return {Boolean}
         */
        isEmpty: function(str){
            return (str || str.length > 0)?false:true;
        },
        /**
         * 字符串开头判断
         * @param {String} str
         * @param {String} startText
         * @return {Boolean}
         */
        startsWith: function(str,startText){
            return str && str.indexOf(startText) == 0;
        },
        /**
         * 取字符串第n位的字符
         * @param {String} str 字符串
         * @param {Int} n 第N位
         * @return {String} 一个字符
         */
        getChar: function(str, n){
            return str.substring(n, n+1);
        },
        /**
         * 替换首字符
         * @param {String} str 原字符串
         * @param {String} rChar 替换字符
         * @return {String} 替换后的字符串
         */
        replaceFirstChar: function(str, rChar){
            return rChar + str.slice(1);
        },
        /**
         * 截取两个字符串之间的文本
         * @param {String} str 原字符串
         * @param {String} start 开始文本
         * @param {String} end 结束文本
         * @return {String} 截取后的字符串
         */
        getBetweenText: function(str,start,end){
            return str.substring(str.indexOf(start)+start.length,str.indexOf(end));
        },
        /**
         * 截取开头至某文本之间的文本
         * @param {String} str 原字符串
         * @param {String} text 某文本
         * @return {String} 截取后的字符串
         */
        getBeforeText: function(str, text){
            if(str.indexOf(text)<0) return str;
            return str.substring(0,str.indexOf(text));
        },
        /**
         * 字符串转化成字符数组
         * @param {String} str
         * @return {Array}
         */
        toChars: function(str){
            if(!str || str.length <= 0) return null;
            var _chars = [];
            for(var i=0; i < str.length; i++){
                _chars[i] = this.getChar(str,i);
            };
            return _chars;
        },
        /**
         * 转换字符串为整数。字符串为空，则返回0。
         * @param {String} str
         * @return {Int}
         */
        parseInt: function(str){
            str = '' + str;
            return (str && str.length > 0)?parseInt(str,10):0;
        }	,
        /**
         * 替换字符
         * @param {String} str 原字符串
         * @param {String} s1 目标字符
         * @param {String} s2 替换字符
         * @return {String} 替换后的字符串
         */
        replaceAll:function(str,s1,s2){
            return str.replace(new RegExp(s1,"g"),s2);
        },
        /**
         * 算出字符串的长度。注意：中文字符算2个长度
         * @param {String} str
         * @return {Int}
         */
        byteLength: function(str){
            return str.replace(/[^\x00-\xff]/g,'aa').length;
        },
        /**
         * 替换位置n上的字符
         * @param {String} str 原字符串
         * @param {Char} rChar 替换字符
         * @param {Int} n 位置
         * @return {String} 替换后的字符串
         */
        replaceCharByPostion:function(str,rChar,n){
            return str.substring(0, n-1)+rChar+str.substring(n);
        },
        /**
         * &，<，",>转义
         * @param {String} value
         * @return {String}
         */
      htmlEncode : function(value){
          return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      },
        /**
         * &gt;，&quot;&quo，&amp;t>转义
         * @param {String} value
         * @return {String}
         */
      htmlDecode : function(value){
          return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      },
      /**
         * 过滤HTML特殊字符
         * @param {String} str
         * @return {String}
         */
        stripTags: function(str) {
            if(!str || typeof str!='string') return '';
            return str.replace(/<\/?[^>]+>/gi, '');
        },
        /**
         * HTML特殊字符转义
         * @param {String} str
         * @return {String}
         */
        escapeHTML: function(str) {
            if(!str || typeof str!='string') return '';
            var div = document.createElement('div');
            var text = document.createTextNode(str);
            div.appendChild(text);
            return div.innerHTML;
        },
        /**
         * HTML特殊字符反转义
         * @param {String} str
         * @return {String}
         */
        unescapeHTML: function(str) {
            if(!str || typeof str!='string') return '';
            var div = document.createElement('div');
            div.innerHTML = this.stripTags(str);
            return div.childNodes[0] ? div.childNodes[0].nodeValue : '';
        },
        /**
         * 截取字符串长度 兼容双字节
         * @param {String} pstr
         * @param {Number} num
         * @param {String} str
         * @return {String}
         */
        btSub : function(pstr,num,str){
            if(pstr===null||pstr==='')return '';
            var s = pstr.match(/(.{1})/g),k=[],laststr='',count=0;
            if(str)laststr = str;
            for(var i=0; i<num; i++){
                k.push(s[count]);
                count++;
                if(!/^[\u0000-\u00ff]$/.test(s[count])){i++;}
            }
            return k.join('')+laststr;
        }
    };
    $.extendIf( String.prototype, $.methodize( $.util.string ));
    $.add('util-string');
})(jQuery);