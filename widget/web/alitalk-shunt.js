/*
 * 阿里旺旺 3.0 分流组件（依赖alitak组件）
 * @create 20110227 raywu
 *++++++++++++++++++++
 * @use
 *		html
 * <a href="#" data-shunt="{ruleId:'ALITALK_INCALL_ROLE_CTP01',positionId:'Top_Banner',aliTalkId:'wuleijun990'}">333</a>
 * <a href="#" data-shunt="{}">333</a>
 */
("shunt" in FE.util.alitalk) ||
(function($, Util){
    var defaults = {
        attr: "shunt", //组件标记承载属性
        aliTalkId: 'aliservice29', // 默认分流失败后使用talkid
        ruleId: 'ALITALK_INCALL_ROLE_CTP01', // 默认分流ruleid
        positionId: 'Top_Banner', // 默认分流positionid
        shuntUrl: "http://athena.china.alibaba.com/athena/aliTalkInCall.json", //分流服务器url（只需保证传指定3要素,memberId、ruleId、positionId，返回格式与现有一致）
        onClickBegin: null,
        onClickEnd: null
    }, shunt = function(els, options){
        if ($.isPlainObject(els)) {
            $.extendIf(options, defaults);
            els = $("a[data-" + options.attr + "]");
        }
        else {
            options = options || {};
            $.extendIf(options, defaults);
            els = (els) ? $(els) : $("a[data-" + options.attr + "]");
        }
        if (els.length) {
            els.each(function(){
                var el = $(this);
                var data = $.extendIf(parseObj(el.attr(options.attr) || el.data(options.attr) || {}), options);
                el.data("shunt", data);
            }).bind("click", onClickHandler);
        }
    };
    /*字符串转对象方法，避免使用evel方法，同时对节点属性"{}"获取出来为object型非string型做修复，同时捕获非法字符串返回空对象*/
    function parseObj(data){
        try {
            return (typeof data === "object") ? data : (new Function("return " + data))();
        } 
        catch (e) {
            return {};
        }
    }
    function onClickHandler(event){
        var element = $(this), data, talkObjId = {};
        if (event) {
            event.preventDefault();
            data = element.data("shunt");
        }
        else {
            data = this;
        }
        //点击事件触发前
        if (data.onClickBegin) {
            if (!data.onClickBegin.call(this, event)) {
                return;
            }
        }
        talkObjId.id = data.aliTalkId;
        $.ajax(data.shuntUrl, {
            dataType: "jsonp",
            data: {
                memberId: Util.loginId,
                ruleId: data.ruleId,
                positionId: data.positionId
            },
            success: function(o){
                if (o.success && o.aliTalkId) {
                    talkObjId.id = o.aliTalkId;
                }
                FE.util.alitalk(talkObjId);
            },
            error: function(){
                FE.util.alitalk(talkObjId);
            }
        });
        //点击事件触发后
        if (data.onClickEnd) {
            data.onClickEnd.call(this, event);
        }
    }
    /*
     * 静态变量及方法
     */
    Util.alitalk.shunt = shunt;
    $.add('web-alitak-shunt');
})(jQuery, FE.util);
