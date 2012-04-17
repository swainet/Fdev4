/**
 * @author xianxia.jinaxx
 * @file websocket
 * @date 2011-07-12
 */
('websocket' in jQuery.ui.flash) ||
(function($){
    var $util = $.util;
    function WebSocket(){
        var self = this, swfid = self.element[0].id, o = self.options, swfurl = o.swf || 'http://img.china.alibaba.com/swfapp/websocket/websocket-20111121.swf';
        o = self.options = $.extend(true, {
            swf: swfurl,
            //允许脚本
            allowScriptAccess: 'always',
            flashvars: {
                debug:false,
                //事件钩子
                eventHandler: 'jQuery.util.flash.triggerHandler'
            }
        }, o);
        $.extend(self, {
            /**
             * 配置Flash的配置参数
             */
            _getFlashConfigs: function(){
                var self = this, configs;
                //调用原始方法
                configs = $.ui.flash.prototype._getFlashConfigs.call(self);
                //这里的swfid其实是容器id
                configs.flashvars.swfid = swfid;
                return configs;
            },
            /**
             * 发送消息
             * @param {Object} data
             */
            send: function(data){
                if (this.readyState === 2) {
                    return;
                }
                try {
                    /*this.obj.send(data);*/
                    this.callMethod('send',data);
                } 
                catch (e) {
                    $.log('send msg is error ' + e.message);
                }
            },
            /**
             * 打开长连接
             * @param {Object} config
             */
            open: function(config){
                try {
                    //安全校验，防止攻击，谨防初始化flash的位置与发出信息的位置不一致的
                    this.obj.setCallerUrl(location.href);
                    this.obj.create(config.url, config.protocal);
                } 
                catch (e) {
                    $.log('setCallerUrl or create websocket error is ' + e.message);
                }
            },
            /**
             * 关闭长连接
             */
            close: function(){
                this.obj.close();
            },

            getReadyState:function(){
                return this.obj.getReadyState();
            }


        });
        //需要flash组件提供后续操作 return true;
        return true;
    }
    $util.flash.regist('websocket', WebSocket);
    $.add('ui-flash-websocket');
})(jQuery);

