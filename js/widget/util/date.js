/*
 * Date prototype extensions. Doesn't depend on any
 * other code. Doens't overwrite existing methods.
 *
 * Adds dayNames, abbrDayNames, monthNames and abbrMonthNames static properties and isLeapYear,
 * isWeekend, isWeekDay, getDaysInMonth, getDayName, getMonthName, getDayOfYear, getWeekOfYear,
 * setDayOfYear, addYears, addMonths, addDays, addHours, addMinutes, addSeconds methods
 *
 * Additional methods and properties added by Kelvin Luck: firstDayOfWeek, dateFormat, zeroTime, asString, fromString -
 * I've added my name to these methods so you know who to blame if they are broken!
 * @version 1.1 修复了parseDate方法的实现方式，解决一个月底触发的BUG ---- Denis
 * @version 1.2 扩展了date静态方法到jQuery.util.date，并且在原型中进行引用 ---- zhangfan
 */
('parseDate' in Date) ||
(function($){

    /**
     * An Array of month names starting with Janurary.
     *
     * @example monthNames[0]
     * @result 'January'
     *
     * @name monthNames
     * @type Array
     * @cat Plugins/Methods/Date
     */
    Date.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    /**
     * An Array of abbreviated month names starting with Jan.
     *
     * @example abbrMonthNames[0]
     * @result 'Jan'
     *
     * @name monthNames
     * @type Array
     * @cat Plugins/Methods/Date
     */
    Date.abbrMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    
    /**
     * The format that string dates should be represented as (e.g. 'dd/MM/yyyy', 'MM/dd/yyyy').
     *
     * @name format
     * @type String
     * @cat Plugins/Methods/Date
     * @author Kelvin Luck
     */
    //Date.format = 'dd/MM/yyyy';
    //Date.format = 'MM/dd/yyyy';
    Date.format = 'yyyy-MM-dd';
    //Date.format = 'dd MMM yy';
    
    
    // utility method
    function zeroPad(num){
        var s = '0' + num;
        return s.substring(s.length - 2)
        //return ('0'+num).substring(-2); // doesn't work on IE :(
    }
    
    $.extendIf(Date.prototype, {
        /**
         * format
         * @param {Object} format
         */
        format: function(format){
            var r = format || Date.format;
            //noformat
            return r.split('yyyy').join(this.getFullYear())
					.split('yy').join((this.getFullYear() + '').substring(2))            
					//.split('MMMM').join(this.getMonthName(false))
            		//.split('MMM').join(this.getMonthName(true))
            		.split('MM').join(zeroPad(this.getMonth() + 1))
					.split('dd').join(zeroPad(this.getDate()))
					.split('hh').join(zeroPad(this.getHours()))
					.split('mm').join(zeroPad(this.getMinutes()))
					.split('ss').join(zeroPad(this.getSeconds()));
			//format
        }
    });
    
    /**
     * parseDate
     * @param {Object} s
     * @param {Object} format
     */
    Date.parseDate = function(s, format){
        if (!s.trim()) {
            return false;
        }
        //noformat
        var f = format || Date.format, 
			d = new Date(1970, 0, 1), //使用这个时间作为基础时间
			iY = f.indexOf('yyyy'),
			iy = f.indexOf('yy'),
			iM = f.indexOf('MM'),
			iD = f.indexOf('dd'),
			iH = f.indexOf('hh'),
			im = f.indexOf('mm'),
			iS = f.indexOf('ss');
        //format
        
        
        if (iY > -1) {
            d.setFullYear(Number(s.substr(iY, 4)));
        }
        else if (iy > -1) {
            d.setFullYear(Number((d.getFullYear() + '').substr(0, 2) + s.substr(iy, 2)));
        }
        iM > -1 && d.setMonth(Number(s.substr(iM, 2)) - 1);
        iD > -1 && d.setDate(Number(s.substr(iD, 2)));
        iH > -1 && d.setHours(Number(s.substr(iH, 2)));
        im > -1 && d.setMinutes(Number(s.substr(im, 2)));
        iS > -1 && d.setSeconds(Number(s.substr(iS, 2)));
        if (isNaN(d.getTime())) {
            return false;
        }
        return d;
    };

    $.namespace('jQuery.util.date');

    $.extendIf($.util.date,{
        /**
         * 比较两个日期的数值差
         * @param {Date} oDate1
         * @param {Date} oDate2
         * @return {Int} 两个日期的毫秒差值
         */
        compare: function(oDate1, oDate2){
            if(!oDate1 || !oDate2) return null;
            var o1 = (typeof oDate1 == 'string')?this.toDate(oDate1):oDate1;
            var o2 = (typeof oDate2 == 'string')?this.toDate(oDate2):oDate2;
            return o1 - o2;
        },
        /**
         * 重置当前日期为当日的00:00:00
         * @param {Date} oDate1
         * @return {Date}
         */
        clearTime:function(date){
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        },
        /**
         * 创建当前日期的拷贝
         * @param {Date|String} date
         * @return {Date}
         */
        clone:function(date){
            return new Date(date.getTime());
        },
        /**
         * 获取今天，时间为00:00:00
         * @return {Date} date
         * @return {Date}
         */
        today:function(){
            return this.clearTime(new Date());
        },
        /**
         * 获取当前的date
         * @return {Date} date
         * @return {Date}
         */
        now:function(){
            return new Date();
        },
        /**
         * 判断是否为闰年
         * @return {Date} date
         * @return {Boolean}
         */
        isLeapYear : function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        /**
         * 获取某月的天数
         * @return {Date} date
         * @return {Int}
         */
        getDaysInMonth:function (year, month) {
            return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        /**
         * 解析日期，包括日期的运算
         * @return {Date} 第一个参数可以为date或者string，若为string则第一个参数作为日期运算的表达式
         * @param {String} 运算的字符串
         * @return {Date}
         * FormatSpecifiers :
         *	Format 			Description
         *	Y				年
         *	M				月
         *	D				日
         *	W				周
         *	h				小时
         *	m				分钟
         *	s				秒
         *	today			今天
         *	now				当前日期和时间
         * -------------------------------
         * ex. :
         * 	jQuery.util.date.parse('2011-01-08');
         * 	jQuery.util.date.parse('2011-01-08 9:18:22 - 1M');
         * 	jQuery.util.date.parse(' 2011/4/2 - 2.2h ');
         * 	jQuery.util.date.parse('today - 1D ');
         * 	jQuery.util.date.parse('now + 1Y');
         * 	jQuery.util.date.parse(new Date());
         * 	jQuery.util.date.parse(new Date(),'+1W');
         */
        parse:function(date,s){
            if(typeof date === 'string'){
                s = date;
            }else if(!s){
                return date;
            }
            s = s.replace(/^\s+|\s+$/g, '');
            var self =this;
            var dateRep = /(?:((?:(today|now)|(?:^(\d{4})[-\/](0?[1-9]|1[0-2])[-\/]([0-2][0-9]|3[01]|[0-9])))\s*(?:(?:([01][0-9]|2[0-3]|[0-9])(?:[:]([0-5]?\d))?(?:[:](\d+))?)?)?)?\s*(?:([+-])\s*(\d|\d*.?\d+)\s*([smhDWMY])$)?)?/;
            var delInitioZero = function(v){
                if(typeof v === 'string'){
                    return  v.replace(/^0/,"")-0;
                }
                return v;
            };
            var execute = function(date,op,value,mark){
                value = (op==='+')?value:(0-value);
                switch(mark){
                    case 'Y' :
                        return self.addYears(date,value);
                    break;
                    case 'M' :
                        return self.addMonths(date,value);
                    break;
                    case 'W':
                        return self.addWeeks(date,value);
                    break;
                    case 'D' :
                        return self.addDays(date,value);
                    break;
                    case 'h' :
                        return self.addHours(date,value);
                    break;
                    case 'm' :
                        return self.addMinutes(date,value);
                    break;
                    case 's' :
                        return self.addSeconds(date,value);
                    break;
                }
            };
            var temp = dateRep.exec(s),result = [];
            if(!dateRep.test(s) || ($type(date)!=='date'&& !temp[1])){
                throw new Error('Format error!');
            }
            $.each(temp ,function(i,item){
                if(item===undefined){
                    item = null;
                }else if(i > 3 && i<9){
                    item = delInitioZero(item);
                }
                result.push(item);
            });
            var _sdate = result[2],
                _Y = result[3],
                _M = result[4]?(result[4]-1):null,
                _D = result[5],
                _h = result[6],
                _m = result[7],
                _s = result[8],
                _op = result[9],
                _value = result[10],
                _mark = result[11];
            if(result[1]){
                if(_sdate){
                    var d = null;
                    switch(_sdate){
                        case 'now':
                            d = this.now();
                        break;
                        case 'today':
                            d = this.today();
                        break;
                    }
                    return execute(d,_op,_value,_mark);
                }else if(_op){
                    return execute(new Date(_Y,_M,_D,_h,_m,_s),_op,_value,_mark);
                }else{
                    return new Date(_Y,_M,_D,_h,_m,_s);
                }
            }else{
                return execute(date,_op,_value,_mark);
            }

        },
        /**
         * 为某日期添加或减少n毫秒
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addMs : function (date,value) {
            date.setMilliseconds(date.getMilliseconds() + value);
            return date;
        },
        /**
         * 为某日期添加或减少n秒
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addSeconds:function(date,value){
             return this.addMs(date,value * 1000);
        },
        /**
         * 为某日期添加或减少n分钟
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addMinutes:function(date,value){
            return this.addMs(date,value * 60000);
        },
        /**
         * 为某日期添加或减少n小时
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addHours:function(date,value){
            return this.addMs(date,value * 3600000);
        },
        /**
         * 为某日期添加或减少n天
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addDays : function (date,value) {
            return this.addMs(date,value * 86400000);
        },
        /**
         * 为某日期添加或减少n周
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addWeeks :function(date,value){
           return this.addMs(date,value * 604800000);
        },
        /**
         * 为某日期添加或减少n月
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addMonths:function(date,value){
            var n = date.getDate();
            date.setDate(1);
            date.setMonth(date.getMonth() + value);
            date.setDate(Math.min(n, this.getDaysInMonth(date.getFullYear(), date.getMonth())));
            return date;
        },
        /**
         * 为某日期添加或减少n年
         * @return {Date} date
         * @param {Int|Float|} number
         * @return {Date}
         */
        addYears:function(date,value){
            return this.addMonths(date,value * 12);
        },
        /**
         * 获取某日所在周的所有日期
         * @return {Date} date
         * @return {Array} 该周日期的date数组
         */
        getWeekDays:function(date){
            var index = date.getDay(),
                i = 1;l = 7,days = [];
            for(;i<=l;i++){
                days.push(this.addDays(this.clone(date),i-index));
            }
            return days;
        },
        /**
         * 判断某日是否为工作日
         * @return {Date} date
         * @return {Boolean}
         */
        isWeekday : function (date) {
            return date.getDay()<6;
        },
        /**
         * 判断某日是否在另一天之前
         * @return {Date} 需要判断的日期
         * @return {Date} 对比的目标日期
         * @return {Boolean}
         */
        isBefore:function(date,target){
            return date.getTime()>target.getTime()
        },
        /**
         * 判断某日是否在另一天之后
         * @return {Date} 需要判断的日期
         * @return {Date} 对比的目标日期
         * @return {Boolean}
         */
        isAfter :function(date,target){
            return date.getTime()<target.getTime()
        },
        /**
         * 判断两个日期是否相等
         * @return {Date} 日期1
         * @return {Date} 日期2
         * @return {Boolean}
         */
        isEquals:function(date1,date2){
            return  date1.getTime() === date2.getTime()
        },
        /**
         * 判断某个日期是否在一个或多个日期区间范围内
         * @return {Date} date
         * @return {Date} 日期区间,该参数可以是一个数组，或多个区间的2维数组，如['2001-9-25','2011-8-20'],数组的第一个值为开始日期，第二个值为结束日期，值可以为date对象或者YYYY-MM-DD格式的字符串
         * @return {Boolean}
         */
        hasDate :function(date,range){
            var self = this,
                isBetween = function(date,start,end){
                    var t = date.getTime();
                    start =  start.getTime();
                    if(end){
                        end = end.getTime();
                    }else{
                        return t === start;
                    }
                    return t >= start && t <= end;
                };
            if(Object.prototype.toString.apply(range[0]) === '[object Array]'){
                var i = 0,l = range.length;
                for(;i<l;i++){
                    if(isBetween(date,range[i][0],range[i][1])){
                        return true;
                    }
                }
                return false;
            }else{
                return isBetween(date,range[0],range[1]);
            }
        }
    });
    $.extendIf( Date.prototype, $.methodize( $.util.date, null,['isLeapYear','now' ,'today,getDaysInMonth'] ));
    $.add('util-date');
})(jQuery);
