("storage" in jQuery.util)||(function(c){var e=[],f,h=false,a=(function(){var k=[];if(!c.support.JSON){k.push("util-json")}if(!c.support.localStorage){k.push("ui-flash-storage");f="swfStoreTemp"}else{f=window.localStorage}return k})();c.extend(c.util,{storage:c.extend({setItem:function(m,n){try{var k=f.setItem(m,n)}catch(l){this.trigger("error",{exception:l})}return k},getItem:function(k){return f.getItem(k)},setJson:function(k,l){return this.setItem(k,JSON.stringify(l))},getJson:function(k){return JSON.parse(this.getItem(k))},removeItem:function(k){return f.removeItem(k)},clear:function(){return f.clear()},getLength:function(){return f===window.localStorage?f.length:f.getLength()},key:function(k){return f.key(k)},ready:function(k){if(h){k()}else{e.push(k)}}},c.EventTarget)});function d(){if(!h){i(function(){if(f==="swfStoreTemp"){c(function(){j();c("#swf-storage").bind("contentReady.flash",function(){f=c(this).flash("getEngine");b()}).bind("error.flash",function(k,l){c.util.storage.trigger("error",l)}).bind("securityError.flash",function(k,l){c.util.storage.trigger("securityError",l)})})}else{b()}})}}function b(){h=true;for(var m=0,k=e.length;m<k;m++){e[m]()}}function i(n){if(g()){n();return}for(var m=0,k=a.length;m<k;m++){(function(l){c.use(a[l],function(){a[l]=true;if(g()){n()}})})(m)}}function j(){c('<div id="swf-storage">').appendTo("body").css({position:"absolute",left:"-1000px;",top:"-1000px",width:"1px",height:"1px"}).flash({module:"storage"})}function g(){if(a.length===0){return true}else{for(var m=0,k=a.length;m<k;m++){if(a[m]!==true){return false}}return true}}d();c.add("util-storage")})(jQuery);