("timer" in jQuery.fn)||(function(c,d){var b=["year","month","day","hour","minute","second"],a={year:"yyyy",month:"MM",day:"dd",hour:"hh",minute:"mm",second:"ss"};c.widget("ui.timer",{options:{format:"y-M-d hh:mm:ss",to:new Date(),step:1,animate:false,autoStart:true},_create:function(){this._render()},_render:function(){var e=this,g=e.element,h=e.options,f="<dl><dd></dd></dl>";g.addClass("ui-timer");c.each(b,function(j,k){var l=c("."+k,g);if(l.length){e["ph"+k]=l;if(h.animate){l.html(k==="year"?f:(f+f));e["ph"+k]=l.children()}}});if(h.autoStart){e.start()}},start:function(){var e=this,g=e.options,f;if(!e.timer){f=e.aim=new Date(g.to-(g.from||new Date()));e.timer=c.later(1000*g.step,e,e._interval,d,true);e._interval()}return e},stop:function(){var e=this;if(e.timer){e.timer.cancel();delete e.timer;e._trigger("stop")}},_interval:function(){var e=this,i=e.aim;if(i<0){e.stop();return}var h=e.options,g=h.format,f={year:i.getFullYear()-1970,month:i.getUTCMonth(),day:i.getUTCDate()-1,hour:i.getUTCHours(),minute:i.getUTCMinutes(),second:i.getUTCSeconds()};if(h.animate){c.each(b,function(k,l){var j=e[l]||0,m=f[l];if(e["ph"+l]&&j!==m){e._animate(e["ph"+l],j,m);e[l]=m}})}else{c.each(b,function(j,k){var l=f[k];if(e["ph"+k]&&e[k]!==l){e["ph"+k].html((l<10&&g.indexOf(a[k])>-1)?"0"+l:l);e[k]=l}})}e.aim=new Date(e.aim-1000*h.step)},_animate:function(h,k,f){var t=this,g=t.options,q=h.length,l=0,e,j;k=t._strFix(k,q);f=t._strFix(f,q);for(;l<q;l++){e=k.charAt(l);j=f.charAt(l);if(e!==j){var m=c(h[l]),r=m.children(),s=c("<dd>").addClass("num"+j);m.append(s);r.animate({marginTop:"-"+r.height()+"px"},800,function(){c(this).remove()})}}},_strFix:function(g,e){g=g+"";var f=e-g.length;while(f){g="0"+g;f--}return g},_destroy:function(){var e=this;e.stop();e.element.removeClass("ui-timer")}});c.add("ui-timer")})(jQuery);