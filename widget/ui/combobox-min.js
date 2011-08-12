("combobox" in jQuery.fn)||(function(c,e){var d=c.isFunction,b=c.makeArray,a=c.each;c.widget("ui.combobox",{options:{name:"",multiple:false,editable:false,closable:false,maxHeight:false,bgiframe:true,triggerText:"",tpl:function(m){var k=c("<ul>"),h,g;for(h=0,g=m.length;h<g;h++){var l=m[h],f=c("<li>").addClass("ui-combobox-item").data("item",l);k.append(f.html(l.text))}return k},itemNode:"li",itemTpl:function(f){return c("<li>").html(f.text)},resultTpl:function(f){return f.text},zIndex:1000},_create:function(){var g=this,k=g.options,i=this.element,h=[],f,j=k.data;if(k.multiple){h.push('<ul class="result fd-clr"></ul>')}else{h.push('<input class="field" type="hidden" name="'+k.name+'"/>');h.push('<input class="result" type="text" autocomplete="off"'+(k.editable?"":'readonly="readonly"')+"/>")}h.push('<a class="trigger" href="javascript:;" target="_self" hidefocus="true"></a>');i.addClass("ui-combobox").append(h.join(""));f=g.panel=c("<div>",{"class":"ui-combobox-panel",css:{display:"none"},html:(k.closable?'<a class="close" href="javascript:;"></a>':"")+'<div class="list fd-clr"></div>'}).appendTo(k.appendTo||i);g.field=c(">input.field",i);g.result=c(">.result",i);g.trigger=c(">a.trigger",i);g.close=c(">a.close",f);g.list=c(">div.list",f);g.value=c.makeArray(k.value);g._buildEvent();g._dataInit();if(k.bgiframe){f.bgiframe()}},_destroy:function(){},_buildEvent:function(){var f=this,g=f.options,h=g.itemNode;f.trigger.bind("click.combobox",c.proxy(f,"toggle"));f.close.bind("click.combobox",function(i){i.preventDefault();f.panel.hide()});if(g.multiple){f.result.delegate("a.ui-combobox-remove","click.combobox",function(j){var i=c(this).closest("li");f.remove(i.data("item").value,i)})}f.result.click(function(i){if(i.target!==this){return}f.toggle(i)});f.list.delegate(h+".ui-combobox-item",{"hover.combobox":function(){c(this).toggleClass("ui-combobox-hover")},"click.combobox":function(m){var k=c(this),j=k.data("item");if(j){var l=j.value;if(g.multiple){var i=c("input:checkbox",k);if(k.hasClass("ui-combobox-selected")){f.remove(l)}else{f.select(l,false,c(this))}}else{if(!k.hasClass("ui-combobox-selected")){f.select(l,false,c(this))}if(!g.closable){f.panel.hide()}}}}});if(!g.closable){c([f.result[0],f.trigger[0],f.panel[0]]).bind("mousedown.combobox",function(i){i.stopPropagation()})}},toggle:function(g){var f=this,h=f.options;g.preventDefault();if(f.panel.css("display")==="none"){f.resetPanelPosition().show();if(!h.closable){c(document).one("mousedown.combobox",function(){f.panel.hide()})}}else{f.panel.hide()}},_dataInit:function(){var f=this,i=f.options,h=i.data;if(i.data.jquery){h=i.data.get(0)}if(h.nodeName==="SELECT"){i.name=h.name;i.multiple=c(h).prop("multiple");var g=[];f.field.attr("name",i.name);c(">option",h).each(function(j,l){var k=c(l).prop("selected"),m={text:l.innerHTML,value:l.value};if(k){m.selected=k}g.push(m)});f.data=g;c(h).attr("disabled",true).hide();f._trigger("datainit");f._listRender(f.data)}else{if(d(h)){h(function(j){f.data=j;f._trigger("datainit");f._listRender(j)})}else{f.data=h;f._trigger("datainit");f._listRender(h)}}},_listRender:function(g){var f=this,i=f.options,h=[];f.value=[];f.data=g;f.list.html(i.tpl(g));f._resultInit();if(i.maxHeight){f.panel.css({width:"",height:""});if(f.panel.height()>i.maxHeight){f.panel.height(i.maxHeight);f.panel.width(f.panel.width()+17)}}if(i.value){f.val(i.value,true)}else{var j=i.itemNode;c(j+":data(item)",f.list).each(function(k,m){var l=c(m).data("item");if(l.selected){h.push(l.value)}});f.val(h,true)}f._trigger("listrender")},_resultInit:function(){var g=this,i=g.options,j=i.itemNode,f=c(j+".ui-combobox-selected",g.list);if(i.multiple){g.result.empty();f.each(function(k,m){var l=c(m).data("item");g.result.append(c("<li>").append(i.resultTpl(l)).data("item",l))})}else{if(f.length){var h=f.data("item");g.result.val(i.resultTpl(h));g.field.val(h.value)}else{g.result.val("");g.field.val("")}}},resetPanelPosition:function(){var g=this,f=g.result.position();g.panel.css({left:f.left,top:f.top+g.result.outerHeight()});return g.panel},reset:function(f){if(f){this.options.data=f}this._dataInit()},select:function(l,m,i){var n=this,h=n.options,g=h.itemNode,f=i||c(g+":data(item)",n.list),j=false,k;l=b(l);k=l.length;f.each(function(o,q){q=c(q);var p=q.data("item"),o=l.indexOf(p.value);if(o>-1){if(!q.hasClass("ui-combobox-selected")){if(h.multiple){c("input:checkbox",q).attr("checked",true).prop("defaultChecked",true);n.result.append(c("<li>").append(h.resultTpl(p)).data("item",p))}else{c(g+".ui-combobox-item",n.list).removeClass("ui-combobox-selected");n.result.val(h.resultTpl(p));n.field.val(p.value)}q.addClass("ui-combobox-selected");n.value.push(p.value);j=true}k--;if(!k){return false}}});if(!m&&j){n.resetPanelPosition();n._trigger("change")}return this},val:function(h,j){var f=this,g=f.options,i=g.itemNode;if(h===e){if(g.multiple){return f.value}else{return f.field.val()}}else{h=c.makeArray(h);if(h.length!==f.value.length||f.value.some(function(l,k){return l!==h[k]})){a(h,function(k,l){f.select(l,true)});if(!j){f.resetPanelPosition();f._trigger("change")}}return f}},remove:function(i,g){var f=this,l=f.options.itemNode,k=false,j,h;i=b(i);j=h=i.length;if(g){g.remove()}if(!g){c(">li",f.result).each(function(n,m){m=c(m);var n=i.indexOf(m.data("item").value);if(n>-1){m.remove();j--;if(!j){return false}}})}c(l+":data(item)",f.list).each(function(m,n){n=c(n);var m=i.indexOf(n.data("item").value);if(m>-1){if(n.hasClass("ui-combobox-selected")){n.removeClass("ui-combobox-selected");c("input:checkbox",n).prop("checked",false);f.value.remove(i[m]);k=true}h--;if(!h){return false}}});if(k){f.resetPanelPosition();f._trigger("change")}return this}});c.add("ui-combobox")})(jQuery);