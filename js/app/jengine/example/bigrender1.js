!(function($){

	var Sandbox,
		configs = {
		end:0
	};
		
	function bigRender1(sb) {
		Sandbox = sb;
		return bigRender1;
	}
	
	$.extend(bigRender1,{
				
			init:function(cfg){

				this.config = $.extend(true, {}, configs, cfg);
				
				this.createHTML();

			},
			
			
			createHTML:function(){
				alert("bigRender1 loaded: get data from mod-data-config");
			},
			
			end:0
	});
	
	Searchweb.Business.bigRender1 = bigRender1;	
	
})(jQuery);

