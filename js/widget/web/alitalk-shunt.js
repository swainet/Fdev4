/*
 * 阿里旺旺 3.1 分流组件（依赖alitak组件）
 * @create 20110227 raywu
 *++++++++++++++++++++
 * @use
 *		html
 * <a href="#" data-shunt="{ruleId:'ALITALK_INCALL_ROLE_CTP01',positionId:'Top_Banner'}">333</a>
 * <a href="#" data-shunt="{}">333</a>
 * @update Denis 使用eval，此处不需要安全校验 ---- 2011.11.07
 * @update Raywu 新增free会员导向阿牛助手 ---- 2012.02.01
 */
("shunt" in FE.util.alitalk) ||
(function($, Util){
    var defaults = {
        attr: 'shunt', //组件标记承载属性
        aliTalkId: 'aliservice29', // 默认分流失败后使用talkid
        ruleId: 'ALITALK_INCALL_ROLE_CTP01', // 默认分流ruleid
        positionId: 'Top_Banner', // 默认分流positionid
        shuntUrl: 'http://athena.china.alibaba.com/athena/aliTalkInCall.json' //分流服务器url（只需保证传指定3要素,memberId、ruleId、positionId，返回格式与现有一致）
        //onClickBegin: null,
        //onClickEnd: null
    }, shunt = function(els, options){
        if ($.isPlainObject(els)) {
            $.extendIf(options, defaults);
            els = $('a[data-' + options.attr + ']');
        }
        else {
            options = options || {};
            $.extendIf(options, defaults);
            els = $(els);
        }
        if (els.length) {
            els.each(function(){
                var el = $(this),
					dataStr = el.attr(options.attr) || el.data(options.attr) || '{}';
				//需要解决attr和data取出结果为object的问题
				dataStr = $.extendIf(eval('(' + ((typeof dataStr === 'string')?dataStr:'{}') + ')'), options);
                el.data('alitalkShunt', dataStr);
            }).bind('click', onClickHandler);
        }
    };
    function onClickHandler(event){
        var t=this,
			data = $(t).data('alitalkShunt'),
			talkObjId = {};
        event.preventDefault();
        
        //点击事件触发前
        if (data.onClickBegin) {
            if (!data.onClickBegin.call(t, event)) {
                return;
            }
        }
        talkObjId.id = data.aliTalkId;
        $.ajax(data.shuntUrl, {
            dataType: 'jsonp',
            data: {
                memberId: Util.loginId,
                ruleId: data.ruleId,
                positionId: data.positionId
            },
            success: function(o){
                if (o.success && o.aliTalkId ) {
					/*
					 * 返回结果的类型resultType目前虽然只有两种类型，但是以后有扩展可能，暂时用switch
					 * 返回结果的数据因为历史原因，暂时保存在aliTalkId字段中。。。
					*/
					switch(o.resultType){
						case 'aliYUrl':
							Util.goTo(o.aliTalkId,'_blank');
							break;
						case 'alitalkId':
						default :
							talkObjId.id = o.aliTalkId;
							Util.alitalk(talkObjId);
							break;
					}
                }else{
					Util.alitalk(talkObjId);
				}
            },
            error: function(){
                Util.alitalk(talkObjId);
            }
        });
        //点击事件触发后
        if (data.onClickEnd) {
            data.onClickEnd.call(t, event);
        }
    }
    /*
     * 静态变量及方法
     */
    Util.alitalk.shunt = shunt;
    $.add('web-alitak-shunt');
})(jQuery, FE.util);
