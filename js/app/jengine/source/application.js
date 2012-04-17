/**
 * Application core 作用：
 * 1）控制各个模块的生命周期，创建及销毁
 * 2）允许模块间的通信
 * 3）负责对系统错误的处理

 * @author terence.wangt  chuangui.xiecg
 * @date 2012-01-20
 
 * import core.logger.js
 * import core.sandbox.js
 * import core.lazymodule.js
 
   jEngine框架介绍文档: http://wd.alibaba-inc.com/doc/page/work/cbu-market/common/jEngine
 */

!(function($){
	
	var configs = {
		dataField:    'data-mod-config',	//server端的数据通过这个属性埋入到模块对应dom节点中，框架会负责取出节点中数据并传给模块的this.config.data变量。
											//例如：<div data-mod-config='{"name":"title","url":"http://china.alibaba.com/offer/json/validate.htm"}'/></div>
											
		combineField: 'combine-mod-config',	//在延迟加载模块中，有时页面上的一个功能模块有不同的展现方式，要加载不同的js、css文件，server端通过埋入节点这个
											//属性来告知前端应该加载的资源文件的组合。框架会负责处理这个属性的获取。
											
		scriptField:  'script-mod-config',	//bigRender的优化方式，请参考：http://lifesinger.wordpress.com/2011/09/23/bigrender-for-taobao-item/
		
		AllReadyEvent:'jEngine.ready',
		end:0
	};

    function AppEntity(cfg){
	
        this.init(cfg);
    }
	
    $.extend(AppEntity.prototype, {
		init: function(cfg){

			this.config = $.extend(true, {}, configs, cfg);
						
			this.moduleData = {};
			this.mediator = new jEngine.Core.Mediator();
			this.lazyModule = new jEngine.Core.LazyModule(this.mediator);
		},
		
		/**
		* @method: register 模块注册函数
		* @param: moduleId: 注册模块的名称（string）, 如果与dom节点的id相同，则会自动获取节点中的data-mod-config属性的json值
		* @param: creator: 模块的构造函数（string|function），如果为string，则会被parse成为function
		* @param: opt: （可选）可配置参数，可以传入callback或其它配置参数
		*/
		register: function(moduleId, creator, opt){
			if (opt == null) opt = {};
			try {
			  this._addModule(moduleId, creator, opt);
			  if(opt.init){
					return this.start(moduleId);
			  }
			  return true;
			} catch (ex) {
			
				if(!DEBUG_MOD){
					$.logger.error("could not register " + moduleId + " because: " + ex.message);
				}else{
					throw ex;
				}
			  return false;
			}
		},
		
		/**
		* @method:lazyRegister 延迟（加载|初始化）模块注册函数
		* @param: moduleId: 注册模块的名称（string）, 如果与dom节点的id相同，则会自动获取节点中的data-mod-config属性的json值
		* @param: creator: 模块的构造函数（string|function），如果为string，则会被parse成为function
		* @param: els: 触发延迟加载模块的元素，可以是id、dom、domArray(jquery dom数组对象) {string|object|array}
		* @param: event: 延迟加载的驱动事件，可以是曝光事件或其它普通事件。{exposure|normal|manual events like: click, mouseover, focus, mouseenter}
		* @param: opt: (optional)配置参数，配置要加载模块的资源文件或回调函数{Object}
		*/
		lazyRegister: function(moduleId, creator, els, event, opt){
		
			if (opt == null) opt = {};
			try {
				var opt = this._getModuleCombine(moduleId, opt);
				
				var succeed = false;
				//默认情况下，延迟加载模块加载成功后会自动调用模块的初始化函数。
				if(opt.init === false){
					succeed = this.lazyModule.register(els, event, opt);
				}
				else{
					var self = this;
					
					//若opt.callback函数非空，但creator不为null，则注册模块成功后运行用户自定义函数。
					//若opt.callback函数非空，且creator为null，则运行用户自定义函数，不注册模块。
					var cb = null;
					if(opt.callback){
						if(creator){
							cb = function(){
								if(self._lazyStart(moduleId, creator)){
									opt.callback();
								}
							}
						}else{
							cb = opt.callback;
						}
					}else{
						cb = function(){self._lazyStart(moduleId, creator)};
					}
					succeed = this.lazyModule.register(els, event, opt, cb);
				}
				return succeed;
				
			} catch (ex) {
				if(!DEBUG_MOD){
					$.logger.error("could not lazyregister " + moduleId + " because: " + ex.message);
				}else{
					throw ex;
				}
				return false;
			}
		},
		
		/**
		* @method: unregister 模块卸载函数
		* @param: moduleId: 注册模块的名称（string）
		*/
		unregister: function(moduleId) {
			if (this.moduleData[moduleId] != null) {
			  delete this.moduleData[moduleId];
			  return true;
			} else {
			  return false;
			}
		},
  
		/**
		* @method: start 初始化模块
		* @param: moduleId: 注册模块的名称（string）
		*/
		start: function(moduleId){
			
			//try-catch保证了在online模式下，一个模块的异常不会影响到其它模块，消除SPOF（单点故障）。
			//在debug模式下，把错误抛给浏览器处理，一个模块失败会影响到其它模块。这样便于发现错误。
			try {
				if (this.moduleData[moduleId] == null){
					throw new Error("module " + moduleId + " does not exist");
				}
				
				var start = $.now();
				var opt = this.moduleData[moduleId].options;
				if (opt == null) opt = {};
				
				var instance = this._createInstance(moduleId, opt);
				if (instance.running === true){
					throw new Error("module " + moduleId + " was already started");
				}
				if (typeof instance.init !== "function") {
					throw new Error("module " + moduleId + " do not have an init function");
				}
				instance.init(instance.options);
				instance.running = true;
				this.moduleData[moduleId].instance = instance;
				if (typeof opt.callback === "function"){
					opt.callback();
				}
				$.logger.info(moduleId + " init finished, cost:" + + ($.now() - start) + " ms");
				return true;
			} catch (ex) {
				if(!DEBUG_MOD){
					$.logger.error(moduleId + " init Error: " + ex.message);
				}else{
					throw ex;
				}
			  return false;
			}
		},
		
		/**
		* @method: startAll 初始化所有已注册模块
		*/		
		startAll: function(){
		
			var moduleId, _results;
			_results = [];
			for (moduleId in this.moduleData){
				if (this.moduleData.hasOwnProperty(moduleId)){
					_results.push(this.start(moduleId));
				}
			}
			//通知所有的模块以及初始化完毕，有需要监听此事件的模块可以处理callback函数。
			this.mediator.notify(this.config.AllReadyEvent);
			return _results;		
		},
		
		/**
		* @method: stop 停止一个模块的运行
		* @param: moduleId: 注册模块的名称（string）
		*/		
		stop:function(moduleId) {
			var module = this.moduleData[moduleId];
			if (module.instance) {
				if($.isFunction(module.instance.destroy)){
					module.instance.destroy();
				}
				module.instance.running = false;
				module.instance = null;
				return true;
			} else {
				return false;
			}
		},
		
  		/**
		* @method: stopAll 停止所有模块的运行
		*/	
		stopAll:function() {
			
			var moduleId, _results;
			_results = [];
			for (moduleId in this.moduleData){
				if (this.moduleData.hasOwnProperty(moduleId)){
					_results.push(this.stop(moduleId));
				}
			}
			return _results;
		},
		
  		/**
		* @method: reStart 重新启动一个模块
		* @param: moduleId: 注册模块的名称（string）
		*/		
		restart:function(moduleId){
			if(this.stop(moduleId)){
				return this.start(moduleId);
			}
			return false;
		},
		
		_addModule: function(moduleId, creator, opt) {
			if (typeof moduleId !== "string") {
				throw new Error("moudule ID has to be a string");
			}
			var original = creator;
			if(typeof creator === "string"){
				creator = this._parseFunction(creator);
			}
 			if (typeof creator !== "function") {
				throw new Error(creator + " creator "+ original +" has to be a constructor function");
			}	
			if (typeof opt !== "object") {
				throw new Error("option parameter has to be an object");
			}
			if (this.moduleData[moduleId] != null) {
				throw new Error("module was already registered");
			}
			this.moduleData[moduleId] = {
				creator: creator,
				options: opt
			};
			return true;
		  },
		
		_createInstance: function(moduleId, opt){
		
			var module = this.moduleData[moduleId];
			if (module.instance != null){
				return module.instance;
			}
			
			var sb = new jEngine.Core.Sandbox(jEngine.Core.AppEntity, moduleId, opt);
			this.mediator.installTo(sb);
			
			var opt = this._getModuleConfig(moduleId, opt);
			
			var instance = new module.creator(sb),
			name, method;
			instance.options = opt;
			
			//debug模式下try catch不起作用，交由浏览器自己处理错误。
			//online模式下可以把错误信息记录在日志服务器上。
			if (!DEBUG_MOD){
				for (name in instance){
					method = instance[name];
					if (typeof method == "function"){
						instance[name] = function(name, method){
							return function (){
								try { 
									return method.apply(this, arguments);
								}
								catch(ex) {
									$.logger.error(moduleId + " throw error: " +  name + "()-> " + ex.message);
								}
							};
						}(name, method);
					}
				}
			}
			return instance;
		},
		
		/**
		 * 延迟加载|初始化的模块加载成功后也会被注册到application统一管理
		 */
		_lazyStart:function(moduleId, creator){
			
			if (this.moduleData[moduleId] == null) {
				if(this.register(moduleId, creator)){
					return this.start(moduleId);
				}
			}
			return false;
		},
		
		_getModuleConfig:function(moduleId, opt){
					
			var domId = "#" + moduleId;
			var domNode = $(domId);
			if(domNode.length>0){
			
				//从dom节点中获取埋入的后端数据 data-mod-config={"date":"1965-09-01","time":"19:30"}
				var data = domNode.attr(this.config.dataField);
				if(data && data.trim()){
					opt.data = $.parseJSON(data);
				}
			
				//从dom节点中找到对应的bigRender优化方式下用<script>标签隐藏的dom节点，插回到正常dom结构中。
				var config = domNode.attr(this.config.scriptField);
				if(config && config.trim()){
					var object = $.parseJSON(config);
					var script = $("#" +object.script);
					if(script.length>0){
					
						if(object.replace){
							domNode.replaceWith(script.html());
						}else{
							domNode.html(script.html());
						}
					}
				}
				opt.id = moduleId;
				opt.dom = domNode;
			}
			
			return opt;
		},
		
		_getModuleCombine:function(moduleId, opt){
			
			if(typeof(opt.module) !== 'undefined'){
				//从dom节点中获取模块展示的组合号 combine-mod-config="combine1"
				//大多数应用中是不需要combine-mod-config节点的，但一些复杂应用，一个模块会有
				//不同的展示方式，对应的js、css文件也就不同，因此需要通过获取dom上的埋点来确定加载哪些文件。
				var domId = "#" + moduleId;
				var domNode = $(domId);
				if(domNode.length>0){
					var combine = domNode.attr(this.config.combineField);
					if(combine && combine.trim()){
						opt.module = opt.module[combine];
					}
				}
				opt.module.moduleId = moduleId;
			}
			opt.key = moduleId;
			return opt;
		},
		
		/**
		 * 将字符串转化为函数
		 */
		_parseFunction:function(s){
			var a = s.split('.'),
			l=a.length,
			o = window;
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
		end:0
	});

	//把app实例化，一个应用默认情况下只会初始化一次
    jEngine.Core.AppEntity = new AppEntity();
	
})(jQuery);
            