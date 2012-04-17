/*
 * jQuery UI Flash 1.3
 *
 * @author Denis 2011.02.26
 * @update Denis 2011.06.14 增加了flash扩展的注册方法$.util.flash.regist，提高了灵活性，降低耦合度
 * @update Denis 2011.09.16 将create方法作为私有方法定义
 * @update hua.qiuh 2011.11.11 增加callMethod方法，建议使用这个方法调用flash公开的接口
 * @update Denis 2011.11.24 调整IE下插入flash的方式
 */
('flash' in jQuery.fn) ||
(function($, $util, Plugin){
    var OBJECT = 'object', FUNCTION = 'function', isIE = $.util.ua.ie, useEncode, flashVersion, modules = {};
    
    /**
     * compareArrayIntegers
     * @param {Object} a
     * @param {Object} b
     */
    function compareArrayIntegers(a, b){
        var x = (a[0] || 0) - (b[0] || 0);
        
        return x > 0 || (!x && a.length > 0 && compareArrayIntegers(a.slice(1), b.slice(1)));
    }
    
    /**
     * objectToArguments
     * @param {Object} o
     */
    function objectToArguments(o){
        if (typeof o !== OBJECT) {
            return o;
        }
        
        var arr = [], str = '';
        
        for (var i in o) {
            if (typeof o[i] === OBJECT) {
                str = objectToArguments(o[i]);
            }
            else {
                str = [i, (useEncode) ? encodeURI(o[i]) : o[i]].join('=');
            }
            arr.push(str);
        }
        
        return arr.join('&');
    }
    
    /**
     * objectFromObject
     * @param {Object} o
     */
    function objectFromObject(o){
        var arr = [];
        
        for (var i in o) {
            if (o[i]) {
                arr.push([i, '="', o[i], '"'].join(''));
            }
        }
        
        return arr.join(' ');
    }
    
    /**
     * paramsFromObject
     * @param {Object} o
     */
    function paramsFromObject(o){
        var arr = [];
        
        for (var i in o) {
            arr.push(['<param name="', i, '" value="', objectToArguments(o[i]), '" />'].join(''));
        }
        
        return arr.join('');
    }
    
    try {
        flashVersion = Plugin.description ||
        (function(){
            return (new Plugin('ShockwaveFlash.ShockwaveFlash')).GetVariable('$version');
        }());
    } 
    catch (e) {
        flashVersion = 'Unavailable';
    }
    
    var flashVersionMatchVersionNumbers = flashVersion.match(/\d+/g) || [0];
    
    $util.flash = {
        /*
         *
         */
        available: flashVersionMatchVersionNumbers[0] > 0,
        /*
         * activeX插件对象
         */
        activeX: Plugin && !Plugin.name,
        /*
         * 各种格式的版本表示
         */
        version: {
            original: flashVersion,
            array: flashVersionMatchVersionNumbers,
            string: flashVersionMatchVersionNumbers.join('.'),
            major: parseInt(flashVersionMatchVersionNumbers[0], 10) || 0,
            minor: parseInt(flashVersionMatchVersionNumbers[1], 10) || 0,
            release: parseInt(flashVersionMatchVersionNumbers[2], 10) || 0
        },
        /**
         * 判断浏览器Flash版本是否符合传入的版本要求
         * @param {Object} version
         */
        hasVersion: function(version){
            var versionArray = (/string|number/.test(typeof version)) ? version.toString().split('.') : (/object/.test(typeof version)) ? [version.major, version.minor] : version || [0, 0];
            
            return compareArrayIntegers(flashVersionMatchVersionNumbers, versionArray);
        },
        /*
         * 是否对参数进行encodeURI操作
         */
        encodeParams: true,
        /*
         * expressInstall的swf文件路径
         */
        expressInstall: 'expressInstall.swf',
        /*
         * 是否激活expressInstall
         */
        expressInstallIsActive: false,
        /**
         * 创建一个flash对象
         * @param {Object} options	配置参数
         * @return {HTMLDOMElement} flash object对象
         */
        _create: function(container, options){
            var self = this;
            
            if (!options.swf || self.expressInstallIsActive || (!self.available && !options.hasVersionFail)) {
                return false;
            }
            //这个逻辑是当检测到Flash版本不符合要求时，替换为expressInstall的flash
            if (!self.hasVersion(options.hasVersion || 1)) {
                self.expressInstallIsActive = true;
                
                if (typeof options.hasVersionFail === FUNCTION) {
                    if (!options.hasVersionFail.apply(options)) {
                        return false;
                    }
                }
                
                options = {
                    swf: options.expressInstall || self.expressInstall,
                    height: 137,
                    width: 214,
                    flashvars: {
                        MMredirectURL: location.href,
                        MMplayerType: (self.activeX) ? 'ActiveX' : 'PlugIn',
                        MMdoctitle: document.title.slice(0, 47) + ' - Flash Player Installation'
                    }
                };
            }
            
            attrs = {
                //假如FLash内置调用Javascript，则必需给object赋id，否则在ie下报错
                id: 'ui-flash-object' + $.guid++,
                width: options.width || 320,
                height: options.height || 180,
                style: options.style || ''
            };
            
            if (isIE) {
                attrs.classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
                options.movie = options.swf;
            }
            else {
                attrs.data = options.swf;
                attrs.type = 'application/x-shockwave-flash';
            }
            
            useEncode = typeof options.useEncode !== 'undefined' ? options.useEncode : self.encodeParams;
            
            options.wmode = options.wmode || 'opaque';
            
            delete options.hasVersion;
            delete options.hasVersionFail;
            delete options.height;
            delete options.swf;
            delete options.useEncode;
            delete options.width;
            
            var html = ['<object ', objectFromObject(attrs), '>', paramsFromObject(options), '</object>'].join('');
            if (isIE) {
                var flashContainer = document.createElement('div');
                container.html(flashContainer);
                flashContainer.outerHTML = html;
            }
            else {
                container.html(html);
            }
            return container.children().get(0);
        },
        /**
         * 注册flash模块
         * @param {String} name 模块名称
         * @param {Object} handler
         * @return {Bolean} 是否注册成功，假如已经存在模块，则注册失败
         */
        regist: function(name, handler){
            var module = modules[name];
            if (!module) {
                modules[name] = handler;
                return true;
            }
            return false;
        },
        /**
         * 由Flash调用此方法
         * @param {Object} o
         */
        triggerHandler: function(o){
            $('#' + o.swfid).triggerHandler(o.type, o);
        }
    };
    
    $.widget('ui.flash', {
        //PS:这里的配置将会传递给flash创建对象，所以新增参数请注意
        options: {
            //扩展已知其他组件
            module: false
        },
        _create: function(){
            var self = this, elem = self.element, o = self.options, configs, res = true;
            
            //给无id容器分配id
            if (!elem[0].id) {
                self._generateId();
            }
            //调用模块处理函数
            if (o.module && modules.hasOwnProperty(o.module)) {
                res = modules[o.module].call(self);
            }
            elem.addClass('ui-flash');
            //部分模块部分情况下不需要创建Flash对象
            if (res) {
                //创建flash对象
                self.obj = $util.flash._create(elem, self._getFlashConfigs());
                //self.obj = elem[0].firstChild;
                
                if (!self.obj) {
                    self.destroy();
                }
            }
        },
        _destroy: function(){
            var self = this, elem = self.element;
            if (self.isGenerateId) {
                elem.removeAttr('id');
                delete self.isGenerateId;
            }
            delete self.obj;
            
            elem.unbind('.flash').removeClass('ui-flash').empty();
        },
        /**
         * 给容器分配一个id
         */
        _generateId: function(){
            this.isGenerateId = true;
            this.element[0].id = 'ui-flash' + $.guid;
        },
        /**
         * 获取flash对象
         * @return {HTMLDOMElement} flash对象
         */
        getFlash: function(){
            return this.obj;
        },

        /**
         * 调用flash内部的方法
         * 将传入参数进行编码，返回值进行解码，解决Flash播放器的bug
         * @return flash内部执行结果
         */
        callMethod: function(){

            function fixSlashBugForFlashPlayer(value){
                return encodeURIComponent(value);
            }

            var args    = $.makeArray(arguments),
                fn      = args.shift(),
                swf     = this.obj;

            $.each(args, function(id, value){
                args[id] = fixSlashBugForFlashPlayer(value);
            });

            var result = swf[fn].apply( swf, args);
            return decodeURIComponent(result);
        },

        /**
         * 从options中剥离无效的配置参数，返回生成flash对象说必须的参数
         * 该方法必要时，需要在extend的函数中进行重写
         */
        _getFlashConfigs: function(){
            var configs = $.extend(true, {}, this.options);
            
            //删除多余的配置项
            delete configs.disabled;
            delete configs.module;
            
            return configs;
        }
    });
    $.add('ui-flash');
}(jQuery, jQuery.util, navigator.plugins['Shockwave Flash'] || window.ActiveXObject));
