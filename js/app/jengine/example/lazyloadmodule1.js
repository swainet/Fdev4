!(function($){

	var Sandbox,
		configs = {
		end:0
	};
		
	function lazyloadModule1(sb) {
		Sandbox = sb;
		return lazyloadModule1;
	}
	
	$.extend(lazyloadModule1,{
				
			init:function(cfg){

				this.config = $.extend(true, {}, configs, cfg);
				this.createHTML();
				
				Sandbox.on( Searchweb.Config.Events.DELETE, this.create);
			},
			
			create:function(data){
				alert("lazyloadModule1 got the message:" + data.msg);
			},
			
			createHTML:function(){
				alert("lazyloadModule1 loaded: get data from mod-data-config:" + this.config.data.name);
			},
			
			end:0
	});
	
	Searchweb.Business.lazyloadModule1 = lazyloadModule1;	
	
})(jQuery);

