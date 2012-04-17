/*
 * jQuery UI 1.8.16
 * @update 优化了扩展的选择器 data
 * @update Denis    重新返回至官方的data选择器逻辑 ---- 2011.09.26
 */
(('ui' in jQuery) && ('version' in jQuery.ui)) ||
(function($, undefined){
    // prevent duplicate loading
    // this is only a problem because we proxy existing functions
    // and we don't want to double proxy them
    //$.ui = $.ui || {};
    //if ($.ui.version) {
    //    return;
    //}
    $.extend($.ui, {
        keyCode: {
            //ALT: 18,
            //BACKSPACE: 8,
            //CAPS_LOCK: 20,
            //COMMA: 188,
            //COMMAND: 91,
            //COMMAND_LEFT: 91, // COMMAND
            //COMMAND_RIGHT: 93,
            //CONTROL: 17,
            //DELETE: 46,
            DOWN: 40,
            //END: 35,
            ENTER: 13,
            ESCAPE: 27,
            //HOME: 36,
            //INSERT: 45,
            LEFT: 37,
            //MENU: 93, // COMMAND_RIGHT
            //NUMPAD_ADD: 107,
            //NUMPAD_DECIMAL: 110,
            //NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            //NUMPAD_MULTIPLY: 106,
            //NUMPAD_SUBTRACT: 109,
            //PAGE_DOWN: 34,
            //PAGE_UP: 33,
            //PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            //SPACE: 32,
            TAB: 9,
            UP: 38
            //WINDOWS: 91 // COMMAND
        }
    });
    // plugins
    function prop(n){
        return n && n.constructor === Number ? n + 'px' : n;
    }
    
    $.fn.extend({
        _focus: $.fn.focus,
        focus: function(delay, fn){
            return typeof delay === "number" ? this.each(function(){
                var elem = this;
                setTimeout(function(){
                    $(elem).focus();
                    if (fn) {
                        fn.call(elem);
                    }
                }, delay);
            }) : this._focus.apply(this, arguments);
        },
        
        scrollParent: function(){
            var scrollParent;
            if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
                scrollParent = this.parents().filter(function(){
                    return (/(relative|absolute|fixed)/).test($.curCSS(this, 'position', 1)) && (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
                }).eq(0);
            }
            else {
                scrollParent = this.parents().filter(function(){
                    return (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
                }).eq(0);
            }
            
            return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
        },
        
        zIndex: function(zIndex){
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex);
            }
            
            if (this.length) {
                var elem = $(this[0]), position, value;
                while (elem.length && elem[0] !== document) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }
            
            return 0;
        },
        
        disableSelection: function(){
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
            ".ui-disableSelection", function(event){
                event.preventDefault();
            });
        },
        
        enableSelection: function(){
            return this.unbind(".ui-disableSelection");
        },
        /**
         * 提供遮罩功能，非IE6下遮罩需要配置 force:true
         * @param {Object} options	配置Style
         */
        bgiframe: function(options){
            if ($.util.ua.ie6) {
                if (options === 'close') {
                    return this.each(function(){
                        $(this).children('iframe.bgiframe').remove();
                    });
                }
                else {
                    options = $.extend({
                        top: 'auto', // auto == .currentStyle.borderTopWidth
                        left: 'auto', // auto == .currentStyle.borderLeftWidth
                        width: 'auto', // auto == offsetWidth
                        height: 'auto', // auto == offsetHeight
                        zIndex: -1,
                        opacity: 0,
                        src: 'about:blank'
                    }, options);
                    //noformat
		            var html = ['<iframe class="bgiframe"frameborder="0"tabindex="-1"src="', 
						options.src, 
						'"style="display:block;position:absolute;z-index:',
						options.zIndex,
						';',
						options.opacity? '': 'filter:Alpha(Opacity=\'0\');',
						'top:', 
						(options.top == 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : prop(options.top)), 
						';left:', 
						(options.left == 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : prop(options.left)), 
						';width:', 
						(options.width == 'auto' ? 'expression(this.parentNode.offsetWidth+\'px\')' : prop(options.width)), 
						';height:', 
						(options.height == 'auto' ? 'expression(this.parentNode.offsetHeight+\'px\')' : prop(options.height)), 
						';"/>'].join('');
	                //format
                    return this.each(function(){
                        var self = $(this);
                        if (self.children('iframe.bgiframe').length === 0) {
                            this.insertBefore(document.createElement(html), this.firstChild);
                        }
                    });
                }
            }
            else {
                if (options === 'close') {
                    return this.each(function(){
                        $(this).children('div.bgiframe').remove();
                    });
                }
                else {
                    options = $.extend({
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        backgroundColor: '#FFF',
                        opacity: 0
                    }, options);
                    if (options.force) {
                        return this.each(function(){
                            var self = $(this);
                            if (self.children('div.bgiframe').length === 0) {
                                self.prepend($('<div>', {
                                    'class': 'bgiframe',
                                    css: options
                                }));
                            }
                        });
                    }
                }
                return this;
            }
        }
    });
    // selectors
    function focusable(element, isTabIndexNotNaN){
        var nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            var map = element.parentNode, mapName = map.name, img;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        // the element and all of its ancestors must be visible
        return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : "a" == nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && visible(element);
    }
    // selectors
    function visible(element){
        return !$(element).parents().andSelf().filter(function(){
            return $.curCSS(this, "visibility") === "hidden" ||
            $.expr.filters.hidden(this);
        }).length;
    }
    
    $.extend($.expr[":"], {
        /*
         * 此方法后期考虑将和官方的实现统一
         * @update Denis 2011.09.26 修改至和官方一致的逻辑
         */
        data: function(elem, i, match){
            return !!$.data( elem, match[ 3 ] );
        },
        
        focusable: function(element){
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },
        
        tabbable: function(element){
            var tabIndex = $.attr(element, "tabindex"), isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });
    
    // support
    $(function(){
        var body = document.body, div = body.appendChild(div = document.createElement("div"));
        
        $.extend(div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        });
        
        $.support.minHeight = div.offsetHeight === 100;
        $.support.selectstart = "onselectstart" in div;
        
        // set display to none to avoid a layout bug in IE
        // http://dev.jquery.com/ticket/4014
        body.removeChild(div).style.display = "none";
    });
    // deprecated
    $.extend($.ui, {
        // $.ui.plugin is deprecated.  Use the proxy pattern instead.
        plugin: {
            add: function(module, option, set){
                var proto = $.ui[module].prototype;
                for (var i in set) {
                    proto.plugins[i] = proto.plugins[i] || [];
                    proto.plugins[i].push([option, set[i]]);
                }
            },
            call: function(instance, name, args){
                var set = instance.plugins[name];
                if (!set || !instance.element[0].parentNode) {
                    return;
                }
                
                for (var i = 0; i < set.length; i++) {
                    if (instance.options[set[i][0]]) {
                        set[i][1].apply(instance.element, args);
                    }
                }
            }
        },
        // these are odd functions, fix the API or move into individual plugins
        isOverAxis: function(x, reference, size){
            //Determines when x coordinate is over "b" element axis
            return (x > reference) && (x < (reference + size));
        },
        isOver: function(y, x, top, left, height, width){
            //Determines when x, y coordinates is over "b" element
            return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
        }
    });
    
    $.add('ui-core');
})(jQuery);

