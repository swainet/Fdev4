/**
 * @usefor widget tabs
 * @author wb_hongss.ciic
 * @date 2011.02.21
 * @update 2011.07.26 hongss 增加 reset 方法；在使用JS动态增加tab后调用，则新增部分也能融入到原tabs中生效。
 * @update 2011.07.27 hongss 修复昨天修改后 e.target引起的title中不能加入其他元素的bug；改用e.currentTarget就OK。
 * @update 2011.08.09 hongss 修复事件触发的节点index取兄弟节点中的index的bug；正确的应该是取被指定为触电元素集中的index
 * @update 2011.08.14 hongss 将setInterval改成setTimeout，并将_autoPlay放在动画队列后执行；修正animate在chrome和firefox中的bug
 * @update 2011.09.19 hongss 修复在滚动效果中设置selected无效问题
 * @update 2011.10.10 hongss 当初始化中selected不为0时，不显示动画效果
 * @update 2011.11.12 hongss 优化自定义事件show、select的回调函数中的参数，优化结果为：{index:index, box:boxes}
 * @update 2011.12.07 hongss 修复 mouseover|mouseout事件触发状态下，mouseover在title上/从title移到box后 依然会自动播放的问题
 * 
 * 在setTab前后分别增加了自定义事件select   show   last
 */
