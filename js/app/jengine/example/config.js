/**
 * @overview:搜索环境和参数配置
 *
 * @author: hpapple.hep
 * @date: 2012-02-25
*/
!(function($) {
 
	 jQuery.namespace(
		'Searchweb', 	
		'Searchweb.Widget',
		'Searchweb.Business',
		'Searchweb.Utility',
		'Searchweb.Config'
	);

	Searchweb.Config.LazyModule={
	
		lazyModule1:{
			js: ['http://style.china.alibaba.com/js/app/search/v4.0/core/example/lazyloadmodule1.js'],
			css:['http://style.china.alibaba.com/css/app/search/v4.0/core/example/lazyloadmodule1.css']
		},
		
		//这里示例了一个延迟加载模块有多种展现模式时的文件定义方式（魔方项目）
		lazyModule2:{
			combine1:{
				js: ['http://style.china.alibaba.com/js/app/search/v4.0/core/example/lazyloadmodule2.js'],
				css:['http://style.china.alibaba.com/css/app/search/v4.0/core/example/lazyloadmodule21.css']
			},
			combine2:{
				js: ['http://style.china.alibaba.com/js/app/search/v4.0/core/example/lazyloadmodule2.js'],
				css:['http://style.china.alibaba.com/css/app/search/v4.0/core/example/lazyloadmodule22.css']
			},
			combine3:{
				js: ['http://style.china.alibaba.com/js/app/search/v4.0/core/example/lazyloadmodule2.js'],
				css:['http://style.china.alibaba.com/css/app/search/v4.0/core/example/lazyloadmodule33.css']
			}
		},
		
		bigRender1:{
			combine1:{
				js: ['http://style.china.alibaba.com/js/app/search/v4.0/core/example/bigrender1.js'],
				css:['http://style.china.alibaba.com/css/app/search/v4.0/core/example/bigrender1.css']
			}
		},
		end:0
	};
	
	Searchweb.Config.Event={
	
		DELETE:"module1/delete",
		end:0
	};
	
 })(jQuery);	