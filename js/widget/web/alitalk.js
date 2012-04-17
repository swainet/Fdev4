/*
 * 阿里旺旺 3.4
 * @author Denis 2011.02
 * @update Denis 2011.03.02 旺旺接口支持JSONP
 * @update Denis 2011.03.23 修复DOMReady情况下，FF赋值isInstalled报错; 调用旺旺插件通过iframe进行，不改变window.location; 去掉onClickBegin
 * @update Denis 2011.06.23 对已经初始化过的标签不再重复初始化
 * @update Denis 2011.09.22 优化getAlitalk的默认接口，带上了memberId；提取onRemote方法为默认函数，优化无默认文案的解决方案。
 * @update Denis 2011.11.04 修复DOM被移除后，data获取失败，success回调函数无法正常执行的BUG。
 * @update Denis 2011.12.05 反馈打点需求
 * @update Denis 2012.01.18 修复.data自动类型转换引起的BUG
 * @update XuTao 2012.02.08 BUG修复
 * @update allenm 2012.03.01 没安装的旺旺的时候，尝试当前页面上的 FE.sys.webww.main.chatTo() 方法，如果失败，才跳转到 webww 页面
 * @update Denis 2012.03.12 增加分流参数
 * @update Denis 2012.03.30 修复亮灯请求参数GBK编码的问题
 */
