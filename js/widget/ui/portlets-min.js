("portlets" in jQuery.fn)||(function(c,d){var a=c.each;function b(g,f){return Math.pow(g.pageX-f.left,2)+Math.pow(g.pageY-f.top,2)}c.widget("ui.portlets",c.ui.mouse,{options:{appendTo:"parent",axis:false,orientation:"vertical",handle:false,helper:"original",items:"> *",modal:true,opacity:false,placeholder:false,dropOnEmpty:true,scroll:true,scrollSensitivity:20,scrollSpeed:20,revert:false,revertOuter:false,zIndex:1000},_create:function(){var e=this;e.widget().addClass("ui-portlets");e.columns=[];e.items=[];e.position={};e._mouseInit()},_destroy:function(){var e=this;e.widget().removeClass("ui-portlets ui-portlets-disabled");e._mouseDestroy()},_mouseCapture:function(h){var f=this,j=f.options,g;if(j.disabled||f.reverting){return false}f._refreshItems();c(h.target).parents().andSelf().each(function(){if(c.data(this,"portlets-item")===true){g=c(this);return false}});if(!g){return false}if(j.handle){var i=false;c(j.handle,g).find("*").andSelf().each(function(){if(this===h.target){i=true;return false}});if(!i){return i}}if(!f._trigger("capture",h,{currentItem:g})){return false}f.currentItem=g;return true},_mouseStart:function(k){var p=this,i=p.element,g=p.options,n=p.currentItem,j=(p.currentItemCache=p.currentItem.offset()),h,f=n.offsetParent().offset(),m;c.extend(j,{click:{left:k.pageX-j.left,top:k.pageY-j.top},offset:f,width:n.width(),height:n.height()});m=(p.placeholder=p._createPlaceholder(k));h=(p.helper=p._createHelper(k));if(g.cursorAt){p._adjustOffsetFromHelper(g.cursorAt)}if(g.opacity){h.css("opacity",g.opacity)}if(g.zIndex){h.css("zIndex",g.zIndex)}if(g.scroll){p.scrollParent=h.scrollParent();if(p.scrollParent[0]!==document&&p.scrollParent[0].tagName!=="HTML"){p.scrollParentCache=p.scrollParent.offset()}}if(g.modal){var l=i.offset();i.prepend(p.modal=c("<div>",{css:{left:l.left-j.offset.left,top:l.top-j.offset.top,position:"absolute",zIndex:g.zIndex-1,backgroundColor:"#FFF",opacity:0}}))}else{c(document).disableSelection()}p._getCurrentColumn();p.originalColumn=p.currentColumn;p.dragging=true;p._trigger("start",k,p._uiHash());p.refreshPositions();return true},_mouseDrag:function(E){var s=this,u=s.options,g=s.columns,t=s.items,f=s.helper,h=s.currentItemCache,K=s.position,y=s.currentColumn,v=s.scrollParent,n=s.scrollParentCache,p=u.orientation==="vertical",J,H,x=Number.MAX_VALUE;if(u.scroll){if(v[0]!==document&&v[0].tagName!=="HTML"){if((n.top+v[0].offsetHeight)-E.pageY<u.scrollSensitivity){v[0].scrollTop=v[0].scrollTop+u.scrollSpeed}else{if(E.pageY-n.top<u.scrollSensitivity){v[0].scrollTop=v[0].scrollTop-u.scrollSpeed}}if((n.left+v[0].offsetWidth)-E.pageX<u.scrollSensitivity){v[0].scrollLeft=v[0].scrollLeft+u.scrollSpeed}else{if(E.pageX-n.left<u.scrollSensitivity){v[0].scrollLeft=v[0].scrollLeft-u.scrollSpeed}}}else{if(E.pageY-c(document).scrollTop()<u.scrollSensitivity){c(document).scrollTop(c(document).scrollTop()-u.scrollSpeed)}else{if(c(window).height()-(E.pageY-c(document).scrollTop())<u.scrollSensitivity){c(document).scrollTop(c(document).scrollTop()+u.scrollSpeed)}}if(E.pageX-c(document).scrollLeft()<u.scrollSensitivity){c(document).scrollLeft(c(document).scrollLeft()-u.scrollSpeed)}else{if(c(window).width()-(E.pageX-c(document).scrollLeft())<u.scrollSensitivity){c(document).scrollLeft(c(document).scrollLeft()+u.scrollSpeed)}}}}c.extend(s.position,{left:E.pageX-h.click.left-h.offset.left,top:E.pageY-h.click.top-h.offset.top});if(!u.axis||u.axis!="y"){f[0].style.left=K.left+"px"}if(!u.axis||u.axis!="x"){f[0].style.top=K.top+"px"}for(var A=g.length-1;A>-1;A--){var k=g[A],I;if(p){I=k.left<=E.pageX&&E.pageX<=k.left+k.width}else{I=k.top<=E.pageY&&E.pageY<=k.top+k.height}if(I){J=k.dom;if(y[0]!==J){y=s.currentColumn=c(J);s._trigger("over",E,s._uiHash())}if(y.hasClass("ui-portlets-unreceivable")){return}var w=Number.MAX_VALUE,D=Number.MIN_VALUE;for(var z=t.length-1;z>-1;z--){var F=t[z];if(F.dom&&F.dom===s.currentItem[0]){continue}if(!c.contains(y[0],F.dom)){continue}var l,B=c.ui.isOver(E.pageY,E.pageX,F.top,F.left,F.height,F.width);w=Math.min(p?F.top:F.left,w);D=Math.max(p?F.top+F.height:F.left+F.width,D);if(B){J=F.dom;l=[b(E,{left:F.left,top:F.top}),b(E,{left:F.left,top:F.top+F.height}),b(E,{left:F.left+F.width,top:F.top}),b(E,{left:F.left+F.width,top:F.top+F.height})];a(l,function(e,j){if(j<x){x=j;if(p){H=e%2?"after":"before"}else{H=e>1?"after":"before"}}})}}if(!H){if((p?E.pageY:E.pageX)<w){H="prepend"}else{if((p?E.pageY:E.pageX)>D||D<0){H="append"}}}break}}if(J&&H){if(J===K.dom&&H===K.direction){return}K.dom=J;K.direction=H;var r=true;switch(H){case"append":var q=c(u.items+":not(.ui-portlets-helper):last",J);if(q[0]===s.placeholder[0]){r=false;break}if(q.length){J=q;H="after"}break;case"prepend":var G=c(u.items+":not(.ui-portlets-helper):first",J);if(G[0]===s.placeholder[0]){r=false;break}if(G.length){J=G;H="before"}break;case"before":var C=c(J).prev();while(C.length&&C.hasClass("ui-portlets-helper")){C=C.prev()}if(C[0]===s.placeholder[0]){r=false}break;case"after":var m=c(J).next();while(m.length&&m.hasClass("ui-portlets-helper")){m=m.next()}if(m[0]===s.placeholder[0]){r=false}break}if(r){if(H==="append"||H==="prepend"){if(c.isFunction(u.dropOnEmpty)){r=u.dropOnEmpty.call(s.element[0],E,s._uiHash());if(!r){s.refreshPositions(true)}}else{r=u.dropOnEmpty}}if(!r){return}s._trigger("change",E,s._uiHash());c(J)[H](s.placeholder);s.refreshPositions(true)}return}},_mouseStop:function(j){if(!j){return}var h=this,m=h.options;if(m.revert){var l=h.placeholder,k=l.offset(),i=l.offsetParent().offset(),g=m.revertOuter?"outerWidth":"width",f=m.revertOuter?"outerHeight":"height";h.reverting=true;c(h.helper).animate({top:k.top-i.top,left:k.left-i.left,width:l[g](),height:l[f]()},parseInt(m.revert,10)||500,function(){h._clear(j)})}else{h._clear(j)}},_getCurrentColumn:function(){var e=this;a(e.columns,function(){var f=c(this.dom);if(c.contains(f[0],e.currentItem[0])){e.currentColumn=f;return false}})},_adjustOffsetFromHelper:function(f){var e=this;if("left" in f){e.currentItemCache.click.left=f.left}if("top" in f){e.currentItemCache.click.top=f.top}},_clear:function(j){var f=this,i=f.element,l=f.options,g=f.currentItem,h=f.helper,k=f.placeholder;f.reverting=false;if(h[0]!==g[0]){h.remove()}else{h.removeClass("ui-portlets-helper").removeAttr("style")}k.after(g.show()).remove();a(f.items,function(e){c(this.dom).removeData("portlets-item")});f._getCurrentColumn();f._trigger("stop",j,f._uiHash());if(l.modal){f.modal.remove();delete f.modal}else{c(document).enableSelection()}c.extend(f,{items:[],columns:[],position:{},currentItem:null,currentItemCache:null,currentColumn:null,originalColumn:null,helper:null,placeholder:null,placeholderCache:null,scrollParent:null,dragging:false,reverting:false})},_refreshItems:function(){var e=this,g=e.element,h=e.options,f;f=h.columns?c(h.columns,g):g;f.each(function(){var i=c(this);e.columns.push({dom:this})});f.find(h.items).each(function(){var i=c(this);i.data("portlets-item",true);e.items.push({dom:this})})},refreshPositions:function(f){var e=this,h=e.element,i=e.options,g=e.currentItem;a(e.columns,function(){var j=this,k=c(j.dom);c.extend(j,k.offset());j.width=k.width();j.height=k.height()});a(e.items,function(){var j=this,k=c(j.dom);c.extend(j,k.offset());if(!f){j.width=k.outerWidth();j.height=k.outerHeight()}});if(i.modal){e.modal.css({width:h.outerWidth(),height:h.outerHeight()})}return e},_createPlaceholder:function(h){var f=this,j=f.options,g=f.currentItem,i=c.isFunction(j.placeholder)?c(j.placeholder.call(f.element[0],h,g)):c(document.createElement(g[0].nodeName)).height(f.currentItemCache.height).addClass(f.currentItem[0].className);i.addClass("ui-portlets-placeholder");if(typeof j.placeholder==="string"){i.addClass(j.placeholder)}g.after(i);return i},_createHelper:function(j){var f=this,k=f.options,g=f.currentItem,h=f.currentItemCache,i=(c.isFunction(k.helper)?c(k.helper.call(f.widget(),j,g)):g.width(h.width).height(h.height).css("margin",0)).addClass("ui-portlets-helper").css({position:"absolute",left:h.left-h.offset.left,top:h.top-h.offset.top});if(i[0]!==g[0]){g.hide();c(k.appendTo!=="parent"?k.appendTo:g[0].parentNode)[0].appendChild(i[0])}return i},_uiHash:function(){var e=this;return{columns:e.columns,items:e.items,currentItem:e.currentItem,currentColumn:e.currentColumn,originalColumn:e.originalColumn,helper:e.helper,placeholder:e.placeholder}}});c.extend(c.ui.portlets,{version:"1.0"});c.add("ui-portlets")})(jQuery);