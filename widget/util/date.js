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
 *
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
        //noformat
        var f = format || Date.format, 
			now = new Date(),
			d = new Date(now.getFullYear(), now.getMonth(), now.getDate()), 
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
    
    $.add('util-date');
})(jQuery);
