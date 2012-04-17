/**
 * Grid
 * @Author: ding.shengd 2011.09.27
 */
('Grid' in FE.ui) ||
(function($, UI, undefined){
   
	GridColModel = function(attrs){
		this.defaults = attrs.defaults;
		this.columns = attrs.columns;
		for(key in this.columns){
			if(!this.columns[key].width)
				this.columns[key].width = this.defaults.width;
			if( typeof this.columns[key].sortable == "undefined" || this.columns[key].sortable == null )
				this.columns[key].sortable = this.defaults.sortable;
		}
	}
	GridColModel.prototype = {
		push:function(o){
			this.columns.push(o);
		},
		get:function(){
			return this.columns;
		},
		_getSchemaBykey:function(keyId){
			var o = [];
			var i = 0;
			while(this.columns[i]){
				o[i] = this.columns[i][keyId];
				i++;
			}
			return o;
		},
		/**
		*  return {Array} [sex,age,birthday,name]
		*/
		getIdSchema:function(){
			return this._getSchemaBykey('id');
		},
		/**
		*  return {Object} {sex:{id:'sex',header: '性别', dataIndex: 'sex',renderer:onRender},age:{id: 'age', header: '年龄', dataIndex: 'age'}}
		*/
		getIdColModelMap:function(){
			var o = {};
			for(key in this.columns){
				 o[this.columns[key].id] = this.columns[key];
			}
			return o;
		},
		/**
		*  return {Array} [sex,age,birthday,name]
		*/
		getDataIndexSchema:function(){
			return this._getSchemaBykey('dataIndex');
		}
	}
  
 /**
 * grid 
 * @class grid
 * @namespace FE.ui
 * @constructor
 * @param {String} id  grid的容器Id
 * @param {Object} attrs  配置属性 eg：{hasPagebar:true,limit:10}
 */
  
Grid = function(id,attrs) {
	this.id = id;
	this.attributes = attrs;
	
	/**
	*@field {Number} width  宽度
	*/
	this.width =( this.attributes && this.attributes.width)?this.attributes.width:'100%';
	/**
	*@field {Number} height  高度,默认高度为随着列表的条数自动拉升
	*/
	this.height =( this.attributes && this.attributes.height)?this.attributes.height:false;
	/**
	*@field {Number} limit  分页数 默认:10
	*/	
	this.limit = ( this.attributes && this.attributes.limit)?this.attributes.limit:10;
		/**
	*@field {Number} toPageNum  开始显示第几页，默认是第一页 默认:10
	*/	
	this.toPageNum = ( this.attributes && this.attributes.toPageNum)?this.attributes.toPageNum:1;
	/**
	*@field {Boolean} checkbox  是否有checkbox ,默认:false
	*/
	this.checkbox = ( this.attributes && this.attributes.checkbox)?this.attributes.checkbox:false;
	/**
	*@field {Boolean} hasPages  是否有总共多少页 ,默认:false
	*/
	this.hasPages = ( this.attributes && this.attributes.hasPages)?this.attributes.hasPages:false;
	/**
	*@field {Boolean} hasPagebar  是否有翻页条 ,默认:true
	*/
	this.hasPagebar =( this.attributes && !(typeof this.attributes.hasPagebar == "undefined"|| this.attributes.hasPagebar ==null) && !this.attributes.hasPagebar)?this.attributes.hasPagebar:true;
	/**
	*@field {Boolean} isRowAuto  是否根据数据的数目显示多少行 ,默认:true
	*/
	this.isRowAuto =( this.attributes && !(typeof this.attributes.isRowAuto == "undefined"|| this.attributes.isRowAuto ==null) && !this.attributes.isRowAuto)?this.attributes.isRowAuto:true;
	/**
	*@field {Boolean} hasTips  是否有tips ,默认:true
	*/
	//this.hasTips =( this.attributes && !(typeof this.attributes.hasTips == "undefined"|| this.attributes.hasTips ==null) && !this.attributes.hasTips)?this.attributes.hasTips:true;
	
	/**
	*@field {String} defaultSort  默认排序 ,默认:false
	*/
	this.defaultSort =( this.attributes && this.attributes.defaultSort)?this.attributes.defaultSort:'';
	/**
	*@field {String} dir  排序顺序 ,默认:desc,asc
	*/
	this.dir =( this.attributes && this.attributes.dir)?this.attributes.dir:'desc';
	/**
	*@field {Boolean} 	  是否可以多选 ,默认:false
	*/
	this.multiSelect = ( this.attributes && this.attributes.multiSelect)?this.attributes.multiSelect:false;

	this.store = null;
	this.schema = null;
	this.colModel=null;
	
	/**
	*@field {Number} start 往后台请求数据时参数，用于翻页  ,默认0
	*/
	this.start = 0 ;

	/**
	*@field {Number} currentPage 当前页，默认第一页
	*/
	this.currentPage= 1;
	/**
	*@field {Number} totalCount  全部数据总数
	*/
	this.totalCount = 0;
	
	this._events = {};
	this.selectDatas = {};
	
}
Grid.prototype = {
	/**
	 * 初始化Grid
	 * 
	 * @param {String} sUrl 请求地址
	 * @param {Object} oColModel 列模型 ，如：[	{
							header: '邮件状态',
							width: 80,
							dataIndex:'type',
							sortable: true
						},{
							header:'customerAddress',
							dataIndex: 'customerAddress',
							width: 68,
							sortable: true
							
						}]
	 * @param {Object} oSchema 数据模型 ，如：['type','customerAddress']
	 */
	init:function(sUrl,oColModel,oSchema){
		var o = this;
		this.url = sUrl;
		this.schema = oSchema;
		if(this.checkbox){
			oColModel.push({id: 'checkbox',renderer:o._renderCheckBox});
			
			this.checkAll = $('#'+this.id+' input.xui-simpleGrid-hd-checkbox').eq(0);
			this.checkAll.bind('click',function(){
								if(o.checkAll.attr('checked')){
									o.selectAll();
								}else{
									o.cleanRow();
								}
			})

		}
		//列模型
		this.colModel = oColModel.get();
		//列模型中的id集合
		this.idSchema = oColModel.getIdSchema();
		//列模型中的dataIndex集合
		this.dataIndexSchema = oColModel.getDataIndexSchema();
		
		this.colModelMap = oColModel.getIdColModelMap();
		
		//全部行的对象数组
		this.rowDoms = $('#'+this.id+' div.xui-simpleGrid-row'); //xui.util.Dom.getElementsByClassName('xui-simpleGrid-row','div',this.id);
		this._addRowDomsEvents();
		
		this.getHdDoms();
		this._addHdDomsEvents();
		this._renderHead();
		
		this.firstBtnDom = $('#'+this.id+' button.xui-pagebar-btn-first').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-first','button',this.id)[0];
		this.prevBtnDom = $('#'+this.id+' button.xui-pagebar-btn-prev').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-prev','button',this.id)[0];
		this.lastBtnDom = $('#'+this.id+' button.xui-pagebar-btn-last').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-last','button',this.id)[0];
		this.nextBtnDom = $('#'+this.id+' button.xui-pagebar-btn-next').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-next','button',this.id)[0];

		this.numberBtnDom = $('#'+this.id+' input.xui-pagebar-btn-number').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-number','input',this.id)[0];
		this.numberStartDom = $('#'+this.id+' span.xui-pagebar-start').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-start','span',this.id)[0];
		this.numberEndDom = $('#'+this.id+' span.xui-pagebar-end').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-end','span',this.id)[0];
		this.numberTotalDom = $('#'+this.id+' span.xui-pagebar-total').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-total','span',this.id)[0];
		this.numberGoDom = $('#'+this.id+' button.xui-pagebar-btn-go').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-go','button',this.id)[0];
		
		this.numberTotalPages = $('#'+this.id+' span.xui-pagebar-pages').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-pages','span',this.id)[0];
		
		if(this.hasPagebar)
			this._initPageBar();
		this.toPage(this.toPageNum);
		
		
		//$(o).triggerHandler("oninit", [o,2,3]);
	},
	_renderCheckBox:function(v,os,rowIndex,g){
		var checked = v?'checked':'';
		//如果checkbox挂了事件，重现渲染就会冲掉事件，所以只需要重新给checkbox赋值就可以了
		var cbDom = $('#xui-simpleGrid-'+g.id+'-'+rowIndex).get(0);
		if(cbDom){
			cbDom.checked = checked;
		}else{
			return '<input id="xui-simpleGrid-'+g.id+'-'+rowIndex+'" name="" class="xui-simpleGrid-row-checkbox" type="checkbox" value="" '+checked+' />';
		}
	},
	/**
	* 	 @return {Object} {sex:	HTMLElement , age:HTMLElement} 
	*/
	getHdDoms:function(){
		var o =this;
		if(! this.hdDoms){
			this.hdDoms = {};
			//var hdBodyDom = xui.util.Dom.getElementsByClassName('xui-simpleGrid-header','div',this.id)[0];
			//for(key in this.idSchema){
				//待定
				//this.hdDoms[this.idSchema[key]] = $('#'+this.id+' .xui-simpleGrid-header td.xui-simpleGrid-hd-'+this.idSchema[key]).eq(0);
			//}
			
			$.each(this.idSchema,function(key,value) {
				o.hdDoms[value] = $('#'+o.id+' .xui-simpleGrid-header td.xui-simpleGrid-hd-'+o.idSchema[key]).eq(0);
			});
		}
		return this.hdDoms;
	},
	/**渲染头部
	*
	*
	*/
	_renderHead:function(){
		for(key in this.hdDoms){
			if(key != 'checkbox'&&key != 'undefined'){
				if(typeof this.hdDoms[key] != "undefined"){
					var hdDomDiv = $('div.xui-simpleGrid-hd-inner', this.hdDoms[key]).get(0);
					var hdInnerHTML = this.colModelMap[key].header ;
					hdDomDiv.innerHTML =hdInnerHTML +'<button  class="xui-simpleGrid-sort" ></button>';
				}
			}
		}
	
	},
	//加默认头部事件
	_addHdDomsEvents:function(){
		var o =this;
		for(key in this.colModelMap){
			if(this.colModelMap[key].sortable  == true){
				if(this.hdDoms[key]){
					this.hdDoms[key].addClass('xui-simpleGrid-sort-default');
					this.hdDoms[key].bind('click',{hdId: key},function(event){
						var hdId = 	event.data.hdId;	
						o.sort(hdId);
					})
				}
			}
		}
	},
	_addCheckBoxEvent:function(){
		var o =this;
		
		$.each(o.rowDoms,function(key,value) {
			if($('#xui-simpleGrid-'+o.id+'-'+key).get(0)){
				var p = $('#xui-simpleGrid-'+o.id+'-'+key).parent();
				p.bind('click',function(event){ event.stopPropagation();});
				p.parent().bind('click',function(event){ event.stopPropagation();});
			}
				
			$('#xui-simpleGrid-'+o.id+'-'+key).bind('click',{rowIndex:key,obj:o},function(event){
				var rowIndex = event.data.rowIndex;	

				var o = event.data.obj;	
				$(o).triggerHandler("checkboxclick", [o.rowDatas[rowIndex]]);
				
				if($('#xui-simpleGrid-'+o.id+'-'+rowIndex).attr('checked')){
					o.selectRowByIndex(rowIndex);
				}else{
					o.unselectRowByIndex(rowIndex);
				}
				//取消冒泡，防止触发click事件
				//return false;
				 event.stopPropagation();

			});
		
		});
	},

	//加默认行事件
	_addRowDomsEvents:function(){
		var o =this;
		$.each(o.rowDoms,function(key,value) {
			o.rowDoms.eq(key).bind({
					click:function(event){
						var rowIndex = event.data.rowIndex;	
						if(o._isInDatasRow(rowIndex)){
							if(!o.multiSelect){
								o.cleanRow();
							}
							//多选模式开启的时候，单击先选中，再单击不选中
							if(o.multiSelect){
								if($('#xui-simpleGrid-'+o.id+'-'+rowIndex).attr('checked')){
									o.unselectRowByIndex(rowIndex);
								}else{
									
									o.selectRowByIndex(rowIndex);
								}
							}else{
								o.selectRowByIndex(rowIndex);
							}
							if(o.rowDatas){
								$(o).triggerHandler("rowclick", [o.rowDatas[rowIndex]]);
							}
						}
					
					}				
			},{rowIndex:key});
			
			o.rowDoms.eq(key).bind('dblclick mouseenter mouseleave',{rowIndex:key},function(event){
					var rowIndex = event.data.rowIndex;	
					var type = event.type;
					if(o._isInDatasRow(rowIndex)){
						
							switch (type){
								case 'dblclick':
									if(o.rowDatas){
										$(o).triggerHandler('rowdblclick',[o.rowDatas[rowIndex]]);
									}
									break;
								case 'mouseenter':
									o.hoverRowByIndex(rowIndex);
									if(o.rowDatas){
										$(o).triggerHandler('rowmouseover',[o.rowDatas[rowIndex]]);
									}
									break;
								case 'mouseleave':
									o.unhoverRowByindex(rowIndex);
									if(o.rowDatas){
										$(o).triggerHandler('rowmouseout',[o.rowDatas[rowIndex]]);
									}
									break;
								
							
						}
					}
			});
		});
	},
	_initPageBar:function(){
		var o =this;
		this.firstBtnDom.bind('click',function(){
			o.toFirstPage();
			});
		this.prevBtnDom.bind('click',function(){
			o.toPrevPage();
			});
		this.lastBtnDom.bind('click',function(){
			o.toLastPage();
			});
		this.nextBtnDom.bind('click',function(){
			o.toNextPage();
			});
		this.numberGoDom.bind('click',function(){
			o.toNumberBtnPage();
			});
		//回车事件
		this.numberBtnDom.bind('keydown',function(event){
			if(event.keyCode == 13){
				o.toNumberBtnPage();
			}
			});
	},
	//判断此row是否在数据域内
	_isInDatasRow:function(rowIndex){
		return (this.rowDatas && this.rowDatas[rowIndex])?true:false;
	},
	
	/**
	 * 排序切换
	 * 
	 * @param {String} hdId 列的ID
	 * @param {String} dir 排序方式 'desc'和'asc'
	 */	
	_dirSwitch:function(hdId,dir){
		
		if(this.currentHdId){
			this.hdDoms[this.currentHdId].removeClass('xui-simpleGrid-sort-asc xui-simpleGrid-sort-desc');
			this.hdDoms[this.currentHdId].addClass('xui-simpleGrid-sort-default');
	
		}
		//切换排序字段时初始排序顺序为降序（询盘管理三期引入）by eric.yangl
		if(this.currentHdId!=hdId){
			if(this.dir && this.dir == 'desc'){
				this.dir = 'asc';
			}
		}
		//强制制定排序方式
		if(dir && dir == 'desc'){
			this.dir = 'asc';
		}else if(dir && dir == 'asc'){
			this.dir = 'desc';
		}
		
		if(this.dir == 'desc'){
			this.dir = 'asc';
			this.hdDoms[hdId].removeClass('xui-simpleGrid-sort-default xui-simpleGrid-sort-asc');
			this.hdDoms[hdId].addClass('xui-simpleGrid-sort-asc');
		}
		else if(this.dir == 'asc'){
			this.dir = 'desc';
			this.hdDoms[hdId].removeClass('xui-simpleGrid-sort-default xui-simpleGrid-sort-asc');
			this.hdDoms[hdId].addClass('xui-simpleGrid-sort-desc');
		}
		//当前排序的hdId
		this.currentHdId = hdId;
	},
	/**
	 * 指定列排序	
	 * 
	 * @param {String} hdId 列的ID
	 * @param {String} dir 排序方式 'desc'和'asc',
	 * @param {String} beFirst 排序是否回到第一页，默认为false
	 */	
	sort:function(hdId,dir,beFirst){
		var o = this;
		this.defaultSort = hdId;
		this._dirSwitch(hdId,dir);
		if(beFirst && beFirst == true){
			this.reload()
		}else{
			this.load();
		}
		
		$(o).triggerHandler('sort',[hdId]);
	},
	/**
	* * 设置dataSource的baseParams,并返回第一页
	*/
	reload:function(oParams){
		if(oParams)
			this.setParams(oParams);
		this.toFirstPage();
	},
	/**
	*
	*/
	load:function(){
		this.toPage(this.currentPage);
	},
	/**
	*选中全部行
	*/
	selectAll:function(){
		var l = this.rowDoms.length;
		for(var i = 0 ;i<l;i++){
			this.selectRowByIndex(i);
		}
/*		for(key in  this.rowDoms){
			this.selectRowByIndex(key);
		}*/
		if(this.checkbox){
			//this.checkAll.checked = true;
			this.checkAll.attr('checked',true);
		}
	},
	/**
	 * 选择指定行	//如果显示的数据比limit少，那些行的事件需要特殊处理
	 * 
	 * @param {Number} rowIndex 行号
	 */	
	selectRowByIndex:function(rowIndex){
		var o =this;
		if ( this.rowDatas && ! (rowIndex>(this.rowDatas.length-1))){
			
			this.rowDoms.eq(rowIndex).addClass('xui-simpleGrid-row-selected');
			this.selectRowIndex = rowIndex;
			
			$(o).triggerHandler('rowselect',[this.rowDatas[rowIndex]]);
			//插入选中的数据
			this._registerSelectData(rowIndex);
			//如果与有checkbox需要勾上
			if(this.checkbox){
				if($('#xui-simpleGrid-'+this.id+'-'+rowIndex).get(0)){
					$('#xui-simpleGrid-'+this.id+'-'+rowIndex).attr('checked',true);
				}
			}
		}
	},
	/**
	*得到选中后的行号
	*/
	getSelectRowIndex:function(){
		if(this.selectRowIndex)
			return this.selectRowIndex;
	},
	/**
	*得到鼠标移动上去的行号
	*/
	getMouseoverRowIndex:function(){
		if(this.mousoverRowIndex)
			return this.mousoverRowIndex;
	},
	/**
	*取消选择的行
	*/
	unselectRowByIndex:function(rowIndex){
		var o =this;
		if ( this.rowDatas && ! (rowIndex>(this.rowDatas.length-1))){
			this.rowDoms.eq(rowIndex).removeClass('xui-simpleGrid-row-selected');
			$(o).triggerHandler('unrowselect',[this.rowDatas[rowIndex]]);
			this._unRegisterSelectData(rowIndex);
			if(this.checkbox){
				if($('#xui-simpleGrid-'+this.id+'-'+rowIndex).get(0)){
					$('#xui-simpleGrid-'+this.id+'-'+rowIndex).attr('checked',false);
				}
			}

		}
			
	},
	/**
	*清楚全部选中
	*/
	cleanRow:function(){
		//for(key in  this.rowDoms){
			//this.unselectRowByIndex(key);
			//xui.util.Dom.removeClass(this.rowDoms[key],'xui-simpleGrid-row-selected');
			
		//}
		var l = this.rowDoms.length;
		for(var i = 0 ;i<l;i++){
			this.unselectRowByIndex(i);
		}
		if(this.checkbox){
			this.checkAll.attr('checked',false);
		}
	},
	hoverRowByIndex:function(rowIndex){
		this.mousoverRowIndex = rowIndex;
		this.rowDoms.eq(rowIndex).addClass('xui-simpleGrid-row-hover');
	},
	unhoverRowByindex:function(rowIndex){
		this.mousoverRowIndex = null;
		this.rowDoms.eq(rowIndex).removeClass('xui-simpleGrid-row-hover');
	},
	/**
	 * 设置dataSource的参数
	 * @param {Object} oParames ，如：{stateType: 'abc',sType:1}会传这些参数和值给后台
	 */
	setParams:function(oParams){
		if(oParams){
			for(var k in oParams){
				oParams[k] = encodeURIComponent(oParams[k]);
			}
			this.params= oParams;
		}
	},
	_getParamsString:function(){
		var str = '';
		for(k in this.params){
			if(k == 'defaultSort'){
				this.defaultSort = this.params[k];
			}else if(k == 'dir'){
				this.dir = this.params[k];
			}else if(k == 'limit'){
				this.limit = this.params[k];
			}else{
				str +=  '&'+k +'='+this.params[k]+'';
			}
		}
		return str;
	},

	toPage:function(pageNumber){
		this.cleanRow();
		var start = (pageNumber-1)*this.limit;
		
		//如果排序的id存在，因为有可能排序的id是在scheme中有，而id中没有，那么就不需要现实排序的样式了
		if(this.colModelMap[this.defaultSort])
			this._dirSwitch(this.defaultSort,this.dir);
		
		this._getData(start);
		
		this.currentPage = parseInt(pageNumber,10);
	},
	//是否隐藏上一个和第一个按钮
	_isHiddenPreButton:function(isHidden){
		if(this.firstBtnDom.get(0)){
			this.firstBtnDom.attr('disabled',isHidden);
		}
		if(this.prevBtnDom.get(0)){
			this.prevBtnDom.attr('disabled',isHidden);
		}
		if(isHidden){
			this.firstBtnDom.addClass('xui-pagebar-btn-first-disabled');
			this.prevBtnDom.addClass('xui-pagebar-btn-prev-disabled');
		}else{
			this.firstBtnDom.removeClass('xui-pagebar-btn-first-disabled');
			this.firstBtnDom.addClass('xui-pagebar-btn-first');
			this.prevBtnDom.removeClass('xui-pagebar-btn-prev-disabled');
			this.prevBtnDom.addClass('xui-pagebar-btn-prev');
		}
	},
	//是否隐藏下一个和最后一个按钮
	_isHiddenNextButton:function(isHidden){
		if(this.lastBtnDom.get(0)){
			this.lastBtnDom.attr('disabled',isHidden);
		}
		if(this.nextBtnDom.get(0)){
			this.nextBtnDom.attr('disabled',isHidden);
		}
		if(isHidden){
			this.lastBtnDom.addClass('xui-pagebar-btn-last-disabled');
			this.nextBtnDom.addClass('xui-pagebar-btn-next-disabled');
		}else{
			this.lastBtnDom.removeClass('xui-pagebar-btn-last-disabled');
			this.lastBtnDom.addClass('xui-pagebar-btn-last');
			this.nextBtnDom.removeClass('xui-pagebar-btn-next-disabled');
			this.nextBtnDom.addClass('xui-pagebar-btn-next');
		}
	},
	_rendPageBar:function(){
		var start = (this.currentPage-1)*this.limit;
		if( this.isFirstPage(this.currentPage) && this.isLastPage(this.currentPage)){
			this._isHiddenPreButton(true);
			this._isHiddenNextButton(true);
		}else if(this.isFirstPage(this.currentPage)){
			this._isHiddenPreButton(true);
			this._isHiddenNextButton(false);
			
		}else if(this.isLastPage(this.currentPage)){
			this._isHiddenNextButton(true);
			
			this._isHiddenPreButton(false);
		}else{
			this._isHiddenPreButton(false);
			this._isHiddenNextButton(false);
		}
		if(this.hasPagebar){
			if(this.numberBtnDom.get(0)){
				this.numberBtnDom.attr('value', this.currentPage);
			}
			if(this.numberStartDom.get(0)){
				if(this.totalCount == 0){
					this.numberStartDom.html('0');
				}else{
					this.numberStartDom.html(start+1);
				}
			}
			if(this.numberEndDom.get(0)){
				//如果每页数目小于总条数，或者最后一页
				if( this.limit>this.totalCount || (this.isLastPage()) )
					this.numberEndDom.html(this.totalCount);
				else {
					this.numberEndDom.html(start+this.limit);
				}
			}
			//是否有总页数显示
			if(this.hasPages && this.numberTotalPages.get(0)){
				var lastPage = Math.ceil(this.totalCount/this.limit);
				this.numberTotalPages.html( lastPage);
				
			}

		}
	},
	_initSore:function(){
		
	},
	/**
	*
	*/
	_getData:function(start){
		var defaultParms= 'start='+start+'&sort='+(this.defaultSort?this.defaultSort:'')+'&dir='+(this.dir?this.dir:'')+'&limit='+(this.limit?this.limit:'');
		var parms = ''
		if(this.params){
			parms = this._getParamsString();
		}
		var o = this;
		try{
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: this.url,
                data: defaultParms + parms,
                success: function(res) {
                    o.store = res;
                    
                    if (res.isSuccess === false) {
                        $(o).triggerHandler('dserror', [res.message]);
                    } else {
                        o._rendData(res);
                    }
                    
                },
                error: function() {
                    $(o).triggerHandler('ajaxerror');
                }
            });
		}catch(e){};
	},
	/**
	*根据数据的数目显示多少行
	*/
	_cleanRow:function(l){
		var rowdomsL = this.rowDoms.length;
		for(var i = 0 ;i<rowdomsL;i++){
			this.rowDoms.eq(i).css('display' ,(i>=l)? 'none':'block'); 
		}
	},
	_rendData:function(o){
		this.rowDatas = o.data;
		this.totalCount = o.totalCount;
		if(this.hasPagebar && this.numberTotalDom.get(0)){
			this.numberTotalDom.html( this.totalCount);
		}
		//如果没有数据，回到前一页
		var l = this.rowDatas.length;

		this.dataRowDoms = this.rowDoms;
		
		//返回数据的条数大于this.limit的内容，只能渲染this.limit的条数
		l = (l>this.limit)? this.limit : l;
		
		//根据数据的数目显示多少行
		if(this.isRowAuto)
			this._cleanRow(l);
		
		for(var i = 0; i<l;i++){
			this.setRowData(i,this.rowDatas[i]);
		}
		//如果数据比每页的条数少，还需要删除掉前一页未被覆盖的数据
		if(this.limit>l){
			this.dataRowDoms = this.rowDoms.slice(0,l);
			for(var j = l;j<this.limit;j++){
				this.cleanRowData(j);
			}
		}
		//加checkbox事件
		if(this.checkbox){
			this._addCheckBoxEvent();
		}
		if(this.hasPagebar)
			this._rendPageBar();
		
		var o = this;
		$(o).triggerHandler('dsload',[o]);
		
		if(l==0){
			this.toPrevPage();
			return ;
		}
	},
	/**
	 * 设置一行里面的内容
	 * 
	 * @param {Number} rowIndex 行号
	 * @param {Object} {sex:"1",age:"2222123",birthday:"2008-10-11",name:"1111",status:"1"}
	 */	
	setRowData:function(rowIndex,rowData){
		//设置数据
		for(var p in rowData){
            this.rowDatas[rowIndex][p] = rowData[p];
    	}
		
		var l = this.idSchema.length;
		for(var i = 0 ;i<l ;i++){
			//根据id得到dataIndex，然后获取相应的值,有可能没有dataIndex,
			var v = '';
			if(this.colModelMap[this.idSchema[i]].dataIndex ){
				 v = this.rowDatas[rowIndex][ this.colModelMap[this.idSchema[i]].dataIndex ];
			}
			//处理当有checkbox选中的时候时候
			if(this.checkbox && this.idSchema[i] == 'checkbox'){
				if($('#xui-simpleGrid-'+this.id+'-'+rowIndex).get(0)){
					v = $('#xui-simpleGrid-'+this.id+'-'+rowIndex).attr('checked');
				}
			}
			this.setCellData(rowIndex,this.idSchema[i],v);
		}
	},
	/**清除row里面的内容
	*
	* @param {Number} rowIndex 行号
	*/
	cleanRowData:function(rowIndex){
		if(this.idSchema.length){
			 for(var i=0; i<this.idSchema.length; i++){
				this.cleanCellData(rowIndex,this.idSchema[i]);
			 }
		}else{
			for(key in this.idSchema){
				this.cleanCellData(rowIndex,this.idSchema[key]);
			}
		}
	},
	/**
	 * 设置cell里面的内容
	 * 
	 * @param {Number} rowIndex 行号
	 * @param {String} colId 列的id
	 * @param {String} v 要设置的值
	 */	
	setCellData:function(rowIndex,colId,v){
		
		if(this.getCellTextDomByIndex(rowIndex,colId).get(0)){
			//有渲染函数德列，需要调用渲染函数来渲染单元格
			if(this.colModelMap[colId].renderer){
				
			//var h,h1;
			//h = (h1 = a())?h1:false;
				//if(this.colModelMap[colId].renderer(v,this.rowDatas[rowIndex],rowIndex,this))
				try{
					var h = this.colModelMap[colId].renderer(v,this.rowDatas[rowIndex],rowIndex,this);
					if(h)
						this.getCellTextDomByIndex(rowIndex,colId).html(h);
				}catch(e){}
			}else{
				var fv = jQuery.util.escapeHTML(v);
				this.getCellTextDomByIndex(rowIndex,colId).html((typeof fv == "undefined"|| fv ==null) ? '' : fv);
				this.getCellTextDomByIndex(rowIndex,colId).attr('title', v);
			}
			if(this.colModelMap[colId].align)
				this.getCellTextDomByIndex(rowIndex,colId).css('textAlign' ,this.colModelMap[colId].align);
		}
		

	},
	/**清除cell里面的内容
	*
	* @param {Number} rowIndex 行号
	* @param {String} colId 列的id
	**/
	cleanCellData:function(rowIndex,colId){
		if(this.getCellTextDomByIndex(rowIndex,colId))
			this.getCellTextDomByIndex(rowIndex,colId).empty();
	},
	/**
	 * 获取返回的数据对象
	 * 
	 * @return {Object}
	 */
	getStore:function(){
		return this.store;
	},
	/**
	 * 根据行号得到行的jquery对象
	 * 
	 * @param {Number} rowIndex 行号
	 * @return {Object} jquery 
	 */	
	getRowDomByIndex:function(rowIndex){
		return this.rowDoms.eq(rowIndex);
	},
	/**
	 * 根据行号和列的id得到一格的jquery对象
	 * 
	 * @param {Number} rowIndex 行号
	 * @param {String} colId 列的id
	 * @return {Object} HTMLElement 
	 */	
	getCellDomByIndex:function(rowIndex,colId){
		var rowDom = this.getRowDomByIndex(rowIndex);
		var cellDom =  $('td.xui-simpleGrid-col-'+colId,rowDom).eq(0);
		return cellDom;
	},
	/**
	 * 根据行号和列的id得到一格的text jquery对象
	 * 
	 * @param {Number} rowIndex 行号
	 * @param {String} colId 列的id
	 * @return {Object} HTMLElement 
	 */	
	getCellTextDomByIndex:function(rowIndex,colId){
		var cellDom =  this.getCellDomByIndex(rowIndex,colId);

		var cellTextDom = cellDom.children().eq(0);
		return cellTextDom;
	},
	getSelect:function(){
		var o = [];
		var i = 0;
		for(key in this.selectDatas){
			o[i] = this.selectDatas[key];
			i++;
		}
		return o;
	},
	_registerSelectData : function(rowIndex){
        this.selectDatas['rowIndex'+rowIndex] = this.rowDatas[rowIndex];
  	},
	_unRegisterSelectData:function(rowIndex){
		 delete this.selectDatas['rowIndex'+rowIndex];
	},
	/**把行数据转换成列数据*/
	_tranData:function(){
		
	},
	toNextPage:function(o){
		var page = this.currentPage+1;
		this.toPage(page);
	},
	toPrevPage:function(){
		var page =this.currentPage-1;
		if(page < 1){
			return ;
		}
		this.toPage(page);
	},
	toFirstPage:function(){
		this.toPage(1);
	},
	toLastPage:function(){
		var lastPage = Math.ceil(this.totalCount/this.limit);
		this.toPage(lastPage);
	},
	toNumberBtnPage:function(){
		var num = jQuery.trim(this.numberBtnDom.attr('value'));
		var lastPage = Math.ceil(this.totalCount/this.limit);
		if(num>0 && num<=lastPage)
			this.toPage(num);
	},
	isFirstPage:function(){
		return (this.currentPage ==1)?true:false;
	},
	isLastPage:function(){
		//如果总共是0条数据，最后一页也算1
		var lastPage = Math.ceil(this.totalCount/this.limit);		
		lastPage = (lastPage == 0) ? 1: lastPage;
		return (this.currentPage ==lastPage)?true:false;
	},
	/**
	*获取当前页数
	*@return {Number}  
	*/
	getCurrentPage:function(){
		return this.currentPage;
	},
	/**
	*获取数据总数
	*@return {Number}  
	*/
	getTotalCount:function(){
		return this.totalCount;
	},
	/**
	*获取当前页的条数
	*@return {Number}  
	*/
	getPageCount:function(){
		return (this.rowDatas)? (this.rowDatas.length) :0;
	}
	
}   
   

    UI.Grid = Grid;
	UI.Grid.GridColModel =GridColModel;
    $.add('web-grid');
})(jQuery, FE.ui);
