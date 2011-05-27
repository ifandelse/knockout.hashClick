// Knockout hashClick custom binding
// (c) Jim Cowart http://ifandelse.com
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the deparam function from jQuery BBQ is an essential piece for this
// plugin to work.  The license below is from Ben Alman's BBQ plugin.
// I am including it since the code was released under MIT, and because
// you owe it to yourself to check out the awesome work Ben is doing!
/*!
 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function(window,undefined){ 
if(typeof jQuery=="undefined")throw"You must include jQuery 1.4 or later in order for the hashClick custom binding to work.";var HashClickMediator=function(){var a=function(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,c)};this.priorHashParams={},this.mappings={},this.updateVmFromHash=function(){var a=hashClickHelpers.getHashParamsAsObject(),b;for(var c in a)a.hasOwnProperty(c)&&this.mappings[c]&&(typeof this.mappings[c].vm[this.mappings[c].member]=="function"?(b=ko.utils.unwrapObservable(this.mappings[c].vm[this.mappings[c].member]),b!==a[c]&&this.mappings[c].vm[this.mappings[c].member](a[c])):this.mappings[c].vm.member=a[c]);for(var d in this.mappings)this.mappings.hasOwnProperty(d)&&!a[d]&&this.priorHashParams[d]&&this.mappings[d].vm[this.mappings[d].member](this.mappings[d].defaultValue);this.priorHashParams=a}.bind(this),this.handleEvent=function(a,b,c){var d={},e=b.substitute?b.substitute:b.member,f;if(!b.member)throw"You must include a 'member' value for the hashClick binding to work.";d[e]=a,f={member:b.member,vm:c},this.mappings[b.substitute]?this.mappings[b.substitute]=$.extend(this.mappings[b.substitute],f):(f.defaultValue=ko.utils.unwrapObservable(c[b.member]),this.mappings[b.substitute]=f),hashClickHelpers.mergeOntoHashQueryString(d)}.bind(this),this.readyToUpdate=!1,a(window,"hashchange",this.updateVmFromHash)},mediator=new HashClickMediator,hashClickHelpers={getHash:function(){var a=/#(.*)$/.exec(location.href);return a&&a[1]?decodeURIComponent(a[1]):""},getHashQueryString:function(){var a=this.getHash().split("?");return a&&a[1]?a[1]:""},getHashParamsAsObject:function(){return this.deparam(this.getHashQueryString())},setHashQueryString:function(a){var b=this.getHash().split("?");window.location.hash=b[0]+"?"+a},deparam:function(a,b){var c={},d={"true":!0,"false":!1,"null":null};$.each(a.replace(/\+/g," ").split("&"),function(a,e){var f=e.split("="),g=decodeURIComponent(f[0]),h,i=c,j=0,k=g.split("]["),l=k.length-1;/\[/.test(k[0])&&/\]$/.test(k[l])?(k[l]=k[l].replace(/\]$/,""),k=k.shift().split("[").concat(k),l=k.length-1):l=0;if(f.length===2){h=decodeURIComponent(f[1]),b&&(h=h&&!isNaN(h)?+h:h==="undefined"?undefined:d[h]!==undefined?d[h]:h);if(l)for(;j<=l;j++)g=k[j]===""?i.length:k[j],i=i[g]=j<l?i[g]||(k[j+1]&&isNaN(k[j+1])?{}:[]):h;else $.isArray(c[g])?c[g].push(h):c[g]!==undefined?c[g]=[c[g],h]:c[g]=h}else g&&(c[g]=b?undefined:"")});return c},mergeOntoHashQueryString:function(a){var b=this.getHashQueryString(),c={},d;b.length===0?c=jQuery.param(a):(d=this.deparam(b),c=jQuery.param($.extend({},d,a))),this.setHashQueryString(c)}};ko.bindingHandlers.hashClick={init:function(a,b,c,d){var e=b();if(e.watch)var f=e.watch();ko.utils.registerEventHandler(a,"click",function(a){mediator.handleEvent(e.value,e,d)})},update:function(a,b,c,d){if(mediator.readyToUpdate){var e=b();mediator.handleEvent(ko.utils.unwrapObservable(d[e.member]),e,d)}else mediator.readyToUpdate=!0}}})(window);                  
