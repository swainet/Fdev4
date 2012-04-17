!(function($){

	var Sandbox,
		configs = {
		end:0
	};
		
	function lazyloadModule2(sb) {
		Sandbox = sb;
		return lazyloadModule2;
	}
	
	$.extend(lazyloadModule2,{
				
			init:function(cfg){
			
				this.config = $.extend(true, {}, configs, cfg);
				this.createHTML();
			},
						
			createHTML:function(){
				alert("lazyloadModule2 loaded!");
				
				//$('#mod-search-link').bind('mouseover', function(){alert("mouseover");})
			},
			
			end:0
	});
	
	Searchweb.Business.lazyloadModule2 = lazyloadModule2;	
	
})(jQuery);

