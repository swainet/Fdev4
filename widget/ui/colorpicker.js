/*
 * jQuery UI Colorpicker 1.0
 *
 * overwrite by Denis 2011.01.30
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
('colorpicker' in jQuery.fn) ||
(function($, undefined){
    var ie6 = $.util.ua.ie6;
    $.widget('ui.colorpicker', $.ui.mouse, {
        options: {
            popup: true,
            radius: 84,
            square: 100,
            width: 194,
            update: false,
            triggerType: 'click'
        },
        _create: function(){
            var self = this, o = self.options, elem = this.element;
            if (o.popup) {
                self.activator = elem;
            }
            else {
                self.render();
                self.setColor(o.color || '#000000');
            }
            self._buildEvent();
        },
        render: function(){
            var self = this, o = self.options, elem = this.element;
            if (o.popup) {
                self.con = $('<div>', {
                    'class': 'ui-colorpicker',
                    css: {
                        'position': 'absolute',
                        'background': '#FFF',
                        'display': 'none'
                    }
                }).appendTo('body');
            }
            else {
                self.con = elem.addClass('ui-colorpicker');
            }
            //重置element
            self.con.html('<div class="wrap">\
				<div class="board"></div>\
				<div class="wheel"></div>\
				<div class="overlay"></div>\
				<div class="h-marker marker"></div>\
				<div class="sl-marker marker">\
			</div></div>');
            
            self.element = self.wrap = $('>div.wrap', self.con);
            var children = self.wrap.children();
            self.board = $(children[0]);
            self.wheel = $(children[1]);
            self.hMarker = $(children[3]);
            self.slMarker = $(children[4]);
            // Dimensions
            
            // Fix background PNGs in IE6
            if (ie6) {
                children.each(function(){
                    if (this.currentStyle.backgroundImage != 'none') {
                        var image = this.currentStyle.backgroundImage;
                        image = this.currentStyle.backgroundImage.substring(5, image.length - 2);
                        $(this).css({
                            'backgroundImage': 'none',
                            'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
                        });
                    }
                });
            }
            //Initialize mouse events for interaction
            self._mouseInit();
        },
        _destroy: function(){
            this._mouseDestroy();
            this.hide(true);
        },
        _buildEvent: function(){
            var self = this, o = self.options;
            if (!o.popup) {
                return this;
            }
            //点击触点
            self.activator.bind(o.triggerType, function(e){
                e.preventDefault();
                self.show();
            });
            if (o.update) {
                self.activator.bind('keyup.ui-colorpicker', function(){
                    self.setColor(this.value);
                });
            }
            return self;
        },
        toggle: function(){
            var self = this;
            if (self.con) {
                self.hide();
            }
            else {
                self.show();
            }
        },
        /**
         * 显示拾色器
         * @method show
         */
        show: function(){
            //noformat
            var self = this;
			if (self.con){
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
    				.unbind('click.ui-colorpicker')
    				.bind('click.ui-colorpicker', function(e){
                        //点在激活节点上
                        if ($(e.target)[0] === self.activator[0]) {
                            return;
                        }
                        self.hide();
                    });
    				//format
                    self.con.bind('click.ui-colorpicker', function(e){
                        e.stopPropagation();
                    });
                }
            });
            
            self.setColor((o.update ? self.activator.val() : o.color) || '#000000', true);
            
            return self;
        },
        
        /**
         * 隐藏拾色器
         * @method hide
         */
        hide: function(fast){
            var self = this;
            if (!self.con) {
                return;
            }
            var o = self.options;
            function handler(){
                self.con.remove();
                $.extend(self, {
                    con: null,
                    wrap: null,
                    board: null,
                    wheel: null,
                    hMarker: null,
                    slMarker: null
                });
            }
			//假如被destroy 则没有动画
            if (fast) {
                handler();
            }
            else {
                self.con.fadeOut(150, handler);
            }
            if (o.popup) {
                $(document).unbind('click.ui-colorpicker');
            }
            return self;
        },
        /**
         * Change color with HTML syntax #123456
         */
        setColor: function(color, force){
            var self = this, up = unpack(color);
            if (force || (self.color != color && up)) {
                self.color = color;
                self.rgb = up;
                self.hsl = rgbToHSL(self.rgb);
                self._updateDisplay();
            }
            return this;
        },
        /**
         * Change color with HSL triplet [0..1, 0..1, 0..1]
         */
        setHSL: function(hsl){
            var self = this;
            self.hsl = hsl;
            self.rgb = hslToRGB(hsl);
            self.color = self._pack(self.rgb);
            self._updateDisplay();
            return this;
        },
        //        _updateValue: function(){
        //            if (this.value && this.value != self.color) {
        //                self.setColor(this.value);
        //            }
        //        },
        /**
         * Update the markers and styles
         */
        _updateDisplay: function(){
            // Markers
            var self = this, o = self.options, angle = self.hsl[0] * 6.28;
            self.hMarker.css({
                left: Math.round(Math.sin(angle) * o.radius + o.width / 2),
                top: Math.round(-Math.cos(angle) * o.radius + o.width / 2)
            });
            
            self.slMarker.css({
                left: Math.round(o.square * (0.5 - self.hsl[1]) + o.width / 2),
                top: Math.round(o.square * (0.5 - self.hsl[2]) + o.width / 2)
            });
            
            // Saturation/Luminance gradient
            self.board.css('backgroundColor', self._pack(hslToRGB([self.hsl[0], 1, 0.5])));
            
            if (o.update) {
                self.activator.css({
                    backgroundColor: self.color,
                    color: self.hsl[2] > 0.5 ? '#000' : '#fff'
                }).val(self.color);
            }
            
            self._trigger('change', null, {
                color: self.color
            });
        },
        /* Various color utility functions */
        _pack: function(rgb){
            var r = Math.round(rgb[0] * 255), g = Math.round(rgb[1] * 255), b = Math.round(rgb[2] * 255);
            return '#' + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16);
        },
        /**
         * Retrieve the coordinates of the given event relative to the center
         * of the widget.
         */
        _widgetCoords: function(e){
            var self = this, o = self.options, x, y, pos = self.wheel.offset();
            x = (e.pageX || 0 * (e.clientX + $('html').scrollLeft())) - pos.left;
            y = (e.pageY || 0 * (e.clientY + $('html').scrollTop())) - pos.top;
            // Subtract distance to middle
            return {
                x: x - o.width / 2,
                y: y - o.width / 2
            };
        },
        _mouseCapture: function(e){
            var self = this, o = self.options;
            if (self.options.disabled) {
                return false;
            }
            // Check which area is being dragged
            var pos = self._widgetCoords(e);
            self.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) * 2 > o.square;
            self._mouseDrag(e);
            return true;
        },
        _mouseDrag: function(e){
            // Get coordinates relative to color picker center
            var self = this, o = self.options, pos = self._widgetCoords(e);
            
            // Set new HSL parameters
            if (self.circleDrag) {
                var hue = Math.atan2(pos.x, -pos.y) / 6.28;
                if (hue < 0) {
                    hue++;
                }
                self.setHSL([hue, self.hsl[1], self.hsl[2]]);
            }
            else {
                var sat = Math.max(0, Math.min(1, 0.5 - (pos.x / o.square))), lum = Math.max(0, Math.min(1, 0.5 - (pos.y / o.square)));
                self.setHSL([self.hsl[0], sat, lum]);
            }
            return false;
        }
    });
    
    function unpack(color){
        if (color.length == 7) {
            return [parseInt(color.substring(1, 3), 16) / 255, parseInt(color.substring(3, 5), 16) / 255, parseInt(color.substring(5, 7), 16) / 255];
        }
        else if (color.length == 4) {
            return [parseInt(color.substring(1, 2), 16) / 15, parseInt(color.substring(2, 3), 16) / 15, parseInt(color.substring(3, 4), 16) / 15];
        }
    }
    function hslToRGB(hsl){
        var m1, m2, r, g, b;
        var h = hsl[0], s = hsl[1], l = hsl[2];
        m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
        m1 = l * 2 - m2;
        return [hueToRGB(m1, m2, h + 0.33333), hueToRGB(m1, m2, h), hueToRGB(m1, m2, h - 0.33333)];
    }
    
    function hueToRGB(m1, m2, h){
        h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
        if (h * 6 < 1) {
            return m1 + (m2 - m1) * h * 6;
        }
        if (h * 2 < 1) {
            return m2;
        }
        if (h * 3 < 2) {
            return m1 + (m2 - m1) * (0.66666 - h) * 6;
        }
        return m1;
    }
    
    function rgbToHSL(rgb){
        var min, max, delta, h, s, l;
        var r = rgb[0], g = rgb[1], b = rgb[2];
        min = Math.min(r, Math.min(g, b));
        max = Math.max(r, Math.max(g, b));
        delta = max - min;
        l = (min + max) / 2;
        s = 0;
        if (l > 0 && l < 1) {
            s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
        }
        h = 0;
        if (delta > 0) {
            if (max == r && max != g) {
                h += (g - b) / delta;
            }
            if (max == g && max != b) {
                h += (2 + (b - r) / delta);
            }
            if (max == b && max != r) {
                h += (4 + (r - g) / delta);
            }
            h /= 6;
        }
        return [h, s, l];
    }
    
    $.add('ui-colorpicker');
})(jQuery);
