/*
 * jQuery UI Datepicker @VERSION
 *
 * Depends:
 *	jquery.ui.core.js
 */
('datepicker' in jQuery.fn) ||
(function($, undefined){
    //popup:true时 缓存之前的实例和公用的picker
    var inst, datepicker;
    $.widget('ui.datepicker', {
        options: {
            date: new Date(),
            startDay: 0,
            pages: 1,
            closable: false,
            rangeSelect: false,
            minDate: false,
            maxDate: false,
            range: {
                start: null,
                end: null
            },
            navigator: true,
            popup: true,
            bgiframe: false,
            showTime: false,
            triggerType: 'click'
        },
        /**
         * 日历构造函数
         * @method 	_init
         * @param { string }	selector
         * @param { string }	config
         * @private
         */
        _create: function(){
            var self = this, o = self.options, elem = this.element;
            
            
            if (o.popup) {
                self.activator = elem;
                self._buildEvent();
            }
            else {
                self.render();
            }
            
            
            return self;
        },
        _destroy: function(){
            this.hide(null, true);
        },
        
        render: function(){
            var self = this, o = self.options, elem = this.element, i, _prev, _next, _oym;
            if (!self.con) {
                if (o.popup) {
                    //popup:true下 共用一个日历元素，避免出现多个日历共存的情况
                    if (inst && inst !== self) {
                        inst.hide(null, true);
                    }
                    inst = self;
                    self.con = (datepicker ||
                    (datepicker = $('<div>', {
                        css: {
                            'position': 'absolute',
                            'background': '#FFF',
                            'display': 'none'
                        }
                    }))).css('display', 'none').appendTo('body');
                }
                else {
                    self.con = elem;
                }
            }
            self._buildParam();
            self._handleDate();
            self.ca = [];
            
            self.con.addClass('ui-datepicker fd-clr ui-datepicker-multi' + o.pages).empty();
            
            if (o.bgiframe) {
                self.con.bgiframe();
            }
            
            for (i = 0, _oym = [self.year, self.month]; i < o.pages; i++) {
                if (i === 0) {
                    _prev = true;
                }
                else {
                    _prev = false;
                    _oym = self._computeNextMonth(_oym);
                }
                _next = i == (o.pages - 1);
                self.ca.push(new $.ui.datepicker.Page({
                    year: _oym[0],
                    month: _oym[1],
                    prevArrow: _prev,
                    nextArrow: _next,
                    showTime: o.showTime
                }, self));
                
                
                self.ca[i].render();
            }
            
            return self;
            
        },
        /**
         * 创建日历外框的事件
         * @method _buildEvent
         * @private
         */
        _buildEvent: function(){
            var self = this, o = self.options;
            //点击触点
            self.activator.bind(o.triggerType + '.ui-datepicker', function(e){
                e.preventDefault();
                if (e.type === 'focus') {
                    self.show(e);
                }
                else {
                    self.toggle(e);
                }
            });
            return self;
        },
        /**
         * 改变日历是否显示的状态
         * @mathod toggle
         */
        toggle: function(e){
            var self = this;
            if (self.con) {
                self.hide(e);
            }
            else {
                self.show(e);
            }
        },
        /**
         * 显示日历
         * @method show
         */
        show: function(e){
            //noformat
            var self = this;
			if (self.con){
				return;
			}
			if(!self._trigger('beforeShow',e)){
				return;
			}
			self.render();
			var o = self.options,
            	offset = self.activator.offset(),
				_x = offset.left, 
				height = self.activator.outerHeight(), 
				_y = offset.top + height;
			//format
            self.con.css({
                left: _x,
                top: _y
            }).fadeIn(150, function(){
                if (o.popup) {
                    //noformat
                    $(document)
    				.unbind('click.ui-datepicker')
    				.bind('click.ui-datepicker', function(e){
                        //TODO e.target是裸的节点，这句不得不加，虽然在逻辑上并无特殊语义
                        var target = $(e.target);
                        //点在激活节点上
                        if (target[0] === self.activator[0]) {
                            return;
                        }
                        self.hide(e);
                    });
    				//format
                    self.con.bind('click.ui-datepicker', function(e){
                        e.stopPropagation();
                    });
                }
                
            });
            
            return self;
        },
        
        /**
         * 隐藏日历
         * @method hide
         */
        hide: function(e, fast){
            var self = this;
            if (!self.con) {
                return;
            }
            var o = self.options;
            if (o.popup) {
                $(document).unbind('click.ui-datepicker');
            }
            function handler(){
                self.con.remove();
                $.extend(self, {
                    con: null,
                    ca: []
                });
            }
            if (fast) {
                handler();
            }
            else {
                self.con.fadeOut(150, handler);
            }
            return self;
        },
        setOption: function(key, value){
            var self = this, o = self.options;
            switch (key) {
                case 'startDay':
                    o.startDay = (7 - o.startDay) % 7;
                    break;
                default:
                    self._setOption(key, value);
                    break;
            }
            
        },
        /**
         * 创建参数列表
         * @method _buildParam
         * @private
         */
        _buildParam: function(){
            var self = this, o = self.options;
            
            if (o.minDate && o.date < o.minDate) {
                o.date.setFullYear(o.minDate.getFullYear());
                o.date.setMonth(o.minDate.getMonth());
                o.date.setDate(o.minDate.getDate());
            }
            if (o.maxDate && o.date > o.maxDate) {
                o.date.setFullYear(o.maxDate.getFullYear());
                o.date.setMonth(o.maxDate.getMonth());
                o.date.setDate(o.maxDate.getDate());
            }
            
            self.selected = o.selected || o.date;
            
            if (o.startDay) {
                self.startDay = (7 - o.startDay) % 7;
            }
            
            return self;
        },
        /**
         * 处理日期
         * @method _handleDate
         * @private
         */
        _handleDate: function(){
            var self = this, date = self.options.date;
            self.weekday = date.getDay() + 1;//星期几 //指定日期是星期几
            self.day = date.getDate();//几号
            self.month = date.getMonth();//月份
            self.year = date.getFullYear();//年份
            return self;
        },
        
        //get标题
        _getHeadStr: function(year, month){
            return year.toString() + '年' + (Number(month) + 1).toString() + '月';
        },
        
        //月加
        _monthAdd: function(){
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            }
            else {
                self.month++;
            }
            self.options.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/' + self.day.toString());
            return self;
        },
        
        //月减
        _monthMinus: function(){
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            }
            else {
                self.month--;
            }
            self.options.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/' + self.day.toString());
            return self;
        },
        
        //裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
        _computeNextMonth: function(a){
            var _year = a[0], _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            }
            else {
                _month++;
            }
            return [_year, _month];
        },
        
        //处理日期的偏移量
        _handleOffset: function(){
            var self = this, o = self.options, data = ['日', '一', '二', '三', '四', '五', '六'], temp = '<span>{day}</span>', offset = o.startDay, day_html = '', a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day: data[(i - offset + 7) % 7]
                };
            }
            $.each(a, function(i, item){
                day_html += $.util.substitute(temp, item);
            });
            
            return {
                day_html: day_html
            };
        },
        
        //处理起始日期,d:Date类型
        _handleRange: function(d){
            var self = this, o = self.options, t;
            if ((o.range.start === null && o.range.end === null) || (o.range.start !== null && o.range.end !== null)) {
                o.range.start = d;
                o.range.end = null;
                self.render();
            }
            else if (o.range.start !== null && o.range.end === null) {
                o.range.end = d;
                if (o.range.start.getTime() > o.range.end.getTime()) {
                    t = o.range.start;
                    o.range.start = o.range.end;
                    o.range.end = t;
                }
                self._trigger('rangeSelect', null, o.range);
                self.render();
            }
            return self;
        }
    });
    $.extend($.ui.datepicker, {
        Page: function(config, father){
            /**
             * 子日历构造器
             * @constructor S.Calendar.Page
             * @param {object} config ,参数列表，需要指定子日历所需的年月
             * @param {object} father,指向Y.Calendar实例的指针，需要共享父框的参数
             * @return 子日历的实例
             */
            //属性
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//时间选择的实例
            this.id = '';
            /*
             '<span>日</span>',
             '<span>一</span>',
             '<span>二</span>',
             '<span>三</span>',
             '<span>四</span>',
             '<span>五</span>',
             '<span>六</span>',
             */
            /*
             <a href="" class="ui-datepicker-null">1</a>
             <a href="" class="ui-datepicker-disabled">3</a>
             <a href="" class="ui-datepicker-selected">1</a>
             <a href="" class="ui-datepicker-today">1</a>
             <a href="">1</a>
             */
            this.html = ['<div class="box" id="{id}"><div class="hd"><a href="javascript:void(0);" class="prev {prev}"><</a><a href="javascript:void(0);" class="title">{title}</a><a href="javascript:void(0);" class="next {next}">></a></div><div class="bd"><div class="whd">', father._handleOffset().day_html, '</div><div class="dbd fd-clr">{ds}</div></div><div class="setime fd-hide"></div><div class="ft {showtime}"><div class="time">时间：00:00 &hearts;</div></div><div class="selectime fd-hide"></div></div>'].join("");
            this.nav_html = '<p>月<select value="{the_month}"><option class="m1" value="1">01</option><option class="m2" value="2">02</option><option class="m3" value="3">03</option><option class="m4" value="4">04</option><option class="m5" value="5">05</option><option class="m6" value="6">06</option><option class="m7" value="7">07</option><option class="m8" value="8">08</option><option class="m9" value="9">09</option><option class="m10" value="10">10</option><option class="m11" value="11">11</option><option class="m12" value="12">12</option></select></p><p>年<input type="text" value="{the_year}" onfocus="this.select()"/></p><p><button class="ok">确定</button><button class="cancel">取消</button></p>';
        }
    });
    $.extend($.ui.datepicker.Page.prototype, {
        /**
         * 常用的数据格式的验证
         */
        Verify: function(){
            var isDay = function(n){
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 1 || n > 31);
            }, isYear = function(n){
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 100 || n > 10000);
            }, isMonth = function(n){
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 1 || n > 12);
            };
            
            return {
                isDay: isDay,
                isYear: isYear,
                isMonth: isMonth
            };
        },
        /**
         * 渲染子日历的UI
         */
        _renderUI: function(){
            var cc = this, opts = cc.father.options, _o = {}, ft;
            cc.HTML = '';
            _o.prev = '';
            _o.next = '';
            _o.title = '';
            _o.ds = '';
            if (!cc.prevArrow) {
                _o.prev = 'fd-hide';
            }
            if (!cc.nextArrow) {
                _o.next = 'fd-hide';
            }
            if (!opts.showtime) {
                _o.showtime = 'fd-hide';
            }
            _o.id = cc.id = 'ui-datepiker-' + $.guid++;
            _o.title = cc.father._getHeadStr(cc.year, cc.month);
            cc.createDS();
            _o.ds = cc.ds;
            cc.father.con.append($.util.substitute(cc.html, _o));
            cc.node = $('#' + cc.id);
            if (opts.showTime) {
                ft = $('div.ft', cc.node);
                ft.removeClass('fd-hide');
                cc.timmer = new $.ui.datepicker.TimeSelector(ft, cc.father);
            }
            return this;
        },
        /**
         * 创建子日历的事件
         */
        _buildEvent: function(){
            var cc = this, i, con = $('#' + cc.id);
            $('div,a,input', con).unbind('.ui-datepicker');
            $('div.dbd', con).bind('mousedown.ui-datepicker', function(e){
                //e.preventDefault();
                var target = $(e.target);
                if (target.hasClass('null')) {
                    return;
                }
                if (target.hasClass('disabled')) {
                    return;
                }
                //如果当天是30日或者31日，设置2月份就会出问题
                var o = cc.father.options, selectedd = Number(target.html()), d = new Date('2011/01/01');
                d.setDate(selectedd);
                d.setYear(cc.year);
                d.setMonth(cc.month);
                //datetime的date
                o.date = o.dt_date = d;
                cc.father._trigger('select', e, {
                    date: d
                });
                
                if (o.popup && o.closable) {
                    cc.father.hide(e);
                }
                if (o.rangeSelect) {
                    cc.father._handleRange(d);
                }
                cc.father.selected = d;
                cc.father.render();
            });
            //向前
            $('a.prev', con).bind('click.ui-datepicker', function(e){
                e.preventDefault();
                cc.father._monthMinus().render();
                cc.father._trigger('monthChange', e, {
                    date: new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                });
                
            });
            //向后
            $('a.next', con).bind('click.ui-datepicker', function(e){
                e.preventDefault();
                cc.father._monthAdd().render();
                cc.father._trigger('monthChange', e, {
                    date: new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                });
            });
            if (cc.father.options.navigator) {
                $('a.title', con).bind('click.ui-datepicker', function(e){
                    try {
                        cc.timmer.hidePopup();
                        e.preventDefault();
                    } 
                    catch (exp) {
                    }
                    var target = $(e.target), setime_node = $('div.setime', con);
                    setime_node.empty();
                    var in_str = $.util.substitute(cc.nav_html, {
                        the_month: cc.month + 1,
                        the_year: cc.year
                    });
                    setime_node.html(in_str);
                    setime_node.removeClass('fd-hide');
                    $('input', con).bind('keydown.ui-datepicker', function(e){
                        var target = $(e.target);
                        if (e.keyCode === $.ui.keyCode.UP) {//up
                            target.val(Number(target.val()) + 1);
                            target[0].select();
                        }
                        if (e.keyCode === $.ui.keyCode.DOWN) {//down
                            target.val(Number(target.val()) - 1);
                            target[0].select();
                        }
                        if (e.keyCode === $.ui.keyCode.ENTER) {//enter
                            var _month = $('div.setime select', con).val(), _year = $('div.setime input', con).val();
                            $('div.setime', con).addClass('fd-hide');
                            if (!cc.Verify().isYear(_year)) {
                                return;
                            }
                            if (!cc.Verify().isMonth(_month)) {
                                return;
                            }
                            cc.father.render({
                                date: new Date(_year + '/' + _month + '/01')
                            });
                            cc.father._trigger('monthChange', e, {
                                date: new Date(_year + '/' + _month + '/01')
                            });
                        }
                    });
                });
                $('div.setime', con).bind('click.ui-datepicker', function(e){
                    e.preventDefault();
                    var target = $(e.target);
                    if (target.hasClass('ok')) {
                        var _month = $('div.setime select', con).val(), _year = $('div.setime input', con).val();
                        $('div.setime', con).addClass('fd-hide');
                        if (!cc.Verify().isYear(_year)) {
                            return;
                        }
                        if (!cc.Verify().isMonth(_month)) {
                            return;
                        }
                        var o = cc.father.options;
                        o.date = new Date(_year + '/' + _month + '/01');
                        cc.father.render();
                        cc.father._trigger('monthChange', e, {
                            date: new Date(_year + '/' + _month + '/01')
                        });
                    }
                    else if (target.hasClass('cancel')) {
                        $('div.setime', con).addClass('fd-hide');
                    }
                });
            }
            return cc;
        },
        /**
         * 得到当前子日历的node引用
         */
        _getNode: function(){
            var cc = this;
            return cc.node;
        },
        /**
         * 得到某月有多少天,需要给定年来判断闰年
         */
        _getNumOfDays: function(year, month){
            return 32 - new Date(year, month - 1, 32).getDate();
        },
        /**
         * 生成日期的html
         */
        createDS: function(){
            //noformat
            var cc = this, 
				opts = cc.father.options,
				s = '', 
				startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + opts.startDay + 7) % 7,//当月第一天是星期几
 				k = cc._getNumOfDays(cc.year, cc.month + 1) + startweekday, 
				i, 
				_td_s;
			//format
            
            for (i = 0; i < k; i++) {
                //prepare data {{
                if ($.browser.webkit && /532/.test($.browser.version)) {//hack for chrome
                    _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                }
                else {
                    _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 2 - startweekday).toString());
                }
                var _td_e = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                //prepare data }}
                if (i < startweekday) {//null
                    s += '<a href="javascript:void(0);" class="null">0</a>';
                }
                else if (opts.minDate instanceof Date &&
                new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 2 - startweekday)).getTime() < (opts.minDate.getTime() + 1)) {//disabled
                    s += '<a href="javascript:void(0);" class="disabled">' + (i - startweekday + 1) + '</a>';
                    
                }
                else if (opts.maxDate instanceof Date &&
                new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() > opts.maxDate.getTime()) {//disabled
                    s += '<a href="javascript:void(0);" class="disabled">' + (i - startweekday + 1) + '</a>';
                    
                    
                }
                else if ((opts.range.start !== null && opts.range.end !== null) && //日期选择范围
                (_td_s.getTime() >= opts.range.start.getTime() && _td_e.getTime() < opts.range.end.getTime())) {
                
                    if (i == (startweekday + (new Date()).getDate() - 1) &&
                    (new Date()).getFullYear() == cc.year &&
                    (new Date()).getMonth() == cc.month) {//今天并被选择
                        s += '<a href="javascript:void(0);" class="range today">' + (i - startweekday + 1) + '</a>';
                    }
                    else {
                        s += '<a href="javascript:void(0);" class="range">' + (i - startweekday + 1) + '</a>';
                    }
                    
                }
                else if (i == (startweekday + (new Date()).getDate() - 1) &&
                (new Date()).getFullYear() == cc.year &&
                (new Date()).getMonth() == cc.month) {//today
                    s += '<a href="javascript:void(0);" class="today">' + (i - startweekday + 1) + '</a>';
                    
                }
                else if (i == (startweekday + cc.father.selected.getDate() - 1) &&
                cc.month == cc.father.selected.getMonth() &&
                cc.year == cc.father.selected.getFullYear()) {//selected
                    s += '<a href="javascript:void(0);" class="selected">' + (i - startweekday + 1) + '</a>';
                }
                else {//other
                    s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                }
            }
            if (k % 7 !== 0) {
                for (i = 0; i < (7 - k % 7); i++) {
                    s += '<a href="javascript:void(0);" class="null">0</a>';
                }
            }
            cc.ds = s;
            return this;
        },
        /**
         * 渲染
         */
        render: function(){
            var self = this;
            self._renderUI();
            self._buildEvent();
            return self;
        }
    });
    $.add('ui-datepicker');
})(jQuery);
