/*
 * jQuery UI Flash-chart 1.1
 *
 * @author xutao 2011.03.24
 * @update Denis 2011.06.14 使用新的flash插件注册方式
 * @update Denis 2011.07.27 提供swf的可配置
 * Depends:
 *	jQuery.ui.flash
 */
('chart' in jQuery.ui.flash) ||
(function($, undefined){
    var $util = $.util, chart = function(){
        /**
         * 图表组件构造
         */
        if ($util.flash.hasVersion(10)) {
            var self = this, swfid = self.element[0].id, o = self.options, //图表类型line:折线图 bar:柱状图 hbar:水平柱状图 pie:饼图 
 				swfurl = o.swf || $util.substitute('http://img.china.alibaba.com/swfapp/chart/yid-chart-{0}.swf', [o.type]);
            o = self.options = $.extend(true, {
                width: 700,
                height: 400,
                swf: swfurl,
                //允许脚本
                allowScriptAccess: 'always',
                flashvars: {
                    startDelay: 500,
                    //事件钩子
                    eventHandler: 'jQuery.util.flash.triggerHandler'
                }
            }, o);
            $.extend(self, {
                /**
                 * 配置Chart的配置参数
                 */
                _getFlashConfigs: function(){
                    var self = this, configs;
                    //调用原始方法
                    configs = $.ui.flash.prototype._getFlashConfigs.call(self);
                    //这里去掉多余的参数
                    delete configs.type;
                    //这里的swfid其实是容器id
                    configs.flashvars.swfid = swfid;
                    return configs;
                },
                /**
                 * 载入XML数据文件
                 * @param {string} xmlurl xml数据文件的URL
                 * @return {boolean} 成功返回true，否则返回false
                 */
                load: function(dataurl, charset){
                    charset = charset || 'utf-8';
                    return this.obj.load(dataurl, charset);
                },
                /**
                 * 载入CSS文件
                 * @param {string} cssurl css文件的URL
                 * @return {boolean} 成功返回true，否则返回false
                 */
                loadCSS: function(cssurl, charset){//载入CSS文件
                    charset = charset || 'utf-8';
                    return this.obj.loadCSS(cssurl, charset);
                },
                /**
                 * 载入XML字符串
                 * @param {string} xmlString xml字符串
                 * @return {boolean} 成功返回true，否则返回false
                 */
                parse: function(xmlString){
                    return this.obj.parse(xmlString);
                },
                /**
                 * 载入CSS字符串
                 * @param {string} cssString css字符串
                 * @return {boolean} 成功返回true，否则返回false
                 */
                parseCSS: function(cssString){
                    return this.obj.parseCSS(cssString);
                },
                /**
                 * 设置某条数据可见性
                 * @param {int} index 数据索引
                 * @param {boolean} active 可见性true|false
                 * @return {boolean} 成功返回true，否则返回false
                 */
                setDatasetVisibility: function(index, active){
                    return this.obj.setDatasetVisibility(index, active);
                },
                /**
                 * 获得某条数据的可见性
                 * @param {int} index 数据索引
                 * @return {boolean} 可见返回true，不可见返回false
                 */
                getDatasetVisibility: function(index){
                    return this.obj.getDatasetVisibility(index);
                },
                /**
                 * 设置某条数据的激活状态
                 * @param {int} index 数据索引
                 * @param {boolean} active 是否激活true|false
                 * @return {boolean} 成功返回true，否则返回false
                 */
                setDatasetActivity: function(index, active){
                    return this.obj.setDatasetActivity(index, active);
                },
                /**
                 * 获得某条数据的激活状态
                 * @param {int} index 数据索引
                 * @return {boolean} 激活返回true，未激活返回false
                 */
                getDatasetActivity: function(index){
                    return this.obj.getDatasetActivity(index);
                }
            });
            return true;
        }
        return false;
    };
    $util.flash.regist('chart', chart);
    $.add('ui-flash-chart');
})(jQuery);
