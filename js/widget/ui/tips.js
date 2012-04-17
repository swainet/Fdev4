/**
 * Created by JetBrains RubyMine.
 * User: ianva
 * Date: 11-12-12
 * Time: 下午2:26
 * To change this template use File | Settings | File Templates.
 */
('tips' in jQuery.fn) ||
(function($,undefined){
$.use('ui-position',function(){
    var
        EXPR_CLS = /class\s*=\s*"\s*{([a-zA-Z0-9-_\s]+)}([^"']*)"/g,
        EXPR_ID  = /id\s*=\s*"\s*{([a-zA-Z0-9-_\s]+)}([^"']*)"/g,
        uuid = function(prefix){
            var t = new Date().getTime();
            return (!prefix?'':prefix)+t+''+Math.floor(Math.random()*t);
        },
        extendRender = function(target,base){
            $.extendIf(target,base);
            target.superRender = base;
        };

    $.namespace('jQuery.ui.tips');
    $.namespace('jQuery.uiRender.tips');

    $.uiRender.tips.Default = {
        options : {
            template:'<div class="{wrap}"><div class="{content}"><span class="{close}"></span><div class="{arrowwrap}"><span class="{arrow}"></span></div><div class="{msg}"></div></div></div>'
        }
    };

    $.widget('ui.tips', {
        options : {
            delayIn:0,
            delayOut:0,
            offset : "0 0",
            align : "top left",
            template:'',
            render : $.uiRender.tips.Default,
            trigger : {
                open:{
                    type:"",
                    element:null
                },
                close:{
                    type:"",
                    element:null
                }
            },
            visible:true,
            closeable: true,
            msg:'test'
        },
        _create: function(){
            var
                self = this,
                options = this.option('render').options;

            /* set render */
            options = this.option('render').options;
            $.each(options,function(k,v){
                self.option(k,v);
            });
            delete this.option('render').options;
            $.extend(this,this.option('render'));
            /* set render end */

            this.uuid = uuid();
            this.tip = $(this.templateParse( this.option('template') ));
            this.msgEl = this.tip.find('.'+this.widgetBaseClass+'-'+'msg');

            this.msgEl.html( this.option('msg') );

            if(!this.option('visible')){
                this.close();
            }
            this.closeBtn = this.tip.find('.'+this.widgetBaseClass+'-'+'close');
            if(!this.option('closeable')){
                this.closeBtn.css('display','none');
            }
            this._trigger('tipinit')
            $('body').append(this.tip);
            this.tip.find('.'+this.widgetBaseClass+'-'+'content').bgiframe();
            this.tip.find('.'+this.widgetBaseClass+'-'+'arrow').bgiframe();
            this.position();
            this._bindUI();
        },
        _setOption: function(key, value){
            if(key!=='trigger')this.options[key] = value;
            switch (key) {
                case 'offset': case 'align':
                    this.position();
                break;
                case 'visible':
                    if(value){
                        this.tip.removeClass(this.widgetBaseClass+'-'+'hide');
                    }else{
                        this.tip.addClass(this.widgetBaseClass+'-'+'hide');
                    }
                break;
                case 'msg':
                    this.msgEl.html(value);
                    this.position();
                break;
                case 'delayOut':
                    this.close();
                break;
                case 'delayIn':
                    this.open();
                break;
            }
            return this;
        },
        position : function(){
            var
                defaultOffset = this.option('offset').split(' '),
                offsetLeft = defaultOffset[0]-0,
                offsetTop = defaultOffset[1]-0,
                alignOption = {},
                alignCls = this.widgetBaseClass+'-'+this.option('align').replace(' ','-'),
                contentEl= this.tip.children().eq(0);

            switch(this.option('align')){
                case "top left":
                    alignOption = {
                        my:"left bottom",
                        at:"left top"
                    };
                break;
                case "bottom left":
                    alignOption = {
                        my:"left top",
                        at:"left bottom"
                    };
                break;
                case "top right":
                    alignOption = {
                        my:"right bottom",
                        at:"right top"
                    };
                break;
                case "bottom right":
                    alignOption = {
                        my:"right top",
                        at:"right bottom"
                    };
                break;
                case "left top":
                    alignOption = {
                        my:"right bottom",
                        at:"left top"
                    };
                break;
                case "left bottom":
                    alignOption = {
                        my:"right top",
                        at:"left bottom"
                    };
                break;
                case "right top":
                    alignOption = {
                        my:"left bottom",
                        at:"right top"
                    };
                break;
                case "right bottom":
                    alignOption = {
                        my:"left top",
                        at:"right bottom"
                    };
                break;
                case "right center":
                    alignOption = {
                        my:"left center",
                        at:"right center"
                    };
                break;
                case "left center":
                    alignOption = {
                        my:"right center",
                        at:"left center"
                    };
                break;
                case "top center":
                    alignOption = {
                        my:"center bottom",
                        at:"center top"
                    };
                break;
                case "bottom center":
                    alignOption = {
                        my:"center top",
                        at:"center bottom"
                    };
                break;

            }

            if(this._alignCls){
                contentEl.removeClass(this._alignCls);
            }
            contentEl.addClass(alignCls);
            this._alignCls = alignCls;

            this.tip.position($.extend({
                of: this.element,
                offset: offsetLeft+' '+offsetTop,
                collision:'none none'
            },alignOption));

        },
        open :function(){
            var
                self = this;
            // 清除掉closeTimer
            clearTimeout(this.openTimer);
            this.openTimer = function(){
                self.option('visible',open);
                self._trigger('open');
            };
            // 延时打开tips
            setTimeout(this.openTimer,this.option('delayIn'));
            // 存在delayOut则会在相应时间内关闭
            if(this.option('delayOut')){
                setTimeout(this.closeTimer,this.option('delayOut'));
            }
        },
        close : function(){
            var
                self = this;
            // 清除掉timer
            clearTimeout(this.openTimer);
            clearTimeout(this.closeTimer);
            this.closeTimer  = function(){
                if(self.option('delayOut')){
                    setTimeout(function(){
                        self.option('visible',false);
                        self._trigger('close');
                    },self.option('delayOut'));
                }else{
                    self.option('visible',false);
                    self._trigger('close');
                }
            };
            this.closeTimer();
        },
        templateParse :function(tpl){
            var
                prefix = this.widgetBaseClass;

            tpl = tpl.replace(EXPR_CLS,function($0,$1,$2){
                var
                    names = $1.split(' '),
                    l = names.length,
                    i = 0,
                    ret = ['class="'];
                for(;i<l;i++){
                    ret.push(prefix,'-',names[i],' ');
                }
                ret.push($2,'"');
                return ret.join('');
            })
            .replace(EXPR_ID,'id="'+ prefix +'-'+ this.uuid +'-$1$2"');
            return tpl;
        },
        _bindUI: function(){
            var
                self = this,
                type = this.option('trigger');

            if(type.open && type.open.type){
                (type.open.element||this.element).bind(type.open.type,function(){
                    self.open();
                });
            }
            if(type.close && type.close.type){
                (type.close.element||this.element).bind(type.close.type,function(){
                    self.close();
                });
            }
            if(this.option('closeable')){
                this.closeBtn.click(function(){
                    self.close();
                })
            }

        },
        destroy: function(){
            var
                self = this,
                type = this.option('trigger');
            clearTimeout(this.openTimer);
            clearTimeout(this.closeTimer);
            if(type.close && type.close.type){
                (type.open.element||this.element).unbind(type.open.type,function(){
                    self.open();
                });
            }
            if(type.close && type.close.type){
                (type.close.element||this.element).unbind(type.close.type,self.close);
            }
            $.Widget.prototype.destroy.apply(self, arguments);
            this.tip.remove();
        }
    });
    $.add('ui-tips');
});
})(jQuery);
