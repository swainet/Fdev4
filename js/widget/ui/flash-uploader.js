/*
 * jQuery UI Flash-uploader 1.4
 *
 * @author Denis 2011.02.26
 * @author Denis 2011.03.21 升级aliuploader文件版本至v2.7
 * @update Denis 2011.06.14 使用新的flash注册方式
 * @update Denis 2011.06.15 新增interfaceReady事件，同步Flash事件
 * changelog:	1.启用了新的图片缩略算法，优化了图片缩小时的质量
 * 				2.对于超过Flash处理能力的图片，现在按上传失败处理
 * @update Denis 2011.10.24 修复uploadAll方法在flash模式下的BUG
 * @update Denis 2011.11.23 当HTML实现中，文件格式不符时，补上触发finish事件
 * @update Denis 2011.11.24 增加文件选择时的状态信息，HTML模式
 * @update Denis 2012.02.24 增加"flash"配置，可以手动启用flash模式。
 * Depends:
 *	jQuery.ui.flash
 */
('Uploader' in jQuery.ui.flash) ||
(function($, undefined){
    var $util = $.util, $isArray = $.isArray, uploader = function(){
        var self = this, swfid = self.element[0].id, ie67 = $util.ua.ie67, o = self.options;
        o = self.options = $.extend(true, {
            width: 65,
            height: 22,
            inputName: 'imgFile',
            fileFilters: [{
                description: "图片(*.jpg, *.jpeg, *.gif, *.png, *.bmp)",
                extensions: "*.jpg;*.jpeg;*.gif;*.png;*.bmp;"
            }],
            flashvars: {
                // 按钮皮肤，需要从上至下提供“normal”“hover”“active”“disabled”四种状态图，且高度一致
                buttonSkin: 'http://img.china.alibaba.com/cms/upload/2011/040/820/28040_548721671.gif',
                //事件钩子
                eventHandler: 'jQuery.util.flash.triggerHandler'
            }
        }, o);
        
        //在ie下，并且flash版本不小于10
        if (o.flash || ($util.ua.ie && $util.flash.hasVersion(10))) {
            o = self.options = $.extend(true, {
                swf: 'http://img.china.alibaba.com/swfapp/aliuploader/aliuploader-v2.7.swf',
                allowscriptaccess: 'always',
                flashvars: {
                    //以秒为单位的超时时间
                    dataTimeoutDelay: 60,
                    //是否允许并行上传多个文件
                    allowSimul: true,
                    //并发请求的数量
                    simUploadLimit: 1,
                    // 单个文件的大小限制（Bytes）
                    sizeLimitEach: 0,
                    // 上传的大小总和限制（Bytes）
                    sizeLimitTotal: 0,
                    // 是否允许上传之前进行压缩
                    allowCompress: false,
                    // 压缩后图片都将转换为JPG格式，图片质量比
                    compressQuality: 80,
                    // 在此大小之下的文件，进行压缩处理。0代表不压缩
                    compressSize: 0,
                    // 压缩时缩小到此宽度之内
                    compressWidth: 800,
                    // 压缩时缩小到此高度之内
                    compressHeight: 800,
                    // 允许多选
                    allowMultiple: false,
                    // 单次上传的文件最大数量
                    fileNumLimit: 1,
                    //为了防止IE下跨域问题，统一设置为500
                    startDelay: 500
                }
            }, o);
            if (o.fileFilters) {
                self.element.bind('interfaceReady.flash', function(e, data){
                    self.obj.setFileFilters(o.fileFilters);
                    //$(this).flash('setFileFilters', o.fileFilters);
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
                    delete configs.flash;
                    delete configs.fileFilters;
                    delete configs.inputName;
                    //这里的swfid其实是容器id
                    configs.flashvars.swfid = swfid;
                    return configs;
                },
                _setOption: function(key, value){
                    var self = this;
                    $.ui.flash.prototype._setOption.call(self, key, value);
                    //需要调用flash的setFileFilters方法
                    if (key === 'fileFilters' && $isArray(value)) {
                        self.obj.setFileFilters(value);
                    }
                    return this;
                },
                
                /**
                 * 上传
                 * @param {Object} url
                 * @param {Object} param
                 */
                uploadAll: function(url, param){
                    var self = this, o = self.options;
                    if (url.indexOf('?') < 0) {
                        url += '?_input_charset=UTF-8';
                    } else {
                        url += '&_input_charset=UTF-8';
                    }
                    self.obj.uploadAll(url, 'POST', param, o.inputName);
                    return self;
                },
                /**
                 * 获取当前上传的文件状态列表
                 */
                getFileStatus: function(){
                    return this.obj.getFileStatus();
                },
                /**
                 * 清空当前上传的文件状态列表
                 */
                clearFileList: function(){
                    this.obj.clearFileList();
                    return this;
                },
                /**
                 * 动态修改文件的上传限额
                 * @param {Int} num
                 */
                setFileCountLimit: function(num){
                    this.obj.setFileCountLimit(num);
                    return this;
                },
                /**
                 * 组件失效
                 */
                disable: function(){
                    self.obj.disable();
                    return this._setOption('disabled', true);
                },
                /**
                 *
                 */
                enable: function(){
                    self.obj.enable();
                    return this._setOption('disabled', false);
                }
            });
            //需要flash组件提供后续操作 return true;
            return true;
        }
        else {
            //noformat
            var guid = $.guid++, 
				triggerHandler = new Function('return ' + o.flashvars.eventHandler)(), 
                proxy = $('<div>', {
                    'class': 'ui-flash-uploader'
                }).appendTo(document.body).html('<form action="" enctype="multipart/form-data" method="post" target="proxy' + guid + '"></form><iframe width="0" height="0" frameborder="0" name="proxy' + guid + '" src="about:blank"></iframe>'),
            	form = $('form', proxy),
				iframe = $('iframe', proxy),
				fileStatus = [],
				fileId, 
				fileName;
			//format
            
            if (o.flashvars.eventHandler) {
                iframe.bind('load', function(e){
                    try {
                        if (this.contentWindow.location.href === 'about:blank' || this.contentWindow.location.host !== location.host) {
                            return;
                        }
                        else {
                            //清空文件状态列表
                            triggerHandler({
                                swfid: swfid,
                                type: 'uploadCompleteData',
                                id: fileId,
                                fileName: fileName,
                                data: $.unparam(this.contentWindow.location.href)
                            });
                            fileStatus[0].status = 'done';
                            triggerHandler({
                                swfid: swfid,
                                type: 'finish'
                            });
                        }
                    } 
                    catch (ev) {
                    }
                    
                });
            }
            
            $.extend(self, {
                /**
                 * 上传
                 * @param {Object} url
                 * @param {Object} param
                 */
                uploadAll: function(url, param){
                    var self = this, o = self.options, hasSearch = url.lastIndexOf('?') > -1;
                    param = param || {};
                    //设置form的action地址和method方式
                    form.attr({
                        //潜规则
                        action: url + (hasSearch ? '&' : '?') + 'redirectUrl=http://' + location.host + '/crossdomain.xml&'
                    });
                    //追加上传的post参数
                    for (var name in param) {
                        var input = ie67 ? document.createElement('<input type="text" name="' + name + '">') : $('<input>', {
                            type: 'text',
                            name: name
                        })[0];
                        input.value = param[name];
                        form.append(input);
                    }
                    fileStatus[0] = {
                        id: fileId,
                        name: fileName,
                        status: 'uploading'
                    };
                    //提交表单
                    triggerHandler({
                        swfid: swfid,
                        type: 'uploadStart',
                        id: fileId,
                        fileName: fileName
                    });
                    form.submit();
                    
                    return self;
                },
                /**
                 * 返回当前队列文件的状态
                 */
                getFileStatus: function(){
                    return fileStatus;
                },
                /**
                 * 清空当前上传的文件状态列表
                 */
                clearFileList: function(){
                    fileStatus.length = 0;
                    return this;
                },
                /**
                 * 动态修改文件的上传限额
                 * @param {Int} num
                 */
                setFileCountLimit: function(num){
                    return this;
                },
                /**
                 * 组件失效
                 */
                disable: function(){
                    $('input', this.element).prop('disabled', true);
                    return this._setOption('disabled', true);
                },
                /**
                 *
                 */
                enable: function(){
                    $('input', this.element).prop('disabled', false);
                    return this._setOption('disabled', false);
                },
                /**
                 * 扩展_destroy
                 */
                _destroy: function(){
                    var self = this;
                    proxy.remove();
                    $.ui.flash.prototype._destroy.call(self);
                },
                _render: function(){
                    var elem = self.element, o = self.options;
                    elem.html('<div><input type="file" name="' + o.inputName + '" hidefocus="true" autocomplete="off"/><a href="javascript:;">&nbsp;</a></div>');
                    //设置容器
                    var con = $('>div', elem).css({
                        width: o.width,
                        height: o.height
                    }), file = $('>input', con), trigger = $('>a', con).css({
                        width: o.width,
                        height: o.height,
                        'background-image': 'url(' + o.flashvars.buttonSkin + ')'
                    });
                    file.hover(function(){
                        trigger.addClass('ui-state-hover');
                    }, function(){
                        trigger.removeClass('ui-state-hover');
                    }).bind('change', function(e){
                        //获取文件信息，并设置文件上传序列id
                        fileId = 'file' + $.guid++;
                        fileName = file.val().split('\\').pop();
                        if ($isArray(o.fileFilters)) {
                            var extensions = '';
                            $.each(o.fileFilters, function(i, fileFilter){
                                extensions += fileFilter.extensions;
                            });
                            //去掉末尾的分号
                            if (extensions.slice(-1) === ';') {
                                extensions = extensions.slice(0, -1);
                            }
                            //验证文件格式
                            if (!(new RegExp(extensions.replace(/\*\./g, '').replace(/;/g, '|') + '$', 'i').test(this.value))) {
                                if (o.flashvars.eventHandler) {
                                    //调用eventHandler
                                    triggerHandler({
                                        swfid: swfid,
                                        type: 'uploadCompleteData',
                                        id: fileId,
                                        fileName: fileName,
                                        data: {
                                            result: 'fail',
                                            errCode: ['TYPEERR'],
                                            errMsg: ['TYPEERR']
                                        }
                                    });
                                    triggerHandler({
                                        swfid: swfid,
                                        type: 'finish'
                                    });
                                }
                                trigger.removeClass('ui-state-hover');
                                return;
                            }
                        }
                        //TODO:
                        //先清空form,把输入框append至form
                        form.empty().append(file);
                        
                        trigger.removeClass('ui-state-hover');
                        //重置原容器
                        self._render();
                        //增加状态信息
                        fileStatus[0] = {
                            id: fileId,
                            name: fileName,
                            status: 'ready'
                        };

                        //触发容器的文件选择事件
                        elem.trigger('fileSelect', {
                            swfid: swfid,
                            numFiles: 1,
                            filesRefused: [],
                            fileList: [{
                                id: fileId,
                                name: fileName
                            }]
                        });
                    });
                }
            });
            self._render();
            //interfaceReady, 之所以要使用计时器，是为了在事件绑定之后触发
            setTimeout(function(){
                triggerHandler({
                    swfid: swfid,
                    type: 'interfaceReady'
                });
            }, 0);
            //不需要flash组件提供后续插入flash的操作 return false;
            return false;
        }
    };
    $util.flash.regist('uploader', uploader);
    $.add('ui-flash-uploader');
})(jQuery);
