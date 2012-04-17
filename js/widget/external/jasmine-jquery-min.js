var readFixtures=function(){return jasmine.getFixtures().proxyCallTo_("read",arguments)};var preloadFixtures=function(){jasmine.getFixtures().proxyCallTo_("preload",arguments)};var loadFixtures=function(){jasmine.getFixtures().proxyCallTo_("load",arguments)};var setFixtures=function(a){jasmine.getFixtures().set(a)};var sandbox=function(a){return jasmine.getFixtures().sandbox(a)};var spyOnEvent=function(a,b){jasmine.JQuery.events.spyOn(a,b)};jasmine.getFixtures=function(){return jasmine.currentFixtures_=jasmine.currentFixtures_||new jasmine.Fixtures()};jasmine.Fixtures=function(){this.containerId="jasmine-fixtures";this.fixturesCache_={};this.fixturesPath="spec/javascripts/fixtures"};jasmine.Fixtures.prototype.set=function(a){this.cleanUp();this.createContainer_(a)};jasmine.Fixtures.prototype.preload=function(){this.read.apply(this,arguments)};jasmine.Fixtures.prototype.load=function(){this.cleanUp();this.createContainer_(this.read.apply(this,arguments))};jasmine.Fixtures.prototype.read=function(){var a=[];var d=arguments;for(var c=d.length,b=0;b<c;b++){a.push(this.getFixtureHtml_(d[b]))}return a.join("")};jasmine.Fixtures.prototype.clearCache=function(){this.fixturesCache_={}};jasmine.Fixtures.prototype.cleanUp=function(){jQuery("#"+this.containerId).remove()};jasmine.Fixtures.prototype.sandbox=function(a){var b=a||{};return jQuery('<div id="sandbox" />').attr(b)};jasmine.Fixtures.prototype.createContainer_=function(b){var a;if(b instanceof jQuery){a=jQuery('<div id="'+this.containerId+'" />');a.html(b)}else{a='<div id="'+this.containerId+'">'+b+"</div>"}jQuery("body").append(a)};jasmine.Fixtures.prototype.getFixtureHtml_=function(a){if(typeof this.fixturesCache_[a]=="undefined"){this.loadFixtureIntoCache_(a)}return this.fixturesCache_[a]};jasmine.Fixtures.prototype.loadFixtureIntoCache_=function(a){var b=this.fixturesPath.match("/$")?this.fixturesPath+a:this.fixturesPath+"/"+a;var c=new XMLHttpRequest();c.open("GET",b+"?"+new Date().getTime(),false);c.send(null);this.fixturesCache_[a]=c.responseText};jasmine.Fixtures.prototype.proxyCallTo_=function(b,a){return this[b].apply(this,a)};jasmine.JQuery=function(){};jasmine.JQuery.browserTagCaseIndependentHtml=function(a){return jQuery("<div/>").append(a).html()};jasmine.JQuery.elementToString=function(a){return jQuery("<div />").append($(a).clone()).html()};jasmine.JQuery.matchersClass={};(function(a){var b={spiedEvents:{},handlers:[]};a.events={spyOn:function(c,d){var e=function(f){b.spiedEvents[[c,d]]=f};jQuery(c).bind(d,e);b.handlers.push(e)},wasTriggered:function(c,d){return !!(b.spiedEvents[[c,d]])},wasPrevented:function(c,d){return b.spiedEvents[[c,d]].isDefaultPrevented()},cleanUp:function(){b.spiedEvents={};b.handlers=[]}}})(jasmine.JQuery);(function(){var c={toHaveClass:function(e){return this.actual.hasClass(e)},toBeVisible:function(){return this.actual.is(":visible")},toBeHidden:function(){return this.actual.is(":hidden")},toBeSelected:function(){return this.actual.is(":selected")},toBeChecked:function(){return this.actual.is(":checked")},toBeEmpty:function(){return this.actual.is(":empty")},toExist:function(){return this.actual.size()>0},toHaveAttr:function(f,e){return b(this.actual.attr(f),e)},toHaveProp:function(e,f){return b(this.actual.prop(e),f)},toHaveId:function(e){return this.actual.attr("id")==e},toHaveHtml:function(e){return this.actual.html()==jasmine.JQuery.browserTagCaseIndependentHtml(e)},toHaveText:function(f){var e=$.trim(this.actual.text());if(f&&jQuery.isFunction(f.test)){return f.test(e)}else{return e==f}},toHaveValue:function(e){return this.actual.val()==e},toHaveData:function(f,e){return b(this.actual.data(f),e)},toBe:function(e){return this.actual.is(e)},toContain:function(e){return this.actual.find(e).size()>0},toBeDisabled:function(e){return this.actual.is(":disabled")},toBeFocused:function(e){return this.actual.is(":focus")},toHandle:function(e){var f=this.actual.data("events");return f&&f[e].length>0},toHandleWith:function(f,h){var e=this.actual.data("events")[f];var g;for(g=0;g<e.length;g++){if(e[g].handler==h){return true}}return false}};var b=function(f,e){if(e===undefined){return f!==undefined}return f==e};var d=function(f){var e=jasmine.Matchers.prototype[f];jasmine.JQuery.matchersClass[f]=function(){if(this.actual&&(this.actual instanceof jQuery||jasmine.isDomNode(this.actual))){this.actual=$(this.actual);var g=c[f].apply(this,arguments);this.actual=jasmine.JQuery.elementToString(this.actual);return g}if(e){return e.apply(this,arguments)}return false}};for(var a in c){d(a)}})();beforeEach(function(){this.addMatchers(jasmine.JQuery.matchersClass);this.addMatchers({toHaveBeenTriggeredOn:function(a){this.message=function(){return["Expected event "+this.actual+" to have been triggered on "+a,"Expected event "+this.actual+" not to have been triggered on "+a]};return jasmine.JQuery.events.wasTriggered($(a),this.actual)}});this.addMatchers({toHaveBeenPreventedOn:function(a){this.message=function(){return["Expected event "+this.actual+" to have been prevented on "+a,"Expected event "+this.actual+" not to have been prevented on "+a]};return jasmine.JQuery.events.wasPrevented(a,this.actual)}})});afterEach(function(){jasmine.getFixtures().cleanUp();jasmine.JQuery.events.cleanUp()});jQuery.add("ext-jasmine-jquery");