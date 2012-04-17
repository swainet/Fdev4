/*
 * jQuery UI Flash-uploader 2.0
 *
 * @author Denis 2011.12.28
 * Depends:
 *	jQuery.ui.flash
 * @update jianping.shenjp 2012.03.8 增加enableMultiple、disableMultiple、isMultiple方法，并在swfReady事件时，通过setBrowseFilter设置上传类型
 */
('Uploader2' in jQuery.ui.flash) ||
(function($, undefined){
    var $util = $.util;
    function uploader(){
        var self = this, swfid = self.element[0].id, o = self.options;
        o = self.options = $.extend(true, {
            swf: 'http://img.china.alibaba.com/swfapp/aliuploader/aliuploader-v3.2.swf',
            width: 65,
            height: 22,
            allowscriptaccess: 'always',
            fileFilters: [{
                description: "图片(*.jpg, *.jpeg, *.gif, *.png, *.bmp)",
                extensions: "*.jpg;*.jpeg;*.gif;*.png;*.bmp;"
            }],
            identity:"fname",//在中国站使用时，使用'fname'
            flashvars: {
                //enabled: false,
                //为了防止IE下跨域问题，统一设置为500
                startDelay: 500,
                // 按钮皮肤，需要从上至下提供“normal”“hover”“active”“disabled”四种状态图，且高度一致
                buttonSkin: 'http://img.china.alibaba.com/cms/upload/2011/040/820/28040_548721671.gif',
                //事件钩子
                eventHandler: 'jQuery.util.flash.triggerHandler'
            }
        }, o);
        //安装flash，并且flash版本不小于10
        if ($util.flash.hasVersion(10)) {
            //设置上传类型
            if (o.fileFilters) {
                self.element.bind('swfReady.flash', function(e, data){
                    self.obj.setBrowseFilter(o.fileFilters);
                });
            }
            //ps:扩展、重写flash类
            $.extend(self, {
                /**
                 * 配置Flash的配置参数
                 */
                _getFlashConfigs: function(){
                    var self = this, configs;
                    //调用原始方法
                    configs = $.ui.flash.prototype._getFlashConfigs.call(self);
                    //这里的swfid其实是容器id
                    configs.flashvars.swfid = swfid;
                    return configs;
                },
                _setOption: function(key, value){
                    $.ui.flash.prototype._setOption.call(this, key, value);
                    return this;
                },
                
                /**
                 * 上传
                 * @param {Object} url
                 * @param {Object} param
                 */
                uploadAll: function(url, param, fileFieldName){
                    url += ((url.indexOf('?') < 0) ? '?' : '&') + '_input_charset=UTF-8';
                    self.obj.uploadAll(url, param, fileFieldName, this._getFlashConfigs().identity);
                    return self;
                },
                /**
                 * 获取对应文件id的文件信息
                 * @param {Object} id
                 */
                getFileStatus: function(id){
                    return this.obj.getFileStatus(id);
                },
                /**
                 * 获取所有文件的信息
                 */
                getFileStatuses: function(){
                    return this.obj.getFileStatuses();
                },
                /**
                 * 设置文件过滤类型
                 * @param {Array} filter 数组元素格式如下：
                 *  {
                 *      //description是用户能看到的描述
                 *      description: '图片文件 (jpg,jpeg,gif)',
                 *      //extensions 是以分号分隔的后缀列表
                 *      extensions: '*.jpg; *.jpeg; *.gif;'
                 *  }
                 */
                setBrowseFilter: function(filter){
                    this.obj.setBrowseFilter(filter);
                    $.log('setBrowseFilter');
                    return this;
                },
                /**
                 * 动态修改每次上传个数限制
                 * @param {Int} n
                 */
                setFileCountLimit: function(n){
                    this.obj.setFileCountLimit(n);
                    $.log('setFileCountLimit:' + n);
                    return this;
                },
                /**
                 * 清空当前上传的文件状态列表
                 */
                clear: function(){
                    this.obj.clear();
                    $.log('clear');
                    return this;
                },
                /**
                 * 组件失效
                 */
                disable: function(){
                    self.obj.disable();
                    $.log('disable');
                    return this._setOption('disabled', true);
                },
                /**
                 * 组件有效
                 */
                enable: function(){
                    self.obj.enable();
                    $.log('enable');
                    return this._setOption('disabled', false);
                },
                /**
                 * 组件是否有效
                 */
                isEnabled: function(){
                    $.log('isEnabled');
                    return self.obj.isEnabled();               
                },
                /**
                 * 允许用户一次选择多个文件
                 */
                enableMultiple: function(){
                    $.log('enableMultiple');
                    self.obj.enableMultiple();
                    return this;               
                },
                /**
                 * 调用这个方法后，用户一次只能选择1个文件
                 */
                disableMultiple: function(){
                    $.log('disableMultiple');
                    self.obj.disableMultiple();
                    return this;               
                },
                /**
                 * 返回当前用户目前是否可以选择多个文件
                 */
                isMultiple: function(){
                    $.log('isMultiple');
                    return self.obj.isMultiple();   
                }
            });
            //需要flash组件提供后续操作 return true;
            return true;
        }else{
            $.extend(self,{
                //若没有flash或版本不够，提示下载flash
                _render:function(){
                        var elem = self.element, o = self.options;
                        elem.html('<a href="http://www.adobe.com/go/getflashplayer" target="_blank">抱歉，您未安装flash，无法使用上传功能，请先下载flash！</a>');
                        //设置容器
                        var con = $('>a', elem).css({
                            position:'static'
                        });
                }
            });
            self._render();
            //打点
            if (typeof window.dmtrack != "undefined") {
                dmtrack.clickstat('http://stat.china.alibaba.com/tracelog/click.html', '?tracelog=ibank_noflash');
            }
            //不需要flash组件提供后续插入flash的操作 return false;
            return false;
        }
    };
    $util.flash.regist('uploader2', uploader);
    $.add('ui-flash-uploader2');
})(jQuery);
