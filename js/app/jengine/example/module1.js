!(function($){
	
	var Sandbox,
		configs = {
			end:0
		};
	
	function Module1(sb) {
		Sandbox = sb;
		return Module1;
	}
	
	$.extend(Module1,{
				
			init:function(cfg){
			
				this.config = $.extend(true, {}, configs, cfg);
				this._bindEvent();
			},
			
			//简易的MVC分层模式，以下三个函数分别对应controller、modal、view层。
			//模块开发时请使用相同的函数名称，便于团队合作开发。
			_bindEvent:function(){
			
				var data={msg:"send from Module1"};
				$('#sandboxBtn').bind('click', function(){Sandbox.notify(Searchweb.Config.Events.DELETE, data);});
			},
			
			_fetchdata:function(){
				
				Searchweb.Utility.getRPCJsonp(url,{
					data:"name=John&location=Boston",
					success:function(content){
						
					
					}
				});
			},
			
			_renderView:function(node, data){
			
				var template = '<% for ( var i = 0; i < $data.length; i++ ) { %>\
					<dl>\
						<dt>\
							<a href="javascript:;">\
								<img alt="" src="<%= $data[i].src %>" width="100" />\
							</a>\
						</dt>\
						<dd class="title"><a href="javascript:;" title="<%= $data[i].title %>"><%= $data[i].title.cut(14,"...") %></a></dd>\
						<dd class="price"><span class="cny">￥</span> <em><%= $data[i].price.toFixed(2) %></em></dd>\
						<dd class="describe"><%= $util.trim($data[i].describe) %></dd>\
					</dl>\
					<% } %>';

				Searchweb.Config.renderHTML(template,data,node);
			},
			
			end:0
	});
	
	Searchweb.Business.Module1 = Module1;
		
})(jQuery);

