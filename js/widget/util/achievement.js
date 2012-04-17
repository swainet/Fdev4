/**
 * 测试成就系统
 * @author Denis 2012.01.07
 * @version 1.0
 */
('Achievement' in jQuery.util) ||
(function($){
    var achievements = {}; //成就列表存储
    var ready = false;
    var container, agent, status, statusTotal, statusComplete, list, total = complete = 0;
    $.util.Achievement = {
        /**
         *
         * @param {String} key
         * @param {String} name
         * @param {Array} description
         */
        add: function(key, name, description){
            //假如key重复，中断执行
            if (achievements[key]) {
                return;
            }
            //注册到成就列表
            achievements[key] = {
                name: name,
                description: description,
                pass: 0,
                fail: 0,
                ready: false
            };
            
            if (ready) {
                this._render(key, achievements[key]);
            }
        },
        /**
         * 初始化功能
         */
        init: function(){
            if (ready) {
                return;
            }
            container = $('#achievement');
            if (!container.length) {
                return;
            }
            agent = $('>.agent', container);
            status = $('>.status', container).html('共<span class="total">0</span>个成就，您已完成<span class="complete">0</span>个！');
            statusTotal = $('>span.total', status);
            statusComplete = $('>span.complete', status);
            list = $('>.list', container);
            agent.text(navigator.userAgent);
            
            //创建成就列表
            for (var key in achievements) {
                this._render(key, achievements[key]);
            }
            
            //注册事件
            this._buildEvent();
            ready = true;
        },
        /**
         * 渲染一个成就
         * @param {String} key
         * @param {Object} achievement
         */
        _render: function(key, achievement){
            var dl = $('<dl>');
            var dt = $('<dt>');
            var label = $('<label>').html('(<span class="pass">0</span>, <span class="fail">0</span>)');
            var ext = $('<div>').html('<span class="drag"></span>')
            var h6 = $('<h6>').text([key, ': ', achievement.name].join('')).append(label);
            //插入成就名称
            dl.append($('<dt>').append(h6).append(ext)).addClass(key);
            //插入任务步骤
            if (achievement.description) {
                var ol = $('<ol>');
                $.each(achievement.description, function(i, message){
                    ol.append($('<li>').text(message));
                });
                dl.addClass('description').append($('<dd>').append(ol));
            }
            list.append(dl);
            achievement.ready = true;
            total++;
            statusTotal.text(total);
        },
        /**
         * 注册系统事件
         */
        _buildEvent: function(){
            $.use('ui-draggable', function(){
                container.draggable({
                    handle: $('h1', container)
                });
            });
            $.use('ui-portlets', function(){
                list.portlets({
                    axis: 'y',
                    items: '>dl',
                    handle: 'span',
                    placeholder: function(){
                        return $('<dl>').addClass('ui-portlets-placeholder');
                    },
                    revert: 150,
                    capture: function(e, ui){
                        $('>dd', ui.currentItem).hide();
                    },
                    stop: function(e, ui){
                        $('>dd', ui.currentItem).hide();
                    }
                });
            });
            list.delegate('dt', 'click', function(e){
                var dd = $(this).next();
                if (dd.length) {
                    dd.slideToggle(150);
                }
            });
            list.delegate('span', 'click', function(e){
                e.stopPropagation();
            });
            list.delegate('dl', 'mouseover', function(e){
                $(this).addClass('hover');
            });
            list.delegate('dl', 'mouseleave', function(e){
                $(this).removeClass('hover');
            });
        },
        /**
         * 验证
         * @param {Object} key
         * @param {Object} result
         */
        check: function(key, result){
            if (!ready) {
                return;
            }
            var achievement = achievements[key];
            if (!achievement) {
                return;
            }
            var dl = $('>dl.' + key, list), status;
            
            //首次验证
            if (!achievement.status) {
                complete++;
                statusComplete.text(complete);
            }
            if (result) {
                achievement.pass++;
                $('span.pass', dl).text(achievement.pass);
            } else {
                achievement.fail++;
                $('span.fail', dl).text(achievement.fail);
            }
            if (!achievement.pass) {
                status = 'fail';
            } else if (!achievement.fail) {
                status = 'pass';
            } else {
                status = 'warn';
            }
            
            achievement.status = status;
            dl.removeClass('pass fail').addClass(status)
        },
        /**
         * 类等
         * @param {String} key
         * @param {Object} actual
         * @param {Object} expected
         */
        equal: function(key, actual, expected){
            this.check(key, actual == expected);
        },
        /**
         * 严格相等
         * @param {String} key
         * @param {Object} actual
         * @param {Object} expected
         */
        strictEqual: function(key, actual, expected){
            this.check(key, actual === expected);
        },
        /**
         * 递归相等
         * @param {String} key
         * @param {Object} actual
         * @param {Object} expected
         */
        deepEqual: function(key, actual, expected){
            this.check(key, this._equiv(actual, expected));
        },
        /**
         * 递归比较
         */
        _equiv: (function(){
            var innerEquiv; // the real equiv function
            var callers = []; // stack to decide between skip/abort functions
            var parents = []; // stack to avoiding loops from circular referencing
            // Call the o related callback with the given arguments.
            function bindCallbacks(o, callbacks, args){
                var prop = $.type(o);
                if (prop) {
                    if ($.type(callbacks[prop]) === "function") {
                        return callbacks[prop].apply(callbacks, args);
                    } else {
                        return callbacks[prop]; // or undefined
                    }
                }
            }
            
            var getProto = Object.getPrototypeOf ||
            function(obj){
                return obj.__proto__;
            };
            
            var callbacks = function(){
            
                // for string, boolean, number and null
                function useStrictEquality(b, a){
                    if (b instanceof a.constructor || a instanceof b.constructor) {
                        // to catch short annotaion VS 'new' annotation of a
                        // declaration
                        // e.g. var i = 1;
                        // var j = new Number(1);
                        return a == b;
                    } else {
                        return a === b;
                    }
                }
                
                return {
                    "string": useStrictEquality,
                    "boolean": useStrictEquality,
                    "number": useStrictEquality,
                    "null": useStrictEquality,
                    "undefined": useStrictEquality,
                    
                    "nan": function(b){
                        return isNaN(b);
                    },
                    
                    "date": function(b, a){
                        return $.type(b) === "date" &&
                        a.valueOf() === b.valueOf();
                    },
                    
                    "regexp": function(b, a){
                        return $.type(b) === "regexp" &&
                        a.source === b.source && // the regex itself
                        a.global === b.global && // and its modifers
                        // (gmi) ...
                        a.ignoreCase === b.ignoreCase &&
                        a.multiline === b.multiline;
                    },
                    
                    // - skip when the property is a method of an instance (OOP)
                    // - abort otherwise,
                    // initial === would have catch identical references anyway
                    "function": function(){
                        var caller = callers[callers.length - 1];
                        return caller !== Object && typeof caller !== "undefined";
                    },
                    
                    "array": function(b, a){
                        var i, j, loop;
                        var len;
                        
                        // b could be an object literal here
                        if (!($.type(b) === "array")) {
                            return false;
                        }
                        
                        len = a.length;
                        if (len !== b.length) { // safe and faster
                            return false;
                        }
                        
                        // track reference to avoid circular references
                        parents.push(a);
                        for (i = 0; i < len; i++) {
                            loop = false;
                            for (j = 0; j < parents.length; j++) {
                                if (parents[j] === a[i]) {
                                    loop = true;// dont rewalk array
                                }
                            }
                            if (!loop && !innerEquiv(a[i], b[i])) {
                                parents.pop();
                                return false;
                            }
                        }
                        parents.pop();
                        return true;
                    },
                    
                    "object": function(b, a){
                        var i, j, loop;
                        var eq = true; // unless we can proove it
                        var aProperties = [], bProperties = []; // collection of
                        // strings
                        
                        // comparing constructors is more strict than using
                        // instanceof
                        if (a.constructor !== b.constructor) {
                            // Allow objects with no prototype to be equivalent to
                            // objects with Object as their constructor.
                            if (!((getProto(a) === null && getProto(b) === Object.prototype) ||
                            (getProto(b) === null && getProto(a) === Object.prototype))) {
                                return false;
                            }
                        }
                        
                        // stack constructor before traversing properties
                        callers.push(a.constructor);
                        // track reference to avoid circular references
                        parents.push(a);
                        
                        for (i in a) { // be strict: don't ensures hasOwnProperty
                            // and go deep
                            loop = false;
                            for (j = 0; j < parents.length; j++) {
                                if (parents[j] === a[i]) 
                                    loop = true; // don't go down the same path
                                // twice
                            }
                            aProperties.push(i); // collect a's properties
                            if (!loop && !innerEquiv(a[i], b[i])) {
                                eq = false;
                                break;
                            }
                        }
                        
                        callers.pop(); // unstack, we are done
                        parents.pop();
                        
                        for (i in b) {
                            bProperties.push(i); // collect b's properties
                        }
                        
                        // Ensures identical properties name
                        return eq &&
                        innerEquiv(aProperties.sort(), bProperties.sort());
                    }
                };
            }();
            
            innerEquiv = function(){ // can take multiple arguments
                var args = Array.prototype.slice.apply(arguments);
                if (args.length < 2) {
                    return true; // end transition
                }
                
                return (function(a, b){
                    if (a === b) {
                        return true; // catch the most you can
                    } else if (a === null || b === null || typeof a === "undefined" ||
                    typeof b === "undefined" ||
                    $.type(a) !== $.type(b)) {
                        return false; // don't lose time with error prone cases
                    } else {
                        return bindCallbacks(a, callbacks, [b, a]);
                    }
                    
                    // apply transition with (1..n) arguments
                })(args[0], args[1]) &&
                arguments.callee.apply(this, args.splice(1, args.length - 1));
            };
            
            return innerEquiv;
            
        })()
    };
    $.add('util-achievement')
})(jQuery);
