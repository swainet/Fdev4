/**
 * jQuery UI Timer 1.2
 *
 * by Denis 2011.07.01
 * Depends:
 *	jquery.ui.core.js
 * @update Denis 2011.11.25 修复无法停止后再开始
 * @update Denis 2011.12.28 去掉默认的from配置，当没有传递from参数时，默认为客户端当前时间
 * @update Denis 2012.03.26 修复由于时差引起的计时误差
 */
('timer' in jQuery.fn) ||
(function($, undefined){
    var TMAP = ['year', 'month', 'day', 'hour', 'minute', 'second'], FMAP = {
        year: 'yyyy',
        month: 'MM',
        day: 'dd',
        hour: 'hh',
        minute: 'mm',
        second: 'ss'
    };
    $.widget('ui.timer', {
        options: {
            format: 'y-M-d hh:mm:ss', //天 时 分 秒
            //from: new Date()
            to: new Date(),
            step: 1,
            animate: false,
            autoStart: true
        },
        _create: function(){
            this._render();
        },
        _render: function(){
            var self = this, elem = self.element, o = self.options, tmp = '<dl><dd></dd></dl>';
            elem.addClass('ui-timer');
            //遍历占位容器
            $.each(TMAP, function(i, item){
                var placeholder = $('.' + item, elem);
                if (placeholder.length) {
                    self['ph' + item] = placeholder;
                    if (o.animate) {
                        placeholder.html(item === 'year' ? tmp : (tmp + tmp));
                        self['ph' + item] = placeholder.children();
                    }
                }
            });
            if (o.autoStart) {
                self.start();
            }
        },
        /**
         * 开始计时
         */
        start: function(){
            var self = this, o = self.options, aim;
            if (!self.timer) {
                //初始化时间
                aim = self.aim = new Date(o.to - (o.from || new Date())); //目标和起始的差值
                //保存计时器
                self.timer = $.later(1000 * o.step, self, self._interval, undefined, true);
                self._interval();
            }
            return self;
        },
        /**
         * 停止计时
         */
        stop: function(){
            var self = this;
            if (self.timer) {
                self.timer.cancel();
                delete self.timer;
                self._trigger('stop');
            }
        },
        /**
         * 计时循环处理
         */
        _interval: function(){
            var self = this, aim = self.aim;
            if (aim < 0) {
                self.stop();
                return;
            }
            var o = self.options, format = o.format, aimMap = {
                year: aim.getFullYear() - 1970,
                month: aim.getUTCMonth(),
                day: aim.getUTCDate() - 1,
                hour: aim.getUTCHours(),
                minute: aim.getUTCMinutes(),
                second: aim.getUTCSeconds()
            };
            if (o.animate) {
                $.each(TMAP, function(i, item){
                    var preVal = self[item] || 0, val = aimMap[item];
                    if (self['ph' + item] && preVal !== val) {
                        //animate
                        self._animate(self['ph' + item], preVal, val);
                        self[item] = val;
                    }
                });
            } else {
                $.each(TMAP, function(i, item){
                    var val = aimMap[item];
                    if (self['ph' + item] && self[item] !== val) {
                        self['ph' + item].html((val < 10 && format.indexOf(FMAP[item]) > -1) ? '0' + val : val);
                        self[item] = val;
                    }
                });
            }
            //重置时长
            self.aim = new Date(self.aim - 1000 * o.step);
        },
        /**
         * 动画执行函数
         * @param {Object} dds dd容器
         * @param {Object} pre 之前的值
         * @param {Object} now 之后的值
         */
        _animate: function(dls, pre, now){
            var self = this, o = self.options, len = dls.length, i = 0, p, n;
            pre = self._strFix(pre, len);
            now = self._strFix(now, len);
            for (; i < len; i++) {
                p = pre.charAt(i);
                n = now.charAt(i);
                if (p !== n) {
                    var dl = $(dls[i]), di = dl.children(), dd = $('<dd>').addClass('num' + n);
                    dl.append(dd);
                    di.animate({
                        marginTop: '-' + di.height() + 'px'
                    }, 800, function(){
                        $(this).remove();
                    });
                }
            }
        },
        /**
         * 对不足长度的字符串，补0
         * @param {Object} len
         */
        _strFix: function(str, len){
            str = str + '';
            var i = len - str.length;
            while (i) {
                str = '0' + str;
                i--;
            }
            return str;
        },
        /**
         * 销毁组件
         */
        _destroy: function(){
            var self = this;
            self.stop();
            self.element.removeClass('ui-timer');
        }
    });
    
    $.add('ui-timer');
})(jQuery);