/*
 * jQuery UI Widget 1.8.15
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
('widget' in jQuery) ||
(function($, undefined){

    var slice = Array.prototype.slice;
    
    var _cleanData = $.cleanData;
    $.cleanData = function(elems){
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            $(elem).triggerHandler('remove');
        }
        _cleanData(elems);
    };
    
    $.widget = function(name, base, prototype){
        var namespace = name.split('.')[0], fullName;
        name = name.split('.')[1];
        fullName = namespace + '-' + name;
        
        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }
        
        // create selector for plugin
        //ex: $(':sortable') get the jQuery Dom that has sorted
        $.expr[':'][fullName] = function(elem){
            return !!$.data(elem, name);
        };
        
        $[namespace] = $[namespace] || {};
        $[namespace][name] = function(options, element){
            // allow instantiation without initializing for simple inheritance
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };
        
        var basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
        basePrototype.options = $.extend(true, {}, basePrototype.options);
        $[namespace][name].prototype = $.extend(true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            widgetEventPrefix: $[namespace][name].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName
        }, prototype);
        
        $.widget.bridge(name, $[namespace][name]);
    };
    
    $.widget.bridge = function(name, object){
        $.fn[name] = function(options){
            var isMethodCall = typeof options === "string", args = Array.prototype.slice.call(arguments, 1), returnValue = this;
            
            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ? $.extend.apply(null, [true, options].concat(args)) : options;
            
            // prevent calls to internal methods
            if (isMethodCall && options.charAt(0) === "_") {
                return returnValue;
            }
            
            if (isMethodCall) {
                this.each(function(){
                    var instance = $.data(this, name), methodValue = instance && $.isFunction(instance[options]) ? instance[options].apply(instance, args) : instance;
                    // TODO: add this back in 1.9 and use $.error() (see #5972)
                    //				if ( !instance ) {
                    //					throw "cannot call methods on " + name + " prior to initialization; " +
                    //						"attempted to call method '" + options + "'";
                    //				}
                    //				if ( !$.isFunction( instance[options] ) ) {
                    //					throw "no such method '" + options + "' for " + name + " widget instance";
                    //				}
                    //				var methodValue = instance[ options ].apply( instance, args );
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                });
            }
            else {
                this.each(function(){
                    var instance = $.data(this, name);
                    if (instance) {
                        instance.option(options || {})._init();
                    }
                    else {
                        $.data(this, name, new object(options, this));
                    }
                });
            }
            
            return returnValue;
        };
    };
    $.Widget = function(options, element){
        // allow instantiation without initializing for simple inheritance
        if (arguments.length) {
            this._createWidget(options, element);
        }
    };
    
    $.Widget.prototype = {
        widgetName: 'widget',
        widgetEventPrefix: '',
        options: {
            disabled: false
        },
        _createWidget: function(options, element){
            // $.widget.bridge stores the plugin instance, but we do it anyway
            // so that it's stored even before the _create function runs
            $.data(element, this.widgetName, this);
            this.element = $(element);
            this.options = $.extend(true, {}, this.options, this._getCreateOptions(), options);
            
            var self = this;
            this.element.bind('remove.' + this.widgetName, function(){
                self.destroy();
            });
            
            this._create();
            this._trigger('create');
            this._init();
        },
        _getCreateOptions: function(){
            return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
        },
        _create: $.noop,
        _init: $.noop,
        
        destroy: function(){
            this._destroy();
            this.element.unbind("." + this.widgetName).removeData(this.widgetName);
            this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled " +
            "ui-state-disabled");
        },
        _destroy: $.noop,
        
        widget: function(){
            return this.element;
        },
        
        option: function(key, value){
            var options = key;
            
            if (arguments.length === 0) {
                // don't return a reference to the internal hash
                return $.extend({}, this.options);
            }
            
            if (typeof key === 'string') {
                if (value === undefined) {
                    return this.options[key];
                }
                options = {};
                options[key] = value;
            }
            
            this._setOptions(options);
            
            return this;
        },
        _setOptions: function(options){
            var self = this;
            $.each(options, function(key, value){
                self._setOption(key, value);
            });
            
            return this;
        },
        _setOption: function(key, value){
            this.options[key] = value;
            
            if (key === "disabled") {
                this.widget()[value ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled" + " " +
                "ui-state-disabled").attr("aria-disabled", value);
            }
            
            return this;
        },
        
        enable: function(){
            return this._setOption('disabled', false);
        },
        disable: function(){
            return this._setOption('disabled', true);
        },
        
        _trigger: function(type, event, data){
            var callback = this.options[type];
            
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
            data = data || {};
            
            // copy original event properties over to the new event
            // this would happen if we could call $.event.fix instead of $.Event
            // but we don't have a way to force an event to be fixed multiple times
            if (event.originalEvent) {
                for (var i = $.event.props.length, prop; i;) {
                    prop = $.event.props[--i];
                    event[prop] = event.originalEvent[prop];
                }
            }
            
            this.element.trigger(event, data);
            
            return !($.isFunction(callback) &&
            callback.call(this.element[0], event, data) === false ||
            event.isDefaultPrevented());
        }
    };
    $.add('ui-widget');
})(jQuery);

