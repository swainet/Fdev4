/*
 * Simple jQuery logger / debugger.
 * Based on: http://jquery.com/plugins/Authoring/
 * See var DEBUG below for turning debugging/logging on and off.
 *
 * @version   20070111
 * @since     2006-07-10
 * @copyright Copyright (c) 2006 Glyphix Studio, Inc. http://www.glyphix.com
 * @author    Brad Brizendine <brizbane@gmail.com>
 * @license   MIT http://www.opensource.org/licenses/mit-license.php
 * @requires  >= jQuery 1.0.3
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
        debug: ('console' in window) ? function(message){
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
        log: $.util.debug
    });
    $.add('util-debug');
})(jQuery);




