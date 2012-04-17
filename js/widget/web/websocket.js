/*
 * @author xianxia.jinaxx
 * @file websocket
 * @date 2011-07-12
 * @example
 *
 *  $.util.websocket.ready(function(){
 * 		var myws = new FE.ui.WebSocket({url:'ws://node.remysharp.com:8001'});
 * });
 *
 */
('WebSocket' in FE.ui) ||
(function($, UI, undefined){
    var WebSocket = function(config){
        this._init(config);
    }
    if (!$.support.WebSocket) {
        $.extend(WebSocket.prototype, {
            _init: function(config){
                this.engine = $('<div>', {
                    id: 'flash-websocket-' + (config.cid || ($.guid++))
                }).css({
                    'position': 'absolute',
                    'left': '-1000px',
                    'top': '-1000px'
                }).appendTo('body');
                
                this._buildEvent(config);
            },
            _buildEvent: function(config){
                var self = this;
                this.engine.flash({
                
                    module: 'websocket'
                
                }).bind('swfReady.flash', function(){
                    self.engine.flash('open', config);
                    
                }).bind('open.flash', function(){
                
                    config.onopen && config.onopen();
                    
                }).bind('send.flash', function(){
                
                    config.onsend && config.onsend();
                    
                }).bind('message.flash', function(e, data){
                
                    config.onmessage && config.onmessage(data);
                    
                }).bind('close.flash', function(){
                
                    config.onclose && config.onclose();
                    
                }).bind('stateChange.flash', function(){
                
                    /*self.engine.readyState = self.engine.getReadyState();*/
                    self.engine.readyState = self.engine.flash('gerReadyState');
                    
                });
                
            },
            open: function(config){
                if (this.engine) 
                    this.engine.flash('open', config);
            },
            close: function(config){
                if (this.engine) 
                    this.engine.flash('close', config);
            },
            send: function(data){
                if (this.engine) 
                    this.engine.flash('send', data);
            }
        });
        
    }
    else {
        $.extend(WebSocket.prototype, {
            _init: function(config){
                this.config = config;
                this.engine = new window.WebSocket(config.url);
                $.extend(this.engine, config);
            },
            open: function(){
                this.engine = new window.WebSocket(this.config.url)
            },
            send: function(data){
                this.engine.send(data);
            },
            close: function(){
                this.engine.close();
            },
            message: function(){
            
            }
        });
        
    }
    
    
    UI.WebSocket = WebSocket;
    
    $.add('web-websocket');
})(jQuery, FE.ui);
