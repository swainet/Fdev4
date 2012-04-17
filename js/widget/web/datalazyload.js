/**
 * @todo : 数据懒加载
 * @author : yu.yuy
 * @createTime : 2011-04-25
 * @version : 1.2
 * @update : yu.yuy 2011-11-02 添加bind方法，基于bind方法优化了遍历资源池的性能
 * @update : yu.yuy 2011-11-10 (1)增加视窗底部刚好等于容器位置的判断逻辑；(2)废除异步函数的hash表，改用在资源池中与寄主DOM元素一起捆绑成一个数组；(3)使用attr代替data来取自定义属性的值。
 * @update : yu.yuy 2011-12-19 由于IE下同一图片的onload事件只触发一次，这导致在页面中多处引用同一图片的时候出现多处图片无法载入的情况，所以本次修改先去除图片加载时的渐显动画。
 */
('datalazyload' in FE.util) || 
    (function($, Util){
    var WIN = window,
    DOC = document,
    IMGSRCNAME = 'data-lazyload-src',
    FNCLASSNAME = 'lazyload-fn',
    FNATTRIBUTE = 'data-lazyload-fn-body',
    TEXTAREACLASSNAME = 'lazyload-textarea',
    datalazyload = function(){
        var _defaultThreshold = 200,
        _threshold = 0,
        options = {},
        _isRunning = false,
        _viewportHeight = 0,
        _scollBody = $(WIN),
        //资源池
        resourcePool = {
            img : [],
            fn : [],
            textarea : []
        },
        /*
         * 合并数组，去除重复项。
         */
        _uniqueMerge = function(des,a){
            for(var i=0;i<a.length;i++){
                for(var j=0,len=des.length;j<len;j++){
                    if(a[i] === des[j]){
                        a.splice(i,1);
                        break;
                    }
                }
            }
            $.merge(des,a);
        },
        /*
         * 遍历资源数组，剔除满足要求的项
         */
        _filter = function(array, method, context){
            var item;
            for(var i=0;i<array.length;) {
                item = array[i];
                if(_checkPosition(item)){
                    array.splice(i, 1);
                    method.call(context,item);
                }
                else{
                    i++;
                }
            }
        },
        /*
         * 函数节流
         */
        _throttle = function(method, context){
            clearTimeout(method.tId);
            method.tId = setTimeout(function(){
                method.call(context);
            },100);
        },
        /*
         * 获取当前视窗高度
         */
        _getViewportHeight = function(){
            return _scollBody.height();
        },
        /*
         * 绑定滚动、窗口缩放事件
         */
        _bindEvent = function(){
            if(_isRunning){
                return;
            }
            _scollBody.bind('scroll.datalazyload', function(e){
                _throttle(_loadResources);
            }); 
            _scollBody.bind('resize.datalazyload', function(e){
                _viewportHeight = _getViewportHeight();
                _throttle(_loadResources);
            });
            _isRunning = true;
        },
        /*
         * 移除滚动、窗口缩放事件
         */
        _removeEvent = function(){
            if(!_isRunning){
                return;
            }
            _scollBody.unbind('scroll.datalazyload');
            _scollBody.unbind('resize.datalazyload');
            _isRunning = false;
        },
        /*
         * 收集所有需要懒加载的资源
         */
        _collect = function(container){
            var imgs = $('img['+IMGSRCNAME+']',container).toArray(),
            fns = $('.'+FNCLASSNAME,container).toArray(),
            textareas = $('.'+TEXTAREACLASSNAME,container).toArray();
            _uniqueMerge(resourcePool['img'],imgs);
            _uniqueMerge(resourcePool['fn'],fns);
            _uniqueMerge(resourcePool['textarea'],textareas);
        },
        /*
         * 加载各资源
         */
        _loadResources = function(){
            _filter(resourcePool['img'], _loadImg);
            _filter(resourcePool['fn'], _runFn);
            _filter(resourcePool['textarea'], _loadTextarea);
                
            //如果已无资源可以加载，则清除所有懒加载事件
            if(resourcePool['img'].length===0 && resourcePool['fn'].length===0 && resourcePool['textarea'].length===0){
                _removeEvent();
                //that._trigger('complete');
            }
        },
        /*
         * 加载图片
         */
        _loadImg = function(el){
            var src;
            el = $(el);
            src = el.attr(IMGSRCNAME);
            if(src){
                //el.css('display', 'none');
                el.attr('src',src);
                el.removeAttr(IMGSRCNAME);
                //el.load(function(){
                //    $(this).fadeIn('show');
                //});
            }
        },
        /*
         * 执行异步函数
         */
        _runFn = function(a){
            var el,
            fn,
            fnStr;
            if($.isArray(a)){
                el = a[0];
                fn = a[1];
            }
            else{
                el = a;
            }
            if(fn){
                fn(el);
            }
            el = $(el);
            fnStr = el.attr(FNATTRIBUTE);
            if(fnStr){
                fn = _parseFunction(fnStr);
                fn(el);
                el.removeAttr(FNATTRIBUTE);
            }
        },
        /*
         * 从指定的textarea元素中提取内容，并将它渲染到页面上
         */
        _loadTextarea = function(el){
            el = $(el);
            el.html($('textarea', el).val());
        },
        /*
         * 将字符串转化为可以执行的函数
         */
        _parseFunction = function(s){
            var a = s.split('.'),
            l=a.length,
            o = WIN;
            for(var i=($.isWindow(a[0])?1:0);i<l;i++){
                if($.isFunction(o[a[i]]) || $.isPlainObject(o[a[i]])){
                    o = o[a[i]];
                }
                else{
                    return null;
                }
            }
            if($.isFunction(o)){
                return o;
            }
            return null;
        },
        /*
         * 判断元素是否已经到了可以加载的地方
         */
        _checkPosition = function(el){
            var ret = false,
            currentScrollTop = $(DOC).scrollTop(),
            benchmark = currentScrollTop + _viewportHeight + _threshold,
            currentOffsetTop = $(el).offset().top;
            if(currentOffsetTop <= benchmark){
                ret = true;
            }
            return ret;
        },
        _toFnArray = function(els,fn){
            var ret = [],
            l;
            if(!els){
                return ret;
            }
            l = els.length;
            if(!l){
                ret.push([els,fn]);
            }
            else if(l > 0){
                for(var i=0;i<l;i++){
                    ret.push([els[i],fn])
                }
            }
            return ret;
        };
        return {
                
            /**
                         * 初始化
                         */
            init : function(){
                if(!_isRunning){
                    _viewportHeight = _getViewportHeight();
                    _bindEvent();
                }
                _loadResources();
            },
            /*
                         * 注册
                         */
            register : function(options){
                var containers = options.containers;
                _threshold = options.threshold || _defaultThreshold;
                for(var i=0,l=containers.length;i<l;i++){
                    this.bind(containers[i],$.proxy(this.add, this));
                }
                this.init();
            },
            /*
                         * 添加需要懒加载的资源
                         */
            add : function(container){
                _collect(container);
                this.init();
            },
            /*
                         * 将异步触发函数绑定在浮标元素上，即坐标元素一曝光就触发该函数。
                         */
            bind : function(el,fn){
                var els = _toFnArray(el,fn);
                if(els.length === 0){
                    return;
                }
                _uniqueMerge(resourcePool['fn'],els);
            }
        }
    };
    Util.datalazyload = datalazyload();
})(jQuery, FE.util);