('tabs' in jQuery.fn) ||
(function($, undefined){

    $.widget('ui.tabs', {
        /**
         * 默认配置
         */
        options: {
            isAutoPlay: true,               // 是否自动进行切换 
            timeDelay: 3,                   // 自动切换的时间间隔 (单位：秒)
            torpid:200,                     // 时间触发tab切换时，迟钝化处理时间(单位：毫秒)，只在双事件驱动时触发，如mouseover/mouseout
            event: 'mouseover|mouseout',    // 切换的事件触发类型，如需双事件驱动使用“|”隔开
            currentClass: 'current',        // 当前tab的触点样式 
            titleSelector: '.f-tab-t',      // 触点元素集
            boxSelector: '.f-tab-b',        // 内容元素集 
            selected: 0                     // 设置初始化时第几个触点为当前状态 
        },
        _create: function() {
            var self = this,
            o = this.options,
            events, boxes;
            
            self.titles = self.element.find(o.titleSelector);
            self.boxes = self.element.find(o.boxSelector);
            
            self._setEffectStyle();
            
            //如果titles比boxes多
            if (self.titles.length > self.boxes.length) {
                self.titles = self.titles.slice(0, self.boxes.length);
                for (var i=self.boxes.length; i<self.titles.length; i++) {
                    $(self.titles[i]).addClass('ui-state-disabled');
                }
            }
            //self.index = o.selected;
            self.index = 0;
            self.tHandle = null;
            //add by hongss on 2011.12.07 by hongss for pause autoPlay when hovering title
            self.isPause = false;
            //self.isScrolling = false;
            
            //初始化设置 modify by hongss on 2011.10.10
            self._setTab(o.selected, null, true);
            
            //自动播放
            self._autoPlay(1);
            
            //titles事件监听
            events = self._getEvents();
            if (events.length>1) {
                var timeId = null,
                eventObj = {};
                
                eventObj[events[0]] = function(e){
                    self.isPause = true;
                    if (timeId) {
                        clearTimeout(timeId);
                    }
                    var i = $(self.titles).index($(e.currentTarget));
                    
                    timeId = setTimeout(function(){
                        if (self.index!==i) {
                            self._setTab(i, e);
                        }
                        self._onTitleFocue();
                    }, o.torpid);
                }
                eventObj[events[1]] = function(e){
                    self.isPause = false;
                    clearTimeout(timeId);
                    timeId = setTimeout(function(){
                        self._autoPlay(1, e);
                    }, o.torpid);
                }
                
                $(self.titles).live(eventObj);
            } else if (events.length===1) {
                $(self.titles).live(events[0], function(e){
                    self._onTitleFocue();
                    var i = $(self.titles).index($(e.currentTarget));
                    if (self.index!==i) {
                        self._setTab(i, e);
                    }
                    self._autoPlay(1, e);
                });
            }
            
            //boxes事件监听，box区域鼠标移动上去后暂停播放
            boxes = (this._getPrimalBoxes) ? this._getPrimalBoxes() : this.boxes;
            boxes.each(function(i){
                $(this).hover(function(){
                    self.isPause = true;
                    self._onTitleFocue();
                }, function(){
                    self.isPause = false;
                    self._autoPlay(1);
                });
            });
        },
        /**
         * @methed reset 重置
         */
        reset: function(){
            this.titles = this.element.find(this.options.titleSelector);
            this.boxes = this.element.find(this.options.boxSelector);
        },
        /**
         * @methed _setTab 设置tab
         * @param {num} idx 需要显示的title序号
         */
        _setTab: function(idx, e, isInit) {
            var primalIdx = idx, box = $(this.boxes[idx]);
            
            e = e || null;
            
            idx = this._getIndex(idx);
            
            //自定义事件 select
            this._trigger('select', e, {index:idx, box:box});
            if (this.options.effect!=='scroll') {
                this._lazyImg(idx);
                this._lazyHtml(idx);
            }

            this._setTitle(idx);
            if (isInit===true){
                this._initBox(idx);
            } else {
                this._setBox(idx, primalIdx);
            }
            
            this.index = idx;
            if (this.options.effect!=='scroll' && this.options.effect!=='fade') {
                //自定义事件 show
                this._trigger('show', e, {index:idx, box:box});
            }
            
        },
        /**
         * @methed _autoPlay 自动播放
         */
        _autoPlay: function(n, e) {
            var self = this;
            n = Number(n) || 1;
            e = e || null;
            
            if (self.options.isAutoPlay===true && self.isPause===false ) {
                if (self.tHandle){
                    clearTimeout(self.tHandle);
                }
                self.tHandle = setTimeout(function(){
                    self._setTab(self.index+n, e);
                }, self.options.timeDelay*1000);
            }
        },
        
        /**
         * @methed _setTitle  title的设置
         * @param {num} idx
         */
        _setTitle: function(idx) {
            if (this.titles.length>0) {
                var className = this.options.currentClass;
                this.titles.removeClass(className);
                $(this.titles[idx]).addClass(className);
            }
        },
        
        /**
         * @methed _setBox  box的设置
         * @param {num} idx
         */
        _setBox: function(idx) {
            this._effectNone(idx);
        },
        
        _initBox: function(idx){
            this._effectNone(idx);
        },
        /**
         * @methed _effectNone  无动画效果的box设置
         * @param {num} idx
         */
        _effectNone: function(idx) {
            this.boxes.hide();
            $(this.boxes[idx]).show();
            this._autoPlay(1);
        },
        /**
         * @methed _onTitleFocue 
         * @param {num} idx
         */
        _onTitleFocue: function() {
            if (this.tHandle) {
                clearTimeout(this.tHandle);
                this.tHandle = null;
            }
        },
        _setOption: function(key, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
            if (key === 'selected') {
                this._setTab(value);
            }
        },
        /**
         * @methed _lazyLoad 懒加载图片
         * @param {num} idx
         */
        _lazyImg: $.noop,
       
        /**
         * @methed _lazyHtml 懒加载HTML
         * @param {Object} idx
         */ 
        _lazyHtml: $.noop,
        
        /**
         * @methed _lazyScrollLoad 滚动-懒加载图片
         */
        _lazyScrollImg: $.noop,
       
        /**
         * @methed _lazyScrollHtml 滚动-懒加载HTML
         */ 
        _lazyScrollHtml: $.noop,
        
        /**
         * @methed _setEffectStyle 设置滚动时需要的STYLE
         */
        _setEffectStyle: $.noop,
        /**
         * @methed _getIndex 获取index
         * @param {num} idx
         */
        _getIndex: function(idx) {
            var l = this.boxes.length;
            if (idx<0) {
                return (idx+l);
            } else if (idx>=l) {
                return (idx-l);
            } else {
                return idx;
            }
        },
        
        /**
         * @methed _getEvents 处理从配置中获得的events，返回数组
         */
        _getEvents: function() {
            return $.trim(this.options.event).split('|');
        },
        
        /** 
         * @methed getPrev   显示上一个tab
         */
        prev: function(n) {
            n = n || 1;
            this._onTitleFocue();
            this._setTab(this.index-n);
            this._autoPlay();
            return this;
        },
        
        /**
         * @methed getNext   显示下一个
         */
        next: function(n) {
            n = n || 1;
            this._onTitleFocue();
            this._setTab(this.index+n);
            this._autoPlay();
            return this;
        },
        
        /**
         * @methed length  返回tab数
         */
        length: function() {
            return this.boxes.length;
        },
        
        /**
         * @methed idx 返回当前index
         */
        idx: function() {
            return this.index;
        },
        
        /**
         * @param {num} index  允许负数，如果负数都从最后一个开始算
         */
        select: function(index) {
            if (index!==this.index) {
                this._setTab(index);
            }
            return this;
        }
    });
    $.add('ui-tabs');
})(jQuery);
