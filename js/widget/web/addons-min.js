(function(a,c){var b=a.util.ua.ie;c.hasAlitalk=(function(){if(b){var d={"aliimx.wangwangx":6,"Ali_Check.InfoCheck":5};for(var g in d){try{new ActiveXObject(g);version=d[g];return true}catch(f){}}}else{if(a.browser.mozilla||a.browser.safari){a(function(){if(navigator.mimeTypes["application/ww-plugin"]){var e=a("<embed>",{type:"application/ww-plugin",css:{visibility:"hidden",width:0,height:0}});e.appendTo(document.body);if((e[0].NPWWVersion&&numberify(e[0].NPWWVersion())>=1.003)||e[0].isInstalled(1)){c.hasAlitalk=true}e.remove()}})}}return false})();c.hasAlitool=(function(){if(b){try{var d=new ActiveXObject("YAliALive.Live");return true}catch(f){}return false}else{return false}})();a.add("web-addons")})(jQuery,FE.util);