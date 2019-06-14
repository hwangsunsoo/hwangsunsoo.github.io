(function(window, $){
    var doc = document;
    var PopupObjectModule = {};
    var isDebug = true;
    var urlMode = 'prd'; // dev, stg, prd
    var testUrl = '';
    /** urlMode 자동 변경 */
    (function(){
        var location = window.location;
        var hostName = location.hostname;
        if ( hostName ) {
            if (hostName.indexOf('local') !== -1 ) { urlMode = 'dev'; }
            else {
                var firstString = hostName.split('.')[0];
                if ( firstString ) {
                    if ( firstString.indexOf('dev') !== -1 ) { urlMode = 'dev'; }
                    else if ( firstString.indexOf('stg') !== -1) { urlMode = 'stg'; }
                    else { urlMode = 'prd'; }
                }
            }
        }
    }());
    var urlSwith = (urlMode === 'dev') ? '-dev' : ((urlMode === 'stg') ? '-stg' : '');
    var popupDealUrl = 'wmars'+ urlSwith +'.wemakeprice.com/front/popup' + testUrl;
    var environment = {
        production           : true,
        rollType             : 'POPUP',
        version              : 'ORANGE_SR1',
        wmarsAdLogUrl        : 'http://test-api-log.wemakeprice.com/',
        wmarsApiUrl          : 'wmars'+ urlSwith +'.wemakeprice.com/v2/',
        wmarsGnbApiUrl       : 'wmars'+ urlSwith +'.wemakeprice.com/',
        trackingUrl          : (urlMode === 'prd') ? 'wmp-cloudapps.wemakeprice.com/' : 'wmp-cloudapps-dev.wemakeprice.com/',
        itemLinkUrl : {
            url_doEvent : 'wemakeprice://doEvent?wemakeprice_json_action=',
            str_regacy  : '%7B%22mode%22%3A%220%22%2C%22type%22%3A5%2C%22value%22%3A%22',
            str_deal    : '%7B%22mode%22%3A%224%22%2C%22depth%22%3A%220%22%2C%22type%22%3A5%2C%22value%22%3A%22',
            str_product : '%7B%22mode%22%3A%224%22%2C%22depth%22%3A%221%22%2C%22type%22%3A5%2C%22value%22%3A%22',
            str_common  : '%22%7D'
        }
    };
    var userDeviceInfo = window.CheckDevice();
    var appPopup = $('#app_popup');
    var appPopupLink = $('#link_product');
    var onCheckProtocol = function(url) {
        var location;
        var protocol;
        if ( url.indexOf('http') === 0 ) {
            return url;
        } else {
            if ( window && window.location ) {
                    location = window.location;
            } else {
                var isLocation = this.location['_platformStrategy'];
                if ( isLocation ) {isLocation = ['_platformLocation']; }
                location = isLocation.location;
            }
            if ( location ) {
                protocol = location.protocol.split(':')[0];
                url = (protocol + '://') + url;
            }
        }
        return url;
    }
    /** [공통 통신 모듈 설정] */
    var $ajaxCommonModule = function(type, url, param, success, error) {
        var ajaxParam = {
            type: type,
            url: onCheckProtocol(url),
            dataType : "json",
            xhrFields: { withCredentials: true },
            success: success,
            error: error
        };
        if ( param ) { ajaxParam['data'] = param }
        $.ajax(ajaxParam);
    };

    var getCookieFromUserDevice = function(cname) {
        var name = cname + '=';
        var doc_cookie = document.cookie;
        var doc_cookie_str = doc_cookie.replace(/\s/gi, '');
        if ( !doc_cookie_str ) {return ''; }
        try {
            var encodeCookie = encodeURIComponent(doc_cookie_str);
            var decodedCookie = decodeURIComponent(encodeCookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        } catch (err) {
            console.log(err);
        } finally {}
    }

    /** [공통 링크 추출 모듈 설정] */
    var getUrlInfoFromDealIdNumber = function(dealId) {
        var itemLinkUrl = environment.itemLinkUrl;
        if ( dealId ) {
            // Mobile App
            var resultUrl;
            var urltype = 'product';
            var dealIdString = dealId.toString();
            var dealIdDigit = dealIdString.length;
            var dealIdFirst = dealIdString.substring(0, 1);
            var resultArray = [];
            resultArray[0] = itemLinkUrl.url_doEvent;
            resultArray[1] = (itemLinkUrl.str_product);
            if (dealIdDigit === 7) {
                resultArray[1] = (itemLinkUrl.str_regacy);
                urltype = 'regacy';
            }
            if (dealIdDigit === 9 && dealIdFirst === '6') {
                resultArray[1] = (itemLinkUrl.str_deal);
                urltype = 'deal';
            }
            resultArray[2] = dealId;
            resultArray[3] = itemLinkUrl.str_common;
            resultUrl = resultArray.join('');

            if (isDebug) {
                console.log('[아이템 url 링크 디버깅]------------------------------------');
                console.log('dealIdString:: ', dealIdString);
                console.log('dealIdDigit:: ', dealIdDigit);
                console.log('dealIdFirst:: ', dealIdFirst);
                console.log('resultArray:: ', resultArray);
                console.log('resultUrlType:: ', urltype);
                console.log('resultUrl:: ', resultUrl);
                console.log('--------------------------------------------------------');
            }
            return resultUrl;
        }
    }

    /** [팝업데이터 호출합니다~] */
    PopupObjectModule.setData = function() {
        var module = this;
        $ajaxCommonModule('GET', popupDealUrl, null, function(result){
            if(isDebug) { console.log(result); }
            module.appState.apiRsult = result;
            var labelDealText = String(/\[.*\]/.exec(result.main_name));
            appPopup.attr('data-deal-id',result.dealId);
            if(result.reMarkType === 'AD') {
                doc.getElementById('label_ad').style.display = 'inline-block';
            }
            if(labelDealText !== 'null') {
                doc.getElementById('label_deal').textContent = labelDealText;
            } else {
                doc.getElementById('label_deal').textContent = '[고객님을 We한 제안]';
            }
            doc.getElementById('price_number').textContent = module.numberWithCommas(result.price_expose);
            doc.getElementById('title_deal').textContent = result.main_name.replace(/\[.*\]/,'');
            doc.getElementById('price_text').textContent = result.price_text;
            doc.getElementById('thumbnailImg').style.backgroundImage = 'url('+result.img_app_onecut+')';
            /** [확인] 광고 노출 로그는 전송하지 않습니다~ 추후에 전송에 관한 얘기가 있을때 그때 전송합니다~ */
            // module.getAppInfoStateForParam(result);
            // module.setTrackingViewLogData(result);
            module.lazyLoadImage(result.img_app_onecut);
        }, function() {
            module.lazyLoadImage(null);
        });
    }
    PopupObjectModule.getAppInfoStateForParam = function(result) {
		var param_appVersion = userDeviceInfo.userAppVersion || '4.18.0';
        var param_platformName = userDeviceInfo.userPlatformName;
        var param_pcStamp = getCookieFromUserDevice('wmp_pcstamp') || '';
        var mid = this.appState.mid || '';
		var param_platform = 0;
		switch (param_platformName) {
			case 'android' : param_platform = 3; break;
			case 'ios'     : param_platform = 2; break;
			case 'mw'      : param_platform = 1; break;
			case 'pc'      : param_platform = 0; break;
        }
        var apiParam = {
            m_id             : mid || '',
            add_id           : result.addId,
            pcstamp          : param_pcStamp,
            app_version      : param_appVersion,
            platform         : param_platform,
            ad_product_type  : 'PROGRAM_AD',
            add_type         : 'view',
            keyword          : '',
            watch_time       : ''
        }
        if (isDebug) { console.log( JSON.stringify(apiParam, null, 2)); }
        $ajaxCommonModule('GET', 'http://test-api-log.wemakeprice.com/ad_search.php', apiParam, function(success){
            if(isDebug) { console.log('adviewlog-success'); }
        });
    }
    $.extend(PopupObjectModule, {
        appState : { apiRsult : null, mid: null },
        /** [yujh]: 이곳에 임시로 늦은 로딩에 관한 메서드 정의했습니다.. */
        lazyLoadImage : function(src) {
            var target = $('#thumbnailImg');
            var completeLoad = function() { target.css('display', 'block'); };
            if ( src ) {
                var img = new Image();
                img.onload = function() { target.fadeIn(200); };
                img.onerror = function() { target.fadeIn(200); };
                img.src = src;
                setTimeout(completeLoad, 3000);
            } else {
                completeLoad();
            }
        },
        /* 원화구분 */
        numberWithCommas : function(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        /* 딜링크 클릭 이동 */
        dealLinkClick : function(dealId) {
            window.location.href = getUrlInfoFromDealIdNumber(dealId);
        },
        getActionTime : function(){
            var times = new Date();
            var result = Math.floor(times.getTime());
            return result;
        },
        getUsersMetaInfo : function() {
            var module = this;
            var url = environment.wmarsApiUrl + 'recommend/app/getUserMetaInfo';
            $ajaxCommonModule('GET', url, {
                displayRoleId : 1002
            }, function(result) {
                if ( result && typeof result === 'object' ) {
                    module.appState.mid = result.mid;
                }
            });
        },

        /** 앱트래킹:: 뷰 로그 */
        createTrackingViewParamData : function(trackingParam) {
            var version = userDeviceInfo.userAppVersion || '4.18.0';
            var deviceOs = userDeviceInfo.userPlatformName;
            var param_pcStamp = getCookieFromUserDevice('wmp_pcstamp') || '';
            var apiParam = {
                dvcid   : 'wmpwstreet01',
                version : version,
                os      : deviceOs,
                q       : [{
                    'id'    : trackingParam.trackingId,
                    'mngid' : trackingParam.mngId,
                    'pcstamp' : param_pcStamp,
                    'view'  : [{
                        'd'   : trackingParam.dealId,
                        'p'   : '0',
                        'apt' : trackingParam.apt || 'PROGRAM_AD', // 개인화 광고 프로젝트에 따라 상품 상세 클릭 일 때 광고 상품이면 광고의 ad_product_type이 됨
                        'addid' : trackingParam.addid, // 개인화 광고 프로젝트에 따라 상품 상세 클릭 일 때 광고 상품이면 광고의 add_id
                        'rgtme' : this.getActionTime()
                    }]
                }]
            };
            if (isDebug) { console.log( JSON.stringify(apiParam, null, 2)); }
            var userCategoryUrl = environment.trackingUrl + 'trackinglog';
            $ajaxCommonModule('POST', userCategoryUrl, {
                compress : 'N',
                data     : JSON.stringify(apiParam)
            }, function(success){
                console.log('view-success');
            });
        },
        /** 앱트래킹:: 클릭 로그 */
        createTrackingParamData : function(trackingParam) {
            var version = userDeviceInfo.userAppVersion || '4.18.0';
            var deviceOs = userDeviceInfo.userPlatformName;
            var param_pcStamp = getCookieFromUserDevice('wmp_pcstamp') || '';
            var apiParam = {
                dvcid   : 'wmpwstreet01',
                version : version,
                os      : deviceOs,
                q       : [{
                    'id'    : trackingParam.trackingId,
                    'mngid' : trackingParam.mngId,
                    'rgtme' : this.getActionTime(),
                    'apt'   : trackingParam.apt || 'PROGRAM_AD', // 개인화 광고 프로젝트에 따라 상품 상세 클릭 일 때 광고 상품이면 광고의 ad_product_type이 됨
                    'addid' : trackingParam.addid, // 개인화 광고 프로젝트에 따라 상품 상세 클릭 일 때 광고 상품이면 광고의 add_id
                    'pcstamp' : param_pcStamp,
                    'lnk': {
                        't': trackingParam.contentType,
                        'v': trackingParam.itemLink,
                        'n': trackingParam.serviceName,
                        'm': '0',
                        'd': trackingParam.isDeal // 'y' //'n'
                    }
                }]
            };
            if (isDebug) { console.log( JSON.stringify(apiParam, null, 2)); }
            var userCategoryUrl = environment.trackingUrl + 'trackinglog';
            $ajaxCommonModule('POST', userCategoryUrl, {
                compress : 'N',
                data     : JSON.stringify(apiParam)
            }, function(success){
                console.log(success)
            });
        },


        setTrackingViewLogData : function (data) {
            if(isDebug) { console.log('data::', data); }
            var isDeal = 'y';
            var isApt = data.apt || '';
            var isAddid = data.addId || '';
            var itemLink = getUrlInfoFromDealIdNumber(data.dealId)
            var trackingParam = {
                serviceName : 'app start popup' ,
                trackingId  : 'POPUP' ,
                contentType : '5',
                mngId       : data.trackingCodeIdentity || '',
                dealId      : data.dealId,
                itemLink    : itemLink,
                isDeal      : isDeal,
                apt         : isApt,
                addid       : isAddid,
            };
            if (isDebug) { console.log('tracking::: ', trackingParam); }
            this.createTrackingViewParamData(trackingParam);
        },

        setTrackingInfoLogData : function (data) {
            if(isDebug) { console.log('data::', data); }
            var isDeal = 'y';
            var isApt = data.apt || '';
            var isAddid = data.addId || '';
            var itemLink = getUrlInfoFromDealIdNumber(data.dealId)
            var trackingParam = {
                serviceName : 'app start popup' ,
                trackingId  : 'POPUP' ,
                contentType : '5',
                mngId       : data.trackingCodeIdentity || '',
                itemLink    : itemLink,
                isDeal      : isDeal,
                apt         : isApt,
                addid       : isAddid,
            };
            if (isDebug) { console.log('tracking::: ', trackingParam); }
            this.createTrackingParamData(trackingParam);
        },
        control : function(){
            var module = this;
            appPopupLink.on('click', function(){
                var apiResult = module.appState.apiRsult;
                if ( apiResult && apiResult.dealId ) {
                    module.setTrackingInfoLogData(apiResult);
                    module.dealLinkClick(apiResult.dealId);
                }
                return false;
            });
        },
        init : function() {
            appPopup.attr({
                'data-user-os'      : userDeviceInfo.os,
                'data-user-browser' : userDeviceInfo.browser
            });
            this.getUsersMetaInfo();
            this.setData(); 
            // this.control();
        }
    });
    PopupObjectModule.init();

    window['isHostStateStringCall'] = function(){
        console.log(JSON.stringify({
            urlMode : urlMode, 
            urlSwith : urlSwith,
            popupDealUrl : popupDealUrl
        }, null, 2));
    };
}(window, jQuery));