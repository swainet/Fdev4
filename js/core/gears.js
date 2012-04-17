/**
 * Baseed on jQuery JavaScript Library v1.7.1
 * @Author: Denis 2011.01.21
 * @update Denis 2011.05.30 对add和use进行升级，支持数据模块化
 * @update Denis & Allenm 2011.05.31 优化 escapeHTML方法，支持对属性值的转义
 * @update Denis 调整use的第三个参数可以传递的值，通过传递true即可实现数据刷新且无需变更配置
 * @update Denis 2011.08.11 移出styleDomain配置至config.js
 * @update zhangfan 2011.09.23 添加methodize,extendNative两个方法
 * @update Denis 2011.12.27 修复数据模块的BUG，当请求未完成时进行数据的刷新操作时，新的配置将无法生效。
 * @update Denis 2012.04.09 将use改造成deferred对象
 */
(function($, undefined){
    var $isFunction = $.isFunction, $isArray = $.isArray, $each = $.each, ALICNWEB = 'alicnweb';
    
    $.noConflict();
    
    //setup global ajax configs
    $.ajaxSetup({
        scriptCharset: 'gbk',
        cache: true,
        timeout: 10000
    });
    //setup golobal ajax options
    $.ajaxPrefilter('script jsonp', function(options){
        options.crossDomain = true;
    });
    
    $.extend({
        /**
         * Returns the namespace specified and creates it if it doesn't exist
         * <pre>
         * jQuery.namespace('Platform.winport');
         * * jQuery.namespace('Platform.winport', 'Platform.winport.diy');
         * </pre>
         *
         * Be careful when naming packages. Reserved words may work in some browsers
         * and not others. For instance, the following will fail in Safari:
         * <pre>
         * jQuery.namespace('really.long.nested.namespace');
         * </pre>
         * jQuery fails because "long" is a future reserved word in ECMAScript
         *
         * @method namespace
         * @static
         * @param  {collection} arguments 1-n namespaces to create.
         * @return {object}  A reference to the last namespace object created.
         */
        namespace: function(){
            var a = arguments, o, i = 0, j, d, arg;
            for (; i < a.length; i++) {
                o = window;
                arg = a[i];
                if (arg.indexOf('.')) {
                    d = arg.split('.');
                    for (j = (d[0] == 'window') ? 1 : 0; j < d.length; j++) {
                        o[d[j]] = o[d[j]] || {};
                        o = o[d[j]];
                    }
                } else {
                    o[arg] = o[arg] || {};
                }
            }
        },
        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later.  Executes the function a
         * single time unless periodic is set to true.
         * @method later
         * @for jQuery
         * @param when {int} the number of milliseconds to wait until the fn
         * is executed.
         * @param o the context object.
         * @param fn {Function|String} the function to execute or the name of
         * the method in the 'o' object to execute.
         * @param data [Array] data that is provided to the function.  This
         * accepts either a single item or an array.  If an array is provided,
         * the function is executed with one parameter for each array item.
         * If you need to pass a single array parameter, it needs to be wrapped
         * in an array [myarray].
         * @param periodic {boolean} if true, executes continuously at supplied
         * interval until canceled.
         * @return {object} a timer object. Call the cancel() method on this
         * object to stop the timer.
         */
        later: function(when, o, fn, data, periodic){
            when = when || 0;
            
            var m = fn, f, id;
            
            if (o && $.type(fn) === 'string') {
                m = o[fn];
            }
            
            f = (data === undefined) ? function(){
                m.call(o);
            }
 : function(){
                m.apply(o, $.makeArray(data));
            };
            
            id = (periodic) ? setInterval(f, when) : setTimeout(f, when);
            
            return {
                id: id,
                interval: periodic,
                cancel: function(){
                    if (this.interval) {
                        clearInterval(this.id);
                    } else {
                        clearTimeout(this.id);
                    }
                }
            };
        },
        /**
         * @method extendIf
         * @param {Object} target
         * @param {Object} o
         */
        extendIf: function(target, o){
            if (o === undefined) {
                o = target;
                target = this;
            }
            for (var p in o) {
                if (typeof target[p] === 'undefined') {
                    target[p] = o[p];
                }
            }
            return target;
        },
        /**
         * 将字符串转换成hash
         * @param {Object} s
         * @param {Object} separator
         */
        unparam: function(s, separator){
            if (typeof s !== 'string') {
                return;
            }
            var match = s.trim().match(/([^?#]*)(#.*)?$/), hash = {};
            if (!match) {
                return {};
            }
            $.each(match[1].split(separator || '&'), function(i, pair){
                if ((pair = pair.split('='))[0]) {
                    var key = decodeURIComponent(pair.shift()), value = pair.length > 1 ? pair.join('=') : pair[0];
                    
                    if (value != undefined) {
                        value = decodeURIComponent(value);
                    }
                    
                    if (key in hash) {
                        if (!$.isArray(hash[key])) {
                            hash[key] = [hash[key]];
                        }
                        hash[key].push(value);
                    } else {
                        hash[key] = value;
                    }
                }
            });
            return hash;
        },
        /**
         * alibaba feature, use as param but not param
         * @param {Object} a
         * @param {Bolean} traditional deep recursion?
         */
        paramSpecial: function(a, traditional){
            var s = [], add = function(key, value){
                // If value is a function, invoke it and return its value
                value = $isFunction(value) ? value() : value;
                s[s.length] = encodeSpecial(key) + '=' + encodeSpecial(value + '');
            };
            
            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if (traditional === undefined) {
                traditional = $.ajaxSettings.traditional;
            }
            
            // If an array was passed in, assume that it is an array of form elements.
            if ($isArray(a) || a.jquery) {
                // Serialize the form elements
                $each(a, function(){
                    add(this.name, this.value);
                });
                
            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for (var prefix in a) {
                    buildParams(prefix, a[prefix], traditional, add);
                }
            }
            
            // Return the resulting serialization
            return s.join('&').replace(/\//g, '%2F').replace(/#/g, '%23').replace(/\+/g, '%2B').replace(/\s/g, '+');
        },
        /*
         * 将静态方法methodize化，即让其第一个参数或指定属性为this.
         * @method methodize
         * @param  {Object}        obj     Helper对象
         * @param  {String}可选    attr    this[attr]作为对象的this
         * @param  {Array}可选     others  不methodize化的方法
         * @return {Object}        methodize化后的对象
         */
        methodize: function(obj, attr, others){
            var ret = {};
            for (var m in obj) {
                if (others) {
                    for (var i = others.length; i--;) {
                        if (others[i] == m) 
                            break;
                    }
                }
                if (!others || others[i] != m) {
                    (function(m){
                        ret[m] = function(){
                            var args = [].slice.call(arguments), self = attr ? this[attr] : this;
                            return obj[m].apply(obj, [self].concat(args));
                        };
                    })(m);
                }
            }
            return ret;
        },
        /*
         * 用于继承native，如Array,String,Date 等等
         * @method extendNative
         * @param  {Function(Class)} newType    需要继承native的类
         * @param  {Native}          nativeType 需要继承的native类型
         * @param  {Array}           dontEnums  不可枚举的方法名列表
         * @param  {String}可选      attr       若存在attr则将this[attr]作为该类型的方法的this
         * @param  {Funtcion}可选    toString   新的类型的toString方法
         */
        extendNative: function(newType, nativeType, dontEnums, attr, toString){
            var slice = [].slice, wrap = function(fn, attr){
                if (attr) {
                    return function(){
                        var args = slice.call(arguments);
                        return fn.apply(this[attr], args);
                    }
                }
                return fn;
            };
            // 可枚举的自定义原型方法
            for (var m in nativeType) {
                if (nativeType.prototype[m]) {
                    newType.prototype[m] = wrap(nativeType.prototype[m], attr);
                }
            }
            if (dontEnums) {
                // 不可枚举的原生方法
                for (var i = dontEnums.length; i--;) {
                    if (nativeType.prototype[dontEnums[i]]) {
                        newType.prototype[dontEnums[i]] = wrap(nativeType.prototype[dontEnums[i]], attr);
                    }
                }
            }
            // 重写toString
            if (toString) 
                newType.prototype.toString = toString;
        },
        /**
         * jQuery.debug.js will rewrite this,
         */
        log: $.noop
    });
    
    $.namespace('jQuery.util.ua', 'jQuery.ui');
    
    $.extendIf($.util, {
        /**
         * 这里只提供cookie的读操作，需要完整的cookie操作需要use util-cookie
         * @param {String} key
         * @param {Object} value
         * @param {Object} options
         */
        cookie: function(key, value, options){
            // key and possibly options given, get cookie...
            if (value !== null && typeof value === "object") {
                options = value;
            }
            options = options || {};
            //noformat
	        var result, code = options.raw ? function(s){
                return s;
            } : escape, decode = options.raw ? function(s){
	            return s;
	        } : unescape;
			//format      
            return (result = new RegExp('(?:^|; )' + code(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
        },
        /**
         * 处理alicnweb键值（只读），需要完整的subCookie操作需要use util-cookie
         * @param {Object} key
         * @param {Object} value
         * @param {Object} options
         */
        subCookie: function(key, value, options){
            //序列化
            var hash = $.unparam($.util.cookie(ALICNWEB) || '', '|') || {}, options = options ||
            {
                path: '/',
                domain: 'alibaba.com',
                expires: new Date('January 1, 2050')
            };
            if (arguments.length > 1) {
                hash[key] = value;
                return $.util.cookie(ALICNWEB, $.param(hash).replace(/&/g, '|'), options);
            } else {
                return hash[key] === undefined ? null : hash[key];
            }
        },
        /**
         * Same as YUI's
         * @method substitute
         * @static
         * @param {string} str string template to replace.
         * @param {string} data string to deal.
         * @return {string} the substituted string.
         */
        substitute: function(str, data){
            return str.replace(/\{(\w+)\}/g, function(r, m){
                return data[m] !== undefined ? data[m] : '{' + m + '}';
            });
        },
        /**
         * escape HTML
         * @param {Object} str
         * @param {Bolean} attr	 是否对属性进行额外处理
         * @return {string}
         */
        escapeHTML: function(str, attr){
            if (attr) {
                return str.replace(/[<"']/g, function(s){
                    switch (s) {
                        case '"':
                            return '&quot;';
                        case "'":
                            return '&#39;';
                        case '<':
                            return '&lt;';
                        case '&':
                            return '&amp;';
                        default:
                            return s;
                    }
                });
            } else {
                var div = document.createElement('div');
                div.appendChild(document.createTextNode(str));
                return div.innerHTML;
            }
        },
        /**
         * unescape HTML
         * @param {Object} str
         * @return
         */
        unescapeHTML: function(str){
            var div = document.createElement('div');
            div.innerHTML = str.replace(/<\/?[^>]+>/gi, '');
            return div.childNodes[0] ? div.childNodes[0].nodeValue : '';
        }
    });
    //ua detect
    $.extendIf($.util.ua, {
        ie: !!$.browser.msie,
        ie6: !!($.browser.msie && $.browser.version == 6),
        ie67: !!($.browser.msie && $.browser.version < 8)
    });
    //feature detect
    $.extendIf($.support, {
        placeholder: 'placeholder' in document.createElement('input'),
        JSON: 'JSON' in window,
        localStorage: 'localStorage' in window,
        WebSocket: 'WebSocket' in window
        //positionFixed: !$.util.ua.ie6
    });
    
    $.fn.extend({
        /**
         * alibaba feature, use as serialize but not serialize
         */
        serializeSpecial: function(){
            return $.paramSpecial(this.serializeArray());
        }
    });
    /**
     * alibaba's feature use as encodeURIComponent
     * @method encodeSpecial
     * @private
     * @param {Object} str
     */
    function encodeSpecial(str){
        return str.replace(/%/g, '%25').replace(/&/g, '%26');
    }
    /**
     * copy form jQuery
     * @param {Object} prefix
     * @param {Object} obj
     * @param {Bolean} traditional
     * @param {Object} add
     */
    function buildParams(prefix, obj, traditional, add){
        if ($isArray(obj) && obj.length) {
            // Serialize array item.
            $each(obj, function(i, v){
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                    
                } else {
                    // If array item is non-scalar (array or object), encode its
                    // numeric index to resolve deserialization ambiguity issues.
                    // Note that rack (as of 1.0.0) can't currently deserialize
                    // nested arrays properly, and attempting to do so may cause
                    // a server error. Possible fixes are to modify rack's
                    // deserialization algorithm or to provide an option or flag
                    // to force array serialization to be shallow.
                    buildParams(prefix + '[' + (typeof v === 'object' || $isArray(v) ? i : '') + ']', v, traditional, add);
                }
            });
            
        } else if (!traditional && obj !== null && typeof obj === 'object') {
            // If we see an array here, it is empty and should be treated as an empty
            // object
            if ($isArray(obj) || $.isEmptyObject(obj)) {
                add(prefix, '');
                
                // Serialize object item.
            } else {
                $each(obj, function(k, v){
                    buildParams(prefix + '[' + k + ']', v, traditional, add);
                });
            }
            
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }
    
    $.extendIf(Array.prototype, {
        /**
         * @method every
         * @param {Object} callback
         * @param {Object} context
         */
        every: function(callback, context){
            for (var i = 0, len = this.length; i < len; i++) {
                if (!callback.call(context, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        },
        /**
         * @method filter
         * @param {Object} callback
         * @param {Object} context
         */
        filter: function(callback, context){
            var res = [];
            for (var i = 0, len = this.length; i < len; i++) {
                if (callback.call(context, this[i], i, this)) {
                    res[res.length] = this[i];
                }
            }
            return res;
            
        },
        /**
         * @param indexOf
         * @param {Object} elem
         * @param {Object} fromIndex
         */
        indexOf: function(elem, fromIndex){
            fromIndex = fromIndex || 0;
            for (var i = fromIndex, len = this.length; i < len; i++) {
                if (this[i] === elem) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * @param lastIndexOf
         * @param {Object} elem
         * @param {Object} fromIndex
         */
        lastIndexOf: function(elem, fromIndex){
            fromIndex = fromIndex === undefined ? this.length : fromIndex;
            for (var i = fromIndex; -1 < i; i--) {
                if (this[i] === elem) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * Remove item from array
         * @param {Object} elem
         * @return {Bolean}
         */
        remove: function(elem){
            var i = this.indexOf(elem);
            if (i !== -1) {
                this.splice(i, 1);
                return true;
            } else {
                return false;
            }
        },
        /**
         * @method some
         * @param {Object} callback
         * @param {Object} context
         */
        some: function(callback, context){
            for (var i = 0, len = this.length; i < len; i++) {
                if (callback.call(context, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        }
    });
    
    $.extendIf(String.prototype, {
        trim: function(){
            return $.trim(this);
        },
        lenB: function(){
            return this.replace(/[^\x00-\xff]/g, '**').length;
        },
        cut: function(len, ext){
            var val = this, cl = 0;
            if (val.lenB() <= len) {
                return val;
            }
            for (var i = 0, j = val.length; i < j; i++) {
                var code = val.charCodeAt(i);
                if (code < 0 || code > 255) {
                    cl += 2
                } else {
                    cl++
                }
                if (cl > len) {
                    return val.substr(0, i == 0 ? i = 1 : i) + (ext || '');
                }
            }
            return '';
        }
    });
    
    /**
     * Fix Number.toFixed Function for MONEY calculate
     */
    if (!((0.009).toFixed(2) === '0.01' && (0.495).toFixed(2) === '0.50')) {
        var toFixed = Number.prototype.toFixed;
        Number.prototype.toFixed = function(fractionDigits){
            var tmp = this, pre = Math.pow(10, fractionDigits || 0);
            tmp *= pre;
            tmp = Math.round(tmp);
            tmp /= pre;
            return toFixed.call(tmp, fractionDigits);
        };
    }
    /**
     * Class extend it have event feature
     * @author qijun.weiqj 2011.01.21
     */
    $.EventTarget = {};
    $each(['bind', 'trigger', 'triggerHandler'], function(){
        var name = this;
        $.EventTarget[name] = function(){
            var proxy;
            proxy = this.__eventTargetProxy = this.__eventTargetProxy || $('<div>');
            return proxy[name].apply(proxy, arguments);
        };
    });
    
    /**
     * Seed!!
     */
    var doc = document, $util = $.util, cssLinks = {}, modules = {};
    $.extend({
        /**
         * Generates a link node
         * @method loadCSS
         * @static
         * @param {string} href the href for the css file.
         * @param {object} attributes optional attributes collection to apply to the new node.
         * @return {HTMLElement} the generated node.
         */
        loadCSS: function(href, attr){
            // Inspired by code by Andrea Giammarchi
            // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
            var head = doc.getElementsByTagName('head')[0] || doc.documentElement, base = head.getElementsByTagName('base'), link = cssLinks[href];
            //if Exist
            if (!link) {
                link = doc.createElement('link');
                var o = {
                    type: 'text/css',
                    rel: 'stylesheet',
                    media: 'screen',
                    href: href
                };
                if ($.isPlainObject(attr)) {
                    $.extend(o, attr);
                }
                for (var p in o) {
                    link.setAttribute(p, o[p]);
                }
                cssLinks[href] = link;
            }
            
            // Use insertBefore instead of appendChild to circumvent an IE6 bug.
            // This arises when a base node is used (#2709).
            // return link self
            return base.length ? head.insertBefore(link, base[0]) : head.appendChild(link);
        },
        /**
         * Remove a link node
         * @method unloadCSS
         * @static
         * @param {string} href the href for the css file.
         * @return {Bolean} remove success.
         */
        unloadCSS: function(href){
            var link = cssLinks[href];
            if (link) {
                link.parentNode.removeChild(link);
                delete cssLinks[href];
                return true;
            } else {
                return false;
            }
        },
        /**
         * Add Module
         * @method add
         * @static
         * @param  {string|array} names new module(s) name.
         * @param  {function} callback call when added this module.
         * @param  {object} configs module configs.
         */
        add: function(names, callback, configs){
            names = ($isArray(names) ? names : names.replace(/\s+/g, '').split(','));
            if ($.isPlainObject(callback)) {
                configs = callback;
                callback = undefined;
            }
            for (var i = 0, len = names.length; i < len; i++) {
                var name = names[i], o = modules[name];
                if (o) {
                    if (!configs) {
                        //$.log('Exist Module ' + name);
                        o.status = 'ready';
                    }
                } else {
                    modules[name] = $.extendIf(configs ||
                    {
                        status: 'ready'
                    }, {
                        ver: '1.0'
                    });
                    //$.log('Module ' + name + ' added!');
                }
            }
            //callback 
            if ($isFunction(callback)) {
                callback();
            }
        },
        /**
         * Use Modules
         * @method use
         * @static
         * @param  {string|array} names module(s) name(s).
         * @param  {function} callback call when use this module succesfully.
         * @param	{bolean|object} options when data module refresh.
         */
        use: function(names, callback, options){
            var deferred = jQuery.Deferred();
            names = ($isArray(names) ? names : $.unique(names.replace(/\s+/g, '').split(',')));
            var count = 0;
            
            function through(data){
                count++;
                if (names.length === count) {
                    if ($isFunction(callback)) {
                        callback(data);
                    }
                    deferred.resolve(data);
                }
            }
            $each(names, function(i, name){
                var configs = modules[name];
                if (configs) {
                    //只有是数据模块，且当用户更改配置，且队列中没有回调函数时。更新配置、刷新数据
                    if (options && configs.url) {
                        if (typeof options === 'boolean') {
                            options = {};
                        }
                        $.extend(configs, options, {
                            status: configs.callbackQueue ? 'refresh' : 'reset'
                        });
                    }
                    if (configs.status === 'ready') {
                        //TODO:
                        through(configs._data);
                    } else {
                        if (configs.requires) {
                            $.use(configs.requires, function(){
                                init(name, through, deferred);
                            });
                        } else {
                            init(name, through, deferred);
                        }
                    }
                } else {
                    $.error('Invalid Module ' + name);
                }
            });
            return deferred.promise();
        }
        /**
         * 判断模块是否已经存在
         * @param {Object} name
         */
        //        has: function(name){
        //            return !!modules[name];
        //        }
        /**
         * Remove Module
         * @method remove
         * @static
         * @param  {string} name module name.
         * @param  {function} callback call when module is removed.
         */
        //暂时用不到此方法，需要时再加上		
        //        remove: function(name, callback){
        //            if (modules[name]) {
        //                var css = modules[name].configs.css;
        //                if ($isArray(css)) {
        //                    $each(css, function(i, href){
        //                        $.unloadCSS(href);
        //                    });
        //                }
        //                return true;
        //            }
        //            return false;
        //        }
    });
    /**
     * init single module
     * @method init
     * @private
     * @param  {name} module name.
     * @param  {function} callback callback.
     * @param  {object} jQuery Deferred对象
     */
    function init(name, callback, deferred){
        var configs = modules[name], url = configs.url, css = configs.css, js = configs.js;
        //load module's CSS
        if ($isArray(css)) {
            $each(css, function(i, href){
                href = $util.substitute(href, [$.styleDomain, configs.ver]);
                if ($.DEBUG) {
                    href = href.replace('-min', '');
                }
                $.loadCSS(href);
            });
        }
        //load module's JS
        //2011.05.27 增加了Data Module类型的数据模块加载
        if (url || $isArray(js)) {
            configs.callbackQueue = configs.callbackQueue || [];
            configs.callbackQueue[configs.callbackQueue.length] = callback;
            if (configs.callbackQueue.length === 1 || configs.status === 'refresh') {
                //$.log('Module ' + name + ' is loading');
                var len = 1, q = 0, onSuccess = function(data){
                    q++;
                    if (q === len) {
                        configs.status = 'ready';
                        configs._data = data;
                        $each(configs.callbackQueue, function(i, callback){
                            callback(data);
                        });
                        delete configs.callbackQueue;
                    }
                }, onError = function(jqXHR, textStatus){
                    deferred.reject();
                    //                    $.log(textStatus);
                    //                    switch(textStatus){
                    //                        case 'abort':
                    //                            break;
                    //                        default:
                    //                            $.error('load Module ' + name + ' Fail;');
                    //                            break;
                    //                    }
                }, onComplete = function(){
                    delete configs.jqxhr;
                };
                //终止原有的ajax
                if (url) {
                    configs.jqxhr && configs.jqxhr.abort();
                    configs.jqxhr = $.ajax($.extendIf({
                        global: false,
                        success: onSuccess,
                        error: configs.error || onError,
                        complete: onComplete
                    }, configs));
                } else {
                    len = js.length;
                    $each(js, function(i, src){
                        src = $util.substitute(src, [$.styleDomain, configs.ver]);
                        if ($.DEBUG) {
                            src = src.replace('-min', '');
                        }
                        $.ajax(src, {
                            global: false,
                            dataType: 'script',
                            scriptCharset: 'gbk',
                            cache: true,
                            success: onSuccess,
                            error: onError
                        });
                    });
                }
            }
        } else {
            callback(configs._data);
        }
    }
})(jQuery);
