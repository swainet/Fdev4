/**
 * Baseed on gears
 * @Author: Denis 2011.01.31
 * @update: Denis 2011.07.22	优化对JSON模块的利用
 */
(function($){
    $.namespace('FE.sys', 'FE.util', 'FE.ui');
    
    var FU = FE.util, cookie = $.util.cookie, $support = $.support;
    //PS:__last_loginid__在ie6下不正确订正(开发在cookie中增加__cn_logon_id__字段)
    //当前登录的ID
    FU.loginId = cookie('__cn_logon_id__');
    //当前是否有登录用户
    FU.isLogin = (FU.loginId ? true : false);
    //上一次登录的ID
    FU.lastLoginId = cookie('__last_loginid__');
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
                } 
                catch (e) {
                }
            }, 200);
        }
        return;
    };
    //判断浏览器是否支持JSON，从而注册模块
    if ($support.JSON) {
        $.add('util-json');
    }
})(jQuery);
