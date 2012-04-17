(function(h,c){var k=h.isFunction,d=h.isArray,j=h.each,m="alicnweb";h.noConflict();h.ajaxSetup({scriptCharset:"gbk",cache:true,timeout:10000});h.ajaxPrefilter("script jsonp",function(o){o.crossDomain=true});h.extend({namespace:function(){var q=arguments,u,s=0,r,t,p;for(;s<q.length;s++){u=window;p=q[s];if(p.indexOf(".")){t=p.split(".");for(r=(t[0]=="window")?1:0;r<t.length;r++){u[t[r]]=u[t[r]]||{};u=u[t[r]]}}else{u[p]=u[p]||{}}}},later:function(q,v,r,u,t){q=q||0;var p=r,s,w;if(v&&h.type(r)==="string"){p=v[r]}s=(u===c)?function(){p.call(v)}:function(){p.apply(v,h.makeArray(u))};w=(t)?setInterval(s,q):setTimeout(s,q);return{id:w,interval:t,cancel:function(){if(this.interval){clearInterval(this.id)}else{clearTimeout(this.id)}}}},extendIf:function(r,s){if(s===c){s=r;r=this}for(var q in s){if(typeof r[q]==="undefined"){r[q]=s[q]}}return r},unparam:function(p,r){if(typeof p!=="string"){return}var o=p.trim().match(/([^?#]*)(#.*)?$/),q={};if(!o){return{}}h.each(o[1].split(r||"&"),function(t,v){if((v=v.split("="))[0]){var s=decodeURIComponent(v.shift()),u=v.length>1?v.join("="):v[0];if(u!=c){u=decodeURIComponent(u)}if(s in q){if(!h.isArray(q[s])){q[s]=[q[s]]}q[s].push(u)}else{q[s]=u}}});return q},paramSpecial:function(o,q){var p=[],t=function(s,u){u=k(u)?u():u;p[p.length]=a(s)+"="+a(u+"")};if(q===c){q=h.ajaxSettings.traditional}if(d(o)||o.jquery){j(o,function(){t(this.name,this.value)})}else{for(var r in o){g(r,o[r],q,t)}}return p.join("&").replace(/\//g,"%2F").replace(/#/g,"%23").replace(/\+/g,"%2B").replace(/\s/g,"+")},methodize:function(t,p,s){var q={};for(var o in t){if(s){for(var r=s.length;r--;){if(s[r]==o){break}}}if(!s||s[r]!=o){(function(u){q[u]=function(){var w=[].slice.call(arguments),v=p?this[p]:this;return t[u].apply(t,[v].concat(w))}})(o)}}return q},extendNative:function(q,v,s,u,p){var w=[].slice,o=function(y,x){if(x){return function(){var z=w.call(arguments);return y.apply(this[x],z)}}return y};for(var r in v){if(v.prototype[r]){q.prototype[r]=o(v.prototype[r],u)}}if(s){for(var t=s.length;t--;){if(v.prototype[s[t]]){q.prototype[s[t]]=o(v.prototype[s[t]],u)}}}if(p){q.prototype.toString=p}},log:h.noop});h.namespace("jQuery.util.ua","jQuery.ui");h.extendIf(h.util,{cookie:function(q,s,p){if(s!==null&&typeof s==="object"){p=s}p=p||{};var o,r=p.raw?function(u){return u}:escape,t=p.raw?function(u){return u}:unescape;return(o=new RegExp("(?:^|; )"+r(q)+"=([^;]*)").exec(document.cookie))?t(o[1]):null},subCookie:function(p,q,o){var r=h.unparam(h.util.cookie(m)||"","|")||{},o=o||{path:"/",domain:"alibaba.com",expires:new Date("January 1, 2050")};if(arguments.length>1){r[p]=q;return h.util.cookie(m,h.param(r).replace(/&/g,"|"),o)}else{return r[p]===c?null:r[p]}},substitute:function(p,o){return p.replace(/\{(\w+)\}/g,function(s,q){return o[q]!==c?o[q]:"{"+q+"}"})},escapeHTML:function(p,o){if(o){return p.replace(/[<"']/g,function(r){switch(r){case'"':return"&quot;";case"'":return"&#39;";case"<":return"&lt;";case"&":return"&amp;";default:return r}})}else{var q=document.createElement("div");q.appendChild(document.createTextNode(p));return q.innerHTML}},unescapeHTML:function(o){var p=document.createElement("div");p.innerHTML=o.replace(/<\/?[^>]+>/gi,"");return p.childNodes[0]?p.childNodes[0].nodeValue:""}});h.extendIf(h.util.ua,{ie:!!h.browser.msie,ie6:!!(h.browser.msie&&h.browser.version==6),ie67:!!(h.browser.msie&&h.browser.version<8)});h.extendIf(h.support,{placeholder:"placeholder" in document.createElement("input"),JSON:"JSON" in window,localStorage:"localStorage" in window,WebSocket:"WebSocket" in window});h.fn.extend({serializeSpecial:function(){return h.paramSpecial(this.serializeArray())}});function a(o){return o.replace(/%/g,"%25").replace(/&/g,"%26")}function g(p,r,o,q){if(d(r)&&r.length){j(r,function(t,s){if(o||rbracket.test(p)){q(p,s)}else{g(p+"["+(typeof s==="object"||d(s)?t:"")+"]",s,o,q)}})}else{if(!o&&r!==null&&typeof r==="object"){if(d(r)||h.isEmptyObject(r)){q(p,"")}else{j(r,function(t,s){g(p+"["+t+"]",s,o,q)})}}else{q(p,r)}}}h.extendIf(Array.prototype,{every:function(r,q){for(var p=0,o=this.length;p<o;p++){if(!r.call(q,this[p],p,this)){return false}}return true},filter:function(s,r){var q=[];for(var p=0,o=this.length;p<o;p++){if(s.call(r,this[p],p,this)){q[q.length]=this[p]}}return q},indexOf:function(r,q){q=q||0;for(var p=q,o=this.length;p<o;p++){if(this[p]===r){return p}}return -1},lastIndexOf:function(q,p){p=p===c?this.length:p;for(var o=p;-1<o;o--){if(this[o]===q){return o}}return -1},remove:function(p){var o=this.indexOf(p);if(o!==-1){this.splice(o,1);return true}else{return false}},some:function(r,q){for(var p=0,o=this.length;p<o;p++){if(r.call(q,this[p],p,this)){return true}}return false}});h.extendIf(String.prototype,{trim:function(){return h.trim(this)},lenB:function(){return this.replace(/[^\x00-\xff]/g,"**").length},cut:function(o,s){var u=this,p=0;if(u.lenB()<=o){return u}for(var r=0,q=u.length;r<q;r++){var t=u.charCodeAt(r);if(t<0||t>255){p+=2}else{p++}if(p>o){return u.substr(0,r==0?r=1:r)+(s||"")}}return""}});if(!((0.009).toFixed(2)==="0.01"&&(0.495).toFixed(2)==="0.50")){var b=Number.prototype.toFixed;Number.prototype.toFixed=function(p){var o=this,q=Math.pow(10,p||0);o*=q;o=Math.round(o);o/=q;return b.call(o,p)}}h.EventTarget={};j(["bind","trigger","triggerHandler"],function(){var o=this;h.EventTarget[o]=function(){var p;p=this.__eventTargetProxy=this.__eventTargetProxy||h("<div>");return p[o].apply(p,arguments)}});var l=document,f=h.util,i={},e={};h.extend({loadCSS:function(r,q){var s=l.getElementsByTagName("head")[0]||l.documentElement,u=s.getElementsByTagName("base"),t=i[r];if(!t){t=l.createElement("link");var w={type:"text/css",rel:"stylesheet",media:"screen",href:r};if(h.isPlainObject(q)){h.extend(w,q)}for(var v in w){t.setAttribute(v,w[v])}i[r]=t}return u.length?s.insertBefore(t,u[0]):s.appendChild(t)},unloadCSS:function(o){var p=i[o];if(p){p.parentNode.removeChild(p);delete i[o];return true}else{return false}},add:function(t,v,s){t=(d(t)?t:t.replace(/\s+/g,"").split(","));if(h.isPlainObject(v)){s=v;v=c}for(var r=0,p=t.length;r<p;r++){var q=t[r],u=e[q];if(u){if(!s){u.status="ready"}}else{e[q]=h.extendIf(s||{status:"ready"},{ver:"1.0"})}}if(k(v)){v()}},use:function(s,t,q){var p=jQuery.Deferred();s=(d(s)?s:h.unique(s.replace(/\s+/g,"").split(",")));var r=0;function o(u){r++;if(s.length===r){if(k(t)){t(u)}p.resolve(u)}}j(s,function(v,u){var w=e[u];if(w){if(q&&w.url){if(typeof q==="boolean"){q={}}h.extend(w,q,{status:w.callbackQueue?"refresh":"reset"})}if(w.status==="ready"){o(w._data)}else{if(w.requires){h.use(w.requires,function(){n(u,o,p)})}else{n(u,o,p)}}}else{h.error("Invalid Module "+u)}});return p.promise()}});function n(p,z,A){var x=e[p],r=x.url,v=x.css,s=x.js;if(d(v)){j(v,function(B,q){q=f.substitute(q,[h.styleDomain,x.ver]);if(h.DEBUG){q=q.replace("-min","")}h.loadCSS(q)})}if(r||d(s)){x.callbackQueue=x.callbackQueue||[];x.callbackQueue[x.callbackQueue.length]=z;if(x.callbackQueue.length===1||x.status==="refresh"){var w=1,o=0,y=function(q){o++;if(o===w){x.status="ready";x._data=q;j(x.callbackQueue,function(B,C){C(q)});delete x.callbackQueue}},u=function(q,B){A.reject()},t=function(){delete x.jqxhr};if(r){x.jqxhr&&x.jqxhr.abort();x.jqxhr=h.ajax(h.extendIf({global:false,success:y,error:x.error||u,complete:t},x))}else{w=s.length;j(s,function(q,B){B=f.substitute(B,[h.styleDomain,x.ver]);if(h.DEBUG){B=B.replace("-min","")}h.ajax(B,{global:false,dataType:"script",scriptCharset:"gbk",cache:true,success:y,error:u})})}}}else{z(x._data)}}})(jQuery);