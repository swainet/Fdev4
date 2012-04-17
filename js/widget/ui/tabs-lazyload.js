/**
 * @usefor widget tabs extend lazyload
 * @author wb_hongss.ciic
 * @date 2011.03.25
 * @update 2011.07.13 hongss 增大图片懒加载尺度，减小图片加载时闪烁的可能；即预加载了下一个tab会显示的图片
 * @update 2011.08.02 hongss 增加是否预先加载下一个tab的数据（img or html）的配置项
 * 
 * 在Html lazy load后增加了自定义事件  after
 */

 ;(function($, undefined){
     var FE_TEMP_ID = 'fe-temp-tabs-id';
     
     $.extend($.ui.tabs.prototype.options, {
         lazyImg: 'data-lazy-src',   //属性名，用于承载原img标签中的src属性值
         lazyHtml: 'fe-lazy-html',   //class名，根据此class名存在与否来判断是否执行html懒加载
         isPreLoad: true             //布尔值，是否预加载下一个tab的数据（img or html），默认为预加载
     });
     
     $.extend($.ui.tabs.prototype, {
         /**
          * @methed _lazyImg 图片懒加载
          * @param {num} idx
          */
         _lazyImg: function(idx){
            var lazyImg = this.options.lazyImg,
            imgs = this._getBoxes(idx).find('img['+lazyImg+']');
            
            this._setImgsAttr(imgs);
         },
         /**
          * @methed _lazyHtml HTML懒加载
          * @param {num} idx
          */
        _lazyHtml: function(idx) {
            var boxes = this._getBoxes(idx);
            
            this._setLazyHTML(boxes, idx);
        },
        /**
         * @methed _getBoxes 返回当前需要加载的box，用于非滚动效果的懒加载
         * @param {num} idx
         */
        _getBoxes: function(idx) {
            var boxes = $(this.boxes[idx]);
            if (this.options.isPreLoad===true){
                boxes = boxes.add($(this.boxes[idx+1]));
            }
            return boxes;
        },
         
         /**
         * @methed _lazyScrollLoad 滚动-懒加载图片
         */
         _lazyScrollImg: function(boxes){
             var lazyImg = this.options.lazyImg,
             //boxes = this._getScrollBoxes(),
             imgs = boxes.find('img['+lazyImg+']');
             
             this._setImgsAttr(imgs);
         },
         
         /**
         * @methed _lazyScrollHtml 滚动-懒加载HTML
         */ 
         _lazyScrollHtml: function(boxes){
             var lazyHtml = this.options.lazyHtml,
             //boxes = this._getScrollBoxes(),
             textareas = boxes.find('textarea.'+lazyHtml);
             
             this._setLazyHTML(boxes);
         },
         
         /**
          * @methed _setImgsAttr 设置图片属性
          * @param {Object} imgs
          */
         _setImgsAttr: function(imgs){
             var lazyImg = this.options.lazyImg;
             if (imgs.length>0) {
                imgs.each(function(i){
                    $(this).attr('src', $(this).attr(lazyImg));
                    $(this).removeAttr(lazyImg);
                });
            }
         },
         
         /**
          * @methed _setLazyHTML 设置懒加载HTML
          * @param {Object} textareas
          */
         _setLazyHTML: function(boxes, idx){
             var _self = this;
             boxes.each(function(i){
                 var box = boxes.eq(i),
                 textareas = box.find('textarea.'+_self.options.lazyHtml),
                 l = textareas.length;
                 if (l>0) {
                     var id = FE_TEMP_ID+'-'+(Math.floor(Math.random()*10000));
                     textareas.each(function(i){
                         var strHTML = $(this).val();
                         if (i===l-1) {
                             strHTML += '<span id='+id+'></span>';
                         }
                         $(this).replaceWith(strHTML);
                     });
                     
                     _self._available(id, function(){
                         var data = (idx) ? {index:idx, boxes:box} : {boxes:box};
                         $('#'+id).remove();
                         //增加自定义事件 after
                         _self._trigger('after', null, data);
                     }, box);
                 }
             });
             
         },
         /**
          * @methed _getScrollBoxes 返回滚动后显示区域的boxes   move to tabs-effect by hongss on 2011.11.12
          */
         /*_getScrollBoxes: function(){
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
         },*/
         /**
          * @methed _available  判断DOM节点是否已经存在
          * @param {string} id  待判断的ID
          * @param {Object} fn  需要执行的函数
          * @param {Object} o   this指向
          */
         _available: function(id, fn, o) {
             if (!id || !$.isFunction(fn)) { return; }
             
             var retryCount = 1,
             timeId = $.later(40, o, function(){
                 if ($('#'+id).length>0 && !!(fn()||1) || ++retryCount>500) {
                     timeId.cancel();
                 }
             }, [], true);
         }
     });
 })(jQuery);
 