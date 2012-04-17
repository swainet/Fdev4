!(function($){

	var Sandbox,
		configs = {
		end:0
	};
		
	function lazyInitModule(sb) {
		Sandbox = sb;
	}
	
	$.extend(lazyInitModule.prototype,{
				
			init:function(cfg){

				this.config = $.extend(true, {}, configs, cfg);
				this.createHTML();
			},

			createHTML:function(){
				alert("lazyInitModule loaded");
				var msg = {"moduleId":"mod-search-lazyload3"};
				Sandbox.notify("jEngine.lazyLoad", msg);
			},

			end:0
	});
	
	Searchweb.Business.lazyInitModule = lazyInitModule;	
	
})(jQuery);

