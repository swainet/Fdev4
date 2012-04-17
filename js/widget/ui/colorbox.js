/**
 * jQuery UI Colorpicker 1.1
 *
 * overwrite by Denis 2011.01.30
 * Depends:
 *	jquery.ui.core.js
 * @update Denis 2011.12.29 去除关闭动画引起的BUG
 * @update Denis 2012.01.11 修复开启动画的BUG，使用stop并判断self.con不为null
 * @update Denis 2012.01.12 优化部分逻辑，修复popup:false时组件失效的BUG
 * @update Denis 2012.03.23 提供透明选项
 */
('colorbox' in jQuery.fn) ||
(function($, undefined){
    var ie6 = $.util.ua.ie6, inst, colorbox;
    $.widget('ui.colorbox', {
        options: {
            //color: '#ffffff',
            popup: true,
            zIndex: 3000,
            update: false,
            //transparent: false,
            triggerType: 'click'
        },
        _create: function(){
            var self = this, o = self.options, elem = this.element;
            if (o.popup) {
                self.activator = elem;
            } else {
                self._render();
                self.setColor(o.color);
            }
            self._buildEvent();
        },
        _render: function(){
            var self = this, o = self.options, elem = this.element, R1 = [0, 51, 102, 153, 204, 255, 255, 0, 0, 255, 0, 255], G1 = [0, 51, 102, 153, 204, 255, 0, 255, 0, 255, 255, 0], B1 = [0, 51, 102, 153, 204, 255, 0, 0, 255, 0, 255, 255];
            if (!self.con) {
                if (o.popup) {
                    //popup:true下 共用一个节点实例
                    if (inst && inst !== self) {
                        inst.hide();
                    }
                    inst = self;
                    self.con = (colorbox ||
                    (colorbox = $('<div>', {
                        'class': 'ui-colorbox',
                        css: {
                            'position': 'absolute',
                            'background': '#FFF'
                        }
                    }))).css({
                        'display': 'none',
                        'zIndex': o.zIndex
                    }).appendTo('body');
                } else {
                    self.con = $('<div>').addClass('ui-colorbox').css('position', 'relative');
                    elem.html(self.con);
                }
            }
            //重置element
            self.con.html('<div class="wrap">\
                <em></em>\
                <table cellpadding="0" cellspacing="1">\
                    <thead>\
                        <th colspan="21">\
                            <h6></h6>\
                            <div class="rgb">#FFFFFF</div>' + (o.transparent ? '<div class="transparent"></div>' : '') +
                        '</th>\
                    </thead>\
                    <tbody></tbody>\
                </table>\
            </div>');
            
            //noformat
            var tbody = $('tbody',self.con), 
				em = $('em',self.con), 
				h = $('h6', self.con), 
				rgb = $('div.rgb', self.con), R, G, B, color;
			self.picker = em;
			self.viewer = h;
			self.rgb = rgb
			//format
            for (var i = 11; i > -1; i--) {
                var tr = tbody[0].insertRow(0);
                for (var j = 20; j > -1; j--) {
                    var td = tr.insertCell(0);
                    if (j === 0 || j === 2) {
                        R = G = B = 0;
                    } else if (j === 1) {
                        R = R1[i];
                        G = G1[i];
                        B = B1[i];
                    } else {
                        R = 51 * (3 * parseInt(i / 6) + parseInt((j - 3) / 6));
                        G = 51 * ((j - 3) % 6);
                        B = 51 * (i % 6)
                    }
                    R = R.toString(16);
                    G = G.toString(16);
                    B = B.toString(16);
                    R = (R.length === 1 ? ('0' + R) : R);
                    G = (G.length === 1 ? ('0' + G) : G);
                    B = (B.length === 1 ? ('0' + B) : B);
                    color = '#' + R + G + B;
                    td.style.backgroundColor = color;
                    td.title = color.toUpperCase();
                }
            }
            tbody.delegate('td', 'mouseover.ui-colorbox', function(e){
                var td = $(this), color = td.attr('title');
                self.setColor(color, td);
                self._trigger('change', e, {
                    color: color
                });
            })
            em.bind('click.ui-colorbox', function(e){
                var color = self.color;
                if (o.update) {
                    self.activator.val(color);
                }
                self._trigger('select', e, {
                    color: color
                });
            });
            if (o.transparent) {
                $('div.transparent', self.con).bind('click.ui-colorbox', function(e){
                    var color = 'transparent';
                    if (o.update) {
                        self.activator.val(color);
                    }
                    self._trigger('select', e, {
                        color: color
                    });
                });
            }
        },
        _destroy: function(){
            this.hide();
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
                self.activator.bind('keyup.ui-colorbox', function(){
                    self.setColor(this.value);
                });
            }
            return self;
        },
        toggle: function(){
            var self = this;
            if (self.con) {
                self.hide();
            } else {
                self.show();
            }
        },
        /**
         * 显示拾色器
         * @method show
         */
        show: function(){
            //noformat
            var self = this, o = self.options;
			if (self.con){
				return;
			}
			self._render();
            if (o.popup) {
                var offset = self.activator.offset(), _x = offset.left, height = self.activator.outerHeight(), _y = offset.top + height;
                
                //format
                self.con.css({
                    left: _x,
                    top: _y
                }).stop(false, true).fadeIn(150, function(){
                    if (self.con) {
                        //noformat
                        $(document)
        				.unbind('click.ui-colorbox')
        				.bind('click.ui-colorbox', function(e){
                            //点在激活节点上
                            if ($(e.target)[0] === self.activator[0]) {
                                return;
                            }
                            self.hide();
                        });
        				//format
                        self.con.bind('click.ui-colorbox', function(e){
                            e.stopPropagation();
                        });
                    }
                });
            }
            
            self.setColor(o.update ? self.activator.val() : self.color);
            
            return self;
        },
        
        /**
         * 隐藏拾色器
         * @method hide
         */
        hide: function(){
            var self = this;
            if (!self.con) {
                return;
            }
            var o = self.options;
            if (o.popup) {
                $(document).unbind('click.ui-colorbox');
            }
            function handler(){
                self.con.remove();
                $.extend(self, {
                    con: null,
                    picker: null,
                    viewer: null,
                    rgb: null
                });
            }
            handler();
            return self;
        },
        /**
         * Change color with HTML syntax
         */
        setColor: function(color, td){
            if (color) {
                color = color.toUpperCase();
                var self = this, td = td || $('td[title=' + color + ']:first', self.con);
                if (td.length) {
                    self.viewer.css('background-color', color);
                    self.rgb.html(color);
                    self.color = color;
                    if (self.picker) {
                        var o = td.position();
                        self.picker.css({
                            top: o.top - 1,
                            left: o.left - 1
                        });
                    }
                }
            }
            return this;
        },
        /**
         * 获取当前取色器选择的颜色
         */
        getColor: function(){
            return this.color;
        }
    });
    
    $.add('ui-colorbox');
})(jQuery);
