/**
 * jQuery UI Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 * @version 1.1 BUG Fixed ---- Denis
 * @version 1.2 修复多次render的BUG ---- 魏琪君
 * @update 2012.02.28 提供清空输入框的方法 --- 陈屹
 */
('datepicker' in jQuery.fn) ||
(function($, undefined) {
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
            shim: false,
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
        _create: function() {
            var self = this, o = self.options, elem = this.element;
            
            o.shim = o.shim || o.bgiframe;
            if (o.popup) {
                self.activator = elem;
                self._buildEvent();
            } else {
                self.render();
            }
            
            
            return self;
        },
        _destroy: function() {
            this.hide(null);
        },
        
        render: function() {
            var self = this, o = self.options, elem = this.element, i, _prev, _next, _oym;
            if (!self.con) {
                if (o.popup) {
                    //popup:true下 共用一个日历元素，避免出现多个日历共存的情况
                    if (inst && inst !== self) {
                        inst.hide(null);
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
                } else {
                    self.con = elem;
                }
            }
            self._buildParam();
            self._handleDate();
            self.ca = [];
            
            self.con.addClass('ui-datepicker fd-clr ui-datepicker-multi' + o.pages).empty();
            
            if (o.shim) {
                self.con.bgiframe();
            }
            
            for (i = 0, _oym = [self.year, self.month]; i < o.pages; i++) {
                if (i === 0) {
                    _prev = true;
                } else {
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
        _buildEvent: function() {
            var self = this, o = self.options;
            //点击触点
            self.activator.bind(o.triggerType + '.ui-datepicker', function(e) {
                e.preventDefault();
                if (e.type === 'focus') {
                    self.show(e);
                } else {
                    self.toggle(e);
                }
            });
            return self;
        },
        /**
         * 改变日历是否显示的状态
         * @mathod toggle
         */
        toggle: function(e) {
            var self = this;
            if (self.con) {
                self.hide(e);
            } else {
                self.show(e);
            }
        },
        /**
         * 显示日历
         * @method show
         */
        show: function(e) {
            //noformat
            var self = this;
			if (self.con){
				return;
			}
			if(!self._trigger('beforeShow',e)){
				return;
			}
            if (self.selected) {
                self.year = self.selected.getFullYear();
                self.month = self.selected.getMonth();
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
            }).fadeIn(150, function() {
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
                    self.con.bind('click.ui-datepicker', function(e) {
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
        hide: function(e) {
            var self = this;
            if (!self.con) {
                return;
            }
            var o = self.options;
            if (o.popup) {
                $(document).unbind('click.ui-datepicker');
            }
            function handler() {
                self.con.remove();
                $.extend(self, {
                    con: null,
                    ca: []
                });
            }
            handler();
            return self;
        },
        setOption: function(key, value) {
            var self = this, o = self.options;
            switch (key) {
                case 'startDay':
                    self.startDay = (7 - o.startDay) % 7;
                    break;
                default:
                    self._setOption(key, value);
                    break;
            }
            
        },
        /**
         * 清空输入框
         */
        clear: function(){
            this.element.val('');
        },
        /**
         * 创建参数列表
         * @method _buildParam
         * @private
         */
        _buildParam: function() {
            var self = this, o = self.options;
            /*
             * 保存正确的选中日期
             */
            self.selected = self.selected || o.selected || o.date;
            if (o.minDate && self.selected < o.minDate) {
                self.selected = o.minDate;
            }
            if (o.maxDate && self.selected > o.maxDate) {
                self.selected = o.maxDate;
            }
            //保存一周的开始星期
            if (o.startDay !== undefined) {
                self.startDay = (7 - o.startDay) % 7;
            }
            
            //range
            self.rangeStart = self.rangeStart || o.range.start;
            self.rangeEnd = self.rangeEnd || o.range.end;
            
            return self;
        },
        /**
         * 处理日历当期显示的月份
         * @method _handleDate
         * @private
         */
        _handleDate: function() {
            var self = this, date = self.options.date;
            if (!self.year) {
                self.weekday = date.getDay() + 1;//星期几 //指定日期是星期几
                //self.day = date.getDate();//几号
                self.month = date.getMonth();//月份
                self.year = date.getFullYear();//年份
            }
            return self;
        },
        
        //get标题
        _getHeadStr: function(year, month) {
            return year.toString() + '年' + (Number(month) + 1).toString() + '月';
        },
        
        //月加
        _monthAdd: function() {
            var self = this, d;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            } else {
                self.month++;
            }
            return self;
        },
        
        //月减
        _monthMinus: function() {
            var self = this, d;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            } else {
                self.month--;
            }
            return self;
        },
        
        //裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
        _computeNextMonth: function(a) {
            var _year = a[0], _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
            return [_year, _month];
        },
        
        //处理日期的偏移量
        _handleOffset: function() {
            var self = this, o = self.options, data = ['日', '一', '二', '三', '四', '五', '六'], temp = '<span>{day}</span>', offset = self.startDay, day_html = '', a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day: data[(i - offset + 7) % 7]
                };
            }
            $.each(a, function(i, item) {
                day_html += $.util.substitute(temp, item);
            });
            
            return {
                day_html: day_html
            };
        },
        
        //处理起始日期,d:Date类型
        _handleRange: function(d) {
            var self = this, o = self.options, t;
            if ((self.rangeStart === null && self.rangeEnd === null) || (self.rangeStart !== null && self.rangeEnd !== null)) {
                self.rangeStart = d;
                self.rangeEnd = null;
            } else 
                if (self.rangeStart !== null && self.rangeEnd === null) {
                    self.rangeEnd = d;
                    if (self.rangeStart.getTime() > self.rangeEnd.getTime()) {
                        t = self.rangeStart;
                        self.rangeStart = self.rangeEnd;
                        self.rangeEnd = t;
                    }
                    self._trigger('rangeSelect', null, {
                        start: self.rangeStart,
                        end: self.rangeEnd
                    });
                }
            return self;
        }
    });
    $.extend($.ui.datepicker, {
        Page: function(config, father) {
            /**
             * 子日历构造器
             * @constructor S.Calendar.Page
             * @param {object} config ,参数列表，需要指定子日历所需的年月
             * @param {object} father,指向Y.Calendar实例的指针，需要共享父框的参数
             * @return 子日历的实例
             */
            //属性
            this.father = father;
            this.month = config.month;
            this.year = config.year;
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
            this.html = ['<div class="box" id="{id}"><div class="hd"><a href="javascript:void(0);" class="prev {prev}"><</a><a href="javascript:void(0);" class="title">{title}</a><a href="javascript:void(0);" class="next {next}">></a></div><div class="bd"><div class="whd">', father._handleOffset().day_html, '</div><div class="dbd fd-clr">{ds}</div></div><div class="setime fd-hide"></div><div class="ft {showTime}"><div class="time">时间：00:00 &hearts;</div></div><div class="selectime fd-hide"></div></div>'].join("");
            this.nav_html = '<p>月<select value="{the_month}"><option class="m1" value="1">01</option><option class="m2" value="2">02</option><option class="m3" value="3">03</option><option class="m4" value="4">04</option><option class="m5" value="5">05</option><option class="m6" value="6">06</option><option class="m7" value="7">07</option><option class="m8" value="8">08</option><option class="m9" value="9">09</option><option class="m10" value="10">10</option><option class="m11" value="11">11</option><option class="m12" value="12">12</option></select></p><p>年<input type="text" value="{the_year}" onfocus="this.select()"/></p><p><button class="ok">确定</button><button class="cancel">取消</button></p>';
        }
    });
    $.extend($.ui.datepicker.Page.prototype, {
        /**
         * 常用的数据格式的验证
         */
        Verify: function() {
            var isDay = function(n) {
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 1 || n > 31);
            }, isYear = function(n) {
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 100 || n > 10000);
            }, isMonth = function(n) {
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
        _renderUI: function() {
            var self = this, father = self.father, o = father.options, _o = {}, ft;
            self.HTML = '';
            _o.prev = '';
            _o.next = '';
            _o.title = '';
            _o.ds = '';
            if (!self.prevArrow) {
                _o.prev = 'fd-hide';
            }
            if (!self.nextArrow) {
                _o.next = 'fd-hide';
            }
            if (!o.showTime) {
                _o.showTime = 'fd-hide';
            }
            _o.id = self.id = 'ui-datepiker-' + $.guid++;
            _o.title = father._getHeadStr(self.year, self.month);
            self.createDS();
            _o.ds = self.ds;
            father.con.append($.util.substitute(self.html, _o));
            self.node = $('#' + self.id);
            if (o.showTime) {
                ft = $('div.ft', self.node);
                ft.removeClass('fd-hide');
                self.timmer = new $.ui.datepicker.TimeSelector(ft, father);
            }
            return this;
        },
        /**
         * 创建子日历的事件
         */
        _buildEvent: function() {
            var self = this, father = self.father, o = father.options, i, con = $('#' + self.id);
            $('div,a,input', con).unbind('.ui-datepicker');
            $('div.dbd', con).bind('mousedown.ui-datepicker', function(e) {
                //e.preventDefault();
                var target = $(e.target), d;
                if (target.hasClass('null')) {
                    return;
                }
                if (target.hasClass('disabled')) {
                    return;
                }
                //如果当天是30日或者31日，设置2月份就会出问题
                d = new Date(1970, 0, 1);
                d.setDate(target.html() * 1);
                d.setYear(self.year);
                d.setMonth(self.month);
                father.selected = father.dt_selected = d;
                father._trigger('select', e, {
                    date: d
                });
                
                if (o.popup && o.closable) {
                    father.hide(e);
                }
                if (o.rangeSelect) {
                    father._handleRange(d);
                }
                //father.render();
            });
            //向前
            $('a.prev', con).bind('click.ui-datepicker', function(e) {
                e.preventDefault();
                father._monthMinus().render();
                father._trigger('monthChange', e, {
                    date: new Date(father.year, father.month, 1)
                });
                
            });
            //向后
            $('a.next', con).bind('click.ui-datepicker', function(e) {
                e.preventDefault();
                father._monthAdd().render();
                father._trigger('monthChange', e, {
                    date: new Date(father.year, father.month, 1)
                });
            });
            if (o.navigator) {
                $('a.title', con).bind('click.ui-datepicker', function(e) {
					e.preventDefault();
                    try {
                        self.timmer.hidePopup();
                        e.preventDefault();
                    } catch (exp) {
                    }
                    var target = $(e.target), setime_node = $('div.setime', con);
                    setime_node.empty();
                    var in_str = $.util.substitute(self.nav_html, {
                        the_month: self.month + 1,
                        the_year: self.year
                    });
                    setime_node.html(in_str);
                    setime_node.removeClass('fd-hide');
                    $('input', con).bind('keydown.ui-datepicker', function(e) {
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
                            monthChangeHandler.call(this, e);
                        }
                    });
                });
                $('div.setime', con).bind('click.ui-datepicker', function(e) {
                    e.preventDefault();
                    var target = $(e.target);
                    if (target.hasClass('ok')) {
                        monthChangeHandler.call(this, e);
                    } else 
                        if (target.hasClass('cancel')) {
                            $('div.setime', con).addClass('fd-hide');
                        }
                });
                
                function monthChangeHandler(e) {
                    var month = $('div.setime select', con).val(), year = $('div.setime input', con).val(), d;
                    $(this).addClass('fd-hide');
                    if (!self.Verify().isYear(year)) {
                        return;
                    }
                    if (!self.Verify().isMonth(month)) {
                        return;
                    }
                    father.year = year * 1;
                    father.month = month * 1 - 1;
                    father.render();
                    father._trigger('monthChange', e, {
                        date: new Date(father.year, father.month, 1)
                    });
                }
            }
            return self;
        },
        /**
         * 得到当前子日历的node引用
         */
        _getNode: function() {
            var cc = this;
            return cc.node;
        },
        /**
         * 得到某月有多少天,需要给定年来判断闰年
         */
        _getNumOfDays: function(year, month) {
            return 32 - new Date(year, month - 1, 32).getDate();
        },
        /**
         * 生成日期的html
         */
        createDS: function() {
            //noformat
            var self = this, 
                father = self.father,
				o = self.father.options,
				s = '', 
				startweekday = (new Date(self.year, self.month, 1).getDay() + father.startDay + 7) % 7,//当月第一天是星期几
 				k = self._getNumOfDays(self.year, self.month + 1) + startweekday, 
				i, 
				_td_s;
			//format
            
            for (i = 0; i < k; i++) {
                //prepare data {{
                if ($.browser.webkit && /532/.test($.browser.version)) {//hack for chrome
                    _td_s = new Date(self.year, self.month, i + 1 - startweekday);
                } else {
                    _td_s = new Date(self.year, self.month, i + 2 - startweekday);
                }
                var _td_e = new Date(self.year, self.month, i + 1 - startweekday);
                //prepare data }}
                if (i < startweekday) {//null
                    s += '<a href="javascript:void(0);" class="null">0</a>';
                } else 
                    if (o.minDate instanceof Date &&
                    new Date(self.year, self.month, i + 2 - startweekday).getTime() < (o.minDate.getTime() + 1)) {//disabled
                        s += '<a href="javascript:void(0);" class="disabled">' + (i - startweekday + 1) + '</a>';
                        
                    } else 
                        if (o.maxDate instanceof Date &&
                        new Date(self.year, self.month, i + 1 - startweekday).getTime() > o.maxDate.getTime()) {//disabled
                            s += '<a href="javascript:void(0);" class="disabled">' + (i - startweekday + 1) + '</a>';
                            
                            
                        }                //日期选择范围
                        else 
                            if ((father.rangeStart && father.rangeEnd) && (_td_s.getTime() > father.rangeStart.getTime() && _td_e.getTime() <= father.rangeEnd.getTime())) {
                            
                                if (i == (startweekday + new Date().getDate() - 1) &&
                                new Date().getFullYear() == self.year &&
                                new Date().getMonth() == self.month) {//今天并被选择
                                    s += '<a href="javascript:void(0);" class="range today">' + (i - startweekday + 1) + '</a>';
                                } else {
                                    s += '<a href="javascript:void(0);" class="range">' + (i - startweekday + 1) + '</a>';
                                }
                                
                            } else 
                                if (i == (startweekday + new Date().getDate() - 1) &&
                                new Date().getFullYear() == self.year &&
                                new Date().getMonth() == self.month) {//today
                                    s += '<a href="javascript:void(0);" class="today">' + (i - startweekday + 1) + '</a>';
                                    
                                } else 
                                    if (i == (startweekday + self.father.selected.getDate() - 1) &&
                                    self.month == self.father.selected.getMonth() &&
                                    self.year == self.father.selected.getFullYear()) {//selected
                                        s += '<a href="javascript:void(0);" class="selected">' + (i - startweekday + 1) + '</a>';
                                    } else {//other
                                        s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                                    }
            }
            if (k % 7 !== 0) {
                for (i = 0; i < (7 - k % 7); i++) {
                    s += '<a href="javascript:void(0);" class="null">0</a>';
                }
            }
            self.ds = s;
            return this;
        },
        /**
         * 渲染
         */
        render: function() {
            var self = this;
            self._renderUI();
            self._buildEvent();
            return self;
        }
    });
    $.add('ui-datepicker');
})(jQuery);
