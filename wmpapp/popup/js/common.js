/**
 * Created by we on 2018. 8. 3..
 * 사용자 접속 기기정보를 추출하는 모듈.
 */

(function(window){
    'use strict';
    /** 기본 정의 */
    var _checkDevice = function(){
        this.init = function(){
            var currentOS = {
                isMobile : false,
                device: { model : null, type : null },
                os : null,
                browser : null,
                userAgent : null,
                ratio : null,
                paltformDivision : null,
                platformDomain : null,
                webDomain : document.domain || '',
                userPlatformName : null,
                userAppVersion : ''
            };
            var ratio = window['devicePixelRatio'] || 1;
            var mobile = (/iphone|ipad|ipod|android|NOKIA/i.test(navigator.userAgent.toLowerCase()));
            var userAgent = navigator.userAgent.toLowerCase();
            var userAgentParse = userAgent.split(' ');
            var screenW = window.screen.width;
            var screenH = window.screen.height;
            currentOS.userAgent = navigator.userAgent;
            currentOS.browser = userAgent.search('chrome') > -1 ?
                    'Chrome' : userAgent.search('safari') > -1 ?
                    'Safari' : userAgent.search('firefox') > -1 ? 'Firefox' : 'None IE';
            currentOS.ratio = {ratio : ratio, w : screenW * ratio, h : screenH * ratio};
            for(var i=0; i<userAgentParse.length; i++) {
                var _data = userAgentParse[i];
                var isApp = (_data.indexOf('App/') !== -1);
                var isWmpApp = (_data.indexOf('wmpapps/') !== -1);
                if ( !isApp && !isWmpApp ) { currentOS.userAppVersion = ''; }
                if (isApp || isWmpApp) { currentOS.userAppVersion = _data.split('/')[1]; }
            }
            if (mobile) {
                currentOS.isMobile = true;
                currentOS.os = (userAgent.search('android') > -1) ?
                    'android' : ((userAgent.search('iphone') > -1) ||
                    (userAgent.search('ipod') > -1) || (userAgent.search('ipad') > -1)) ? 'ios' : 'else';
                if ( currentOS.os === 'ios') {
                    if ( currentOS.ratio.ratio === 2 && currentOS.ratio.w === 2048 && currentOS.ratio.h === 2732 ) {
                        currentOS.device.model = 'ipad-pro';
                        currentOS.device.type = 'tablet';
                    } else if ( currentOS.ratio.ratio === 2 && currentOS.ratio.w === 1536 && currentOS.ratio.h === 2048 ) {
                        currentOS.device.model = 'ipad';
                        currentOS.device.type = 'tablet';
                    } else if ( currentOS.ratio.ratio === 3 && currentOS.ratio.w === 1125 && currentOS.ratio.h === 2436 ) {
                        currentOS.device.model = 'iphoneX';
                        currentOS.device.type = 'phone';
                    } else if ( currentOS.ratio.ratio === 3 && currentOS.ratio.w === 1242 && currentOS.ratio.h === 2208 ) {
                        currentOS.device.model = 'iphone-plus';
                        currentOS.device.type = 'phone';
                    } else {
                        currentOS.device.model = 'iphone';
                        currentOS.device.type = 'phone';
                    }
                } else {
                    currentOS.device.model = 'etc';
                    if ( screenW <= 640 ) { currentOS.device.type = 'phone'; } else { currentOS.device.type = 'tablet'; }
                }
            } else {
                currentOS.isMobile = false;
                currentOS.device.model = 'etc';
                currentOS.device.type = 'desktop';
                currentOS.os = navigator.platform;
                if ((navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) ||
                (userAgent.indexOf('msie') !== -1) ) { currentOS.browser = 'IE'; }
            }
        
            if ( userAgent.search('wmpapps') !== -1 || userAgent.search('wemakeprice') !== -1 ) {
                var isWmpApp = (userAgent.search('wmpapps') !== -1);
                currentOS.platformDomain = isWmpApp ? 'mw.wemakeprice.com' : 'app.wemakeprice.com';
                currentOS.paltformDivision = isWmpApp ? 'MW' : 'APP';
                if ( (currentOS.os === 'android' || currentOS.os === 'ios') ) {
                    currentOS.userPlatformName = currentOS.os;
                } else {
                    currentOS.userPlatformName = 'mw';
                }
            } else {
                currentOS.platformDomain = 'front.wemakeprice.com';
                currentOS.paltformDivision = 'PC';
                currentOS.userPlatformName = 'pc';
            }
            return currentOS;
        };
        return this.init();
    };
    window.CheckDevice = function(){ return new _checkDevice();}
    var checkDevice = window.CheckDevice();
    var getDom = document.getElementById('wstreet');
    if (getDom) { getDom.setAttribute("class", checkDevice.os+' '+checkDevice.browser); }




    // var _WmsTool = function() {
    //     return {
    //         ajax : this.xhr.bind(this)
    //     }
    // }
    // commomAjax.prototype = {
    //     checkObjectString : function(string) {
    //         var result = string;
    //         var newStr = result.replace(/\s/gi, "");
    //         var isObject = function(string){
    //             var objectRegExr = /^(\{.*\})/i;
    //             var arrayRegExr = /(\[.*\])/i;
    //             var typeIs = null;
    //             var isObject = false;
    //             if( objectRegExr.test(newStr) || arrayRegExr.test(newStr) ){
    //                 if( objectRegExr.test(newStr) ){
    //                     typeIs = 'object';
    //                 } else if( arrayRegExr.test(newStr) ) {
    //                     typeIs = 'array';
    //                 }
    //                 isObject = true;
    //             }
    //             return {
    //                 typeIs : typeIs,
    //                 isObject : isObject
    //             };
    //         }
    //         var checkObject =  isObject(newStr);
    //         if( checkObject.typeIs && checkObject.isObject ) {
    //             return JSON.parse(string);
    //         } else {
    //             return {
    //                 msg : '객체 타입이 아닙니다.'
    //             };
    //         }
    //     },
    //     getAjaxError: function(jqXHR) {
	// 		return {
	// 			code: jqXHR.status,
	// 			text: jqXHR.statusText,
	// 		}
	// 	},
    //     ajax : function(type, url, param, callback) {
	// 		var module = this;
	// 		var xhr = new XMLHttpRequest();
	// 		xhr.onreadystatechange = function (e) {
	// 			if (xhr.readyState === 4) {
	// 				if (xhr.status === 200) {
	// 					var responseTextJson = module.checkObjectString(xhr.responseText);
	// 					callback(responseTextJson, xhr);
	// 				}else {
	// 					callback(module.getAjaxError(xhr));
	// 				}
	// 			}
	// 		};
    //         xhr.open(type, url, true);
    //         xhr.withCredentials = true;
	// 		if (type === 'POST') {
	// 			xhr.setRequestHeader('Content-type', 'application/json');
	// 			xhr.setRequestHeader('withCredentials', true);
	// 			xhr.send(JSON.stringify(param));
	// 		} else {
	// 			xhr.send(null);
	// 		}
    //     }
    // }
    // window.$WmsTool = new _WmsTool();

    // window.$WmsTool.ajax('GET', )

}(window || this, undefined));