/**
 * jQuery UI Combobox 1.0
 *
 * Denis 2011.05.10
 * Depends:
 *	jquery.ui.core.js
 * @update 优化下拉列表关闭的时间机制，修复在一些特定情况下下拉列表无法关闭的BUG ---- 2011.11.02
 * @update Denis 2012.03.19 修复在maxHeight下，不出现滚动条的BUG
 * @update Denis 2012.04.06 增加可自定义编辑功能; 提供maxlength配合editable.
 */
('combobox' in jQuery.fn) ||
(function($, undefined){
    var $isFunction = $.isFunction, $makeArray = $.makeArray, $each = $.each;
    $.widget('ui.combobox', {
        options: {
            name: '',
            //value: '',
            multiple: false,
            editable: false,
            closable: false,
            maxHeight: false,
            shim: true,
            maxlength: 50,
            //listWidth: 250,
            //data: xxx
            triggerText: '',
            //请注意在这个方法中需要做的事情，
            tpl: function(data){
                var ul = $('<ul>'), i, j;
                for (i = 0, j = data.length; i < j; i++) {
                    var item = data[i], li = $('<li>').addClass('ui-combobox-item').data('item', item);
                    ul.append(li.html(item.text));
                }
                return ul;
            },
            //
            itemNode: 'li',
            itemTpl: function(item){
                return $('<li>').html(item.text);
            },
            resultTpl: function(item){
                return item.text;
            },
            //appendTo: 'body',
            zIndex: 1000
        },
        _create: function(){
            var self = this, o = self.options, elem = this.element, html = [], panel, data = o.data;
            
            o.shim = o.bgiframe;
            if (o.multiple) {
                html.push('<ul class="result fd-clr"></ul>');
            } else {
                html.push('<input class="field" type="hidden" name="' + o.name + '"/>');
                html.push('<input class="result" type="text" autocomplete="off" maxlength="' + o.maxlength + '"' + (o.editable ? '' : 'readonly="readonly"') + '/>');
            }
            html.push('<a class="trigger" href="javascript:;" target="_self" hidefocus="true"></a>');
            elem.addClass('ui-combobox').append(html.join(''));
            
            //创建下拉Panel 
            panel = self.panel = $('<div>', {
                'class': 'ui-combobox-panel',
                css: {
                    display: 'none',
                    zIndex: o.zIndex
                },
                html: (o.closable ? '<a class="close" href="javascript:;"></a>' : '') + '<div class="list fd-clr"></div>'
            }).appendTo(o.appendTo || elem);
            self.field = $('>input.field', elem);
            self.result = $('>.result', elem);
            self.trigger = $('>a.trigger', elem);
            self.close = $('>a.close', panel);
            self.list = $('>div.list', panel);
            //保存化Value
            self.value = $.makeArray(o.value);
            //初始化事件
            self._buildEvent();
            //初始化数据 + 初始化list
            self._dataInit();
            if (o.shim) {
                panel.bgiframe();
            }
        },
        /**
         * 销毁结构和挂在document上的事件
         */
        _destroy: function(){
            var self = this;
            $(document).unbind('mousedown.combobox', self._mousedownHandler);
            self.element.empty();
        },
        /**
         * 注册事件
         */
        _buildEvent: function(){
            var self = this, o = self.options, itemNode = o.itemNode;
            self.trigger.bind('click.combobox', $.proxy(self, 'toggle'));
            self.close.bind('click.combobox', function(e){
                e.preventDefault();
                self.panel.hide();
            });
            //多选模式下
            if (o.multiple) {
                self.result.delegate('a.ui-combobox-remove', 'click.combobox', function(e){
                    var node = $(this).closest('li');
                    self.remove(node.data('item').value, node);
                });
            } else if (o.editable) {
                var originValue;
                self.result.bind({
                    'keyup.combobox': function(){
                        var custom = true;
                        $(itemNode + '.ui-combobox-item', self.list).removeClass('ui-combobox-selected').each(function(i, node){
                            var item = $(node).data('item');
                            if (self.result.val() === item.text) {
                                self.select(item.value, true, $(node));
                                return custom = false;
                            }
                        });
                        if (custom) {
                            self.field.val(this.value);
                        }
                    },
                    'focus.combobox': function(){
                        originValue = self.field.val();
                    },
                    'blur.combobox': function(){
                        if (self.field.val() !== originValue) {
                            self._trigger('change');
                        }
                    }
                });
            }
            self.result.click(function(e){
                if (e.target !== this) {
                    return;
                }
                self.toggle(e);
            });
            self.list.delegate(itemNode + '.ui-combobox-item', {
                'hover.combobox': function(){
                    $(this).toggleClass("ui-combobox-hover");
                },
                'click.combobox': function(e){
                    var node = $(this), item = node.data('item');
                    if (item) {
                        var value = item.value;
                        //多选
                        //change
                        if (o.multiple) {
                            var ipt = $('input:checkbox', node);
                            if (node.hasClass('ui-combobox-selected')) {
                                self.remove(value);
                            } else {
                                self.select(value, false, node);
                            }
                        } else {
                            //change
                            if (!node.hasClass('ui-combobox-selected')) {
                                self.select(value, false, node);
                            }
                            if (!o.closable) {
                                self.panel.hide();
                            }
                        }
                    }
                }
            });
            //closable?
            if (!o.closable) {
                $(document).bind('mousedown.combobox', self, self._mousedownHandler);
            }
        },
        /**
         * 全局事件处理函数
         */
        _mousedownHandler: function(e){
            if ($(e.target).closest('.ui-combobox')[0] !== e.data.element[0]) {
                e.data.panel.hide();
            }
        },
        /**
         * 展开列表
         * @param {Object} e
         */
        toggle: function(e){
            var self = this, o = self.options;
            e.preventDefault();
            if (self.panel.css('display') === 'none') {
                self.resetPanelPosition().show();
            } else {
                self.panel.hide();
            }
        },
        /**
         * 处理组件数据
         */
        _dataInit: function(){
            var self = this, o = self.options, data = o.data;
            //在此处先判断数据源格式是否为节点，同时配置一些参数
            if (o.data.jquery) {
                data = o.data.get(0);
            }
            if (data.nodeName === 'SELECT') {
                o.name = data.name;
                o.multiple = $(data).prop('multiple');
                var tmp = [];
                self.field.attr('name', o.name);
                //根据节点配置参数
                $('>option', data).each(function(i, option){
                    var selected = $(option).prop('selected'), item = {
                        text: option.innerHTML,
                        value: option.value
                    };
                    if (selected) {
                        item.selected = selected;
                    }
                    tmp.push(item);
                });
                self.data = tmp;
                $(data).attr('disabled', true).hide();
                self._trigger('datainit');
                self._listRender(self.data);
            } else if ($isFunction(data)) {
                //需要在自定义数据方法中执行回调函数,并回传数据
                data(function(d){
                    //保存最终数据
                    self.data = d;
                    self._trigger('datainit');
                    self._listRender(d);
                });
            } else {
                //保存数据
                self.data = data;
                self._trigger('datainit');
                self._listRender(data);
            }
        },
        /**
         * 初始化下拉数据
         */
        _listRender: function(data){
            var self = this, o = self.options, val = [];
            //填充数据
            self.value = [];
            self.data = data;
            self.list.html(o.tpl(data));
            self._resultInit();
            if (o.maxHeight) {
                self.panel.css({
                    width: '',
                    height: '',
                    'overflow-y': 'auto'
                });
                if (self.panel.height() > o.maxHeight) {
                    self.panel.height(o.maxHeight);
                    self.panel.width(self.panel.width() + 17);
                }
            }
            //设置配置中的值
            if (o.value) {
                self.val(o.value, true);
            } else {
                var itemNode = o.itemNode;
                //设置数据中的值
                $(itemNode + ':data(item)', self.list).each(function(i, node){
                    var item = $(node).data('item');
                    if (item.selected) {
                        val.push(item.value);
                    }
                });
                self.val(val, true);
            }
            self._trigger('listrender');
        },
        /**
         * 初始化结果显示
         */
        _resultInit: function(){
            //noformat
            var self = this, 
				o = self.options, 
				itemNode = o.itemNode,
				sels = $(itemNode + '.ui-combobox-selected', self.list);
			//format
            //假如有默认值
            if (o.multiple) {
                self.result.empty();
                sels.each(function(i, sel){
                    var item = $(sel).data('item');
                    self.result.append($('<li>').append(o.resultTpl(item)).data('item', item));
                });
            } else {
                if (sels.length) {
                    var item = sels.data('item');
                    self.result.val(o.resultTpl(item));
                    self.field.val(item.value);
                } else {
                    self.result.val('');
                    self.field.val('');
                }
            }
        },
        /**
         * 下拉框位置重定向
         */
        resetPanelPosition: function(){
            var self = this, position = self.result.position();
            self.panel.css({
                left: position.left,
                top: position.top + self.result.outerHeight()
            });
            return self.panel;
        },
        /**
         * 重置控件，当触发form的reset时调用此方法
         * @param {Object}	可选参数，指定新的数据源
         */
        reset: function(data){
            if (data) {
                this.options.data = data;
            }
            this._dataInit();
        },
        /**
         * 选择一项（单个）
         * @param {String} value	需要选择的项的值
         * @param {Bolean} isChanged	是否触发change事件
         * @param {jQuery} node		是否携带项的节点，提高效率（内部调用参数）
         */
        select: function(value, isChanged, node){
            //noformat
            var self = this, 
				o = self.options, 
				itemNode = o.itemNode, 
				nodes = node || $(itemNode + ':data(item)', self.list),
				changed = false,
				len;
			//format
            value = $makeArray(value);
            len = value.length;
            nodes.each(function(i, node){
                node = $(node);
                var item = node.data('item'), i = value.indexOf(item.value);
                if (i > -1) {
                    //change
                    if (!node.hasClass('ui-combobox-selected')) {
                        if (o.multiple) {
                            $('input:checkbox', node).attr('checked', true).prop('defaultChecked', true);
                            
                            self.result.append($('<li>').append(o.resultTpl(item)).data('item', item));
                        } else {
                            $(itemNode + '.ui-combobox-item', self.list).removeClass('ui-combobox-selected');
                            //result
                            self.result.val(o.resultTpl(item));
                            self.field.val(item.value);
                        }
                        node.addClass('ui-combobox-selected');
                        self.value.push(item.value);
                        changed = true;
                    }
                    len--;
                    if (!len) {
                        return false;
                    }
                }
            });
            //假如值发生了变化，触发change
            if (!isChanged && changed) {
                self.resetPanelPosition();
                self._trigger('change');
            }
            return this;
        },
        /**
         * 获取/设置值
         * @param {Object} val
         * @param {Object} isInit
         */
        val: function(val, isInit){
            var self = this, o = self.options, itemNode = o.itemNode;
            if (val === undefined) {
                if (o.multiple) {
                    return self.value;
                } else {
                    return self.field.val();
                }
            } else {
                val = $.makeArray(val);
                //和当前值不同
                if (val.length !== self.value.length ||
                self.value.some(function(value, i){
                    return value !== val[i];
                })) {
                    $each(val, function(i, value){
                        self.select(value, true);
                    });
                    if (!isInit) {
                        self.resetPanelPosition();
                        self._trigger('change');
                    }
                }
                return self;
            }
        },
        /**
         * Multiple时移除项
         * @param {Object} value
         * @param {Object} node
         */
        remove: function(value, node){
            var self = this, itemNode = self.options.itemNode, changed = false, p, q;
            value = $makeArray(value);
            p = q = value.length;
            if (node) {
                node.remove();
            }
            
            if (!node) {
                $('>li', self.result).each(function(i, li){
                    li = $(li);
                    var i = value.indexOf(li.data('item').value);
                    if (i > -1) {
                        //change
                        li.remove();
                        p--;
                        if (!p) {
                            return false;
                        }
                    }
                });
            }
            $(itemNode + ':data(item)', self.list).each(function(i, node){
                node = $(node);
                var i = value.indexOf(node.data('item').value);
                if (i > -1) {
                    if (node.hasClass('ui-combobox-selected')) {
                        //change
                        node.removeClass('ui-combobox-selected');
                        $('input:checkbox', node).prop('checked', false);
                        self.value.remove(value[i]);
                        changed = true;
                    }
                    q--;
                    if (!q) {
                        return false;
                    }
                }
            });
            if (changed) {
                self.resetPanelPosition();
                self._trigger('change');
            }
            return this;
        }
    });
    
    $.add('ui-combobox');
})(jQuery);
