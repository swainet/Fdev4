/*
 * jQuery UI Progressbar 1.8.16
 *
 *
 * Depends:
 *   jquery.ui.core.js
 * @update 2011.11.04 修复了进度为0时的样式上的BUG ---- Denis
 */
('progressbar' in jQuery.fn) ||
(function($, undefined){

    $.widget("ui.progressbar", {
        options: {
            value: 0,
            max: 100
        },
        
        min: 0,
        
        _create: function(){
            this.element.addClass("ui-progressbar").attr({
                role: "progressbar",
                "aria-valuemin": this.min,
                "aria-valuemax": this.options.max,
                "aria-valuenow": this._value()
            });
            
            this.valueDiv = $("<div class='ui-progressbar-value'></div>").appendTo(this.element);
            
            this.oldValue = this._value();
            this._refreshValue();
        },
        
        destroy: function(){
            this.element.removeClass("ui-progressbar").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");
            
            this.valueDiv.remove();
            
            $.Widget.prototype.destroy.apply(this, arguments);
        },
        
        value: function(newValue){
            if (newValue === undefined) {
                return this._value();
            }
            
            this._setOption("value", newValue);
            return this;
        },
        
        _setOption: function(key, value){
            if (key === "value") {
                this.options.value = value;
                this._refreshValue();
                if (this._value() === this.options.max) {
                    this._trigger("complete");
                }
            }
            
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        
        _value: function(){
            var val = this.options.value;
            // normalize invalid value
            if (typeof val !== "number") {
                val = 0;
            }
            return Math.min(this.options.max, Math.max(this.min, val));
        },
        
        _percentage: function(){
            return 100 * this._value() / this.options.max;
        },
        
        _refreshValue: function(){
            var value = this.value();
            var percentage = this._percentage();
            
            if (this.oldValue !== value) {
                this.oldValue = value;
                this._trigger("change");
            }
            
            this.valueDiv.toggle( value > this.min ).width(percentage.toFixed(0) + "%");
            this.element.attr("aria-valuenow", value);
        }
    });
    $.add('ui-progressbar');
})(jQuery);
