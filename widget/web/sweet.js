/**
 * Sweet (Simple WEb front-End Template)
 * A lightweight javascript template with high performance
 *
 * Copyright 2010, Mark One
 * http://code.google.com/p/sweet-template/
 *
 * Licensed under the MIT license
 *
 * @maintain qijun.weiqj
 */
('sweet' in FE.util) ||
(function($, Util){
    var subForPrefix = "__sub_foreach_", subIndexPrefix = "__index_", subTempIndexPrefix = "__index_tmp_", subTempVariablePrefix = "__var_tmp_", subLenPrefix = "__len_", printPrefix = "__buf__.push(";
    
    /**
     * Constructor of sweet template, no need to use 'new' keyword:
     *
     * <pre>
     * var tpl = Sweet([some template string...]);
     * </pre>
     * @param tplStr {string} Template string, could be any format with sweet delimiters (default to <[...]>)
     */
    var sweet = function(tplStr){
        tplStr = tplStr.replace(/[\n\r]/g, '\\n');
        
        // Prevent new operator
        if (!this.applyData) 
            return new sweet(tplStr);
        
        var re = new RegExp("(.*?)" + sweet.startDelimiter + "(.*?)" + sweet.endDelimiter, "g"), foreachRe = /foreach[\s\xa0]*\([\s\xa0]*(\S+?)[\s\xa0]*(?:as[\s\xa0]*(\S+?)){0,1}?[\s\xa0]*\)[\s\xa0]*\{/g, tmpStr, i, l, subExprs = [], replaced = [];
        
        tmpStr = tplStr.replace(re, function(m, text, expr){
            expr = $.trim(expr);
            if (text != "") {
                text = text.replace(/'/g, "\\'");
                replaced.push(printPrefix + '\'' + text + '\'');
                replaced.push(");");
                // deal with ?: expression
                if (expr.charAt(0) == ":") {
                    replaced[replaced.length - 1] = ")";
                }
            }
            if (expr != "") {
                if (expr.charAt(0) == "=") {
                    expr = printPrefix + expr.substr(1) + ');';
                }
                else {
                    if (!/[;\?\{\}:]/.test(expr.charAt(expr.length - 1))) 
                        expr = expr + ";";
                }
                replaced.push(expr);
            }
            
            return "";
        });
        if (tmpStr) {
            replaced.push(printPrefix + '\'' + tmpStr + '\'' + ");");
        }
        
        // Join into a string, and deal with sub expression
        replaced = replaced.join('').replace(foreachRe, function(m, varName, definedVarName){
            var subExpr = {
                type: "foreach",
                varName: varName,
                definedVarName: definedVarName || false
            }, id = subExprs.push(subExpr) - 1, header = subForPrefix + id + "_{";
            subExpr.id = id;
            return header;
        });
        
        // replace sub expression
        for (i = 0, l = subExprs.length; i < l; i++) {
            replaced = replaceSubExpr(replaced, subExprs[i]);
        }
        
        replaced = ["var __buf__=[],$index=null;$util.print=function(str){__buf__.push(str);};with($data){", replaced, "} return __buf__.join('');"].join('');
        
        this.compiled = new Function("$data", "$util", replaced);
    };
    
    /**
     * Public
     * Apply a json type data to tempalte
     * @param data {json}
     * @param scope {object} In your template's code, 'this' keywords will refer to the scope you assgined,
     *      default to window object
     * @return {string} replaced template string
     */
    sweet.prototype.applyData = function(data, scope){
        var util = {};
        if (sweet.util) {
            var _util = sweet.util;
            for (var key in _util) {
                util[key] = _util[key];
            }
        }
        return this.compiled.call(scope || window, data, util);
    }
    
    /**
     * Private
     * Replaces sub expression with executable code
     * @param str {string} expression string
     * @param subExpr {object} sub expression object
     */
    function replaceSubExpr(str, subExpr){
        var id = subExpr.id, varName = subExpr.varName, definedVarName = subExpr.definedVarName, indexName = subIndexPrefix + id, tmpIndexName = subTempIndexPrefix + id, tmpVarName = subTempVariablePrefix + id, lenName = subLenPrefix + id, indexVarName = [varName, "[", indexName, "]"].join(''), subRe = new RegExp(subForPrefix + id + "_{", "g"), braceRe = new RegExp("\{|\}", "g"), m, mbrace, subStr, index, lastIndex, unclosed = 0, prefix, suffix;
        if (definedVarName) {
            prefix = ["var ", tmpIndexName, "=$index;if(typeof ", definedVarName, " !='undefined')var ", tmpVarName, "=", definedVarName, ";else var ", definedVarName, "=null;for(var ", indexName, "=0,", lenName, "=", varName, ".length;", indexName, "<", lenName, ";", indexName, "++){$index=", indexName, ";", definedVarName, "=", indexVarName, ";with(", definedVarName, "){"].join('');
            suffix = ["}}$index=", tmpIndexName, ";if(typeof ", tmpVarName, "!='undefined')", definedVarName, "=", tmpVarName, ";"].join('');
        }
        else {
            prefix = ["var ", tmpIndexName, "=$index;for(var ", indexName, "=0,", lenName, "=", varName, ".length;", indexName, "<", lenName, ";", indexName, "++){$index=", indexName, ";with(", indexVarName, "){"].join('');
            suffix = "}}$index=" + tmpIndexName + ";";
        }
        m = subRe.exec(str);
        if (m) {
            index = m.index;
            lastIndex = subRe.lastIndex;
            subStr = str.substr(lastIndex);
            while ((mbrace = braceRe.exec(subStr))) {
                if (mbrace == "{") {
                    unclosed++;
                }
                else {
                    if (unclosed > 0) 
                        unclosed--;
                    else {
                        subStr = subStr.substring(0, mbrace.index) + suffix + subStr.substr(braceRe.lastIndex);
                        break;
                    }
                }
            }
            str = str.substring(0, index) + prefix + subStr;
        }
        return str;
    }
    
    // Default delimiters
    sweet.startDelimiter = "<%";
    sweet.endDelimiter = "%>";
    
    /**
     * You can use extendUtil method to add your own util methods to global util object,
     * such as string tools, version info, etc. Remember, all the change
     * you apply to global util object will effect all of the sweet templates
     * you has defined.
     */
    sweet.util = {
        trim: $.trim,
        escape: $.util.escapeHTML
    };
    Util.sweet = sweet;
    $.add('web-sweet');
})(jQuery, FE.util);

