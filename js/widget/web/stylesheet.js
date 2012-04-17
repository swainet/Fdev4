/*
 * 3.4
 * @author Denis 2011.02.13
 * @update Denis 2012.12.12 优化在保存key的时候，所有浏览器的key为小写。
 * @update Denis&Qijun.Wei 2012.12.14 提供clear方法，清空规则，不影响节点原有规则
 */
('StyleSheet' in FE.ui) ||
(function($, UI){
    //noformat
    var doc = document, p = doc.createElement('p'), // Have to hold the node (see notes)
 		workerStyle = p.style, // worker style collection
 		selectors = {}, 
		floatAttr = ('cssFloat' in workerStyle) ? 'cssFloat' : 'styleFloat', 
		OPACITY = 'opacity', FLOAT = 'float', EMPTY = '';
    //format
    // Normalizes the removal of an assigned style for a given property.  Expands
    // shortcut properties if necessary and handles the various names for the float
    // property.
    workerStyle.border = "1px solid red";
    workerStyle.border = EMPTY; // IE doesn't unset child properties	
    
	function _toCssText(css, base){
        var f = css.styleFloat || css.cssFloat || css[FLOAT], trim = $.trim, prop;
        
        // A very difficult to repro/isolate IE 9 beta (and Platform Preview 7) bug
        // was reduced to this line throwing the error:
        // "Invalid this pointer used as target for method call"
        // It appears that the style collection is corrupted. The error is
        // catchable, so in a best effort to work around it, replace the
        // p and workerStyle and try the assignment again.
        try {
            workerStyle.cssText = base || EMPTY;
        } 
        catch (e) {
            p = d.createElement('p');
            workerStyle = p.style;
            workerStyle.cssText = base || EMPTY;
        }
        
        if (f && !css[floatAttr]) {
            css = $.extend(css);
            delete css.styleFloat;
            delete css.cssFloat;
            delete css[FLOAT];
            css[floatAttr] = f;
        }
        
        for (prop in css) {
            if (css.hasOwnProperty(prop)) {
                try {
                    // IE throws Invalid Value errors and doesn't like whitespace
                    // in values ala ' red' or 'red '
                    workerStyle[prop] = trim(css[prop]);
                } 
                catch (ex) {
                }
            }
        }
        return workerStyle.cssText;
    }
    //noformat
    // Normalizes the removal of an assigned style for opacity.  IE uses the filter
    // property.
    var unsetOpacity = (OPACITY in workerStyle) ? function(style){
        style.opacity = EMPTY;
    } : function(style){
        style.filter = EMPTY;
    }, unsetProperty = workerStyle.borderLeft ? function(style, prop){
        var p;
        if (prop !== floatAttr && prop.toLowerCase().indexOf(FLOAT) != -1) {
            prop = floatAttr;
        }
        if ($.type(style[prop])==='string') {
            switch (prop) {
                case OPACITY:
                case 'filter':
                    unsetOpacity(style);
                    break;
                case 'font':
                    style.font = style.fontStyle = style.fontVariant = style.fontWeight = style.fontSize = style.lineHeight = style.fontFamily = EMPTY;
                    break;
                default:
                    for (p in style) {
                        if (p.indexOf(prop) === 0) {
                            style[p] = EMPTY;
                        }
                    }
            }
        }
    } : function(style, prop){
        if (prop !== floatAttr && prop.toLowerCase().indexOf(FLOAT) != -1) {
            prop = floatAttr;
        }
        if ($.type(style[prop])==='string') {
            if (prop === OPACITY) {
                unsetOpacity(style);
            }
            else {
                style[prop] = EMPTY;
            }
        }
    };
    //format
	
    /**
     * 实例
     */
    function StyleSheet(node){
        this._init(node);
    }
    
    $.extend(StyleSheet.prototype, {
        _init: function(node){
            var self = this;
			if(node&&node.nodeName.toLowerCase() === 'style'){
				self._node = node;
			}else{
				//noformat
				var head = doc.getElementsByTagName('head')[0] || doc.documentElement, 
				base = head.getElementsByTagName('base'), 
				node = doc.createElement('style');
				//format
	            node.type = 'text/css';
	            self._node = base.length ? head.insertBefore(node, base[0]) : head.appendChild(node);
				
			}
            //noformat
            
            self.cssRules = {};
            // Begin setting up private aliases to the important moving parts
            // 1. The stylesheet object
            // IE stores StyleSheet under the "styleSheet" property
            // Safari doesn't populate sheet for xdomain link elements
            self.sheet = node.sheet || node.styleSheet;
            
            // 2. The style rules collection
            // IE stores the rules collection under the "rules" property
            self._rules = self.sheet && ('cssRules' in self.sheet) ? 'cssRules' : 'rules';
            
            //noformat
            // 3. The method to remove a rule from the stylesheet
            // IE supports removeRule
            self._deleteRule = ('deleteRule' in self.sheet) ? function(i){
                self.sheet.deleteRule(i);
            } : function(i){
                self.sheet.removeRule(i);
            };
            
            // 4. The method to add a new rule to the stylesheet
            // IE supports addRule with different signature
            self._insertRule = ('insertRule' in self.sheet) ? function(sel, css, i){
                self.sheet.insertRule(sel + ' {' + css + '}', i);
            } : function(sel, css, i){
                self.sheet.addRule(sel, css, i);
            };
            //format
            // 5. Initialize the cssRules map from the node
            // xdomain link nodes forbid access to the cssRules collection, so this
            // will throw an error.
            // TODO: research alternate stylesheet, @media
            for (i = self.sheet[self._rules].length - 1; i >= 0; --i) {
                r = self.sheet[self._rules][i];
                sel = r.selectorText.toLowerCase();
                
                if (self.cssRules[sel]) {
                    self.cssRules[sel].style.cssText += ';' + r.style.cssText;
                    self._deleteRule(i);
                }
                else {
                    self.cssRules[sel] = r;
                }
            }
        },
        /*
         * 销毁节点
         */
        destroy: function(){
            this._node.parentNode.removeChild(this._node);
        },
        /**
         * 清除所有通过组件添加的样式
         */
        clear: function(){
            var self = this, sel;
            for(sel in self.cssRules){
                self.unset(sel);
            }
        },
        /**
         * <p>Set style properties for a provided selector string.
         * If the selector includes commas, it will be split into individual
         * selectors and applied accordingly.  If the selector string does not
         * have a corresponding rule in the sheet, it will be added.</p>
         *
         * <p>The second parameter can be either a string of CSS text,
         * formatted as CSS ("font-size: 10px;"), or an object collection of
         * properties and their new values.  Object properties must be in
         * JavaScript format ({ fontSize: "10px" }).</p>
         *
         * <p>The float style property will be set by any of &quot;float&quot;,
         * &quot;styleFloat&quot;, or &quot;cssFloat&quot; if passed in the
         * object map.  Use "float: left;" format when passing a CSS text
         * string.</p>
         *
         * @method set
         * @param sel {String} the selector string to apply the changes to
         * @param css {Object|String} Object literal of style properties and
         *                      new values, or a string of cssText
         * @return {StyleSheet} the StyleSheet instance
         * @chainable
         */        
        set: function(sel, css){
            //noformat
            var self = this, 
				rule = self.cssRules[sel], 
				multi = sel.split(/\s*,\s*/), i, idx;
            //format
            // IE's addRule doesn't support multiple comma delimited selectors
            if (multi.length > 1) {
                for (i = multi.length - 1; i >= 0; --i) {
                    self.set(multi[i], css);
                }
                return this;
            }
            
            // Some selector values can cause IE to hang
            if (!isValidSelector(sel)) {
                return this;
            }
            
            // Opera throws an error if there's a syntax error in assigned
            // cssText. Avoid this using a worker style collection, then
            // assigning the resulting cssText.
            if (rule) {
                rule.style.cssText = StyleSheet.toCssText(css, rule.style.cssText);
            }
            else {
                idx = self.sheet[self._rules].length;
                css = StyleSheet.toCssText(css);
                
                // IE throws an error when attempting to addRule(sel,'',n)
                // which would crop up if no, or only invalid values are used
                if (css) {
                    self._insertRule(sel, css, idx);
                    
                    // Safari replaces the rules collection, but maintains the
                    // rule instances in the new collection when rules are
                    // added/removed
                    self.cssRules[sel] = self.sheet[self._rules][idx];
                }
            }
            return self;
        },
        
        /**
         * <p>Unset style properties for a provided selector string, removing
         * their effect from the style cascade.</p>
         *
         * <p>If the selector includes commas, it will be split into individual
         * selectors and applied accordingly.  If there are no properties
         * remaining in the rule after unsetting, the rule is removed.</p>
         *
         * <p>The style property or properties in the second parameter must be the
         * JavaScript style property names. E.g. fontSize rather than font-size.</p>
         *
         * <p>The float style property will be unset by any of &quot;float&quot;,
         * &quot;styleFloat&quot;, or &quot;cssFloat&quot;.</p>
         *
         * @method unset
         * @param sel {String} the selector string to apply the changes to
         * @param css {String|Array} style property name or Array of names
         * @return {StyleSheet}
         * @chainable
         */
        unset: function(sel, css){
            var self = this, rule = self.cssRules[sel], multi = sel.split(/\s*,\s*/), remove = !css, rules, i;
            
            // IE's addRule doesn't support multiple comma delimited selectors
            // so rules are mapped internally by atomic selectors
            if (multi.length > 1) {
                for (i = multi.length - 1; i >= 0; --i) {
                    self.unset(multi[i], css);
                }
                return this;
            }
            
            if (rule) {
                if (!remove) {
                    css = $.makeArray(css);
                    
                    workerStyle.cssText = rule.style.cssText;
                    for (i = css.length - 1; i >= 0; --i) {
                        unsetProperty(workerStyle, css[i]);
                    }
                    
                    if (workerStyle.cssText) {
                        rule.style.cssText = workerStyle.cssText;
                    }
                    else {
                        remove = true;
                    }
                }
                
                if (remove) { // remove the rule altogether
                    rules = self.sheet[self._rules];
                    for (i = rules.length - 1; i >= 0; --i) {
                        if (rules[i] === rule) {
                            delete self.cssRules[sel];
                            self._deleteRule(i);
                            break;
                        }
                    }
                }
            }
            return self;
        },
        
        /**
         * Enable all the rules in the sheet
         *
         * @method enable
         * @return {StyleSheet}
         * @chainable
         */
        enable: function(){
            this.sheet.disabled = false;
            return this;
        },
        
        /**
         * Disable all the rules in the sheet.  Rules may be changed while the
         * StyleSheet is disabled.
         *
         * @method disable
         * @return {StyleSheet}
         * @chainable
         */
        disable: function(){
            this.sheet.disabled = true;
            return this;
        }
    });
    
    StyleSheet.toCssText = ((OPACITY in workerStyle) ? _toCssText : // Wrap IE's toCssText to catch opacity.  The copy/merge is to preserve
    // the input object's integrity, but if float and opacity are set, the
    // input will be copied twice in IE.  Is there a way to avoid this
    // without increasing the byte count?
    function(css, cssText){
        if (OPACITY in css) {
            css = $.extend(css, {
                filter: 'alpha(opacity=' + (css.opacity * 100) + ')'
            });
            delete css.opacity;
        }
        return _toCssText(css, cssText);
    });
    function isValidSelector(sel){
        var valid = false;
        
        if (sel && $.type(sel) === 'string') {
        
            if (!selectors.hasOwnProperty(sel)) {
                //noformat
                // TEST: there should be nothing but white-space left after
                // these destructive regexs
                selectors[sel] = !/\S/.test( // combinators
				sel.replace(/\s+|\s*[+~>]\s*/g, ' '). // attribute selectors (contents not validated)
					replace(/([^ ])\[.*?\]/g, '$1'). // pseudo-class|element selectors (contents of parens
                	// such as :nth-of-type(2) or :not(...) not validated)
                	replace(/([^ ])::?[a-z][a-z\-]+[a-z](?:\(.*?\))?/ig, '$1'). // element tags
					replace(/(?:^| )[a-z0-6]+/ig, ' '). // escaped characters
					replace(/\\./g, EMPTY). // class and id identifiers
					replace(/[.#]\w[\w\-]*/g, EMPTY));
				//format
            }
            
            valid = selectors[sel];
        }
        
        return valid;
    }
    
    UI.StyleSheet = StyleSheet;
    $.add('web-stylesheet');
})(jQuery, FE.ui);
