/**
 * Baseed on web.js
 * @Author: Denis 2011.01.31
 */
(function($, Util){
    var ie = $.util.ua.ie;
    /**
     * 判断IE是否装了alitalk
     */
    Util.hasAlitalk = (function(){
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
        else if ($.browser.mozilla || $.browser.safari) {
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
                    if ((plugin[0].NPWWVersion && numberify(plugin[0].NPWWVersion()) >= 1.003) || plugin[0].isInstalled(1)) {
                        Util.hasAlitalk = true;
                    }
                    plugin.remove();
                }
            });
        }
        return false;
    })();
    /**
     * 判断IE浏览器装了工具条
     */
    Util.hasAlitool = (function(){
        if (ie) {
            try {
                var tool = new ActiveXObject('YAliALive.Live');
                return true;
            } 
            catch (e) {
            }
            return false;
        }
        else {
            return false;
        }
    })();
    $.add('web-addons');
})(jQuery, FE.util);
