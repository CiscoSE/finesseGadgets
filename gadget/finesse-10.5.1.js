/**
 * Cisco Finesse - JavaScript Library
 * Version 10.5(1)
 * Cisco Systems, Inc.
 * http://www.cisco.com/
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2014 Cisco Systems, Inc. or its affiliated entities.  All Rights Reserved.
 */
/**
 * This javascript library is made available to Cisco partners and customers as
 * a convenience to help minimize the cost of Cisco Finesse customizations.
 * This library can be used in Cisco Finesse deployments.  Cisco does not
 * permit the use of this library in customer deployments that do not include
 * Cisco Finesse.  Support for the javascript library is provided on a
 * "best effort" basis via CDN.  Like any custom deployment, it is the
 * responsibility of the partner and/or customer to ensure that the
 * customization works correctly and this includes ensuring that the Cisco
 * Finesse JavaScript is properly integrated into 3rd party applications.
 * Cisco reserves the right to make changes to the javascript code and
 * corresponding API as part of the normal Cisco Finesse release cycle.  The
 * implication of this is that new versions of the javascript might be
 * incompatible with applications built on older Finesse integrations.  That
 * said, it is Cisco's intention to ensure javascript compatibility across
 * versions as much as possible and Cisco will make every effort to clearly
 * document any differences in the javascript across versions in the event
 * that a backwards compatibility impacting change is made.
 */

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('../thirdparty/Class',[], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    }
}(function () {
    (function(){
        var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
        // The base Class implementation (does nothing)
        /** @private */
        this.Class = function(){};
        
        // Create a new Class that inherits from this class
        /** @private */
        Class.extend = function(prop) {
          var _super = this.prototype;
          
          // Instantiate a base class (but only create the instance,
          // don't run the init constructor)
          initializing = true;
          var prototype = new this();
          initializing = false;
          
          // Copy the properties over onto the new prototype
          for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && 
              typeof _super[name] == "function" && fnTest.test(prop[name]) ?
              (function(name, fn){
                return function() {
                  var tmp = this._super;
                  
                  // Add a new ._super() method that is the same method
                  // but on the super-class
                  this._super = _super[name];
                  
                  // The method only need to be bound temporarily, so we
                  // remove it when we're done executing
                  var ret = fn.apply(this, arguments);        
                  this._super = tmp;
                  
                  return ret;
                };
              })(name, prop[name]) :
              prop[name];
          }
          
          // The dummy class constructor
          /** @private */
          function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
              this.init.apply(this, arguments);
          }
          
          // Populate our constructed prototype object
          Class.prototype = prototype;
          
          // Enforce the constructor to be what we expect
          Class.prototype.constructor = Class;

          // And make this class extendable
          Class.extend = arguments.callee;
          
          return Class;
        };
      })();
}));

/**
 * JavaScript base object that all finesse objects should inherit
 * from because it encapsulates and provides the common functionality.
 *
 * Note: This javascript class requires the "inhert.js" to be included
 * (which simplifies the class inheritance).
 *
 *
 * @requires finesse.utilities.Logger
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global Class */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('FinesseBase', ["../thirdparty/Class"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(Class);
    }
}(function (Class) {
    var FinesseBase = Class.extend({
        init: function () {
        }
    }); 
    
    window.finesse = window.finesse || {};
    window.finesse.FinesseBase = FinesseBase;
    
    return FinesseBase;
}));

/**
 * A collection of conversion utilities.
 * Last modified 07-06-2011, Cisco Systems
 *
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
    	define('utilities/../../thirdparty/util/converter',[], factory);
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    } 
}(function () {
    window.finesse = window.finesse || {};

    /**
     * @class
     * Contains a collection of utility functions.
     * @private
     */
    window.finesse.Converter = (function () {
        return {
            /*  This work is licensed under Creative Commons GNU LGPL License.

                License: http://creativecommons.org/licenses/LGPL/2.1/
               Version: 0.9
                Author:  Stefan Goessner/2006
                Web:     http://goessner.net/ 

                2013-09-16 Modified to remove use of XmlNode.innerHTML in the innerXml function by Cisco Systems, Inc.
            */
            xml2json: function (xml, tab) {
                var X = {
                    toObj: function (xml) {
                        var o = {};
                        if (xml.nodeType === 1) {
                            // element node ..
                            if (xml.attributes.length)
                            // element with attributes  ..
                            for (var i = 0; i < xml.attributes.length; i++)
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                            if (xml.firstChild) {
                                // element has child nodes ..
                                var textChild = 0,
                                cdataChild = 0,
                                hasElementChild = false;
                                for (var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType == 1) hasElementChild = true;
                                    else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                                    // non-whitespace text
                                    else if (n.nodeType == 4) cdataChild++;
                                    // cdata section node
                                }
                                if (hasElementChild) {
                                    if (textChild < 2 && cdataChild < 2) {
                                        // structured element with evtl. a single text or/and cdata node ..
                                        X.removeWhite(xml);
                                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                                            if (n.nodeType == 3)
                                            // text node
                                            o["#text"] = X.escape(n.nodeValue);
                                            else if (n.nodeType == 4)
                                            // cdata node
                                            o["#cdata"] = X.escape(n.nodeValue);
                                            else if (o[n.nodeName]) {
                                                // multiple occurence of element ..
                                                if (o[n.nodeName] instanceof Array)
                                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                                else
                                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                            }
                                            else
                                            // first occurence of element..
                                            o[n.nodeName] = X.toObj(n);
                                        }
                                    }
                                    else {
                                        // mixed content
                                        if (!xml.attributes.length)
                                        o = X.escape(X.innerXml(xml));
                                        else
                                        o["#text"] = X.escape(X.innerXml(xml));
                                    }
                                }
                                else if (textChild) {
                                    // pure text
                                    if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                    else
                                    o["#text"] = X.escape(X.innerXml(xml));
                                }
                                else if (cdataChild) {
                                    // cdata
                                    if (cdataChild > 1)
                                    o = X.escape(X.innerXml(xml));
                                    else
                                    for (var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                                }
                            }
                            if (!xml.attributes.length && !xml.firstChild) o = null;
                        }
                        else if (xml.nodeType == 9) {
                            // document.node
                            o = X.toObj(xml.documentElement);
                        }
                        else
                            throw ("unhandled node type: " + xml.nodeType);
                        return o;
                    },
                    toJson: function(o, name, ind) {
                        var json = name ? ("\"" + name + "\"") : "";
                        if (o instanceof Array) {
                            for (var i = 0, n = o.length; i < n; i++)
                            o[i] = X.toJson(o[i], "", ind + "\t");
                            json += (name ? ":[": "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                        }
                        else if (o == null)
                        json += (name && ":") + "null";
                        else if (typeof(o) == "object") {
                            var arr = [];
                            for (var m in o)
                            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                            json += (name ? ":{": "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                        }
                        else if (typeof(o) == "string")
                        json += (name && ":") + "\"" + o.toString() + "\"";
                        else
                        json += (name && ":") + o.toString();
                        return json;
                    },
                    innerXml: function(node) {
                        var s = "";
                        var asXml = function(n) {
                            var s = "";
                            if (n.nodeType == 1) {
                                s += "<" + n.nodeName;
                                for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                                if (n.firstChild) {
                                    s += ">";
                                    for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                    s += "</" + n.nodeName + ">";
                                }
                                else
                                s += "/>";
                            }
                            else if (n.nodeType == 3)
                            s += n.nodeValue;
                            else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                            return s;
                        };
                        for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                        return s;
                    },
                    escape: function(txt) {
                        return txt.replace(/[\\]/g, "\\\\")
                        .replace(/[\"]/g, '\\"')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r');
                    },
                    removeWhite: function(e) {
                        e.normalize();
                        for (var n = e.firstChild; n;) {
                            if (n.nodeType == 3) {
                                // text node
                                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                                    // pure whitespace text node
                                    var nxt = n.nextSibling;
                                    e.removeChild(n);
                                    n = nxt;
                                }
                                else
                                n = n.nextSibling;
                            }
                            else if (n.nodeType == 1) {
                                // element node
                                X.removeWhite(n);
                                n = n.nextSibling;
                            }
                            else
                            // any other node
                            n = n.nextSibling;
                        }
                        return e;
                    }
                };
                if (xml.nodeType == 9)
                // document node
                xml = xml.documentElement;
                var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
                return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
            },
            
            /*  This work is licensed under Creative Commons GNU LGPL License.

                License: http://creativecommons.org/licenses/LGPL/2.1/
               Version: 0.9
                Author:  Stefan Goessner/2006
                Web:     http://goessner.net/ 
            */
            json2xml: function(o, tab) {
                var toXml = function(v, name, ind) {
                    var xml = "";
                    if (v instanceof Array) {
                        for (var i = 0, n = v.length; i < n; i++)
                        xml += ind + toXml(v[i], name, ind + "\t") + "\n";
                    }
                    else if (typeof(v) == "object") {
                        var hasChild = false;
                        xml += ind + "<" + name;
                        for (var m in v) {
                            if (m.charAt(0) == "@")
                            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                            else
                            hasChild = true;
                        }
                        xml += hasChild ? ">": "/>";
                        if (hasChild) {
                            for (var m in v) {
                                if (m == "#text")
                                xml += v[m];
                                else if (m == "#cdata")
                                xml += "<![CDATA[" + v[m] + "]]>";
                                else if (m.charAt(0) != "@")
                                xml += toXml(v[m], m, ind + "\t");
                            }
                            xml += (xml.charAt(xml.length - 1) == "\n" ? ind: "") + "</" + name + ">";
                        }
                    }
                    else {
                        xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
                    }
                    return xml;
                },
                xml = "";
                for (var m in o)
                xml += toXml(o[m], m, "");
                return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
            }
        };
    })();
}));

/**
 * SaxParser.js: provides a simple SAX parser
 *
 * NONVALIDATING - this will not validate whether you have valid XML or not. It will simply report what it finds.
 * Only supports elements, attributes, and text. No comments, cdata, processing instructions, etc.
 */

/**
 * @requires
 * @ignore
 */
// Add SaxParser to the finesse.utilities namespace
var finesse = finesse || {};
finesse.utilities = finesse.utilities || {};

(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('utilities/SaxParser', [], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        finesse.utilities.SaxParser = factory();
    }
}(function () {
	return {
		parse: function(xml, callback) {
			// Event callbacks
            /** @private */
			var triggerEvent = function (type, data) {
					callback.call(null, type, data);
				},
                /** @private */
				triggerStartElement = function (name) {
					triggerEvent("StartElement", name);
				},
                /** @private */
				triggerEndElement = function (name) {
					triggerEvent("EndElement", name);
				},
                /** @private */
				triggerAttribute = function (name, value) {
					triggerEvent("Attribute", { "name": name, "value": value });
				},
                /** @private */
				triggerText = function (text) {
					triggerEvent("Text", text);
				},

				// Parsing
				cursor = 0,
				xmlLength = xml.length,
				whitespaceRegex = /^[ \t\r\n]*$/,
				/** @private */
				isWhitespace = function (text) {
					return whitespaceRegex.test(text);
				},
                /** @private */
				moveToNonWhitespace = function () {
					while (isWhitespace(xml.charAt(cursor))) {
						cursor += 1;
					}
				},
                /** @private */
				parseAttribute = function () {
					var nameBuffer = [],
						valueBuffer = [],
						valueIsQuoted = false,
						cursorChar = "";

					nameBuffer.push(xml.charAt(cursor));

					// Get the name
					cursor += 1;
					while (cursor < xmlLength) {
						cursorChar = xml.charAt(cursor);
						if (isWhitespace(cursorChar) || cursorChar === "=") {
							// Move on to gathering value
							break;
						}
						else {
							nameBuffer.push(cursorChar);
						}
						cursor += 1;
					}

					// Skip the equals sign and any whitespace
					moveToNonWhitespace();
					if (cursorChar === "=") {
						cursor += 1;
					} else {
						throw new Error("Did not find = following attribute name at " + cursor);
					}
					moveToNonWhitespace();

					// Get the value
					valueIsQuoted = cursor !== xmlLength - 1 ? xml.charAt(cursor) === "\"": false;
					if (valueIsQuoted) {
						cursor += 1;
						while (cursor < xmlLength) {
							cursorChar = xml.charAt(cursor);
							if (cursorChar === "\"") {
								// Found the closing quote, so end value
								triggerAttribute(nameBuffer.join(""), valueBuffer.join(""));
								break;
							}
							else {
								valueBuffer.push(cursorChar);
							}
							cursor += 1;
						}
					}
					else {
						throw new Error("Found unquoted attribute value at " + cursor);
					}
				},
                /** @private */
				parseEndElement = function () {
					var elementNameBuffer = [],
						cursorChar = "";
					cursor += 2;
					while (cursor < xmlLength) {
						cursorChar = xml.charAt(cursor);
						if (cursorChar === ">") {
							triggerEndElement(elementNameBuffer.join(""));
							break;
						}
						else {
							elementNameBuffer.push(cursorChar);
						}
						cursor += 1;
					}
				},
                /** @private */
				parseReference = function() {
					var type,
						TYPE_DEC_CHAR_REF = 1,
						TYPE_HEX_CHAR_REF = 2,
						TYPE_ENTITY_REF = 3,
						buffer = "";
					cursor += 1;
					// Determine the type of reference.
					if (xml.charAt(cursor) === "#") {
						cursor += 1;
						if (xml.charAt(cursor) === "x") {
							type = TYPE_HEX_CHAR_REF;
							cursor += 1;
						} else {
							type = TYPE_DEC_CHAR_REF;
						}
					} else {
						type = TYPE_ENTITY_REF;
					}
					// Read the reference into a buffer.
					while (xml.charAt(cursor) !== ";") {
						buffer += xml.charAt(cursor);
						cursor += 1;
						if (cursor >= xmlLength) {
							throw new Error("Unterminated XML reference: " + buffer);
						}
					}
					// Convert the reference to the appropriate character.
					switch (type) {
						case TYPE_DEC_CHAR_REF:
							return String.fromCharCode(parseInt(buffer, 10));
						case TYPE_HEX_CHAR_REF:
							return String.fromCharCode(parseInt(buffer, 16));
						case TYPE_ENTITY_REF:
							switch (buffer) {
								case "amp":
									return "&";
								case "lt":
									return "<";
								case "gt":
									return ">";
								case "apos":
									return "'";
								case "quot":
									return "\"";
								default:
									throw new Error("Invalid XML entity reference: " + buffer);
							}
							// break; (currently unreachable)
					}
				},
                /** @private */
				parseElement = function () {
					var elementNameBuffer = [],
						textBuffer = [],
						cursorChar = "",
						whitespace = false;

					// Get element name
					cursor += 1;
					while (cursor < xmlLength) {
						cursorChar = xml.charAt(cursor);
						whitespace = isWhitespace(cursorChar);
						if (!whitespace && cursorChar !== "/" && cursorChar !== ">") {
							elementNameBuffer.push(cursorChar);
						}
						else {
							elementNameBuffer = elementNameBuffer.join("");
							triggerStartElement(elementNameBuffer);
							break;
						}
						cursor += 1;
					}

					// Get attributes
					if (whitespace) {
						while (cursor < xmlLength) {
							moveToNonWhitespace();
							cursorChar = xml.charAt(cursor);
							if (cursorChar !== "/" && cursorChar !== ">") {
								// Start of attribute
								parseAttribute();
							}
							cursorChar = xml.charAt(cursor);
							if (cursorChar === "/" || cursorChar === ">") {
								break;
							}
							else {
								cursor += 1;
							}
						}
					}

					// End tag if "/>" was found,
					// otherwise we're at the end of the start tag and have to parse into it
					if (cursorChar === "/") {
						if (cursor !== xmlLength - 1 && xml.charAt(cursor + 1) === ">") {
							cursor += 1;
							triggerEndElement(elementNameBuffer);
						}
					}
					else {
						// cursor is on ">", so parse into element content. Assume text until we find a "<",
						// which could be a child element or the current element's end tag. We do not support
						// mixed content of text and elements as siblings unless the text is only whitespace.
						// Text cannot contain <, >, ", or &. They should be &lt;, &gt;, &quot;, &amp; respectively.
						cursor += 1;
						while (cursor < xmlLength) {
							cursorChar = xml.charAt(cursor);
							if (cursorChar === "<") {
								// Determine if end tag or element
								if (cursor !== xmlLength - 1 && xml.charAt(cursor + 1) === "/") {
									// At end tag
									textBuffer = textBuffer.join("");
									if (!isWhitespace(textBuffer)) {
										triggerText(textBuffer);
									}
									parseEndElement();
									break;
								}
								else {
									// At start tag
									textBuffer = textBuffer.join("");
									if (!isWhitespace(textBuffer)) {
										triggerText(textBuffer);
									}
									parseElement();
									textBuffer = [];
								}
							} else if (cursorChar === "&") {
								textBuffer.push(parseReference());
							}
							else {
								textBuffer.push(cursorChar);
							}
							cursor += 1;
						}
					}
				},
                /** @private */
				skipXmlDeclaration = function() {
					if (xml.substr(0, 5) === "<?xml" && isWhitespace(xml.charAt(5))) {
						cursor = xml.indexOf(">") + 1;
					}
					moveToNonWhitespace();
				};

			// Launch.
			skipXmlDeclaration();
			parseElement();
		}
	};
}));

/**
* Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
* ?? 2011 Colin Snover <http://zetafleet.com>
* Released under MIT license.
*/
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('iso8601', [], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    } 
}(function () {
    (function (Date, undefined) {
        var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
    	/** @private **/
        Date.parse = function (date) {
            var timestamp, struct, minutesOffset = 0;

            // ES5 ??15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
            // before falling back to any implementation-specific date parsing, so that???s what we do, even if native
            // implementations could be faster
            // 1 YYYY 2 MM 3 DD 4 HH 5 mm 6 ss 7 msec 8 Z 9 ?? 10 tzHH 11 tzmm
            if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
                // avoid NaN timestamps caused by ???undefined??? values being passed to Date.UTC
                for (var i = 0, k; (k = numericKeys[i]); ++i) {
                    struct[k] = +struct[k] || 0;
                }

                // allow undefined days and months
                struct[2] = (+struct[2] || 1) - 1;
                struct[3] = +struct[3] || 1;

                if (struct[8] !== 'Z' && struct[9] !== undefined) {
                    minutesOffset = struct[10] * 60 + struct[11];

                    if (struct[9] === '+') {
                        minutesOffset = 0 - minutesOffset;
                    }
                }

                timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
            }
            else {
                timestamp = origParse ? origParse(date) : NaN;
            }

            return timestamp;
        };
    }(Date));
}));

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('Math.uuid', [], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    } 
}(function () {
    (function() {
        // Private array of chars to use
        var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

        /** @private **/
        Math.uuid = function (len, radix) {
          var chars = CHARS, uuid = [], i;
          radix = radix || chars.length;

          if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
          } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
              if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
              }
            }
          }

          return uuid.join('');
        };

        // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
        // by minimizing calls to random()
        /** @private **/
        Math.uuidFast = function() {
          var chars = CHARS, uuid = new Array(36), rnd=0, r;
          for (var i = 0; i < 36; i++) {
            if (i==8 || i==13 ||  i==18 || i==23) {
              uuid[i] = '-';
            } else if (i==14) {
              uuid[i] = '4';
            } else {
              if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
              r = rnd & 0xf;
              rnd = rnd >> 4;
              uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
          }
          return uuid.join('');
        };

        // A more compact, but less performant, RFC4122v4 solution:
        /** @private **/
        Math.uuidCompact = function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          });
        };
      })();
}));

/**
 * The following comment prevents JSLint errors concerning undefined global variables.
 * It tells JSLint that these identifiers are defined elsewhere.
 */
/*jslint bitwise:true, browser:true, nomen:true, regexp:true, sloppy:true, white:true, plusplus: true, unparam: true, forin: true */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global $, _prefs,_uiMsg,ciscowidgets,dojo,finesse,gadgets,hostUrl, Handlebars */

/**
 *  A collection of utility functions.
 *
 * @requires finesse.Converter
 */
var finesse = finesse || {};
/** @namespace Useful javascript utility methods. */  
finesse.utilities = finesse.utilities || {};

(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('utilities/Utilities', ["../../thirdparty/util/converter",
                "utilities/SaxParser",
                "iso8601",
                "Math.uuid"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        finesse.utilities.Utilities = factory(finesse.Converter, finesse.utilities.SaxParser);
    }
}(function (Converter, SaxParser) {
    var Utilities = /** @lends finesse.utilities.Utilities */ {

        /**
         * @class
         * A PhoneBook is a list of Contacts available to a User for quick dial.
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.Contacts
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here for jsdocs. */
        },
            
        /**
         * @private
         * Retrieves the specified item from window.localStorage
         * @param {String} key
         *     The key of the item to retrieve
         * @returns {String}
         *     The string with the value of the retrieved item; returns
         *     what the browser would return if not found (typically null or undefined)
         *     Returns false if window.localStorage feature is not even found.
         */
        getDOMStoreItem: function (key) {
            var store = window.localStorage;
            if (store) {
                return store.getItem(key);
            }
        },

        /**
         * @private
         * Sets an item into window.localStorage
         * @param {String} key
         *     The key for the item to set
         * @param {String} value
         *     The value to set
         * @returns {Boolean}
         *     True if successful, false if window.localStorage is
         *     not even found.
         */
        setDOMStoreItem: function (key, value) {
            var store = window.localStorage;
            if (store) {
                store.setItem(key, value);
                return true;
            }
            return false;
        },

        /**
         * @private
         * Removes a particular item from window.localStorage
         * @param {String} key
         *     The key of the item to remove
         * @returns {Boolean}
         *     True if successful, false if not
         *     Returns false if window.localStorage feature is not even found.
         */
        removeDOMStoreItem: function (key) {
            var store = window.localStorage;
            if (store) {
                store.removeItem(key);
                return true;
            }
            return false;
        },

        /**
         * @private
         * Dumps all the contents of window.localStorage
         * @returns {Boolean}
         *     True if successful, false if not.
         *     Returns false if window.localStorage feature is not even found.
         */
        clearDOMStore: function () {
            var store = window.localStorage;
            if (store) {
                store.clear();
                return true;
            }
            return false;
        },

        /**
         * @private
         * Creates a message listener for window.postMessage messages.
         * @param {Function} callback
         *     The callback that will be invoked with the message. The callback
         *     is responsible for any security checks.
         * @param {String} [origin]
         *     The origin to check against for security. Allows all messages
         *     if no origin is provided.
         * @returns {Function}
         *     The callback function used to register with the message listener.
         *     This is different than the one provided as a parameter because
         *     the function is overloaded with origin checks.
         * @throws {Error} If the callback provided is not a function.
         */
        receiveMessage: function (callback, origin) {
            if (typeof callback !== "function") {
                throw new Error("Callback is not a function.");
            }

            //Create a function closure to perform origin check.
            /** @private */
            var cb = function (e) {
                // If an origin check is requested (provided), we'll only invoke the callback if it passes
                if (typeof origin !== "string" || (typeof origin === "string" && typeof e.origin === "string" && e.origin.toLowerCase() === origin.toLowerCase())) {
                    callback(e);
                }
            };

            if (window.addEventListener) { //Firefox, Opera, Chrome, Safari
                window.addEventListener("message", cb, false);
            } else { //Internet Explorer
                window.attachEvent("onmessage", cb);
            }

            //Return callback used to register with listener so that invoker
            //could use it to remove.
            return cb;
        },

        /**
         * @private
         * Sends a message to a target frame using window.postMessage.
         * @param {Function} message
         *     Message to be sent to target frame.
         * @param {Object} [target="parent"]
         *     An object reference to the target frame. Default us the parent.
         * @param {String} [targetOrigin="*"]
         *     The URL of the frame this frame is sending the message to.
         */
        sendMessage: function (message, target, targetOrigin) {
            //Default to any target URL if none is specified.
            targetOrigin = targetOrigin || "*";

            //Default to parent target if none is specified.
            target = target || parent;

            //Ensure postMessage is supported by browser before invoking.
            if (window.postMessage) {
                target.postMessage(message, targetOrigin);
            }
        },

        /**
         * Returns the passed in handler, if it is a function.
         * @param {Function} handler
         *     The handler to validate
         * @returns {Function}
         *     The provided handler if it is valid
         * @throws Error
         *     If the handler provided is invalid
         */
        validateHandler: function (handler) {
            if (handler === undefined || typeof handler === "function") {
                return handler;
            } else {
                throw new Error("handler must be a function");
            }
        },

        /**
         * @private
         * Tries to get extract the AWS error code from a
         * finesse.clientservices.ClientServices parsed error response object.
         * @param {Object} rsp
         *     The handler to validate
         * @returns {String}
         *     The error code, HTTP status code, or undefined
         */
        getErrCode: function (rsp) {
            try { // Best effort to get the error code
                return rsp.object.ApiErrors.ApiError.ErrorType;
            } catch (e) { // Second best effort to get the HTTP Status code
                if (rsp && rsp.status) {
                    return "HTTP " + rsp.status;
                }
            } // Otherwise, don't return anything (undefined)
        },

        /**
         * @private
         * Tries to get extract the AWS error data from a
         * finesse.clientservices.ClientServices parsed error response object.
         * @param {Object} rsp
         *     The handler to validate
         * @returns {String}
         *     The error data, HTTP status code, or undefined
         */
        getErrData: function (rsp) {
            try { // Best effort to get the error data
                return rsp.object.ApiErrors.ApiError.ErrorData;
            } catch (e) { // Second best effort to get the HTTP Status code
                if (rsp && rsp.status) {
                    return "HTTP " + rsp.status;
                }
            } // Otherwise, don't return anything (undefined)
        },
        
        /**
         * @private
         * Tries to get extract the AWS overrideable boolean from a
         * finesse.clientservices.ClientServices parsed error response object.
         * @param {Object} rsp
         *     The handler to validate
         * @returns {String}
         *     The overrideable boolean, HTTP status code, or undefined
         */
        getErrOverrideable: function (rsp) {
            try { // Best effort to get the override boolean
                return rsp.object.ApiErrors.ApiError.Overrideable;
            } catch (e) { // Second best effort to get the HTTP Status code
                if (rsp && rsp.status) {
                    return "HTTP " + rsp.status;
                }
            } // Otherwise, don't return anything (undefined)
        },

        /**
         * Trims leading and trailing whitespace from a string.
         * @param {String} str
         *     The string to trim
         * @returns {String}
         *     The trimmed string
         */
        trim: function (str) {
            return str.replace(/^\s*/, "").replace(/\s*$/, "");
        },

        /**
         * Utility method for getting the current time in milliseconds.
         * @returns {String}
         *     The current time in milliseconds
         */
        currentTimeMillis : function () {
            return (new Date()).getTime();
        },

       /**
        * Gets the current drift (between client and server)
        *
        * @returns {integer} which is the current drift (last calculated; 0 if we have not calculated yet)
        */
       getCurrentDrift : function () {
            var drift;
            
            //Get the current client drift from localStorage
            drift = window.sessionStorage.getItem("clientTimestampDrift");
            if (drift) {
                 drift = parseInt(drift, 10);
                 if (isNaN(drift)) {
                      drift = 0; 
                 }
            }
          return drift;
        },

       /**
        * Converts the specified clientTime to server time by adjusting by the current drift.
        *
        * @param clientTime is the time in milliseconds
        * @returns {int} serverTime in milliseconds
        */
        convertToServerTimeMillis : function(clientTime) {
            var drift = this.getCurrentDrift();
            return (clientTime + drift);
        },

        /**
         * Utility method for getting the current time,
         * adjusted by the calculated "drift" to closely
         * approximate the server time.  This is used
         * when calculating durations based on a server
         * timestamp, which otherwise can produce unexpected
         * results if the times on client and server are
         * off.
         * 
         * @returns {String}
         *     The current server time in milliseconds
         */
        currentServerTimeMillis : function () {
            var drift = this.getCurrentDrift();
            return (new Date()).getTime() + drift;
        },

        /**
         * Given a specified timeInMs, this method will builds a string which displays minutes and seconds. 
         *
         * @param timeInMs is the time in milliseconds
         * @returns {String} which corresponds to minutes and seconds (e.g. 11:23)
         */
        buildTimeString : function (timeInMs) {
           var min, sec, timeStr = "00:00";
          
           if (timeInMs && timeInMs !== "-1") {
              // calculate minutes, and seconds
              min = this.pad(Math.floor(timeInMs / 60000));
              sec = this.pad(Math.floor((timeInMs % 60000) / 1000));
              
              // construct MM:SS time string
              timeStr =  min + ":" + sec;
           }
           return timeStr;  
        },
        
        /**
         * Given a specified timeInMs, this method will builds a string which displays minutes and seconds (and optionally hours)
         *
         * @param timeInMs is the time in milliseconds
         * @returns {String} which corresponds to hours, minutes and seconds (e.g. 01:11:23 or 11:23)
         */
        buildTimeStringWithOptionalHours: function (timeInMs) {
           var hour, min, sec, timeStr = "00:00", optionalHour = "", timeInSecs;
          
           if (timeInMs && timeInMs !== "-1") {
              timeInSecs = timeInMs / 1000;
              
              // calculate {hours}, minutes, and seconds
              hour = this.pad(Math.floor(timeInSecs / 3600));
              min = this.pad(Math.floor((timeInSecs % 3600) / 60));
              sec = this.pad(Math.floor((timeInSecs % 3600) % 60));   
              
              //Optionally add the hour if we have hours
              if (hour > 0) {
                optionalHour = hour + ":";
              }
              
              // construct MM:SS time string (or optionally HH:MM:SS)
              timeStr = optionalHour + min + ":" + sec; 
           }
           return timeStr;
        },
        
        
        /**
         * Builds a string which specifies the amount of time user has been in this state (e.g. 11:23).
         *
         * @param adjustedServerTimeInMs is integer argument which specifies the expected server time (accounting for clientdrift)
         * @param stateStartTimeInMs is integer argument which specifies time call entered current state
         * @returns {String} which is the elapsed time (MINUTES:SECONDS) 
         *
         */
        buildElapsedTimeString : function (adjustedServerTimeInMs, stateStartTimeInMs) {
           var result, delta;
           
           result = "--:--";
           if (stateStartTimeInMs !== 0) {
             delta = adjustedServerTimeInMs - stateStartTimeInMs;
             
             if (delta > 0) {
               result = this.buildTimeString(delta);
             }
          }
          return result;
       },
       
        /**
         * Builds a string which specifies the amount of time user has been in this state with optional hours (e.g. 01:11:23 or 11:23).
         *
         * @param adjustedServerTimeInMs is integer argument which specifies the expected server time (accounting for clientdrift)
         * @param startTimeInMs is integer argument which specifies the start time
         * @returns {String} which is the elapsed time (MINUTES:SECONDS) or (HOURS:MINUTES:SECONDS)
         *
         */
        buildElapsedTimeStringWithOptionalHours : function (adjustedServerTimeInMs, stateStartTimeInMs) {
           var result, delta;
           
           result = "--:--";
           if (stateStartTimeInMs !== 0) {
             delta = adjustedServerTimeInMs - stateStartTimeInMs;
             
             if (delta > 0) {
               result = this.buildTimeStringWithOptionalHours(delta);
             }
          }
          return result;
       },
       
       
       /**
        * Builds a string which displays the total call time in minutes and seconds.
        *
        * @param adjustedServerTimeInMs is integer argument which specifies the expected server time (accounting for clientdrift)
        * @param callStartTimeInMs is integer argument which specifies time the call started
        * @returns {String} which is the elapsed time [MINUTES:SECONDS]
        */
       buildTotalTimeString : function (adjustedServerTimeInMs, callStartTimeInMs) {
          return this.buildElapsedTimeString(adjustedServerTimeInMs, callStartTimeInMs);
       },
       
       /**
        * Builds a string which displays the hold time in minutes and seconds.
        *
        * @param adjustedServerTimeInMs is integer argument which specifies the expected server time (accounting for clientdrift)
        * @param holdStartTimeInMs is integer argument which specifies time the hold started
        * @returns {String} which is the elapsed time [MINUTES:SECONDS] 
        */
       buildHoldTimeString : function (adjustedServerTimeInMs, holdStartTimeInMs) {
          return this.buildElapsedTimeString(adjustedServerTimeInMs, holdStartTimeInMs);
      },
      
      /**
       * Builds a string which displays the elapsed time the call has been in wrap up.
       *
       * @param adjustedServerTimeInMs is integer argument which specifies the expected server time (accounting for clientdrift)
       * @param wrapupStartTimeInMs is integer argument which specifies time call entered wrapup state
       * @returns {String} which is the elapsed wrapup time
       *
       */
      buildWrapupTimeString : function (adjustedServerTimeInMs, wrapupStartTimeInMs) {
         return this.buildElapsedTimeString(adjustedServerTimeInMs, wrapupStartTimeInMs);
      },
      
      /**
       * Extracts a time from the timeStr.  Note: The timeStr could be empty.  In this case, the time returned will be 0.
       * @param timeStr is a time string in ISO8601 format (note: could be empty)
       * @returns {long} is the time 
       */
      extractTime : function (timeStr) {
         var result = 0, theDate;
         if (timeStr === "") {
           result = 0;
         } else if (timeStr === null) {
           result = 0;
         } else {
           theDate = this.parseDateStringISO8601(timeStr);
           result = theDate.getTime();
         }
         return result;
      },
      
      /**
       * @private
       * Generates an RFC1422v4-compliant UUID using pesudorandom numbers.
       * @returns {String}
       *     An RFC1422v4-compliant UUID using pesudorandom numbers.
       **/        
        generateUUID: function () {
            return Math.uuidCompact();
        },

        /** @private */
        xml2json: Converter.xml2json,
        
        
        /**
         * @private
         * Utility method to get the JSON parser either from gadgets.json
         * or from window.JSON (which will be initialized by CUIC if 
         * browser doesn't support
         */
        getJSONParser: function() {
            var _container = window.gadgets || {},
                parser = _container.json || window.JSON;
            return parser;
        },

       /**
        * @private
        * Utility method to convert a javascript object to XML.
        * @param {Object} object
        *   The object to convert to XML.
        * @param {Boolean} escapeFlag
        *   If escapeFlag evaluates to true:
        *       - XML escaping is done on the element values.
        *       - Attributes, #cdata, and #text is not supported.
        *       - The XML is unformatted (no whitespace between elements).
        *   If escapeFlag evaluates to false:
        *       - Element values are written 'as is' (no escaping).
        *       - Attributes, #cdata, and #text is supported.
        *       - The XML is formatted.
        * @returns The XML string.
        */
        json2xml: function (object, escapeFlag) {
            var xml;
            if (escapeFlag) {
                xml = this._json2xmlWithEscape(object);
            }
            else {
                xml = Converter.json2xml(object, '\t');
            }
            return xml;
        },

        /**
         * @private
         * Utility method to convert XML string into javascript object.
         */
        xml2JsObj : function (event) {
            var parser = this.getJSONParser();
            return parser.parse(Converter.xml2json(jQuery.parseXML(event), ""));
        },

       /**
        * @private
        * Utility method to convert an XML string to a javascript object.
        * @desc This function calls to the SAX parser and responds to callbacks
        *     received from the parser. Entity translation is not handled here.
        * @param {String} xml
        *   The XML to parse.
        * @returns The javascript object.
        */
        xml2js: function (xml) {
            var STATES = {
                    INVALID: 0,
                    NEW_NODE: 1,
                    ATTRIBUTE_NODE: 2,
                    TEXT_NODE: 3,
                    END_NODE: 4
                },
                state = STATES.INVALID,
                rootObj = {},
                newObj,
                objStack = [rootObj],
                nodeName = "",

                /**
                * @private
                * Adds a property to the current top JSO.
                * @desc This is also where we make considerations for arrays.
                * @param {String} name
                *   The name of the property to add.
                * @param (String) value
                *     The value of the property to add.
                */
                addProperty = function (name, value) {
                    var current = objStack[objStack.length - 1];
                    if(current.hasOwnProperty(name) && current[name] instanceof Array){
                        current[name].push(value);
                    }else if(current.hasOwnProperty(name)){
                        current[name] = [current[name], value];
                    }else{
                        current[name] = value;
                    }
                },

                /**
                * @private
                * The callback passed to the SAX parser which processes events from
                * the SAX parser in order to construct the resulting JSO.
                * @param (String) type
                *     The type of event received.
                * @param (String) data
                *     The data received from the SAX parser. The contents of this
                *     parameter vary based on the type of event.
                */
                xmlFound = function (type, data) {
                    switch (type) {
                    case "StartElement":
                        // Because different node types have different expectations
                        // of parenting, we don't push another JSO until we know
                        // what content we're getting

                        // If we're already in the new node state, we're running
                        // into a child node. There won't be any text here, so
                        // create another JSO
                        if(state === STATES.NEW_NODE){
                            newObj = {};
                            addProperty(nodeName, newObj);
                            objStack.push(newObj);
                        }
                        state = STATES.NEW_NODE;
                        nodeName = data;
                        break;
                    case "EndElement":
                        // If we're in the new node state, we've found no content
                        // set the tag property to null
                        if(state === STATES.NEW_NODE){
                            addProperty(nodeName, null);
                        }else if(state === STATES.END_NODE){
                            objStack.pop();
                        }
                        state = STATES.END_NODE;
                        break;
                    case "Attribute":
                        // If were in the new node state, no JSO has yet been created
                        // for this node, create one
                        if(state === STATES.NEW_NODE){
                            newObj = {};
                            addProperty(nodeName, newObj);
                            objStack.push(newObj);
                        }
                        // Attributes are differentiated from child elements by a
                        // preceding "@" in the property name
                        addProperty("@" + data.name, data.value);
                        state = STATES.ATTRIBUTE_NODE;
                        break;
                    case "Text":
                        // In order to maintain backwards compatibility, when no
                        // attributes are assigned to a tag, its text contents are
                        // assigned directly to the tag property instead of a JSO.

                        // If we're in the attribute node state, then the JSO for
                        // this tag was already created when the attribute was
                        // assigned, differentiate this property from a child
                        // element by naming it "#text"
                        if(state === STATES.ATTRIBUTE_NODE){
                            addProperty("#text", data);
                        }else{
                            addProperty(nodeName, data);
                        }
                        state = STATES.TEXT_NODE;
                        break;
                    }
                };
            SaxParser.parse(xml, xmlFound);
            return rootObj;
        },

       /**
        * @private
        * Traverses a plain-old-javascript-object recursively and outputs its XML representation.
        * @param {Object} obj
        *     The javascript object to be converted into XML.
        * @returns {String} The XML representation of the object.
        */
        js2xml: function (obj) {
            var xml = "", i, elem;

            if (obj !== null) {
                if (obj.constructor === Object) {
                    for (elem in obj) {
                        if (obj[elem] === null || typeof(obj[elem]) === 'undefined') {
                            xml += '<' + elem + '/>';
                        } else if (obj[elem].constructor === Array) {
                            for (i = 0; i < obj[elem].length; i++) {
                                xml += '<' + elem + '>' + this.js2xml(obj[elem][i]) + '</' + elem + '>';
                            }
                        } else if (elem[0] !== '@') {
                            if (this.js2xmlObjIsEmpty(obj[elem])) {
                                xml += '<' + elem + this.js2xmlAtt(obj[elem]) + '/>';
                            } else if (elem === "#text") {
                                xml += obj[elem];
                            } else {
                                xml += '<' + elem + this.js2xmlAtt(obj[elem]) + '>' + this.js2xml(obj[elem]) + '</' + elem + '>';
                            }
                        }
                    }
                } else {
                    xml = obj;
                }
            }

            return xml;
        },

       /**
        * @private
        * Utility method called exclusively by js2xml() to find xml attributes.
        * @desc Traverses children one layer deep of a javascript object to "look ahead"
        * for properties flagged as such (with '@').
        * @param {Object} obj
        *   The obj to traverse.
        * @returns {String} Any attributes formatted for xml, if any.
        */
        js2xmlAtt: function (obj) {
            var elem;

            if (obj !== null) {
                if (obj.constructor === Object) {
                    for (elem in obj) {
                        if (obj[elem] !== null && typeof(obj[elem]) !== "undefined" && obj[elem].constructor !== Array) {
                            if (elem[0] === '@'){
                                return ' ' + elem.substring(1) + '="' + obj[elem] + '"';
                            }
                        }
                    }
                }
            }

            return '';
        },

       /**
        * @private
        * Utility method called exclusively by js2xml() to determine if
        * a node has any children, with special logic for ignoring attributes.
        * @desc Attempts to traverse the elements in the object while ignoring attributes.
        * @param {Object} obj
        *   The obj to traverse.
        * @returns {Boolean} whether or not the JS object is "empty"
        */
        js2xmlObjIsEmpty: function (obj) {
            var elem;

            if (obj !== null) {
                if (obj.constructor === Object) {
                    for (elem in obj) {
                        if (obj[elem] !== null) {
                            if (obj[elem].constructor === Array){
                                return false;
                            }

                            if (elem[0] !== '@'){
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            }

            return true;
        },

        /**
         * Encodes the given string into base64.
         *<br>
         * <b>NOTE:</b> {input} is assumed to be UTF-8; only the first
         * 8 bits of each input element are significant.
         *
         * @param {String} input
         *     The string to convert to base64.
         * @returns {String}
         *     The converted string.
         */
        b64Encode: function (input) {
            var output = "", idx, data,
                table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            for (idx = 0; idx < input.length; idx += 3) {
                data =  input.charCodeAt(idx) << 16 |
                            input.charCodeAt(idx + 1) << 8 |
                            input.charCodeAt(idx + 2);

                //assume the first 12 bits are valid
                output +=   table.charAt((data >>> 18) & 0x003f) +
                            table.charAt((data >>> 12) & 0x003f);
                output +=   ((idx + 1) < input.length) ?
                            table.charAt((data >>> 6) & 0x003f) :
                            "=";
                output +=   ((idx + 2) < input.length) ?
                            table.charAt(data & 0x003f) :
                            "=";
            }

            return output;
        },

        /**
         * Decodes the given base64 string.
         * <br>
         * <b>NOTE:</b> output is assumed to be UTF-8; only the first
         * 8 bits of each output element are significant.
         *
         * @param {String} input
         *     The base64 encoded string
         * @returns {String}
         *     Decoded string
         */
        b64Decode: function (input) {
            var output = "", idx, h, data,
                table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            for (idx = 0; idx < input.length; idx += 4) {
                h = [
                    table.indexOf(input.charAt(idx)),
                    table.indexOf(input.charAt(idx + 1)),
                    table.indexOf(input.charAt(idx + 2)),
                    table.indexOf(input.charAt(idx + 3))
                ];

                data = (h[0] << 18) | (h[1] << 12) | (h[2] << 6) | h[3];
                if (input.charAt(idx + 2) === '=') {
                    data = String.fromCharCode(
                        (data >>> 16) & 0x00ff
                    );
                } else if (input.charAt(idx + 3) === '=') {
                    data = String.fromCharCode(
                        (data >>> 16) & 0x00ff,
                        (data >>> 8) & 0x00ff
                    );
                } else {
                    data = String.fromCharCode(
                        (data >>> 16) & 0x00ff,
                        (data >>> 8) & 0x00ff,
                        data & 0x00ff
                    );
                }
                output += data;
            }

            return output;
        },

        /**
         * @private
         * Extracts the username and the password from the Base64 encoded string.
         * @params {String}
         *     A base64 encoded string containing credentials that (when decoded)
         *     are colon delimited.
         * @returns {Object}
         *     An object with the following structure:
         *     {id:string, password:string}
         */
        getCredentials: function (authorization) {
            var credObj = {},
                credStr = this.b64Decode(authorization),
                colonIndx = credStr.indexOf(":");

            //Check to ensure that string is colon delimited.
            if (colonIndx === -1) {
                throw new Error("String is not colon delimited.");
            }

            //Extract ID and password.
            credObj.id = credStr.substring(0, colonIndx);
            credObj.password = credStr.substring(colonIndx + 1);
            return credObj;
        },

        /**
         * Takes a string and removes any spaces within the string.
         * @param {String} string
         *     The string to remove spaces from
         * @returns {String}
         *     The string without spaces
         */
        removeSpaces: function (string) {
            return string.split(' ').join('');
        },

        /**
         * Escapes spaces as encoded "&nbsp;" characters so they can
         * be safely rendered by jQuery.text(string) in all browsers.
         *
         * (Although IE behaves as expected, Firefox collapses spaces if this function is not used.)
         *
         * @param text
         *    The string whose spaces should be escaped
         *
         * @returns
         *    The string with spaces escaped
         */
        escapeSpaces: function (string) {
            return string.replace(/\s/g, '\u00a0');
        },

        /**
         * Adds a span styled to line break at word edges around the string passed in.
         * @param str String to be wrapped in word-breaking style.
         * @private
         */
        addWordWrapping : function (str) {
            return '<span style="word-wrap: break-word;">' + str + '</span>';
        },

        /**
         * Takes an Object and determines whether it is an Array or not.
         * @param {Object} obj
         *     The Object in question
         * @returns {Boolean}
         *     true if the object is an Array, else false.
         */
        isArray: function (obj) {
            return obj.constructor.toString().indexOf("Array") !== -1;
        },

        /**
         * @private
         * Takes a data object and returns an array extracted
         * @param {Object} data
         *     JSON payload
         *
         * @returns {array}
         *     extracted array
         */
        getArray: function (data) {
            if (this.isArray(data)) {
                //Return if already an array.
                return data;
            } else {
                //Create an array, iterate through object, and push to array. This
                //should only occur with one object, and therefore one obj in array.
                var arr = [];
                arr.push(data);
                return arr;
            }
        },

        /**
         * @private
         * Extracts the ID for an entity given the Finesse REST URI. The ID is
         * assumed to be the last element in the URI (after the last "/").
         * @param {String} uri
         *     The Finesse REST URI to extract the ID from.
         * @returns {String}
         *     The ID extracted from the REST URI.
         */
        getId: function (uri) {
            if (!uri) {
                return "";
            }
            var strLoc = uri.lastIndexOf("/");
            return uri.slice(strLoc + 1);
        },

        /**
         * Compares two objects for equality.
         * @param {Object} obj1 
         *      First of two objects to compare.
         * @param {Object} obj2
         *      Second of two objects to compare.
         */
        getEquals: function (objA, objB) {
            var key;

            for (key in objA) {
                if (objA.hasOwnProperty(key)) {
                    if (!objA[key]) {
                        objA[key] = "";
                    }

                    if (typeof objB[key] === 'undefined') {
                        return false;
                    }
                    if (typeof objB[key] === 'object') {
                        if (!objB[key].equals(objA[key])) {
                            return false;
                        }
                    }
                    if (objB[key] !== objA[key]) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * Regular expressions used in translating HTML and XML entities
         */
        ampRegEx : new RegExp('&', 'gi'),
        ampEntityRefRegEx : new RegExp('&amp;', 'gi'),
        ltRegEx : new RegExp('<', 'gi'),
        ltEntityRefRegEx : new RegExp('&lt;', 'gi'),
        gtRegEx : new RegExp('>', 'gi'),
        gtEntityRefRegEx : new RegExp('&gt;', 'gi'),
        xmlSpecialCharRegEx: new RegExp('[&<>"\']', 'g'),
        entityRefRegEx: new RegExp('&[^;]+(?:;|$)', 'g'),

        /**
         * Translates between special characters and HTML entities
         *
         * @param text
         *     The text to translate
         *
         * @param makeEntityRefs
         *    If true, encode special characters as HTML entities; if
         *    false, decode HTML entities back to special characters
         *
         * @private
         */
        translateHTMLEntities: function (text, makeEntityRefs) {
            if (typeof(text) !== "undefined" && text !== null && text !== "") {
                if (makeEntityRefs) {
                    text = text.replace(this.ampRegEx, '&amp;');
                    text = text.replace(this.ltRegEx, '&lt;');
                    text = text.replace(this.gtRegEx, '&gt;');
                } else {
                    text = text.replace(this.gtEntityRefRegEx, '>');
                    text = text.replace(this.ltEntityRefRegEx, '<');
                    text = text.replace(this.ampEntityRefRegEx, '&');
                }
            }

            return text;
        },

        /**
         * Translates between special characters and XML entities
         *
         * @param text
         *     The text to translate
         *
         * @param makeEntityRefs
         *    If true, encode special characters as XML entities; if
         *    false, decode XML entities back to special characters
         *
         * @private
         */
        translateXMLEntities: function (text, makeEntityRefs) {
            /** @private */
            var escape = function (character) {
                switch (character) {
                    case "&":
                        return "&amp;";
                    case "<":
                        return "&lt;";
                    case ">":
                        return "&gt;";
                    case "'":
                        return "&apos;";
                    case "\"":
                        return "&quot;";
                    default:
                        return character;
                }
            },
            /** @private */
            unescape = function (entity) {
                switch (entity) {
                    case "&amp;":
                        return "&";
                    case "&lt;":
                        return "<";
                    case "&gt;":
                        return ">";
                    case "&apos;":
                        return "'";
                    case "&quot;":
                        return "\"";
                    default:
                        if (entity.charAt(1) === "#" && entity.charAt(entity.length - 1) === ";") {
                            if (entity.charAt(2) === "x") {
                                return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
                            } else {
                                return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
                            }
                        } else {
                            throw new Error("Invalid XML entity: " + entity);
                        }
                }
            };

            if (typeof(text) !== "undefined" && text !== null && text !== "") {
                if (makeEntityRefs) {
                    text = text.replace(this.xmlSpecialCharRegEx, escape);
                } else {
                    text = text.replace(this.entityRefRegEx, unescape);
                }
            }

            return text;
        },

        /**
         * @private
         * Utility method to pad the number with a leading 0 for single digits
         * @param (Number) num
         *     the number to pad
         */
        pad : function (num) {
            if (num < 10) {
                return "0" + num;
            }

            return String(num);
        },
        
        /**
         * Pad with zeros based on a padWidth.
         *
         * @param num
         * @param padWidth
         * @returns {String} with padded zeros (based on padWidth)
         */
        padWithWidth : function (num, padWidth) {
            var value, index, result;
            
            result = "";
            for(index=padWidth;index>1;index--)
            {
                value = Math.pow(10, index-1);
                
                if (num < value) {
                   result = result + "0";
                }
            }
            result = result + num;
            
            return String(result);
        },
        
        /**
         * Converts a date to an ISO date string.
         *
         * @param aDate
         * @returns {String} in ISO date format
         *
         * Note: Some browsers don't support this method (e.g. IE8).
         */
        convertDateToISODateString : function (aDate) {
             var result;
             
             result =  aDate.getUTCFullYear() + "-" + this.padWithWidth(aDate.getUTCMonth()+1, 2) + "-" + this.padWithWidth(aDate.getUTCDate(), 2) + "T" + this.padWithWidth(aDate.getUTCHours(), 2) + ":" + this.padWithWidth(aDate.getUTCMinutes(), 2) + ":" + this.padWithWidth(aDate.getUTCSeconds(), 2)+ "." + this.padWithWidth(aDate.getUTCMilliseconds(), 3) + "Z";
             return result;
        },
        
       /**
        * Get the date in ISO date format. 
        * 
        * @param aDate is the date
        * @returns {String} date in ISO format
        *
        * Note: see convertDateToISODateString() above.
        */
        dateToISOString : function (aDate) {
             var result;
             
             try {
                result = aDate.toISOString();
             } catch (e) {
                result = this.convertDateToISODateString(aDate);
             }
             return result;
        },
        
        /**
         * Parse string (which is formated as ISO8601 date) into Javascript Date object.
         *
         * @param s ISO8601 string
         * @return {Date}
         * Note: Some browsers don't support Date constructor which take ISO8601 date (e.g. IE 8).
         */
        parseDateStringISO8601 : function (s) {
             var i, re = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:.(\d+))?(Z|[+\-]\d{2})(?::(\d{2}))?/,
             d = s.match(re);
             if( !d ) {
                return null;
             }
             for( i in d ) {
                d[i] = ~~d[i];
             }
             return new Date(Date.UTC(d[1], d[2] - 1, d[3], d[4], d[5], d[6], d[7]) + (d[8] * 60 + d[9]) * 60000);
        },
        
        /**
         * Utility method to render a timestamp value (in seconds) into HH:MM:SS format.
         * @param {Number} time
         *     The timestamp in ms to render
         * @returns {String}
         * Time string in HH:MM:SS format.
         */
        getDisplayTime : function (time) {
            var hour, min, sec, timeStr = "00:00:00";

            if (time && time !== "-1") {
                // calculate hours, minutes, and seconds
                hour = this.pad(Math.floor(time / 3600));
                min = this.pad(Math.floor((time % 3600) / 60));
                sec = this.pad(Math.floor((time % 3600) % 60));
                // construct HH:MM:SS time string
                timeStr = hour + ":" + min + ":" + sec;
            }

            return timeStr;
        },

        /**
         * Checks if the string is null. If it is, return empty string; else return
         * the string itself.
         * 
         * @param  {String} str 
         * The string to check
         * @return {String}     
         * Empty string or string itself
         */
        convertNullToEmptyString : function (str) {
            return str || "";
        },

        /**
         * Utility method to render a timestamp string (of format
         * YYYY-MM-DDTHH:MM:SSZ) into a duration of HH:MM:SS format.
         * 
         * @param {String} timestamp
         *           The timestamp to render
         * @param {Date} [now]
         *            Optional argument to provide the time from which to
         *            calculate the duration instead of using the current time
         * @returns {String}
         * Duration string in HH:MM:SS format.
         */
        convertTsToDuration : function (timestamp, now) {
            return this.convertTsToDurationWithFormat(timestamp, false, now); 
        },
        
        /**
         * Utility method to render a timestamp string (of format
         * YYYY-MM-DDTHH:MM:SSZ) into a duration of HH:MM:SS format,
         * with optional -1 for null or negative times.
         * 
         * @param {String} timestamp
         *             The timestamp to render
         * @param {Boolean} forFormat
         *            If True, if duration is null or negative, return -1 so that the duration can be formated
         *            as needed in the Gadget. 
         * @param {Date} [now]
         *             Optional argument to provide the time from which to
         *            calculate the duration instead of using the current time
         * @returns {String}
         * Duration string in HH:MM:SS format.
         */
        convertTsToDurationWithFormat : function (timestamp, forFormat, now) {
            var startTimeInMs, nowInMs, durationInSec = "-1";
            
            // Calculate duration
            if (timestamp && typeof timestamp === "string") {
                // first check it '--' for a msg in grid
                if (timestamp === '--' || timestamp ==="" || timestamp === "-1") {
                    return "-1";
                }
                // else try convert string into a time
                startTimeInMs = Date.parse(timestamp);
                if (!isNaN(startTimeInMs)) {
                    if (!now || !(now instanceof Date)) {
                        nowInMs = this.currentServerTimeMillis();
                    } else {
                        nowInMs = this.convertToServerTimeMillis(now.getTime());
                    }
                    durationInSec = Math.floor((nowInMs - startTimeInMs) / 1000);
                    // Since currentServerTime is not exact (lag between sending and receiving
                    // messages will differ slightly), treat a slightly negative (less than 1 sec) 
                    // value as 0, to avoid "--" showing up when a state first changes.
                    if (durationInSec === -1) {
                        durationInSec = 0;
                    }
                    
                    if (durationInSec < 0) {
                        if (forFormat) {
                            return "-1";
                        } else {
                            return this.getDisplayTime("-1");
                        }
                    }
                }
            }else {
                if(forFormat){
                    return "-1";
                }
            }
            return this.getDisplayTime(durationInSec);
         },
         
        /**
         * Takes a string (typically from window.location) and finds the value which corresponds to a name. For
         * example: http://www.company.com/?param1=value1&param2=value2
         *
         * @param str is the string to search
         * @param name is the name to search for
         */
        getParameterByName : function(str, name) {
            var regex, results;
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
            results = regex.exec(str);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }, 
        
        /**
         * @private
         * Gets the user Authorization String from the window session.
         * @returns the Authorization String
         * 
         */
        getUserAuthString: function () {
            var authString = window.sessionStorage.getItem('userFinesseAuth');
            return authString;
        },
        
        /**
         * @private
         * Adds a new cookie to the page with a default domain.
         * @param {String} key
         *      the key to assign a value to
         * @param {String} value
         *      the value to assign to the key
         * @param {Number} days
         *      number of days (from current) until the cookie should expire
         */
        addCookie : function (key, value, days) {
            var date, expires = "",
                cookie = key + "=" + escape(value);
            if (typeof days === "number") {
                date = new Date();
                date.setTime(date.getTime() + (days * 24 * 3600 * 1000));
                cookie += "; expires=" + date.toGMTString();
            }
            document.cookie = cookie + "; path=/";
        },

        /**
         * @private
         * Get the value of a cookie given a key.
         * @param {String} key
         *      a key to lookup
         * @returns {String}
         *      the value mapped to a key, null if key doesn't exist
         */
        getCookie : function (key) {
            var i, pairs, pair;
            if (document.cookie) {
                pairs = document.cookie.split(";");
                for (i = 0; i < pairs.length; i += 1) {
                    pair = this.trim(pairs[i]).split("=");
                    if (pair[0] === key) {
                        return unescape(pair[1]);
                    }
                }
            }
            return null;
        },

        /**
         * @private
         * Deletes the cookie mapped to specified key.
         * @param {String} key
         *      the key to delete
         */
        deleteCookie : function (key) {
            this.addCookie(key, "", -1);
        },

        /**
         * @private
         * Case insensitive sort for use with arrays or Dojox stores
         * @param {String} a
         *      first value
         * @param {String} b
         *      second value
         */
        caseInsensitiveSort: function (a, b) {
            var ret = 0, emptyString = "";
            a = a + emptyString;
            b = b + emptyString;
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a > b) {
                ret = 1;
            }
            if (a < b) { 
                ret = -1;
            }
            return ret;
        },

        /**
         * @private
        * Calls the specified function to render the dojo wijit for a gadget  when the gadget first becomes visible.
        *
        * The displayWjitFunc function will be called once and only once when the div for our wijit 
        * becomes visible for the first time.  This is necessary because some dojo wijits such as the grid
        * throw exceptions and do not render properly if they are created in a display:none div.
        * If our gadget is visisble the function will be called immediately.
        * If our gadget is not yet visisble, then it sets a timer and waits for it to become visible.
        * NOTE:  The timer may seem inefficent, originally I tried connecting to the tab onclick handler, but
        * there is a problem with dojo.connnect to an iframe's parent node in Internet Explorer. 
        * In Firefox the click handler works OK, but it happens before the node is actually visisble, so you
        * end up waiting for the node to become visisble anyway.
        * @displayWjitFunc:  A function to be called once our gadget has become visisble for th first time.
        */  
        onGadgetFirstVisible: function (displayWjitFunc) {
            var i, q, frameId, gadgetNbr, gadgetTitleId, panelId, panelNode, link, iterval, once = false, active = false, tabId = "#finesse-tab-selector";
            try {
                frameId = dojo.attr(window.frameElement, "id"); // Figure out what gadget number we are by looking at our frameset
                gadgetNbr = frameId.match(/\d+$/)[0];  // Strip the number off the end of the frame Id, that's our gadget number
                gadgetTitleId = "#finesse_gadget_" + gadgetNbr + "_title";  // Create a a gadget title id from the number
                
                // Loop through all of the tab panels to find one that has our gadget id
                dojo.query('.tab-panel', window.parent.document).some(function (node, index, arr) {
                    q = dojo.query(gadgetTitleId, node);  // Look in this panel for our gadget id
                    if (q.length > 0) {  // You found it
                        panelNode = node;
                        panelId = dojo.attr(panelNode, "id");  // Get panel id  e.g. panel_Workgroups
                        active = dojo.hasClass(panelNode, "active");
                        tabId = "#tab_" + panelId.slice(6);  // Turn it into a tab id e.g.tab_Workgroups
                        return;
                    }
                });
                // If panel is already active - execute the function - we're done
                if (active) {
                    //?console.log(frameId + " is visible display it");
                    setTimeout(displayWjitFunc);
                } 
                // If its not visible - wait for the active class to show up.
                else {
                    //?console.log(frameId  + " (" + tabId + ") is NOT active wait for it");
                    iterval = setInterval(dojo.hitch(this, function () {
                        if (dojo.hasClass(panelNode, "active")) {
                            //?console.log(frameId  + " (" + tabId + ") is visible display it");
                            clearInterval(iterval);
                            setTimeout(displayWjitFunc);
                        } 
                    }), 250);
                }
            } catch (err) {
                //?console.log("Could not figure out what tab " + frameId + " is in: " + err);
            }
        },

        /**
         * @private
         * Downloads the specified url using a hidden iframe. In order to cause the browser to download rather than render
         * in the hidden iframe, the server code must append the header "Content-Disposition" with a value of 
         * "attachment; filename=\"<WhateverFileNameYouWant>\"".
         */
        downloadFile : function (url) {
            var iframe = document.getElementById("download_iframe");

            if (!iframe)
            {
                iframe = document.createElement("iframe");
                $(document.body).append(iframe);
                $(iframe).css("display", "none");
            }

            iframe.src = url;
        },

        /**
         * @private
         * bitMask has functions for testing whether bit flags specified by integers are set in the supplied value
         */
        bitMask: {
            /** @private */
            isSet: function (value, mask) {
                return (value & mask) === mask;
            },
            /**
             * Returns true if all flags in the intArray are set on the specified value
             * @private 
             */
            all: function (value, intArray) {
                var i = intArray.length;
                if (typeof(i) === "undefined")
                {
                    intArray = [intArray];
                    i = 1;
                }
                while ((i = i - 1) !== -1)
                {
                    if (!this.isSet(value, intArray[i]))
                    {
                        return false;
                    }
                }
                return true;
            },
            /**
             * @private
             * Returns true if any flags in the intArray are set on the specified value
             */
            any: function (value, intArray) {
                var i = intArray.length;
                if (typeof(i) === "undefined")
                {
                    intArray = [intArray];
                    i = 1;
                }
                while ((i = i - 1) !== -1)
                {
                    if (this.isSet(value, intArray[i]))
                    {
                        return true;
                    }
                }
                return false;
            }
        },

        /** @private */
        renderDojoGridOffScreen: function (grid) {
            var offscreenDiv = $("<div style='position: absolute; left: -5001px; width: 5000px;'></div>")[0];
            $(document.body).append(offscreenDiv);
            grid.placeAt(offscreenDiv);
            grid.startup();
            document.body.removeChild(offscreenDiv);
            return grid;
        },

        /** @private */
        initializeSearchInput: function(searchInput, changeCallback, callbackDelay, callbackScope, placeholderText) {
            var timerId = null,
                theControl = typeof(searchInput) === "string" ? $("#" + searchInput) : $(searchInput),
                theInputControl = theControl.find("input"),
                theClearButton = theControl.find("a"),
                inputControlWidthWithClear = 204,
                inputControlWidthNoClear = 230,
                sPreviousInput = theInputControl.val(),
                /** @private **/
                toggleClearButton = function(){
                    if (theInputControl.val() === "") {
                        theClearButton.hide();
                        theControl.removeClass("input-append");
                        theInputControl.width(inputControlWidthNoClear);
                    } else {
                        theInputControl.width(inputControlWidthWithClear);
                        theClearButton.show();
                        theControl.addClass("input-append");
                    }
                };

            // set placeholder text
            theInputControl.attr('placeholder', placeholderText);

            theInputControl.unbind('keyup').bind('keyup', function() {
                if (sPreviousInput !== theInputControl.val()) {
                    window.clearTimeout(timerId);
                    sPreviousInput = theInputControl.val();
                    timerId = window.setTimeout(function() {
                        changeCallback.call((callbackScope || window), theInputControl.val());
                        theInputControl[0].focus();
                    }, callbackDelay);
                }

                toggleClearButton();
            });

            theClearButton.bind('click', function() {
                theInputControl.val('');
                changeCallback.call((callbackScope || window), '');

                toggleClearButton();
                theInputControl[0].focus(); // jquery and dojo on the same page break jquery's focus() method
            });

            theInputControl.val("");
            toggleClearButton();
        },

        DataTables: {
            /** @private */
            createDataTable: function (options, dataTableOptions) {
                var grid,
                    table = $('<table cellpadding="0" cellspacing="0" border="0" class="finesse"><thead><tr></tr></thead></table>'),
                    headerRow = table.find("tr"),
                    defaultOptions = {
                        "aaData": [],
                        "bPaginate": false,
                        "bLengthChange": false,
                        "bFilter": false,
                        "bInfo": false,
                        "sScrollY": "176",
                        "oLanguage": {
                            "sEmptyTable": "",
                            "sZeroRecords": ""
                        }
                    },
                    gridOptions = $.extend({}, defaultOptions, dataTableOptions),
                    columnDefs = [],
                    columnFormatter;

                // Create a header cell for each column, and set up the datatable definition for the column
                $(options.columns).each(function (index, column) {
                    headerRow.append($("<th></th>"));
                    columnDefs[index] = {
                        "mData": column.propertyName,
                        "sTitle": column.columnHeader,
                        "sWidth": column.width,
                        "aTargets": [index],
                        "bSortable": column.sortable,
                        "bVisible": column.visible,
                        "mRender": column.render
                    };
                    if (typeof(column.renderFunction) === "function")
                    {
                        /** @ignore **/
                        columnDefs[index].mRender = /** @ignore **/ function (value, type, dataObject) { 
                            var returnValue;

                            //Apply column render logic to value before applying extra render function
                            if (typeof(column.render) === "function")
                            {
                                value = column.render.call(value, value, value);
                            }

                            if (typeof(type) === "string")
                            {
                                switch (type)
                                {
                                case "undefined":
                                case "sort":
                                    returnValue = value;
                                    break;
                                case "set":
                                    throw new Error("Unsupported set data in Finesse Grid");
                                case "filter":
                                case "display":
                                case "type":
                                    returnValue = column.renderFunction.call(dataObject, value, dataObject);
                                    break;
                                default:
                                    break;
                                }
                            }
                            else
                            {
                                throw new Error("type param not specified in Finesse DataTable mData");
                            }

                            return  returnValue;
                        };
                    }
                });
                gridOptions.aoColumnDefs = columnDefs;

                // Set the height
                if (typeof(options.bodyHeightPixels) !== "undefined" && options.bodyHeightPixels !== null)
                {
                    gridOptions.sScrollY = options.bodyHeightPixels + "px";
                }

                // Place it into the DOM
                if (typeof(options.container) !== "undefined" && options.container !== null)
                {
                    $(options.container).append(table);
                }

                // Create the DataTable
                table.dataTable(gridOptions);

                return table;
            }
        },
        
        /**
         * @private
         * Sets a dojo button to the specified disable state, removing it from
         * the tab order if disabling, and restoring it to the tab order if enabling.
         * @param {Object} dojoButton Reference to the dijit.form.Button object. This is not the DOM element.
         * @param {bool} disabled
         */
        setDojoButtonDisabledAttribute: function (dojoButton, disabled) {
            var labelNode,
                tabIndex;

            dojoButton.set("disabled", disabled);

            // Remove the tabindex attribute on disabled buttons, store it, 
            // and replace it when it becomes enabled again
            labelNode = $("#" + dojoButton.id + "_label");
            if (disabled)
            {
                labelNode.data("finesse:dojoButton:tabIndex", labelNode.attr("tabindex"));
                labelNode.removeAttr("tabindex");
            }
            else
            {
                tabIndex = labelNode.data("finesse:dojoButton:tabIndex");
                if (typeof(tabIndex) === "string")
                {
                    labelNode.attr("tabindex", Number(tabIndex));
                }
            }
        },

        /**
         * @private
         * Measures the given text using the supplied fontFamily and fontSize
         * @param  {string} text       text to measure
         * @param  {string} fontFamily
         * @param  {string} fontSize
         * @return {number} pixel width
         */
        measureText: function (text, fontFamily, fontSize) {
            var width,
                element = $("<div></div>").text(text).css({
                    "fontSize": fontSize,
                    "fontFamily": fontFamily
                }).addClass("offscreen").appendTo(document.body);

            width = element.width();
            element.remove();

            return width;
        },

        /**
         * Adjusts the gadget height. Shindig's gadgets.window.adjustHeight fails when
         * needing to resize down in IE. This gets around that by calculating the height
         * manually and passing it in.
         * @return {undefined}
         */
        "adjustGadgetHeight": function () {
            var bScrollHeight = $("body").height() + 20;
            gadgets.window.adjustHeight(bScrollHeight);
        },

        /**
        * Private helper method for converting a javascript object to xml, where the values of the elements are
        * appropriately escaped for XML.
        * This is a simple implementation that does not implement cdata or attributes. It is also 'unformatted' in that
        * there is no whitespace between elements.
        * @param object The javascript object to convert to XML.
        * @returns The XML string.
        * @private
        */
        _json2xmlWithEscape: function(object) {
            var that = this,
                xml = "",
                m,
                /** @private **/
                toXmlHelper = function(value, name) {
                var xml = "",
                    i,
                    m;
                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        xml += toXmlHelper(value[i], name);
                    }
                }
                else if (typeof value === "object") {
                    xml += "<" + name + ">";
                    for (m in value) {
                        if (value.hasOwnProperty(m)) {
                           xml += toXmlHelper(value[m], m);
                        }
                    }
                    xml += "</" + name + ">";
                }
                else {
                    // is a leaf node
                    xml += "<" + name + ">" + that.translateHTMLEntities(value.toString(), true) +
                        "</" + name + ">";
                }
                return xml;
            };
            for (m in object) {
                if (object.hasOwnProperty(m)) {
                    xml += toXmlHelper(object[m], m);
                }
            }
            return xml;
        },

        /**
         * Utility to detect the browser version of IE, whether it is IE9 or IE8 or in compatibility mode.
         * If IE is earlier than IE8, version returns undefined.
         * 
         * @return {Object} browser object has the following form:
         * {
         *     isIE: {Boolean},
         *     version: {String}, // 8 for IE8, 9 or IE9, 11 or IE11
         *     isCompatibilityMode: {Boolean}
         * }
         */
        detectIEBrowserVersion: function () {
            var browser = {
                isIE: false,
                isCompatibilityMode: false
            },

            useragent = navigator.userAgent,

            appName = navigator.appName;

            // Check to see if app is IE
            if (appName.indexOf("Microsoft Internet Explorer") !== -1) {
                browser.isIE = true;
                // Check for Trident version
                if (useragent.indexOf("Trident/5.0") !== -1) { // IE9
                    browser.version = "9";
                    if (useragent.indexOf("MSIE 9.0") === -1) {
                        browser.isCompatibilityMode = true;
                    }
                } else if (useragent.indexOf("Trident/4.0") !== -1) { // IE8
                    browser.version = "8";
                    if (useragent.indexOf("MSIE 8.0") === -1) {
                        browser.isCompatibilityMode = true;
                    }
                }
            }
            //IE 11 follows different rules. Non standard.
            else if (appName.indexOf("Netscape") !== -1) {
                if(useragent.match(/Trident.*rv\:11\./) !== -1) {
                    browser.isIE = true;
                    browser.version = "11";
                }
            }
            return browser;            
        },

        /**
         * Use JQuery's implementation of Promises (Deferred) to execute code when 
         * multiple async processes have finished. An example use:
         *
         * var asyncProcess1 = $.Deferred(),
         *     asyncProcess2 = $.Deferred();
         *     
         * finesse.utilities.Utilities.whenAllDone(asyncProcess1, asyncProcess2) // WHEN both asyncProcess1 and asyncProcess2 are resolved or rejected ...
         *     .then(
         *         // First function passed to then() is called when all async processes are complete, regardless of errors
         *         function () {
         *             console.log("all processes completed");
         *         },
         *         // Second function passed to then() is called if any async processed threw an exception
         *         function (failures) { // Array of failure messages
         *             console.log("Number of failed async processes: " + failures.length);
         *         });
         *
         * Found at:
         * http://stackoverflow.com/a/15094263/1244030
         *
         * Pass in any number of $.Deferred instances.
         * @returns {Object}
         */
        whenAllDone: function () {
            var deferreds = [],
                result = $.Deferred();

            $.each(arguments, function(i, current) {
                var currentDeferred = $.Deferred();
                current.then(function() {
                    currentDeferred.resolve(false, arguments);
                }, function() {
                    currentDeferred.resolve(true, arguments);
                });
                deferreds.push(currentDeferred);
            });

            $.when.apply($, deferreds).then(function() {
                var failures = [],
                    successes = [];

                $.each(arguments, function(i, args) {
                    // If we resolved with `true` as the first parameter
                    // we have a failure, a success otherwise
                    var target = args[0] ? failures : successes,
                        data = args[1];
                    // Push either all arguments or the only one
                    target.push(data.length === 1 ? data[0] : args);
                });

                if(failures.length) {
                    return result.reject.apply(result, failures);
                }

                return result.resolve.apply(result, successes);
            });

            return result;
        }
    };    
    
    return Utilities;
}));

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global finesse*/

/**
 * Initiated by the Master to create a shared BOSH connection.
 *
 * @requires Utilities
 */

/**
 * @class
 * Establishes a shared event connection by creating a communication tunnel
 * with the notification server and consume events which could be published.
 * Public functions are exposed to register to the connection status information
 * and events.
 * @constructor
 * @param {String} host
 *     The host name/ip of the Finesse server.
 * @throws {Error} If required constructor parameter is missing.
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('clientservices/MasterTunnel',["utilities/Utilities"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.utilities.Utilities);
    }
    
}(function (Utilities) {
     var MasterTunnel = function (host, scheme) { 
        if (typeof host !== "string" || host.length === 0) {
            throw new Error("Required host parameter missing.");
        }

        var

        /**
         * Flag to indicate whether the tunnel frame is loaded.
         * @private
         */
        _isTunnelLoaded = false,

        /**
         * Short reference to the Finesse utility.
         * @private
         */
        _util = Utilities,

        /**
         * The URL with host and port to the Finesse server.
         * @private
         */
        _tunnelOrigin,

        /**
         * Location of the tunnel HTML URL.
         * @private
         */
        _tunnelURL,
        
        /**
         * The port on which to connect to the Finesse server to load the eventing resources.
         * @private
         */
        _tunnelOriginPort,
        
        /**
         * Flag to indicate whether we have processed the tunnel config yet.
         * @private
         */
        _isTunnelConfigInit = false,

        /**
         * The tunnel frame window object.
         * @private
         */
        _tunnelFrame,

        /**
         * The handler registered with the object to be invoked when an event is
         * delivered by the notification server.
         * @private
         */
        _eventHandler,
        
        /**
         * The handler registered with the object to be invoked when presence is
         * delivered by the notification server.
         * @private
         */
        _presenceHandler,

        /**
         * The handler registered with the object to be invoked when the BOSH
         * connection has changed states. The object will contain the "status"
         * property and a "resourceID" property only if "status" is "connected".
         * @private
         */
        _connInfoHandler,

        /**
         * The last connection status published by the JabberWerx library.
         * @private
         */
        _statusCache,

        /**
         * The last event sent by notification server.
         * @private
         */
        _eventCache,

        /**
         * The ID of the user logged into notification server.
         * @private
         */
        _id,

        /**
         * The domain of the XMPP server, representing the portion of the JID
         * following '@': userid@domain.com
         * @private
         */
        _xmppDomain,

        /**
         * The password of the user logged into notification server.
         * @private
         */
        _password,

        /**
         * The jid of the pubsub service on the XMPP server
         * @private
         */
        _pubsubDomain,

        /**
         * The resource to use for the BOSH connection.
         * @private
         */
        _resource,

        /**
         * The resource ID identifying the client device (that we receive from the server).
         * @private
         */
        _resourceID,

        /**
         * The different types of messages that could be sent to the parent frame.
         * The types here should be understood by the parent frame and used to
         * identify how the message is formatted.
         * @private
         */
        _TYPES = {
            EVENT: 0,
            ID: 1,
            PASSWORD: 2,
            RESOURCEID: 3,
            STATUS: 4,
            XMPPDOMAIN: 5,
            PUBSUBDOMAIN: 6,
            SUBSCRIBE: 7,
            UNSUBSCRIBE: 8,
            PRESENCE: 9,
            CONNECT_REQ: 10
        },

        _handlers = {
            subscribe: {},
            unsubscribe: {}
        },
        

        /**
         * Create a connection info object.
         * @returns {Object}
         *     A connection info object containing a "status" and "resourceID".
         * @private
         */
        _createConnInfoObj = function () {
            return {
                status: _statusCache,
                resourceID: _resourceID
            };
        },

        /**
         * Utility function which sends a message to the dynamic tunnel frame
         * event frame formatted as follows: "type|message".
         * @param {Number} type
         *     The category type of the message.
         * @param {String} message
         *     The message to be sent to the tunnel frame.
         * @private
         */
        _sendMessage = function (type, message) {
            message = type + "|" + message;
            _util.sendMessage(message, _tunnelFrame, _tunnelOrigin);
        },

        /**
         * Utility to process the response of a subscribe request from
         * the tunnel frame, then invoking the stored callback handler
         * with the respective data (error, when applicable)
         * @param {String} data
         *     The response in the format of "node[|error]"
         * @private
         */
        _processSubscribeResponse = function (data) {
            var dataArray = data.split("|"),
            node = dataArray[0],
            err;
            
            //Error is optionally the second item in the array
            if (dataArray.length) {
                err = dataArray[1];
            }
            
            // These response handlers are short lived and should be removed and cleaned up immediately after invocation.
            if (_handlers.subscribe[node]) {
                _handlers.subscribe[node](err);
                delete _handlers.subscribe[node];
            }
        },

        /**
         * Utility to process the response of an unsubscribe request from
         * the tunnel frame, then invoking the stored callback handler
         * with the respective data (error, when applicable)
         * @param {String} data
         *     The response in the format of "node[|error]"
         * @private
         */
        _processUnsubscribeResponse = function (data) {
            var dataArray = data.split("|"),
            node = dataArray[0],
            err;
            
            //Error is optionally the second item in the array
            if (dataArray.length) {
                err = dataArray[1];
            }
            
            // These response handlers are short lived and should be removed and cleaned up immediately after invocation.
            if (_handlers.unsubscribe[node]) {
                _handlers.unsubscribe[node](err);
                delete _handlers.unsubscribe[node];
            }
        },

        /**
         * Handler for messages delivered by window.postMessage. Listens for events
         * published by the notification server, connection status published by
         * the JabberWerx library, and the resource ID created when the BOSH
         * connection has been established.
         * @param {Object} e
         *     The message object as provided by the window.postMessage feature.
         * @private
         */
        _messageHandler = function (e) {
            var

            //Extract the message type and message data. The expected format is
            //"type|data" where type is a number represented by the TYPES object.
            delimPos = e.data.indexOf("|"),
            type = Number(e.data.substr(0, delimPos)),
            data =  e.data.substr(delimPos + 1);
            
            //Accepts messages and invoke the correct registered handlers.
            switch (type) {
            case _TYPES.EVENT:
                _eventCache = data;
                if (typeof _eventHandler === "function") {
                    _eventHandler(data);
                }
                break;
            case _TYPES.STATUS:
                _statusCache = data;

                //A "loaded" status means that the frame is ready to accept
                //credentials for establishing a BOSH connection.
                if (data === "loaded") {
                    _isTunnelLoaded = true;
                    if(_resource) {
                        _sendMessage(_TYPES.RESOURCEID, _resource);
                    }
                    _sendMessage(_TYPES.ID, _id);
                    _sendMessage(_TYPES.XMPPDOMAIN, _xmppDomain);
                    _sendMessage(_TYPES.PASSWORD, _password);
                    _sendMessage(_TYPES.PUBSUBDOMAIN, _pubsubDomain);
                } else if (typeof _connInfoHandler === "function") {
                    _connInfoHandler(_createConnInfoObj());
                }
                break;
            case _TYPES.RESOURCEID:
                _resourceID = data;
                break;
            case _TYPES.SUBSCRIBE:
                _processSubscribeResponse(data);
                break;
            case _TYPES.UNSUBSCRIBE:
                _processUnsubscribeResponse(data);
                break;
            case _TYPES.PRESENCE:
                if (typeof _presenceHandler === "function") {
                    _presenceHandler(data);
                }
                break;
            default:
                break;
            }
        },

        /**
         * Initialize the tunnel config so that the url can be http or https with the appropriate port
         * @private
         */
        _initTunnelConfig = function () {
            if (_isTunnelConfigInit === true) {
                return;
            }
            
            //Initialize tunnel origin
            //Determine tunnel origin based on host and scheme
            _tunnelOriginPort = (scheme && scheme.indexOf("https") !== -1) ? "7443" : "7071";
            if (scheme) {
                _tunnelOrigin = scheme + "://" + host + ":" + _tunnelOriginPort;
            } else {
                _tunnelOrigin = "http://" + host + ":" + _tunnelOriginPort;
            }
            _tunnelURL = _tunnelOrigin + "/tunnel/";
            
            _isTunnelConfigInit = true;
        },

        /**
         * Create the tunnel iframe which establishes the shared BOSH connection.
         * Messages are sent across frames using window.postMessage.
         * @private
         */
        _createTunnel = function () {
            var tunnelID = ((self === parent) ? "tunnel-frame" : "autopilot-tunnel-frame"),
            iframe = document.createElement("iframe");         
            iframe.style.display = "none";
            iframe.setAttribute("id", tunnelID);
            iframe.setAttribute("name", tunnelID);
            iframe.setAttribute("src", _tunnelURL);
            document.body.appendChild(iframe);
            _tunnelFrame = window.frames[tunnelID];
        };

        /**
         * Sends a message via postmessage to the EventTunnel to attempt to connect to the XMPP server
         * @private
         */
        this.makeConnectReq = function () {
            _sendMessage(_TYPES.PASSWORD, _password);
        };
        
        /**
         * @private
         * Returns the host of the Finesse server.
         * @returns {String}
         *     The host specified during the creation of the object.
         */
        this.getHost = function () {
            return host;
        };

        /**
         * @private
         * The resource ID of the user who is logged into the notification server.
         * @returns {String}
         *     The resource ID generated by the notification server.
         */
        this.getResourceID = function () {
            return _resourceID;
        };

        /**
         * @private
         * Indicates whether the tunnel frame is loaded.
         * @returns {Boolean}
         *     True if the tunnel frame is loaded, false otherwise.
         */
        this.isTunnelLoaded = function () {
            return _isTunnelLoaded;
        };

        /**
         * @private
         * The location of the tunnel HTML URL.
         * @returns {String}
         *     The location of the tunnel HTML URL.
         */
        this.getTunnelURL = function () {
            return _tunnelURL;
        };

        /**
         * @private
         * Tunnels a subscribe request to the eventing iframe.
         * @param {String} node
         *     The node to subscribe to
         * @param {Function} handler
         *     Handler to invoke upon success or failure
         */
        this.subscribe = function (node, handler) {
            if (handler && typeof handler !== "function") {
                throw new Error("Parameter is not a function.");
            }
            _handlers.subscribe[node] = handler;
            _sendMessage(_TYPES.SUBSCRIBE, node);
        };

        /**
         * @private
         * Tunnels an unsubscribe request to the eventing iframe.
         * @param {String} node
         *     The node to unsubscribe from
         * @param {Function} handler
         *     Handler to invoke upon success or failure
         */
        this.unsubscribe = function (node, handler) {
            if (handler && typeof handler !== "function") {
                throw new Error("Parameter is not a function.");
            }
            _handlers.unsubscribe[node] = handler;
            _sendMessage(_TYPES.UNSUBSCRIBE, node);
        };

        /**
         * @private
         * Registers a handler to be invoked when an event is delivered. Only one
         * is registered at a time. If there has already been an event that was
         * delivered, the handler will be invoked immediately.
         * @param {Function} handler
         *     Invoked when an event is delivered through the event connection.
         */
        this.registerEventHandler = function (handler) {
            if (typeof handler !== "function") {
                throw new Error("Parameter is not a function.");
            }
            _eventHandler = handler;
            if (_eventCache) {
                handler(_eventCache);
            }
        };

        /**
         * @private
         * Unregisters the event handler completely.
         */
        this.unregisterEventHandler = function () {
            _eventHandler = undefined;
        };
        
        /**
         * @private
         * Registers a handler to be invoked when a presence event is delivered. Only one
         * is registered at a time. 
         * @param {Function} handler
         *     Invoked when a presence event is delivered through the event connection.
         */
        this.registerPresenceHandler = function (handler) {
            if (typeof handler !== "function") {
                throw new Error("Parameter is not a function.");
            }
            _presenceHandler = handler;
        };
        
        /**
         * @private
         * Unregisters the presence event handler completely.
         */
        this.unregisterPresenceHandler = function () {
            _presenceHandler = undefined;
        };

        /**
         * @private
         * Registers a handler to be invoked when a connection status changes. The
         * object passed will contain a "status" property, and a "resourceID"
         * property, which will contain the most current resource ID assigned to
         * the client. If there has already been an event that was delivered, the
         * handler will be invoked immediately.
         * @param {Function} handler
         *     Invoked when a connection status changes.
         */
        this.registerConnectionInfoHandler = function (handler) {
            if (typeof handler !== "function") {
                throw new Error("Parameter is not a function.");
            }
            _connInfoHandler = handler;
            if (_statusCache) {
                handler(_createConnInfoObj());
            }
        };

        /**
         * @private
         * Unregisters the connection information handler.
         */
        this.unregisterConnectionInfoHandler = function () {
            _connInfoHandler = undefined;
        };

        /**
         * @private
         * Start listening for events and create a event tunnel for the shared BOSH
         * connection.
         * @param {String} id
         *     The ID of the user for the notification server.
         * @param {String} password
         *     The password of the user for the notification server.
         * @param {String} xmppDomain
         *     The XMPP domain of the notification server
         * @param {String} pubsubDomain
         *     The location (JID) of the XEP-0060 PubSub service
         * @param {String} resource
         *     The resource to connect to the notification servier with.
         */
        this.init = function (id, password, xmppDomain, pubsubDomain, resource) {
            
            if (typeof id !== "string" || typeof password !== "string" || typeof xmppDomain !== "string" || typeof pubsubDomain !== "string") {
                throw new Error("Invalid or missing required parameters.");
            }

            _initTunnelConfig();
            
            _id = id;
            _password = password;
            _xmppDomain = xmppDomain;
            _pubsubDomain = pubsubDomain;
            _resource = resource;

            //Attach a listener for messages sent from tunnel frame.
            _util.receiveMessage(_messageHandler, _tunnelOrigin);

            //Create the tunnel iframe which will establish the shared connection.
            _createTunnel();
        };

        //BEGIN TEST CODE//
//        /**
//         * Test code added to expose private functions that are used by unit test
//         * framework. This section of code is removed during the build process
//         * before packaging production code. The [begin|end]TestSection are used
//         * by the build to identify the section to strip.
//         * @ignore
//         */
//        this.beginTestSection = 0;
//
//        /**
//         * @ignore
//         */
//        this.getTestObject = function () {
//            //Load mock dependencies.
//            var _mock = new MockControl();
//            _util = _mock.createMock(finesse.utilities.Utilities);
//
//            return {
//                //Expose mock dependencies
//                mock: _mock,
//                util: _util,
//
//                //Expose internal private functions
//                types: _TYPES,
//                createConnInfoObj: _createConnInfoObj,
//                sendMessage: _sendMessage,
//                messageHandler: _messageHandler,
//                createTunnel: _createTunnel,
//                handlers: _handlers,
//                initTunnelConfig : _initTunnelConfig
//            };
//        };
//
//        /**
//         * @ignore
//         */
//        this.endTestSection = 0;
//        //END TEST CODE//
    };
    
    /** @namespace JavaScript class objects and methods to handle the subscription to Finesse events.*/
    finesse.clientservices = finesse.clientservices || {};

    window.finesse = window.finesse || {};
    window.finesse.clientservices = window.finesse.clientservices || {};
    window.finesse.clientservices.MasterTunnel = MasterTunnel;

}));

/**
 * Contains a list of topics used for client side pubsub.
 *
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('clientservices/Topics',[], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    }
    
}(function () {
    
   var Topics = (function () {

        /**
         * @private
         * The namespace prepended to all Finesse topics.
         */
        this.namespace = "finesse.info";
    
        /**
         * @private
         * Gets the full topic name with the Finesse namespace prepended.
         * @param {String} topic
         *     The topic category.
         * @returns {String}
         *     The full topic name with prepended namespace.
         */
        var _getNSTopic = function (topic) {
            return this.namespace + "." + topic;
        };
        
        /** @scope finesse.clientservices.Topics */
        return {
            /** 
             * @private
             * Client side request channel. 
             */
            REQUESTS: _getNSTopic("requests"),
    
            /** 
             * @private
             * Client side response channel. 
             */
            RESPONSES: _getNSTopic("responses"),

            /** 
             * @private
             * Connection status. 
             */
            EVENTS_CONNECTION_INFO: _getNSTopic("connection"),
            
            /** 
             * @private
             * Presence channel 
             */
            PRESENCE: _getNSTopic("presence"),
    
            /**
             * @private
             * Convert a Finesse REST URI to a OpenAjax compatible topic name.
             */
            getTopic: function (restUri) {
                //The topic should not start with '/' else it will get replaced with
                //'.' which is invalid.
                //Thus, remove '/' if it is at the beginning of the string
                if (restUri.indexOf('/') === 0) {
                    restUri = restUri.substr(1);
                }
    
                //Replace every instance of "/" with ".". This is done to follow the
                //OpenAjaxHub topic name convention.
                return restUri.replace(/\//g, ".");
            }
        };
    }());
    window.finesse = window.finesse || {};
    window.finesse.clientservices = window.finesse.clientservices || {};
    /** @private */
    window.finesse.clientservices.Topics = Topics;
    
    return Topics;
}));

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global finesse*/

/**
 * Registers with the MasterTunnel to receive events, which it
 *     could publish to the OpenAjax gadget pubsub infrastructure.
 *
 * @requires OpenAjax, finesse.clientservices.MasterTunnel, finesse.clientservices.Topics
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('clientservices/MasterPublisher',["clientservices/MasterTunnel",
                "clientservices/Topics",
                "utilities/Utilities"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.clientservices.MasterTunnel, finesse.clientservices.Topics, finesse.utilities.Utilities);
    }
    
}(function (MasterTunnel, Topics, Utilities) {
    
     var MasterPublisher = function (tunnel, hub) {
        if (!(tunnel instanceof MasterTunnel)) {
            throw new Error("Required tunnel object missing or invalid.");
        }

        var
        
        ClientServices = finesse.clientservices.ClientServices,

        /**
         * Reference to the gadget pubsub Hub instance.
         * @private
         */
        _hub = hub,

        /**
         * Reference to the Topics class.
         * @private
         */
        _topics = Topics,
        
        /**
         * Reference to conversion utilities class.
         * @private
         */
        _utils = Utilities,
        
        /**
         * References to ClientServices logger methods
         * @private
         */
        _logger = {
            log: ClientServices.log
        },
        
        /**
         * Store the passed in tunnel.
         * @private
         */
        _tunnel = tunnel,

        /**
         * Caches the connection info event so that it could be published if there
         * is a request for it.
         * @private
         */
        _connInfoCache = {},

        /**
         * The types of possible request types supported when listening to the
         * requests channel. Each request type could result in different operations.
         * @private
         */
        _REQTYPES = {
            CONNECTIONINFO: "ConnectionInfoReq",
            SUBSCRIBE: "SubscribeNodeReq",
            UNSUBSCRIBE: "UnsubscribeNodeReq",
            CONNECT: "ConnectionReq"
        },

        /**
         * Will store list of nodes that have OF subscriptions created
         *     _nodesList[node][subscribing].reqIds[subid]
         *     _nodesList[node][active].reqIds[subid]
         *     _nodesList[node][unsubscribing].reqIds[subid]
         *     _nodesList[node][holding].reqIds[subid]
         * @private
         */
        _nodesList = {},
        
        /**
         * The states that a subscription can be in
         * @private
         */
        _CHANNELSTATES = {
            UNINITIALIZED: "Uninitialized",
            PENDING: "Pending",
            OPERATIONAL: "Operational"
        },

        /**
          * Checks if the payload is JSON 
          * @returns {Boolean}
          * @private
          */
        _isJsonPayload = function(event) {
            var delimStart, delimEnd, retval = false;
            
            try { 
              delimStart = event.indexOf('{');
              delimEnd = event.lastIndexOf('}');

              if ((delimStart !== -1 ) && (delimEnd === (event.length - 1))) {
                retval = true;  //event contains JSON payload
              }
            } catch (err) {
              _logger.log("MasterPublisher._isJsonPayload() - Caught error: " + err);
            }
            return retval;
        },
        
                /**
          * Parses a JSON event and then publishes.
          *
          * @param {String} event
          *     The full event payload.
          * @throws {Error} If the payload object is malformed.
          * @private
          */
        _parseAndPublishJSONEvent = function(event) {
            var topic, eventObj, publishEvent,
            delimPos = event.indexOf("{"),
            node, parser,
            eventJson = event,
            returnObj = {node: null, data: null};

            try {
               //Extract and strip the node path from the message
               if (delimPos > 0) 
               {
                  //We need to decode the URI encoded node path
                  //TODO: make sure this is kosher with OpenAjax topic naming
                  node = decodeURI(event.substr(0, delimPos));
                  eventJson = event.substr(delimPos);
                  
                  //Converting the node path to openAjaxhub topic
                  topic = _topics.getTopic(node);
                  
                  returnObj.node = node;
                  returnObj.payload = eventJson;
               } 
               else 
               {
                  _logger.log("MasterPublisher._parseAndPublishJSONEvent() - [ERROR] node is not given in postMessage: " + eventJson);
                  throw new Error("node is not given in postMessage: " + eventJson);
               }

               parser = _utils.getJSONParser();

               eventObj = parser.parse(eventJson);
               returnObj.data = eventObj;

            } catch (err) {
               _logger.log("MasterPublisher._parseAndPublishJSONEvent() - [ERROR] Malformed event payload: " + err);
               throw new Error("Malformed event payload : " + err);
            }
            
            _logger.log("MasterPublisher._parseAndPublishJSONEvent() - Received JSON event on node '" + node + "': " + eventJson); 
            
            publishEvent = {content : event, object : eventObj };

            //Publish event to proper event topic.
            if (topic && eventObj) {
               _hub.publish(topic, publishEvent);
            }
        },
        
        /**
          * Parses an XML event and then publishes.
          *
          * @param {String} event
          *     The full event payload.
          * @throws {Error} If the payload object is malformed.
          * @private
          */
        _parseAndPublishXMLEvent = function(event) {
            var topic, eventObj, publishEvent, restTopic,
            delimPos = event.indexOf("<"),
            node,
            eventXml = event;
            
            try {
               //Extract and strip the node path from the message
               if (delimPos > 0) {
                  //We need to decode the URI encoded node path
                  //TODO: make sure this is kosher with OpenAjax topic naming
                  node = decodeURI(event.substr(0, delimPos));
                  eventXml = event.substr(delimPos);
                  //Converting the node path to openAjaxhub topic
                  topic = _topics.getTopic(node);
               } else {
                  _logger.log("MasterPublisher._parseAndPublishXMLEvent() - [ERROR] node is not given in postMessage: " + eventXml);
                  throw new Error("node is not given in postMessage: " + eventXml);
               }

               eventObj = _utils.xml2JsObj(eventXml);
                  
           } catch (err) {
               _logger.log("MasterPublisher._parseAndPublishXMLEvent() - [ERROR] Malformed event payload: " + err);
               throw new Error("Malformed event payload : " + err);
           }
           
           _logger.log("MasterPublisher._parseAndPublishXMLEvent() - Received XML event on node '" + node + "': " + eventXml);
           
           publishEvent = {content : event, object : eventObj };

           //Publish event to proper event topic.
           if (topic && eventObj) {
               _hub.publish(topic, publishEvent);
           }
        },
        
        /**
         * Publishes events to the appropriate topic. The topic name is determined
         * by fetching the source value from the event.
         * @param {String} event
         *     The full event payload.
         * @throws {Error} If the payload object is malformed.
         * @private
         */
        _eventHandler = function (event) {
            
            //Handle JSON or XML events
            if (!_isJsonPayload(event))
            {
               //XML
               _parseAndPublishXMLEvent(event);
            }
            else
            {
               //JSON
               _parseAndPublishJSONEvent(event);
            }
        },
        
        
        /**
         * Handler for when presence events are sent through the MasterTunnel.
         * @returns {Object}
         *     A presence xml event.
         * @private
         */
        _presenceHandler = function (event) {
            var eventObj = _utils.xml2JsObj(event), publishEvent;
            
            publishEvent = {content : event, object : eventObj};
            
            if (eventObj) {
                _hub.publish(_topics.PRESENCE, publishEvent);
            }
        },

        /**
         * Clone the connection info object from cache.
         * @returns {Object}
         *     A connection info object containing a "status" and "resourceID".
         * @private
         */
        _cloneConnInfoObj = function () {
            if (_connInfoCache) {
                return {
                    status: _connInfoCache.status,
                    resourceID: _connInfoCache.resourceID
                };
            } else {
                return null;
            }
        },

        /**
         * Cleans up any outstanding subscribe/unsubscribe requests and notifies them of errors.
         * This is done if we get disconnected because we cleanup explicit subscriptions on disconnect.
         * @private
         */
        _cleanupPendingRequests = function () {
            var node, curSubid, errObj = {
                error: {
                    errorType: "Disconnected",
                    errorMessage: "Outstanding request will never complete."
                }
            };

            // Iterate through all outstanding subscribe requests to notify them that it will never return
            for (node in _nodesList) {
                if (_nodesList.hasOwnProperty(node)) {
                    for (curSubid in _nodesList[node].subscribing.reqIds) {
                        if (_nodesList[node].subscribing.reqIds.hasOwnProperty(curSubid)) {
                            // Notify this outstanding subscribe request to give up and error out
                            _hub.publish(_topics.RESPONSES + "." + curSubid, errObj); 
                        }
                    }
                    for (curSubid in _nodesList[node].unsubscribing.reqIds) {
                        if (_nodesList[node].unsubscribing.reqIds.hasOwnProperty(curSubid)) {
                            // Notify this outstanding unsubscribe request to give up and error out
                            _hub.publish(_topics.RESPONSES + "." + curSubid, errObj); 
                        }
                    }
                }
            }
        },

        /**
         * Publishes the connection info to the connection info topic.
         * @param {Object} connInfo
         *     The connection info object containing the status and resource ID.
         * @private
         */
        _connInfoHandler = function (connInfo) {
            var before = _connInfoCache.status;
            _connInfoCache = connInfo;
            _logger.log("MasterPublisher._connInfoHandler() - Connection status: " + connInfo.status);
            _hub.publish(_topics.EVENTS_CONNECTION_INFO, _cloneConnInfoObj());
            if (before === "connected" && connInfo.status !== "connected") {
                // Fail all pending requests when we transition to disconnected
                _cleanupPendingRequests();
            }
        },

        
        /**
         * Utility method to bookkeep node subscription requests and determine
         * whehter it is necessary to tunnel the request to JabberWerx.
         * @param {String} node
         *     The node of interest
         * @param {String} reqId
         *     A unique string identifying the request/subscription
         * @private
         */
        _subscribeNode = function (node, subid) {
            if (_connInfoCache.status !== "connected") {
                _hub.publish(_topics.RESPONSES + "." + subid, {
                    error: {
                        errorType: "Not connected",
                        errorMessage: "Cannot subscribe without connection."
                    }
                });
                return;
            }
            // NODE DOES NOT YET EXIST
            if (!_nodesList[node]) {
                _nodesList[node] = {
                    "subscribing": {
                        "reqIds": {},
                        "length": 0
                    },
                    "active": {
                        "reqIds": {},
                        "length": 0
                    },
                    "unsubscribing": {
                        "reqIds": {},
                        "length": 0
                    },
                    "holding": {
                        "reqIds": {},
                        "length": 0
                    }
                };
            }
            if (_nodesList[node].active.length === 0) {
                if (_nodesList[node].unsubscribing.length === 0) {
                    if (_nodesList[node].subscribing.length === 0) {
                        _nodesList[node].subscribing.reqIds[subid] = true;
                        _nodesList[node].subscribing.length += 1;

                        _logger.log("MasterPublisher._subscribeNode() - Attempting to subscribe to node '" + node + "'");
                        _tunnel.subscribe(node, function (err) {
                            var errObj, curSubid;
                            if (err) {
                                errObj = {
                                    subscribe: {
                                        content: err
                                    }
                                };

                                try {
                                    errObj.subscribe.object = gadgets.json.parse((_utils.xml2json(jQuery.parseXML(err), "")));
                                } catch (e) {
                                    errObj.error = {
                                        errorType: "parseError",
                                        errorMessage: "Could not serialize XML: " + e
                                    };
                                }
                                _logger.log("MasterPublisher._subscribeNode() - Error subscribing to node '" + node + "': " + err);
                            } else {
                                _logger.log("MasterPublisher._subscribeNode() - Subscribed to node '" + node + "'");
                            }

                            for (curSubid in _nodesList[node].subscribing.reqIds) {
                                if (_nodesList[node].subscribing.reqIds.hasOwnProperty(curSubid)) {
                                    _hub.publish(_topics.RESPONSES + "." + curSubid, errObj);
                                    if (!err) {
                                        _nodesList[node].active.reqIds[curSubid] = true;
                                        _nodesList[node].active.length += 1;
                                    }
                                    delete _nodesList[node].subscribing.reqIds[curSubid];
                                    _nodesList[node].subscribing.length -= 1;
                                }
                            }
                        });
                        
                    } else { //other ids are subscribing
                        _nodesList[node].subscribing.reqIds[subid] = true;
                        _nodesList[node].subscribing.length += 1;
                    }                       
                } else { //An unsubscribe request is pending, hold onto these subscribes until it is done
                    _nodesList[node].holding.reqIds[subid] = true;
                    _nodesList[node].holding.length += 1;
                }
            } else { // The node has active subscriptions; add this subid and return successful response
                _nodesList[node].active.reqIds[subid] = true;
                _nodesList[node].active.length += 1;
                _hub.publish(_topics.RESPONSES + "." + subid, undefined); 
            }
        },

        /**
         * Utility method to bookkeep node unsubscribe requests and determine
         * whehter it is necessary to tunnel the request to JabberWerx.
         * @param {String} node
         *     The node to unsubscribe from
         * @param {String} reqId
         *     A unique string identifying the subscription to remove
         * @private
         */
        _unsubscribeNode = function (node, subid) {
            if (!_nodesList[node]) { //node DNE, publish success response
                _hub.publish(_topics.RESPONSES + "." + subid, undefined); 
            } else {
                if (_connInfoCache.status !== "connected") {
                    _hub.publish(_topics.RESPONSES + "." + subid, {
                        error: {
                            errorType: "Not connected",
                            errorMessage: "Cannot unsubscribe without connection."
                        }
                    });
                    return;
                }
                if (_nodesList[node].active.length > 1) {
                    delete _nodesList[node].active.reqIds[subid];
                    _hub.publish(_topics.RESPONSES + "." + subid, undefined); 
                    _nodesList[node].active.length -= 1;
                } else if (_nodesList[node].active.length === 1) { // transition subid from active category to unsubscribing category
                    _nodesList[node].unsubscribing.reqIds[subid] = true;
                    _nodesList[node].unsubscribing.length += 1;
                    delete _nodesList[node].active.reqIds[subid];
                    _nodesList[node].active.length -= 1;

                    _logger.log("MasterPublisher._unsubscribeNode() - Attempting to unsubscribe from node '" + node + "'");
                    _tunnel.unsubscribe(node, function (err) {
                        var errObj, curSubid;
                        if (err) {
                            errObj = {
                                subscribe: {
                                    content: err
                                }
                            };

                            try {
                                errObj.subscribe.object = gadgets.json.parse((_utils.xml2json(jQuery.parseXML(err), "")));
                            } catch (e) {
                                errObj.error = {
                                    errorType: "parseError",
                                    errorMessage: "Could not serialize XML: " + e
                                };
                            }
                            _logger.log("MasterPublisher._unsubscribeNode() - Error unsubscribing from node '" + node + "': " + err);
                        } else {
                            _logger.log("MasterPublisher._unsubscribeNode() - Unsubscribed from node '" + node + "'");
                        }

                        for (curSubid in _nodesList[node].unsubscribing.reqIds) {
                            if (_nodesList[node].unsubscribing.reqIds.hasOwnProperty(curSubid)) {
                                // publish to all subids whether unsubscribe failed or succeeded
                                _hub.publish(_topics.RESPONSES + "." + curSubid, errObj); 
                                if (!err) {
                                    delete _nodesList[node].unsubscribing.reqIds[curSubid];
                                    _nodesList[node].unsubscribing.length -= 1;
                                } else { // Just remove the subid from unsubscribing; the next subscribe request will operate with node already created
                                    delete _nodesList[node].unsubscribing.reqIds[curSubid];
                                    _nodesList[node].unsubscribing.length -= 1;
                                }   
                            }
                        }
                        
                        if (!err && _nodesList[node].holding.length > 0) { // if any subscribe requests came in while unsubscribing from OF, now transition from holding to subscribing
                            for (curSubid in _nodesList[node].holding.reqIds) {
                                if (_nodesList[node].holding.reqIds.hasOwnProperty(curSubid)) {
                                    delete _nodesList[node].holding.reqIds[curSubid];
                                    _nodesList[node].holding.length -= 1;
                                    _subscribeNode(node, curSubid);                             
                                }
                            }
                        }
                    });
                } else { // length <= 0?
                    _hub.publish(_topics.RESPONSES + "." + subid, undefined);
                }
            }
        },
        
        /**
         * Handles client requests to establish a BOSH connection.
         * @param {String} id
         *     id of the xmpp user
         * @param {String} password
         *     password of the xmpp user
         * @param {String} xmppDomain
         *     xmppDomain of the xmpp user account
         * @private
         */
        _connect = function (id, password, xmppDomain) {
            _tunnel.makeConnectReq(id, password, xmppDomain);
        },

        /**
         * Handles client requests made to the request topic. The type of the
         * request is described in the "type" property within the data payload. Each
         * type can result in a different operation.
         * @param {String} topic
         *     The topic which data was published to.
         * @param {Object} data
         *     The data containing requests information published by clients.
         * @param {String} data.type
         *     The type of the request. Supported: "ConnectionInfoReq"
         * @param {Object} data.data
         *     May contain data relevant for the particular requests.
         * @param {String} [data.invokeID]
         *     The ID used to identify the request with the response. The invoke ID
         *     will be included in the data in the publish to the topic. It is the
         *     responsibility of the client to correlate the published data to the
         *     request made by using the invoke ID.
         * @private
         */
        _clientRequestHandler = function (topic, data) {
            var dataCopy;

            //Ensure a valid data object with "type" and "data" properties.
            if (typeof data === "object" &&
                    typeof data.type === "string" &&
                    typeof data.data === "object") {
                switch (data.type) {
                case _REQTYPES.CONNECTIONINFO:
                    //It is possible that Slave clients come up before the Master
                    //client. If that is the case, the Slaves will need to make a
                    //request for the Master to send the latest connection info to the
                    //connectionInfo topic.
                    dataCopy = _cloneConnInfoObj();
                    if (dataCopy) {
                        if (data.invokeID !== undefined) {
                            dataCopy.invokeID = data.invokeID;
                        }
                        _hub.publish(_topics.EVENTS_CONNECTION_INFO, dataCopy);
                    }
                    break;
                case _REQTYPES.SUBSCRIBE:
                    if (typeof data.data.node === "string") {
                        _subscribeNode(data.data.node, data.invokeID);
                    }
                    break;
                case _REQTYPES.UNSUBSCRIBE:
                    if (typeof data.data.node === "string") {
                        _unsubscribeNode(data.data.node, data.invokeID);
                    }
                    break;
                case _REQTYPES.CONNECT:
                    // Deprecated: Disallow others (non-masters) from administering BOSH connections that are not theirs
                    _logger.log("MasterPublisher._clientRequestHandler(): F403: Access denied. Non-master ClientService instances do not have the clearance level to make this request: makeConnectionReq");
                    break;
                default:
                    break;
                }
            }
        };

        (function () {
            //Register to receive events and connection status from tunnel.
            _tunnel.registerEventHandler(_eventHandler);
            _tunnel.registerPresenceHandler(_presenceHandler);
            _tunnel.registerConnectionInfoHandler(_connInfoHandler);

            //Listen to a request channel to respond to any requests made by other
            //clients because the Master may have access to useful information.
            _hub.subscribe(_topics.REQUESTS, _clientRequestHandler);
        }());

        /**
         * @private
         * Handles client requests to establish a BOSH connection.
         * @param {String} id
         *     id of the xmpp user
         * @param {String} password
         *     password of the xmpp user
         * @param {String} xmppDomain
         *     xmppDomain of the xmpp user account
         */
        this.connect = function (id, password, xmppDomain) {
          _connect(id, password, xmppDomain);
        };

        /**
         * @private
         * Resets the list of explicit subscriptions
         */
        this.wipeout = function () {
            _cleanupPendingRequests();
            _nodesList = {};
       };

        //BEGIN TEST CODE//
       /**
        * Test code added to expose private functions that are used by unit test
        * framework. This section of code is removed during the build process
        * before packaging production code. The [begin|end]TestSection are used
        * by the build to identify the section to strip.
        * @ignore
        */
       this.beginTestSection = 0;

       /**
        * @ignore
        */
       this.getTestObject = function () {
           //Load mock dependencies.
           var _mock = new MockControl();
           _hub = _mock.createMock(gadgets.Hub);
           _tunnel = _mock.createMock();

           return {
               //Expose mock dependencies
               mock: _mock,
               hub: _hub,
               tunnel: _tunnel,
               setTunnel: function (tunnel) {
                   _tunnel = tunnel;
               },
               getTunnel: function () {
                   return _tunnel;
               },

               //Expose internal private functions
               reqtypes: _REQTYPES,
               eventHandler: _eventHandler,
               presenceHandler: _presenceHandler,
               
               subscribeNode: _subscribeNode,
               unsubscribeNode: _unsubscribeNode,
               
               getNodeList: function () {
                   return _nodesList;
               },
               setNodeList: function (nodelist) {
                   _nodesList = nodelist;
               },
               
               cloneConnInfoObj: _cloneConnInfoObj,
               connInfoHandler: _connInfoHandler,
               clientRequestHandler: _clientRequestHandler

           };
       };


       /**
        * @ignore
        */
       this.endTestSection = 0;
       //END TEST CODE//

    };
    
    window.finesse = window.finesse || {};
    window.finesse.clientservices = window.finesse.clientservices || {};
    window.finesse.clientservices.MasterPublisher = MasterPublisher;

}));

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global publisher:true */

/**
 * Exposes a set of API wrappers that will hide the dirty work of
 *     constructing Finesse API requests and consuming Finesse events.
 *
 * @requires OpenAjax, jQuery 1.5, finesse.utilities.Utilities
 */


/**
 * Allow clients to make Finesse API requests and consume Finesse events by
 * calling a set of exposed functions. The Services layer will do the dirty
 * work of establishing a shared BOSH connection (for designated Master
 * modules), consuming events for client subscriptions, and constructing API
 * requests.
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('clientservices/ClientServices',["clientservices/MasterTunnel",
                "clientservices/MasterPublisher",
                "clientservices/Topics",
                "utilities/Utilities"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.clientservices.MasterTunnel, finesse.clientservices.MasterPublisher, finesse.clientservices.Topics, finesse.utilities.Utilities);
    }
    
}(function (MasterTunnel, MasterPublisher, Topics, Utilities) {
    
     var ClientServices = (function () {/** @lends finesse.clientservices.ClientServices.prototype */
        var

        /**
         * Shortcut reference to the master tunnel
         * @private
         */
        _tunnel,

        _publisher,

        /**
         * Shortcut reference to the finesse.utilities.Utilities singleton
         * This will be set by init()
         * @private
         */
        _util,

        /**
         * Shortcut reference to the gadgets.io object.
         * This will be set by init()
         * @private
         */
        _io,

        /**
         * Shortcut reference to the gadget pubsub Hub instance.
         * This will be set by init()
         * @private
         */
        _hub,

        /**
         * Logger object set externally by setLogger, defaults to nothing.
         * @private
         */
        _logger = {},

        /**
         * Shortcut reference to the Topics class.
         * This will be set by init()
         * @private
         */
        _topics,

        /**
         * Config object needed to initialize this library
         * This must be set by init()
         * @private
         */
        _config,

        /**
         * @private
         * Whether or not this ClientService instance is a Master.
         */
        _isMaster = false,

        /**
         * @private
         * Whether the Client Services have been initiated yet.
         */
        _inited = false,

        /**
         * Stores the list of subscription IDs for all subscriptions so that it
         * could be retrieve for unsubscriptions.
         * @private
         */
        _subscriptionID = {},

        /**
         * The possible states of the JabberWerx BOSH connection.
         * @private
         */
        _STATUS = {
            CONNECTING: "connecting",
            CONNECTED: "connected",
            DISCONNECTED: "disconnected",
            DISCONNECTED_CONFLICT: "conflict",
            DISCONNECTED_UNAUTHORIZED: "unauthorized",
            DISCONNECTING: "disconnecting",
            RECONNECTING: "reconnecting",
            UNLOADING: "unloading",
            FAILING: "failing",
            RECOVERED: "recovered"
        },

        _failoverMode = false,

        /**
         * Handler function to be invoked when BOSH connection is connecting.
         * @private
         */
        _onConnectingHandler,

        /**
         * Handler function to be invoked when BOSH connection is connected
         * @private
         */
        _onConnectHandler,

        /**
         * Handler function to be invoked when BOSH connection is disconnecting.
         * @private
         */
        _onDisconnectingHandler,

        /**
         * Handler function to be invoked when the BOSH is disconnected.
         * @private
         */
        _onDisconnectHandler,

        /**
         * Handler function to be invoked when the BOSH is reconnecting.
         * @private
         */
        _onReconnectingHandler,
        
        /**
         * Handler function to be invoked when the BOSH is unloading.
         * @private
         */
        _onUnloadingHandler,

        /**
         * Contains a cache of the latest connection info containing the current
         * state of the BOSH connection and the resource ID.
         * @private
         */
        _connInfo,

        /**
         * Keeps track of all the objects that need to be refreshed when we recover
         * due to our resilient connection. Only objects that we subscribe to will
         * be added to this list.
         * @private
         */
        _refreshList = [],

        /**
         * @private
         * Centralized logger.log method for external logger
         * @param {String} msg
         *     Message to log
         */
        _log = function (msg) {
            // If the external logger throws up, it stops here.
            try {
                if (_logger.log) {
                    _logger.log("[ClientServices] " + msg);
                }
            } catch (e) { }
        },

        /**
         * Go through each object in the _refreshList and call its refresh() function
         * @private
         */
        _refreshObjects = function () {
            var i;

            // wipe out the explicit subscription list before we refresh objects
            if (_publisher) {
                _publisher.wipeout();
            }

            // refresh each item in the refresh list
            for (i = _refreshList.length - 1; i >= 0; i -= 1) {
                _log("Refreshing " + _refreshList[i].getRestUrl());
                _refreshList[i].refresh(10);
            }
        },

        /**
         * Handler to process connection info publishes.
         * @param {Object} data
         *     The connection info data object.
         * @param {String} data.status
         *     The BOSH connection status.
         * @param {String} data.resourceID
         *     The resource ID for the connection.
         * @private
         */
        _connInfoHandler =  function (data) {

            //Invoke registered handler depending on status received. Due to the
            //request topic where clients can make request for the Master to publish
            //the connection info, there is a chance that duplicate connection info
            //events may be sent, so ensure that there has been a state change
            //before invoking the handlers.
            if (_connInfo === undefined || _connInfo.status !== data.status) {
                _connInfo = data;
                switch (data.status) {
                case _STATUS.CONNECTING:
                    if (_isMaster && _onConnectingHandler) {
                        _onConnectingHandler();
                    }
                    break;
                case _STATUS.CONNECTED:
                    if ((_isMaster || !_failoverMode) && _onConnectHandler) {
                        _onConnectHandler();
                    }
                    break;
                case _STATUS.DISCONNECTED:
                    if (_isMaster && _onDisconnectHandler) {
                        _onDisconnectHandler();
                    }
                    break;
                case _STATUS.DISCONNECTED_CONFLICT:
                    if (_isMaster && _onDisconnectHandler) {
                        _onDisconnectHandler("conflict");
                    }
                    break;
                case _STATUS.DISCONNECTED_UNAUTHORIZED:
                    if (_isMaster && _onDisconnectHandler) {
                        _onDisconnectHandler("unauthorized");
                    }
                    break;
                case _STATUS.DISCONNECTING:
                    if (_isMaster && _onDisconnectingHandler) {
                        _onDisconnectingHandler();
                    }
                    break;
                case _STATUS.RECONNECTING:
                    if (_isMaster && _onReconnectingHandler) {
                        _onReconnectingHandler();
                    }
                    break;
                case _STATUS.UNLOADING:
                    if (_isMaster && _onUnloadingHandler) {
                        _onUnloadingHandler();
                    }
                    break;
                case _STATUS.FAILING:
                    if (!_isMaster) {
                        // Stop
                        _failoverMode = true;
                        if (_onDisconnectHandler) {
                            _onDisconnectHandler();
                        }
                    }
                    break;
                case _STATUS.RECOVERED:
                    if (!_isMaster) {
                        _failoverMode = false;
                        if (_onConnectHandler) {
                            _onConnectHandler();
                        }
                    }
                    // Whenever we are recovered, we need to refresh any objects
                    // that are stored.
                    _refreshObjects();
                    break;
                }
            }
        },

        /**
         * Ensure that ClientServices have been inited.
         * @private
         */
        _isInited = function () {
            if (!_inited) {
                throw new Error("ClientServices needs to be inited.");
            }
        },

        /**
         * Have the client become the Master by initiating a tunnel to a shared
         * event BOSH connection. The Master is responsible for publishing all
         * events to the pubsub infrastructure.
         * @private
         */
        _becomeMaster = function () {
            _tunnel = new MasterTunnel(_config.host, _config.scheme);
            _publisher = new MasterPublisher(_tunnel, _hub);
            _tunnel.init(_config.id, _config.password, _config.xmppDomain, _config.pubsubDomain, _config.resource);
            _isMaster = true;
        },

        /**
         * Make a request to the request channel to have the Master publish the
         * connection info object.
         * @private
         */
        _makeConnectionInfoReq = function () {
            var data = {
                type: "ConnectionInfoReq",
                data: {},
                invokeID: (new Date()).getTime()
            };
            _hub.publish(_topics.REQUESTS, data);
        },

        /**
         * Utility method to register a handler which is associated with a
         * particular connection status.
         * @param {String} status
         *     The connection status string.
         * @param {Function} handler
         *     The handler to associate with a particular connection status.
         * @throws {Error}
         *     If the handler provided is not a function.
         * @private
         */
        _registerHandler = function (status, handler) {
            if (typeof handler === "function") {
                if (_connInfo && _connInfo.status === status) {
                    handler();
                }
                switch (status) {
                case _STATUS.CONNECTING:
                    _onConnectingHandler = handler;
                    break;
                case _STATUS.CONNECTED:
                    _onConnectHandler = handler;
                    break;
                case _STATUS.DISCONNECTED:
                    _onDisconnectHandler = handler;
                    break;
                case _STATUS.DISCONNECTING:
                    _onDisconnectingHandler = handler;
                    break;
                case _STATUS.RECONNECTING:
                    _onReconnectingHandler = handler;
                    break;
                case _STATUS.UNLOADING:
                    _onUnloadingHandler = handler;
                    break;
                }

            } else {
                throw new Error("Callback is not a function");
            }
        };

        return {

            /**
             * @private
             * Adds an item to the list to be refreshed upon reconnect
             * @param {RestBase} object - rest object to be refreshed
             */
            addToRefreshList: function (object) {
                _refreshList.push(object);
            },

            /**
             * @private
             * Removes the given item from the refresh list
             * @param  {RestBase} object - rest object to be removed
             */
            removeFromRefreshList: function (object) {
                var i;
                for (i = _refreshList.length - 1; i >= 0; i -= 1) {
                    if (_refreshList[i] === object) {
                        _refreshList.splice(i, 1);
                        break;
                    }
                }
            },

            /**
             * @private
             * The location of the tunnel HTML URL.
             * @returns {String}
             *     The location of the tunnel HTML URL.
             */
            getTunnelURL: function () {
                return _tunnel.getTunnelURL();            
            },
            
            /**
             * @private
             * Indicates whether the tunnel frame is loaded.
             * @returns {Boolean}
             *     True if the tunnel frame is loaded, false otherwise.
             */
            isTunnelLoaded: function () {
                return _tunnel.isTunnelLoaded();            
            },
            
            /**
             * @private
             * Indicates whether the ClientServices instance is a Master.
             * @returns {Boolean}
             *     True if this instance of ClientServices is a Master, false otherwise.
             */
            isMaster: function () {
                return _isMaster;
            },

            /**
             * @private
             * Get the resource ID. An ID is only available if the BOSH connection has
             * been able to connect successfully.
             * @returns {String}
             *     The resource ID string. Null if the BOSH connection was never
             *     successfully created and/or the resource ID has not been associated.
             */
            getResourceID: function () {
                if (_connInfo !== undefined) {
                    return _connInfo.resourceID;
                }
                return null;
            },
            
            /*
            getHub: function () {
                return _hub;
            },
        */
            /**
             * @private
             * Add a callback to be invoked when the BOSH connection is attempting
             * to connect. If the connection is already trying to connect, the
             * callback will be invoked immediately.
             * @param {Function} handler
             *      An empty param function to be invoked on connecting. Only one
             *      handler can be registered at a time. Handlers already registered
             *      will be overwritten.
             */
            registerOnConnectingHandler: function (handler) {
                _registerHandler(_STATUS.CONNECTING, handler);
            },

            /**
             * @private
             * Removes the on connecting callback that was registered.
             */
            unregisterOnConnectingHandler: function () {
                _onConnectingHandler = undefined;
            },

            /**
             * @private
             * Add a callback to be invoked when the BOSH connection has been
             * established. If the connection has already been established, the
             * callback will be invoked immediately.
             * @param {Function} handler
             *      An empty param function to be invoked on connect. Only one handler
             *      can be registered at a time. Handlers already registered will be
             *      overwritten.
             */
            registerOnConnectHandler: function (handler) {
                _registerHandler(_STATUS.CONNECTED, handler);
            },

            /**
             * @private
             * Removes the on connect callback that was registered.
             */
            unregisterOnConnectHandler: function () {
                _onConnectHandler = undefined;
            },

            /**
             * @private
             * Add a callback to be invoked when the BOSH connection goes down. If
             * the connection is already down, invoke the callback immediately.
             * @param {Function} handler
             *      An empty param function to be invoked on disconnected. Only one
             *      handler can be registered at a time. Handlers already registered
             *      will be overwritten.
             */
            registerOnDisconnectHandler: function (handler) {
                _registerHandler(_STATUS.DISCONNECTED, handler);
            },

            /**
             * @private
             * Removes the on disconnect callback that was registered.
             */
            unregisterOnDisconnectHandler: function () {
                _onDisconnectHandler = undefined;
            },

            /**
             * @private
             * Add a callback to be invoked when the BOSH is currently disconnecting. If
             * the connection is already disconnecting, invoke the callback immediately.
             * @param {Function} handler
             *      An empty param function to be invoked on disconnected. Only one
             *      handler can be registered at a time. Handlers already registered
             *      will be overwritten.
             */
            registerOnDisconnectingHandler: function (handler) {
                _registerHandler(_STATUS.DISCONNECTING, handler);
            },

            /**
             * @private
             * Removes the on disconnecting callback that was registered.
             */
            unregisterOnDisconnectingHandler: function () {
                _onDisconnectingHandler = undefined;
            },

            /**
             * @private
             * Add a callback to be invoked when the BOSH connection is attempting
             * to connect. If the connection is already trying to connect, the
             * callback will be invoked immediately.
             * @param {Function} handler
             *      An empty param function to be invoked on connecting. Only one
             *      handler can be registered at a time. Handlers already registered
             *      will be overwritten.
             */
            registerOnReconnectingHandler: function (handler) {
                _registerHandler(_STATUS.RECONNECTING, handler);
            },

            /**
             * @private
             * Removes the on reconnecting callback that was registered.
             */
            unregisterOnReconnectingHandler: function () {
                _onReconnectingHandler = undefined;
            },
            
            /**
             * @private
             * Add a callback to be invoked when the BOSH connection is unloading
             * 
             * @param {Function} handler
             *      An empty param function to be invoked on connecting. Only one
             *      handler can be registered at a time. Handlers already registered
             *      will be overwritten.
             */
            registerOnUnloadingHandler: function (handler) {
                _registerHandler(_STATUS.UNLOADING, handler);
            },
            
            /**
             * @private
             * Removes the on unloading callback that was registered.
             */
            unregisterOnUnloadingHandler: function () {
                _onUnloadingHandler = undefined;
            },

            /**
             * @private
             * Proxy method for gadgets.io.makeRequest. The will be identical to gadgets.io.makeRequest
             * ClientServices will mixin the BASIC Auth string, locale, and host, since the
             * configuration is encapsulated in here anyways.
             * This removes the dependency
             * @param {String} url
             *     The relative url to make the request to (the host from the passed in config will be
             *     appended). It is expected that any encoding to the URL is already done.
             * @param {Function} handler
             *     Callback handler for makeRequest to invoke when the response returns.
             *     Completely passed through to gadgets.io.makeRequest
             * @param {Object} params
             *     The params object that gadgets.io.makeRequest expects. Authorization and locale
             *     headers are mixed in.
             */
            makeRequest: function (url, handler, params) {
                var requestedScheme, scheme = "http";
                
                // ClientServices needs to be initialized with a config for restHost, auth, and locale
                _isInited();
                
                // Allow mixin of auth and locale headers
                params = params || {};

                // Override refresh interval to 0 instead of default 3600 as a way to workaround makeRequest 
                // using GET http method because then the params are added to the url as query params, which 
                // exposes the authorization string in the url. This is a placeholder until oauth comes in
                params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = params[gadgets.io.RequestParameters.REFRESH_INTERVAL] || 0;
                
                params[gadgets.io.RequestParameters.HEADERS] = params[gadgets.io.RequestParameters.HEADERS] || {};
                
                // Add Basic auth to request header
                params[gadgets.io.RequestParameters.HEADERS].Authorization = "Basic " + _config.authorization;
                //Locale
                params[gadgets.io.RequestParameters.HEADERS].locale = _config.locale;

                //Allow clients to override the scheme:
                //  - If not specified  => we use HTTP
                //  - If null specified => we use _config.scheme
                //  - Otherwise         => we use whatever they provide
                requestedScheme = params.SCHEME; 
                if (!(requestedScheme === undefined || requestedScheme === "undefined")) {
                    if (requestedScheme === null) {
                       scheme = _config.scheme;
                    } else {
                       scheme = requestedScheme;
                    }
                }
                
                _log("RequestedScheme: " + requestedScheme + "; Scheme: " + scheme);
                gadgets.io.makeRequest(encodeURI(scheme + "://" + _config.restHost + ":" + _config.localhostPort) + url, handler, params);
            },

            /**
             * @private
             * Utility function to make a subscription to a particular topic. Only one
             * callback function is registered to a particular topic at any time.
             * @param {String} topic
             *     The full topic name. The topic name should follow the OpenAjax
             *     convention using dot notation (ex: finesse.api.User.1000).
             * @param {Function} callback
             *     The function that should be invoked with the data when an event
             *     is delivered to the specific topic.
             * @returns {Boolean}
             *     True if the subscription was made successfully and the callback was
             *     been registered. False if the subscription already exist, the
             *     callback was not overwritten.
             */
            subscribe: function (topic, callback, disableDuringFailover) {
                _isInited();

                //Ensure that the same subscription isn't made twice.
                if (!_subscriptionID[topic]) {
                    //Store the subscription ID using the topic name as the key.
                    _subscriptionID[topic] = _hub.subscribe(topic,
                        //Invoke the callback just with the data object.
                        function (topic, data) {
                            if (!disableDuringFailover || _isMaster || !_failoverMode) {
                                // Halt all intermediate event processing while the master instance attempts to rebuild the connection. This only occurs:
                                // - For RestBase objects (which pass the disableDuringFailover flag), so that intermediary events while recovering are hidden away until everything is all good
                                //    - We shouldn't be halting anything else because we have infrastructure requests that use the hub pub sub
                                // - Master instance will get all events regardless, because it is responsible for managing failover
                                // - If we are not in a failover mode, everything goes
                                // _refreshObjects will reconcile anything that was missed once we are back in action
                                callback(data);
                            } 
                        });
                    return true;
                }
                return false;
            },

            /**
             * @private
             * Unsubscribe from a particular topic.
             * @param {String} topic
             *     The full topic name.
             */
            unsubscribe: function (topic) {
                _isInited();

                //Unsubscribe from the topic using the subscription ID recorded when
                //the subscription was made, then delete the ID from data structure.
                if (_subscriptionID[topic]) {
                    _hub.unsubscribe(_subscriptionID[topic]);
                    delete _subscriptionID[topic];
                }
            },

            /**
             * @private
             * Make a request to the request channel to have the Master subscribe
             * to a node.
             * @param {String} node
             *     The node to subscribe to.
             */
            subscribeNode: function (node, handler) {
                if (handler && typeof handler !== "function") {
                    throw new Error("ClientServices.subscribeNode: handler is not a function");
                }
                
                // Construct the request to send to MasterPublisher through the OpenAjax Hub
                var data = {
                    type: "SubscribeNodeReq",
                    data: {node: node},
                    invokeID: _util.generateUUID()
                },
                responseTopic = _topics.RESPONSES + "." + data.invokeID,
                _this = this;

                // We need to first subscribe to the response channel
                this.subscribe(responseTopic, function (rsp) {
                    // Since this channel is only used for this singular request,
                    // we are not interested anymore.
                    // This is also critical to not leaking memory by having OpenAjax
                    // store a bunch of orphaned callback handlers that enclose on
                    // our entire ClientServices singleton
                    _this.unsubscribe(responseTopic);
                    if (handler) {
                        handler(data.invokeID, rsp);
                    }
                });
                // Then publish the request on the request channel
                _hub.publish(_topics.REQUESTS, data);
            },

            /**
             * @private
             * Make a request to the request channel to have the Master unsubscribe
             * from a node.
             * @param {String} node
             *     The node to unsubscribe from.
             */
            unsubscribeNode: function (node, subid, handler) {
                if (handler && typeof handler !== "function") {
                    throw new Error("ClientServices.unsubscribeNode: handler is not a function");
                }
                
                // Construct the request to send to MasterPublisher through the OpenAjax Hub
                var data = {
                    type: "UnsubscribeNodeReq",
                    data: {
                        node: node,
                        subid: subid
                    },
                    invokeID: _util.generateUUID()
                },
                responseTopic = _topics.RESPONSES + "." + data.invokeID,
                _this = this;

                // We need to first subscribe to the response channel
                this.subscribe(responseTopic, function (rsp) {
                    // Since this channel is only used for this singular request,
                    // we are not interested anymore.
                    // This is also critical to not leaking memory by having OpenAjax
                    // store a bunch of orphaned callback handlers that enclose on
                    // our entire ClientServices singleton
                    _this.unsubscribe(responseTopic);
                    if (handler) {
                        handler(rsp);
                    }
                });
                // Then publish the request on the request channel
                _hub.publish(_topics.REQUESTS, data);
            },
            
            /**
             * @private
             * Make a request to the request channel to have the Master connect to the XMPP server via BOSH
             */
            makeConnectionReq : function () {
                // Disallow others (non-masters) from administering BOSH connections that are not theirs
                if (_isMaster && _publisher) {
                    _publisher.connect(_config.id, _config.password, _config.xmppDomain);
                } else {
                    _log("F403: Access denied. Non-master ClientService instances do not have the clearance level to make this request: makeConnectionReq");
                }
            },
        
            /**
             * @private
             * Set's the global logger for this Client Services instance.
             * @param {Object} logger
             *     Logger object with the following attributes defined:<ul>
             *         <li><b>log:</b> function (msg) to simply log a message
             *     </ul>
             */
            setLogger: function (logger) {
                // We want to check the logger coming in so we don't have to check every time it is called.
                if (logger && typeof logger === "object" && typeof logger.log === "function") {
                    _logger = logger;
                } else {
                    // We are resetting it to an empty object so that _logger.log in .log is falsy.
                    _logger = {};
                }
            },
            
            /**
             * @private
             * Centralized logger.log method for external logger
             * @param {String} msg
             *     Message to log
             */
            log: _log,

            /**
             * @class
             * Allow clients to make Finesse API requests and consume Finesse events by
             * calling a set of exposed functions. The Services layer will do the dirty
             * work of establishing a shared BOSH connection (for designated Master
             * modules), consuming events for client subscriptions, and constructing API
             * requests.
             * 
             * @constructs
             */
            _fakeConstuctor: function () {
                /* This is here so we can document init() as a method rather than as a constructor. */
            },
            
            /**
             * Initiates the Client Services with the specified config parameters.
             * Enabling the Client Services as Master will trigger the establishment
             * of a BOSH event connection.
             * @param {Object} config
             *     Configuration object containing properties used for making REST requests:<ul>
             *         <li><b>host:</b> The Finesse server IP/host as reachable from the browser
             *         <li><b>restHost:</b> The Finesse API IP/host as reachable from the gadget container
             *         <li><b>id:</b> The ID of the user. This is an optional param as long as the
             *         appropriate authorization string is provided, otherwise it is
             *         required.</li>
             *         <li><b>password:</b> The password belonging to the user. This is an optional param as
             *         long as the appropriate authorization string is provided,
             *         otherwise it is required.</li>
             *         <li><b>authorization:</b> The base64 encoded "id:password" authentication string. This
             *         param is provided to allow the ability to hide the password
             *         param. If provided, the id and the password extracted from this
             *         string will be used over the config.id and config.password.</li>
             *     </ul>
             * @throws {Error} If required constructor parameter is missing.
             * @example
             *      finesse.clientservices.ClientServices.init(finesse.gadget.Config);
             */
            init: function (config) {
                if (!_inited) {
                    //Validate the properties within the config object if one is provided.
                    if (!(typeof config === "object" &&
                         typeof config.host === "string" && config.host.length > 0 && config.restHost && 
                         (typeof config.authorization === "string" ||
                                 (typeof config.id === "string" &&
                                         typeof config.password === "string")))) {
                        throw new Error("Config object contains invalid properties.");
                    }

                    // Initialize configuration
                    _config = config;

                    // Set shortcuts
                    _util = Utilities;
                    _topics = Topics;
                    
                    //TODO: document when this is properly supported
                    // Allows hub and io dependencies to be passed in. Currently only used for unit tests.
                    _hub = config.hub || gadgets.Hub;
                    _io = config.io || gadgets.io;

                    //If the authorization string is provided, then use that to
                    //extract the ID and the password. Otherwise use the ID and
                    //password from the respective ID and password params.
                    if (_config.authorization) {
                        var creds = _util.getCredentials(_config.authorization);
                        _config.id = creds.id;
                        _config.password = creds.password;
                    }
                    else {
                        _config.authorization = _util.b64Encode(
                                _config.id + ":" + _config.password);
                    }

                    _inited = true;

                    if (_hub) {
                        //Subscribe to receive connection information. Since it is possible that
                        //the client comes up after the Master comes up, the client will need
                        //to make a request to have the Master send the latest connection info.
                        //It would be possible that all clients get connection info again.
                        this.subscribe(_topics.EVENTS_CONNECTION_INFO, _connInfoHandler);
                        _makeConnectionInfoReq();
                    }
                }

                //Return the CS object for object chaining.
                return this;
            },

            /**
             * @private
             * Initializes the BOSH component of this ClientServices instance. This establishes
             * the BOSH connection and will trigger the registered handlers as the connection
             * status changes respectively:<ul>
             *     <li>registerOnConnectingHandler</li>
             *     <li>registerOnConnectHandler</li>
             *     <li>registerOnDisconnectHandler</li>
             *     <li>registerOnDisconnectingHandler</li>
             *     <li>registerOnReconnectingHandler</li>
             *     <li>registerOnUnloadingHandler</li>
             * <ul>
             *
             * @param {Object} config
             *     An object containing the following (optional) handlers for the request:<ul>
             *         <li><b>xmppDomain:</b> {String} The domain of the XMPP server. Available from the SystemInfo object.
             *         This is used to construct the JID: user@domain.com</li>
             *         <li><b>pubsubDomain:</b> {String} The pub sub domain where the pub sub service is running.
             *         Available from the SystemInfo object.
             *         This is used for creating or removing subscriptions.</li>
             *         <li><b>resource:</b> {String} The resource to connect to the notification server with.</li>
             *     </ul>
             */
            initBosh: function (config) {
                //Validate the properties within the config object if one is provided.
                if (!(typeof config === "object" && typeof config.xmppDomain === "string" && typeof config.pubsubDomain === "string")) {
                    throw new Error("Config object contains invalid properties.");
                }
                
                // Mixin the required information for establishing the BOSH connection
                _config.xmppDomain = config.xmppDomain;
                _config.pubsubDomain = config.pubsubDomain;
                _config.resource = config.resource;
                
                //Initiate Master launch sequence
                _becomeMaster(); 
            },

            /**
             * @private
             * Sets the failover mode to either FAILING or RECOVERED. This will only occur in the master instance and is meant to be
             * used by a stereotypical failover monitor type module to notify non-master instances (i.e. in gadgets)
             * @param {Object} failoverMode
             *     true if failing, false or something falsy when recovered
             */
            setFailoverMode: function (failoverMode) {
                if (_isMaster) {
                    _hub.publish(_topics.EVENTS_CONNECTION_INFO, {
                        status: (failoverMode ? _STATUS.FAILING : _STATUS.RECOVERED)
                    });
                }
            },

            /**
             * @private
             * Private accessor used to inject mocked private dependencies for unit testing
             */
            _getTestObj: function () {
                return {
                    setPublisher: function (publisher) {
                        _publisher = publisher;
                    }
                };
            }
        };
    }());
     
    window.finesse = window.finesse || {};
    window.finesse.clientservices = window.finesse.clientservices || {};
    window.finesse.clientservices.ClientServices = ClientServices;
    
    return ClientServices;

}));

/**
 * The following comment prevents JSLint errors concerning undefined global variables.
 * It tells JSLint that these identifiers are defined elsewhere.
 */
/*jslint bitwise:true, browser:true, nomen:true, regexp:true, sloppy:true, white:true */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global Handlebars */

/**
 * JavaScript class to implement common notification
 *               functionality.
 * 
 * @requires Class
 * @requires finesse.FinesseBase
 */
/** @private */
 (function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Notifier',['FinesseBase',
                'clientservices/ClientServices'], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase, finesse.clientservices.ClientServices);
    }   
}(function (FinesseBase, ClientServices) {
	var Notifier = FinesseBase.extend({
		/**
         * Initializes the notifier object.
         */
        init : function () {
            this._super();
            this._listenerCallback = [];
        },

        /**
         * Add a listener.
         * 
         * @param callback_function
         * @param scope
         *            is the callback function to add
         */
        addListener : function (callback_function, scope) {
            var len = this._listenerCallback.length, i, cb, add = true;
            for (i = 0; i < len; i += 1) {
                cb = this._listenerCallback[i].callback;
                if (cb === callback_function) {
                    // this callback already exists
                    add = false;
                    break;
                }
            }
            if (add) {
                this._listenerCallback.push({ "callback": this._isAFunction(callback_function), "scope": (scope || window) });
            }            
        },

        /**
         * Remove a listener.
         * 
         * @param callback_function
         *            is the callback function to remove
         * @return {Boolean} true if removed
         */
        removeListener : function (callback_function) {

            var result = false, len = this._listenerCallback.length, i, cb;
            for (i = len - 1; i >= 0; i -=1) {
                cb = this._listenerCallback[i].callback;
                if (cb === callback_function) {
                    this._listenerCallback[i] = undefined;
                    this._listenerCallback.splice(i, 1);
                    result = true;
                    break;
                }
            }
            
            return result;
        },

        /**
	 * Removes all listeners
	 * @return {undefined}
	 */
	reset: function () {
		this._listenerCallback = [];
	},

	/**
         * Notify all listeners.
         * 
         * @param obj
         *            is the object that has changed
         */
        notifyListeners : function (obj) {
            var len = this._listenerCallback.length, i, callbackFunction, scope;

            for (i = 0; i < len; i += 1) {
                // Be sure that one bad callback does not prevent other listeners
                // from receiving.
                try {
                    callbackFunction = this._listenerCallback[i].callback;
                    scope = this._listenerCallback[i].scope;
                    if (typeof callbackFunction === 'function') {
                        callbackFunction.call(scope, obj);
                    }
                } catch (err) {
                    ClientServices.log("Exception caught: " + err);
                }
            }
        },

        /**
         * Gets a copy of the listeners.
         * @return changeListenerCopy (array of callbacks)
         */
        getListeners : function () {
            var changeListenerCopy = [], len = this._listenerCallback.length, i;

            for (i = 0; i < len; i += 1) {
                changeListenerCopy.push(this._listenerCallback[i].callback);
            }

            return changeListenerCopy;
        },
        
        /**
         * Verifies that the handler is function.
         * @param handler to verify
         * @return the handler 
         * @throws Error if not a function
         */
        _isAFunction : function (handler) {
            if (handler === undefined || typeof handler === "function") {
                return handler;
            } else {
                throw new Error("handler must be a function");
            }
        }
	});
	
	window.finesse = window.finesse || {};
	window.finesse.restservices = window.finesse.restservices || {};
	window.finesse.restservices.Notifier = Notifier;

	/** @namespace JavaScript classes and methods that represent REST objects and collections. */
    finesse.restservices = finesse.restservices || {};
	
	return Notifier;
}));

/**
 * JavaScript base object that all REST objects should inherit
 * from because it encapsulates and provides the common functionality that
 * all REST objects need.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/RestBase', ["FinesseBase",
                 "utilities/Utilities",
                 "restservices/Notifier",
                 "clientservices/ClientServices",
                 "clientservices/Topics"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase, finesse.utilities.Utilities,
                finesse.restservices.Notifier,
                finesse.clientservices.ClientServices,
                finesse.clientservices.Topics);
    } 
}(function (FinesseBase, Utilities, Notifier, ClientServices, Topics) {
    
    var RestBase = FinesseBase.extend(/** @lends finesse.restservices.RestBase.prototype */{

        doNotLog: false,        

        /**
         * Used by _processUpdate() and restRequest().
         * Maps requestIds to object-wrapped callbacks passed to restRequest(),
         * so that one of the callbacks can be fired when a corresponding event is
         * received inside _processUpdate().
         * @private
         */
        _pendingCallbacks: {},
        
        /**
         * Gets the REST class for the current object.  This object throws an
         * exception because subtype must implement.
         * @throws {Error} because subtype must implement
         * @private
         */
        getRestClass: function () {
            throw new Error("getRestClass(): Not implemented in subtype.");
        },

        /**
         * Gets the REST type for the current object.  This object throws an
         * exception because subtype must implement.
         * @throws {Error} because subtype must implement.
         * @private
         */
        getRestType: function () {
            throw new Error("getRestType(): Not implemented in subtype.");
        },

        /**
         * Gets the node path for the current object.  This object throws an
         * exception because subtype must implement.
         * @throws {Error} because subtype must implement.
         * @private
         */
        getXMPPNodePath: function () {
            throw new Error("getXMPPNodePath(): Not implemented in subtype.");
        },
        
        /**
         * Boolean function that specifies whether the REST object supports
         * requests. True by default. Subclasses should override if false.
         * @private
         */
        supportsRequests: true,

        /**
         * Boolean function that specifies whether the REST object supports
         * subscriptions. True by default. Subclasses should override if false.
         * @private
         */
        supportsSubscriptions: true,
        
        /**
         * Boolean function that specifies whether the REST object should retain
         * a copy of the REST response. False by default. Subclasses should override if true.
         * @private
         */
        keepRestResponse: false,

        /**
         * Boolean function that specifies whether the REST object explicitly
         * subscribes. False by default. Subclasses should override if true.
         * @private
         */
        explicitSubscription: false,

        /**
         * Boolean function that specifies whether subscribing should be
         * automatically done at construction. Defaults to true.
         * This be overridden at object construction, not by implementing subclasses
         * @private
         */
        autoSubscribe: true,
        
        /**
         * Private reference to default logger
         * @private
         */
        _logger: {
            log: ClientServices.log,
            error: ClientServices.log
        },

        /**
         * @class
         * JavaScript representation of a REST object. Also exposes methods to operate
         * on the object against the server.  This object is typically extended into individual
         * REST Objects (like Dialog, User, etc...), and shouldn't be used directly.
         *
         * @constructor
         * @param {String} id
         *     The ID that uniquely identifies the REST object.
         * @param {Object} callbacks
         *     An object containing callbacks for instantiation and runtime
         *     Callback to invoke upon successful instantiation, passes in REST object.
         * @param {Function} callbacks.onLoad(this)
         *     Callback to invoke upon loading the data for the first time.
         * @param {Function} callbacks.onChange(this)
         *     Callback to invoke upon successful update object (PUT)
         * @param {Function} callbacks.onAdd(this)
         *     Callback to invoke upon successful update to add object (POST)
         * @param {Function} callbacks.onDelete(this)
         *     Callback to invoke upon successful update to delete object (DELETE)
         * @param {Function} callbacks.onError(rsp)
         *     Callback to invoke on update error (refresh or event)
         *     as passed by finesse.restservices.RestBase.restRequest()
         *     {
         *         status: {Number} The HTTP status code returned
         *         content: {String} Raw string of response
         *         object: {Object} Parsed object of response
         *         error: {Object} Wrapped exception that was caught
         *         error.errorType: {String} Type of error that was caught
         *         error.errorMessage: {String} Message associated with error
         *     }
         * @param {RestBase} [restObj]
         *     A RestBase parent object which this object has an association with.
         * @constructs
         */
        init: function (options, callbacks, restObj) {
            /**
              * Initialize the base class
              */
            var _this = this;

            this._super();

            if (typeof options === "object") {
                this._id = options.id;
                this._restObj = options.parentObj;
                this.autoSubscribe = (options.autoSubscribe === false) ? false : true;
                this.doNotSubscribe = options.doNotSubscribe;
                this.doNotRefresh = this.doNotRefresh || options.doNotRefresh;
                callbacks = {
                    onLoad: options.onLoad,
                    onChange: options.onChange,
                    onAdd: options.onAdd,
                    onDelete: options.onDelete,
                    onError: options.onError
                };
            } else {
                this._id = options;
                this._restObj = restObj;
            }
            
            // Common stuff
            
            this._data = {};
            
            //Contains the full rest response to be processed by upper layers if needed
            this._restResponse = undefined;

            this._lastUpdate = {};

            this._util = Utilities;

            //Should be correctly initialized in either a window OR gadget context
            this._config = finesse.container.Config;

            // Setup all the notifiers - change, load and error.
            this._changeNotifier = new Notifier();
            this._loadNotifier = new Notifier();
            this._addNotifier = new Notifier();
            this._deleteNotifier = new Notifier();
            this._errorNotifier = new Notifier();

            this._loaded = false;

            // Protect against null dereferencing of options allowing its
            // (nonexistent) keys to be read as undefined
            callbacks = callbacks || {};

            this.addHandler('load', callbacks.onLoad);
            this.addHandler('change', callbacks.onChange);
            this.addHandler('add', callbacks.onAdd);
            this.addHandler('delete', callbacks.onDelete);
            this.addHandler('error', callbacks.onError);

            // Attempt to get the RestType then synchronize
            try {
                this.getRestType();

                // Only subscribe if this REST object supports subscriptions
                // and autoSubscribe was not requested to be disabled as a construction option
                if (this.supportsSubscriptions && this.autoSubscribe && !this.doNotSubscribe) {
                    this.subscribe({
                        success: function () {
                            //TODO: figure out how to use Function.call() or Function.apply() here...
                            //this is exactly the same as the below else case other than the scope of "this"
                            if (typeof options === "object" && options.data) {
                                if (!_this._processObject(_this._normalize(options.data))) {
                                    // notify of error if we fail to construct
                                    _this._errorNotifier.notifyListeners(_this);
                                }
                            } else {
                                // Only subscribe if this REST object supports requests
                                if (_this.supportsRequests) {
                                    _this._synchronize();
                                }
                            }
                        },
                        error: function (err) {
                            _this._errorNotifier.notifyListeners(err);
                        }
                    });
                } else {
                    if (typeof options === "object" && options.data) {
                        if (!this._processObject(this._normalize(options.data))) {
                            // notify of error if we fail to construct
                            this._errorNotifier.notifyListeners(this);
                        }
                    } else {
                        // Only subscribe if this REST object supports requests
                        if (this.supportsRequests) {
                            this._synchronize();
                        }
                    }
                }

            } catch (err) {
                this._logger.error('id=' + this._id + ': ' + err);
            }
        },

        /**
         * Determines if the object has a particular property.
         * @param obj is the object to examine
         * @param property is the property to check for
         * @returns {Boolean}
         */
        hasProperty: function (obj, prop) {
            return (obj !== null) && (obj.hasOwnProperty(prop));
        },

        /**
         * Gets a property from the object.
         * @param obj is the object to examine
         * @param property is the property to get
         * @returns {Property Value} or {Null} if not found
         */
        getProperty: function (obj, property) {
            var result = null;

            if (this.hasProperty(obj, property) === false) {
                result = null;
            } else {
                result = obj[property];
            }
            return result;
        },

        /**
         * Utility to extracts the ID from the specified REST URI. This is with the
         * assumption that the ID is always the last element in the URI after the
         * "/" delimiter.
         * @param {String} restUri
         *     The REST uri (i.e. /finesse/api/User/1000).
         * @private
         */
        _extractId: function (restObj) {
            var obj, restUri = "", strLoc;
            for (obj in restObj) {
                if (restObj.hasOwnProperty(obj)) {
                    restUri = restObj[obj].uri;
                    break;
                }
            }
            return Utilities.getId(restUri);
        },

        /**
         * Gets the data for this object.
         * @returns {Object} which is contained in data
         */
        getData: function () {
            return this._data;
        },
        
        /**
         * Gets the complete REST response to the request made
         * @returns {Object} which is contained in data
         * @private
         */
        getRestResponse: function () {
            return this._restResponse;
        },

        /**
         * The REST URL in which this object can be referenced.
         * @return {String}
         *     The REST URI for this object.
         * @private
         */
        getRestUrl: function () {
            var
            restObj = this._restObj,
            restUrl = "";

            //Prepend the base REST object if one was provided.
            if (restObj instanceof RestBase) {
                restUrl += restObj.getRestUrl();
            }
            //Otherwise prepend with the default webapp name.
            else {
                restUrl += "/finesse/api";
            }

            //Append the REST type.
            restUrl += "/" + this.getRestType();

            //Append ID if it is not undefined, null, or empty.
            if (this._id) {
                restUrl += "/" + this._id;
            }
            return restUrl;
        },

        /**
         * Getter for the id of this RestBase
         * @returns {String}
         *     The id of this RestBase
         */
        getId: function () {
            return this._id;
        },

        /**
         * Synchronize this object with the server using REST GET request.
         * @private
         */
        _synchronize: function (retries) {
            // Fetch this REST object
            if (typeof this._id === "string") {
                var _this = this, isLoaded = this._loaded, _RETRY_INTERVAL = 10 * 1000;

                this._doGET(
                    {
                        success: function (rsp) {
                            if (!_this._processResponse(rsp)) {
                                if (retries > 0) {
                                    setTimeout(function () {
                                        _this._synchronize(retries - 1);
                                    }, _RETRY_INTERVAL);
                                } else {
                                    _this._errorNotifier.notifyListeners(_this);
                                }
                            } else {
                                // If this object was already "loaded" prior to
                                // the _doGET request, then call the
                                // changeNotifier
                                if (isLoaded) {
                                    _this._changeNotifier.notifyListeners(_this);
                                }
                            }
                        },
                        error: function (rsp) {
                            if (retries > 0) {
                                setTimeout(function () {
                                    _this._synchronize(retries - 1);
                                }, _RETRY_INTERVAL);
                                
                            } else {
                                _this._errorNotifier.notifyListeners(rsp);
                            }
                        }
                    }
                );

            } else {
                throw new Error("Can't construct a <" + this.getRestType() + "> due to invalid id type.");
            }
        },

        /**
         * Adds an handler to this object.
         * If notifierType is 'load' and the object has already loaded, the callback is invoked immediately
         * @param {String} notifierType
         *     The type of notifier to add to ('load', 'change', 'add', 'delete', 'error')
         * @param {Function} callback
         *     The function callback to invoke.
         * @example
         *   // Handler for additions to the Dialogs collection object.  
         *   // When Dialog (a RestBase object) is created, add a change handler.
         *   _handleDialogAdd = function(dialog) {
         *      dialog.addHandler('change', _handleDialogChange);
         *   }
         */
        addHandler: function (notifierType, callback, scope) {
            var notifier = null;
            try {
                Utilities.validateHandler(callback);

                notifier = this._getNotifierReference(notifierType);

                notifier.addListener(callback, scope);
                
                // If load handler is added and object has
                // already been loaded, invoke callback
                // immediately
                if (notifierType === 'load' && this._loaded) {
                    callback.call((scope || window), this);
                }
            } catch (err) {
                this._logger.error('id=' + this._id + ': ' + err);
            }
        },

        /**
         * Removes a handler from this object.
         * @param {String} notifierType
         *     The type of notifier to remove ('load', 'change', 'add', 'delete', 'error')
         * @param {Function} callback
         *     The function to remove.
         */
        removeHandler: function (notifierType, callback) {
            var notifier = null;
            try {
                Utilities.validateHandler(callback);

                notifier = this._getNotifierReference(notifierType);

                if (typeof(callback) === "undefined")
                {
                    // Remove all listeners for the type
                    notifier.reset();
                }
                else
                {
                    // Remove the specified listener
                    finesse.utilities.Utilities.validateHandler(callback);
                    notifier.removeListener(callback);
                }
            } catch (err) {
                this._logger.error('id=' + this._id + ': ' + err);
            }
        },

        /**
         * Utility method gating any operations that require complete instantiation
         * @throws Error
         *     If this object was not fully instantiated yet
         * @returns {finesse.restservices.RestBase}
         *     This RestBase object to allow cascading
         */
        isLoaded: function () {
            if (!this._loaded) {
                throw new Error("Cannot operate on object that is not fully instantiated, use onLoad/onLoadError handlers");
            }
            return this; // Allow cascading
        },



        /**
         * Force an update on this object. Since an asynchronous GET is performed,
         * it is necessary to have an onChange handler registered in order to be
         * notified when the response of this returns.
         * @param {Integer} retries
         *    The number or retry attempts to make.
         * @returns {finesse.restservices.RestBase}
         *     This RestBase object to allow cascading
         */
        refresh: function (retries) {
            var _this = this;

            if (this.explicitSubscription) {
                this._subscribeNode({
                    success: function () {
                        //Disallow GETs if object doesn't support it.
                        if (!_this.supportsRequests) {
                            throw new Error("Object doesn't support request operations.");
                        }

                        _this._synchronize(retries);

                        return this; // Allow cascading
                    },
                    error: function (err) {
                        _this._errorNotifier.notifyListeners(err);
                    }
                });
            } else {
                //Disallow GETs if object doesn't support it.
                if (!this.supportsRequests) {
                    throw new Error("Object doesn't support request operations.");
                }

                this._synchronize(retries);

                return this; // Allow cascading
            }
        },

        /**
         * Utility method to validate against the known schema of this RestBase
         * @param {Object} obj
         *     The object to validate
         * @returns {Boolean}
         *     True if the object fits the schema of this object. This usually
         *     means all required keys or nested objects are present.
         *     False otherwise.
         * @private
         */
        _validate: function (obj) {
            var valid = (typeof obj === "object" && this.hasProperty(obj, this.getRestType()));
            if (!valid)
            {
                this._logger.error(this.getRestType() + " failed validation! Does your JS REST class return the correct string from getRestType()?");
            }
            return valid;
        },

        /**
         * Utility method to fetch this RestBase from the server
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.RestBase}
         *     This RestBase object to allow cascading
         * @private
         */
        _doGET: function (handlers) {
            this.restRequest(this.getRestUrl(), handlers);
            return this; // Allow cascading
        },

        /**
         * Common update event handler used by the pubsub callback closure.
         * Processes the update event then notifies listeners.
         * @param {Object} scope
         *     An object containing callbacks to handle the asynchronous get
         * @param {Object} update
         *     An object containing callbacks to handle the asynchronous get
         * @private
         */
        _updateEventHandler: function (scope, update) {
            if (scope._processUpdate(update)) {
                switch (update.object.Update.event) {
                case "POST":
                    scope._addNotifier.notifyListeners(scope);
                    break;
                case "PUT":
                    scope._changeNotifier.notifyListeners(scope);
                    break;
                case "DELETE":
                    scope._deleteNotifier.notifyListeners(scope);
                    break;
                }
            }   
        },

        /**
         * Utility method to create a callback to be given to OpenAjax to invoke when a message
         * is published on the topic of our REST URL (also XEP-0060 node).
         * This needs to be its own defined method so that subclasses can have their own implementation.
         * @returns {Function} callback(update)
         *     The callback to be invoked when an update event is received. This callback will
         *     process the update and notify listeners.
         * @private
         */
        _createPubsubCallback: function () {
            var _this = this;
            return function (update) {
                _this._updateEventHandler(_this, update);
            };
        },

        /**
         * Subscribe to pubsub infra using the REST URL as the topic name.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @private
         */
        subscribe: function (callbacks) {
            // Only need to do a subscription to client pubsub. No need to trigger
            // a subscription on the Finesse server due to implicit subscribe (at
            // least for now).
            var _this = this,
            topic = Topics.getTopic(this.getRestUrl()),
            handlers,
            successful = ClientServices.subscribe(topic, this._createPubsubCallback(), true);

            callbacks = callbacks || {};

            handlers = {
                /** @private */
                success: function () {
                    // Add item to the refresh list in ClientServices to refresh if
                    // we recover due to our resilient connection. However, do
                    // not add if doNotRefresh flag is set.
                    if (!_this.doNotRefresh) {
                        ClientServices.addToRefreshList(_this);
                    }

                    if (typeof callbacks.success === "function") {
                        callbacks.success();
                    }
                },
                /** @private */
                error: function (err) {
                    if (successful) {
                        ClientServices.unsubscribe(topic);
                    }

                    if (typeof callbacks.error === "function") {
                        callbacks.error(err);
                    }
                }
            };

            // Request a node subscription only if this object requires explicit subscriptions
            if (this.explicitSubscription === true) {
                this._subscribeNode(handlers);
            } else {
                if (successful) {
                    this._subid = "OpenAjaxOnly";
                    handlers.success();
                } else {
                    handlers.error();
                }
            }

            return this;
        },

        /**
         * Unsubscribe to pubsub infra using the REST URL as the topic name.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @private
         */
        unsubscribe: function (callbacks) {
            // Only need to do a subscription to client pubsub. No need to trigger
            // a subscription on the Finesse server due to implicit subscribe (at
            // least for now).
            var _this = this,
            topic = Topics.getTopic(this.getRestUrl()),
            handlers;

            // no longer keep track of object to refresh on reconnect
            ClientServices.removeFromRefreshList(_this);

            callbacks = callbacks || {};

            handlers = {
                /** @private */
                success: function () {
                    if (typeof callbacks.success === "function") {
                        callbacks.success();
                    }
                },
                /** @private */
                error: function (err) {
                    if (typeof callbacks.error === "function") {
                        callbacks.error(err);
                    }
                }
            };

            if (this._subid) {
                ClientServices.unsubscribe(topic);
                // Request a node unsubscribe only if this object requires explicit subscriptions
                if (this.explicitSubscription === true) {
                    this._unsubscribeNode(handlers);
                } else {
                    this._subid = undefined;
                    handlers.success();
                }
            } else {
                handlers.success();
            }

            return this;
        },

        /**
         * Private utility to perform node subscribe requests for explicit subscriptions
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @private
         */
        _subscribeNode: function (callbacks) {
            var _this = this;

            // Protect against null dereferencing of callbacks allowing its (nonexistent) keys to be read as undefined
            callbacks = callbacks || {};

            ClientServices.subscribeNode(this.getXMPPNodePath(), function (subid, err) {
                if (err) {
                    if (typeof callbacks.error === "function") {
                        callbacks.error(err);
                    }
                } else {
                    // Store the subid on a successful subscribe
                    _this._subid = subid;
                    if (typeof callbacks.success === "function") {
                        callbacks.success();
                    }
                }
            });
        },

        /**
         * Private utility to perform node unsubscribe requests for explicit subscriptions
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @private
         */
        _unsubscribeNode: function (callbacks) {
            var _this = this;

            // Protect against null dereferencing of callbacks allowing its (nonexistent) keys to be read as undefined
            callbacks = callbacks || {};

            ClientServices.unsubscribeNode(this.getXMPPNodePath(), this._subid, function (err) {
                _this._subid = undefined;
                if (err) {
                    if (typeof callbacks.error === "function") {
                        callbacks.error(err);
                    }
                } else {
                    if (typeof callbacks.success === "function") {
                        callbacks.success();
                    }
                }
            });
        },

        /**
         * Validate and store the object into the internal data store.
         * @param {Object} object
         *     The JavaScript object that should match of schema of this REST object.
         * @returns {Boolean}
         *     True if the object was validated and stored successfully.
         * @private
         */
        _processObject: function (object) {
            if (this._validate(object)) {
                this._data = this.getProperty(object, this.getRestType()); // Should clone the object here?

                // If loaded for the first time, call the load notifiers.
                if (!this._loaded) {
                    this._loaded = true;
                    this._loadNotifier.notifyListeners(this);
                }

                return true;
            }
            return false;
        },

        /**
         * Normalize the object to mitigate the differences between the backend
         * and what this REST object should hold. For example, the backend sends
         * send an event with the root property name being lower case. In order to
         * match the GET, the property should be normalized to an upper case.
         * @param {Object} object
         *     The object which should be normalized.
         * @returns {Object}
         *     Return the normalized object.
         * @private
         */
        _normalize: function (object) {
            var
            restType = this.getRestType(),
            // Get the REST object name with first character being lower case.
            objRestType = restType.charAt(0).toLowerCase() + restType.slice(1);

            // Normalize payload to match REST object. The payload for an update
            // use a lower case object name as oppose to upper case. Only normalize
            // if necessary.
            if (!this.hasProperty(object, restType) && this.hasProperty(object, objRestType)) {
                //Since the object is going to be modified, clone the object so that
                //it doesn't affect others (due to OpenAjax publishing to other
                //subscriber.
                object = jQuery.extend(true, {}, object);

                object[restType] = object[objRestType];
                delete(object[objRestType]);
            }
            return object;
        },

        /**
         * Utility method to process the response of a successful get
         * @param {Object} rsp
         *     The response of a successful get
         * @returns {Boolean}
         *     True if the update was successfully processed (the response object
         *     passed the schema validation) and updated the internal data cache,
         *     false otherwise.
         * @private
         */
        _processResponse: function (rsp) {
            try {
                if (this.keepRestResponse) {
                    this._restResponse = rsp.content;
                }
                return this._processObject(rsp.object);
            }
            catch (err) {
                this._logger.error(this.getRestType() + ': ' + err);
            }
            return false;
        },

        /**
         * Utility method to process the update notification.
         * @param {Object} update
         *     The payload of an update notification.
         * @returns {Boolean}
         *     True if the update was successfully processed (the update object
         *     passed the schema validation) and updated the internal data cache,
         *     false otherwise.
         * @private
         */
        _processUpdate: function (update) {
            try {
                var updateObj, requestId, fakeResponse, receivedError;

                // The backend will send the data object with a lower case. To be
                // consistent with what should be represented in this object, the
                // object name should be upper case. This will normalize the object.
                updateObj = this._normalize(update.object.Update.data);

                // Store the last event.
                this._lastUpdate = update.object;

                requestId = this._lastUpdate.Update ? this._lastUpdate.Update.requestId : undefined;

                if (requestId && this._pendingCallbacks[requestId]) {

                    /*
                     * The passed success/error callbacks are expecting to be passed an AJAX response, so construct
                     * a simulated/"fake" AJAX response object from the information in the received event.
                     * The constructed object should conform to the contract for response objects specified
                     * in _createAjaxHandler().
                     */
                    fakeResponse = {};

                    //The contract says that rsp.content should contain the raw text of the response so we simulate that here.
                    //For some reason json2xml has trouble with the native update object, so we serialize a clone of it by
                    //doing a parse(stringify(update)).
                    fakeResponse.content = this._util.json2xml(gadgets.json.parse(gadgets.json.stringify(update)));

                    fakeResponse.object = {};

                    if (updateObj.apiErrors && updateObj.apiErrors.apiError) { //Error case

                        //TODO: The lowercase -> uppercase ApiErrors translation method below is undesirable, can it be improved?
                        receivedError = updateObj.apiErrors.apiError;
                        fakeResponse.object.ApiErrors = {};
                        fakeResponse.object.ApiErrors.ApiError = {};
                        fakeResponse.object.ApiErrors.ApiError.ErrorData = receivedError.errorData || undefined;
                        fakeResponse.object.ApiErrors.ApiError.ErrorMessage = receivedError.errorMessage || undefined;
                        fakeResponse.object.ApiErrors.ApiError.ErrorType = receivedError.errorType || undefined;

                        /*
                         * Since this is the error case, supply the error callback with a '400 BAD REQUEST' status code. We don't know what the real
                         * status code should be since the event we're constructing fakeResponse from doesn't include a status code.
                         * This is just to conform to the contract for the error callback in _createAjaxHandler().
                         **/
                        fakeResponse.status = 400;

                    } else { //Success case

                        fakeResponse.object = this._lastUpdate;

                        /*
                         * Since this is the success case, supply the success callback with a '200 OK' status code. We don't know what the real
                         * status code should be since the event we're constructing fakeResponse from doesn't include a status code.
                         * This is just to conform to the contract for the success callback in _createAjaxHandler().
                         **/
                        fakeResponse.status = 200;
                    }

                    try {

                        if (fakeResponse.object.ApiErrors && this._pendingCallbacks[requestId].error) {
                            this._pendingCallbacks[requestId].error(fakeResponse);
                        } 
                        // HTTP 202 is handled as a success, besides, we cannot infer that a non-error is a success.
                        /*else if (this._pendingCallbacks[requestId].success) {
                            this._pendingCallbacks[requestId].success(fakeResponse);
                        }*/

                    } catch (callbackErr) {

                        this._logger.error(this.getRestType() + ": Caught error while firing callback: " + callbackErr);

                    }

                    //Clean up _pendingCallbacks now that we fired a callback corresponding to the received requestId.
                    delete this._pendingCallbacks[requestId];

                } else {
                    this._logger.log(this.getRestType() + ": Received the following event with an invalid or unknown requestId:");
                    this._logger.log(gadgets.json.stringify(update));
                }

                return this._processObject(updateObj);
            }
            catch (err) {
                this._logger.error(this.getRestType() + ': ' + err);
            }
            return false;
        },

        /**
         * Utility method to create ajax response handler closures around the
         * provided callbacks. Callbacks should be passed through from .ajax().
         * makeRequest is responsible for garbage collecting these closures.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @private
         */
        _createAjaxHandler: function (options) {
            //We should not need to check this again since it has already been done in .restRequest()
            //options = options || {};

            //Get a reference to the parent User object
            var _this = this;

            return function (rsp) {

                var requestId, error = false, rspObj;

                if (options.success || options.error) {
                    rspObj = {
                        status: rsp.rc,
                        content: rsp.text
                    };

                    if (!_this.doNotLog) {
                        _this._logger.log(_this.getRestType() + ": requestId='" + options.uuid + "', Returned with status=" + rspObj.status + ", content='" + rspObj.content + "'");
                    }

                    //Some responses may not have a body.
                    if (rsp.text && rsp.text.length > 0) {
                        try {
                            rspObj.object = _this._util.xml2js(rsp.text);
                        } catch (e) {
                            error = true;
                            rspObj.error = {
                                errorType: "parseError",
                                errorMessage: "Could not serialize XML: " + e
                            };
                        }
                    } else {
                        rspObj.object = {};
                    }

                    if (!error && rspObj.status >= 200 && rspObj.status < 300) {
                        if (options.success) {
                            options.success(rspObj);
                        }
                    } else {
                        if (options.error) {
                            options.error(rspObj);
                        }
                    }

                    /*
                     * If a synchronous error happened after a non-GET request (usually a validation error), we
                     * need to clean up the request's entry in _pendingCallbacks since no corresponding event
                     * will arrive later. The corresponding requestId should be present in the response headers.
                     *
                     * It appears Shindig changes the header keys to lower case, hence 'requestid' instead of
                     * 'requestId' below.
                     **/
                    if (rspObj.status !== 202 && rsp.headers && rsp.headers.requestid) {
                        requestId = rsp.headers.requestid[0];
                        if (_this._pendingCallbacks[requestId]) {
                            delete _this._pendingCallbacks[requestId];
                        }
                    }
                }
            };
        },

        /**
         * Utility method to make an asynchronous request
         * @param {String} url
         *     The unencoded URL to which the request is sent (will be encoded)
         * @param {Object} options
         *     An object containing additional options for the request.
         * @param {Object} options.content
         *     An object to send in the content body of the request. Will be
         *     serialized into XML before sending.
         * @param {String} options.method
         *     The type of request. Defaults to "GET" when none is specified.
         * @param {Function} options.success(rsp)
         *     A callback function to be invoked for a successful request.
         *     {
         *         status: {Number} The HTTP status code returned
         *         content: {String} Raw string of response
         *         object: {Object} Parsed object of response
         *     }
         * @param {Function} options.error(rsp)
         *     A callback function to be invoked for an unsuccessful request.
         *     {
         *         status: {Number} The HTTP status code returned
         *         content: {String} Raw string of response
         *         object: {Object} Parsed object of response
         *         error: {Object} Wrapped exception that was caught
         *         error.errorType: {String} Type of error that was caught
         *         error.errorMessage: {String} Message associated with error
         *     }
         * @private
        */
        restRequest: function (url, options) {

            var params, encodedUrl;

            params = {};

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            options = options || {};
            options.success = this._util.validateHandler(options.success);
            options.error = this._util.validateHandler(options.error);

            // Request Headers
            params[gadgets.io.RequestParameters.HEADERS] = {};

            // HTTP method is a passthrough to gadgets.io.makeRequest, makeRequest defaults to GET
            params[gadgets.io.RequestParameters.METHOD] = options.method;

            //true if this should be a GET request, false otherwise
            if (!options.method || options.method === "GET") {
                //Disable caching for GETs
                if (url.indexOf("?") > -1) {
                    url += "&";
                } else {
                    url += "?";
                }
                url += "nocache=" + this._util.currentTimeMillis();
            } else {
                /**
                 * If not GET, generate a requestID and add it to the headers, then wrap
                 * callbacks into an object and store it in _pendingCallbacks.
                 * If we receive a synchronous error response instead of a 202 as expected,
             * the AJAX handler will clean up _pendingCallbacks.
                 **/
                /*
                 * TODO: Clean up _pendingCallbacks if an entry persists after a certain amount of time has passed.
                 * In the block below, can store the current time (new Date().getTime()) alongside the
                 * callbacks in the new _pendingCallbacks entry. Then iterate through a copty of _pendingCallbacks,
                 * deleting all entries inside _pendingCallbacks that are older than a certain threshold (2 minutes for example.)
                 * This solves a potential memory leak issue if we never receive an event for a given stored requestId;
                 * we don't want to store unfired callbacks forever.
                 */
                /** @private */
                options.uuid = this._util.generateUUID();
                params[gadgets.io.RequestParameters.HEADERS].requestId = options.uuid;
                //By default, Shindig strips nearly all of the response headers, but this parameter tells Shindig
                //to send the headers through unmodified; we need to be able to read the 'requestId' header if we
                //get a synchronous error as a result of a non-GET request. (See the bottom of _createAjaxHandler().)
                params[gadgets.io.RequestParameters.GET_FULL_HEADERS] = "true";
                this._pendingCallbacks[options.uuid] = {};
                this._pendingCallbacks[options.uuid].success = options.success;
                this._pendingCallbacks[options.uuid].error = options.error;
            }

            //debugger;
            // NAT: IGNORE this until you hit save after changing assignments, then
            // pause here and set window.errorOnRequest to true, step past the next line,
            // and then set it to false. True value will throw an error when saving assignments.
            encodedUrl = encodeURI(url) + (window.errorOnRestRequest ? "ERROR" : "");

            if (!this.doNotLog) {
                this._logger.log(this.getRestType() + ": requestId='" + options.uuid + "', Making REST request: method=" + (options.method || "GET") + ", url='" + encodedUrl + "'");
            }

            // Content Body
            if (typeof options.content === "object") {
                // Content Type
                params[gadgets.io.RequestParameters.HEADERS]["Content-Type"] = "application/xml";
                // Content
                params[gadgets.io.RequestParameters.POST_DATA] = this._util.js2xml(options.content);
                
                if (!this.doNotLog) {
                    this._logger.log(this.getRestType() + ": requestId='" + options.uuid + "', POST_DATA='" + params[gadgets.io.RequestParameters.POST_DATA] + "'");
                }
            }

            ClientServices.makeRequest(encodedUrl, this._createAjaxHandler(options), params);
        },

        /**
         * Retrieves a reference to a particular notifierType.
         * @param notifierType is a string which indicates the notifier to retrieve
         * ('load', 'change', 'add', 'delete', 'error')
         * @return {Notifier}
         * @private
         */
        _getNotifierReference: function (notifierType) {
            var notifierReference = null;
            if (notifierType === 'load') {
                notifierReference = this._loadNotifier;
            } else if (notifierType === 'change') {
                notifierReference = this._changeNotifier;
            } else if (notifierType === 'add') {
                notifierReference = this._addNotifier;
            } else if (notifierType === 'delete') {
                notifierReference = this._deleteNotifier;
            } else if (notifierType === 'error') {
                notifierReference = this._errorNotifier;
            } else {
                throw new Error("_getNotifierReference(): Trying to get unknown notifier(notifierType=" + notifierType + ")");
            }

            return notifierReference;
        }
    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.RestBase = RestBase;
    
    return RestBase;
}));

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global finesse*/

/**
 * JavaScript base object that all REST collection objects should
 * inherit from because it encapsulates and provides the common functionality
 * that all REST objects need.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/**
 * @class
 * JavaScript representation of a REST collection object.
 *
 * @constructor
 * @param {Function} callbacks.onCollectionAdd(this)
 *     Callback to invoke upon successful item addition to the collection.
 * @param {Function} callbacks.onCollectionDelete(this)
 *     Callback to invoke upon successful item deletion from the collection.
 * @borrows finesse.restservices.RestBase as finesse.restservices.RestCollectionBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/RestCollectionBase', ['restservices/RestBase',
                 'utilities/Utilities',
                 'restservices/Notifier'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase, finesse.utilities.Utilities, finesse.restservices.Notifier);
    } 
}(function (RestBase, Utilities, Notifier) {
    var RestCollectionBase = RestBase.extend(/** @lends finesse.restservices.RestCollectionBase.prototype */{

        /**
         * Boolean function that specifies whether the collection handles subscribing
         * and propagation of events for the individual REST object items the
         * collection holds. False by default. Subclasses should override if true.
         * @private
         */
        supportsRestItemSubscriptions: false,

        /**
         * Gets the constructor the individual items that make of the collection.
         * For example, a Dialogs collection object will hold a list of Dialog items.
         * @throws Error because subtype must implement.
         * @private
         */
        getRestItemClass: function () {
            throw new Error("getRestItemClass(): Not implemented in subtype.");
        },

        /**
         * Gets the REST type of the individual items that make of the collection.
         * For example, a Dialogs collection object will hold a list of Dialog items.
         * @throws Error because subtype must implement.
         * @private
         */
        getRestItemType: function () {
            throw new Error("getRestItemType(): Not implemented in subtype.");
        },

        /**
         * The base REST URL in which items this object contains can be referenced.
         * @return {String}
         *     The REST URI for items this object contains.
         * @private
         */
        getRestItemBaseUrl: function () {
            var
            restUrl = "/finesse/api";

            //Append the REST type.
            restUrl += "/" + this.getRestItemType();

            return restUrl;
        },

         /*
         * Creates a new object from the given data
         * @param data - data object
         * @private
         */
        _objectCreator: function (data) {
            var objectId = this._extractId(data),
            newRestObj = this._collection[objectId],
            _this = this;

            //Prevent duplicate entries into collection.
            if (!newRestObj) {
                //Create a new REST object using the subtype defined by the
                //overridden method.
                newRestObj = new (this.getRestItemClass())({
                    doNotSubscribe: this.handlesItemSubscription,
                    doNotRefresh: this.handlesItemRefresh,
                    id: objectId,
                    data: data,
                    onLoad: function (newObj) {
                        //Normalize and add  REST object to collection datastore.
                        _this._collection[objectId] = newObj;
                        _this._collectionAddNotifier.notifyListeners(newObj);
                        _this.length += 1;
                    }
                });
            }
            else {
                //If entry already exist in collection, process the new event,
                //and notify all change listeners since an existing object has
                //change. This could happen in the case when the Finesse server
                //cycles, and sends a snapshot of the user's calls.
                newRestObj._processObject(data);
                newRestObj._changeNotifier.notifyListeners(newRestObj);
            }
        },

        /*
         * Deletes and object and notifies its handlers
         * @param data - data object
         * @private
         */
        _objectDeleter: function (data) {
            var objectId = this._extractId(data),
            object = this._collection[objectId];
            if (object) {
                //Even though this is a delete, let's make sure the object we are passing has got good data
                object._processObject(data);
                //Notify listeners and delete from internal datastore.
                this._collectionDeleteNotifier.notifyListeners(object);
                delete this._collection[objectId];
                this.length -= 1;
            }
        },

         /**
          * Creates an anonymous function for notifiying error listeners of a particular object
          * data.
          * @param obj - the objects whose error listeners to notify
          * @returns {Function}
          *     Callback for notifying of errors
          * @private
          */
        _createErrorNotifier: function (obj) {
            return function (err) {
                obj._errorNotifier.notifyListeners(err);
            };
        },

         /**
          * Replaces the collection with a refreshed list using the passed in
          * data.
          * @param data - data object (usually this._data)
          * @private
          */
         _buildRefreshedCollection: function (data) {
            var i, dataObject, object, objectId, dataArray, newIds = [], foundFlag;
            if (data && this.getProperty(data, this.getRestItemType()) !== null) {
                dataArray = Utilities.getArray(this.getProperty(data, this.getRestItemType()));
            } else {
                dataArray = [];
            }

            // iterate through each item in the new data and add to or update collection
            for (i = 0; i < dataArray.length; i += 1) {
                dataObject = {};
                dataObject[this.getRestItemType()] = dataArray[i];
                objectId = this._extractId(dataObject);

                this._objectCreator(dataObject);
                newIds.push(objectId);

                // resubscribe if the object requires an explicit subscription
                object = this._collection[objectId];
                if (this.handlesItemRefresh && object.explicitSubscription) {
                    object._subscribeNode({
                        error: this._createErrorNotifier(object)
                    });
                }
            }

            // now clean up items (if any) that were removed
            for (objectId in this._collection) {
                if (this._collection.hasOwnProperty(objectId)) {
                    foundFlag = false;
                    for (i = newIds.length - 1; i >= 0; i -= 1) {
                        if (newIds[i] === objectId) {
                            foundFlag = true;
                            break;
                        }
                    }
                    // did not find in updated list, so delete it
                    if (!foundFlag) {
                        this._objectDeleter({'data': this._collection[objectId]._data});
                    }
                }
            }
        },

         /**
          * The actual refresh operation, refactored out so we don't have to repeat code
          * @private
          */
        _RESTRefresh: function () {
            var _this = this;
            this._doGET({
                success: function(rsp) {
                    if (_this._processResponse(rsp)) {
                        _this._buildRefreshedCollection(_this._data);
                    } else {
                        _this._errorNotifier.notifyListeners(_this);
                    }
                },
                error: function(rsp) {
                    _this._errorNotifier.notifyListeners(rsp);
                }
            });            
        },

        /**
         * Force an update on this object. Since an asynchronous GET is performed,
         * it is necessary to have an onChange handler registered in order to be
         * notified when the response of this returns.
         * @returns {finesse.restservices.RestBaseCollection}
         *     This RestBaseCollection object to allow cascading
         */
         refresh: function() {
            var _this = this, isLoaded = this._loaded;

            // resubscribe if the collection requires an explicit subscription
            if (this.explicitSubscription) {
                this._subscribeNode({
                    success: function () {
                        _this._RESTRefresh();
                    },
                    error: function (err) {
                        _this._errorNotifier.notifyListeners(err);
                    }
                });
            } else {
                this._RESTRefresh();
            }

            return this; // Allow cascading
         },

        /**
         * @private
         * The _addHandlerCb and _deleteHandlerCb require that data be passed in the
         * format of an array of {(Object Type): object} objects. For example, a
         * queues object would return [{Queue: queue1}, {Queue: queue2}, ...].
         * @param skipOuterObject If {true} is passed in for this param, then the "data"
         *                           property is returned instead of an object with the
         *                           data appended.
         * @return {Array}
         */
        extractCollectionData: function (skipOuterObject) {
            var restObjs,
            obj,
            result = [],
            _this = this;
            
            if (this._data)
            {
                restObjs = this._data[this.getRestItemType()];
    
                if (restObjs)
                {
                    // check if there are multiple objects to pass
                    if (!$.isArray(restObjs))
                    {
                        restObjs = [restObjs];
                    }
    
                    // if so, create an object for each and add to result array
                    $.each(restObjs, function (id, object) {
                        if (skipOuterObject === true)
                        {
                            obj = object;
                        }
                        else
                        {
                            obj = {};
                            obj[_this.getRestItemType()] = object;
                        }
                        result.push(obj);
                    });
                }
                
            }
            
            return result;
        },

        /**
         * For Finesse, collections are handled uniquely on a POST and
         * doesn't necessary follow REST conventions. A POST on a collection
         * doesn't mean that the collection has been created, it means that an
         * item has been added to the collection. This function will generate
         * a closure which will handle this logic appropriately.
         * @param {Object} scope
         *     The scope of where the callback should be invoked.
         * @private
         */
        _addHandlerCb: function (scope) {
            return function (restItem) {
                var data = restItem.extractCollectionData();               

                $.each(data, function (id, object) {
                    scope._objectCreator(object);
                });
            };
        },

        /**
         * For Finesse, collections are handled uniquely on a DELETE and
         * doesn't necessary follow REST conventions. A DELETE on a collection
         * doesn't mean that the collection has been deleted, it means that an
         * item has been deleted from the collection. This function will generate
         * a closure which will handle this logic appropriately.
         * @param {Object} scope
         *     The scope of where the callback should be invoked.
         * @private
         */
        _deleteHandlerCb: function (scope) {
            return function (restItem) {
                var data = restItem.extractCollectionData();

                $.each(data, function (id, obj) {
                    scope._objectDeleter(obj);
                });
            };
        },

        /**
         * Utility method to process the update notification for Rest Items
         * that are children of the collection whose events are published to
         * the collection's node.
         * @param {Object} update
         *     The payload of an update notification.
         * @returns {Boolean}
         *     True if the update was successfully processed (the update object
         *     passed the schema validation) and updated the internal data cache,
         *     false otherwise.
         * @private
         */
        _processRestItemUpdate: function (update) {
            var object, objectId, updateObj = update.object.Update;

            //Extract the ID from the source if the Update was an error.
            if (updateObj.data.apiErrors) {
                objectId = Utilities.getId(updateObj.source);
            }
            //Otherwise extract from the data object itself.
            else {
                objectId = this._extractId(updateObj.data);
            }

            object = this._collection[objectId];
            if (object) {
                if (object._processUpdate(update)) {
                    switch (updateObj.event) {
                    case "POST":
                        object._addNotifier.notifyListeners(object);
                        break;
                    case "PUT":
                        object._changeNotifier.notifyListeners(object);
                        break;
                    case "DELETE":
                        object._deleteNotifier.notifyListeners(object);
                        break;
                    }
                }
            }
        },

        /**
         * SUBCLASS IMPLEMENTATION (override):
         * For collections, this callback has the additional responsibility of passing events
         * of collection item updates to the item objects themselves. The collection needs to
         * do this because item updates are published to the collection's node.
         * @returns {Function}
         *     The callback to be invoked when an update event is received
         * @private
         */
        _createPubsubCallback: function () {
            var _this = this;
            return function (update) {
                //If the source of the update is our REST URL, this means the collection itself is modified
                if (update.object.Update.source === _this.getRestUrl()) {
                    _this._updateEventHandler(_this, update);
                } else {
                    //Otherwise, it is safe to assume that if we got an event on our topic, it must be a
                    //rest item update of one of our children that was published on our node (OpenAjax topic)
                    _this._processRestItemUpdate(update);
                }
            };
        },

        /**
         * @class
         * This is the base collection object. 
         *
         * @constructs
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.Contacts
         * @see finesse.restservices.Dialogs
         * @see finesse.restservices.PhoneBooks
         * @see finesse.restservices.Queues
         * @see finesse.restservices.WorkflowActions
         * @see finesse.restservices.Workflows
         * @see finesse.restservices.WrapUpReasons
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
       /**
         * @private
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onCollectionAdd(this): (optional)</b> when an object is added to this collection</li>
         *         <li><b>onCollectionDelete(this): (optional)</b> when an object is removed from this collection</li>
         *         <li><b>onLoad(this): (optional)</b> when the collection is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the collection is received. 
         *         This does not include adding and deleting members of the collection</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the collection is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the collection is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the collection fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {

            options = options || {};
            options.id = "";

            //Make internal datastore collection to hold a list of objects.
            this._collection = {};
            this.length = 0;

            //Collections will have additional callbacks that will be invoked when
            //an item has been added/deleted.
            this._collectionAddNotifier = new Notifier();
            this._collectionDeleteNotifier = new Notifier();

            //Initialize the base class.
            this._super(options);

            this.addHandler('collectionAdd', options.onCollectionAdd);
            this.addHandler('collectionDelete', options.onCollectionDelete);

            //For Finesse, collections are handled uniquely on a POST/DELETE and
            //doesn't necessary follow REST conventions. A POST on a collection
            //doesn't mean that the collection has been created, it means that an
            //item has been added to the collection. A DELETE means that an item has
            //been removed from the collection. Due to this, we are attaching
            //special callbacks to the add/delete that will handle this logic.
            this.addHandler("add", this._addHandlerCb(this));
            this.addHandler("delete", this._deleteHandlerCb(this));
        },

        /**
         * Returns the collection.
         * @returns {Object}
         *     The collection as an object
         */
        getCollection: function () {
            //TODO: is this safe? or should we instead return protected functions such as .each(function)?
            return this._collection;
        },

        /**
         * Utility method to build the internal collection data structure (object) based on provided data
         * @param {Object} data
         *     The data to build the internal collection from
         * @private
         */
        _buildCollection: function (data) {
            var i, object, objectId, dataArray;
            if (data && this.getProperty(data, this.getRestItemType()) !== null) {
                dataArray = Utilities.getArray(this.getProperty(data, this.getRestItemType()));
                for (i = 0; i < dataArray.length; i += 1) {

                    object = {};
                    object[this.getRestItemType()] = dataArray[i];
                    objectId = this._extractId(object);
                    this._collection[objectId] = new (this.getRestItemClass())({
                        doNotSubscribe: this.handlesItemSubscription,
                        doNotRefresh: this.handlesItemRefresh,
                        id: objectId,
                        data: object
                    });
                    this.length += 1;
                }
            }
        },

        /**
         * Called to know whether to include an item in the _collection and _data. Return false to keep it, true to filter out (discard) it.
         * Override this in subclasses if you need only object with certain attribute values.
         * @param  {Object} item Item to test.
         * @return {Boolean} False to keep, true to filter out (discard);
         */
        _filterOutItem: function (item) {
            return false;
        },
    
        /**
         * Validate and store the object into the internal data store.
         * SUBCLASS IMPLEMENTATION (override):
         * Performs collection specific logic to _buildCollection internally based on provided data
         * @param {Object} object
         *     The JavaScript object that should match of schema of this REST object.
         * @returns {Boolean}
         *     True if the object was validated and stored successfully.
         * @private
         */
        _processObject: function (object) {
            var i,
                restItemType = this.getRestItemType(),
                items;
            if (this._validate(object)) {
                this._data = this.getProperty(object, this.getRestType()); // Should clone the object here?
    
                // If a subclass has overriden _filterOutItem then we'll need to run through the items and remove them
                if (this._data)
                {
                    items = this._data[restItemType];
    
                    if (typeof(items) !== "undefined")
                    {
                        if (typeof(items.length) === "undefined")
                        {
                            // Single object
                            if (this._filterOutItem(items))
                            {
                                this._data[restItemType] = items = [];
                            }
                            
                        }
                        else
                        {
                            // filter out objects
                            for (i = items.length - 1; i !== -1; i = i - 1)
                            {
                                if (this._filterOutItem(items[i]))
                                {
                                    items.splice(i, 1);
                                }
                            }
                        }
                    }
                }
    
                // If loaded for the first time, call the load notifiers.
                if (!this._loaded) {
                    this._buildCollection(this._data);
                    this._loaded = true;
                    this._loadNotifier.notifyListeners(this);
                }
                
                return true;
                
            }
            return false;
        },

        /**
         * Retrieves a reference to a particular notifierType.
         * @param {String} notifierType
         *      Specifies the notifier to retrieve (load, change, error, add, delete)
         * @return {Notifier} The notifier object.
         */
        _getNotifierReference: function (notifierType) {
            var notifierReference;

            try {
                //Use the base method to get references for load/change/error.
                notifierReference = this._super(notifierType);
            } catch (err) {
                //Check for add/delete
                if (notifierType === "collectionAdd") {
                    notifierReference = this._collectionAddNotifier;
                } else if (notifierType === "collectionDelete") {
                    notifierReference = this._collectionDeleteNotifier;
                } else {
                    //Rethrow exception from base class.
                    throw err;
                }
            }
            return notifierReference;
        }
    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.RestCollectionBase = RestCollectionBase;
    
    return RestCollectionBase;
}));

/**
 * JavaScript representation of the Finesse Dialog object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Dialog', ['restservices/RestBase',
                 'utilities/Utilities'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase, finesse.utilities.Utilities);
    } 
}(function (RestBase, Utilities) {
	var Dialog = RestBase.extend(/** @lends finesse.restservices.Dialog.prototype */{

        /**
         * @class
         * A Dialog is an attempted connection between or among multiple participants,
         * for example, a regular phone call, a conference, or a silent monitor session.
         * 
         * @augments finesse.restservices.RestBase
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Dialog class.
         * @returns {Object} The Dialog class.
         */
        getRestClass: function () {
            return Dialog;
        },
        
        /**
         * @private
         * The constant for agent device.
         */
        _agentDeviceType: "AGENT_DEVICE",
        
        /**
         * @private
         * Gets the REST type for the current object - this is a "Dialog".
         * @returns {String} The Dialog string.
         */
        getRestType: function () {
            return "Dialog";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the from address.
         * @returns {String} The from address.
         */
        getFromAddress: function () {
            this.isLoaded();
            return this.getData().fromAddress;
        },

        /**
         * Getter for the to address.
         * @returns {String} The to address.
         */
        getToAddress: function () {
            this.isLoaded();
            return this.getData().toAddress;
        },
        
        /**
         * Getter for the media type.
         * @returns {String} The media type.
         */
        getMediaType: function () {
            this.isLoaded();
            return this.getData().mediaType;
        },
        
        /**
         * @private
         * Getter for the uri.
         * @returns {String} The uri.
         */
        getDialogUri: function () {
            this.isLoaded();
            return this.getData().uri;
        },

        /**
         * Getter for the callType.
         * @deprecated Use getMediaProperties().callType instead.
         * @returns {String} The callType.
         */
        getCallType: function () {
            this.isLoaded();
            return this.getData().mediaProperties.callType;
        },

        /**
         * Getter for the DNIS. This is usually the actual number dialed.
         * @deprecated Use getMediaProperties().DNIS instead.
         * @returns {String} The callType.
         */
        getDNIS: function () {
            this.isLoaded();
            return this.getData().mediaProperties.DNIS;
        },
        
        /**
         * Getter for the Dialog state.
         * @returns {String} The Dialog state.
         */
        getState: function () {
            this.isLoaded();
            return this.getData().state;
        },

        /**
         * Retrieves a list of participants within the Dialog object.
         * @returns {Object} Array list of participants.
         */
        getParticipants: function () {
            this.isLoaded();
            var participants = this.getData().participants.Participant;
            //Due to the nature of the XML->JSO converter library, a single
            //element in the XML array will be considered to an object instead of
            //a real array. This will handle those cases to ensure that an array is
            //always returned.

            return Utilities.getArray(participants);
        },

       /**
         * gets the participant timer counters 
         *
         * @param {String} participantExt Extension of participant.
         * @returns {Object} which contains state, startTime, and stateChangeTime fields
         */
        getParticipantTimerCounters : function (participantExt) {
          var part, participantTimerCounters = {}, idx, participants;
          
          participants = this.getParticipants();


          //Loop through all the participants and find the right participant (based on participantExt)
          for(idx=0;idx<participants.length;idx=idx+1)
          {
            part = participants[idx];
            
            if (part.mediaAddress === participantExt)
            {
                participantTimerCounters.startTime= part.startTime;
                participantTimerCounters.stateChangeTime= part.stateChangeTime;
                participantTimerCounters.state= part.state;
                break;
            }
          }
          
          return participantTimerCounters;
        },
        
        /**
         * Determines the droppable participants.  A droppable participant is a participant that is an agent extension.   
         * (It is not a CTI Route Point, IVR Port, or the caller)
         * 
         * @param {String} filterExtension used to remove a single extension from the list
         * @returns {Array} Participants which is an array of all participants which can be dropped.
         */
        getDroppableParticipants: function (filterExtension) {
          this.isLoaded();
          var droppableParticipants = [], participants, index, idx, filterExtensionToRemove = "", callStateOk, part;

          participants = this.getParticipants();

          if (filterExtension)
          {
            filterExtensionToRemove = filterExtension;
          }

          //Loop through all the participants to remove non-agents & remove filterExtension
          //We could have removed filterExtension using splice, but we have to iterate through
          //the list anyway.
          for(idx=0;idx<participants.length;idx=idx+1)
          {
            part = participants[idx];

            //Skip the filterExtension
            if (part.mediaAddress !== filterExtensionToRemove)
            {
                callStateOk = this._isParticipantStateDroppable(part);

                //Remove non-agents & make sure callstate 
                if (callStateOk === true && part.mediaAddressType === this._agentDeviceType)
                {
                  droppableParticipants.push(part);
                }
            }
        }

        return Utilities.getArray(droppableParticipants);
        },

        _isParticipantStateDroppable : function (part)
        {
          var isParticipantStateDroppable = false;
          if (part.state === Dialog.ParticipantStates.ACTIVE || part.state === Dialog.ParticipantStates.ACCEPTED || part.state === Dialog.ParticipantStates.HELD)
          {
            isParticipantStateDroppable = true;
          }
          
          return isParticipantStateDroppable;
        },
        
        /**
         * Is the participant droppable
         *
         * @param {String} participantExt Extension of participant.
         * @returns {Boolean} True is droppable.
         */
        isParticipantDroppable : function (participantExt) {
          var droppableParticipants = null, isDroppable = false, idx, part, callStateOk;
          
          droppableParticipants = this.getDroppableParticipants();
          
          if (droppableParticipants) 
          {
            for(idx=0;idx<droppableParticipants.length;idx=idx+1)
            {
              part = droppableParticipants[idx];
             
              if (part.mediaAddress === participantExt)
              {
                callStateOk = this._isParticipantStateDroppable(part);

                //Remove non-agents & make sure callstate 
                if (callStateOk === true && part.mediaAddressType === this._agentDeviceType)
                {
                  isDroppable = true;
                  break;
                }
              }
            }
          }
          
          return isDroppable;
        },
        
        /**
         * Retrieves a list of media properties from the dialog object.
         * @returns {Object} Map of call variables; names mapped to values.
         * Variables may include the following:<ul>
         * <li>dialedNumber: The number dialed.
         * <li>callType: The type of call. Call types include:<ul>
         *     <li>ACD_IN
         *     <li>PREROUTE_ACD_IN
         *     <li>PREROUTE_DIRECT_AGENT
         *     <li>TRANSFER
         *     <li>OTHER_IN
         *     <li>OUT
         *     <li>AGENT_INSIDE
         *     <li>CONSULT
         *     <li>CONFERENCE
         *     <li>SUPERVISOR_MONITOR
         *     <li>OUTBOUND
         *     <li>OUTBOUND_PREVIEW</ul>
         * <li>DNIS: The DNIS provided. For routed calls, this is the route point.
         * <li>wrapUpReason: A description of the call.
         * <li>Call Variables, by name.  The name indicates whether it is a call variable or ECC variable.
         * Call variable names start with callVariable#, where # is 1-10. ECC variable names (both scalar and array) are prepended with "user".
         * ECC variable arrays include an index enclosed within square brackets located at the end of the ECC array name.
         * <li>The following call variables provide additional details about an Outbound Option call:<ul>
         *     <li>BACampaign
         *     <li>BAAccountNumber
         *     <li>BAResponse
         *     <li>BAStatus<ul>
         *         <li>PREDICTIVE_OUTBOUND: A predictive outbound call.
         *         <li>PROGRESSIVE_OUTBOUND: A progressive outbound call.
         *         <li>PREVIEW_OUTBOUND_RESERVATION: Agent is reserved for a preview outbound call.
         *         <li>PREVIEW_OUTBOUND: Agent is on a preview outbound call.</ul>
         *     <li>BADialedListID
         *     <li>BATimeZone
         *     <li>BABuddyName</ul></ul>
         *     
         */
        getMediaProperties: function () {
            var mpData, currentMediaPropertiesMap, thisMediaPropertiesJQuery;

            this.isLoaded();
            
            // We have to convert to jQuery object to do a proper compare
            thisMediaPropertiesJQuery = jQuery(this.getData().mediaProperties);
            
            if ((this._lastMediaPropertiesJQuery !== undefined) 
                    && (this._lastMediaPropertiesMap !== undefined) 
                    && (this._lastMediaPropertiesJQuery.is(thisMediaPropertiesJQuery))) {

                    return this._lastMediaPropertiesMap;
            }
            
            currentMediaPropertiesMap = {};

            mpData = this.getData().mediaProperties;

            if (mpData) {
                if (mpData.callvariables && mpData.callvariables.CallVariable) {
                    jQuery.each(mpData.callvariables.CallVariable, function (i, callVariable) {
			currentMediaPropertiesMap[callVariable.name] = callVariable.value;
                    });
                }

                jQuery.each(mpData, function (key, value) {
                    if (key !== 'callvariables') {
			currentMediaPropertiesMap[key] = value;
                    }
                });
            }
            
            this._lastMediaPropertiesMap = currentMediaPropertiesMap;
            this._lastMediaPropertiesJQuery = thisMediaPropertiesJQuery;

            return this._lastMediaPropertiesMap;
        },

        /**
         * Retrieves information about the currently scheduled callback, if any.
         * @returns {Object} If no callback has been set, will return undefined. If 
         * a callback has been set, it will return a map with one or more of the 
         * following entries, depending on what values have been set. 
         *    callbackTime   - the callback time, if it has been set.
         *    callbackNumber - the callback number, if it has been set.
         */
        getCallbackInfo: function() {
            this.isLoaded();
            return this.getData().scheduledCallbackInfo;
        },

        /**
         * @private
         * Invoke a request to the server given a content body and handlers.
         *
         * @param {Object} contentBody
         *     A JS object containing the body of the action request.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        _makeRequest: function (contentBody, handlers) {
            // Protect against null dereferencing of options allowing its
            // (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            });
        },

        /**
         * Invoke a consult call out to a destination.
         *
         * @param {String} mediaAddress
         *     The media address of the user performing the consult call.
         * @param {String} toAddress
         *     The destination address of the consult call.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        makeConsultCall: function (mediaAddress, toAddress, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "toAddress": toAddress,
                "requestedAction": Dialog.Actions.CONSULT_CALL
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },
        
        /**
         * Invoke a single step transfer request.
         *
         * @param {String} mediaAddress
         *     The media address of the user performing the single step transfer.
         * @param {String} toAddress
         *     The destination address of the single step transfer.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        initiateDirectTransfer: function (mediaAddress, toAddress, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "toAddress": toAddress,
                "requestedAction": Dialog.Actions.TRANSFER_SST
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },

        /**
         * Update this dialog's wrap-up reason.
         *
         * @param {String} wrapUpReason
         *     The new wrap-up reason for this dialog
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        updateWrapUpReason: function (wrapUpReason, options)
        {
            this.isLoaded();
            var mediaProperties =
            {
                "wrapUpReason": wrapUpReason
            };

            options = options || {};
            options.content = {};
            options.content[this.getRestType()] =
            {
                "mediaProperties": mediaProperties,
                "requestedAction": Dialog.Actions.UPDATE_CALL_DATA
            };
            options.method = "PUT";
            this.restRequest(this.getRestUrl(), options);

            return this;
        },

        /**
         * Invoke a request to server based on the action given.
         * @param {String} mediaAddress
         *     The media address of the user performing the action.
         * @param {finesse.restservices.Dialog.Actions} action
         *     The action string indicating the action to invoke on dialog.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        requestAction: function (mediaAddress, action, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "requestedAction": action
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },
        
        /**
         * Wrapper around "requestAction" to request PARTICIPANT_DROP action.
         *
         * @param targetMediaAddress is the address to drop
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        dropParticipant: function (targetMediaAddress, handlers) {
            this.requestAction(targetMediaAddress, Dialog.Actions.PARTICIPANT_DROP, handlers);
        },
        
        /**
         * Invoke a request to server to send DTMF digit tones.
         * @param {String} mediaAddress
         * @param {String} action
         *     The action string indicating the action to invoke on dialog.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        sendDTMFRequest: function (mediaAddress, handlers, digit) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "requestedAction": "SEND_DTMF",
                "actionParams": {
                    "ActionParam": {
                        "name": "dtmfString",
                        "value": digit
                    }
                }
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },

        /**
         * Invoke a request to server to set the time for a callback.
         * @param {String} mediaAddress
         * @param {String} callbackTime 
         *     The requested time for the callback, in YYYY-MM-DDTHH:MM format
         *     (ex: 2013-12-24T23:59)
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        updateCallbackTime: function (mediaAddress, callbackTime, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "requestedAction": Dialog.Actions.UPDATE_SCHEDULED_CALLBACK,
                "actionParams": {
                    "ActionParam": {
                        "name": "callbackTime",
                        "value": callbackTime
                    }
                }
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },

        /**
         * Invoke a request to server to set the number for a callback.
         * @param {String} mediaAddress
         * @param {String} callbackNumber
         *     The requested number to call for the callback
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        updateCallbackNumber: function (mediaAddress, callbackNumber, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "requestedAction": Dialog.Actions.UPDATE_SCHEDULED_CALLBACK,
                "actionParams": {
                    "ActionParam": {
                        "name": "callbackNumber",
                        "value": callbackNumber
                    }
                }
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },

        /**
         * Invoke a request to server to cancel a callback.
         * @param {String} mediaAddress
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        cancelCallback: function (mediaAddress, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "requestedAction": Dialog.Actions.CANCEL_SCHEDULED_CALLBACK
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        },

        /**
         * Invoke a request to server to reclassify the call type.
         * @param {String} mediaAddress
         * @param {String} callbackNumber
         *     The requested number to call for the callback
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        reclassifyCall: function (mediaAddress, classification, handlers) {
            this.isLoaded();
            var contentBody = {};
            contentBody[this.getRestType()] = {
                "targetMediaAddress": mediaAddress,
                "requestedAction": Dialog.Actions.RECLASSIFY,
                "actionParams": {
                    "ActionParam": {
                        "name": "outboundClassification",
                        "value": classification
                    }
                }
            };
            this._makeRequest(contentBody, handlers);
            return this; // Allow cascading
        }       


    });

    Dialog.Actions = /** @lends finesse.restservices.Dialog.Actions.prototype */ {
            /**
             * Drops the Participant from the Dialog.
             */
            DROP: "DROP",
            /**
             * Answers a Dialog.
             */
            ANSWER: "ANSWER",
            /**
             * Holds the Dialog.
             */
            HOLD: "HOLD",
            /**
             * Barges into a Call Dialog.
             */
            BARGE_CALL: "BARGE_CALL",
            /**
             * Allow as Supervisor to Drop a Participant from the Dialog.
             */
            PARTICIPANT_DROP: "PARTICIPANT_DROP",
            /**
             * Makes a new Call Dialog.
             */
            MAKE_CALL: "MAKE_CALL",
            /**
             * Retrieves a Dialog that is on Hold.
             */
            RETRIEVE: "RETRIEVE",
            /**
             * Sets the time or number for a callback. Can be
             * either a new callback, or updating an existing one.
             */
            UPDATE_SCHEDULED_CALLBACK: "UPDATE_SCHEDULED_CALLBACK",
            /**
             * Cancels a callback.
             */
            CANCEL_SCHEDULED_CALLBACK: "CANCEL_SCHEDULED_CALLBACK",
            /**
             * Initiates a Consult Call.
             */
            CONSULT_CALL: "CONSULT_CALL",
            /**
             * Initiates a Transfer of a Dialog.
             */
            TRANSFER: "TRANSFER",
            /**
             * Initiates a Single-Step Transfer of a Dialog.
             */
            TRANSFER_SST: "TRANSFER_SST",
            /**
             * Initiates a Conference of a Dialog.
             */
            CONFERENCE: "CONFERENCE",
            /**
             * Changes classification for a call
             */
            RECLASSIFY: "RECLASSIFY", 
            /**
             * Updates data on a Call Dialog.
             */
            UPDATE_CALL_DATA: "UPDATE_CALL_DATA",
            /**
             * Initiates a Recording on a Call Dialog.
             */
            START_RECORDING : "START_RECORDING",
            /**
             * Sends DTMF (dialed digits) to a Call Dialog.
             */
            DTMF : "SEND_DTMF",            
            /**
             * Accepts a Dialog that is being Previewed.
             */
            ACCEPT: "ACCEPT",
            /**
             * Rejects a Dialog.
             */
            REJECT: "REJECT",
            /**
             * Closes a Dialog.
             */
            CLOSE : "CLOSE",
            /**
             * @class Set of action constants for a Dialog.  These should be used for
             * {@link finesse.restservices.Dialog#requestAction}.
             * @constructs
             */
            _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
        };  

    Dialog.States = /** @lends finesse.restservices.Dialog.States.prototype */ {
       /**
         * Indicates that the call is ringing at a device.
         */
        ALERTING: "ALERTING",
        /**
         * Indicates that the phone is off the hook at a device.
         */
        INITIATING: "INITIATING",
        /**
         * Indicates that the dialog has a least one active participant.
         */
        ACTIVE: "ACTIVE",
        /**
         * Indicates that the dialog has no active participants.
         */
        DROPPED: "DROPPED",
        /**
         * Indicates that the phone is dialing at the device.
         */
        INITIATED: "INITIATED",
        /**
         * Indicates that the dialog has failed.
         * @see Dialog.ReasonStates
         */
        FAILED: "FAILED",
        /**
         * Indicates that the user has accepted an OUTBOUND_PREVIEW dialog.
         */
        ACCEPTED: "ACCEPTED",
        /**
         * @class Possible Dialog State constants.
         * The State flow of a typical in-bound Dialog is as follows: INITIATING, INITIATED, ALERTING, ACTIVE, DROPPED.
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
    };

    Dialog.ParticipantStates = /** @lends finesse.restservices.Dialog.ParticipantStates.prototype */ {
        /**
          * Indicates that an incoming call is ringing on the device.
          */
         ALERTING: "ALERTING",
         /**
          * Indicates that an outgoing call, not yet active, exists on the device.
          */
         INITIATING: "INITIATING",
         /**
          * Indicates that the participant is active on the call.
          */
         ACTIVE: "ACTIVE",
         /**
          * Indicates that the participant has dropped from the call.
          */
         DROPPED: "DROPPED",
         /**
          * Indicates that the participant has held their connection to the call.
          */
         HELD: "HELD",
         /**
          * Indicates that the phone is dialing at a device.
          */
         INITIATED: "INITIATED",
         /**
          * Indicates that the call failed.
          * @see Dialog.ReasonStates
          */
         FAILED: "FAILED",
         /**
          * Indicates that the participant is not in active state on the call, but is wrapping up after the participant has dropped from the call.
          */
         WRAP_UP: "WRAP_UP",
         /**
          * Indicates that the participant has accepted the dialog.  This state is applicable to OUTBOUND_PREVIEW dialogs.
          */
         ACCEPTED: "ACCEPTED",
         /**
          * @class Possible Dialog Participant State constants.
          * @constructs
          */
         _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
     };

    Dialog.ReasonStates = /** @lends finesse.restservices.Dialog.ReasonStates.prototype */ {
       /**
        * Dialog was Busy.  This will typically be for a Failed Dialog.
        */
        BUSY: "BUSY",
        /**
         * Dialog reached a Bad Destination.  This will typically be for a Failed Dialog.
         */
        BAD_DESTINATION: "BAD_DESTINATION",
        /**
         * All Other Reasons.  This will typically be for a Failed Dialog.
         */
        OTHER: "OTHER",
        /**
         * The Device Resource for the Dialog was not available.
         */
        DEVICE_RESOURCE_NOT_AVAILABLE : "DEVICE_RESOURCE_NOT_AVAILABLE",
        /**
         * @class Possible dialog state reasons code constants.
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
    };
   
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Dialog = Dialog;
    
    
    return Dialog;
}));

/**
 * JavaScript representation of the Finesse Dialogs collection
 * object which contains a list of Dialog objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Dialogs', ['restservices/RestCollectionBase',
                 'restservices/Dialog'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.Dialog);
    } 
}(function (RestCollectionBase, Dialog) {
    var Dialogs = RestCollectionBase.extend(/** @lends finesse.restservices.Dialogs.prototype */{

        /**
         * @class
         * JavaScript representation of a Dialogs collection object. Also exposes
         * methods to operate on the object against the server.
         * @augments finesse.restservices.RestCollectionBase
         * @constructs
         * @see finesse.restservices.Dialog
         * @example
         *  _dialogs = _user.getDialogs( {
         *      onCollectionAdd : _handleDialogAdd,
         *      onCollectionDelete : _handleDialogDelete,
         *      onLoad : _handleDialogsLoaded
         *  });
         *  
         * _dialogCollection = _dialogs.getCollection();
         * for (var dialogId in _dialogCollection) {
         *     if (_dialogCollection.hasOwnProperty(dialogId)) {
         *         _dialog = _dialogCollection[dialogId];
         *         etc...
         *     }
         * }
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Dialogs class.
         */
        getRestClass: function () {
            return Dialogs;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the Dialog class.
         */
        getRestItemClass: function () {
            return Dialog;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Dialogs".
         */
        getRestType: function () {
            return "Dialogs";
        },

        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "Dialogs".
         */
        getRestItemType: function () {
            return "Dialog";
        },

        /**
         * @private
         * Override default to indicates that the collection doesn't support making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection subscribes to its objects.
         */
        supportsRestItemSubscriptions: true,

        /**
         * @private
         * Create a new Dialog in this collection
         *
         * @param {String} toAddress
         *     The to address of the new Dialog
         * @param {String} fromAddress
         *     The from address of the new Dialog
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the (optional) handlers for the request.
         * @return {finesse.restservices.Dialogs}
         *     This Dialogs object, to allow cascading.
         */
        createNewCallDialog: function (toAddress, fromAddress, handlers)
        {
            var contentBody = {};
            contentBody[this.getRestItemType()] = {
                "requestedAction": "MAKE_CALL",
                "toAddress": toAddress,
                "fromAddress": fromAddress
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            });
            return this; // Allow cascading
        },

        /**
         * @private
         * Create a new Dialog in this collection as a result of a requested action
         *
         * @param {String} toAddress
         *     The to address of the new Dialog
         * @param {String} fromAddress
         *     The from address of the new Dialog
         * @param {finesse.restservices.Dialog.Actions} actionType
         *     The associated action to request for creating this new dialog
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the (optional) handlers for the request.
         * @return {finesse.restservices.Dialogs}
         *     This Dialogs object, to allow cascading.
         */
        createNewSuperviseCallDialog: function (toAddress, fromAddress, actionType, handlers)
        {
            var contentBody = {};
            this._isLoaded = true;

            contentBody[this.getRestItemType()] = {
                "requestedAction": actionType,
                "toAddress": toAddress,
                "fromAddress": fromAddress
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            });
            return this; // Allow cascading
        },
        
        /**
         * @private
         * Create a new Dialog in this collection as a result of a requested action
         * @param {String} fromAddress
         *     The from address of the new Dialog
         * @param {String} toAddress
         *     The to address of the new Dialog
         * @param {finesse.restservices.Dialog.Actions} actionType
         *     The associated action to request for creating this new dialog
         * @param {String} dialogUri
         *     The associated uri of SUPERVISOR_MONITOR call
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the (optional) handlers for the request.
         * @return {finesse.restservices.Dialogs}
         *     This Dialogs object, to allow cascading.
         */
        createNewBargeCall: function (fromAddress, toAddress, actionType, dialogURI, handlers) {
            this.isLoaded();
         
            var contentBody = {};
            contentBody[this.getRestItemType()] = {
                "fromAddress": fromAddress,
                "toAddress": toAddress,
                "requestedAction": actionType,
                "associatedDialogUri": dialogURI
                
            };
            // (nonexistent) keys to be read as undefined
            handlers = handlers || {};  
            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            });
            return this; // Allow cascading
        },

        /**
         * Utility method to get the number of dialogs in this collection.
         * 'excludeSilentMonitor' flag is provided as an option to exclude calls with type
         * 'SUPERVISOR_MONITOR' from the count.
         * @param  {Boolean} excludeSilentMonitor If true, calls with type of 'SUPERVISOR_MONITOR' will be excluded from the count.
         * @return {Number} The number of dialogs in this collection.
         */
        getDialogCount: function (excludeSilentMonitor) {
            this.isLoaded();

            var dialogId, count = 0;
            if (excludeSilentMonitor) {
                for (dialogId in this._collection) {
                    if (this._collection.hasOwnProperty(dialogId)) {
                        if (this._collection[dialogId].getCallType() !== 'SUPERVISOR_MONITOR') {
                            count += 1;
                        }
                    }
                }

                return count;
            } else {
                return this.length;
            }        
        }

    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Dialogs = Dialogs;
    
    return Dialogs;
}));

/**
 * JavaScript representation of the Finesse ClientLog object
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/** @private */
/*global finesse*/

(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/ClientLog',["restservices/RestBase"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    }
    
}(function (RestBase) {
    
    var ClientLog = RestBase.extend(/** @lends finesse.restservices.ClientLog.prototype */{    
        /**
         * @private
         * Returns whether this object supports transport logs
         */
        doNotLog : true,

        doNotRefresh: true,
        
        explicitSubscription : true,
        
        /**
         * @class
         * @private
         * JavaScript representation of a ClientLog object. Also exposes methods to operate
         * on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         * @augments finesse.restservices.RestBase
         **/
        init: function (options) {
            this._super({
                id: "", 
                data: {clientLog : null},
                onAdd: options.onAdd,
                onChange: options.onChange,
                onLoad: options.onLoad,
                onError: options.onError,
                parentObj: options.parentObj
                });
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the ClientLog object.
         */
        getRestClass: function () {
            return ClientLog;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "ClientLog".
         */
        getRestType: function ()
        {
            return "ClientLog";
        },
        
        /**
         * @private
         * Gets the node path for the current object
         * @returns {String} The node path
         */
        getXMPPNodePath: function () {
            return this.getRestUrl();
        },
           
        /**
         * @private
         * Invoke a request to the server given a content body and handlers.
         *
         * @param {Object} contentBody
         *     A JS object containing the body of the action request.
         * @param {Object} handlers
         *     An object containing the following (optional) handlers for the request:<ul>
         *         <li><b>success(rsp):</b> A callback function for a successful request to be invoked with the following
         *         response object as its only parameter:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li></ul>
         *         <li>A error callback function for an unsuccessful request to be invoked with the
         *         error response object as its only parameter:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response (HTTP errors)</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul>
         */
        sendLogs: function (contentBody, handlers) {
            // Protect against null dereferencing of options allowing its
            // (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                //success: handlers.success,
                error: handlers.error,
                content: contentBody
            });
        }
    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.ClientLog = ClientLog;
    
    return ClientLog;
}));

/**
 * JavaScript representation of the Finesse Queue object
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
 (function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Queue', ['restservices/RestBase',
                 'utilities/Utilities'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase, finesse.utilities.Utilities);
    } 
}(function (RestBase, Utilities) {
	var Queue = RestBase.extend(/** @lends finesse.restservices.Queue.prototype */{

        /**
         * @class
         * A Queue is a list of Contacts available to a User for quick dial.
         * 
         * @augments finesse.restservices.RestBase
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
		/**
		 * @private
		 * JavaScript representation of a Queue object. Also exposes methods to operate
		 * on the object against the server.
		 *
		 * @constructor
		 * @param {String} id
		 *     Not required...
		 * @param {Object} callbacks
		 *     An object containing callbacks for instantiation and runtime
		 * @param {Function} callbacks.onLoad(this)
		 *     Callback to invoke upon successful instantiation
		 * @param {Function} callbacks.onLoadError(rsp)
		 *     Callback to invoke on instantiation REST request error
		 *     as passed by finesse.clientservices.ClientServices.ajax()
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response
		 *         error: {Object} Wrapped exception that was caught
		 *         error.errorType: {String} Type of error that was caught
		 *         error.errorMessage: {String} Message associated with error
		 *     }
		 * @param {Function} callbacks.onChange(this)
		 *     Callback to invoke upon successful update
		 * @param {Function} callbacks.onError(rsp)
		 *     Callback to invoke on update error (refresh or event)
		 *     as passed by finesse.clientservices.ClientServices.ajax()
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response
		 *         error: {Object} Wrapped exception that was caught
		 *         error.errorType: {String} Type of error that was caught
		 *         error.errorMessage: {String} Message associated with error
		 *     }
		 *  
		 */
        init: function (id, callbacks, restObj) {
            this._super(id, callbacks, restObj);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Queue object.
         */
        getRestClass: function () {
            return Queue;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Queue".
         */
        getRestType: function () {
            return "Queue";
        },

        /**
         * @private
         * Returns whether this object supports subscriptions
         */
        supportsSubscriptions: function () {
            return true;
        },
        
        /**
         * @private
         * Specifies whether this object's subscriptions need to be explicitly requested
         */
        explicitSubscription: true,
        
        /**
         * @private
         * Gets the node path for the current object - this is the team Users node
         * @returns {String} The node path
         */
        getXMPPNodePath: function () {
            return this.getRestUrl();
        },
        
        /**
         * Getter for the queue id
         * @returns {String}
         *     The id of the Queue
         */
        getId: function () {
            this.isLoaded();
            return this._id;
        },
        
        /**
         * Getter for the queue name
         * @returns {String}
         *      The name of the Queue
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },
        
        /**
         * Getter for the queue statistics.
         * Supported statistics include:<br>
         *  - callsInQueue<br>
         *  - startTimeOfLongestCallInQueue<br>
         *  <br>
         *  These statistics can be accessed via dot notation:<br>
         *  i.e.: getStatistics().callsInQueue
         * @returns {Object}
         *      The Object with different statistics as properties.
         */
        getStatistics: function () {
            this.isLoaded();
            return this.getData().statistics;       
        },

        /**
         * Parses a uriString to retrieve the id portion
         * @param {String} uriString
         * @return {String} id
         */
        _parseIdFromUriString : function (uriString) {
            return Utilities.getId(uriString);
        }

    });
	
	window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Queue = Queue;
    
    return Queue;
}));

/**
 * JavaScript representation of the Finesse Queues collection
 * object which contains a list of Queue objects.
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.RestCollectionBase
 */

/**
 * @class
 * JavaScript representation of a Queues collection object.
 *
 * @constructor
 * @borrows finesse.restservices.RestCollectionBase as finesse.restservices.Queues
 */

/** @private */
 (function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Queues', ['restservices/RestCollectionBase',
                 'restservices/Queue'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.Queue);
    } 
}(function (RestCollectionBase, Queue) {
	var Queues = RestCollectionBase.extend(/** @lends finesse.restservices.Queues.prototype */{

        /**
         * @class
         * JavaScript representation of a Queues collection object. 
         * @augments finesse.restservices.RestCollectionBase
         * @constructs
         * @see finesse.restservices.Queue
         * @example
         *  _queues = _user.getQueues( {
         *      onCollectionAdd : _handleQueueAdd,
         *      onCollectionDelete : _handleQueueDelete,
         *      onLoad : _handleQueuesLoaded
         *  });
         *  
         * _queueCollection = _queues.getCollection();
         * for (var queueId in _queueCollection) {
         *     if (_queueCollection.hasOwnProperty(queueId)) {
         *         _queue = _queueCollection[queueId];
         *         etc...
         *     }
         * }
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
	    
         /**
         * @private
         * JavaScript representation of a Queues object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);           
        },

        /**
         * @private
         * Gets xmpp node path.
         */
        getXMPPNodePath: function () {
            return this.getRestUrl();
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Queues class.
         */
        getRestClass: function () {
            return Queues;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the Queue class.
         */
        getRestItemClass: function () {
            return Queue;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Queues".
         */
        getRestType: function () {
            return "Queues";
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "Queue".
         */
        getRestItemType: function () {
            return "Queue";
        },

        explicitSubscription: true,
        
        handlesItemRefresh: true
    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Queues = Queues;
    
    return Queues;
}));

/**
 * JavaScript representation of the Finesse WrapUpReason object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/WrapUpReason',['restservices/RestBase'], factory);
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {

    var WrapUpReason = RestBase.extend(/** @lends finesse.restservices.WrapUpReason.prototype */{

        /**
         * @class
         * A WrapUpReason is a code and description identifying a particular reason that a
         * User is in WORK (WrapUp) mode.
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.User
         * @see finesse.restservices.User.States#WORK
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /** 
         * @private
         * JavaScript representation of a WrapUpReason object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the WrapUpReason class.
         * @returns {Object} The WrapUpReason class.
         */
        getRestClass: function () {
            return WrapUpReason;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "WrapUpReason".
         * @returns {String} The WrapUpReason string.
         */
        getRestType: function () {
            return "WrapUpReason";
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "WrapUpReasons".
         * @returns {String} The WrapUpReasons string.
         */
        getParentRestType: function () {
            return "WrapUpReasons";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the label.
         * @returns {String} The label.
         */
        getLabel: function () {
            this.isLoaded();
            return this.getData().label;
        },

        /**
         * @private
         * Getter for the forAll flag.
         * @returns {Boolean} True if global.
         */
        getForAll: function () {
            this.isLoaded();
            return this.getData().forAll;
        },

        /**
         * @private
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        }
    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.WrapUpReason = WrapUpReason;
        
    return WrapUpReason;
}));

/**
* JavaScript representation of the Finesse WrapUpReasons collection
* object which contains a list of WrapUpReason objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/WrapUpReasons', ['restservices/RestCollectionBase',
                 'restservices/WrapUpReason'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.WrapUpReason);
    } 
}(function (RestCollectionBase, WrapUpReason) {

    var WrapUpReasons = RestCollectionBase.extend(/** @lends finesse.restservices.WrapUpReasons.prototype */{
        
        /**
         * @class
         * JavaScript representation of a WrapUpReasons collection object. 
         * @augments finesse.restservices.RestCollectionBase
         * @constructs
         * @see finesse.restservices.WrapUpReason
         * @example
         *  _wrapUpReasons = _user.getWrapUpReasons ( {
         *      onCollectionAdd : _handleWrapUpReasonAdd,
         *      onCollectionDelete : _handleWrapUpReasonDelete,
         *      onLoad : _handleWrapUpReasonsLoaded
         *  });
         *  
         * _wrapUpReasonCollection = _wrapUpReasons.getCollection();
         * for (var wrapUpReasonId in _wrapUpReasonCollection) {
         *     if (_wrapUpReasonCollection.hasOwnProperty(wrapUpReasonId)) {
         *         _wrapUpReason = _wrapUpReasonCollection[wrapUpReasonId];
         *         etc...
         *     }
         * }
        */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /** 
         * @private
         * JavaScript representation of a WrapUpReasons collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);           
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the WrapUpReasons class.
         */
        getRestClass: function () {
            return WrapUpReasons;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the WrapUpReason class.
         */
        getRestItemClass: function () {
            return WrapUpReason;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "WrapUpReasons".
         */
        getRestType: function () {
            return "WrapUpReasons";
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "WrapUpReason".
         */
        getRestItemType: function () {
            return "WrapUpReason";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsRestItemSubscriptions: false,

        /**
         * @private
         * Retrieve the Wrap-Up Reason Codes. This call will re-query the server and refresh the collection.
         *
         * @returns {finesse.restservices.WrapUpReasons}
         *     This ReadyReasonCodes object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        }
        
    });
 
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.WrapUpReasons = WrapUpReasons;
       
    return WrapUpReasons;
}));

/**
 * JavaScript representation of the Finesse Contact object.
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Contact',['restservices/RestBase'], factory);
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {
    var Contact = RestBase.extend(/** @lends finesse.restservices.Contact.prototype */{

        /**
         * @class
         * A Contact is a single entry in a PhoneBook, consisting of a First and Last Name,
         * a Phone Number, and a Description.
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.PhoneBook
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Contact class.
         * @returns {Object} The Contact class.
         */
        getRestClass: function () {
            return Contact;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Contact".
         * @returns {String} The Contact string.
         */
        getRestType: function () {
            return "Contact";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the firstName.
         * @returns {String} The firstName.
         */
        getFirstName: function () {
            this.isLoaded();
            return this.getData().firstName;
        },

        /**
         * Getter for the lastName.
         * @returns {String} The lastName.
         */
        getLastName: function () {
            this.isLoaded();
            return this.getData().lastName;
        },

        /**
         * Getter for the phoneNumber.
         * @returns {String} The phoneNumber.
         */
        getPhoneNumber: function () {
            this.isLoaded();
            return this.getData().phoneNumber;
        },

        /**
         * Getter for the description.
         * @returns {String} The description.
         */
        getDescription: function () {
            this.isLoaded();
            return this.getData().description;
        },

        /** @private */
        createPutSuccessHandler: function(contact, contentBody, successHandler){
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                contact._processResponse(rsp);

                //Remove the injected Contact object before cascading response
                rsp.object = {};
                
                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /** @private */
        createPostSuccessHandler: function (contact, contentBody, successHandler) {
            return function (rsp) {
                rsp.object = contentBody;
                contact._processResponse(rsp);

                //Remove the injected Contact object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * Add
         * @private
         */
        add: function (newValues, handlers) {
            // this.isLoaded();
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "firstName": newValues.firstName,
                "lastName": newValues.lastName,
                "phoneNumber": newValues.phoneNumber,
                "description": newValues.description
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: this.createPostSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },

        /**
         * Update
         * @private
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "uri": this.getId(),
                "firstName": newValues.firstName,
                "lastName": newValues.lastName,
                "phoneNumber": newValues.phoneNumber,
                "description": newValues.description
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },


        /**
         * Delete
         * @private
         */
        "delete": function ( handlers) {
            this.isLoaded();

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'DELETE',
                success: this.createPutSuccessHandler(this, {}, handlers.success),
                error: handlers.error,
                content: undefined
            });

            return this; // Allow cascading
        }
    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Contact = Contact;
    
    return Contact;
}));

/**
* JavaScript representation of the Finesse Contacts collection
* object which contains a list of Contact objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Contacts', ['restservices/RestCollectionBase',
                'restservices/Contact'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.Contact);
    } 
}(function (RestCollectionBase, Contact) {
    var Contacts = RestCollectionBase.extend(/** @lends finesse.restservices.Contacts.prototype */{
        
        /**
         * @class
         * JavaScript representation of a Contacts collection object. Also exposes
         * methods to operate on the object against the server.
         * @augments finesse.restservices.RestCollectionBase
         * @constructs
         * @see finesse.restservices.Contact
         * @see finesse.restservices.PhoneBook
         * @example
         *  _contacts = _phonebook.getContacts( {
         *      onCollectionAdd : _handleContactAdd,
         *      onCollectionDelete : _handleContactDelete,
         *      onLoad : _handleContactsLoaded
         *  });
         *  
         * _contactCollection = _contacts.getCollection();
         * for (var contactId in _contactCollection) {
         *     if (_contactCollection.hasOwnProperty(contactId)) {
         *         _contact = _contactCollection[contactId];
         *         etc...
         *     }
         * }
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /** 
         * @private
         * JavaScript representation of a Contacts collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);           
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Contacts class.
         */
        getRestClass: function () {
            return Contacts;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the Contact class.
         */
        getRestItemClass: function () {
            return Contact;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Contacts".
         */
        getRestType: function () {
            return "Contacts";
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "Contacts".
         */
        getRestItemType: function () {
            return "Contact";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection subscribes to its objects.
         */
        supportsRestItemSubscriptions: false,
        
        /**
         * @private
         * Retrieve the Contacts.  This call will re-query the server and refresh the collection.
         *
         * @returns {finesse.restservices.Contacts}
         *     This Contacts object, to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        }
        
    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Contacts = Contacts;
    
    
    return Contacts;
}));

/**
 * JavaScript representation of the Finesse PhoneBook object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/PhoneBook',['restservices/RestBase',
				'restservices/Contacts'], factory);
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase,
				finesse.restservices.Contacts);
    } 
}(function (RestBase, Contacts) {
    var PhoneBook = RestBase.extend(/** @lends finesse.restservices.PhoneBook.prototype */{

        _contacts: null,

        /**
         * @class
         * A PhoneBook is a list of Contacts available to a User for quick dial.
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.Contacts
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /** 
         * @private
         * JavaScript representation of a PhoneBook object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the PhoneBook class.
         * @returns {Object} The PhoneBook class.
         */
        getRestClass: function () {
            return PhoneBook;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "PhoneBook".
         * @returns {String} The PhoneBook string.
         */
        getRestType: function () {
            return "PhoneBook";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the name of the Phone Book.
         * @returns {String} The name.
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },

        /**
         * Getter for the type flag.
         * @returns {String} The type.
         */
        getType: function () {
            this.isLoaded();
            return this.getData().type;
        },

        /**
         * @private
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        },

        /**
         * Getter for a Contacts collection object that is associated with PhoneBook.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.Contacts}
         *     A Contacts collection object.
         */
        getContacts: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();

            if (this._contacts === null) {
                this._contacts = new Contacts(options);
            }

            return this._contacts;
        },

        /**
         * Getter for <contacts> node within PhoneBook - sometimes it's just a URI, sometimes it is a Contacts collection
         * @returns {String} uri to contacts
         *          or {finesse.restservices.Contacts} collection
         */
        getEmbeddedContacts: function(){
            this.isLoaded();
            return this.getData().contacts;
        },

        /** @private */
        createPutSuccessHandler: function(phonebook, contentBody, successHandler){
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                phonebook._processResponse(rsp);

                //Remove the injected PhoneBook object before cascading response
                rsp.object = {};
                
                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /** @private */
        createPostSuccessHandler: function (phonebook, contentBody, successHandler) {
            return function (rsp) {
                rsp.object = contentBody;
                phonebook._processResponse(rsp);

                //Remove the injected PhoneBook object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * @private
         * Add a PhoneBook.
         * @param {Object} newValues
         * @param {String} newValues.name Name of PhoneBook
         * @param {String} newValues.type Type of PhoneBook
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.PhoneBook}
         *     This PhoneBook object, to allow cascading
         */
        add: function (newValues, handlers) {
            // this.isLoaded();
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "name": newValues.name,
                "type": newValues.type
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: this.createPostSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },

        /**
         * @private
         * Update a PhoneBook.
         * @param {Object} newValues
         * @param {String} newValues.name Name of PhoneBook
         * @param {String} newValues.type Type of PhoneBook
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.PhoneBook}
         *     This PhoneBook object, to allow cascading
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "uri": this.getId(),
                "name": newValues.name,
                "type": newValues.type
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },


        /**
         * Delete a PhoneBook.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.PhoneBook}
         *     This PhoneBook object, to allow cascading
         */
        "delete": function ( handlers) {
            this.isLoaded();

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'DELETE',
                success: this.createPutSuccessHandler(this, {}, handlers.success),
                error: handlers.error,
                content: undefined
            });

            return this; // Allow cascading
        }



    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.PhoneBook = PhoneBook;
    
    return PhoneBook;
}));

/**
* JavaScript representation of the Finesse PhoneBooks collection
* object which contains a list of PhoneBook objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/PhoneBooks', ['restservices/RestCollectionBase',
                 'restservices/PhoneBook'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.PhoneBook);
    } 
}(function (RestCollectionBase, PhoneBook) {
    var PhoneBooks = RestCollectionBase.extend(/** @lends finesse.restservices.PhoneBooks.prototype */{
        
        /**
         * @class
         * JavaScript representation of a PhoneBooks collection object. 
         * @augments finesse.restservices.RestCollectionBase
         * @constructs
         * @see finesse.restservices.PhoneBook
         * @see finesse.restservices.Contacts
         * @see finesse.restservices.Contact
         * @example
         *  _phoneBooks = _user.getPhoneBooks( {
         *      onCollectionAdd : _handlePhoneBookAdd,
         *      onCollectionDelete : _handlePhoneBookDelete,
         *      onLoad : _handlePhoneBooksLoaded
         *  });
         *  
         * _phoneBookCollection = _phoneBooks.getCollection();
         * for (var phoneBookId in _phoneBookCollection) {
         *     if (_phoneBookCollection.hasOwnProperty(phoneBookId)) {
         *         _phoneBook = _phoneBookCollection[phoneBookId];
         *         etc...
         *     }
         * }
        */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
       /**
         * @private
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);           
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the PhoneBooks class.
         */
        getRestClass: function () {
            return PhoneBooks;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the PhoneBook class.
         */
        getRestItemClass: function () {
            return PhoneBook;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "PhoneBooks".
         */
        getRestType: function () {
            return "PhoneBooks";
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "PhoneBooks".
         */
        getRestItemType: function () {
            return "PhoneBook";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection subscribes to its objects.
         */
        supportsRestItemSubscriptions: false,
        
        /**
         * @private
         * Retrieve the PhoneBooks.  This call will re-query the server and refresh the collection.
         *
         * @returns {finesse.restservices.PhoneBooks}
         *     This PhoneBooks object, to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        }
        
    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.PhoneBooks = PhoneBooks;
    
    return PhoneBooks;
}));

/**
 * JavaScript representation of the Finesse WorkflowAction object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/*jslint browser: true, nomen: true, sloppy: true, forin: true */
/*global define,finesse */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/WorkflowAction', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {

    var WorkflowAction = RestBase.extend({

        _contacts: null,

        actionTypes: [
            {
                name: 'BROWSER_POP',
                params: [
                    {
                        name: 'windowName',
                        type: 'text'
                    },
                    {
                        name: 'path',
                        type: 'systemVariableSingleLineEditor'
                    }
                ]
            },
            {
                name: 'HTTP_REQUEST',
                params: [
                    {
                        name: 'method',
                        type: 'dropdown',
                        values: ['POST', 'PUT']
                    },
                    {
                        name: 'location',
                        type: 'dropdown',
                        values: ['FINESSE', 'OTHER']
                    },
                    {
                        name: 'contentType',
                        type: 'text'
                    },
                    {
                        name: 'path',
                        type: 'systemVariableSingleLineEditor'
                    },
                    {
                        name: 'body',
                        type: 'systemVariableMultiLineEditor'
                    }
                ]
            }            
            // more action type definitions here
        ],

        /**
         * @class
         * A WorkflowAction is an action (e.g. Browser Pop, Rest Request) defined in a
         * Workflow and triggered by a system event (Call Received, Call Ended, etc.).
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.Workflow
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         * JavaScript representation of a WorkflowAction object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the WorkflowAction class.
         * @returns {Object} The WorkflowAction class.
         */
        getRestClass: function () {
            return finesse.restservices.WorkflowAction;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "WorkflowAction".
         * @returns {String} The WorkflowAction string.
         */
        getRestType: function () {
            return "WorkflowAction";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the name.
         * @returns {String} The name.
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },

        /**
         * Getter for the type flag.
         * @returns {String} The type.
         */
        getType: function () {
            this.isLoaded();
            return this.getData().type;
        },

        /**
         * @private
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        },

        /**
         * @private
         * Getter for the handledBy value.
         * @returns {String} handledBy.
         */
        getHandledBy: function () {
            this.isLoaded();
            return this.getData().handledBy;
        },

        /**
         * Getter for the parameters.
         * @returns {Object} key = param name, value = param value
         */
        getParams: function () {
            var map = {},
                params = this.getData().params.Param,
                i,
                param;

            for(i=0; i<params.length; i+=1){
                param = params[i];
                map[param.name] = param.value || "";
            }

            return map;
        },

        /**
         * Getter for the ActionVariables
         * @returns {Object} key = action variable name, value = Object{name, type, node, testValue}
         */
        getActionVariables: function() {
            var map = {},
                actionVariablesParent = this.getData().actionVariables,
                actionVariables,
                i,
                actionVariable;

            if (actionVariablesParent === null ||  typeof(actionVariablesParent) === "undefined" || actionVariablesParent.length === 0){
                return map;
            }
            actionVariables = actionVariablesParent.ActionVariable;

            if(actionVariables.length > 0){
                for(i=0; i<actionVariables.length; i+=1){
                    actionVariable = actionVariables[i];
                    // escape nulls to empty string
                    actionVariable.name = actionVariable.name || "";
                    actionVariable.type = actionVariable.type || "";
                    actionVariable.node = actionVariable.node || "";
                    actionVariable.testValue = actionVariable.testValue || "";
                    map[actionVariable.name] = actionVariable;
                }
            } else {
                map[actionVariables.name] = actionVariables;
            }

            return map;
        },

        /** @private */
        createPutSuccessHandler: function(action, contentBody, successHandler){
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                action._processResponse(rsp);

                //Remove the injected WorkflowAction object before cascading response
                rsp.object = {};
                
                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /** @private */
        createPostSuccessHandler: function (action, contentBody, successHandler) {
            return function (rsp) {
                rsp.object = contentBody;
                action._processResponse(rsp);

                //Remove the injected WorkflowAction object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * @private
         * Build params array out of all the values coming into add or update methods
         * paramMap is a map of params.. we need to translate it into an array of Param objects
         * where path and windowName are params for the BROWSER_POP type
         */
        buildParamsForRest: function(paramMap){
            var params = {"Param": []},
                i;
            for(i in paramMap){
                if(paramMap.hasOwnProperty(i)){
                    params.Param.push({name: i, value: paramMap[i]});
                }
            }
            return params;
        },

        /**
         * @private
         * Build actionVariables array out of all the values coming into add or update methods
         * actionVariableMap is a map of actionVariables.. we need to translate it into an array of ActionVariable objects
         * where path and windowName are params for the BROWSER_POP type
         */
        buildActionVariablesForRest: function(actionVariableMap){
            var actionVariables = {"ActionVariable": []},
                i,
                actionVariable;
            for(i in actionVariableMap){
                if(actionVariableMap.hasOwnProperty(i)){
                    // {name: "callVariable1", type: "SYSTEM", node: "", testValue: "<blink>"}
                    actionVariable = {
                        "name": actionVariableMap[i].name,
                        "type": actionVariableMap[i].type,
                        "node": actionVariableMap[i].node,
                        "testValue": actionVariableMap[i].testValue
                    };
                    actionVariables.ActionVariable.push(actionVariable);
                }
            }
            return actionVariables;
        },

        /**
         * Add
         */
        add: function (newValues, handlers) {
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "name": newValues.name,
                "type": newValues.type,
                "handledBy": newValues.handledBy,
                "params": this.buildParamsForRest(newValues.params),
                "actionVariables": this.buildActionVariablesForRest(newValues.actionVariables)
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: this.createPostSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },

        /**
         * @private
         * Update
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {};
            
            contentBody[this.getRestType()] = {
                "uri": this.getId(),
                "name": newValues.name,
                "type": newValues.type,
                "handledBy": newValues.handledBy,
                "params": this.buildParamsForRest(newValues.params),
                "actionVariables": this.buildActionVariablesForRest(newValues.actionVariables)
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },


        /**
         * @private
         * Delete
         */
        "delete": function ( handlers) {
            this.isLoaded();

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'DELETE',
                success: this.createPutSuccessHandler(this, {}, handlers.success),
                error: handlers.error,
                content: undefined
            });

            return this; // Allow cascading
        }



    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.WorkflowAction = WorkflowAction;
    
    return WorkflowAction;
}));

/**
* JavaScript representation of the Finesse WorkflowActions collection
* object which contains a list of WorkflowAction objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/WorkflowActions', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/WorkflowAction'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.WorkflowAction);
    } 
}(function (RestCollectionBase, RestBase, WorkflowAction) {

    var WorkflowActions = RestCollectionBase.extend({
        
        /**
         * @class
         * JavaScript representation of a WorkflowActions collection object. 
         * @augments finesse.restservices.RestCollectionBase
         * @constructs
         * @see finesse.restservices.WorkflowAction
         * @see finesse.restservices.Workflow
         * @see finesse.restservices.Workflows
         * @example
         *  _workflowActions = _user.getWorkflowActions( {
         *      onCollectionAdd : _handleWorkflowActionAdd,
         *      onCollectionDelete : _handleWorkflowActionDelete,
         *      onLoad : _handleWorkflowActionsLoaded
         *  });
        */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         * JavaScript representation of a WorkflowActions collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);           
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the WorkflowActions class.
         */
        getRestClass: function () {
            return WorkflowActions;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the WorkflowAction class.
         */
        getRestItemClass: function () {
            return WorkflowAction;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "WorkflowActions".
         */
        getRestType: function () {
            return "WorkflowActions";
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "WorkflowActions".
         */
        getRestItemType: function () {
            return "WorkflowAction";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection subscribes to its objects.
         */
        supportsRestItemSubscriptions: false,
        
        /**
         * @private
         * Retrieve the WorkflowActions.
         *
         * @returns {finesse.restservices.WorkflowActions}
         *     This WorkflowActions object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        }
    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.WorkflowActions = WorkflowActions;
        
    return WorkflowActions;
}));

/**
 * JavaScript representation of the Finesse Workflow object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/*jslint browser: true, nomen: true, sloppy: true, forin: true */
/*global define,finesse */

/** @private */
(function (factory) {
    

    if (typeof define === 'function' && define.amd) {
        // Define as an AMD module if possible
        define('restservices/Workflow',['restservices/RestBase',
				'restservices/WorkflowActions'], factory);
    } else {
        /* Define using browser globals otherwise
         * Prevent multiple instantiations if the script is loaded twice
         */
        factory(finesse.restservices.RestBase,
				finesse.restservices.WorkflowActions);
    }
}(function (RestBase, WorkflowActions) {

    var Workflow = RestBase.extend({

        /**
         * @class
         * JavaScript representation of a Workflow object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Workflow class.
         * @returns {Object} The Workflow class.
         */
        getRestClass: function () {
            return Workflow;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Workflow".
         * @returns {String} The Workflow string.
         */
        getRestType: function () {
            return "Workflow";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * @private
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        },

        /**
         * Getter for the name.
         * @returns {String} The name.
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },

        /**
         * Getter for the description.
         * @returns {String} The description.
         */
        getDescription: function () {
            this.isLoaded();
            return this.getData().description;
        },

        /**
         * Getter for the trigger set.
         * @returns {String} The trigger set.
         */
        getTriggerSet: function () {
            this.isLoaded();
            return this.getData().TriggerSet;
        },

        /**
         * Getter for the condition set.
         * @returns {String} The condition set.
         */
        getConditionSet: function () {
            this.isLoaded();
            return this.getData().ConditionSet;
        },
        
        /**
         * Getter for the assigned workflowActions.
         * @returns {String} The workflowActions object.
         */
        getWorkflowActions: function () {
            this.isLoaded();
            var workflowActions = this.getData().workflowActions;
            if (workflowActions === null) {
                workflowActions = "";
            }
            return workflowActions;
        },

        createPutSuccessHandler: function (workflow, contentBody, successHandler) {
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                workflow._processResponse(rsp);

                //Remove the injected Workflow object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        createPostSuccessHandler: function (workflow, contentBody, successHandler) {
            return function (rsp) {
                rsp.object = contentBody;
                workflow._processResponse(rsp);

                //Remove the injected Workflow object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * @private
         * Add
         */
        add: function (newValues, handlers) {
            // this.isLoaded();
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "name": newValues.name,
                "description": newValues.description,
                "TriggerSet" : newValues.TriggerSet,
                "ConditionSet" : newValues.ConditionSet,
                "workflowActions" : newValues.workflowActions
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'POST',
                success: this.createPostSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },

        /**
         * @private
         * Update
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {};

            contentBody[this.getRestType()] = {
                "uri": this.getId(),
                "name": newValues.name,
                "description": newValues.description,
                "TriggerSet" : newValues.TriggerSet,
                "ConditionSet" : newValues.ConditionSet,
                "workflowActions" : newValues.workflowActions
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        },


        /**
         * @private
         * Delete
         */
        "delete": function (handlers) {
            this.isLoaded();

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'DELETE',
                success: this.createPutSuccessHandler(this, {}, handlers.success),
                error: handlers.error,
                content: undefined
            });

            return this; // Allow cascading
        }



    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Workflow = Workflow;

    return Workflow;
}));

/**
* JavaScript representation of the Finesse workflows collection
* object which contains a list of workflow objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Workflows', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/Workflow'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.Workflow);
    } 
}(function (RestCollectionBase, RestBase, Workflow) {

    var Workflows = RestCollectionBase.extend({

        /**
         * @class
         * JavaScript representation of a workflows collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         *  @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the workflows class.
         */
        getRestClass: function () {
            return Workflows;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the workflow class.
         */
        getRestItemClass: function () {
            return Workflow;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "workflows".
         */
        getRestType: function () {
            return "Workflows";
        },

        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "workflows".
         */
        getRestItemType: function () {
            return "Workflow";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection does not subscribe to its objects.
         */
        supportsRestItemSubscriptions: false,

        /**
         * @private
         * Retrieve the workflows. This call will re-query the server and refresh the collection.
         *
         * @returns {finesse.restservices.workflows}
         *     This workflows object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        }
    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Workflows = Workflows;
        
    return Workflows;
}));

/**
 * JavaScript representation of the Finesse MediaPropertiesLayout object
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global finesse*/

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/MediaPropertiesLayout', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {
    var MediaPropertiesLayout = RestBase.extend(/** @lends finesse.restservices.MediaPropertiesLayout.prototype */{

        /**
         * @class
         * The MediaPropertiesLayout handles which call variables are associated with Dialogs.
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.Dialog#getMediaProperties
         * @see finesse.restservices.User#getMediaPropertiesLayout
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         * JavaScript representation of a MediaPropertiesLayout object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the MediaPropertiesLayout object.
         */
        getRestClass: function () {
            return MediaPropertiesLayout;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "MediaPropertiesLayout".
         */
        getRestType: function () {
            return "MediaPropertiesLayout";
        },

        /**
         * @private
         * Overrides the parent class.  Returns the url for the MediaPropertiesLayout resource
         */
        getRestUrl: function () {
            return ("/finesse/api/User/" + this.getId() + "/" + this.getRestType());
        },

        /**
         * @private
         * Returns whether this object supports subscriptions
         */
        supportsSubscriptions: false,

        /**
         * Retrieve the media properties layout. This call will re-query the server and refresh the layout object.
         * @returns {finesse.restservices.MediaPropertiesLayout}
         *     This MediaPropertiesLayout object to allow cascading
         */
        get: function () {
            this._synchronize();

            return this; //Allow cascading
        },

        /**
         * Gets the data for this object.
         * 
         * Performs safe conversion from raw API data to ensure that the returned layout object
         * always has a header with correct entry fields, and exactly two columns with lists of entries.
         *
         * @returns {finesse.restservices.MediaPropertiesLayout.Object} Data in columns (unless only one defined).
         */
        getData: function () {

            var layout = this._data, result, _addColumnData;

            result = this.getEmptyData();

            /**
             * @private
             */
            _addColumnData = function (entryData, colIndex) {

                if (!entryData) {
                    //If there's no entry data at all, rewrite entryData to be an empty collection of entries
                    entryData = {};
                } else if (entryData.mediaProperty) {
                    //If entryData contains the keys for a single entry rather than being a collection of entries,
                    //rewrite it to be a collection containing a single entry
                    entryData = { "": entryData };
                }

                //Add each of the entries in the list to the column
                jQuery.each(entryData, function (i, entryData) {

                    //If the entry has no displayName specified, explicitly set it to the empty string
                    if (!entryData.displayName) {
                        entryData.displayName = "";
                    }

                    result.columns[colIndex].push(entryData);

                });

            };

            //The header should only contain a single entry
            if (layout.header && layout.header.entry) {

                //If the entry has no displayName specified, explicitly set it to the empty string
                if (!layout.header.entry.displayName) {
                    layout.header.entry.displayName = "";
                }

                result.header = layout.header.entry;

            } else {

                throw "MediaPropertiesLayout.getData() - Header does not contain an entry";

            }

            //If the column object contains an entry object that wasn't part of a list of entries,
            //it must be a single right-hand entry object (left-hand entry object would be part of a list.)
            //Force the entry object to be the 2nd element in an otherwise-empty list.
            if (layout.column && layout.column.entry) {
                layout.column = [
                    null,
                    { "entry": layout.column.entry }
                ];
            }

            if (layout.column && layout.column.length > 0 && layout.column.length <= 2) {

                //Render left column entries
                if (layout.column[0] && layout.column[0].entry) {
                    _addColumnData(layout.column[0].entry, 0);
                }

                //Render right column entries
                if (layout.column[1] && layout.column[1].entry) {
                    _addColumnData(layout.column[1].entry, 1);
                }

            }

            return result;

        },

        /**
         * @private
         * Empty/template version of getData().
         *
         * Used by getData(), and by callers of getData() in error cases.
         */
        getEmptyData: function () {

            return {
                header : {
                    displayName: null,
                    mediaProperty: null
                },
                columns : [[], []]
            };

        },

        /**
         * @private
         * Set the layout of this MediaPropertiesLayout.
         * @param {String} layout
         *     The layout you are setting
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.MediaPropertiesLayout}
         *     This MediaPropertiesLayout object to allow cascading
         */
        setLayout: function (layout, handlers) {

            var contentBody = {};

            contentBody[this.getRestType()] = layout;

            //Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        }

    });
    
    MediaPropertiesLayout.Object = /** @lends finesse.restservices.MediaPropertiesLayout.Object.prototype */ {
        /**
         * @class Format of MediaPropertiesLayout Object.<br>
         * Object { <ul>
         *      <li>header : { <ul>
         *          <li>dispayName {String} 
         *          <li>mediaProperty {String}</ul>}
         *      <li>columns : { <ul>
         *          <li>[ [] , [] ]
         *          </ul>
         *      where column arrays consists of the same Object format as header.<br>
         *          }</ul>
         *      }<br>         
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
        
    };

	window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.MediaPropertiesLayout = MediaPropertiesLayout;
    
    return MediaPropertiesLayout;
}));

/**
 * JavaScript representation of the Finesse User object
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/User', ['restservices/RestBase',
                 'restservices/Dialogs',
                 'restservices/ClientLog',
                 'restservices/Queues',
                 'restservices/WrapUpReasons',
                 'restservices/PhoneBooks',
                 'restservices/Workflows',
                 'restservices/MediaPropertiesLayout',
                 'utilities/Utilities'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase, 
        finesse.restservices.Dialogs, 
        finesse.restservices.ClientLog,
        finesse.restservices.Queues,
        finesse.restservices.WrapUpReasons,
        finesse.restservices.PhoneBooks,
        finesse.restservices.Workflows,
        finesse.restservices.MediaPropertiesLayout,
        finesse.utilities.Utilities);
    } 
}(function (RestBase, 
            Dialogs, 
            ClientLog,
            Queues,
            WrapUpReasons,
            PhoneBooks,
            Workflows,
            MediaPropertiesLayout,
            Utilities) {
    
    var User = RestBase.extend(/** @lends finesse.restservices.User.prototype */{

        _dialogs : null,
        _clientLogObj : null,
        _wrapUpReasons : null,
        _phoneBooks : null,
        _workflows : null,
        _mediaPropertiesLayout : null,
        _queues : null,
        
        /**
         * @class
         * The User represents a Finesse Agent or Supervisor.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> callback handler for when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> callback handler for when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> callback handler for when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> callback handler for when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> callback handler for if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @augments finesse.restservices.RestBase
         * @constructs
         * @example
         *      _user = new finesse.restservices.User({
         *                      id: _id, 
         *                      onLoad : _handleUserLoad,
         *                      onChange : _handleUserChange
         *      });
         **/
        init: function (options) {
            this._super(options);
        },
        
        Callbacks: {},
    
        /**
         * @private
         * Gets the REST class for the current object - this is the User object.
         */
        getRestClass: function () {
            return User;
        },
    
        /**
        * @private
         * Gets the REST type for the current object - this is a "User".
         */
        getRestType: function () {
            return "User";
        },
        /**
         * @private
         * overloading this to return URI
         */
        getXMPPNodePath: function () {
            return this.getRestUrl();
        },
        /**
        * @private
         * Returns whether this object supports subscriptions
         */
        supportsSubscriptions: function () {
            return true;
        },
    
        /**
         * Getter for the firstName of this User.
         * @returns {String}
         *     The firstName for this User
         */
        getFirstName: function () {
            this.isLoaded();
            return Utilities.convertNullToEmptyString(this.getData().firstName);
        },
    
        /**
         * Getter for the lastName of this User.
         * @returns {String}
         *     The lastName for this User
         */
        getLastName: function () {
            this.isLoaded();
            return Utilities.convertNullToEmptyString(this.getData().lastName);
        },
    
        /**
         * Getter for the extension of this User.
         * @returns {String}
         *     The extension, if any, of this User
         */
        getExtension: function () {
            this.isLoaded();
            return Utilities.convertNullToEmptyString(this.getData().extension);
        },
        
        /**
         * Getter for the id of the Team of this User
         * @returns {String}
         *     The current (or last fetched) id of the Team of this User
         */
        getTeamId: function () {
            this.isLoaded();
            return this.getData().teamId;
        },
        
        /**
         * Getter for the name of the Team of this User
         * @returns {String}
         *     The current (or last fetched) name of the Team of this User
         */
        getTeamName: function () {
            this.isLoaded();
            return this.getData().teamName;
        },
        
        /**
         * Is user an agent?
         * @returns {Boolean} True if user has role of agent, else false.
         */
        hasAgentRole: function () {
            this.isLoaded();
            return this.hasRole("Agent");
        },
    
        /**
         * Is user a supervisor?
         * @returns {Boolean} True if user has role of supervisor, else false.
         */
        hasSupervisorRole: function () {
            this.isLoaded();
            return this.hasRole("Supervisor");
        },
    
        /**
         * @private
         * Checks to see if user has "theRole"
         * @returns {Boolean}
         */
        hasRole: function (theRole) {
            this.isLoaded();
            var result = false, i, roles, len;
    
            roles = this.getData().roles.role;
            len = roles.length;
            if (typeof roles === 'string') {
                if (roles === theRole) {
                    result = true;
                }
            } else {
                for (i = 0; i < len ; i = i + 1) {
                    if (roles[i] === theRole) {
                        result = true;
                        break;
                    }
                }
            }
    
            return result;
        },

        /**
         * Getter for the pending state of this User.
         * @returns {String}
         *     The pending state of this User
         * @see finesse.restservices.User.States
         */
        getPendingState: function () {
            this.isLoaded();
            return Utilities.convertNullToEmptyString(this.getData().pendingState);
        },
    
        /**
         * Getter for the state of this User.
         * @returns {String}
         *     The current (or last fetched) state of this User
         * @see finesse.restservices.User.States
         */
        getState: function () {
            this.isLoaded();
            return this.getData().state;
        },

        /**
         * Getter for the state change time of this User.
         * @returns {String}
         *     The state change time of this User
         */
        getStateChangeTime: function () {
            this.isLoaded();
            return this.getData().stateChangeTime;
        },
        
        /**
         * Getter for the wrap-up mode of this User.
         * @see finesse.restservices.User.WrapUpMode
         * @returns {String} The wrap-up mode of this user that is a value of {@link finesse.restservices.User.WrapUpMode}
         */
        getWrapUpOnIncoming: function () {
            this.isLoaded();
            return this.getData().settings.wrapUpOnIncoming;
        },
        
        /**
         * Is User required to go into wrap-up?
         * @see finesse.restservices.User.WrapUpMode
         * @return {Boolean}
         *      True if this agent is required to go into wrap-up.
         */
        isWrapUpRequired: function () {
            return (this.getWrapUpOnIncoming() === User.WrapUpMode.REQUIRED || 
                    this.getWrapUpOnIncoming() === User.WrapUpMode.REQUIRED_WITH_WRAP_UP_DATA);
        },
    
        /**
         * Checks to see if the user is considered a mobile agent by checking for
         * the existence of the mobileAgent node.
         * @returns {Boolean}
         *      True if this agent is a mobile agent.
         */
        isMobileAgent: function () {
            this.isLoaded();
            var ma = this.getData().mobileAgent;
            return ma !== null && typeof ma === "object";
        },
    
        /**
         * Getter for the mobile agent work mode.
         * @returns {finesse.restservices.User.WorkMode}
         *      If available, return the mobile agent work mode, otherwise null.
         */
        getMobileAgentMode: function () {
            this.isLoaded();
            if (this.isMobileAgent()) {
                return this.getData().mobileAgent.mode;
            }
            return null;
        },
    
        /**
         * Getter for the mobile agent dial number.
         * @returns {String}
         *      If available, return the mobile agent dial number, otherwise null.
         */
        getMobileAgentDialNumber: function () {
            this.isLoaded();
            if (this.isMobileAgent()) {
                return this.getData().mobileAgent.dialNumber;
            }
            return null;
        },
    
        /**
         * Getter for a Dialogs collection object that is associated with User.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @returns {finesse.restservices.Dialogs}
         *     A Dialogs collection object.
         */
        getDialogs: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (this._dialogs === null) {
                this._dialogs = new Dialogs(options);
            }
    
            return this._dialogs;
        },
        
        /**
         * @private
         * Getter for a ClientLog object that is associated with User.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @returns {finesse.restservices.ClientLog}
         *     A ClientLog collection object.
         */
        getClientLog: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
           
            if (this._clientLogObj === null) {
                this._clientLogObj = new ClientLog(options);
            }
            else {
                if(options.onLoad && typeof options.onLoad === "function") {
                options.onLoad(this._clientLogObj);
                }
            }
            return this._clientLogObj;
        },
       
        /**
         * Getter for a Queues collection object that is associated with User.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @returns {finesse.restservices.Queues}
         *     A Queues collection object.
         */
        getQueues: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (this._queues === null) {
                this._queues = new Queues(options);
            }
    
            return this._queues;
        },

        /**
         * Getter for a WrapUpReasons collection object that is associated with User.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @returns {finesse.restservices.WrapUpReasons}
         *     A WrapUpReasons collection object.
         */
        getWrapUpReasons: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (this._wrapUpReasons === null) {
                this._wrapUpReasons = new WrapUpReasons(options);
            }
    
            return this._wrapUpReasons;
        },

        /**
         * Getter for a PhoneBooks collection object that is associated with User.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @returns {finesse.restservices.PhoneBooks}
         *     A PhoneBooks collection object.
         */
        getPhoneBooks: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (this._phoneBooks === null) {
                this._phoneBooks = new PhoneBooks(options);
            }
    
            return this._phoneBooks;
        },

        /**
         * @private
         * Loads the Workflows collection object that is associated with User and
         * 'returns' them to the caller via the handlers.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @see finesse.restservices.Workflow
         * @see finesse.restservices.Workflows
         * @see finesse.restservices.RestCollectionBase
         */
        loadWorkflows: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();

            if (this._workflows === null) {
                this._workflows = new Workflows(options);
            } else {
                this._workflows.refresh();
            }

        },

        /**
         * Getter for a MediaPropertiesLayout object that is associated with User.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers (only 
         * applicable when Object has not been previously created).
         * @returns {finesse.restservices.MediaPropertiesLayout}
         *     The MediaPropertiesLayout object associated with this user
         */
        getMediaPropertiesLayout: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            options.id = this._id;
    
            this.isLoaded();
            if (this._mediaPropertiesLayout === null) {
                this._mediaPropertiesLayout = new MediaPropertiesLayout(options);
            }
            return this._mediaPropertiesLayout;
        },
    
        /**
         * Getter for the supervised Teams this User (Supervisor) supervises, if any.
         * @see finesse.restservices.Team
         * @returns {Array}
         *     An array of Teams supervised by this User (Supervisor)
         */
        getSupervisedTeams: function () {
            this.isLoaded();
    
            try {
                return Utilities.getArray(this.getData().teams.Team);
            } catch (e) {
                return [];
            }
    
        },
    
        /**
         * Perform an agent login for this user, associating him with the
         * specified extension.
         * @param {Object} params
         *     An object containing properties for agent login.
         * @param {String} params.extension
         *     The extension to associate with this user
         * @param {Object} [params.mobileAgent]
         *     A mobile agent object containing the mode and dial number properties.
         * @param {finesse.interfaces.RequestHandlers} params.handlers
         * @see finesse.interfaces.RequestHandlers
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         * @private
         */
        _login: function (params) {
            var handlers, contentBody = {},
            restType = this.getRestType();
            
            // Protect against null dereferencing.
            params = params || {};
    
            contentBody[restType] = {
                "state": User.States.LOGIN,
                "extension": params.extension
            };
    
            // Create mobile agent node if available.
            if (typeof params.mobileAgent === "object") {
                contentBody[restType].mobileAgent = {
                    "mode": params.mobileAgent.mode,
                    "dialNumber": params.mobileAgent.dialNumber
                };
            }
    
            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = params.handlers || {};
    
            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            });
    
            return this; // Allow cascading
        },
    
        /**
         * Perform an agent login for this user, associating him with the
         * specified extension.
         * @param {String} extension
         *     The extension to associate with this user
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */
        login: function (extension, handlers) {
            this.isLoaded();
            var params = {
                "extension": extension,
                "handlers": handlers
            };
            return this._login(params);
        },
    
        /**
         * Perform an agent login for this user, associating him with the
         * specified extension.
         * @param {String} extension
         *     The extension to associate with this user
         * @param {String} mode
         *     The mobile agent work mode as defined in finesse.restservices.User.WorkMode.
         * @param {String} extension
         *     The external dial number desired to be used by the mobile agent.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */
        loginMobileAgent: function (extension, mode, dialNumber, handlers) {
            this.isLoaded();
            var params = {
                "extension": extension,
                "mobileAgent": {
                    "mode": mode,
                    "dialNumber": dialNumber
                },
                "handlers": handlers
            };
            return this._login(params);
        },
    
        /**
         * Perform an agent logout for this user.
         * @param {String} reasonCode
         *     The reason this user is logging out.  Pass null for no reason.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */
        logout: function (reasonCode, handlers) {
            return this.setState("LOGOUT", reasonCode, handlers);
        },
    
        /**
         * Set the state of the user.
         * @param {String} newState
         *     The state you are setting
         * @param {ReasonCode} reasonCode
         *     The reason this user is logging out.  Pass null for no reason.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @see finesse.restservices.User.States
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */
        setState: function (newState, reasonCode, handlers) {
            this.isLoaded();
    
            var options, contentBody = {};
    
            if (!reasonCode) {
                contentBody[this.getRestType()] = {
                    "state": newState
                };
            } else {
                contentBody[this.getRestType()] = {
                    "state": newState,
                    "reasonCodeId": reasonCode.id
                };
            }
    
            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};
    
            options = {
                method: 'PUT',
                success: handlers.success,
                error: handlers.error,
                content: contentBody
            };
    
            // After removing the selective 202 handling, we should be able to just use restRequest
            this.restRequest(this.getRestUrl(), options);
    
            return this; // Allow cascading
        },
    
        /**
         * Make call to a particular phone number.
         *
         * @param {String} 
         *     The number to call
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */ 
        makeCall: function (number, handlers) {
            this.isLoaded();
    
            this.getDialogs().createNewCallDialog(number, this.getExtension(), handlers);
    
            return this; // Allow cascading
        },
    
        /**
         * Make a silent monitor call to a particular agent's phone number.
         *
         * @param {String} 
         *     The number to call
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */
        makeSMCall: function (number, handlers) {
            this.isLoaded();
    
            var actionType = "SILENT_MONITOR";
    
            this.getDialogs().createNewSuperviseCallDialog(number, this.getExtension(), actionType, handlers);
    
            return this; // Allow cascading
        },
        
    
        /**
         * Make a silent monitor call to a particular agent's phone number.
         *
         * @param {String}
         *     The number to call
         * @param {String} dialogUri
         *     The associated dialog uri of SUPERVISOR_MONITOR call
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @see finesse.restservices.dialog
         * @returns {finesse.restservices.User}
         *     This User object, to allow cascading
         */
        makeBargeCall:function (number, dialogURI, handlers) {
            this.isLoaded();
            var actionType = "BARGE_CALL";
            this.getDialogs().createNewBargeCall( this.getExtension(), number, actionType, dialogURI,handlers);
    
            return this; // Allow cascading
        },
        
        /**
         * Returns true if the user's current state will result in a pending state change. A pending state
         * change is a request to change state that does not result in an immediate state change. For
         * example if an agent attempts to change to the NOT_READY state while in the TALKING state, the
         * agent will not change state until the call ends.
         *
         * The current set of states that result in pending state changes is as follows:
         *     TALKING
         *     HOLD
         *     RESERVED_OUTBOUND_PREVIEW
         *  @returns {Boolean} True if there is a pending state change.
         *  @see finesse.restservices.User.States
         */
        isPendingStateChange: function () {
            var state = this.getState();
            return state && ((state === User.States.TALKING) || (state === User.States.HOLD) || (state === User.States.RESERVED_OUTBOUND_PREVIEW));
        },
        
        /**
         * Returns true if the user's current state is WORK or WORK_READY. This is used so
         * that a pending state is not cleared when moving into wrap up (work) mode. 
         * Note that we don't add this as a pending state, since changes while in wrap up
         * occur immediately (and we don't want any "pending state" to flash on screen.
         * 
         * @see finesse.restservices.User.States
         * @returns {Boolean} True if user is in wrap-up mode.
         */
        isWrapUp: function () {
            var state = this.getState();
            return state && ((state === User.States.WORK) || (state === User.States.WORK_READY));
        },
    
        /**
         * @private
         * Parses a uriString to retrieve the id portion
         * @param {String} uriString
         * @return {String} id
         */
        _parseIdFromUriString : function (uriString) {
            return Utilities.getId(uriString);
        },

        /**
         * Gets the user's Reason Code label.
         * Works for both Not Ready and Logout reason codes
         * @return {String} the reason code label, or empty string if none
         */
        getReasonCodeLabel : function () {
            this.isLoaded();

            if (this.getData().reasonCode) {
                return this.getData().reasonCode.label;
            } else {
                return "";
            }
        },
    
        /**
         * Gets the user's Not Ready reason code.
         * @return {String} Reason Code Id, or undefined if not set or indeterminate
         */
        getNotReadyReasonCodeId : function () {
            this.isLoaded();
    
            var reasoncodeIdResult, finesseServerReasonCodeId;
            finesseServerReasonCodeId = this.getData().reasonCodeId;
    
            //FinesseServer will give "-l" => we will set to undefined (for convenience)
            if (finesseServerReasonCodeId !== "-1") {
                reasoncodeIdResult = finesseServerReasonCodeId;
            }
    
            return reasoncodeIdResult;
        },
    
        /**
         * Performs a GET against the Finesse server looking up the reasonCodeId specified.
         * Note that there is no return value; use the success handler to process a
         * valid return.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         * @param {String} reasonCodeId The id for the reason code to lookup
         * 
         */
        getReasonCodeById : function (handlers, reasonCodeId)
        {
            var self = this, contentBody, reasonCode, url;
            contentBody = {};
    
            url = this.getRestUrl() + "/ReasonCode/" + reasonCodeId;
            this.restRequest(url, {
                method: 'GET',
                success: function (rsp) {
                    reasonCode = {
                        uri: rsp.object.ReasonCode.uri,
                        label: rsp.object.ReasonCode.label,
                        id: self._parseIdFromUriString(rsp.object.ReasonCode.uri)
                    };
                    handlers.success(reasonCode);
                },
                error: function (rsp) {
                    handlers.error(rsp);
                },
                content: contentBody
            });
        },
    
        /**
         * Performs a GET against Finesse server retrieving all the specified type of reason codes.
         * @param {String} type (LOGOUT or NOT_READY)
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        _getReasonCodesByType : function (type, handlers)
        {
            var self = this, contentBody = {}, url, reasonCodes, i, reasonCodeArray;
    
            url = this.getRestUrl() + "/ReasonCodes?category=" + type;
            this.restRequest(url, {
                method: 'GET',
                success: function (rsp) {
                    reasonCodes = [];
    
                    reasonCodeArray = rsp.object.ReasonCodes.ReasonCode;
                    if (reasonCodeArray === undefined) {
                        reasonCodes = undefined;
                    } else if (reasonCodeArray[0] !== undefined) {
                        for (i = 0; i < reasonCodeArray.length; i = i + 1) {
                            reasonCodes[i] = {
                                label: rsp.object.ReasonCodes.ReasonCode[i].label,
                                id: self._parseIdFromUriString(rsp.object.ReasonCodes.ReasonCode[i].uri)
                            };
                        }
                    } else {
                        reasonCodes[0] = {
                            label: rsp.object.ReasonCodes.ReasonCode.label,
                            id: self._parseIdFromUriString(rsp.object.ReasonCodes.ReasonCode.uri)
                        };
                    }
                    handlers.success(reasonCodes);
                },
                error: function (rsp) {
                    handlers.error(rsp);
                },
                content: contentBody
            });
        },
    
        /**
         * Performs a GET against Finesse server retrieving all the Signout reason codes.
         * Note that there is no return value; use the success handler to process a
         * valid return.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        getSignoutReasonCodes : function (handlers)
        {
            this._getReasonCodesByType("LOGOUT", handlers);
        },
    
        /**
         * Performs a GET against Finesse server retrieving all the Not Ready reason codes.
         * Note that there is no return value; use the success handler to process a
         * valid return.
         * @param {finesse.interfaces.RequestHandlers} handlers
         *     An object containing the handlers for the request
         */
        getNotReadyReasonCodes : function (handlers)
        {
            this._getReasonCodesByType("NOT_READY", handlers);
        }
    });
    
    User.States = /** @lends finesse.restservices.User.States.prototype */ {
            /**
             * User Login.  Note that while this is an action, is not technically a state, since a 
             * logged-in User will always be in a specific state (READY, NOT_READY, TALKING, etc.).
             */
            LOGIN: "LOGIN",
            /**
             * User is logged out.
             */
            LOGOUT: "LOGOUT",
            /**
             * User is not ready. Note that in UCCX implementations, the user is in this state while on a non-routed call.
             */
            NOT_READY: "NOT_READY",
            /**
             * User is ready for calls.
             */
            READY: "READY",
            /**
             * User has a call coming in, but has not answered it.
             */
            RESERVED: "RESERVED",
            /**
             * User has an outbound call being made, but has not been connected to it.
             */
            RESERVED_OUTBOUND: "RESERVED_OUTBOUND",
            /**
             * User has an outbound call's preview information being displayed, but has not acted on it.
             */
            RESERVED_OUTBOUND_PREVIEW: "RESERVED_OUTBOUND_PREVIEW",
            /**
             * User is on a call.  Note that in UCCX implementations, this is for routed calls only.
             */
            TALKING: "TALKING",
            /**
             * User is on hold.  Note that in UCCX implementations, the user remains in TALKING state while on hold.
             */
            HOLD: "HOLD",
            /**
             * User is wrap-up/work mode.  This mode is typically configured to time out, after which the user becomes NOT_READY.
             */
            WORK: "WORK",
            /**
             * This is the same as WORK, except that after time out user becomes READY.
             */
            WORK_READY: "WORK_READY",
            /**
             * @class Possible User state values.
             * @constructs
             */
            _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
          
        };
    
    User.WorkMode = { /** @lends finesse.restservices.User.WorkMode.prototype */
        /**
         * Mobile agent is connected (dialed) for each incoming call received.
         */
        CALL_BY_CALL: "CALL_BY_CALL",
        /**
         * Mobile agent is connected (dialed) at login.
         */
        NAILED_CONNECTION: "NAILED_CONNECTION",
        /**
         * @class Possible Mobile Agent Work Mode Types.
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
        
    };

    User.WrapUpMode = { /** @lends finesse.restservices.User.WrapUpMode.prototype */
        /**
         * Agent must go into wrap-up when call ends
         */
        REQUIRED: "REQUIRED",
        /**
         * Agent must go into wrap-up when call ends and must enter wrap-up data
         */
        REQUIRED_WITH_WRAP_UP_DATA: "REQUIRED_WITH_WRAP_UP_DATA",
        /**
         * Agent can choose to go into wrap-up on a call-by-call basis when the call ends
         */
        OPTIONAL: "OPTIONAL",
        /**
         * Agent is not allowed to go into wrap-up when call ends.
         */
        NOT_ALLOWED: "NOT_ALLOWED",
        /**
         * @class Possible Wrap-up Mode Types.
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
        
    };

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.User = User;
        
    return User;
}));

/**
 * JavaScript representation of the Finesse Users collection
 * object which contains a list of Users objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.RestCollectionBase
 * @requires finesse.restservices.User
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Users', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/User'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.User);
    }
}(function (RestCollectionBase, RestBase, User) {

	var Users = RestCollectionBase.extend(/** @lends finesse.restservices.Users.prototype */{

    /**
     * @class
     * JavaScript representation of a Users collection object. 
     * While there is no method provided to retrieve all Users, this collection is
     * used to return the Users in a supervised Team.
     * @augments finesse.restservices.RestCollectionBase
     * @constructs
     * @see finesse.restservices.Team
     * @see finesse.restservices.User
     * @see finesse.restservices.User#getSupervisedTeams
     * @example
     *  // Note: The following method gets an Array of Teams, not a Collection.
     *  _teams = _user.getSupervisedTeams();
     *  if (_teams.length > 0) {
     *      _team0Users = _teams[0].getUsers();
     *  }
     */
    _fakeConstuctor: function () {
        /* This is here to hide the real init constructor from the public docs */
    },
        
    /**
     * @private
     * JavaScript representation of the Finesse Users collection
     * object which contains a list of Users objects.
     *
	 * @param {Object} options
	 *     An object with the following properties:<ul>
     *         <li><b>id:</b> The id of the object being constructed</li>
     *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
     *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
     *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
     *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
     *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
     *             <li><b>status:</b> {Number} The HTTP status code returned</li>
     *             <li><b>content:</b> {String} Raw string of response</li>
     *             <li><b>object:</b> {Object} Parsed object of response</li>
     *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
     *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
     *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
     *             </ul></li>
     *         </ul></li>
     *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
     **/
	init: function (options) {
		this._super(options);
	},

	/**
     * @private
	 * Gets the REST class for the current object - this is the Users class.
	 */
	getRestClass: function () {
	    return Users;
	},

	/**
     * @private
	 * Gets the REST class for the objects that make up the collection. - this
	 * is the User class.
	 */
	getRestItemClass: function () {
		return User;
	},

	/**
     * @private
	 * Gets the REST type for the current object - this is a "Users".
	 */
	getRestType: function () {
	    return "Users";
	},

	/**
     * @private
	 * Gets the REST type for the objects that make up the collection - this is "User".
	 */
	getRestItemType: function () {
	    return "User";
	},

	/**
     * @private
     * Gets the node path for the current object - this is the team Users node
     * @returns {String} The node path
     */
    getXMPPNodePath: function () {
		return this.getRestUrl();
    },

    /**
     * @private
     * Overloading _doGET to reroute the GET to /Team/id from /Team/id/Users
     * This needs to be done because the GET /Team/id/Users API is missing
     * @returns {Users} This Users (collection) object to allow cascading
     */
    _doGET: function (handlers) {
        var _this = this;
        handlers = handlers || {};
        // Only do this for /Team/id/Users
        if (this._restObj && this._restObj.getRestType() === "Team") {
            this._restObj._doGET({
                success: function (rspObj) {
                    // Making sure the response was a valid Team
                    if (_this._restObj._validate(rspObj.object)) {
                        // Shimmying the response to look like a Users collection by extracting it from the Team response
                        rspObj.object[_this.getRestType()] = rspObj.object[_this._restObj.getRestType()][_this.getRestType().toLowerCase()];
                        handlers.success(rspObj);
                    } else {
                        handlers.error(rspObj);
                    }
                },
                error: handlers.error
            });
            return this; // Allow cascading
        } else {
            return this._super(handlers);
        }
    },

	/**
     * @private
     * Override default to indicates that the collection doesn't support making
	 * requests.
	 */
	supportsRequests: false,

    /**
     * @private
     * Indicates that this collection handles the subscription for its items
     */
    handlesItemSubscription: true,
	
    /**
     * @private
     * Override default to indicate that we need to subscribe explicitly
     */
    explicitSubscription: true
    
	});

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Users = Users;

	return Users;
}));

/**
 * JavaScript representation of the Finesse Team Not Ready Reason Code Assignment object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamNotReadyReasonCode', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {
    
    var TeamNotReadyReasonCode = RestBase.extend( {

        /**
         * @class
         * JavaScript representation of a Team Not Ready ReasonCode object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },
    
        /**
         * @private
         * Gets the REST class for the current object - this is the TeamNotReadyReasonCode class.
         * @returns {Object} The TeamNotReadyReasonCode class.
         */
        getRestClass: function () {
            return TeamNotReadyReasonCode;
        },
    
        /**
         * @private
         * Gets the REST type for the current object - this is a "ReasonCode".
         * @returns {String} The ReasonCode string.
         */
        getRestType: function () {
            return "ReasonCode";
        },
    
        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,
    
        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,
    
        /**
         * Getter for the category.
         * @returns {String} The category.
         */
        getCategory: function () {
            this.isLoaded();
            return this.getData().category;
        },
    
        /**
         * Getter for the code.
         * @returns {String} The code.
         */
        getCode: function () {
            this.isLoaded();
            return this.getData().code;
        },
    
        /**
         * Getter for the label.
         * @returns {String} The label.
         */
        getLabel: function () {
            this.isLoaded();
            return this.getData().label;
        },
    
        /**
         * Getter for the forAll value.
         * @returns {String} The forAll.
         */
        getForAll: function () {
            this.isLoaded();
            return this.getData().forAll;
        },
    
        /**
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        }

    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamNotReadyReasonCode = TeamNotReadyReasonCode;
        
    return TeamNotReadyReasonCode;
}));

/**
* JavaScript representation of the Finesse TeamNotReadyReasonCodes collection
* object which contains a list of TeamNotReadyReasonCode objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamNotReadyReasonCodes', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/TeamNotReadyReasonCode'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.TeamNotReadyReasonCode);
    }
}(function (RestCollectionBase, RestBase, TeamNotReadyReasonCode) {
    
    var TeamNotReadyReasonCodes = RestCollectionBase.extend( {

      /**
       * @class
       * JavaScript representation of a TeamNotReadyReasonCodes collection object. Also exposes
       * methods to operate on the object against the server.
       *
       * @param {Object} options
       *     An object with the following properties:<ul>
       *         <li><b>id:</b> The id of the object being constructed</li>
       *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
       *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
       *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
       *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
       *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
       *             <li><b>status:</b> {Number} The HTTP status code returned</li>
       *             <li><b>content:</b> {String} Raw string of response</li>
       *             <li><b>object:</b> {Object} Parsed object of response</li>
       *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
       *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
       *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
       *             </ul></li>
       *         </ul></li>
       *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
       * @augments finesse.restservices.RestCollectionBase
       * @constructs
       **/
      init: function (options) {
          this._super(options);
      },
    
      /**
       * @private
       * Gets the REST class for the current object - this is the TeamNotReadyReasonCodes class.
       */
      getRestClass: function () {
          return TeamNotReadyReasonCodes;
      },
    
      /**
       * @private
       * Gets the REST class for the objects that make up the collection. - this
       * is the TeamNotReadyReasonCode class.
       */
      getRestItemClass: function () {
          return TeamNotReadyReasonCode;
      },
    
      /**
       * @private
       * Gets the REST type for the current object - this is a "ReasonCodes".
       */
      getRestType: function () {
          return "ReasonCodes";
      },
    
      /**
       * @private
       * Overrides the parent class.  Returns the url for the NotReadyReasonCodes resource
       */
      getRestUrl: function () {
          // return ("/finesse/api/" + this.getRestType() + "?category=NOT_READY");
          var restObj = this._restObj,
              restUrl = "";
          //Prepend the base REST object if one was provided.
          //Otherwise prepend with the default webapp name.
          if (restObj instanceof RestBase) {
              restUrl += restObj.getRestUrl();
          }
          else {
              restUrl += "/finesse/api";
          }
          //Append the REST type.
          restUrl += "/ReasonCodes?category=NOT_READY";
          //Append ID if it is not undefined, null, or empty.
          if (this._id) {
              restUrl += "/" + this._id;
          }
          return restUrl;
      },
    
      /**
       * @private
       * Gets the REST type for the objects that make up the collection - this is "ReasonCode".
       */
      getRestItemType: function () {
          return "ReasonCode";
      },
    
      /**
       * @private
       * Override default to indicates that the collection supports making
       * requests.
       */
      supportsRequests: true,
    
      /**
       * @private
       * Override default to indicate that this object doesn't support subscriptions.
       */
      supportsRestItemSubscriptions: false,
    
      /**
       * @private
       * Retrieve the Not Ready Reason Codes.
       *
       * @returns {TeamNotReadyReasonCodes}
       *     This TeamNotReadyReasonCodes object to allow cascading.
       */
      get: function () {
          // set loaded to false so it will rebuild the collection after the get
          this._loaded = false;
          // reset collection
          this._collection = {};
          // perform get
          this._synchronize();
          return this;
      },
    
      /**
       * @private
       * Set up the PutSuccessHandler for TeamNotReadyReasonCodes
       * @param {Object} reasonCodes
       * @param {String} contentBody
       * @param successHandler    
       * @return {function}
       */
      createPutSuccessHandler: function (reasonCodes, contentBody, successHandler) {
          return function (rsp) {
              // Update internal structure based on response. Here we
              // inject the contentBody from the PUT request into the
              // rsp.object element to mimic a GET as a way to take
              // advantage of the existing _processResponse method.
              rsp.object = contentBody;
              reasonCodes._processResponse(rsp);
    
              //Remove the injected contentBody object before cascading response
              rsp.object = {};
    
              //cascade response back to consumer's response handler
              successHandler(rsp);
          };
      },
    
      /**
       * @private
       * Perform the REST API PUT call to update the reason code assignments for the team
       * @param {string[]} newValues
       * @param handlers     
       */
      update: function (newValues, handlers) {
          this.isLoaded();
          var contentBody = {}, contentBodyInner = [], i, innerObject = {};
    
          contentBody[this.getRestType()] = {
          };
    
          for (i in newValues) {
              if (newValues.hasOwnProperty(i)) {
                  innerObject = {
                      "uri": newValues[i]
                  };
                  contentBodyInner.push(innerObject);
              }
          }
    
          contentBody[this.getRestType()] = {
              "ReasonCode" : contentBodyInner
          };
    
          // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
          handlers = handlers || {};
    
          this.restRequest(this.getRestUrl(), {
              method: 'PUT',
              success: this.createPutSuccessHandler(this, contentBody, handlers.success),
              error: handlers.error,
              content: contentBody
          });
    
          return this; // Allow cascading
      }
  });
  
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamNotReadyReasonCodes = TeamNotReadyReasonCodes;
    
  return TeamNotReadyReasonCodes;
}));

/**
 * JavaScript representation of the Finesse Team Wrap Up Reason object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamWrapUpReason',['restservices/RestBase'], factory);
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {

	var TeamWrapUpReason = RestBase.extend({

    /**
     * @class
     * JavaScript representation of a TeamWrapUpReason object. Also exposes
     * methods to operate on the object against the server.
     *
     * @param {Object} options
     *     An object with the following properties:<ul>
     *         <li><b>id:</b> The id of the object being constructed</li>
     *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
     *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
     *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
     *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
     *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
     *             <li><b>status:</b> {Number} The HTTP status code returned</li>
     *             <li><b>content:</b> {String} Raw string of response</li>
     *             <li><b>object:</b> {Object} Parsed object of response</li>
     *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
     *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
     *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
     *             </ul></li>
     *         </ul></li>
     *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
     * @constructs
     **/
    init: function (options) {
        this._super(options);
    },

    /**
     * @private
     * Gets the REST class for the current object - this is the TeamWrapUpReason class.
     * @returns {Object} The TeamWrapUpReason class.
     */
    getRestClass: function () {
        return TeamWrapUpReason;
    },

    /**
     * @private
     * Gets the REST type for the current object - this is a "WrapUpReason".
     * @returns {String} The WrapUpReason string.
     */
    getRestType: function () {
        return "WrapUpReason";
    },

    /**
     * @private
     * Override default to indicate that this object doesn't support making
     * requests.
     */
    supportsRequests: false,

    /**
     * @private
     * Override default to indicate that this object doesn't support subscriptions.
     */
    supportsSubscriptions: false,

    /**
     * Getter for the label.
     * @returns {String} The label.
     */
    getLabel: function () {
        this.isLoaded();
        return this.getData().label;
    },

    /**
     * @private
     * Getter for the forAll value.
     * @returns {Boolean} True if global
     */
    getForAll: function () {
        this.isLoaded();
        return this.getData().forAll;
    },

    /**
     * @private
     * Getter for the Uri value.
     * @returns {String} The Uri.
     */
    getUri: function () {
        this.isLoaded();
        return this.getData().uri;
    }
	});

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamWrapUpReason = TeamWrapUpReason;

	return TeamWrapUpReason;
}));

/**
* JavaScript representation of the Finesse Team Wrap-Up Reasons collection
* object which contains a list of Wrap-Up Reasons objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamWrapUpReasons', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/TeamWrapUpReason'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.TeamWrapUpReason);
    } 
}(function (RestCollectionBase, RestBase, TeamWrapUpReason) {

	var TeamWrapUpReasons = RestCollectionBase.extend({

    /**
     * @class
     * JavaScript representation of a TeamWrapUpReasons collection object. Also exposes
     * methods to operate on the object against the server.
     *
     * @param {Object} options
     *     An object with the following properties:<ul>
     *         <li><b>id:</b> The id of the object being constructed</li>
     *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
     *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
     *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
     *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
     *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
     *             <li><b>status:</b> {Number} The HTTP status code returned</li>
     *             <li><b>content:</b> {String} Raw string of response</li>
     *             <li><b>object:</b> {Object} Parsed object of response</li>
     *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
     *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
     *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
     *             </ul></li>
     *         </ul></li>
     *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
     * @constructs
     **/
    init: function (options) {
        this._super(options);
    },

    /**
     * @private
     * Gets the REST class for the current object - this is the TeamWrapUpReasons class.
     */
    getRestClass: function () {
        return TeamWrapUpReasons;
    },

    /**
     * @private
     * Gets the REST class for the objects that make up the collection. - this
     * is the TeamWrapUpReason class.
     */
    getRestItemClass: function () {
        return TeamWrapUpReason;
    },

    /**
     * @private
     * Gets the REST type for the current object - this is a "WrapUpReasons".
     */
    getRestType: function () {
        return "WrapUpReasons";
    },

    /**
     * @private
     * Gets the REST type for the objects that make up the collection - this is "WrapUpReason".
     */
    getRestItemType: function () {
        return "WrapUpReason";
    },

    /**
     * @private
     * Override default to indicates that the collection supports making
     * requests.
     */
    supportsRequests: true,

    /**
     * @private
     * Override default to indicate that this object doesn't support subscriptions.
     */
    supportsRestItemSubscriptions: false,

    /**
     * Retrieve the Team Wrap Up Reasons.
     *
     * @returns {finesse.restservices.TeamWrapUpReasons}
     *     This TeamWrapUpReasons object to allow cascading.
     */
    get: function () {
        // set loaded to false so it will rebuild the collection after the get
        this._loaded = false;
        // reset collection
        this._collection = {};
        // perform get
        this._synchronize();
        return this;
    },

    /**
     * Set up the PutSuccessHandler for TeamWrapUpReasons
     * @param {Object} wrapUpReasons
     * @param {Object} contentBody
     * @param successHandler
     * @returns response
     */
    createPutSuccessHandler: function (wrapUpReasons, contentBody, successHandler) {
        return function (rsp) {
            // Update internal structure based on response. Here we
            // inject the contentBody from the PUT request into the
            // rsp.object element to mimic a GET as a way to take
            // advantage of the existing _processResponse method.
            rsp.object = contentBody;
            
            wrapUpReasons._processResponse(rsp);

            //Remove the injected contentBody object before cascading response
            rsp.object = {};

            //cascade response back to consumer's response handler
            successHandler(rsp);
        };
    },

    /**    
     * Perform the REST API PUT call to update the reason code assignments for the team
     * @param {String Array} newValues
     * @param handlers
     * @returns {Object} this
     */
    update: function (newValues, handlers) {
        this.isLoaded();
        var contentBody = {}, contentBodyInner = [], i, innerObject = {};

        contentBody[this.getRestType()] = {
        };

        for (i in newValues) {
            if (newValues.hasOwnProperty(i)) {
                innerObject = {
                    "uri": newValues[i]
                };
                contentBodyInner.push(innerObject);
            }
        }

        contentBody[this.getRestType()] = {
            "WrapUpReason" : contentBodyInner
        };

        // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
        handlers = handlers || {};

        this.restRequest(this.getRestUrl(), {
            method: 'PUT',
            success: this.createPutSuccessHandler(this, contentBody, handlers.success),
            error: handlers.error,
            content: contentBody
        });

        return this; // Allow cascading
    }
	});

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamWrapUpReasons = TeamWrapUpReasons;

	return TeamWrapUpReasons;
}));

/**
 * JavaScript representation of a TeamSignOutReasonCode.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamSignOutReasonCode', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    }
}(function (RestBase) {
    var TeamSignOutReasonCode = RestBase.extend({

        /**
         * @class
         * JavaScript representation of a TeamSignOutReasonCode object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         * @ignore
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the TeamSignOutReasonCode class.
         * @returns {Object} The TeamSignOutReasonCode class.
         */
        getRestClass: function () {
            return TeamSignOutReasonCode;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "ReasonCode".
         * @returns {String} The ReasonCode string.
         */
        getRestType: function () {
            return "ReasonCode";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the category.
         * @returns {String} The category.
         */
        getCategory: function () {
            this.isLoaded();
            return this.getData().category;
        },

        /**
         * Getter for the code.
         * @returns {String} The code.
         */
        getCode: function () {
            this.isLoaded();
            return this.getData().code;
        },

        /**
         * Getter for the label.
         * @returns {String} The label.
         */
        getLabel: function () {
            this.isLoaded();
            return this.getData().label;
        },

        /**
         * Getter for the forAll value.
         * @returns {String} The forAll.
         */
        getForAll: function () {
            this.isLoaded();
            return this.getData().forAll;
        },

        /**
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        }

    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamSignOutReasonCode = TeamSignOutReasonCode;
    
    return TeamSignOutReasonCode;
}));

/**
* JavaScript representation of the TeamSignOutReasonCodes collection
* object which contains a list of TeamSignOutReasonCode objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamSignOutReasonCodes', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/TeamSignOutReasonCode'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.TeamSignOutReasonCode);
    } 
}(function (RestCollectionBase, RestBase, TeamSignOutReasonCode) {
    
    var TeamSignOutReasonCodes = RestCollectionBase.extend({
        /**
         * @class
         * JavaScript representation of a TeamSignOutReasonCodes collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the TeamSignOutReasonCodes class.
         */
        getRestClass: function () {
            return TeamSignOutReasonCodes;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the TeamSignOutReasonCode class.
         */
        getRestItemClass: function () {
            return TeamSignOutReasonCode;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "ReasonCodes".
         */
        getRestType: function () {
            return "ReasonCodes";
        },

        /**
         * Overrides the parent class.  Returns the url for the SignOutReasonCodes resource
         */
        getRestUrl: function () {
            var restObj = this._restObj, restUrl = "";

            //Prepend the base REST object if one was provided.
            //Otherwise prepend with the default webapp name.
            if (restObj instanceof RestBase) {
                restUrl += restObj.getRestUrl();
            } else {
                restUrl += "/finesse/api";
            }
            //Append the REST type.
            restUrl += "/ReasonCodes?category=LOGOUT";
            //Append ID if it is not undefined, null, or empty.
            if (this._id) {
                restUrl += "/" + this._id;
            }
            return restUrl;
        },

        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "ReasonCode".
         */
        getRestItemType: function () {
            return "ReasonCode";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection does not subscribe to its objects.
         */
        supportsRestItemSubscriptions: false,

        /**
         * Retrieve the Sign Out Reason Codes.
         *
         * @returns {finesse.restservices.TeamSignOutReasonCodes}
         *     This TeamSignOutReasonCodes object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        },

        /* We only use PUT and GET on Reason Code team assignments
         * @param {Object} contact
         * @param {Object} contentBody
         * @param {Function} successHandler
         */
        createPutSuccessHandler: function (contact, contentBody, successHandler) {
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                contact._processResponse(rsp);

                //Remove the injected contentBody object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * Update - This should be all that is needed.
         * @param {Object} newValues
         * @param {Object} handlers
         * @returns {finesse.restservices.TeamSignOutReasonCodes}
         *     This TeamSignOutReasonCodes object to allow cascading.
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {}, contentBodyInner = [], i, innerObject = {};

            contentBody[this.getRestType()] = {
            };

            for (i in newValues) {
                if (newValues.hasOwnProperty(i)) {
                    innerObject = {
                        "uri": newValues[i]
                    };
                    contentBodyInner.push(innerObject);
                }
            }

            contentBody[this.getRestType()] = {
                "ReasonCode" : contentBodyInner
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        }

    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamSignOutReasonCodes = TeamSignOutReasonCodes;
    
    return TeamSignOutReasonCodes;
}));

/**
 * JavaScript representation of the Finesse PhoneBook Assignment object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/**
 * The following comment prevents JSLint errors concerning undefined global variables.
 * It tells JSLint that these identifiers are defined elsewhere.
 */
/*jslint bitwise:true, browser:true, nomen:true, regexp:true, sloppy:true, white:true */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global $, jQuery, Handlebars, dojox, dojo, finesse */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamPhoneBook', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    }
}(function (RestBase) {
    var TeamPhoneBook = RestBase.extend({

        /**
         * @class
         * JavaScript representation of a PhoneBook object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the PhoneBooks class.
         * @returns {Object} The PhoneBooks class.
         */
        getRestClass: function () {
            return TeamPhoneBook;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "PhoneBook".
         * @returns {String} The PhoneBook string.
         */
        getRestType: function () {
            return "PhoneBook";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the name.
         * @returns {String} The name.
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },

        /**
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        }

    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamPhoneBook = TeamPhoneBook;
    
    return TeamPhoneBook;
}));

/**
* JavaScript representation of the Finesse PhoneBook Assignments collection
* object which contains a list of Not Ready Reason Codes objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */

/**
 * The following comment prevents JSLint errors concerning undefined global variables.
 * It tells JSLint that these identifiers are defined elsewhere.
 */
/*jslint bitwise:true, browser:true, nomen:true, regexp:true, sloppy:true, white:true */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global $, jQuery, Handlebars, dojox, dojo, finesse */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamPhoneBooks', ['restservices/RestCollectionBase',
                 'restservices/RestBase',
                 'restservices/TeamPhoneBook'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.RestBase, finesse.restservices.TeamPhoneBook);
    } 
}(function (RestCollectionBase, RestBase, TeamPhoneBook) {
    var TeamPhoneBooks = RestCollectionBase.extend({
        
        /**
         * @class
         * JavaScript representation of a TeamPhoneBooks collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);           
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the TeamPhoneBooks class.
         */
        getRestClass: function () {
            return TeamPhoneBooks;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the TeamPhoneBooks class.
         */
        getRestItemClass: function () {
            return TeamPhoneBook;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "ReasonCodes".
         */
        getRestType: function () {
            return "PhoneBooks";
        },
        
        /**
         * Overrides the parent class.  Returns the url for the PhoneBooks resource
         */
        getRestUrl: function () {
            // return ("/finesse/api/" + this.getRestType() + "?category=NOT_READY");
            var restObj = this._restObj,
            restUrl = "";
            //Prepend the base REST object if one was provided.
            if (restObj instanceof RestBase) {
                restUrl += restObj.getRestUrl();
            }
            //Otherwise prepend with the default webapp name.
            else {
                restUrl += "/finesse/api";
            }
            //Append the REST type.
            restUrl += "/PhoneBooks";
            //Append ID if it is not undefined, null, or empty.
            if (this._id) {
                restUrl += "/" + this._id;
            }
            return restUrl;        
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "ReasonCode".
         */
        getRestItemType: function () {
            return "PhoneBook";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection subscribes to its objects.
         */
        supportsRestItemSubscriptions: false,
        
        /**
         * Retrieve the Not Ready Reason Codes.
         *
         * @returns {finesse.restservices.TeamPhoneBooks}
         *     This TeamPhoneBooks object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            /** @private */
            this._loaded = false;
            // reset collection
            /** @private */
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        },

        /* We only use PUT and GET on Reason Code team assignments 
         */
        createPutSuccessHandler: function(contact, contentBody, successHandler){
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                contact._processResponse(rsp);

                //Remove the injected Contact object before cascading response
                rsp.object = {};
                
                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * Update - This should be all that is needed.
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {}, contentBodyInner = [], i, innerObject;

            contentBody[this.getRestType()] = {
            };
        
            for (i in newValues) {
                if (newValues.hasOwnProperty(i)) {
                    innerObject = {};
                    innerObject = {
                        "uri": newValues[i]
                    };
                    contentBodyInner.push(innerObject);
                }
            }

            contentBody[this.getRestType()] = {
                "PhoneBook" : contentBodyInner
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        }       
        
    });
        
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamPhoneBooks = TeamPhoneBooks;
    
    return TeamPhoneBooks;
}));

/**
 * JavaScript representation of the Finesse LayoutConfig object
 * @requires ClientServices
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/LayoutConfig', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {
    /** @private */
	var LayoutConfig = RestBase.extend({

		/**
		 * @class
		 * JavaScript representation of a LayoutConfig object. Also exposes methods to operate
		 * on the object against the server.
		 *
		 * @param {String} id
		 *     Not required...
		 * @param {Object} callbacks
		 *     An object containing callbacks for instantiation and runtime
		 * @param {Function} callbacks.onLoad(this)
		 *     Callback to invoke upon successful instantiation
		 * @param {Function} callbacks.onLoadError(rsp)
		 *     Callback to invoke on instantiation REST request error
		 *     as passed by finesse.clientservices.ClientServices.ajax()
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response
		 *         error: {Object} Wrapped exception that was caught
		 *         error.errorType: {String} Type of error that was caught
		 *         error.errorMessage: {String} Message associated with error
		 *     }
		 * @param {Function} callbacks.onChange(this)
		 *     Callback to invoke upon successful update
		 * @param {Function} callbacks.onError(rsp)
		 *     Callback to invoke on update error (refresh or event)
		 *     as passed by finesse.clientservices.ClientServices.ajax()
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response
		 *         error: {Object} Wrapped exception that was caught
		 *         error.errorType: {String} Type of error that was caught
		 *         error.errorMessage: {String} Message associated with error
		 *     }
		 *  
	     * @constructs
		 */
		init: function (callbacks) {
			this._super("", callbacks);
			//when post is performed and id is empty
			/*if (id === "") {
				this._loaded = true;
			}*/
	        this._layoutxml = {};
		},
	
		/**
		 * Returns REST class of LayoutConfig object
		 */
		getRestClass: function () {
			return LayoutConfig;
		},
	
		/**
		 * The type of this REST object is LayoutConfig
		 */
		getRestType: function () {
			return "LayoutConfig";
		},

		/**
		 * Gets the REST URL of this object.
		 * 
		 * If the parent has an id, the id is appended.
		 * On occasions of POST, it will not have an id.
		 */
		getRestUrl: function () {
			var layoutUri = "/finesse/api/" + this.getRestType() + "/default";
			/*if (this._id) {
				layoutUri = layoutUri + "/" + this._id;
			}*/
			return layoutUri;
		},
	
		/**
		 * This API does not support subscription
		 */
		supportsSubscriptions: false,
		
		keepRestResponse: true,


		/**
		 * Gets finesselayout.xml retrieved from the API call
		 */
		getLayoutxml: function () {
			this.isLoaded();
			var layoutxml = this.getData().layoutxml;

            // We need to unescape everything that is unallowed in xml so consumers don't have to deal with it (used in tandem with update())
            layoutxml = layoutxml.replace(/&amp;/g,"&");

            return layoutxml;
		},
	
		/**
		 * Gets the type of this LayoutConfig object
		 */
		/*
		getType: function () {
			this.isLoaded();
			return this.getData().type;
		},*/
	
		/**
		 * Retrieve the LayoutConfig settings.
		 * If the id is not provided the API call will fail.
		 * @returns {LayoutConfig}
		 *     This LayoutConfig object to allow cascading.
		 */
		get: function () {      
			this._synchronize();
			return this;
		},

		/**
		 * Closure handle updating of the internal data for the LayoutConfig object
		 * upon a successful update (PUT) request before calling the intended
		 * success handler provided by the consumer
		 * 
		 * @param {Object}
		 *            layoutconfig Reference to this LayoutConfig object
		 * @param {Object}
		 *            LayoutConfig Object that contains the  settings to be
		 *            submitted in the api request
		 * @param {Function}
		 *            successHandler The success handler specified by the consumer
		 *            of this object
		 * @returns {LayoutConfig} This LayoutConfig object to allow cascading
		 */
	
		createPutSuccessHandler: function (layoutconfig, contentBody, successHandler) {
			return function (rsp) {			
				// Update internal structure based on response. Here we
				// inject the contentBody from the PUT request into the
				// rsp.object element to mimic a GET as a way to take
				// advantage of the existing _processResponse method.
				rsp.content = contentBody;
				rsp.object.LayoutConfig = {};
				rsp.object.LayoutConfig.finesseLayout = contentBody;
				layoutconfig._processResponse(rsp);
	
				//Remove the injected layoutConfig object before cascading response
				rsp.object.LayoutConfig = {};
	
				//cascade response back to consumer's response handler
				successHandler(rsp);
			};
		},
	
		/**
		 *  Update LayoutConfig
		 * @param {Object} finesselayout
		 *     The XML for FinesseLayout being stored
		 * 
		 * @param {Object} handlers
		 *     An object containing callback handlers for the request. Optional.
		 * @param {Function} options.success(rsp)
		 *     A callback function to be invoked for a successful request.
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response
		 *     }
		 * @param {Function} options.error(rsp)
		 *     A callback function to be invoked for an unsuccessful request.
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response (HTTP errors)
		 *         error: {Object} Wrapped exception that was caught
		 *         error.errorType: {String} Type of error that was caught
		 *         error.errorMessage: {String} Message associated with error
		 *     }
		 * @returns {finesse.restservices.LayoutConfig}
		 *     This LayoutConfig object to allow cascading
		 */
	
		update: function (layoutxml, handlers) {
			this.isLoaded();
			var contentBody = {};

			// We need to escape everything that is unallowed in xml so consumers don't have to deal with it (used in tandem with getLayoutxml())
			layoutxml = layoutxml.replace(/&(?!amp;)/g, "&amp;");

			contentBody[this.getRestType()] = {
				"layoutxml": finesse.utilities.Utilities.translateHTMLEntities(layoutxml, true)
			};

			// Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
			handlers = handlers || {};

			this.restRequest(this.getRestUrl(), {
				method: 'PUT',
				success: this.createPutSuccessHandler(this, layoutxml, handlers.success),
				error: handlers.error,
				content: contentBody
			});

			return this; // Allow cascading
		}
	
		/**
		 *TODO createPostSuccessHandler needs to be debugged to make it working
		 * Closure handle creating new  LayoutConfig object
		 * upon a successful create (POST) request before calling the intended
		 * success handler provided by the consumer
		 * 
		 * @param {Object}
		 *            layoutconfig Reference to this LayoutConfig object
		 * @param {Object}
		 *            LayoutConfig Object that contains the  settings to be
		 *            submitted in the api request
		 * @param {Function}
		 *            successHandler The success handler specified by the consumer
		 *            of this object
		 * @returns {finesse.restservices.LayoutConfig} This LayoutConfig object to allow cascading
		 */
	/*
		createPostSuccessHandler: function (layoutconfig, contentBody, successHandler) {
			return function (rsp) {
	
				rsp.object = contentBody;
				layoutconfig._processResponse(rsp);
	
				//Remove the injected layoutConfig object before cascading response
				rsp.object = {};
	
				//cascade response back to consumer's response handler
				successHandler(rsp);
			};
		}, */
	
		/**
		 * TODO Method needs to be debugged to make POST working
		 *  Add LayoutConfig
		 * @param {Object} finesselayout
		 *     The XML for FinesseLayout being stored
		 * 
		 * @param {Object} handlers
		 *     An object containing callback handlers for the request. Optional.
		 * @param {Function} options.success(rsp)
		 *     A callback function to be invoked for a successful request.
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response
		 *     }
		 * @param {Function} options.error(rsp)
		 *     A callback function to be invoked for an unsuccessful request.
		 *     {
		 *         status: {Number} The HTTP status code returned
		 *         content: {String} Raw string of response
		 *         object: {Object} Parsed object of response (HTTP errors)
		 *         error: {Object} Wrapped exception that was caught
		 *         error.errorType: {String} Type of error that was caught
		 *         error.errorMessage: {String} Message associated with error
		 *     }
		 * @returns {finesse.restservices.LayoutConfig}
		 *     This LayoutConfig object to allow cascading
		 */
	/*
		add: function (layoutxml, handlers) {
			this.isLoaded();
			var contentBody = {};
	
	
			contentBody[this.getRestType()] = {
					"layoutxml": layoutxml,
					"type": "current"
			    };
	
			// Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
			handlers = handlers || {};
	
			this.restRequest(this.getRestUrl(), {
				method: 'POST',
				success: this.createPostSuccessHandler(this, contentBody, handlers.success),
				error: handlers.error,
				content: contentBody
			});
	
			return this; // Allow cascading
		} */
	});
	
	window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.LayoutConfig = LayoutConfig;
    
	return LayoutConfig;
	
}));

/**
 * JavaScript representation of the Finesse LayoutConfig object for a Team.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.utilities.Utilities
 * @requires finesse.restservices.LayoutConfig
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global Exception */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamLayoutConfig', ['restservices/RestBase',
                 'utilities/Utilities',
                 'restservices/LayoutConfig'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase, finesse.utilities.Utilities, finesse.restservices.LayoutConfig);
    }
}(function (RestBase, Utilities, LayoutConfig) {
    
    var TeamLayoutConfig = RestBase.extend({
      // Keep the restresponse so we can parse the layoutxml out of it in getLayoutXML()
      keepRestResponse: true,
    
      /**
       * @class
       * JavaScript representation of a LayoutConfig object for a Team. Also exposes
       * methods to operate on the object against the server.
       *
       * @param {Object} options
       *     An object with the following properties:<ul>
       *         <li><b>id:</b> The id of the object being constructed</li>
       *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
       *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
       *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
       *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
       *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
       *             <li><b>status:</b> {Number} The HTTP status code returned</li>
       *             <li><b>content:</b> {String} Raw string of response</li>
       *             <li><b>object:</b> {Object} Parsed object of response</li>
       *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
       *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
       *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
       *             </ul></li>
       *         </ul></li>
       *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
       * @constructs
       **/
      init: function (options) {
          this._super(options);
      },
    
      /**
       * @private
       * Gets the REST class for the current object - this is the LayoutConfigs class.
       * @returns {Object} The LayoutConfigs class.
       */
      getRestClass: function () {
          return TeamLayoutConfig;
      },
    
      /**
       * @private
       * Gets the REST type for the current object - this is a "LayoutConfig".
       * @returns {String} The LayoutConfig string.
       */
      getRestType: function () {
          return "TeamLayoutConfig";
      },
    
      /**
       * @private
       * Override default to indicate that this object doesn't support making
       * requests.
       */
      supportsRequests: false,
    
      /**
       * @private
       * Override default to indicate that this object doesn't support subscriptions.
       */
      supportsSubscriptions: false,
    
      /**
       * Getter for the category.
       * @returns {String} The category.
       */
      getLayoutXML: function () {
          this.isLoaded();
          var layoutxml = this.getData().layoutxml;

          // We need to unescape everything that is unallowed in xml so consumers don't have to deal with it (used in tandem with put())
          layoutxml = layoutxml.replace(/&amp;/g,"&");

          return layoutxml;
      },
    
      /**
       * Getter for the code.
       * @returns {String} The code.
       */
      getUseDefault: function () {
          this.isLoaded();
          return this.getData().useDefault;
      },
      
      /**
       * Retrieve the TeamLayoutConfig.
       *
       * @returns {finesse.restservices.TeamLayoutConfig}
       */
      get: function () {
          // this._id is needed, but is not used in this object.. we're overriding getRestUrl anyway
          this._id = "0";
          // set loaded to false so it will rebuild the collection after the get
          this._loaded = false;
          // reset collection
          this._collection = {};
          // perform get
          this._synchronize();
          return this;
      },
    
      createPutSuccessHandler: function(contact, contentBody, successHandler){
          return function (rsp) {
              // Update internal structure based on response. Here we
              // inject the contentBody from the PUT request into the
              // rsp.object element to mimic a GET as a way to take
              // advantage of the existing _processResponse method.
              rsp.object = contentBody;
              contact._processResponse(rsp);
    
              //Remove the injected Contact object before cascading response
              rsp.object = {};
              
              //cascade response back to consumer's response handler
              successHandler(rsp);
          };
      },
      
      put: function (newValues, handlers) {
          // this._id is needed, but is not used in this object.. we're overriding getRestUrl anyway
          this._id = "0";
          this.isLoaded();

          // We need to escape everything that is unallowed in xml so consumers don't have to deal with it (used in tandem with getLayoutxml())
          var layoutxml = newValues.layoutXML.replace(/&(?!amp;)/g, "&amp;"),
              contentBody = {};
          
          contentBody[this.getRestType()] = {
              "useDefault": newValues.useDefault,
              // The LayoutConfig restservice javascript class only translates ampersands, so we'll do that also
              "layoutxml": finesse.utilities.Utilities.translateHTMLEntities(layoutxml, true)
          };
    
          // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
          handlers = handlers || {};
    
          this.restRequest(this.getRestUrl(), {
              method: 'PUT',
              success: this.createPutSuccessHandler(this, contentBody, handlers.success),
              error: handlers.error,
              content: contentBody
          });
    
          return this; // Allow cascading
      },
    
      getRestUrl: function(){
          // return team's url + /LayoutConfig
          // eg: /api/Team/1/LayoutConfig
          if(this._restObj === undefined){
              throw new Exception("TeamLayoutConfig instances must have a parent team object.");
          }
          return this._restObj.getRestUrl() + '/LayoutConfig';
      }
    
      });
        
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamLayoutConfig = TeamLayoutConfig;
      
      return TeamLayoutConfig;
}));

/**
 * JavaScript representation of a TeamWorkflow.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamWorkflow', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {

    var TeamWorkflow = RestBase.extend({

        /**
         * @class
         * JavaScript representation of a TeamWorkflow object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status description returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the TeamWorkflow class.
         * @returns {Object} The TeamWorkflow class.
         */
        getRestClass: function () {
            return TeamWorkflow;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Workflow".
         * @returns {String} The Workflow string.
         */
        getRestType: function () {
            return "Workflow";
        },

        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsRequests: false,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsSubscriptions: false,

        /**
         * Getter for the name.
         * @returns {String} The name.
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },

        /**
         * Getter for the description.
         * @returns {String} The description.
         */
        getDescription: function () {
            this.isLoaded();
            return this.getData().description;
        },

        /**
         * Getter for the Uri value.
         * @returns {String} The Uri.
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;
        }

    });
    
	window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamWorkflow = TeamWorkflow;

    return TeamWorkflow;
}));

/**
* JavaScript representation of the TeamWorkflows collection
* object which contains a list of TeamWorkflow objects.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.Dialog
 * @requires finesse.restservices.RestCollectionBase
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/TeamWorkflows', ['restservices/RestCollectionBase',
                 'restservices/TeamWorkflow',
                 'restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.TeamWorkflow, finesse.restservices.RestBase);
    } 
}(function (RestCollectionBase, TeamWorkflow, RestBase) {

    var TeamWorkflows = RestCollectionBase.extend({
    
        /**
         * @class
         * JavaScript representation of a TeamWorkflows collection object. Also exposes
         * methods to operate on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the TeamWorkflows class.
         */
        getRestClass: function () {
            return TeamWorkflows;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the TeamWorkflow class.
         */
        getRestItemClass: function () {
            return TeamWorkflow;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Workflows".
         */
        getRestType: function () {
            return "Workflows";
        },

        /**
         * Overrides the parent class.  Returns the url for the Workflows resource
         */
        getRestUrl: function () {
            var restObj = this._restObj, restUrl = "";

            //Prepend the base REST object if one was provided.
            //Otherwise prepend with the default webapp name.
            if (restObj instanceof RestBase) {
                restUrl += restObj.getRestUrl();
            } else {
                restUrl += "/finesse/api/Team";
            }
            //Append ID if it is not undefined, null, or empty.
            if (this._id) {
                restUrl += "/" + this._id;
            }
            //Append the REST type.
            restUrl += "/Workflows";
            
            return restUrl;
        },

        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "Workflow".
         */
        getRestItemType: function () {
            return "Workflow";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicates that the collection does not subscribe to its objects.
         */
        supportsRestItemSubscriptions: false,

        /**
         * Retrieve the Sign Out Reason Codes.
         *
         * @returns {finesse.restservices.TeamWorkflows}
         *     This TeamWorkflows object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        },

        /* We only use PUT and GET on Reason Code team assignments
         * @param {Object} contact
         * @param {Object} contentBody
         * @param {Function} successHandler
         */
        createPutSuccessHandler: function (contact, contentBody, successHandler) {
            return function (rsp) {
                // Update internal structure based on response. Here we
                // inject the contentBody from the PUT request into the
                // rsp.object element to mimic a GET as a way to take
                // advantage of the existing _processResponse method.
                rsp.object = contentBody;
                contact._processResponse(rsp);

                //Remove the injected contentBody object before cascading response
                rsp.object = {};

                //cascade response back to consumer's response handler
                successHandler(rsp);
            };
        },

        /**
         * Update - This should be all that is needed.
         * @param {Object} newValues
         * @param {Object} handlers
         * @returns {finesse.restservices.TeamWorkflows}
         *     This TeamWorkflows object to allow cascading.
         */
        update: function (newValues, handlers) {
            this.isLoaded();
            var contentBody = {}, contentBodyInner = [], i, innerObject = {};

            contentBody[this.getRestType()] = {
            };

            for (i in newValues) {
                if (newValues.hasOwnProperty(i)) {
                    innerObject = {
                        "uri": newValues[i]
                    };
                    contentBodyInner.push(innerObject);
                }
            }

            contentBody[this.getRestType()] = {
                "Workflow" : contentBodyInner
            };

            // Protect against null dereferencing of options allowing its (nonexistent) keys to be read as undefined
            handlers = handlers || {};

            this.restRequest(this.getRestUrl(), {
                method: 'PUT',
                success: this.createPutSuccessHandler(this, contentBody, handlers.success),
                error: handlers.error,
                content: contentBody
            });

            return this; // Allow cascading
        }

    });
    
	window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.TeamWorkflows = TeamWorkflows;
    
    return TeamWorkflows;
}));

/**
 * JavaScript representation of the Finesse Team REST object.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.RestCollectionBase
 * @requires finesse.restservices.User
 * @requires finesse.restservices.Users
 */

/**
 * The following comment prevents JSLint errors concerning undefined global variables.
 * It tells JSLint that these identifiers are defined elsewhere.
 */
/*jslint bitwise:true, browser:true, nomen:true, regexp:true, sloppy:true, white:true */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global $, jQuery, Handlebars, dojox, dojo, finesse */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Team', ['restservices/RestBase',
                 'utilities/Utilities',
                 'restservices/Users',
                 'restservices/TeamNotReadyReasonCodes',
                 'restservices/TeamWrapUpReasons',
                 'restservices/TeamSignOutReasonCodes',
                 'restservices/TeamPhoneBooks',
                 'restservices/TeamLayoutConfig',
                 'restservices/TeamWorkflows'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase,
                finesse.utilities.Utilities,
                finesse.restservices.Users,
                finesse.restservices.TeamNotReadyReasonCodes,
                finesse.restservices.TeamWrapUpReasons,
                finesse.restservices.TeamSignOutReasonCodes,
                finesse.restservices.TeamPhoneBooks,
                finesse.restservices.TeamLayoutConfig,
                finesse.restservices.TeamWorkflows);
    }
}(function (RestBase, Utilities, Users, TeamNotReadyReasonCodes, TeamWrapUpReasons, TeamSignOutReasonCodes, TeamPhoneBooks, TeamLayoutConfig, TeamWorkflows) {
    var Team = RestBase.extend(/** @lends finesse.restservices.Team.prototype */{
        
        _teamLayoutConfig: null,

        /**
         * @class
         * A Team is a set of Agent Users, typically supervised by one or more Supervisor Users.
         *
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.User#getSupervisedTeams
         * @see finesse.restservices.Users
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
        /**
         * @private
         * @class
         * JavaScript representation of a Team object. Also exposes methods to operate
         * on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (options) {
            this._super(options);
        },
    
        /**
         * @private
         * Gets the REST class for the current object - this is the Team class.
         * @returns {Object} The Team constructor.
         */
        getRestClass: function () {
            return finesse.restesrvices.Team;
        },
    
        /**
         * @private
         * Gets the REST type for the current object - this is a "Team".
         * @returns {String} The Team string.
         */
        getRestType: function () {
            return "Team";
        },
    
        /**
         * @private
         * Override default to indicate that this object doesn't support making
         * requests.
         */
        supportsSubscriptions: false,
    
        /**
         * Getter for the team id.
         * @returns {String} The team id.
         */
        getId: function () {
            this.isLoaded();
            return this.getData().id;
        },
    
        /**
         * Getter for the team name.
         * @returns {String} The team name
         */
        getName: function () {
            this.isLoaded();
            return this.getData().name;
        },
    
        /**
         * @private
         * Getter for the team uri.
         * @returns {String} The team uri
         */
        getUri: function () {
            this.isLoaded();
            return this.getData().uri;        
        },
    
        /**
         * Constructs and returns a collection of Users.
         * @param {finesse.interfaces.RestObjectHandlers} [handlers] Object that sets callback handlers.
         * @returns {finesse.restservices.Users} Users collection of User objects.
         */
        getUsers: function (options) {
            this.isLoaded();
            options = options || {};
    
            options.parentObj = this;
            // We are using getData() instead of getData.Users because the superclass (RestCollectionBase)
            // for Users needs the "Users" key to validate the provided payload matches the class type.
            options.data = this.getData();
    
            return new Users(options);
        },
    
        /**
         * @private
         * Getter for a teamNotReadyReasonCodes collection object that is associated with Team.
         * @param callbacks
         * @returns {teamNotReadyReasonCodes}
         *     A teamNotReadyReasonCodes collection object.
         */
        getTeamNotReadyReasonCodes: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (!this._teamNotReadyReasonCodes) {
                this._teamNotReadyReasonCodes = new TeamNotReadyReasonCodes(options);
            }
    
            return this._teamNotReadyReasonCodes;
        },
    
        /**
         * @private
         * Getter for a teamWrapUpReasons collection object that is associated with Team.
         * @param callbacks
         * @returns {teamWrapUpReasons}
         *     A teamWrapUpReasons collection object.
         */
        getTeamWrapUpReasons: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (!this._teamWrapUpReasons) {
                this._teamWrapUpReasons = new TeamWrapUpReasons(options);
            }
    
            return this._teamWrapUpReasons;
        },
    
        /**
         * @private
         * Getter for a teamSignOutReasonCodes collection object that is associated with Team.
         * @param callbacks
         * @returns {teamSignOutReasonCodes}
         *     A teamSignOutReasonCodes collection object.
         */
    
        getTeamSignOutReasonCodes: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (!this._teamSignOutReasonCodes) {
                this._teamSignOutReasonCodes = new TeamSignOutReasonCodes(options);
            }
    
            return this._teamSignOutReasonCodes;
        },
    
        /**
         * @private
         * Getter for a teamPhoneBooks collection object that is associated with Team.
         * @param callbacks
         * @returns {teamPhoneBooks}
         *     A teamPhoneBooks collection object.
         */
        getTeamPhoneBooks: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (!this._phonebooks) {
                this._phonebooks = new TeamPhoneBooks(options);
            }
    
            return this._phonebooks;
        },
    
        /**
         * @private
         * Getter for a teamWorkflows collection object that is associated with Team.
         * @param callbacks
         * @returns {teamWorkflows}
         *     A teamWorkflows collection object.
         */
        getTeamWorkflows: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (!this._workflows) {
                this._workflows = new TeamWorkflows(options);
            }
    
            return this._workflows;
        },
    
        /**
         * @private
         * Getter for a teamLayoutConfig object that is associated with Team.
         * @param callbacks
         * @returns {teamLayoutConfig}
         */
        getTeamLayoutConfig: function (callbacks) {
            var options = callbacks || {};
            options.parentObj = this;
            this.isLoaded();
    
            if (this._teamLayoutConfig === null) {
                this._teamLayoutConfig = new TeamLayoutConfig(options);
            }
    
            return this._teamLayoutConfig;
        }
    
    });
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Team = Team;
    
    return Team;    
}));

/**
 * JavaScript representation of the Finesse Teams collection.
 * object which contains a list of Team objects
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 * @requires finesse.restservices.RestCollectionBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/Teams', ['restservices/RestCollectionBase',
                 'restservices/Team'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestCollectionBase, finesse.restservices.Team);
    } 
}(function (RestCollectionBase, Team) {
    /** @private */
    var Teams = RestCollectionBase.extend({

        /**
         * @class
         * JavaScript representation of a Teams collection object. Also exposes methods to operate
         * on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         * @constructs
         **/
        init: function (options) {
            this._super(options);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the Teams class.
         * @returns {Object} The Teams constructor.
         */
        getRestClass: function () {
            return Teams;
        },

        /**
         * @private
         * Gets the REST class for the objects that make up the collection. - this
         * is the Team class.
         */
        getRestItemClass: function () {
            return Team;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "Teams".
         * @returns {String} The Teams string.
         */
        getRestType: function () {
            return "Teams";
        },
        
        /**
         * @private
         * Gets the REST type for the objects that make up the collection - this is "Team".
         */
        getRestItemType: function () {
            return "Team";
        },

        /**
         * @private
         * Override default to indicates that the collection supports making
         * requests.
         */
        supportsRequests: true,

        /**
         * @private
         * Override default to indicate that this object doesn't support subscriptions.
         */
        supportsRestItemSubscriptions: false,
        
        /**
         * @private
         * Retrieve the Teams.  This call will re-query the server and refresh the collection.
         *
         * @returns {finesse.restservices.Teams}
         *     This Teams object to allow cascading.
         */
        get: function () {
            // set loaded to false so it will rebuild the collection after the get
            this._loaded = false;
            // reset collection
            this._collection = {};
            // perform get
            this._synchronize();
            return this;
        }

    });

    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.Teams = Teams;
    
    return Teams;
}));

/**
 * JavaScript representation of the Finesse SystemInfo object
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 * @requires finesse.FinesseBase
 * @requires finesse.restservices.RestBase
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('restservices/SystemInfo', ['restservices/RestBase'], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.restservices.RestBase);
    } 
}(function (RestBase) {
    
    var SystemInfo = RestBase.extend(/** @lends finesse.restservices.SystemInfo.prototype */{
        /**
         * @private
         * Returns whether this object supports subscriptions
         */
        supportsSubscriptions: false,

        doNotRefresh: true,
      
        /**
         * @class
         * JavaScript representation of a SystemInfo object.
         * 
         * @augments finesse.restservices.RestBase
         * @see finesse.restservices.SystemInfo.Statuses
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here to hide the real init constructor from the public docs */
        },
        
         /**
         * @private
         * JavaScript representation of a SystemInfo object. Also exposes methods to operate
         * on the object against the server.
         *
         * @param {Object} options
         *     An object with the following properties:<ul>
         *         <li><b>id:</b> The id of the object being constructed</li>
         *         <li><b>onLoad(this): (optional)</b> when the object is successfully loaded from the server</li>
         *         <li><b>onChange(this): (optional)</b> when an update notification of the object is received</li>
         *         <li><b>onAdd(this): (optional)</b> when a notification that the object is created is received</li>
         *         <li><b>onDelete(this): (optional)</b> when a notification that the object is deleted is received</li>
         *         <li><b>onError(rsp): (optional)</b> if loading of the object fails, invoked with the error response object:<ul>
         *             <li><b>status:</b> {Number} The HTTP status code returned</li>
         *             <li><b>content:</b> {String} Raw string of response</li>
         *             <li><b>object:</b> {Object} Parsed object of response</li>
         *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
         *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
         *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
         *             </ul></li>
         *         </ul></li>
         *         <li><b>parentObj: (optional)</b> The parent object</li></ul>
         **/
        init: function (id, callbacks, restObj)
        {
            this._super(id, callbacks, restObj);
        },

        /**
         * @private
         * Gets the REST class for the current object - this is the SystemInfo object.
         */
        getRestClass: function () {
            return SystemInfo;
        },

        /**
         * @private
         * Gets the REST type for the current object - this is a "SystemInfo".
         */
        getRestType: function ()
        {
            return "SystemInfo";
        },
        
        _validate: function (obj)
        {
            return true;
        },
        
        /**
         * Returns the status of the Finesse system.
         *   IN_SERVICE if the Finesse API reports that it is in service,
         *   OUT_OF_SERVICE otherwise.
         * @returns {finesse.restservices.SystemInfo.Statuses} System Status
         */
        getStatus: function () {
            this.isLoaded();
            return this.getData().status;
        },
        
        /**
         * Returns the current timestamp from this SystemInfo object.
         *   This is used to calculate time drift delta between server and client.
         *  @returns {String} Time (GMT): yyyy-MM-dd'T'HH:mm:ss'Z'
         */
        getCurrentTimestamp: function () {
            this.isLoaded();
            return this.getData().currentTimestamp;
        },
        
        /**
         * Getter for the xmpp domain of the system.
         * @returns {String} The xmpp domain corresponding to this SystemInfo object.
         */
        getXmppDomain: function () {
            this.isLoaded();
            return this.getData().xmppDomain;
        },
        
        /**
         * Getter for the xmpp pubsub domain of the system.
         * @returns {String} The xmpp pubsub domain corresponding to this SystemInfo object.
         */
        getXmppPubSubDomain: function () {
            this.isLoaded();
            return this.getData().xmppPubSubDomain;
        },

        /**
         * Getter for the deployment type (UCCE or UCCX).
         * @returns {String} "UCCE" or "UCCX"
         */ 
        getDeploymentType: function () {
            this.isLoaded();
            return this.getData().deploymentType;
        },

        /**
         * Returns whether this is a single node deployment or not by checking for the existence of the secondary node in SystemInfo.
         * @returns {Boolean} True for single node deployments, false otherwise.
         */ 
        isSingleNode: function () {
            var secondary = this.getData().secondaryNode;
            if (secondary && secondary.host) {
                return false;
            }
            return true;
        },

        /**
         * Checks all arguments against the primary and secondary hosts (FQDN) and returns the match.
         * This is useful for getting the FQDN of the current Finesse server.
         * @param {String} ...arguments[]... - any number of arguments to match against
         * @returns {String} FQDN (if properly configured) of the matched host of the primary or secondary node, or undefined if no match is found.
         */ 
        getThisHost: function () {
            var i,
            primary = this.getData().primaryNode,
            secondary = this.getData().secondaryNode;

            for (i = 0; (i < arguments.length); i = i + 1) {
                if (primary && arguments[i] === primary.host) {
                    return primary.host;
                } else if (secondary && arguments[i] === secondary.host) {
                    return secondary.host;
                }
            }
        },

        /**
         * Checks all arguments against the primary and secondary hosts (FQDN) and returns the other node.
         * This is useful for getting the FQDN of the other Finesse server, i.e. for failover purposes.
         * @param {String} arguments - any number of arguments to match against
         * @returns {String} FQDN (if properly configured) of the alternate node, defaults to primary if no match is found, undefined for single node deployments.
         */ 
        getAlternateHost: function () {
            var i,
            isPrimary = false,
            primary = this.getData().primaryNode,
            secondary = this.getData().secondaryNode,
            xmppDomain = this.getData().xmppDomain,
            alternateHost;

            if (primary && primary.host) {
                    if (xmppDomain === primary.host) {
                        isPrimary = true;
                    }
                if (secondary && secondary.host) {
                    if (isPrimary) {
                        return secondary.host;
                    }
                    return primary.host;
                }
            }
        }
    });
    
    SystemInfo.Statuses = /** @lends finesse.restservices.SystemInfo.Statuses.prototype */ { 
        /** 
         * Finesse is in service. 
         */
        IN_SERVICE: "IN_SERVICE",
        /** 
         * Finesse is not in service. 
         */
        OUT_OF_SERVICE: "OUT_OF_SERVICE",
        /**
         * @class SystemInfo status values.
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly

    };
    
    window.finesse = window.finesse || {};
    window.finesse.restservices = window.finesse.restservices || {};
    window.finesse.restservices.SystemInfo = SystemInfo;
    
    return SystemInfo;
}));

/**
 * Provides standard way resolve message keys with substitution
 *
 * @requires finesse.container.I18n or gadgets.Prefs
 */

// Add Utilities to the finesse.utilities namespace
var finesse = finesse || {};
finesse.utilities = finesse.utilities || {};

(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('utilities/I18n', [], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        finesse.utilities.I18n = factory();
    }
}(function () {
    var I18n = (function () {

        /**
         * Shortcut to finesse.container.I18n.getMsg or gadgets.Prefs.getMsg
         * @private
         */
        var _getMsg;

        return {
            /**
             * Provides a message resolver for this utility singleton.
             * @param {Function} getMsg
             *     A function that returns a string given a message key.
             *     If the key is not found, this function must return 
             *     something that tests false (i.e. undefined or "").
             */
            setGetter : function (getMsg) {
                _getMsg = getMsg;
            },

            /**
             * Resolves the given message key, also performing substitution.
             * This generic utility will use a custom function to resolve the key
             * provided by finesse.utilities.I18n.setGetter. Otherwise, it will 
             * discover either finesse.container.I18n.getMsg or gadgets.Prefs.getMsg
             * upon the first invocation and store that reference for efficiency.
             * 
             * Since this will construct a new gadgets.Prefs object, it is recommended
             * for gadgets to explicitly provide the setter to prevent duplicate
             * gadgets.Prefs objects. This does not apply if your gadget does not need
             * access to gadgets.Prefs other than getMsg. 
             * 
             * @param {String} key
             *     The key to lookup
             * @param {String} arguments
             *     Arguments for substitution
             * @returns {String/Function}
             *     The resolved string if successful, otherwise a function that returns
             *     a '???' string that can also be casted into a string.
             */
            getString : function (key) {
                var prefs, i, retStr, noMsg, getFailed = "";
                if (!_getMsg) {
                    if (finesse.container && finesse.container.I18n) {
                        _getMsg = finesse.container.I18n.getMsg;
                    } else if (gadgets) {
                        prefs = new gadgets.Prefs();
                        _getMsg = prefs.getMsg;
                    }
                }
                
                try {
                    retStr = _getMsg(key);
                } catch (e) {
                    getFailed = "finesse.utilities.I18n.getString(): invalid _getMsg";
                }
                
                if (retStr) { // Lookup was successful, perform substitution (if any)
                    for (i = 1; i < arguments.length; i += 1) {
                        retStr = retStr.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), arguments[i]);
                    }
                    //in order to fix French text with single quotes in it, we need to replace \' with '
                    return retStr.replace(/\\'/g, "'");
                }
                // We want a function because jQuery.html() and jQuery.text() is smart enough to invoke it.
                /** @private */
                noMsg = function () {
                    return "???" + key + "???" + getFailed;
                };
                // We overload the toString() of this "function" to allow JavaScript to cast it into a string
                // For example, var myMsg = "something " + finesse.utilities.I18n.getMsg("unresolvable.key");
                /** @private */
                noMsg.toString = function () {
                    return "???" + key + "???" + getFailed;
                };
                return noMsg;

            }
        };
    }());
    
    return I18n;
}));

/**
 * Logging.js: provides simple logging for clients to use and overrides synchronous native methods: alert(), confirm(), and prompt().
 * 
 * On Firefox, it will hook into console for logging.  On IE, it will log to the status bar. 
 */
// Add Utilities to the finesse.utilities namespace
var finesse = finesse || {};
finesse.utilities = finesse.utilities || {};

(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('utilities/Logger', [], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        finesse.utilities.Logger = factory();
    }
}(function () {
    var Logger = (function () {
        
        var
        
        /** @private **/
        debugOn,
        
        /**
         * Pads a single digit number for display purposes (e.g. '4' shows as '04')
         * @param num is the number to pad to 2 digits
         * @returns a two digit padded string
         * @private
         */
        padTwoDigits = function (num) {        
            return (num < 10) ? '0' + num : num;  
        },
        
        /**
         * Checks to see if we have a console - this allows us to support Firefox or IE.
         * @returns {Boolean} True for Firefox, False for IE
         * @private
         */
        hasConsole = function () {
            var retval = false;
            try
            {
                if (window.console !== undefined) 
                {
                    retval = true;
                }
            } 
            catch (err)
            {
                retval = false;
            }
              
            return retval;
        },
        
        /**
         * Gets a timestamp.
         * @returns {String} is a timestamp in the following format: HH:MM:SS
         * @private
         */
        getTimeStamp = function () {
            var date = new Date(), timeStr;
            timeStr = padTwoDigits(date.getHours()) + ":" + padTwoDigits(date.getMinutes()) + ":" + padTwoDigits(date.getSeconds());

            return timeStr;
        };
        
        return {
            /**
             * Enable debug mode. Debug mode may impact performance on the UI.
             *
             * @param {Boolean} enable
             *      True to enable debug logging.
             * @private
             */
            setDebug : function (enable) {
                debugOn = enable;
            },
            
            /**
             * Logs a string as DEBUG.
             * 
             * @param str is the string to log. 
             * @private
             */
            log : function (str) {
                var timeStr = getTimeStamp();
                
                if (debugOn) {
                    if (hasConsole())
                    {
                        window.console.log(timeStr + ": " + "DEBUG" + " - " + str);
                    }
                }
            },
            
            /**
             * Logs a string as INFO.
             * 
             * @param str is the string to log. 
             * @private
             */
            info : function (str) {
                var timeStr = getTimeStamp();
                
                if (hasConsole())
                {
                    window.console.info(timeStr + ": " + "INFO" + " - " + str);
                }
            },
            
            /**
             * Logs a string as WARN.
             * 
             * @param str is the string to log. 
             * @private
             */
            warn : function (str) {
                var timeStr = getTimeStamp();
                
                if (hasConsole())
                {
                    window.console.warn(timeStr + ": " + "WARN" + " - " + str);
                }
            },
            /**
             * Logs a string as ERROR.
             * 
             * @param str is the string to log. 
             * @private
             */
            error : function (str) {
                var timeStr = getTimeStamp();
                
                if (hasConsole())
                {
                    window.console.error(timeStr + ": " + "ERROR" + " - " + str);
                }
            }
        };
    }());
    
    return Logger;
}));

/**
 * Allows gadgets to call the log function to publish client logging messages over the hub.
 *
 * @requires OpenAjax
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('cslogger/ClientLogger',[], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    }
    
}(function () {

    var ClientLogger = ( function () { /** @lends finesse.cslogger.ClientLogger.prototype */
        var _hub, _logTopic, _originId, _sessId, _host,
            MONTH = { 0 : "Jan", 1 : "Feb", 2 : "Mar", 3 : "Apr", 4 : "May", 5 : "Jun", 
                      6 : "Jul", 7 : "Aug", 8 : "Sep", 9 : "Oct", 10 : "Nov", 11 : "Dec"},
 
        /**
         * Gets timestamp drift stored in sessionStorage
         * @returns drift in seconds if it is set in sessionStorage otherwise returns undefined.
         * @private
        */
        getTsDrift = function() {
            if (window.sessionStorage.getItem('clientTimestampDrift') !== null) {
                return parseInt(window.sessionStorage.getItem('clientTimestampDrift'), 10);
            }
            else { 
                return undefined;
            }
        },
         
        /**
          * Sets timestamp drift in sessionStorage
          * @param delta is the timestamp drift between server.and client.
          * @private
         */
        setTsDrift = function(delta) {
             window.sessionStorage.setItem('clientTimestampDrift', delta.toString());
        },
          
        /**
         * Gets Finesse server timezone offset from GMT in seconds 
         * @returns offset in seconds if it is set in sessionStorage otherwise returns undefined.
         * @private
        */
        getServerOffset = function() {
            if (window.sessionStorage.getItem('serverTimezoneOffset') !== null) {
                return parseInt(window.sessionStorage.getItem('serverTimezoneOffset'), 10);
            }
            else { 
                return undefined;
            }
        },
         
        /**
          * Sets server timezone offset 
          * @param sec is the server timezone GMT offset in seconds.
          * @private
         */
        setServerOffset = function(sec) {
             window.sessionStorage.setItem('serverTimezoneOffset', sec.toString());
        },
 
        /**
         * Checks to see if we have a console.
         * @returns Whether the console object exists.
         * @private
         */
        hasConsole = function () {
            try {
                if (window.console !== undefined) {
                    return true;
                }
            } 
            catch (err) {
              // ignore and return false
            }
    
            return false;
        },
        
        /**
         * Gets a short form (6 character) session ID from sessionStorage
         * @private
        */
        getSessId = function() {
            if (!_sessId) {
               //when _sessId not defined yet, initiate it
               if (window.sessionStorage.getItem('enableLocalLog') === 'true') {
                  _sessId= " "+window.sessionStorage.getItem('finSessKey');
               }
               else {
                  _sessId=" ";
               }
            }
            return _sessId;
         },

        /**
         * Pads a single digit number for display purposes (e.g. '4' shows as '04')
         * @param num is the number to pad to 2 digits
         * @returns a two digit padded string
         * @private
         */
        padTwoDigits = function (num)
        {
            return (num < 10) ? '0' + num : num;
        },
        
        /**
         * Pads a single digit number for display purposes (e.g. '4' shows as '004')
         * @param num is the number to pad to 3 digits
         * @returns a three digit padded string
         * @private
         */
        padThreeDigits = function (num)
        {
            if (num < 10)
            {
              return '00'+num;
            }
            else if (num < 100)
            {
              return '0'+num;
            }
            else  
            {
               return num;
            }
        },
              
        /**
         * Compute the "hour"
         * 
         * @param s is time in seconds
         * @returns {String} which is the hour
         * @private
         */
        ho = function (s) {
             return ((s/60).toString()).split(".")[0];
        },
          
        /**
         * Gets local timezone offset string.
         * 
         * @param t is the time in seconds
         * @param s is the separator character between hours and minutes, e.g. ':'
         * @returns {String} is local timezone GMT offset in the following format: [+|-]hh[|:]MM
         * @private
         */
        getGmtOffString = function (min,s) {
            var t, sign;
            if (min<0) {
               t = -min;
               sign = "-";
            }
            else {
               t = min;
               sign = "+";
            }
            
            if (s===':') {
                return sign+padTwoDigits(ho(t))+s+padTwoDigits(t%60);
            }
            else {
                return sign+padTwoDigits(ho(t))+padTwoDigits(t%60);
            }    
        },

        /**
         * Gets short form of a month name in English 
         * 
         * @param monthNum is zero-based month number 
         * @returns {String} is short form of month name in English
         * @private
         */
        getMonthShortStr = function (monthNum) {
            var result;
            try {
                result = MONTH[monthNum];
            } 
            catch (err) {
                if (hasConsole()) {
                    window.console.log("Month must be between 0 and 11");
                }
            }
            return result;
        },
          
        /**
          * Gets a timestamp.
          * @param aDate is a javascript Date object
          * @returns {String} is a timestamp in the following format: yyyy-mm-ddTHH:MM:ss.SSS [+|-]HH:MM
          * @private
          */
        getDateTimeStamp = function (aDate)
        {
            var date, off, timeStr;
            if (aDate === null) {
                date = new Date();
            }
            else {
                date = aDate;
            }
            off = -1*date.getTimezoneOffset();
            timeStr = date.getFullYear().toString() + "-" +
                      padTwoDigits(date.getMonth()+1) + "-" +
                      padTwoDigits (date.getDate()) + "T"+
                      padTwoDigits(date.getHours()) + ":" + 
                      padTwoDigits(date.getMinutes()) + ":" +
                      padTwoDigits(date.getSeconds())+"." + 
                      padThreeDigits(date.getMilliseconds()) + " "+
                      getGmtOffString(off, ':');
    
            return timeStr;
        },
        
        /**
         * Gets drift-adjusted timestamp.
         * @param aTimestamp is a timestamp in milliseconds
         * @param drift is a timestamp drift in milliseconds
         * @param serverOffset is a timezone GMT offset in minutes
         * @returns {String} is a timestamp in the Finesse server log format, e.g. Jan 07 2104 HH:MM:ss.SSS -0500
         * @private
         */
        getDriftedDateTimeStamp = function (aTimestamp, drift, serverOffset)
        {
           var date, timeStr, localOffset;
           if (aTimestamp === null) {
               return "--- -- ---- --:--:--.--- -----";
           }
           else if (drift === undefined || serverOffset === undefined) {
               if (hasConsole()) {
                   window.console.log("drift or serverOffset must be a number");
               }
               return "--- -- ---- --:--:--.--- -----";
           }
           else {
               //need to get a zone diff in minutes
               localOffset = (new Date()).getTimezoneOffset();
               date = new Date(aTimestamp+drift+(localOffset+serverOffset)*60000);
               timeStr = getMonthShortStr(date.getMonth()) + " "+
                         padTwoDigits (date.getDate())+ " "+
                         date.getFullYear().toString() + " "+
                         padTwoDigits(date.getHours()) + ":" + 
                         padTwoDigits(date.getMinutes()) + ":" +
                         padTwoDigits(date.getSeconds())+"." + 
                         padThreeDigits(date.getMilliseconds())+" "+
                         getGmtOffString(serverOffset, '');
                return timeStr;
            }
        },
    
        /**
        * Logs a message to a hidden textarea element on the page
        *
        * @param msg is the string to log.
        * @private
        */
        writeToLogOutput = function (msg) {
            var logOutput = document.getElementById("finesseLogOutput");
    
            if (logOutput === null)
            {
                logOutput = document.createElement("textarea");
                logOutput.id = "finesseLogOutput";
                logOutput.style.display = "none";
                document.body.appendChild(logOutput);
            }
    
            if (logOutput.value === "")
            {
                logOutput.value = msg;
            }
            else
            {
                logOutput.value = logOutput.value + "\n" + msg;
            }
        },

        /*
         * Logs a message to console 
        * @param str is the string to log.         * @private
         */
        logToConsole = function (str)
        {
            var now, msg, timeStr, driftedTimeStr, sessKey=getSessId();
            now = new Date();
            timeStr = getDateTimeStamp(now);
            if (getTsDrift() !== undefined) {
                driftedTimeStr = getDriftedDateTimeStamp(now.getTime(), getTsDrift(), getServerOffset());
            }
            else {
               driftedTimeStr = getDriftedDateTimeStamp(null, 0, 0);
            }
            msg = timeStr + ":"+sessKey+": "+ _host + ": "+driftedTimeStr+ ": " + str;
            // Log to console
            if (hasConsole()) {
                window.console.log(msg);
            }
    
            //Uncomment to print logs to hidden textarea.
            //writeToLogOutput(msg);
    
            return msg;
        };
        return {
    
            /**
             * Publishes a Log Message over the hub.
             *
             * @param {String} message
             *     The string to log.
             * @example
             * _clientLogger.log("This is some important message for MyGadget");
             * 
             */
            log : function (message) {
                if(_hub) {
                    _hub.publish(_logTopic, logToConsole(_originId + message));
                }
            },
            
            /**
             * @class
             * Allows gadgets to call the log function to publish client logging messages over the hub.
             * 
             * @constructs
             */
            _fakeConstuctor: function () {
                /* This is here so we can document init() as a method rather than as a constructor. */
            },
            
            /**
             * Initiates the client logger with a hub a gadgetId and gadget's config object.
             * @param {Object} hub
             *      The hub to communicate with.
             * @param {String} gadgetId
             *      A unique string to identify which gadget is doing the logging.
             * @param {Object} config
             *      The config object used to get host name for that thirdparty gadget
             * @example
             * var _clientLogger = finesse.cslogger.ClientLogger;
             * _clientLogger.init(gadgets.Hub, "MyGadgetId", config);
             * 
             */
            init: function (hub, gadgetId, config) {
                _hub = hub;
                _logTopic = "finesse.clientLogging." + gadgetId;
                _originId = gadgetId + " : ";
                if ((config === undefined) || (config === "undefined")) 
                {
                     _host = ((finesse.container && finesse.container.Config && finesse.container.Config.host)?finesse.container.Config.host : "?.?.?.?");
                 } 
                else 
                {
                     _host = ((config && config.host)?config.host : "?.?.?.?");
                 }
            }
        };
    }());
    
    window.finesse = window.finesse || {};
    window.finesse.cslogger = window.finesse.cslogger || {};
    window.finesse.cslogger.ClientLogger = ClientLogger;
    
    finesse = finesse || {};
    /** @namespace Supports writing messages to a central log. */
    finesse.cslogger = finesse.cslogger || {};

    return ClientLogger;
 }));

/* using variables before they are defined.
 */
/*global navigator,unescape,sessionStorage,localStorage,_initSessionList,_initSessionListComplete */

/**
 * Allows each gadget to communicate with the server to send logs.
 */

/**
 * @class
 * @private
 * Allows each product to initialize its method of storage
 */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('cslogger/FinesseLogger',["clientservices/ClientServices"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.clientservices.ClientServices);
    }
    
}(function (ClientServices) {
    window.finesse = window.finesse || {};
    window.finesse.cslogger = window.finesse.cslogger || {};
    /** @private */
    window.finesse.cslogger.FinesseLogger = (function () { 

        var

        /**
         * Array use to collect ongoing logs in memory
         * @private
         */
        _logArray = [],

        /**
         * The final data string sent to the server, =_logArray.join
         * @private
         */
        _logStr = "",

        /**
         * Keep track of size of log
         * @private
         */
        _logSize = 0,

        /**
         * Flag to keep track show/hide of send log link
         * @private
         */
        _sendLogShown = false,

        /**
         * Flag to keep track if local log initialized
         * @private
         */
        _loggingInitialized = false,
        

        /**
         * local log size limit
         * @private
         */
        _maxLocalStorageSize = 5000000,

        /**
         * half local log size limit
         * @private
         */
        _halfMaxLocalStorageSize = 0.5*_maxLocalStorageSize,

        
        /**
         * threshold for purge 
         * @private
         */
        _purgeStartPercent = 0.75,
        
        /**
         * log item prefix 
         * @private
         */
        _linePrefix = null,
        
        /**
         * locallog session 
         * @private
         */
        _session = null,
        
        /**
         * Flag to keep track show/hide of send log link
         * @private
         */
        _sessionKey = null,
        /**
         * Log session metadata 
         * @private
         */
        _logInfo = {},
        
        /**
         * Flag to find sessions 
         * @private
         */
        _findSessionsObj = null,

        /**
         * Wrap up console.log esp. for IE9 
         * @private
         */
        _myConsoleLog = function (str) {
            if (window.console !== undefined) {
              window.console.log(str);
            }
        },
        /**
         * Initialize the Local Logging
         * @private
         */
        _initLogging = function () {
            if (_loggingInitialized) {
                return;
            }
            //Build a new store
            _session = sessionStorage.getItem("finSessKey");
            //if the _session is null or empty, skip the init
            if (!_session) {
              return;
            }
            _sessionKey = "Fi"+_session;
            _linePrefix = _sessionKey + "_";
            _logInfo = {};
            _logInfo.name = _session;
            _logInfo.size = 0;
            _logInfo.head = 0;
            _logInfo.tail = 0;
            _logInfo.startTime = new Date().getTime();
            _loggingInitialized = true;
            _initSessionList();
        },
        
        /**
         * get total data size 
         *
         * @return {Integer} which is the amount of data stored in local storage.
         * @private
         */
        _getTotalData = function ()
        {
            var sessName, sessLogInfoStr,sessLogInfoObj, sessionsInfoObj, totalData = 0,
            sessionsInfoStr = localStorage.getItem("FinesseSessionsInfo");
            if (!sessionsInfoStr) {
                 return 0;
            }
            sessionsInfoObj = JSON.parse(sessionsInfoStr);

            for (sessName in sessionsInfoObj.sessions)
            {
                if (sessionsInfoObj.sessions.hasOwnProperty(sessName)) {
                    sessLogInfoStr = localStorage.getItem("Fi" + sessName);
                    if (!sessLogInfoStr) {
                        _myConsoleLog("_getTotalData failed to get log info for "+sessName);
                    }
                    else {
                       sessLogInfoObj = JSON.parse(sessLogInfoStr);
                       totalData = totalData + sessLogInfoObj.size;
                    }
                }
            }

              return totalData;
        },
        
        /**
         * Remove lines from tail up until store size decreases to half of max size limit.
         *
         * @private
         */
        _purgeCurrentSession = function() {
            var curStoreSize, purgedSize=0, line, tailKey, secLogInfoStr, logInfoStr, theLogInfo;
            curStoreSize = _getTotalData();
            if (curStoreSize < _halfMaxLocalStorageSize) {
               return;
            }
            logInfoStr = localStorage.getItem(_sessionKey);
            if (!logInfoStr) {
               return;
            }
            theLogInfo = JSON.parse(logInfoStr);
            //_myConsoleLog("Starting _purgeCurrentSession() - currentStoreSize=" + curStoreSize);
            while(curStoreSize > _halfMaxLocalStorageSize) {
               try {
                   tailKey = _sessionKey+"_"+theLogInfo.tail;
                   line = localStorage.getItem(tailKey);
                   if (line) {
                       purgedSize = purgedSize +line.length;
                       localStorage.removeItem(tailKey);
                       curStoreSize = curStoreSize - line.length;
                       theLogInfo.size = theLogInfo.size - line.length;
                   }
               }
               catch (err) {
                   _myConsoleLog("purgeCurrentSession encountered err="+err);
               }
               if (theLogInfo.tail < theLogInfo.head) {
                   theLogInfo.tail = theLogInfo.tail  + 1;
               }
               else {
                   break;
               }
            }
            //purge stops here, we need to update session's meta data in storage
            secLogInfoStr = localStorage.getItem(_sessionKey);
            if (!secLogInfoStr) {
                //somebody cleared the localStorage
                return;
            }
            
            //_myConsoleLog("In _purgeCurrentSession() - after purging current session, currentStoreSize=" + curStoreSize);
            //_myConsoleLog("In _purgeCurrentSession() - after purging purgedSize=" + purgedSize);
            //_myConsoleLog("In _purgeCurrentSession() - after purging logInfo.size=" + theLogInfo.size);
            //_myConsoleLog("In _purgeCurrentSession() - after purging logInfo.tail=" + theLogInfo.tail);
            localStorage.setItem(_sessionKey, JSON.stringify(theLogInfo));
            _myConsoleLog("Done _purgeCurrentSession() - currentStoreSize=" + curStoreSize);
        },
       
        /**
         * Purge a session 
         *
         * @param sessionName is the name of the session
         * @return {Integer} which is the current amount of data purged
         * @private
         */
        _purgeSession = function (sessionName) {
              var theLogInfo, logInfoStr, sessionsInfoStr, sessionsInfoObj;
              //Get the session logInfo
              logInfoStr = localStorage.getItem("Fi" + sessionName);
              if (!logInfoStr) {
                 _myConsoleLog("_purgeSession failed to get logInfo for "+sessionName);
                 return 0;
              }
              theLogInfo = JSON.parse(logInfoStr);
              
              //Note: This assumes that we don't crash in the middle of purging
              //=> if we do then it should get deleted next time
              //Purge tail->head
              while (theLogInfo.tail <= theLogInfo.head)
              {
                  try {
                      localStorage.removeItem("Fi" + sessionName + "_" + theLogInfo.tail);
                      theLogInfo.tail = theLogInfo.tail + 1;
                  }
                  catch (err) {
                      _myConsoleLog("In _purgeSession err="+err);
                      break;
                  }
              }

              //Remove the entire session
              localStorage.removeItem("Fi" + sessionName);

              //Update FinesseSessionsInfo
              sessionsInfoStr = localStorage.getItem("FinesseSessionsInfo");
              if (!sessionsInfoStr) {
                 _myConsoleLog("_purgeSession could not get sessions Info, it was cleared?");
                 return 0;
              }
              sessionsInfoObj = JSON.parse(sessionsInfoStr);
              if (sessionsInfoObj.sessions !== null)
              {
                 delete sessionsInfoObj.sessions[sessionName];
              
                 sessionsInfoObj.total = sessionsInfoObj.total - 1;
                 sessionsInfoObj.lastWrittenBy = _session;
                 localStorage.setItem("FinesseSessionsInfo", JSON.stringify(sessionsInfoObj));
              }
              
              return theLogInfo.size;
        },
        
         /**
          * purge old sessions
          * 
          * @param storeSize
	  * @return {Boolean} whether purging reaches its target
          * @private
         */
         _purgeOldSessions = function (storeSize) {
             var sessionsInfoStr, purgedSize = 0, sessName, sessions, curStoreSize, activeSession, sessionsInfoObj;
             sessionsInfoStr = localStorage.getItem("FinesseSessionsInfo");
             if (!sessionsInfoStr) {
                _myConsoleLog("Could not get FinesseSessionsInfo");
                return true;
             }
             sessionsInfoObj = JSON.parse(sessionsInfoStr);
             curStoreSize = _getTotalData();
             
             activeSession = _session;
             sessions = sessionsInfoObj.sessions;
             for (sessName in sessions) {
                if (sessions.hasOwnProperty(sessName)) {
                    if (sessName !== activeSession) {
                        purgedSize = purgedSize + _purgeSession(sessName);
                        if ((curStoreSize-purgedSize) < _halfMaxLocalStorageSize) {
                            return true;
                        }
                    }
                }
             }
            //purge is not done, so return false
            return false;
         },
         
       /**
        * handle insert error
        *
        * @param error
        * @private
        */
        _insertLineHandleError = function (error) {
            _myConsoleLog(error);
        },

        /**
         * check storage data size and if need purge
         * @private
         */
        _checkSizeAndPurge = function () {
            var purgeIsDone=false, totalSize = _getTotalData();
            if (totalSize > 0.75*_maxLocalStorageSize) {
               _myConsoleLog("in _checkSizeAndPurge, totalSize ("+totalSize+") exceeds limit");
               purgeIsDone = _purgeOldSessions(totalSize);
               if (purgeIsDone) {
                  _myConsoleLog("in _checkSizeAndPurge after purging old session, purge is done");
               }
               else {
                  //after all old sessions purged, still need purge
                  totalSize = _getTotalData();
                  if (totalSize > 0.75*_maxLocalStorageSize) {
                      _myConsoleLog("in _checkSizeAndPurge after purging old session,still needs purging, now storeSize ("+totalSize+")");
                     _purgeCurrentSession();
                     _myConsoleLog("in _checkSizeAndPurge done purging current session.");
                  }
               }
            }
        },
        
        /**
         * check if the session is already in meta data  
         * 
         * @param metaData
         * @param sessionName
         * @return {Boolean} true if session has metaData (false otherwise)
         * @private
         */
        _sessionsInfoContains = function (metaData, sessionName) {
           if (metaData && metaData.sessions && metaData.sessions.hasOwnProperty(sessionName)) {
              return true;
           }
           return false;
        },
        
        
        /**
         * setup sessions in local storage 
         * 
         * @param logInfo
         * @private
         */
        _getAndSetNumberOfSessions = function (logInfo) {
            var numOfSessionsPass1, numOfSessionsPass2, l;
            numOfSessionsPass1 = localStorage.getItem("FinesseSessionsInfo");
            if (numOfSessionsPass1 === null) {
                //Init first time
                numOfSessionsPass1 = {};
                numOfSessionsPass1.total = 1;
                numOfSessionsPass1.sessions = {};
                numOfSessionsPass1.sessions[logInfo.name] = logInfo.startTime;
                numOfSessionsPass1.lastWrittenBy = logInfo.name;
                localStorage.setItem("FinesseSessionsInfo", JSON.stringify(numOfSessionsPass1));
            }
            else {
                numOfSessionsPass1 = JSON.parse(numOfSessionsPass1);
                //check if the session is already in the FinesseSessionSInfo
                if (_sessionsInfoContains(numOfSessionsPass1, logInfo.name)) {
                    return;
                }             
                //Save numOfSessionsPass1
                numOfSessionsPass1.total = parseInt(numOfSessionsPass1.total, 10) + 1;
                numOfSessionsPass1.sessions[logInfo.name] = logInfo.startTime;
                numOfSessionsPass1.lastWrittenBy = logInfo.name;
                localStorage.setItem("FinesseSessionsInfo", JSON.stringify(numOfSessionsPass1));
                numOfSessionsPass2 = localStorage.getItem("FinesseSessionsInfo");
                if (!numOfSessionsPass2) {
                   _myConsoleLog("Could not get FinesseSessionsInfo");
                   return;
                }
                numOfSessionsPass2 = JSON.parse(numOfSessionsPass2);
                //in future we need to confirm the numOfSessionsPass2 is the same as numOfSessionsPass1
                ////if (numOfSessionsPass1.lastWrittenBy !== numOfSessionsPass2.lastWrittenBy) {
                ////    _myConsoleLog("Rebuild sessions");
                ////    _sessionTimerId = setTimeout(_initSessionList, 10000);
                ////}
                ////else {
                ////    _sessionTimerId = null;
                ////callback(numOfSessionsPass2.sessions);
                ////}
            }
            if (!localStorage.getItem(_sessionKey)) {
                localStorage.setItem(_sessionKey, JSON.stringify(_logInfo));
            }
        },
        
        
        /**
         * init session list 
         * @private
         */
        _initSessionList = function () {
            _getAndSetNumberOfSessions(_logInfo);
        },
        
       /**
        * do the real store of log line
        * 
        * @param line
        * @private
        */
        _persistLine = function (line) {
            var key, logInfoStr;
            logInfoStr = localStorage.getItem(_sessionKey);
            if (logInfoStr === null) {
               return;
            }
            _logInfo = JSON.parse(logInfoStr);
            _logInfo.head = _logInfo.head + 1;
            key = _linePrefix + _logInfo.head;
            localStorage.setItem(key, line);
            //Save the size
            _logInfo.size = _logInfo.size + line.length;
            if (_logInfo.tail === 0) {
                _logInfo.tail = _logInfo.head;
            }
        
            localStorage.setItem(_sessionKey, JSON.stringify(_logInfo));
            _checkSizeAndPurge();
        },
        
        /**
         * Insert a line into the localStorage.
         *
         * @param line line to be inserted 
         * @private
        */
        _insertLine = function (line) {
            //_myConsoleLog("_insertLine: [" + line + "]");
            //Write the next line to localStorage
            try {
               //Persist the line 
               _persistLine(line);
            }
            catch (err) {
               _myConsoleLog("error in _insertLine(), err="+err);
               //_insertLineHandleError(err);
            }
        },
         
        
        /**
         * Clear the local storage
         * @private
         */
        _clearLocalStorage = function() {
            localStorage.clear();

        },

        /**
         * Collect logs when onCollect called
         *
         * @param data
         * @private
         */
        _collectMethod = function(data) {
          //Size of log should not exceed 1.5MB
          var info, maxLength = 1572864;
          
          //add size buffer equal to the size of info to be added when publish
          info = navigator.userAgent + "&#10;";
          info = escape(info);

            //If log was empty previously, fade in buttons
            if (!_sendLogShown) {
                //call the fadeInSendLog() in Footer
                finesse.modules.Footer.sendLogAppear();
                _sendLogShown = true;
                _logSize = info.length;
            }
            
            //if local storage logging is enabled, then insert the log into local storage
            if (window.sessionStorage.getItem('enableLocalLog')==='true') {
                if (data) {
                   if (data.length>0 && data.substring(0,1) === '\n') {
                      _insertLine(data.substring(1));
                   }
                   else {
                      _insertLine(data);
                   }
                }
            }
              
            //escape all data to get accurate size (shindig will escape when it builds request)
            //escape 6 special chars for XML: &<>"'\n
            data = data.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/\n/g, "&#10;");
            data = escape(data+"\n");

            if (data.length < maxLength){
                //make room for new data if log is exceeding max length
                while (_logSize + data.length > maxLength) {
                    _logSize -= (_logArray.shift()).length;
                }
            }

            //Else push the log into memory, increment the log size
            _logArray.push(data);

            //inc the size accordingly
            _logSize+=data.length;

        };

        return {

            /**
             * @private
             * Initiate FinesseLogger.
             */
            init: function () {
                ClientServices.subscribe("finesse.clientLogging.*", _collectMethod);
                _initLogging();
            },

            /**
             * @private
             * Clear all items stored in localStorage.
            */
            clear : function () {
               _clearLocalStorage();
            },

            /**
             * @private
             * Initialize the local storage logging.
            */
            initLocalLog: function () {
               _initLogging();
            },

            /**
             * @private
             * Inserts a line into the localStorage.
             * @param line to insert
            */
            localLog : function (line) {
               _insertLine(line);
            },

           /**
            * @ignore
            * Publish logs to server and clear the memory
            *
            * @param userObj
            * @param options
            * @param callBack
            */
            publish: function(userObj, options, callBack) {
                // Avoid null references.
                options = options || {};
                callBack = callBack || {};

                if (callBack.sending === "function") {
                    callBack.sending();
                }

                //logs the basic version and machine info and escaped new line
                _logStr = navigator.userAgent + "&#10;";
                
                //join the logs to correct string format
                _logStr += unescape(_logArray.join(""));

                //turning log string to JSON obj
                var logObj = {
                        ClientLog: {
                        logData : _logStr //_logStr
                    }
                },
                tmpOnAdd = (options.onAdd && typeof options.onAdd === "function")? options.onAdd : function(){};
                /** @private */
                options.onAdd = function(){
                    tmpOnAdd();
                    _logArray.length = 0; _logSize =0;
                    _sendLogShown = false;
                    };
                //adding onLoad to the callbacks, this is the subscribe success case for the first time user subscribe to the client log node
                /** @private */
                options.onLoad = function (clientLogObj) {
                    clientLogObj.sendLogs(logObj,{
                            error: callBack.error
                        });
                    };

                userObj.getClientLog(options);
            }
        };
    }());
}));

/**
 *  Contains a list of topics used for containerservices pubsub.
 *
 */

/**
 * @class
 * Contains a list of topics with some utility functions.
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/Topics',[], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    }
    
}(function () {

    var Topics = (function () {

    /**
     * The namespace prepended to all Finesse topics.
     */
    this.namespace = "finesse.containerservices";

    /**
     * @private
     * Gets the full topic name with the ContainerServices namespace prepended.
     * @param {String} topic
     *     The topic category.
     * @returns {String}
     *     The full topic name with prepended namespace.
     */
    var _getNSTopic = function (topic) {
        return this.namespace + "." + topic;
    };



    /** @scope finesse.containerservices.Topics */
    return {
        /** 
         * @private
         * request channel. */
        REQUESTS: _getNSTopic("requests"),

        /** 
         * @private
         * reload gadget channel. */
        RELOAD_GADGET: _getNSTopic("reloadGadget"),

        /**
         * @private
         * Convert a Finesse REST URI to a OpenAjax compatible topic name.
         */
        getTopic: function (restUri) {
            //The topic should not start with '/' else it will get replaced with
            //'.' which is invalid.
            //Thus, remove '/' if it is at the beginning of the string
            if (restUri.indexOf('/') === 0) {
                restUri = restUri.substr(1);
            }

            //Replace every instance of "/" with ".". This is done to follow the
            //OpenAjaxHub topic name convention.
            return restUri.replace(/\//g, ".");
        }
    };
	}());
	
	window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.Topics = Topics;
    
    /** @namespace JavaScript class objects and methods to handle gadget container services.*/
    finesse.containerservices = finesse.containerservices || {};

	return Topics;

 }));

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global finesse*/

/**
 * Per containerservices request, publish to the OpenAjax gadget pubsub infrastructure.
 *
 * @requires OpenAjax, finesse.containerservices.Topics
 */

/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/MasterPublisher',["utilities/Utilities",
                "containerservices/Topics"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.utilities.Utilities, finesse.containerservices.Topics);
    }
    
}(function (Utilities, Topics) {

    var MasterPublisher = function () {

    var
    
    /**
     * Reference to the gadget pubsub Hub instance.
     * @private
     */
    _hub = gadgets.Hub,

    /**
     * Reference to the Topics class.
     * @private
     */
    _topics = Topics,
    
    /**
     * Reference to conversion utilities class.
     * @private
     */
    _utils = Utilities,
    
    /**
     * References to ClientServices logger methods
     * @private
     */
    _logger = {
        log: finesse.clientservices.ClientServices.log
    },
    
   /**
     * The types of possible request types supported when listening to the
     * requests channel. Each request type could result in different operations.
     * @private
     */
    _REQTYPES = {
		ACTIVETAB: "ActiveTabReq",
		SET_ACTIVETAB: "SetActiveTabReq",
        RELOAD_GADGET: "ReloadGadgetReq"
    },

    /**
     * Handles client requests made to the request topic. The type of the
     * request is described in the "type" property within the data payload. Each
     * type can result in a different operation.
     * @param {String} topic
     *     The topic which data was published to.
     * @param {Object} data
     *     The data containing requests information published by clients.
     * @param {String} data.type
     *     The type of the request. Supported: "ActiveTabReq", "SetActiveTabReq", "ReloadGadgetReq"
     * @param {Object} data.data
     *     May contain data relevant for the particular requests.
     * @param {String} [data.invokeID]
     *     The ID used to identify the request with the response. The invoke ID
     *     will be included in the data in the publish to the topic. It is the
     *     responsibility of the client to correlate the published data to the
     *     request made by using the invoke ID.
     * @private
     */
    _clientRequestHandler = function (topic, data) {
    
        //Ensure a valid data object with "type" and "data" properties.
        if (typeof data === "object" &&
                typeof data.type === "string" &&
                typeof data.data === "object") {
			switch (data.type) {
			case _REQTYPES.ACTIVETAB:
                _hub.publish("finesse.containerservices.activeTab", finesse.container.Tabs.getActiveTab());
                break;
            case _REQTYPES.SET_ACTIVETAB:
                if (typeof data.data.id === "string") {
                    _logger.log("Handling request to activate tab: " + data.data.id);
                    if (!finesse.container.Tabs.activateTab(data.data.id)) {
                        _logger.log("No tab found with id: " + data.data.id);
                    }
                }
                break;
            case _REQTYPES.RELOAD_GADGET:
                _hub.publish("finesse.containerservices.reloadGadget", data.data);
                break;
			default:
				break;
			}
        }
    };

    (function () {

        //Listen to a request channel to respond to any requests made by other
        //clients because the Master may have access to useful information.
        _hub.subscribe(_topics.REQUESTS, _clientRequestHandler);
    }());

    //BEGIN TEST CODE//
    /**
     * Test code added to expose private functions that are used by unit test
     * framework. This section of code is removed during the build process
     * before packaging production code. The [begin|end]TestSection are used
     * by the build to identify the section to strip.
     * @ignore
     */
    this.beginTestSection = 0;

    /**
     * @ignore
     */
    this.getTestObject = function () {
        //Load mock dependencies.
        var _mock = new MockControl();
        _hub = _mock.createMock(gadgets.Hub);

        return {
            //Expose mock dependencies
            mock: _mock,
            hub: _hub,
			
            //Expose internal private functions
            reqtypes: _REQTYPES,
            
            clientRequestHandler: _clientRequestHandler

        };
    };


    /**
     * @ignore
     */
    this.endTestSection = 0;
    //END TEST CODE//
	};
	
	window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.MasterPublisher = MasterPublisher;
	
	return MasterPublisher;
 }));

/**
 * JavaScript representation of the Finesse WorkflowActionEvent object.
 *
 * @requires finesse.FinesseBase
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global FinesseBase: true, publisher:true, define:true, finesse:true, window:true */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/WorkflowActionEvent', ["FinesseBase"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase);
    }
}(function (FinesseBase) {
    var WorkflowActionEvent = FinesseBase.extend(/** @lends finesse.containerservices.WorkflowActionEvent.prototype */{
        /**
         * Reference to the WorkflowActionEvent name
         * This will be set by setWorkflowActionEvent
         * @private
         */
        _name: null,

        /**
         * Reference to the WorkflowActionEvent type
         * This will be set by setWorkflowActionEvent
         * @private
         */
        _type: null,

        /**
         * Reference to the WorkflowActionEvent handledBy value
         * This will be set by setWorkflowActionEvent
         * @private
         */
        _handledBy: null,

        /**
         * Reference to the WorkflowActionEvent params array
         * This will be set by setWorkflowActionEvent
         * @private
         */
        _params: [],

        /**
         * Reference to the WorkflowActionEvent actionVariables array
         * This will be set by setWorkflowActionEvent
         * @private
         */            
        _actionVariables: [], 
        
        /**
         * @class
         * JavaScript representation of a WorkflowActionEvent object.
         * The WorkflowActionEvent object is delivered as the payload of
         * a WorkflowAction callback.  This can be subscribed to by using
         * {@link finesse.containerservices.ContainerServices#addHandler} with a 
         * topic of {@link finesse.containerservices.ContainerServices.Topics#WORKFLOW_ACTION_EVENT}. 
         * Gadgets should key on events with a handleBy value of "OTHER".
         * 
         * @constructs
         **/
        init: function () {
            this._super();
        },        

        /**
	     * Validate that the passed in object is a WorkflowActionEvent object
	     * and sets the variables if it is
	     * @param maybeWorkflowActionEvent A possible WorkflowActionEvent object to be evaluated and set if 
	     *                                 it validates successfully.
	     * @returns {Boolean} Whether it is valid or not.
         * @private
	     */
	    setWorkflowActionEvent: function(maybeWorkflowActionEvent) {
	        var returnValue;
	
	        if (maybeWorkflowActionEvent.hasOwnProperty("name") === true &&
	                maybeWorkflowActionEvent.hasOwnProperty("type") === true &&
                    maybeWorkflowActionEvent.hasOwnProperty("handledBy") === true &&
	                maybeWorkflowActionEvent.hasOwnProperty("params") === true &&
	                maybeWorkflowActionEvent.hasOwnProperty("actionVariables") === true) {
	            this._name = maybeWorkflowActionEvent.name;
	            this._type = maybeWorkflowActionEvent.type;
                this._handledBy = maybeWorkflowActionEvent.handledBy;
	            this._params = maybeWorkflowActionEvent.params;
	            this._actionVariables = maybeWorkflowActionEvent.actionVariables;
	            returnValue = true;
	        } else {
	            returnValue = false;
	        }
	
	        return returnValue;
	    },
	
	    /**
	     * Getter for the WorkflowActionEvent name.
	     * @returns {String} The name of the WorkflowAction.
	     */
	    getName: function () {
	        // escape nulls to empty string
	        return this._name || "";
	    },
	
	    /**
	     * Getter for the WorkflowActionEvent type.
	     * @returns {String} The type of the WorkflowAction (BROWSER_POP, HTTP_REQUEST).
	     */
	    getType: function () {
	        // escape nulls to empty string
	        return this._type || "";
	    },
	
        /**
         * Getter for the WorkflowActionEvent handledBy value. Gadgets should look for
         * events with a handleBy of "OTHER".
         * @see finesse.containerservices.WorkflowActionEvent.HandledBy
         * @returns {String} The handledBy value of the WorkflowAction that is a value of {@link finesse.containerservices.WorkflowActionEvent.HandledBy}.
         */
        getHandledBy: function () {
            // escape nulls to empty string
            return this._handledBy || "";
        },


	    /**
	     * Getter for the WorkflowActionEvent Params map.
	     * @returns {Object} key = param name, value = Object{name, value, expandedValue}
	     * BROWSER_POP<ul>
	     * <li>windowName : Name of window to pop into, or blank to always open new window.
	     * <li>path : URL to open.</ul>
	     * HTTP_REQUEST<ul>
	     * <li>method : "PUT" or "POST".
	     * <li>location : "FINESSE" or "OTHER".
	     * <li>contentType : MIME type of request body, if applicable, e.g. "text/plain".
	     * <li>path : Request URL.
	     * <li>body : Request content for POST requests.</ul>
	     */
	    getParams: function () {
	        var map = {},
	            params = this._params,
	            i,
	            param;
	
	        if (params === null || params.length === 0) {
	            return map;
	        }
	
	        for (i = 0; i < params.length; i += 1) {
	            param = params[i];
	            // escape nulls to empty string
	            param.name = param.name || "";
	            param.value = param.value || "";
	            param.expandedValue = param.expandedValue || "";
	            map[param.name] = param;
	        }
	
	        return map;
	    },
	    
	    /**
	     * Getter for the WorkflowActionEvent ActionVariables map
	     * @returns {Object} key = action variable name, value = Object{name, type, node, testValue, actualValue}
	     */
	    getActionVariables: function() {
	        var map = {},
	            actionVariables = this._actionVariables,
	            i,
	            actionVariable;
	
	        if (actionVariables === null || actionVariables.length === 0) {
	            return map;
	        }
	
	        for (i = 0; i < actionVariables.length; i += 1) {
	            actionVariable = actionVariables[i];
	            // escape nulls to empty string
	            actionVariable.name = actionVariable.name || "";
	            actionVariable.type = actionVariable.type || "";
	            actionVariable.node = actionVariable.node || "";
	            actionVariable.testValue = actionVariable.testValue || "";
	            actionVariable.actualValue = actionVariable.actualValue || "";
	            map[actionVariable.name] = actionVariable;
	        }
	
	        return map;
	    }
    }); 
    
    
    WorkflowActionEvent.HandledBy = /** @lends finesse.containerservices.WorkflowActionEvent.HandledBy.prototype */ {
        /**
         * This specifies that Finesse will handle this WorkflowActionEvent.  A 3rd Party can do additional processing
         * with the action, but first and foremost Finesse will handle this WorkflowAction.
         */
        FINESSE: "FINESSE",

        /**
         * This specifies that a 3rd Party will handle this WorkflowActionEvent.  Finesse's Workflow Engine Executor will 
         * ignore this action and expects Gadget Developers to take action.
         */
        OTHER: "OTHER",
        
        /**
         * @class This is the set of possible HandledBy values used for WorkflowActionEvent from ContainerServices.  This
         * is provided from the {@link finesse.containerservices.WorkflowActionEvent#getHandledBy} method.
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
    };    
    
    window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.WorkflowActionEvent = WorkflowActionEvent;
    
    return WorkflowActionEvent;
}));

/**
 * JavaScript representation of the Finesse TimerTickEvent
 *
 * @requires finesse.FinesseBase
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global FinesseBase: true, publisher:true, define:true, finesse:true, window:true */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/TimerTickEvent', ["FinesseBase"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase);
    }
}(function (FinesseBase) {
    var TimerTickEvent = FinesseBase.extend(/** @lends finesse.containerservices.TimerTickEvent.prototype */{
        /**
         * date the TimerTickEvent was queued 
         * @private
         */
        _dateQueued: null,

        /**
         * the frequency of the timer tick (in miiliseconds)
         * @private
         */
        _tickFrequency: 1000,

        /**
         * @class
         * JavaScript representation of a TimerTickEvent object.
         * The TimerTickEvent object is delivered as the payload of
         * a TimerTickEvent callback.  This can be subscribed to by using
         * {@link finesse.containerservices.ContainerServices#addHandler} with a 
         * topic of {@link finesse.containerservices.ContainerServices.Topics#TIMER_TICK_EVENT}. 
         * 
         * @constructs
         **/
        init: function (tickFrequency, dateQueued) {
            this._super();
            
            this._tickFrequency = tickFrequency;
            this._dateQueued = dateQueued;
        },

       /**
         * Get the "tickFrequency" field
         * @param {int} which is the "TickFrequency" field
         * @private
         */
        getTickFrequency: function () {
            return this._tickFrequency;
        },

        /**
         * Getter for the TimerTickEvent "DateQueued" field. 
         * @returns {Date} which is a Date object when the TimerTickEvent was queued
         */
        getDateQueued: function () {
            return this._dateQueued;
        }

    });
    
    window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.TimerTickEvent = TimerTickEvent;
    
    return TimerTickEvent;
}));

/**
 * JavaScript representation of the Finesse GadgetViewChangedEvent object.
 *
 * @requires finesse.FinesseBase
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global FinesseBase: true, publisher:true, define:true, finesse:true, window:true */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/GadgetViewChangedEvent', ["FinesseBase"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase);
    }
}(function (FinesseBase) {
    var GadgetViewChangedEvent = FinesseBase.extend(/** @lends finesse.containerservices.GadgetViewChangedEvent.prototype */{
        /**
         * Reference to the gadget id
         * @private
         */
        _gadgetId: null,

        /**
         * Reference to the tab id
         * @private
         */
        _tabId: null,

        /**
         * Reference to the maxAvailableHeight
         * @private
         */
        _maxAvailableHeight: null,

        /**
         * Reference to the view
         * E.g. 'default' or 'canvas'
         * @private
         */
        _view: null,
        
        /**
         * @class
         * JavaScript representation of a GadgetViewChangedEvent object.
         * The GadgetViewChangedEvent object is delivered as the payload of
         * a GadgetViewChangedEvent callback.  This can be subscribed to by using
         * {@link finesse.containerservices.ContainerServices#addHandler} with a 
         * topic of {@link finesse.containerservices.ContainerServices.Topics#GADGET_VIEW_CHANGED_EVENT}. 
         * 
         * @constructs
         **/
        init: function (gadgetId, tabId, maxAvailableHeight, view) {
            this._super();

            this._gadgetId = gadgetId;
            this._tabId = tabId;
            this._maxAvailableHeight = maxAvailableHeight;
            this._view = view;
        },
    
        /**
         * Getter for the gadget id.
         * @returns {String} The identifier for the gadget changing view.
         */
        getGadgetId: function () {
            // escape nulls to empty string
            return this._gadgetId || "";
        },
    
        /**
         * Getter for the maximum available height.
         * @returns {String} The maximum available height for the gadget's view.
         */
        getMaxAvailableHeight: function () {
            // escape nulls to empty string
            return this._maxAvailableHeight || "";
        },

        /**
         * Getter for the tab id.
         * @returns {String} The identifier for the tab where the gadget changing view resides.
         */
        getTabId: function () {
            // escape nulls to empty string
            return this._tabId || "";
        },

        /**
         * Getter for the view.
         * @returns {String} The view type the gadget is changing to.
         */
        getView: function () {
            // escape nulls to empty string
            return this._view || "";
        }
    });
    
    window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.GadgetViewChangedEvent = GadgetViewChangedEvent;
    
    return GadgetViewChangedEvent;
}));

/**
 * JavaScript representation of the Finesse MaxAvailableHeightChangedEvent object.
 *
 * @requires finesse.FinesseBase
 */

/** The following comment is to prevent jslint errors about 
 * using variables before they are defined.
 */
/*global FinesseBase: true, publisher:true, define:true, finesse:true, window:true */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/MaxAvailableHeightChangedEvent', ["FinesseBase"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase);
    }
}(function (FinesseBase) {
    var MaxAvailableHeightChangedEvent = FinesseBase.extend(/** @lends finesse.containerservices.MaxAvailableHeightChangedEvent.prototype */{

        /**
         * Reference to the maxAvailableHeight
         * @private
         */
        _maxAvailableHeight: null,
        
        /**
         * @class
         * JavaScript representation of a MaxAvailableHeightChangedEvent object.
         * The MaxAvailableHeightChangedEvent object is delivered as the payload of
         * a MaxAvailableHeightChangedEvent callback.  This can be subscribed to by using
         * {@link finesse.containerservices.ContainerServices#addHandler} with a 
         * topic of {@link finesse.containerservices.ContainerServices.Topics#MAX_AVAILABLE_HEIGHT_CHANGED_EVENT}. 
         * 
         * @constructs
         **/
        init: function (maxAvailableHeight) {
            this._super();

            this._maxAvailableHeight = maxAvailableHeight;
        },
    
        /**
         * Getter for the maximum available height.
         * @returns {String} The maximum available height for a gadget in canvas view
         */
        getMaxAvailableHeight: function () {
            // escape nulls to empty string
            return this._maxAvailableHeight || "";
        }
    });
    
    window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.MaxAvailableHeightChangedEvent = MaxAvailableHeightChangedEvent;
    
    return MaxAvailableHeightChangedEvent;
}));

/**
 * Exposes a set of API wrappers that will hide the dirty work of
 *     constructing Finesse API requests and consuming Finesse events.
 *
 * @requires OpenAjax, jQuery 1.5, finesse.utilities.Utilities
 */

/** The following comment is to prevent jslint errors about using variables before they are defined. */
/*global window:true, gadgets:true, publisher:true, define:true, finesse:true, _tabTracker:true, _workflowActionEventTracker:true, _masterReloader:true, frameElement:true, $:true, parent:true, MockControl:true, _getNotifierReference:true, _gadgetViewChanged:true, _maxAvailableHeightChanged:true */
/*jslint nomen: true, unparam: true, sloppy: true, white: true */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('containerservices/ContainerServices',["utilities/Utilities",
                "restservices/Notifier",
                "containerservices/Topics",
                "containerservices/MasterPublisher",
                "containerservices/WorkflowActionEvent",
                "containerservices/TimerTickEvent",
                "containerservices/GadgetViewChangedEvent",
                "containerservices/MaxAvailableHeightChangedEvent"], factory );
    }
    
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.utilities.Utilities, finesse.restservices.Notifier, finesse.containerservices.Topics, finesse.containerservices.MasterPublisher, finesse.containerservices.WorkflowActionEvent);
    }
    
}(function (Utilities, Notifier, Topics, MasterPublisher, WorkflowActionEvent) {

    var ContainerServices = ( function () { /** @lends finesse.containerservices.ContainerServices.prototype */

    var

    /**
     * Shortcut reference to the Utilities singleton
     * This will be set by init()
     * @private
     */
    _util,

    /**
     * Shortcut reference to the gadget pubsub Hub instance.
     * This will be set by init()
     * @private
     */
    _hub,

    /**
     * Boolean whether this instance is master or not
     * @private
     */
    _master = false,

    /**
     * Whether the Client Services have been initiated yet.
     * @private
     */
    _inited = false,
    
    /**
     * References to ClientServices logger methods
     * @private
     */
    _logger = {
        log: finesse.clientservices.ClientServices.log
    },
    
     /**
     * Stores the list of subscription IDs for all subscriptions so that it
     * could be retrieve for unsubscriptions.
     * @private
     */
    _subscriptionID = {},
    
    /**
     * Reference to the gadget's parent container
     * @private
     */
    _container,

    /**
     * Reference to the MasterPublisher
     * @private
     */
    _publisher,
    
    /**
     * Object that will contain the Notifiers
     * @private
     */
    _notifiers = {},

    /**
     * Reference to the tabId that is associated with the gadget
     * @private
     */
    _myTab = null,
    
    /**
     * Reference to the visibility of current gadget
     * @private
     */
    _visible = false,
    
    /**
     * Shortcut reference to the Topics class.
     * This will be set by init()
     * @private
     */
    _topics,

    /**
     * Associates a topic name with the private handler function.
     * Adding a new topic requires that you add this association here 
     *  in to keep addHandler generic.
     * @param {String} topic : Specifies the callback to retrieve
     * @return {Function} The callback function associated with the topic param.
     * @private
     */
    _topicCallback = function (topic) {
        var callback, notifier;
        switch (topic)
        {
            case finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB:
                callback = _tabTracker;
                break;
            case finesse.containerservices.ContainerServices.Topics.WORKFLOW_ACTION_EVENT:
                callback = _workflowActionEventTracker;
                break;
            case finesse.containerservices.ContainerServices.Topics.RELOAD_GADGET_EVENT:
                callback = _masterReloader;
                break;
            case finesse.containerservices.ContainerServices.Topics.GADGET_VIEW_CHANGED_EVENT:
                callback = _gadgetViewChanged;
                break;
            case finesse.containerservices.ContainerServices.Topics.MAX_AVAILABLE_HEIGHT_CHANGED_EVENT:
                callback = _maxAvailableHeightChanged;
                break;
            default:
                callback = function (param) {
                     var data = null;
                     
                     notifier = _getNotifierReference(topic);
                     
                     if (arguments.length === 1) {
                        data = param;
                     } else {
                        data = arguments;
                     }
                     notifier.notifyListeners(data);
                };
        }
        return callback;
    },

    /**
     * Ensure that ClientServices have been inited.
     * @private
     */
    _isInited = function () {
        if (!_inited) {
            throw new Error("ContainerServices needs to be inited.");
        }
    },

    /**
     * Retrieves a Notifier reference to a particular topic, and creates one if it doesn't exist.
     * @param {String} topic : Specifies the notifier to retrieve
     * @return {Notifier} The notifier object.
     * @private
     */
    _getNotifierReference = function (topic) {
        if (!_notifiers.hasOwnProperty(topic))
        {
            _notifiers[topic] = new Notifier();
        }

        return _notifiers[topic];
    },

    /**
     * Utility function to make a subscription to a particular topic. Only one
     * callback function is registered to a particular topic at any time.
     * @param {String} topic
     *     The full topic name. The topic name should follow the OpenAjax
     *     convention using dot notation (ex: finesse.api.User.1000).
     * @param {Function} callback
     *     The function that should be invoked with the data when an event
     *     is delivered to the specific topic.
     * @returns {Boolean}
     *     True if the subscription was made successfully and the callback was
     *     been registered. False if the subscription already exist, the
     *     callback was not overwritten.
     * @private
     */
    _subscribe = function (topic, callback) {
        _isInited();

        //Ensure that the same subscription isn't made twice.
        if (!_subscriptionID[topic]) {
            //Store the subscription ID using the topic name as the key.
            _subscriptionID[topic] = _hub.subscribe(topic,
                //Invoke the callback just with the data object.
                function (topic, data) {
                    callback(data);
                });
            return true;
        }
        return false;
    },

    /**
     * Unsubscribe from a particular topic.
     * @param {String} topic : The full topic name.
     * @private
     */
    _unsubscribe = function (topic) {
        _isInited();

        //Unsubscribe from the topic using the subscription ID recorded when
        //the subscription was made, then delete the ID from data structure.
        _hub.unsubscribe(_subscriptionID[topic]);
        delete _subscriptionID[topic];
    },

    /**
     * Get my tab id.
     * @returns {String} tabid : The tabid of this container/gadget.
     * @private
     */
    _getMyTab = function () {
        if (_myTab === null)
        {
            try {
            _myTab = $(frameElement).closest("div.tab-panel").attr("id").replace("panel_", "");
            } catch (err) {
                _logger.log("Error accessing current tab: " + err.message);
               _myTab = null;
            }
        }
        return _myTab;
    },
    
    /**
     * Callback function that is called when an activeTab message is posted to the Hub.
     * Notifies listener functions if this tab is the one that was just made active.
     * @param {String} tabId : The tabId which was just made visible.
     * @private
     */
    _tabTracker = function(tabId) {
        if (tabId === _getMyTab()) {
            if(!_visible) {
                _visible = true;
                _notifiers[finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB].notifyListeners(this);
            }
        } else {
            _visible = false;
        }
    },
    
    /**
     * Make a request to set a particular tab active. This
     * method should be called after {@link finesse.containerservices.ContainerServices#addHandler}
     * to ensure the gadget gets properly initialized.
     * @param {String} tabId
     *    The tabId (not the label text) of the tab to make active.  If the id is invalid, no action will occur.
     * @private
     */
    _activateTab = function ( tabId ) {
        _logger.log("Sending request to activate tab: " + tabId);
        if(_hub){
            var data = {
                type: "SetActiveTabReq",
                data: { id: tabId },
                invokeID: (new Date()).getTime()          
            };
            _hub.publish(_topics.REQUESTS, data);
        } else {
            throw new Error("Hub is not defined.");
        }
        
    },

    /**
     * Callback function that is called when a gadget view changed message is posted to the Hub.
     * @private
     */
    _gadgetViewChanged = function (data) {
        if (data) {
            var gadgetViewChangedEvent = new finesse.containerservices.GadgetViewChangedEvent(
                data.gadgetId,
                data.tabId,
                data.maxAvailableHeight,
                data.view);

            _notifiers[finesse.containerservices.ContainerServices.Topics.GADGET_VIEW_CHANGED_EVENT].notifyListeners(gadgetViewChangedEvent);
        }
    },

    /**
     * Callback function that is called when a max available height changed message is posted to the Hub.
     * @private
     */
    _maxAvailableHeightChanged = function (data) {
        if (data) {
            var maxAvailableHeightChangedEvent = new finesse.containerservices.MaxAvailableHeightChangedEvent(
                data.maxAvailableHeight);

            _notifiers[finesse.containerservices.ContainerServices.Topics.MAX_AVAILABLE_HEIGHT_CHANGED_EVENT].notifyListeners(maxAvailableHeightChangedEvent);
        }
    },

    /**
     * Callback function that is called when a workflowActionEvent message is posted to the Hub.
     * Notifies listener functions if the posted object can be converted to a proper WorkflowActionEvent object.
     * @param {String} workflowActionEvent : The workflowActionEvent that was posted to the Hub
     * @private
     */
    _workflowActionEventTracker = function(workflowActionEvent) {
        var vWorkflowActionEvent = new finesse.containerservices.WorkflowActionEvent();
                
        if (vWorkflowActionEvent.setWorkflowActionEvent(workflowActionEvent)) {
            _notifiers[finesse.containerservices.ContainerServices.Topics.WORKFLOW_ACTION_EVENT].notifyListeners(vWorkflowActionEvent);
        }
        // else
        // {
            //?console.log("Error in ContainerServices : _workflowActionEventTracker - could not map published HUB object to WorkflowActionEvent");
        // }

    },

    /**
     * Callback function that is called when a reloadGadget event message is posted to the Hub.
     *
     * Grabs the id of the gadget we want to reload from the data and reload it!
     *
     * @param {String} topic
     *      which topic the event came on (unused)
     * @param {Object} data
     *      the data published with the event
     * @private
     */
    _masterReloader = function (topic, data) {
        var gadgetId = data.gadgetId;
        if (gadgetId) {
            _container.reloadGadget(gadgetId);
        }
    },
    
    /**
     * Pulls the gadget id from the url parameters
     * @return {String} id of the gadget
     * @private
     */
    _findMyGadgetId = function () {
        if (gadgets && gadgets.util && gadgets.util.getUrlParameters()) {
            return gadgets.util.getUrlParameters().mid;
        }
    };

    return {
        /**
         * @class
         * This class provides container-level services for gadget developers, exposing container events by
         * calling a set of exposed functions. Gadgets can utilize the container dialogs and 
         * event handling (add/remove).
         * @example
         *    containerServices = finesse.containerservices.ContainerServices.init();
         *    containerServices.addHandler(
         *      finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, 
         *      function() {
         *          clientLogs.log("Gadget is now visible");  // log to Finesse logger
         *          // automatically adjust the height of the gadget to show the html
         *          gadgets.window.adjustHeight();
         *      });
         *    containerServices.makeActiveTabReq();
         *    
         * @constructs
         */
        _fakeConstuctor: function () {
            /* This is here so we can document init() as a method rather than as a constructor. */
        },
        
        /**
         * Initialize ContainerServices for use in gadget.
         * @param {Boolean} [master=false] Do not use this parameter from your gadget.
         * @returns ContainerServices instance.
         */
        init: function (master) {
            if (!_inited) {
                _inited = true;
                // Set shortcuts
                _util = Utilities;

                //init the hub only when it's available
                if(gadgets.Hub) {
                    _hub = gadgets.Hub;
                }

                if(Topics) {
                    _topics = Topics;
                }

                if (master) {
                    _master = true;
                    _container = finesse.container.Container;
                    _publisher = new MasterPublisher();

                    // subscribe for reloading gadget events
                    // we only want the master ContainerServices handling these events
                    _hub.subscribe(_topics.RELOAD_GADGET, _topicCallback(_topics.RELOAD_GADGET));
                } else {
                    _container = parent.finesse.container.Container;
                }
            }
            
            this.makeActiveTabReq();

            //Return the CS object for object chaining.
            return this;
        },

        /**
         * Shows the jQuery UI Dialog with the specified parameters. The following are the
         * default parameters: <ul>
         *     <li> Title of "Cisco Finesse".</li>
         *     <li>Message of "A generic error has occured".</li>
         *     <li>The only button, "Ok", closes the dialog.</li>
         *     <li>Modal (blocks other dialogs).</li>
         *     <li>Not draggable.</li>
         *     <li>Fixed size.</li></ul>
         * @param {Object} options
         *  An object containing additional options for the dialog.
         * @param {String/Boolean} options.title
         *  Title to use. undefined defaults to "Cisco Finesse". false to hide
         * @param {Function} options.close
         *  A function to invoke when the dialog is closed.
         * @param {String} options.message
         *  The message to display in the dialog.
         *  Defaults to "A generic error has occurred."
         * @param {Boolean} options.isBlocking
         *  Flag indicating whether this dialog will block other dialogs from being shown (Modal).
         * @returns {jQuery} JQuery wrapped object of the dialog DOM element.
         * @see finesse.containerservices.ContainerServices#hideDialog
         */
        showDialog: function(options) {
            if ((_container.showDialog !== undefined) && (_container.showDialog !== this.showDialog)) {
                return _container.showDialog(options);
            }
        },
        
        /**
         * Hides the jQuery UI Dialog.
         * @returns {jQuery} jQuery wrapped object of the dialog DOM element
         * @see finesse.containerservices.ContainerServices#showDialog
         */
        hideDialog: function() {
            if ((_container.hideDialog !== undefined) && (_container.hideDialog !== this.hideDialog)) {
                return _container.hideDialog();
            }
        },

        /**
         *  Reloads the current gadget. 
         *  For use from within a gadget only.
         */
        reloadMyGadget: function () {
            var topic, gadgetId, data;

            if (!_master) {
                // first unsubscribe this gadget from all topics on the hub
                for (topic in _notifiers) {
                    if (_notifiers.hasOwnProperty(topic)) {
                        _unsubscribe(topic);
                        delete _notifiers[topic];
                    }
                }

                // send an asynch request to the hub to tell the master container
                // services that we want to refresh this gadget
                gadgetId = _findMyGadgetId();
                data = {
                    type: "ReloadGadgetReq",
                    data: {gadgetId: gadgetId},
                    invokeID: (new Date()).getTime()          
                };
                _hub.publish(_topics.REQUESTS, data);
            }            
        },

        /**
         * Updates the url for this gadget and then reload it.
         * 
         * This allows the gadget to be reloaded from a different location
         * than what is uploaded to the current server. For example, this
         * would be useful for 3rd party gadgets to implement their own failover
         * mechanisms.
         *
         * For use from within a gadget only.
         *
         * @param {String} url
         *      url from which to reload gadget
         */
        reloadMyGadgetFromUrl: function (url) {
            if (!_master) {
                var gadgetId = _findMyGadgetId();

                // update the url in the container
                _container.modifyGadgetUrl(gadgetId, url);

                // reload it
                this.reloadMyGadget();
            }
        },
        
        /**
         * Adds a handler for one of the supported topics provided by ContainerServices.  The callbacks provided
         * will be invoked when that topic is notified.  
         * @param {String} topic
         *  The Hub topic to which we are listening.
         * @param {Function} callback
         *  The callback function to invoke.
         * @see finesse.containerservices.ContainerServices.Topics
         * @see finesse.containerservices.ContainerServices#removeHandler
         */
        addHandler: function (topic, callback) {
            _isInited();
            var notifier = null;
            
            try {    
                // For backwards compatibility...
                if (topic === "tabVisible") {
                    if (window.console && typeof window.console.log === "function") {
                        window.console.log("WARNING - Using tabVisible as topic.  This is deprecated.  Use finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB now!");
                    }
                    
                    topic = finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB;
                }
                
                // Add the callback to the notifier.
                _util.validateHandler(callback);
            
                notifier = _getNotifierReference(topic);
            
                notifier.addListener(callback);
            
                // Subscribe to the topic. _subscribe ensures that a topic is only subscribed to once,
                // so attempt to subscribe each time a handler is added. This ensures that a topic is subscribed
                // to only when necessary.
                _subscribe(topic, _topicCallback(topic));
            
            } catch (err) {
                throw new Error("addHandler(): " + err);
            }
        }, 
        
        /**
         * Removes a previously-added handler for one of the supported topics.
         * @param {String} topic
         *  The Hub topic from which we are removing the callback.
         * @param {Function} callback
         *  The name of the callback function to remove.
         * @see finesse.containerservices.ContainerServices.Topics
         * @see finesse.containerservices.ContainerServices#addHandler
         */
        removeHandler: function(topic, callback) {
            var notifier = null;
            
            try {
                _util.validateHandler(callback);
    
                notifier = _getNotifierReference(topic);
    
                notifier.removeListener(callback);
            } catch (err) {
                throw new Error("removeHandler(): " + err);
            }
        },

        /**
         * Returns the visibility of current gadget.  Note that this 
         * will not be set until after the initialization of the gadget.
         * @return {Boolean} The visibility of current gadget.
         */
        tabVisible: function(){
            return _visible;
        },
        
        /**
         * Make a request to check the current tab.  The 
         * activeTab event will be invoked if on the active tab.  This
         * method should be called after {@link finesse.containerservices.ContainerServices#addHandler}
         * to ensure the gadget gets properly initialized.
         */
        makeActiveTabReq : function () {
            if(_hub){
                var data = {
                    type: "ActiveTabReq",
                    data: {},
                    invokeID: (new Date()).getTime()          
                };
                _hub.publish(_topics.REQUESTS, data);
            } else {
                throw new Error("Hub is not defined.");
            }
            
        },

        /**
         * Make a request to set a particular tab active. This
         * method should be called after {@link finesse.containerservices.ContainerServices#addHandler}
         * to ensure the gadget gets properly initialized.
         * @param {String} tabId
         *    The tabId (not the label text) of the tab to make active.  If the id is invalid, no action will occur.
         */
        activateTab : function (tabId) {
            _activateTab(tabId);
        },
        
        /**
         * Make a request to set this container's tab active. This
         * method should be called after {@link finesse.containerservices.ContainerServices#addHandler}
         * to ensure the gadget gets properly initialized.
         */
        activateMyTab : function () {
            _activateTab( _getMyTab() );
        },
        
        /**
         * Get the tabId of my container/gadget.
         * @returns {String} tabid : The tabid of this container/gadget.
         */
        getMyTabId : function () {
            return _getMyTab();
        },

        /**
         * Gets the id of the gadget.
         * @returns {number} the id of the gadget
         */
        getMyGadgetId : function () {
            return _findMyGadgetId();
        },

        //BEGIN TEST CODE//
        /**
         * Test code added to expose private functions that are used by unit test
         * framework. This section of code is removed during the build process
         * before packaging production code. The [begin|end]TestSection are used
         * by the build to identify the section to strip.
         * @ignore
         */
        beginTestSection : 0,

        /**
         * @ignore
         */
        getTestObject: function () {
            //Load mock dependencies.
            var _mock = new MockControl();
            _util = _mock.createMock(Utilities);
            _hub = _mock.createMock(gadgets.Hub);
            _inited = true;
            return {
                //Expose mock dependencies
                mock: _mock,
                hub: _hub,
                util: _util,
                addHandler: this.addHandler,
                removeHandler: this.removeHandler
            };
        },

        /**
         * @ignore
         */
       endTestSection: 0
        //END TEST CODE//
    };
    }());
    
    ContainerServices.Topics = /** @lends finesse.containerservices.ContainerServices.Topics.prototype */ {
        /**
         * Topic for subscribing to be notified when the active tab changes.
         * The provided callback will be invoked when the tab that the gadget 
         * that subscribes with this becomes active.  To ensure code is called
         * when the gadget is already on the active tab use the 
         * {@link finesse.containerservices.ContainerServices#makeActiveTabReq}
         * method.
         */
        ACTIVE_TAB: "finesse.containerservices.activeTab",

        /**
         * Topic for WorkflowAction events traffic.
         * The provided callback will be invoked when a WorkflowAction needs
         * to be handled.  The callback will be passed a {@link finesse.containerservices.WorkflowActionEvent}
         * that can be used to interrogate the WorkflowAction and determine to use or not.
         */
        WORKFLOW_ACTION_EVENT: "finesse.containerservices.workflowActionEvent",
        
        /**
         * Topic for Timer Tick event.
         * The provided callback will be invoked when this event is fired.
         * The callback will be passed a {@link finesse.containerservices.TimerTickEvent}.
         */
        TIMER_TICK_EVENT : "finesse.containerservices.timerTickEvent",

        /**
         * Topic for Reload Gadget events traffic.
         * Only the master ContainerServices instance will handle this event.
         */
        RELOAD_GADGET_EVENT: "finesse.containerservices.reloadGadget",
        
        /**
         * Topic for listening to gadget view changed events.
         * The provided callback will be invoked when a gadget changes view.
         * The callback will be passed a {@link finesse.containerservices.GadgetViewChangedEvent}.
         */
        GADGET_VIEW_CHANGED_EVENT: "finesse.containerservices.gadgetViewChangedEvent",

        /**
         * Topic for listening to max available height changed events.
         * The provided callback will be invoked when the maximum height available to a maximized gadget changes.
         * This event is only meant for maximized gadgets and will not be published unless a maximized gadget exists.
         * The callback will be passed a {@link finesse.containerservices.MaxAvailableHeightChangedEvent}.
         */
        MAX_AVAILABLE_HEIGHT_CHANGED_EVENT: "finesse.containerservices.maxAvailableHeightChangedEvent",

        /**
         * @class This is the set of Topics used for subscribing for events from ContainerServices.
         * Use {@link finesse.containerservices.ContainerServices#addHandler} to subscribe to the topic.
         * 
         * @constructs
         */
        _fakeConstructor : function () {} // For JS Doc to work need a constructor so that the lends/constructs build the doc properly
    };
    
    window.finesse = window.finesse || {};
    window.finesse.containerservices = window.finesse.containerservices || {};
    window.finesse.containerservices.ContainerServices = ContainerServices;

    return ContainerServices;
 }));

/**
 * This "interface" is just a way to easily jsdoc the Object callback handlers.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('interfaces/RestObjectHandlers', ["FinesseBase",
                 "utilities/Utilities",
                 "restservices/Notifier",
                 "clientservices/ClientServices",
                 "clientservices/Topics"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase, finesse.utilities.Utilities,
                finesse.restservices.Notifier,
                finesse.clientservices.ClientServices,
                finesse.clientservices.Topics);
    } 
}(function () {

    var RestObjectHandlers = ( function () { /** @lends finesse.interfaces.RestObjectHandlers.prototype */
        
        return {

            /**
             * @class
             * This "interface" defines REST Object callback handlers, passed as an argument to
             * Object getter methods in cases where the Object is going to be created.
             * 
             * @param {Object} [handlers]
             *     An object containing callback handlers for instantiation and runtime
             *     Callback to invoke upon successful instantiation, passes in REST object.
             * @param {Function} [handlers.onLoad(this)]
             *     Callback to invoke upon loading the data for the first time.
             * @param {Function} [handlers.onChange(this)]
             *     Callback to invoke upon successful update object (PUT)
             * @param {Function} [handlers.onAdd(this)]
             *     Callback to invoke upon successful update to add object (POST)
             * @param {Function} [handlers.onDelete(this)]
             *     Callback to invoke upon successful update to delete object (DELETE)
             * @param {Function} [handlers.onError(rsp)]
             *     Callback to invoke on update error (refresh or event)
             *     as passed by finesse.restservices.RestBase.restRequest()<br>
             *     {<br>
             *         status: {Number} The HTTP status code returned<br>
             *         content: {String} Raw string of response<br>
             *         object: {Object} Parsed object of response<br>
             *         error: {Object} Wrapped exception that was caught<br>
             *         error.errorType: {String} Type of error that was caught<br>
             *         error.errorMessage: {String} Message associated with error<br>
             *     }<br>
             *     <br>
             * Note that RestCollections have two additional callback handlers:<br>
             * <br>
             * @param {Function} [handlers.onCollectionAdd(this)]: when an object is added to this collection
             * @param {Function} [handlers.onCollectionDelete(this)]: when an object is removed from this collection

             * @constructs
             */
            _fakeConstuctor: function () {
                /* This is here to enable jsdoc to document this as a class. */
            }
        };
    }());

window.finesse = window.finesse || {};
window.finesse.interfaces = window.finesse.interfaces || {};
window.finesse.interfaces.RestObjectHandlers = RestObjectHandlers;

return RestObjectHandlers;

}));


/**
 * This "interface" is just a way to easily jsdoc the REST request handlers.
 *
 * @requires finesse.clientservices.ClientServices
 * @requires Class
 */
/** @private */
(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('interfaces/RequestHandlers', ["FinesseBase",
                 "utilities/Utilities",
                 "restservices/Notifier",
                 "clientservices/ClientServices",
                 "clientservices/Topics"], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory(finesse.FinesseBase, finesse.utilities.Utilities,
                finesse.restservices.Notifier,
                finesse.clientservices.ClientServices,
                finesse.clientservices.Topics);
    } 
}(function () {

    var RequestHandlers = ( function () { /** @lends finesse.interfaces.RequestHandlers.prototype */
        
        return {

            /**
             * @class
             * This "interface" defines REST Object callback handlers, passed as an argument to
             * Object getter methods in cases where the Object is going to be created.
             * 
             * @param {Object} handlers
             *     An object containing the following (optional) handlers for the request:<ul>
             *         <li><b>success(rsp):</b> A callback function for a successful request to be invoked with the following
             *         response object as its only parameter:<ul>
             *             <li><b>status:</b> {Number} The HTTP status code returned</li>
             *             <li><b>content:</b> {String} Raw string of response</li>
             *             <li><b>object:</b> {Object} Parsed object of response</li></ul>
             *         <li><b>error(rsp):</b> An error callback function for an unsuccessful request to be invoked with the
             *         error response object as its only parameter:<ul>
             *             <li><b>status:</b> {Number} The HTTP status code returned</li>
             *             <li><b>content:</b> {String} Raw string of response</li>
             *             <li><b>object:</b> {Object} Parsed object of response (HTTP errors)</li>
             *             <li><b>error:</b> {Object} Wrapped exception that was caught:<ul>
             *                 <li><b>errorType:</b> {String} Type of error that was caught</li>
             *                 <li><b>errorMessage:</b> {String} Message associated with error</li>
             *             </ul></li>
             *         </ul>

             * @constructs 
             */
            _fakeConstuctor: function () {
                /* This is here to enable jsdoc to document this as a class. */
            }
        };
    }());

window.finesse = window.finesse || {};
window.finesse.interfaces = window.finesse.interfaces || {};
window.finesse.interfaces.RequestHandlers = RequestHandlers;

finesse = finesse || {};
/** @namespace These interfaces are just a convenience for documenting common parameter structures. */
finesse.interfaces = finesse.interfaces || {};

return RequestHandlers;

}));


(function (factory) {
    

    // Define as an AMD module if possible
    if ( typeof define === 'function' && define.amd )
    {
        define('finesse-desktop', [], factory );
    }
    /* Define using browser globals otherwise
     * Prevent multiple instantiations if the script is loaded twice
     */
    else
    {
        factory();
    }
}(function () {
    if (typeof require === 'function') {
        (function () {
            /*
              The 'paths' section lets you define keys to refer to libraries
              so you don't have to to refer to them by their full paths everywhere.

              This removes the need to refer to 3rd-party libraries using the '3rdparty' path,
              and the need to refer to patched libaries using the '.patched' suffix.

              These keys are usable inside all require() calls inside each gadget module.
            */
            require.config({
                paths : {
                    'Math.uuid' : '../thirdparty/util/Math.uuid',
                    'iso8601' : '../thirdparty/util/iso8601'
                },

                /*
                  This 'shim' section lets you specify a dependency tree for all libaries that are NOT AMD modules.
                  (AMD modules always contain a 'define()' call. For more information about AMD: https://github.com/amdjs/amdjs-api/wiki/AMD)

                  ** DO NOT list any AMD modules in this 'shim' section. **

                  The format is 'libraryKey': ['dependencyKey1', 'dependencyKey2' ...]. Both keys can refer to any JS module
                  or one of the 'path' keys listed above.

                  FOR EXAMPLE:
                    dataTables depends on jQuery, but all of the dataTables plugins depend on dataTables.
                    We can refer to 'dataTables' and 'dataTables.scroller' as keys on the left side
                    since those are aliases defined in the 'paths' section above.

                  NOTE: Most jQuery plugins ARE NOT AMD modules, so when adding a new jQuery plugin that is not an AMD module,
                  make sure it has jquery listed as a dependency here (similar to all of the boostrap-* plugins, jquery.cookie, etc.)

                  Official documentation on RequireJS shim configuration: http://requirejs.org/docs/api.html#config-shim
                */
                shim : {
                    'Math.uuid' : {
                        exports : 'Math'
                    }
                }
            });
            
            //All modules in this list (and their dependencies) will be concatenated into one file to be used in the container and gadgets
            require(['restservices/Users',
                     'restservices/Teams',
                     'restservices/SystemInfo',
                     'utilities/I18n',
                     'utilities/Logger',
                     'utilities/SaxParser',
                     'cslogger/ClientLogger',
                     'cslogger/FinesseLogger',
                     'containerservices/ContainerServices',
                     'interfaces/RestObjectHandlers',
                     'interfaces/RequestHandlers'], function() {
                // Do nothing                
            });
        }.bind(this)());
    }

    // If being used in a gadget, stuff the auth string into the gadget prefs
    if (gadgets.Prefs) {
        var _prefs = new gadgets.Prefs(),
        authString = finesse.utilities.Utilities.getUserAuthString();
        _prefs.set("authorization", authString);
    }
}));
