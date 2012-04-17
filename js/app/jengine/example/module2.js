!(function($){

	var Sandbox,
		configs = {
		end:0
	};
		
	function Module2(sb) {
		Sandbox = sb;
	}
	
	$.extend(Module2.prototype,{
				
			init:function(cfg){
			
				this.config = $.extend(true, {}, configs, cfg);
				this.createHTML();
				
				Sandbox.on( Searchweb.Config.Events.DELETE, this.create);
				Sandbox.on( "jEngine.ready", function(){$.logger.log("All modules are ready!")});
			},
			
			create:function(data){

				alert("Module2 got the message:" + data.msg);
			},
			
			createHTML:function(){
				//alert(i.i);
			},
			end:0
	});
	
	Searchweb.Business.Module2 = Module2;
	
})(jQuery);

