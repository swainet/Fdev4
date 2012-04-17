/**
 * @usefor widget tabs extend effect
 * @author wb_hongss.ciic
 * @date 2011.05.4
 * @update 2011.06.03 hongss 修复F5刷新后滚动效果的scrolLeft/scrollTop不恢复到初始化状态的问题
 * @update 2011.08.14 hongss 将setInterval改成setTimeout，并将_autoPlay放在动画队列后执行；修正animate在chrome和firefox中的bug
 * @update 2011.10.10 hongss 当初始化中selected不为0时，不显示动画效果
 * @update 2011.11.12 hongss 优化自定义事件show、select的回调函数中的参数，优化结果为：{index:index, box:boxes}
 * @update 2012.02.14 hongss 修复滚动正好达到初始状态且下一滚动无法满足需求时滚动个数不足的bug
 */

 ;(function($, undefined){
     
     $.extend($.ui.tabs.prototype.options, {
         effect: 'none',            //动画效果，none(无动画效果)，scroll(滚动效果)，fade(渐隐渐现效果), function()(自定义动画)；
         speed: 'slow',             //动画播放速度，可以为数字；（单位：毫秒）
         perItem: 1,                //每次滚动的子元素数量；（此参数只在effect:scroll时生效）
         scrollType: 'fill',        //循环滚动的方式，可选值：loop|fill|break； 当值为loop时titleSelector参数无效，当值为fill时，生效。（此参数只在effect:scroll时生效）
         easing: 'swing',           //动画效果，swing|easeInQuad|easeOutQuad
         subLength: null,           //滚动时，每个子元素的宽（高）度，默认自动计算；（此参数只在effect:scroll时生效）
         direction: 'left'          //滚动方向，可选值：left|right|up|down；（此参数只在effect:scroll时生效）
     });
     
     $.extend($.ui.tabs.prototype, {
         /**
          * @methed _initBox  初始化时box的设置
          * @param {num} idx
          * @update add by hongss on 2011.10.10 
          */
         _initBox: function(idx){
            if (this.options.effect==='scroll'){
                this._initScroll(idx);
            } else {
                this._effectNone(idx);
            }
         },
         /**
          * @methed _setBox  box的设置
          * @param {num} idx
          * 动画效果：none(无动画效果)，scroll(滚动效果)，fade(渐隐渐现效果)；
          *          当effect为function时为自定义效果，此时function包含一个参数idx，this指向当前box
          */
         _setBox: function(idx, primalIdx) {
             var self = this;
             if ($.isFunction(self.options.effect)){
                 self.options.effect.call(self.boxes[idx], idx);
             } else {
                 switch (self.options.effect){
                     case 'none':
                        self._effectNone(idx);
                        break;
                     case 'scroll':
                        self._effectScroll(idx, primalIdx);
                        break;
                     case 'fade':
                        self._effectFade(idx);
                        break;
                     default:
                        self._effectNone(idx);
                 }
             }
         },
         /**
          * @methed _initScroll  初始化时滚动效果的scrollLeft/scrollTop设置
          * @param {num} idx
          * @update add by hongss on 2011.10.10 
          */
         _initScroll: function(idx){
            var perLength = this._getPerLength(),
            parent = this._getBoxesParent().parent(),
            initLength = idx * perLength;
            //自定义事件 select
            this._trigger('select', null, {index:idx, box:boxes});
            //起始滚动位置设置
            if (this._isHorizontal()){
                parent.scrollLeft(initLength);
            } else {
                parent.scrollTop(initLength);
            }
            var boxes = this._getScrollBoxes();
            //自定义事件 show
            this._trigger('show', null, {index:idx, box:boxes});
            //懒加载图片与HTML
            this._lazyScrollImg(boxes);
            this._lazyScrollHtml(boxes);
         },
         /**
          * @methed _effectScroll  滚动效果的box设置
          * @param {num} idx
          */
         _effectScroll: function(idx, primalIdx) {
             var self = this, options = self.options,
             perLength = self._getPerLength(),
             parent = self._getBoxesParent().parent(),
             direction = options.direction,
             length = self.boxes.length,
             scrollLength, scrollSign,
             tempIdx = idx, tempIndex = self.index;
             
             if (options.scrollType==='loop'){
                 tempIdx = primalIdx;
             }
             scrollLength = (tempIdx-tempIndex) * perLength;
             
             if (direction==='right'||direction==='down') {
                 scrollSign = '-='+scrollLength+'px';
             }else {
                 scrollSign = '+='+scrollLength+'px';
             }
             //自定义事件 select
             //this._trigger('select', null, {index:idx, box:boxes});
            
             if (self._isHorizontal()) {
                 self._setLoopScrollOffset('scrollLeft', tempIdx, scrollLength);
                 
                 parent.animate({
                     scrollLeft: scrollSign
                 }, options.speed, options.easing, function(){
                     var boxes = self._getScrollBoxes();
                     //自定义事件 show
                     self._trigger('show', null, {index:idx, box:boxes});
                     self._lazyScrollImg(boxes);
                     self._lazyScrollHtml(boxes);
                     self._autoPlay(1);
                 });
             } else {
                self._setLoopScrollOffset('scrollTop', tempIdx, scrollLength);
                 
                 parent.animate({
                     scrollTop: scrollSign
                 }, options.speed, options.easing, function(){
                     var boxes = self._getScrollBoxes();
                     //自定义事件 show
                     self._trigger('show', null, {index:idx, box:boxes});
                     self._lazyScrollImg(boxes);
                     self._lazyScrollHtml(boxes);
                     self._autoPlay(1);
                 });
                
             }
         },
         /**
          * @methed
          * @param {Object} idx
          */
         _setLoopScrollOffset: function(scroll, idx, scrollLength){
             if (this.options.scrollType === 'loop') {
                 var index = this.index, 
                 parent = this._getBoxesParent().parent(), 
                 scrollOffset = parent[scroll](),
                 primalSize = this._getPrimalSize();
                 
                 if (idx > index && scrollOffset >= primalSize) {
                     parent[scroll](scrollOffset - primalSize);
                 }
                 if (idx < index && scrollOffset < Math.abs(scrollLength)) {
                     parent[scroll](scrollOffset + primalSize);
                 }
             }
         },
         /**
          * @methed _effectFade  渐隐渐现效果的box设置
          * @param {num} idx
          */
         _effectFade: function(idx) {
             var self = this,
             boxes = $(self.boxes[idx]);
             self.boxes.hide();
             $(boxes).fadeIn(self.options.speed, function(){
                //自定义事件 show
                self._trigger('show', null, {index:idx, box:boxes});
                self._autoPlay(1);
             });
         },
         /**
          * @methed _setScrollStyle 设置滚动时需要的STYLE
          */
         _setEffectStyle: function(){
             if (this.options.effect==='scroll'){
                 var initOffset = this._getPerLength() * this.index,
                 parent = this._getBoxesParent().parent();
             
                 if (this._isHorizontal()){
                     this._setOffset('width');
                     parent.scrollLeft(initOffset);
                 } else {
                     this._setOffset('height');
                     parent.scrollTop(initOffset);
                 }
                 
                 this._setSubLength();
                 this._setPerItem();
                 this._setBoxes();
                 
             }
         },
         /**
          * @methed _setOffset 设置宽度/高度
          */
         _setOffset: function(cssName){
             var boxes = this._getPrimalBoxes(),
             parent = this._getBoxesParent(),
             boxesLength = boxes.length * this._getSubLength(),
             teamsLength = this._getTeamCount() * this._getPerLength();
             
             switch (this.options.scrollType){
                 case 'loop':
                    parent.append(boxes.clone(true));
                    parent.css(cssName, boxesLength*2);
                    break;
                 case 'break':
                    parent.css(cssName, boxesLength);
                    break;
                 default:
                    parent.css(cssName, teamsLength);
             }
         },
         /**
          * @methed _getPrimalSize 获得原始（未复制前的）需滚动元素的宽度/高度
          */
         _getPrimalSize: function(){
             var primalSize = this._getPrimalBoxes().length * this._getSubLength();
             this._getPrimalSize = function(){ return primalSize; }
             return primalSize;
         },
         /**
          * @methed _getPrimalBoxes 返回原始的boxes
          */
         _getPrimalBoxes: function(){
             var boxes = this.element.find(this.options.boxSelector);
             this._getPrimalBoxes = function(){ return boxes; }
             return boxes;
         },
         /**
          * @methed _getBoxesParent 返回boxes的共同父级元素
          */
         _getBoxesParent: function(){
             var boxes = this._getPrimalBoxes(),
             parent = boxes.parent();
             this._getBoxesParent = function() { return parent; }
             return parent;
         },
         /**
          * @methed _getTeamCount 返回组数
          */
         _getTeamCount: function(){
             var boxes = this._getPrimalBoxes(),
             teamCount = Math.ceil(boxes.length/this.options.perItem);
             this._getTeamCount = function(){ return teamCount; }
             return teamCount;
         },
         /**
          * @methed _setBoxes 当perItem>1时，将this.boxes转换成由元素集组成的数组
          *     注：此方法在effectType:loop时不适用
          */
         _setBoxes: function(){
             if (this.options.perItem > 1){
                 var perItem = this.options.perItem,
                 boxes = this._getPrimalBoxes(),
                 n = this._getTeamCount(),
                 arrBoxes = [];
                 
                 for (var i=0; i<n; i++){
                     arrBoxes[i]=boxes.slice(i*perItem, (i+1)*perItem);
                 }
                 this.boxes = arrBoxes;
             }
         },
         /**
          * @methed _isHorizontal 判断是否为水平方向的，返回true/false
          */
         _isHorizontal: function() {
             var options = this.options;
             //left|right返回true；up|down返回false；默认为'left'
             switch (options.direction) {
                case 'left':
                    return true;
                    break;
                case 'right':
                    return true;
                    break;
                case 'up':
                    return false;
                    break;
                case 'down':
                    return false;
                    break;
                default:
                    options.direction = 'left';
                    return true;
            }
         },
         /**
          * @methed _getLength 返回子元素的高度或宽度
          */
         _getSubLength: function() {
             var isHorizontal = this._isHorizontal(),
             options = this.options,
             subLength;
             //如果设置了subLength且subLength为数字则直接取设置的值，否则自动取
             if (options.subLength) {
                 subLength = options.subLength;
             } else {
                 //如果水平滚动，取outerWidth()， 否则取outerHeight()
                 if (isHorizontal){
                     subLength = this.boxes.eq(0).outerWidth();
                 } else {
                     subLength = this.boxes.eq(0).outerHeight();
                 }
             }
             this._getSubLength = function(){ return subLength; }
             return subLength;
         },
         /**
          * @methed _getPerLength 返回每次滚动的高度或宽度
          */
         _getPerLength: function() {
             var subLength = this._getSubLength(),
             options = this.options,
             perLength;
             perLength = subLength * options.perItem;
             this._getPerLength = function(){ return perLength; }
             return perLength;
         },
         /**
          * @methed _setSubLength 设置subLength
          */
         _setSubLength: function(){
             this.subLength = (this.subLength && this._isNumber(this.subLength)) ? this.subLength : null;
         },
         /**
          * @methed _setPerItem 设置perItem
          */
         _setPerItem: function() {
             this.perItem = (this._isNumber(this.perItem)) ? this.perItem : 1;
         },
         /**
          * @methed _getScrollBoxes 返回滚动后显示区域的boxes
          */
         _getScrollBoxes: function(){
             var primalBoxes = this.element.find(this.options.boxSelector),
             parent = this._getBoxesParent().parent(),
             subLength = this._getSubLength(),
             hasScroll, viewlength, i, size, n,
             boxes = $();
             if (this._isHorizontal()){
                 hasScroll = parent.scrollLeft();
                 viewlength = parent.width();
             } else {
                 hasScroll = parent.scrollTop();
                 viewlength = parent.height();
             }
             //i 表示已经滚动的组数
             i = (hasScroll>0)? Math.ceil(hasScroll/subLength) : 0;
             //n=1不预加载下一组数据，n=2预加载下一组数据
             n = (this.options.isPreLoad===true) ? 2 : 1;
             size = i+(Math.ceil(viewlength/subLength))*n;
             for (i; i<size; i++) {
                 boxes = boxes.add(primalBoxes.eq(i));
             }
             return boxes;
         },
         /**
          * @methed _isNumber  判断是否为数字，返回true/false
          */
         _isNumber: function(num){
             return (num - 0) == num && num.length > 0;
         }
     });
 })(jQuery);
 