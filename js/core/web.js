/**
 * Baseed on gears
 * @Author: Denis 2011.01.31
 * @update: Denis 2011.07.22	优化对JSON模块的利用
 * @update: Denis 2011.11.18    优化用户状态获取方式
 * @update: Denis 2011.12.14    提供figo配置的占位
 * @update: Denis 2012.02.06    对不支持console的浏览器，提供console.info和console.log的定义
 * @update: Denis 2012.04.17    提供对jasmine的支持
 */
(function($){
    $.namespace('FE.sys', 'FE.util.jasmine', 'FE.ui');
    
    var FU = FE.util, cookie = $.util.cookie, $support = $.support;
    //PS:__last_loginid__在ie6下不正确订正(开发在cookie中增加__cn_logon_id__字段)
    //当前登录的ID
    FU.loginId = cookie('__cn_logon_id__');
    FU.LoginId = function(){
        return cookie('__cn_logon_id__');
    };
    //当前是否有登录用户
    FU.isLogin = (FU.loginId ? true : false);
    FU.IsLogin = function(){
        return (FU.LoginId() ? true : false);
    };
    //上一次登录的ID
    FU.lastLoginId = cookie('__last_loginid__');
    FU.LastLoginId = function(){
        return cookie('__last_loginid__');
    };
    //跳转函数
    /**
     * 新开窗口或者当前窗口打开(默认新开窗口),解决IE下referrer丢失的问题
     * @param {String} url
     * @argument {String} 新开窗口or当前窗口 _self|_blank
     */
    FU.goTo = function(url, target){
        var SELF = '_self';
        target = target || SELF;
        if (!$.util.ua.ie) {
            return window.open(url, target);
        }
        var link = document.createElement('a'), body = document.body;
        link.setAttribute('href', url);
        link.setAttribute('target', target);
        link.style.display = 'none';
        body.appendChild(link);
        link.click();
        if (target !== SELF) {
            setTimeout(function(){
                try {
                    body.removeChild(link);
                } catch (e) {
                }
            }, 200);
        }
        return;
    };
    
    var FUJ = FU.jasmine, jasmineReady;
    $.extend(FUJ, {
        stack: [],
        add: function(specUrl){
            if (jasmineReady) {
                $.getScript(specUrl);
            } else {
                FUJ.stack.push(specUrl);
            }
        }
    });
    //判断浏览器是否支持JSON，从而注册模块
    if ($support.JSON) {
        $.add('util-json');
    }
    //兼容console
    if (!window.console) {
        window.console = {};
        console.log = console.info = $.log;
    }
    
    $(function(){
        $.DEBUG = /debug=true/i.test(location.search);
        if ($.DEBUG) {
            $.use('util-debug');
        }
        //启用Jasmine测试脚本
        $.JASMINE = /jasmine=true/i.test(location.search);
        if ($.JASMINE) {
            $.add('ext-jasmine-specs', {
                requires: ['ext-jasmine'],
                js: FUJ.stack
            });
            $.use('ext-jasmine-specs', function(){
                $.use('ext-jasmine-html, ext-jasmine-jquery', function(){
                    FUJ.Env = jasmine.getEnv();
                    var trivialReporter = new jasmine.TrivialReporter();
                    
                    FUJ.Env.addReporter(trivialReporter);
                    FUJ.Env.specFilter = function(spec){
                        return trivialReporter.specFilter(spec);
                    };
                    //$.jasmineEnv.execute();
                    jasmineReady = true;
                });
            });
        }
    });
    //figo动态配置项
    FE.test = {};
})(jQuery);
