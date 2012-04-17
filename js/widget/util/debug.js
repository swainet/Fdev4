/*
 * util-debug
 * @version 1.1
 * @update 2012.03.12 Denis 
 */
('debug' in jQuery.util) ||
(function($){
    var msgQueue = [], msgBox = null, prepared = false, prepare = function(){
        $(function(){
            $(document.body).append('<div id="DEBUG" style="padding:8px;border:dashed 1px #FF7300;background-color:#EEE;color:#F00;"><ol></ol></div>');
            msgBox = $('#DEBUG ol');
            $.each(msgQueue, function(i, message){
                $('<li>').text('' + message).appendTo(msgBox);
            });
        });
        prepared = true;
    };
    
    $.extend($.util, {
        /*
         * log
         * Send it anything, and it will add a line to the logging console.
         * If firebug is installed, it simple send the item to firebug.
         * If not, it creates a string representation of the html element (if message is an object), or just uses the supplied value (if not an object).
         */
        debug: ('console' in window && console.info !== $.log) ? function(message){
            $.DEBUG && console.info(message);
        }
 : function(message){
            if ($.DEBUG) {
                !prepared && prepare();
                msgBox ? $('<li>').text('' + message).appendTo(msgBox) : msgQueue.push(message);
            }
        }
    });
    
    $.extend({
        DEBUG: true,
        log: ($.log === $.noop) ? $.util.debug : $.log
    });
    $.add('util-debug');
})(jQuery);