('alitalk' in FE.util) ||
(function($, Util){
    var ie = $.util.ua.ie, $extendIf = $.extendIf, defaults = {
        //数组对应的类型依次为自定义、按钮和图标
        cls: {
            base: 'alitalk',
            on: 'alitalk-on',
            off: 'alitalk-off',
            mb: 'alitalk-mb'
        },
        attr: 'alitalk',
        //旺旺所在的站点，
        siteID: 'cnalichn',
        //是否请求用户在线状态
        remote: true,
        prop: '',
        //未安装或未检测到安装旺旺后调用此方法
        getAlitalk: function(id){
            if( !(FE.sys && FE.sys.webww && FE.sys.webww.main && FE.sys.webww.main.chatTo( id )) ){
                window.open('http://webww.china.alibaba.com/message/my_chat.htm?towimmid=' + id, '_blank');
            }
        },
        onRemote: function(data){
            var element = $(this);
            switch (data.online) {
                case 0:
                case 2:
                case 6:
                default: //不在线
                    element.html('给我留言').attr('title', '我不在网上，给我留个消息吧');
                    break;
                case 1: //在线
                    element.html('和我联系').attr('title', '我正在网上，马上和我洽谈');
                    break;
                case 4:
                case 5: //手机在线
                    element.html('给我短信').attr('title', '我手机在线，马上和我洽谈');
                    break;
            }
        }
    }, version = 0, isInstalled = (function(){
        if (ie) {
            var vers = {
                'aliimx.wangwangx': 6,
                'Ali_Check.InfoCheck': 5
            };
            for (var p in vers) {
                try {
                    new ActiveXObject(p);
                    version = vers[p];
                    return true;
                } 
                catch (e) {
                }
            }
        }
        else 
            if ($.browser.mozilla || $.browser.safari) {
                var res = false;
                $(function(){
                    if (navigator.mimeTypes['application/ww-plugin']) {
                        var plugin = $('<embed>', {
                            type: 'application/ww-plugin',
                            css: {
                                visibility: 'hidden',
                                width: 0,
                                height: 0
                            }
                        });
                        plugin.appendTo(document.body);
                        if ((plugin[0].NPWWVersion && numberify(plugin[0].NPWWVersion()) >= 1.003) || (plugin[0].isInstalled && plugin[0].isInstalled(1))) {
                            version = 6;
                            res = true;
                            //Denis: 判断alitalk是否已经赋给Util，DOMReady之后use功能，Util.alitalk还未赋值
                            if (Util.alitalk) {
                                Util.alitalk.isInstalled = true;
                            }
                        }
                        plugin.remove();
                    }
                });
                return res;
            }
        return false;
    })();
    /**
     * 请求回调函数
     * @param {Object} response JSON object
     * @param {Object} elements
     * @param {Object} options
     */
    function success(obj, elements, options){
        if (obj.success) {
            var arr = obj.data;
            elements.each(function(i){
                var element = $(this), data = element.data('alitalk');
                if (data) {
                    //保存在线状态
                    data.online = arr[i];
                    element.addClass(data.cls.base);
                    
                    switch (data.online) {
                        case 0:
                        case 2:
                        case 6:
                        default: //不在线
                            element.addClass(data.cls.off);
                            break;
                        case 1: //在线
                            element.addClass(data.cls.on);
                            break;
                        case 4:
                        case 5: //手机在线
                            element.addClass(data.cls.mb);
                            break;
                    }
                    
                    if (data.onRemote) {
                        data.onRemote.call(element[0], data);
                    }
                }
            });
        }
        //重置
        if (options.onSuccess) {
            options.onSuccess();
        }
    }
    /**
     * 调用旺旺插件
     */
    function invokeWW(cmd){
        var ifr = $('<iframe>').css('display', 'none').attr('src', cmd).appendTo('body');
        setTimeout(function(){
            ifr.remove();
        }, 200);
    }
    /**
     * 点击事件处理函数
     * @param {Object} event
     */
    function onClickHandler(event){
        var element = $(this), data, feedback, prop, info_id;
        if (event) {
            event.preventDefault();
            data = element.data('alitalk');
        }
        else {
            data = this;
        }
        //静态模式下 设置默认状态为在线
        if (!data.remote) {
            data.online = 1;
        }
        //还没有获取到状态
        if (data.online === null) {
            return;
        }
        
        prop = data.prop;
        if (typeof prop === 'function') {
            prop = prop.call(this);
            var match = prop.match(/info_id=([^#]+)/);
            if (match && match.length === 2) {
                info_id = match[1];
            }
        }
        
        feedback = '&url2=http://dmtracking.alibaba.com/others/feedbackfromalitalk.html?online=' + data.online +
        '#info_id=' +
        (data.info_id || info_id || '') +
        '#type=' +
        (data.type || '') +
        '#module_ver=3#refer=' +
        encodeURI(document.URL).replace(/&/g, '$');
        //解析用户id
        switch (version) {
            case 0:
            default:
                data.getAlitalk.call(this, data.id);
                break;
            case 5:
                invokeWW('Alitalk:Send' + (data.online === 4 ? 'Sms' : 'IM') + '?' + data.id + '&siteid=' + data.siteID + '&status=' + data.online + feedback + prop);
                break;
            case 6:
                if (data.online === 4) {
                    invokeWW('aliim:smssendmsg?touid=' + data.siteID + data.id + feedback + prop);
                }
                else {
                    invokeWW('aliim:sendmsg?touid=' + data.siteID + data.id + '&siteid=' + data.siteID + '&fenliu=1&status=' + data.online + feedback + prop);
                }
                break;
                
        }
        if (data.onClickEnd) {
            data.onClickEnd.call(this, event);
        }
    }
    /**
     * 弹出登录窗口
     * @param {Object} id
     */
    function login(id){
        var src;
        if (version === 5) {
            src = 'alitalk:';
        }
        else {
            src = 'aliim:login?uid=' + (id || '');
        }
        invokeWW(src);
    }
    /**
     * 转化为数字
     * @param {Object} s
     */
    function numberify(s){
        var c = 0;
        return parseFloat(s.replace(/\./g, function(){
            return (c++ === 0) ? '.' : '';
        }));
    }
    /*
     * 初始化alitalk的静态方法
     * @param {jQuery} $支持的所有标识
     * @param {object} opts 配置参数
     */
    function alitalk(elements, options){
        if ($.isPlainObject(elements)) {
            options = elements;
            options.online = options.online || 1;
            $extendIf(options, defaults);
            onClickHandler.call(options);
        }
        else {
            options = options || {};
            $extendIf(options, defaults);
            elements = $(elements).filter(function(){
                return !$.data(this, options.attr);
            });
            if (elements.length) {
                //旺旺接口优化后支持JSONP
                var ids = [];
                elements.each(function(i, elem){
                    elem = $(elem);
                    var data = $extendIf(eval('(' + (elem.attr(options.attr) || elem.attr('data-' + options.attr) || '{}') + ')'), options);
                    elem.data('alitalk', data);
                    ids.push(data.siteID + data.id);
                }).bind('click', onClickHandler);
                //从阿里软件获取在线状态
                if (ids.length && options.remote) {
                    $.ajax('http://amos.im.alisoft.com/mullidstatus.aw', {
                        dataType: 'jsonp',
                        data: 'uids=' + ids.join(';'), 
                        success: function(o){
                            success(o, elements, options);
                        }
                    });
                }
            }
        }
    }
    
    /*
     * 静态变量及方法
     */
    Util.alitalk = alitalk;
    /*
     * Alitalk客户端版本
     */
    Util.alitalk.version = version;
    /*
     * 客户端是否安装了Alitalk
     */
    Util.alitalk.isInstalled = isInstalled;
    /*
     * 自动启动alitalk客户端软件
     */
    Util.alitalk.login = login;
    
    $.add('web-alitalk');
})(jQuery, FE.util);
