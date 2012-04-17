/*
 * 表单验证组件Valid 3.0
 * @update Denis 2011.11.09 优化"add"方法，可以传递验证配置
 */
('Valid' in FE.ui) ||
(function($, UI, undefined){
    var regExps = {
        isFloat: /^[-\+]?\d+(\.\d+)?$/,
        isUrl: /^(http|https):\/\//,
        isEmail: /^[\w\-]+(\.[\w\-]*)*@[\w\-]+([\.][\w\-]+)+$/,
        isMobile: /^1\d{10}$/,
        isInt: /^[-\+]?\d+$/,
        isID: /^\d{17}[\d|X]|\d{15}$/
    }, rtrim = /^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, defaults = {
        active: true, //是否激活验证体系 true/false
        lazy: true, //true: 初始内容未经改变 则不作验证
        required: false, //是否必填项 默认为否
        evt: 'blur', //触发验证的事件动作 blur keyup等YUI支持的任何事件名 默认为blur
        type: 'string', //内容格式 默认为字符串 'float' 小数(包含整数) 'int' 整数 'email' 邮箱 'mobile' 手机 'url' 网络地址 'reg' 自定义正则表达式 'fun' 自定义验证方法'remote'异步验证
        trim: true, //是否对输入框值过滤左右空格
        round: 2, //当type为float时 精确的小数位数 默认2位
        cache: true //是否缓存前一次的值(每次触发事件无论值是否有变化都进行一次验证)
        //isValid: null, //验证结果状态 默认为未进行过验证
        //value: null, //缓存内容
        //min: null, //当type为string float或int时有效 指定(长度)最小值
        //max: null, //当type为string float或int时有效 指定(长度)最大值
        //reg: null, //当type为reg时有效 输入正则表达式
        //fun: null, //当type为fun时有效 输入验证的function 此function返回值为true/'出错文本'
        //msg: null, //当type为fun类型时有效 String自定义验证方法返回的错误提示信息内容 
        //key: null //错误表达所需的关键字
    };
    
    /**
     * 验证类
     * @param {Object} els
     * @param {Object} options
     */
    function Valid(els, options){
        els = $(els);
        options = options || {};
        this._els = [];
        this._elConfigs = [];
        this.onValid = options.onValid || this.onValid;
        if (els.length) {
            this.add(els);
        }
    }
    
    Valid.prototype = {
        onValid: function(){
            return true;
        },
        /**
         * 初始化|追加子元素
         * @method add
         * @param {HTMLElement | Array} els 需要进行验证的对象或对象集合
         * @param {Object} options 需要对新增的节点进行的配置，可选
         */
        add: function(els, options){
            var self = this;
            els = $(els);
            for (var i = 0, len = els.length, o, el; i < len; i++) {
                //已经存在
                if (self._els.indexOf(els[i]) > -1) {
                    continue;
                }
                el = $(els[i]);
                //追加元素
                self._els.push(els[i]);
                try {
                    o = options || $.extendIf(eval('(' + (el.data('valid') || el.attr('valid') || '{}') + ')'), defaults);
                    o.defValue = val(els[i], o);
                } 
                catch (e) {
                    $.log('valid属性内容格式错误');
                }
                //追加配置
                self._elConfigs.push(o);
                //动作事件绑定
                el.bind(o.evt + '.valid', {
                    el: els[i],
                    cfg: o,
                    opt: o
                }, $.proxy(validHandler, self));
                //监听回车事件
                if (els[i].nodeName === 'INPUT') {
                    el.bind('keydown.valid', els[i], enterPressHandler);
                }
                
            }
        },
        /**
         * 移除子元素
         * @method valid
         * @param {HTMLElement | Array | Number} els 需要进行验证的{ 对象 | 对象集合 | 索引}，只有组内的对象能进行验证
         */
        remove: function(els){
            var self = this;
            if (typeof els === 'number') {
                if (els < self._els.length) {
                    els = [self._els[els]];
                }
                else {
                    return;
                }
            }
            els = $(els);
            for (var i = 0, len = els.length, options, idx; i < len; i++) {
                idx = self._els.indexOf(els[i]);
                //对象不在组内
                if (idx < 0) {
                    continue;
                }
                options = self._elConfigs[idx];
                //移除valid注册的监听事件
                $(self._els[idx]).unbind('.valid');
                //移除监听回车事件
                //self.active(self._els[idx],false); 设置成未激活
                self._els.splice(idx, 1);
                self._elConfigs.splice(idx, 1);
            }
        },
        /**
         * 激活验证
         * @method valid
         * @param {HTMLElement | Array | Number} els 需要进行激活的{ 对象 | 对象集合 | 索引 }，只有组内的对象能进行激活
         * @param {Boolean | String} mark (optional) true/false打开关闭激活状态 'op'相反选项(opposite的缩写)
         * @return {Boolean} 激活结果中包含有未验证通过的 则返回false
         */
        active: function(els, mark){
            var self = this;
            if (typeof els === 'string' || typeof els === 'boolean' || !els) {
                mark = (mark === undefined ? els : mark);
                els = self._els;
            }
            if (typeof els === 'number') {
                if (els < self._els.length) {
                    els = [self._els[els]];
                }
                else {
                    return;
                }
            }
            els = $(els);
            for (var i = 0, len = els.length, options, idx; i < len; i++) {
                idx = self._els.indexOf(els[i]);
                //对象不在组内
                if (idx < 0) {
                    continue;
                }
                //获取对应的验证配置
                options = self._elConfigs[idx];
                if (mark === undefined || mark === true) {
                    //原来就激活的
                    if (options.active) {
                        continue;
                    }
                    options.active = true;
                }
                else if (mark === 'op') {
                    options.active = !options.active;
                }
                else {
                    //原来就未激活的
                    if (!options.active) {
                        continue;
                    }
                    options.active = false;
                }
                //重置为初始化验证状态
                if (options.active) {
                    delete options.isValid;
                }
                else {
                    self.onValid.call(self._els[idx], 'default', options); //失去激活时重置验证
                    delete options.value;
                }
            }
        },
        /**
         * 重置验证结果
         * @param {Object} els
         */
        reset: function(els){
            this.active(els, false);
            this.active(els, true);
        },
        /**
         * 验证
         * @method valid
         * @param {HTMLElement | Array | Number} els 需要进行验证的{ 对象 | 对象集合 | 索引 }，只有组内的对象能进行验证
         * @param {Object} configs 验证时临时统一更改验证配置
         * @param {Boolean} disfocus 是否聚焦
         */
        valid: function(els, configs, disfocus){
            var self = this;
            if (typeof els === 'number') {
                if (els < self._els.length) {
                    els = [self._els[els]];
                }
                else {
                    return;
                }
            }
            //不传参数 默认为组中所有对象
            if (!els) {
                els = self._els;
            }
            //参数提前
            if (configs === true) {
                disfocus = true;
                configs = undefined;
            }
            els = $(els);
            for (var i = 0, k, len = els.length; i < len; i++) {
                var options = {}, idx = self._els.indexOf(els[i]);
                if (idx < 0) {
                    continue;
                }
                //获取对应的验证配置
                $.extend(options, self._elConfigs[idx]);
                /*2010.05.24 reset configs*/
                if (configs) {
                    $.extend(options, configs);
                }
                //对未激活验证的 跳过验证
                if (!options.active) {
                    continue;
                }
                //阻止lazy
                options.lazy = false;
                
                //遍历未正确验证的元素 包括未验证过和验证未通过的和不缓存验证状态的
                if (options.isValid !== true || !options.cache) {
                    //对未验证过的元素进行验证
                    if (options.isValid === undefined || !options.cache) {
                        //对于此类把验证状态统一置为false 并重新进行验证 
                        options.isValid = false;
                        //手动验证出去默认值
                        delete options.defValue;
                        validHandler.call(self, {
                            data: {
                                el: self._els[idx],
                                cfg: self._elConfigs[idx],
                                opt: options
                            }
                        }); //调用验证方法
                    }
                    //保存首个验证未通过的元素索引
                    if (options.isValid === false && k === undefined) {
                        k = idx;
                    }
                }
            }
            //至少有一个未验证通过
            if (typeof k === 'number') {
                if (!disfocus) {
                    $(self._els[k]).not(':hidden').focus();
                }
                return false;
            }
            return true; //全部验证通过
        },
        /**
         * 获取选定对象的配置
         * @method getConfig
         * @param {HTMLElement | Number} els 需要进行验证的{ 对象 | 对象集合 | 索引 }，只有组内的对象能重置
         * @param {Object} configs 配置
         */
        getConfig: function(el){
            var self = this, i = (typeof el === 'number' ? el : self._els.indexOf($(el).get(0)));
            return i < 0 ? null : self._elConfigs[i];
        },
        /**
         * 重置选定对象的配置
         * @method setConfig
         * @param {HTMLElement | Array | Number} els 需要进行验证的{ 对象 | 对象集合 | 索引 }，只有组内的对象能重置
         * @param {Object} configs 配置
         */
        setConfig: function(els, configs){
            var self = this;
            if (typeof els === 'number') {
                if (els < self._els.length) {
                    els = [self._els[els]];
                }
                else {
                    return;
                }
            }
            else if ($.isPlainObject(els)) {
                configs = els;
                els = undefined;
            }
            //不传参数 默认为组中所有对象
            if (!els) {
                els = self._els;
            }
            els = $(els);
            for (var i = 0, j = els.length; i < j; i++) {
                var idx = self._els.indexOf(els[i]);
                if (idx < 0) {
                    continue;
                }
                $.extend(self._elConfigs[idx], configs);
            }
        }
    };
    /**
     * 获取各种表单类型的值
     * @param {Object} elements
     * @param {Object} options
     */
    function val(el, options){
        switch (el.tagName.toLowerCase()) {
            case 'input':
                var type = el.type.toLowerCase();
                if (type === 'text' || type === 'password') {
                    if (options.trim) {
                        el.value = el.value.replace(rtrim, '');
                    }
                    return el.value;
                }
                if (type === 'password') {
                    return el.value;
                }
                if (type === 'radio' || type === 'checkbox') {
                    return el.checked ? 'checked' : '';
                }
                return el.value;
            case 'textarea':
            default:
                if (options.trim) {
                    el.value = el.value.replace(rtrim, '');
                }
                return el.value;
            case 'select':
                return el.selectedIndex < 0 ? null : el.options[el.selectedIndex].value;
        }
    }
    
    /**
     * 监听回车事件
     * @param {Object} event
     */
    function enterPressHandler(e){
        if (e.keyCode === 13) {
            $(e.data).triggerHandler('blur');
        }
    }
    
    /**
     * 验证回调函数
     * @param {Object} e
     * @param {Object} obj
     */
    function validHandler(e){
        //2010.06.09: cfg 源生配置 options 临时配置 共享isValid属性
        var data = e.data, el = data.el, cfg = data.cfg, options = data.opt, value = val(el, options);
        if (!options.active) {
            return;
        }
        //过滤前后空格
        if (options.lazy) {
            if (value === options.defValue) {
                return;
            }
            options.lazy = false;
        }
        //内容无变化 跳出验证
        //2011.05.19 Denis 当cache为false的时候，此逻辑无效
        if (options.cache && value === options.value) {
            return;
        }
        //自定义方法优先 否则指向默认方法
        var onValid = this.onValid;
        //把新值缓存
        if (options.cache) {
            cfg.value = value;
        }
        //置验证状态为false
        cfg.isValid = options.isValid = false;
        //假如值为空(对于radio或checkbox则未选中) 则判断required条件
        if (!value) {
            //验证是否必填项
            if (options.required) {
                return onValid.call(el, 'required', options);
            }
            
            //假如非自定义方法验证，没有指定required:true，则验证通过。否则需要进行自定义方法再次验证。
            if (options.type !== 'fun') {
                cfg.isValid = options.isValid = true;
                //验证通过
                return onValid.call(el, 'pass', options);
            }
        }
        
        switch (options.type) {
            case 'string':
                if (typeof options.min === 'number' && value.length < options.min) {
                    return onValid.call(el, 'min', options);
                }
                if (typeof options.max === 'number' && value.length > options.max) {
                    return onValid.call(el, 'max', options);
                }
                break;
            case 'float':
                if (!regExps.isFloat.test(value)) {
                    return onValid.call(el, 'float', options);
                }
                var fval = value * 1;
                if (typeof options.min === 'number') {
                    fval = fval.toFixed(options.round);
                }
                if (options.cache) {
                    cfg.value = value;
                }
                if (typeof options.min === 'number' && fval < options.min) {
                    return onValid.call(el, 'min', options);
                }
                if (typeof options.max === 'number' && fval > options.max) {
                    return onValid.call(el, 'max', options);
                }
                break;
            case 'int':
                if (!regExps.isInt.test(value)) {
                    return onValid.call(el, 'int', options);
                }
                var ival = value * 1;
                if (typeof options.min === 'number' && ival < options.min) {
                    return onValid.call(el, 'min', options);
                }
                if (typeof options.min === 'number' && ival > options.max) {
                    return onValid.call(el, 'max', options);
                }
                break;
            case 'email':
                if (!regExps.isEmail.test(value)) {
                    return onValid.call(el, 'email', options);
                }
                break;
            case 'mobile':
                if (!regExps.isMobile.test(value)) {
                    return onValid.call(el, 'mobile', options);
                }
                break;
            case 'url':
                if (!regExps.isUrl.test(value)) {
                    return onValid.call(el, 'url', options);
                }
                break;
            case 'reg':
                if (!options.reg.test(value)) {
                    return onValid.call(el, 'reg', options);
                }
                break;
            case 'fun':
                options.msg = options.fun.call(el, options);
                if (typeof options.msg === 'string') {
                    return onValid.call(el, 'fun', options);
                }
                break;
            case 'remote':
                return options.fun.call(el, {
                    cfg: cfg,
                    opt: options
                }, onValid);
            default:
                return onValid.call(el, 'unkown', options);
        }
        cfg.isValid = options.isValid = true;
        //验证通过
        return onValid.call(el, 'pass', options);
    }
    
    Valid.regExps = regExps;
    UI.Valid = Valid;
    
    $.add('web-valid');
})(jQuery, FE.ui);
