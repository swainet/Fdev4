/**
 * jQuery UI Datepicker-time
 *
 * Depends:
 *	jQuery.ui.datepicker
 * @version 1.1 修复月份跳跃的BUG，优化日期操作 ---- Denis
 * @update 2012.02.28 提供清空按钮 ---- 陈屹
 */
('TimeSelector' in jQuery.ui.datepicker) ||
(function($, undefined){
    $.extend($.ui.datepicker, {
        /**
         * 时间选择构造器
         * @constructor S.Calendar.TimerSelector
         * @param {object} ft ,timer所在的容器
         * @param {object} father 指向S.Calendar实例的指针，需要共享父框的参数
         */
        TimeSelector: function(ft, father){
            //属性
            this.father = father;
            this.fcon = ft.parent('div.box');
            this.popupannel = $('div.selectime', this.fcon);//点选时间的弹出层
            if (typeof father._time == 'undefined') {//确保初始值和当前时间一致
                father._time = father.options.date;
            }
            this.time = father._time;
            this.status = 's';//当前选择的状态，'h','m','s'依次判断更新哪个值
            this.ctime = $('<div>', {
                'class': 'time',
                html: '时间：<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><div class="cta"><button class="u"></button><button class="d"></button></div>'
            });
            this.button = $('<button>', {
                'class': 'ok',
                html: '确定'
            });
            this.clearBtn = $('<button>', {
                'class': 'clear',
                html: '清空'
            });
            //小时
            this.h_a = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
            //分钟
            this.m_a = ['00', '10', '20', '30', '40', '50'];
            //秒
            this.s_a = ['00', '10', '20', '30', '40', '50'];
            
            this._init(ft);
        }
    });
    $.extend($.ui.datepicker.TimeSelector.prototype, {
        //方法
        /**
         * 创建相应的容器html，值均包含在a中
         * 参数：要拼装的数组
         * 返回：拼好的innerHTML,结尾还要带一个关闭的a
         *
         */
        parseSubHtml: function(a){
            var in_str = '';
            for (var i = 0; i < a.length; i++) {
                in_str += '<a href="javascript:void(0);" class="item">' + a[i] + '</a>';
            }
            in_str += '<a href="javascript:void(0);" class="x">x</a>';
            return in_str;
        },
        /**
         * 显示selectime容器
         * 参数，构造好的innerHTML
         */
        showPopup: function(instr){
            var self = this;
            this.popupannel.html(instr);
            this.popupannel.removeClass('fd-hide');
            var status = self.status;
            $('span', self.ctime).removeClass('on');
            switch (status) {
                case 'h':
                    $('span.h', self.ctime).addClass('on');
                    break;
                case 'm':
                    $('span.m', self.ctime).addClass('on');
                    break;
                case 's':
                    $('span.s', self.ctime).addClass('on');
                    break;
            }
        },
        /**
         * 隐藏selectime容器
         */
        hidePopup: function(){
            this.popupannel.addClass('fd-hide');
        },
        /**
         * 不对其做更多的上下文假设，仅仅根据time显示出来
         */
        render: function(){
            var self = this;
            var h = self.get('h');
            var m = self.get('m');
            var s = self.get('s');
            self.father._time = self.time;
            $('span.h', self.ctime).html(h > 9 ? h : ('0' + h));
            $('span.m', self.ctime).html(m > 9 ? m : ('0' + m));
            $('span.s', self.ctime).html(s > 9 ? s : ('0' + s));
            return self;
        },
        //这里的set和get都只是对time的操作，并不对上下文做过多假设
        /**
         * set(status,v)
         * h:2
         */
        set: function(status, v){
            var self = this;
            v = Number(v);
            switch (status) {
                case 'h':
                    self.time.setHours(v);
                    break;
                case 'm':
                    self.time.setMinutes(v);
                    break;
                case 's':
                    self.time.setSeconds(v);
                    break;
            }
            self.render();
        },
        /**
         * get(status)
         */
        get: function(status){
            var self = this;
            var time = self.time;
            switch (status) {
                case 'h':
                    return time.getHours();
                case 'm':
                    return time.getMinutes();
                case 's':
                    return time.getSeconds();
            }
        },
        
        /**
         * add()
         * 状态值代表的变量增1
         */
        add: function(){
            var self = this;
            var status = self.status;
            var v = self.get(status);
            v++;
            self.set(status, v);
        },
        /**
         * minus()
         * 状态值代表的变量增1
         */
        minus: function(){
            var self = this;
            var status = self.status;
            var v = self.get(status);
            v--;
            self.set(status, v);
        },
        
        
        //构造
        _init: function(ft){
            var self = this;
            ft.html('').append(self.ctime);
            ft.append(self.button);
            ft.append(self.clearBtn);
            self.render();
            self.popupannel.bind('click.ui-datepicker-time', function(e){
                var el = $(e.target);
                if (el.hasClass('x')) {//关闭
                    self.hidePopup();
                }
                else if (el.hasClass('item')) {//点选一个值
                    var v = Number(el.html());
                    self.set(self.status, v);
                    self.hidePopup();
                }
            });
            //确定的动作
            self.button.bind('click.ui-datepicker-time', function(e){
                //初始化读取父框的date
                var father = self.father, o = father.options, d = typeof father.dt_selected == 'undefined' ? father.selected : father.dt_selected;
                d.setHours(self.get('h'));
                d.setMinutes(self.get('m'));
                d.setSeconds(self.get('s'));
                self.father._setOption('date', d)._trigger('timeSelect', e, {
                    date: d
                });
                
                if (o.popup && o.closable) {
                    self.father.hide(e);
                }
            });
            
            // 清空的动作 added on 2.27 陈屹
            self.clearBtn.bind('click.ui-datepicker-time', function(e){
                var father = self.father;
                
                father.clear();
                father.hide(e);
            });
            
            //ctime上的键盘事件，上下键，左右键的监听
            //TODO 考虑是否去掉
            self.ctime.bind('keyup.ui-datepicker-time', function(e){
                var KC = $.ui.keyCode;
                if (e.keyCode == KC.UP || e.keyCode == KC.LEFT) {//up or left
                    //e.stopPropagation();
                    e.preventDefault();
                    self.add();
                }
                if (e.keyCode == KC.DOWN || e.keyCode == KC.RIGHT) {//down or right
                    //e.stopPropagation();
                    e.preventDefault();
                    self.minus();
                }
            });
            //上的箭头动作
            $('button.u', self.ctime).bind('click.ui-datepicker-time', function(){
                self.hidePopup();
                self.add();
            });
            //下的箭头动作
            $('button.d', self.ctime).bind('click.ui-datepicker-time', function(){
                self.hidePopup();
                self.minus();
            });
            //弹出选择小时
            $('span.h', self.ctime).bind('click.ui-datepicker-time', function(){
                var in_str = self.parseSubHtml(self.h_a);
                self.status = 'h';
                self.showPopup(in_str);
            });
            //弹出选择分钟
            $('span.m', self.ctime).bind('click.ui-datepicker-time', function(){
                var in_str = self.parseSubHtml(self.m_a);
                self.status = 'm';
                self.showPopup(in_str);
            });
            //弹出选择秒
            $('span.s', self.ctime).bind('click.ui-datepicker-time', function(){
                var in_str = self.parseSubHtml(self.s_a);
                self.status = 's';
                self.showPopup(in_str);
            });
        }
    });
    $.add('ui-datepicker-time');
})(jQuery);
