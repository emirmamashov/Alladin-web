var ObjPopUpBask = {'art':0,
        'cnt':0,
        'id':0,
        'url':''
};
$(document).delegate('.compare-checkbox', 'click', function(e) {
    var checkbox = $(e.target);
    var art = checkbox.attr('data-art');
    var container = checkbox.parent();

    if (!art) {
        return;
    }

    if (container.hasClass('is-active')) {
        container.removeClass('is-active');

        $.post('/catalogue/compare.php', {
            delete: art
        }, function (response) {
        });
    } else {
        $('a.compare-link').html('Перейти к <br>сравнению');
        container.addClass('is-active');

        $.post('/catalogue/compare.php', {
            add: art
        }, function (response) {

        });
    }

});

/*
$(document).on('click', 'a.header-location-hint__yes', function(){
    var url = $(this).attr('href');
    $.ajax({
        url: url,
        method: "GET"
    }).done(function(data) {
        console.log('Region selected');
    }).fail(function(data) {
        console.log('Region not selected');
    });

    return false;
});*/

/* Sanviz functions - start */
function sanvizGetShopID() {
    if ($.cookie('_FAV_SHOP') && !isNaN($.cookie('_FAV_SHOP'))) {
        return parseInt($.cookie('_FAV_SHOP')).toString();
    }

    return '';
}

function sanvizGetRegionID() {
    if ($.cookie('_regionID') && !isNaN($.cookie('_regionID'))) {
        return parseInt($.cookie('_regionID')).toString();
    }

    return '';
}

function sanvizGetStartCollection() {
    if (startCollection) {
        var brand = "Kerama Marazzi"; // заглушка, пока не используются производители
        return brand + ';' + startCollection;
    }

    return '';
}

function sanvizAddToShopList(tiles) {
    if (!tiles) {
        return false;
    }

    var arArt = {};

    tiles = tiles.replace(/\r\n/g, "\n");
    tiles = tiles.split(/\n/);

    tiles.forEach(function(tileStr) {
        var tileData = tileStr.split(/;/);

        if (tileData && tileData.length && tileData[0] && tileData[6]) {
            var art = tileData[0],
                cnt = tileData[6];

            arArt[art] = cnt;
        }
    });

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
        'arArt': arArt,
    }, function (data) {
        reloadSmallListUsingHtml(data);
    });

    return true;
}
/* Sanviz functions - end */

function showKitchenPopupFullscr(projectId, projectName, position) {
    if (typeof projectName == 'undefined') {
        projectName = '';
    }

    if (typeof position == 'undefined') {
        position = 1;
    }

    $.get(
        "/catalogue/kitchen-popups.php",
        {projectId: projectId},
        function (data) {
            $("#popup-kitchen-fullscr").html(data);
            $("#btnKitchenFullscr").trigger("click");
        },
        'html'
    );

    gtmEvent({
        'eventAction':'open',
        'eventLabel':'kitchenProjectPopup',
        'eventLocation':dataLayer[0].pageType,
        'eventProjectId': projectId,
        'eventProjectName': projectName,
        'eventPosition': parseInt(position)
    });
}

/* For new catalog sections design */
$(document).ready(function() {

    $('.show-all-cr-categories-link').on('click', function() {

        var target_link = $(this),
            target_ind = $(this).find('.cr-triangle-green-link-ind'),
            target_wrapper = target_link.closest('ul.cr-section-categories'),
            target = target_wrapper.find('li:nth-child(n+6):not(li:last-child)');

        if (target_link.hasClass('active')) {
            target.slideUp();
            target_link.removeClass('active')
            target_ind.html('+');
        } else {
            target.slideDown();
            target_link.addClass('active')
            target_ind.html('-');
        }

        return false;

    });

});

function discardPrevSettingsOnSearchPage() {
    $.removeCookie('_searchPageSectionsRefreshed');
}

/* Google Tag Management #17944 - start */
function gtmEventsAddProductPlus(articul, cnt, position, eventLocation, eventLabel, eventContent) { 
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul, 
            cnt: cnt,
            status: 0
        }
    }).done(function(data) {
        eventLocation = (eventLocation) ? eventLocation : dataLayer[0].pageType;
        eventLabel = (eventLabel) ? eventLabel : 'cart';
        eventContent = (typeof eventContent != 'undefined') ? eventContent : 'single';
        var obToLoad = {
            'event': 'LeroyMerlin', 
            'eventCategory': 'Conversions',
            'eventAction': 'add',
            'eventLabel': eventLabel,
            'eventContext': null,
            'eventContent': eventContent,
            'eventPosition': position,
            'eventLocation': eventLocation,
            'eventDivision': typeof data.gtmDivision != 'undefined' ? data.gtmDivision : "(not set)",
            'eventSubdivision': typeof data.gtmSubdivision != 'undefined' ? data.gtmSubdivision : "(not set)",
            'eventCategoryName': typeof data.gtmCategoryName != 'undefined' ? data.gtmCategoryName : "(not set)",
            'eventCategoryId': typeof data.gtmCategoryId != 'undefined' ? data.gtmCategoryId : "(not set)",
            'eventProductName': typeof data.name != 'undefined' ? data.name : "(not set)",
            'eventProductId': typeof data.article != 'undefined' ? data.article : "(not set)",
            'eventProductPrice': typeof data.gtmPrice != 'undefined' ? data.gtmPrice : "(not set)",
            'ecommerce': {
                'add': {
                    'actionField': {
                        'list': eventLocation,
                    },
                    'products': [{
                        'id': data.article,
                        'name': data.name,
                        'category': data.gtmCategoryName,
                        'brand': data.brand,
                        'position': position,
                        'variant': data.gtmWeight,
                        'dimension65': data.gtmDimension65,
                        'dimension77': data.gtmDimension77,
                        'dimension55': data.gtmDimension55,
                        'dimension61': data.gtmDimension61,
                        'dimension62': data.gtmDimension62,
                        'dimension63': data.gtmDimension63,
                        'dimension64': data.gtmDimension64,
                        'dimension9': data.gtmDimension9,
                        'price': data.gtmPrice,
                        'metric1': data.gtmPrice,
                        'quantity': cnt
                    }],
                }
            }
        }

        dataLayer.push(obToLoad);
    });
}

function gtmEventsRemoveProductMinus(articul, cnt, position, eventLocation) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul, 
            cnt: cnt,
            status: 0
        }
    }).done(function(data) {
       // eventLocation = (eventLocation) ? eventLocation : ((dataLayer[0].pageType == 'Checkout') ? 'Checkout' : 'cartPreview');
        var eL = '';
        if(typeof eventLocation != 'undefined' ){
            if(eventLocation == 'productPage' && dataLayer[0].pageType == 'Advice'){
                eL = 'cartPreview';
            }
            else{
                eL = eventLocation;
            }
        }else{
            eL = (dataLayer[0].pageType == 'Checkout') ? 'Checkout' : 'cartPreview';
        }
        eventLocation = eL;
        eventLocationList = (eventLocation) ? eventLocation : dataLayer[0].pageType;
        var obToLoad = {
            'event': 'LeroyMerlin', 
            'eventCategory': 'Interactions',
            'eventAction': 'remove',
            'eventLabel': 'cart',
            'eventContext': null,
            'eventContent': 'single',
            'eventPosition': null,
            'eventLocation': eventLocation,
            'eventDivision': data.gtmDivision,
            'eventSubdivision': data.gtmSubdivision,
            'eventCategoryName': data.gtmCategoryName,
            'eventCategoryId': data.gtmCategoryId,
            'eventProductName': data.name,
            'eventProductId': data.article,
            'eventProductPrice': data.gtmPrice,
            'ecommerce': {
                'remove': {
                    'actionField': {
                        'list': eventLocationList,
                    },
                    'products': [{
                        'id': data.article,
                        'name': data.name,
                        'category': data.gtmCategoryName,
                        'brand': data.brand,
                        'position': position,
                        'variant': data.gtmWeight,
                        'dimension65': data.gtmDimension65,
                        'dimension77': data.gtmDimension77,
                        'dimension55': data.gtmDimension55,
                        'dimension61': data.gtmDimension61,
                        'dimension62': data.gtmDimension62,
                        'dimension63': data.gtmDimension63,
                        'dimension64': data.gtmDimension64,
                        'dimension9': data.gtmDimension9,
                        'price': data.gtmPrice,
                        'metric1': data.gtmPrice,
                        'quantity': cnt
                    }],
                }
            }
        }

        dataLayer.push(obToLoad);
        
    });
}

function gtmEventsShopListPlus(articul, cnt, position) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: cnt
        }
    }).done(function(data) {
        var eventLocation = (dataLayer[0].pageType == 'Advice') ? 'AdviceProducts' : dataLayer[0].pageType;
        dataLayer.push({
            'event': 'LeroyMerlin',
            'eventCategory': 'Conversions',
            'eventAction': 'add',
            'eventLabel': 'WishList',
            'eventContext': null,
            'eventContent': null,
            'eventPosition': position || 1,
            'eventLocation': eventLocation,
            'eventDivision': typeof data.gtmDivision != 'undefined' ? data.gtmDivision : "(not set)",
            'eventSubdivision': typeof data.gtmSubdivision != 'undefined' ? data.gtmSubdivision : "(not set)",
            'eventCategoryName': typeof data.gtmCategoryName != 'undefined' ? data.gtmCategoryName : "(not set)",
            'eventCategoryId': typeof data.gtmCategoryId != 'undefined' ? data.gtmCategoryId : "(not set)",
            'eventProductName': typeof data.name != 'undefined' ? data.name : "(not set)",
            'eventProductId': typeof data.article != 'undefined' ? data.article : "(not set)",
            'eventProductPrice': typeof data.gtmPrice != 'undefined' ? data.gtmPrice : "(not set)",
            'ecommerce': null,
        });
    });
}

function gtmEventsCompareProduct(articul, position, typeEvent) {
    typeEvent = (typeof typeEvent == 'undefined') ? 'add' : typeEvent;
    var eventCategory = (typeEvent == 'add') ? 'Conversions' : 'Interactions';
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul, 
            cnt: 1
        }
    }).done(function(data) {
        var eventLocation = (dataLayer[0].pageType == 'Advice') ? 'AdviceProducts' : dataLayer[0].pageType;
        dataLayer.push({
            'event': 'LeroyMerlin', 
            'eventCategory': eventCategory,
            'eventAction': typeEvent,
            'eventLabel': 'compare',
            'eventContext': null,
            'eventContent': null,
            'eventPosition': position,
            'eventLocation': eventLocation,
            'eventDivision': typeof data.gtmDivision != 'undefined' ? data.gtmDivision : "(not set)",
            'eventSubdivision': typeof data.gtmSubdivision != 'undefined' ? data.gtmSubdivision : "(not set)",
            'eventCategoryName': typeof data.gtmCategoryName != 'undefined' ? data.gtmCategoryName : "(not set)",
            'eventCategoryId': typeof data.gtmCategoryId != 'undefined' ? data.gtmCategoryId : "(not set)",
            'eventProductName': typeof data.name != 'undefined' ? data.name : "(not set)",
            'eventProductId': typeof data.article != 'undefined' ? data.article : "(not set)",
            'eventProductPrice': typeof data.gtmPrice != 'undefined' ? data.gtmPrice : "(not set)",
            'ecommerce': null,
        });
    });
}

function gtmEventsShopListPlusSH(articul, cnt) { // SMART_HOUSE
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: cnt
        }
    }).done(function(data) {
        dataLayer.push({
            'event': 'LeroyMerlin',
            'eventCategory': 'Conversions',
            'eventAction': 'add',
            'eventLabel': 'WishList',
            'eventContext': null,
            'eventContent': null,
            'eventPosition': 1,
            'eventLocation': 'SmartHouse',
            'eventDivision': data.gtmDivision,
            'eventSubdivision': data.gtmSubdivision,
            'eventCategoryName': data.gtmCategoryName,
            'eventCategoryId': data.gtmCategoryId,
            'eventProductName': data.name,
            'eventProductId': data.article,
            'eventProductPrice': data.gtmPrice,
            'ecommerce': null,
        });
    });
}
function gtmEventsShopListMinus(articul, cnt, position, eventLocation) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: cnt
        }
    }).done(function(data) {
        eventLocation = (eventLocation !== false && !(dataLayer[0].pageType == 'Advice' || dataLayer[0].pageType == 'Checkout')) ? eventLocation : dataLayer[0].pageType;
        dataLayer.push({
            'event': 'LeroyMerlin',
            'eventCategory': 'Interactions',
            'eventAction': 'remove',
            'eventLabel': 'WishList',
            'eventContext': null,
            'eventContent': null,
            'eventPosition': position || 1,
            'eventLocation': eventLocation,
            'eventDivision': data.gtmDivision,
            'eventSubdivision': data.gtmSubdivision,
            'eventCategoryName': data.gtmCategoryName,
            'eventCategoryId': data.gtmCategoryId,
            'eventProductName': data.name,
            'eventProductId': data.article,
            'eventProductPrice': data.gtmPrice,
            'ecommerce': null,
        });
    });
}

function gtmEventsRemoveFromCompare(articul, position) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: 1
        }
    }).done(function(data) {

        dataLayer.push({
            'event': 'LeroyMerlin',
            'eventCategory': 'Interactions',
            'eventAction': 'remove',
            'eventLabel': 'compare',
            'eventContext': null,
            'eventContent': null,
            'eventPosition': position,
            'eventLocation': dataLayer[0].pageType,
            'eventDivision': data.gtmDivision,
            'eventSubdivision': data.gtmSubdivision,
            'eventCategoryName': data.gtmCategoryName,
            'eventCategoryId': data.gtmCategoryId,
            'eventProductName': data.name,
            'eventProductId': data.article,
            'eventProductPrice': data.gtmPrice,
            'ecommerce': null
        });
    });
}
	
function dataLayerSocialClickPush(label, context, action, isHref) {
    if (typeof action == 'undefined') {
        action = 'share'
    }		
	
    context = (typeof context == 'undefined' || (dataLayer[0].pageType == 'Advice' && isHref !== true)) ? ('https://'+location.hostname+location.pathname) : context;
    dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': 'Social',
        'eventAction': action,
        'eventLabel': label,
        'eventContext': context,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null,
    });
}

function gtmEventsSelectCity(city) {
    dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': 'Interactions',
        'eventAction': 'switch',
        'eventLabel': 'cityName',
        'eventContext': null,
        'eventContent': city,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null,
    });
}


function dataLayerSocialAllClickPush() {
    dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': 'Social',
        'eventAction': 'share',
        'eventLabel': 'Facebook | VKontakte | Odnoklassniki | Twitter | email',
        'eventContext': null,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null,
    });
}

function gtmEventsSubscribeAdd(){
    dataLayer.push({
        'event': 'LeroyMerlin', 
        'eventCategory': 'Interactions',
        'eventAction': 'click',
        'eventLabel': 'subscribe',
        'eventContext': null,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null,
    });
}

function dataLayerPrintClickPush() {
    dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': 'Interactions',
        'eventAction': 'print',
        'eventLabel': 'ProductPage',
        'eventContext': null,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null,
    });
}
function gtmEvent(override) {
    var options = {
        'event': 'LeroyMerlin',
        'eventCategory': 'Interactions',
        'eventAction': 'click',
        'eventLabel': null,
        'eventContext': null,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null
    };

    for (var attr in override) {
        if (override.hasOwnProperty(attr)) {
            options[attr] = override[attr];
        }
    }

    dataLayer.push(options);
}

function gtmEventsSimpleClick(label, context, category, action) {
    if (typeof context == 'undefined') {
        context = null;
    }

    if (typeof category == 'undefined') {
        category = 'Interactions';
    }

    if (typeof action == 'undefined') {
        action = 'click';
    }

     dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': category,
        'eventAction': action,
        'eventLabel': label,
        'eventContext': context,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventPortalName': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null,
    })
}

function gtmEventsStaticKitchenBannerClick(bannerId, bannerName, bannerPosition) {
    bannerId = (typeof bannerId == 'undefined') ? null : bannerId;
    bannerName = (typeof bannerName == 'undefined') ? null : bannerName;
    bannerPosition = (typeof bannerPosition == 'undefined') ? null : bannerPosition;

    dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': 'Interactions',
        'eventAction': 'click',
        'eventLabel': 'banner',
        'eventContext': null,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': {
            'promoClick': {
                'promotions': [{
                    'id': bannerId,
                    'name': bannerName,
                    'creative': 'статичный',
                    'position': bannerPosition
                }]
            }
        }
    });
}

function gtmEventsBannerClick(bannerId, bannerName, bannerPosition, bannerCreative) {
    bannerId = (typeof bannerId == 'undefined') ? null : bannerId;
    bannerName = (typeof bannerName == 'undefined') ? null : bannerName;
    bannerCreative = (typeof bannerCreative == 'undefined') ? null : bannerCreative;
    bannerPosition = (typeof bannerPosition == 'undefined') ? null : bannerPosition;

    dataLayer.push({
        'event': 'LeroyMerlin',
        'eventCategory': 'Interactions',
        'eventAction': 'click',
        'eventLabel': 'banner',
        'eventContext': null,
        'eventContent': null,
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': {
            'promoClick': {
                'promotions': [{
                    'id': bannerId,
                    'name': bannerName,
                    'creative': bannerCreative,
                    'position': bannerPosition
                }]
            }
        }
    });
}

function gtmEventsProductAjax(articul, position, quantity, eventLocation, eventCategory, eventAction, eventLabel, ecommerce_is_null) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: quantity == null ? 1 : quantity
        }
    }).done(function(resp) {
        eventLocation = (eventLocation) ? eventLocation : dataLayer[0].pageType;
        if(position == 0) {position = 1;}

        var obToLoad = {
            'event': 'LeroyMerlin',
            'eventCategory': eventCategory,
            'eventAction': eventAction,
            'eventLabel': eventLabel,
            'eventContext': null,
            'eventContent': null,
            'eventPosition': position,
            'eventLocation': eventLocation,
            'eventDivision': typeof resp.gtmDivision != 'undefined' ? resp.gtmDivision : "(not set)",
            'eventSubdivision': typeof resp.gtmSubdivision != 'undefined' ? resp.gtmSubdivision : "(not set)",
            'eventCategoryName': typeof resp.gtmCategoryName != 'undefined' ? resp.gtmCategoryName : "(not set)",
            'eventCategoryId': typeof resp.gtmCategoryId != 'undefined' ? resp.gtmCategoryId : "(not set)",
            'eventProductName': typeof resp.name != 'undefined' ? resp.name : "(not set)",
            'eventProductId': typeof resp.article != 'undefined' ? resp.article : "(not set)",
            'eventProductPrice': typeof resp.gtmPrice != 'undefined' ? resp.gtmPrice : "(not set)",
            'ecommerce': ecommerce_is_null ? null : {
                'add': {
                    'actionField': {
                        'list': eventLocation
                    },
                    'products': [{
                        'id': resp.article,
                        'name': resp.name,
                        'category': resp.gtmCategoryName,
                        'brand': resp.brand,
                        'position': position,
                        'variant': resp.gtmWeight,
                        'dimension65': resp.gtmDimension65,
                        'dimension77': data.gtmDimension77,
                        'dimension55': data.gtmDimension55,
                        'dimension61': data.gtmDimension61,
                        'dimension62': data.gtmDimension62,
                        'dimension63': data.gtmDimension63,
                        'dimension64': data.gtmDimension64,
                        'dimension9': data.gtmDimension9,
                        'price': resp.gtmPrice,
                        'metric1': resp.gtmPrice,
                        'cnt': quantity
                    }]
                }
            }
        }
        dataLayer.push(obToLoad);

    });
}

function gtmEventsProductAjaxClick(articul, position, quantity, eventLocation, eventCategory, eventAction, eventLabel, eventContent, ecommerceObj) {
    eventContent = (typeof eventContent == 'undefined') ? null : eventContent;
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: quantity == null ? 1 : quantity
        }
    }).done(function(data) {
        eventLocation = (eventLocation) ? eventLocation : dataLayer[0].pageType;
        var obToLoad = {
            'event': 'LeroyMerlin',
            'eventCategory': eventCategory,
            'eventAction': eventAction,
            'eventLabel': eventLabel,
            'eventContext': null,
            'eventContent': eventContent,
            'eventPosition': position,
            'eventLocation': eventLocation,
            'eventDivision': typeof data.gtmDivision != 'undefined' ? data.gtmDivision : "(not set)",
            'eventSubdivision': typeof data.gtmSubdivision != 'undefined' ? data.gtmSubdivision : "(not set)",
            'eventCategoryName': typeof data.gtmCategoryName != 'undefined' ? data.gtmCategoryName : "(not set)",
            'eventCategoryId': typeof data.gtmCategoryId != 'undefined' ? data.gtmCategoryId : "(not set)",
            'eventProductName': typeof data.name != 'undefined' ? data.name : "(not set)",
            'eventProductId': typeof data.article != 'undefined' ? data.article : "(not set)",
            'eventProductPrice': typeof data.gtmPrice != 'undefined' ? data.gtmPrice : "(not set)",
            'ecommerce': {}
        };
        if(typeof ecommerceObj == 'undefined'){
            obToLoad.ecommerce = {
                'click': {
                    'actionField': {
                        'list': eventLocation,
                        'action': 'click'
                    },
                    'products': [{
                        'id': data.article,
                        'name': data.name,
                        'category': data.gtmCategoryName,
                        'brand': data.brand,
                        'position': position,
                        'variant': data.gtmWeight,
                        'dimension65': data.gtmDimension65,
                        'dimension77': data.gtmDimension77,
                        'dimension55': data.gtmDimension55,
                        'dimension61': data.gtmDimension61,
                        'dimension62': data.gtmDimension62,
                        'dimension63': data.gtmDimension63,
                        'dimension64': data.gtmDimension64,
                        'dimension9': data.gtmDimension9,
                        'price': data.gtmPrice,
                        'metric1': data.gtmPrice,
                    }]
                }
            }  
            
            if(quantity != null) {
                obToLoad.ecommerce.click.products[0].cnt = quantity;
            }
        }
        else{
           obToLoad.ecommerce = {
                'detail': {
                    'actionField': {
                        'list': eventLocation,
                        'action': 'click'
                    },
                    'products': [{
                        'id': data.article,
                        'name': data.name,
                        'category': data.gtmCategoryName,
                        'brand': data.brand,
                        'position': position,
                        'variant': data.gtmWeight,
                        'dimension65': data.gtmDimension65,
                        'dimension77': data.gtmDimension77,
                        'dimension55': data.gtmDimension55,
                        'dimension61': data.gtmDimension61,
                        'dimension62': data.gtmDimension62,
                        'dimension63': data.gtmDimension63,
                        'dimension64': data.gtmDimension64,
                        'dimension9': data.gtmDimension9,
                        'price': data.gtmPrice,
                        'metric1': data.gtmPrice,
                    }]
                }
            } 

        }

        dataLayer.push(obToLoad);
    });
}

/**
 * Реализует GTM евенты для форм подписки
 * @param timingVar
 * @param timingValue int время в миллисекундах
 * @param timingLabel
 * @param eventContent string Название формы
 * @param eventContext string Названия поля
 * @param errorCode
 * @param eventAttemptCount int Количество попыток
 */
var gtmEventForms = function(timingVar, timingValue, timingLabel, eventContent, eventContext, errorCode, eventAttemptCount) {
    timingVar = timingVar !== undefined ? timingVar : null;
    timingValue = timingValue !== undefined ? timingValue : null;
    timingLabel = timingLabel !== undefined ? timingLabel : null;
    eventContent = eventContent !== undefined ? eventContent : null;
    eventContext = eventContext !== undefined ? eventContext : null;
    errorCode = errorCode !== undefined ? errorCode : null;
    eventAttemptCount = eventAttemptCount !== undefined ? eventAttemptCount : null;

    dataLayer.push({
        'event': 'LeroyMerlin_Forms',
        'timingCategory': 'Forms',
        'timingVar': timingVar,
        'timingValue': timingValue,
        'timingLabel': timingLabel,
        'eventContent': eventContent,
        'eventContext': eventContext,
        'errorCode': errorCode,
        'eventAttemptCount': eventAttemptCount
    });
};

function gtmBasketCallback(callback) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gtmBasket.php",
        method: "GET"
    }).done(function(products) {
        callback(products);
    });
}
/* Google Tag Management #17944 - end */

function yandexCounterAddProduct(articul, cnt) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: cnt
        }
    }).done(function(data) {
        window.dataLayer1=window.dataLayer1||[]; window.dataLayer1.push({
            "ecommerce": {
                "add": {
                    "products": [
                        {
                            "id": data.article,
                            "name": data.name,
                            "price": data.price,
                            "brand": data.brand,
                            "category": data.category,
                            "variant": data.color,
                            "quantity": cnt
                        }
                    ]
                }
            }
        });
    });
}

function yandexCounterRemoveProduct(articul, cnt) {
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: cnt
        }
    }).done(function(data) {
        window.dataLayer1=window.dataLayer1||[]; window.dataLayer1.push({
            "ecommerce": {
                "remove": {
                    "products": [
                        {
                            "id": data.article,
                            "name": data.name,
                            "price": data.price,
                            "brand": data.brand,
                            "category": data.category,
                            "variant": data.color,
                            "quantity": cnt
                        }
                    ]
                }
            }
        });
    });
}

$(document).delegate('#search-filters-section input', 'click', function(e) {
    document.location = $(e.target).val();
    e.preventDefault();
});

function sendShopList() {

    var email = $('#email-shop-list').val();
    var form = $('.send2email form');

    $.post('/bitrix/php_interface/ajax/sendShopList.php', form.serialize(), function(data) {

        var validator = form.validate();

        $('.cl-green.list-sent').hide();

        if (data == 'error') {
            validator.showErrors({
                'email': 'Неверный формат email'
            });
        }
        if (data == '1') {
            $('<p class="cl-green list-sent">Список покупок отправлен</p>').insertBefore(form);
            form.hide();

            setTimeout(function () {
                parent.jQuery.fancybox.close();
            }, 3000)
        }
    });

    return false;
}

// small shop list delete
$(document).delegate('#shop-list .cart-item__remove', 'click', function() {
    var art = $(this).data('art'),
        oldCnt = $(this).data('cnt');
        type = $(this).parents('#shop-list').data('type');

    var position = $(this).parents('.cart-item').index() + 1;
    $('body').addClass('no-active');

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
        art: art,
        cnt: 0
    }, function (data) {
        reloadSmallListUsingHtml(data);
        gtmEventsShopListMinus(art, oldCnt, position, type);
    });
    return false;
});


// small basket delete
$(document).delegate('#small-basket .cart-item__remove', 'click', function() {
    var art = $(this).data('art'),
        id = $(this).parents('.cart-item').data('basket-id'),
        type = $(this).parents('#small-basket').data('type'),
        position = $(this).parents('.cart-item').data('position'),
        cnt = $(this).siblings('.cart-item__total').find('.ui-spinner input[type=text]').val();

        position = (typeof position != 'undefined') ? position : 0;
        cnt = (typeof cnt != 'undefined') ? cnt : 1;

        $('body').addClass('no-active');

    $.post('/bitrix/php_interface/ajax/basket.php', {
        action: 'del',
        id: id,
        tmpl: 'redesign-mini',
        art: art
    }, function (data) {
        reloadSmallBasketUsingHtml(data);
        yandexCounterRemoveProduct(art, 1);
        gtmEventsRemoveProductMinus(art, cnt, position, type);
    });
    return false;
});

// pickup popup basket delete
$(document).delegate('#popup-pickup-shop .pickup-shop__item-remove', 'click', function() {
    var id = $(this).data('basket-id');
    var shop = $('#set_pickup_shop').val();
    // if (!shop) {
    //     return;
    // }

    $.post('/bitrix/php_interface/ajax/pickup_basket.php', {
        action: 'del',
        id: id,
        shop: shop
    }, function (data) {
        reloadPickupBasketUsingHtml(data);
        reloadPickupBasketPopupShopsQuantities();
    });
    return false;
});

// estore popup basket delete
$(document).delegate('#popup-e-shop .pickup-shop__item-remove', 'click', function() {
    var id = $(this).data('basket-id');

    $.post('/bitrix/php_interface/ajax/estore_basket.php', {
        action: 'del',
        id: id
    }, function (data) {
        reloadEstoreBasketUsingHtml(data);
    });
    return false;
});

function selectPickupShop(shopId) {
    shopId = parseInt(shopId);
    if (!shopId) {
        return;
    }

    $('#set_pickup_shop').val(shopId);
    reloadPickupBasket(shopId);

    var listItem = $('#popup-pickup-shop .js-pickup-shop[data-shop='+ shopId + ']');

    if (!listItem.hasClass('is-active')) {
        listItem.siblings('.js-pickup-shop').removeClass('is-active');
        listItem.addClass('is-active');

        $('#popup-pickup-shop .js-choose-shop').prop('disabled', false);
        $('#popup-pickup-shop .pickup-shop__right').removeClass('is-empty');
    }

    if (typeof pickupPoints !== 'undefined') {
        for (var i = 0; i < pickupPoints.length; i++) {
            pickupPoints[i].selected = pickupPoints[i].id == shopId;
            if (pickupPoints[i].id == shopId && typeof pickupMap !== 'undefined') {
                console.log([pickupPoints[i].lat, pickupPoints[i].lon]);
                pickupMap.setCenter([pickupPoints[i].lat, pickupPoints[i].lon], 14, {duration: 300});
            }
        }
    }
}

function reloadEstoreBasket() {
    $.get('/bitrix/php_interface/ajax/estore_basket.php', {}, function (data) {
        reloadEstoreBasketUsingHtml(data);
    });
}

function reloadPickupBasket(shop) {
    if (typeof shop === 'undefined') {
        shop = $('#set_pickup_shop').val();
    }
    //
    // if (!shop) {
    //     return;
    // }

    $.get('/bitrix/php_interface/ajax/pickup_basket.php', {
        shop: shop
    }, function (data) {
        reloadPickupBasketUsingHtml(data);
    });
    reloadPickupBasketPopupShopsQuantities();
}

/**
 * Заполнение "В выбранном магазине доступно 2 из 3 позиций вашей корзины. В заказ будут добалены доступные товары."
 * в попапке самовывоза в корзине.
 */
function reloadPickupBasketPopupShopsQuantities() {
    $.get('/bitrix/php_interface/ajax/pickup_shop_quantities_for_basket.php', function (data) {
        if (!data) return;

        $('.pickup-shop__shop.js-pickup-shop').each(function(index, shopEl) {
            var $shopEl = $(shopEl);
            var shopId = parseInt($shopEl.data('shop'));
            var container = $shopEl.find('.quantity-container');

            if (!shopId || !container) return;

            var message = '<div class="pickup-shop__shop-green quantity-container"><span class="icon icon-greensmile-sm"></span>Все товары в наличии</div>';
            if (data) {
                if (typeof data['count_by_shop'][shopId] == 'undefined') {
                    data['count_by_shop'][shopId] = 0;
                }
                if (data['count_by_shop'][shopId] < data['basket_count']) {
                    message = '<div class="pickup-shop__shop-attention">'
                        + '<span class="icon icon-attention"></span>'
                        + 'В выбранном магазине доступно '
                        + data['count_by_shop'][shopId]
                        + ' из ' + data['basket_count']
                        + ' позиций вашей корзины. В заказ будет добавлено только доступное количество товаров.'
                        + '</div>';
                }
            }

            container.html(message);
        });
    });
}

function updateMiniList(art, cnt)
{
    $(this).val(cnt);
}

$(document)
    .on('blur', '.catalog_shopping-list input.ui-spinner-input', function() {
        var art = $(this).parents('.catalog__item').data('art');
        var cnt = $(this).val();
        var position = $(this).parents('.catalog__item').index() + 1;
        var isLk = ($(this).parents('[data-lk=Y]').length > 0) ? 'Y' : 'N';

        if(cnt.length < 1) return false;

        $.post('/bitrix/php_interface/ajax/add2list.php', {
            tmpl: 'list_redesign_ajax',
            art: art,
            cnt: cnt,
            isLk:isLk
        }, function (data) {
            reloadShoppingListUsingHtml(data);
        });
    });
    //.on('blur', '#shop-list input.ui-spinner-input', function() {
    //    var art = $(this).parents('.cart-item').data('art');
    //    var cnt = $(this).val();
    //    var position = $(this).parents('.cart-item').index() + 1;
    //    if(cnt.length < 1) return false;
    //
    //    $.post('/bitrix/php_interface/ajax/add2list.php', {
    //        tmpl: 'redesign-mini',
    //        art: art,
    //        cnt: cnt
    //    }, function (data) {
    //        gtmEventsShopListMinus(art, cnt, position);
    //        reloadSmallListUsingHtml(data);
    //    });
    //});

// small shop list +-
$(document).on('spin change', '#shop-list .spinner_sm', function( event, ui ) {
        var art = $(this).parents('.cart-item').data('art'),
        cnt = ui.value,
        oldCnt = $(this).val();

        var position = $(this).parents('.cart-item').index() + 1;
        $('body').addClass('no-active');

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
        art: art,
        cnt: cnt
    }, function (data) {
        reloadSmallListUsingHtml(data);
        if (cnt > oldCnt) {
            gtmEventsShopListPlus(art, 1, position);
        } else {
            gtmEventsShopListMinus(art, 1, position);
        }
    });
});

$(document).on('mousedown mouseup', '#shop-list .spinner_sm', function() {
    $('body').addClass('no-active');
});


// удаление товара со страницы списка покупок
$(document).delegate('.catalog_shopping-list .btn_clean', 'click', function() {
    var row = $(this).parents('.catalog__item');
    var art = $(this).parent().data('art');
    var position = row.index() + 1;
    var cnt = row.find('.catalog__bt input[name=spinnerInput]').val();
    var isLk = ($(this).parents('[data-lk=Y]').length > 0) ? 'Y' : 'N';

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'list_redesign_ajax',
        art: art,
        cnt: 0,
        isLk:isLk
    }, function (data) {
        reloadSmallList();
        reloadShoppingListUsingHtml(data);
        gtmEventsShopListMinus(art, cnt, position);
    });
    return false;
});

// удаление всех товаров со страницы списка покупок
$(document).delegate('.shop_list .delete-all', 'click', function() {
    var isLk = ($(this).parents('[data-lk=Y]').length > 0) ? 'Y' : 'N';
    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'list_redesign_ajax',
        all: 1,
        isLk:isLk
    }, function (data) {
        reloadSmallList();
        reloadShoppingListUsingHtml(data);
    });
    return false;
});

// shop list +-
$(document).on('spin change', '.catalog_shopping-list .spinner', function( event, ui ) {
    var art = $(this).parents('.catalog__item_shopping-list').data('art'),
        cnt = parseInt(ui.value),
        oldCnt = parseInt($(this).val()),
        isLk = ($(this).parents('[data-lk=Y]').length > 0) ? 'Y' : 'N';

    var position = $(this).parents('.cart-item').index() + 1;
    
    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'list_redesign_ajax',
        art: art,
        cnt: cnt,
        isLk:isLk
    }, function (data) {
        reloadSmallList();
        reloadShoppingListUsingHtml(data);
        if (cnt > oldCnt) {
            gtmEventsShopListPlus(art, 1, position);
        } else {
            gtmEventsShopListMinus(art, 1, position);
        }
    });
});

// small basket list +-
$(document).on('blur', '#small-basket input.ui-spinner-input', function(event, ui) {
    var cnt = $(this).val(),
        art = $(this).parents('.cart-item').data('art'),
        id = $(this).parents('.cart-item').data('basket-id');

    $.post('/bitrix/php_interface/ajax/basket.php', {
        tmpl: 'redesign-mini',
        action: 'upd',
        art: art,
        id: id,
        cnt: cnt
    }, function (data) {
        reloadSmallBasketUsingHtml(data);
    });
});

// small basket list +-
$('#small-basket').on('spin change', '.spinner_sm', function( event, ui ) {
    var cnt = ui.value,
        art = $(this).parents('.cart-item').data('art'),
        id = $(this).parents('.cart-item').data('basket-id'),
        oldCnt = $(this).val();

    var position = $(this).parents('.cart-item').index() + 1;

    $('body').addClass('no-active');

    $.post('/bitrix/php_interface/ajax/basket.php', {
        tmpl: 'redesign-mini',
        action: 'upd',
        art: art,
        id: id,
        cnt: cnt
    }, function (data) {
        reloadSmallBasketUsingHtml(data);

        if (cnt > oldCnt) {
            yandexCounterAddProduct(art, 1);
            gtmEventsAddProductPlus(art, 1, position);
        } else {
            yandexCounterRemoveProduct(art, 1);
            gtmEventsRemoveProductMinus(art, 1, position);
        }
    });
});

$('#small-basket').on('mouseup mousedown', '.spinner_sm', function( event, ui ) {
    $('body').addClass('no-active');
});

function reloadSmallListUsingHtml(html)
{
    $("#shop-list").html(html);
    if (!$('#shop-list_not_empty').length) {
        $('#shop-list').attr('class','cart-quick is-empty');
        $('body').removeClass('no-active');
    }
    else
        $('#shop-list').attr('class','cart-quick');

    Spinner();
    customizeScrollbar();
    tooltip();
}

function reloadSmallBasketUsingHtml(html)
{
    $("#small-basket").html(html);
    if (!$('#basket_not_empty').length) {
        $('#small-basket').attr('class','cart-quick is-empty');
        $('body').removeClass('no-active');
    }
    else
        $('#small-basket').attr('class','cart-quick');

    Spinner();
    customizeScrollbar();
    tooltip();
}

function reloadPickupBasketUsingHtml(html)
{
    $("#pickup_popup_basket").html(html);
}

function reloadEstoreBasketUsingHtml(html)
{
    $("#estore_popup_basket").html(html);
}

function reloadShoppingListUsingHtml(html)
{
    $(".container.shop_list #shop-list-block").replaceWith(html);

    Spinner();
    customizeScrollbar();
    tooltip();
}

function changeDoorsetFastView(art) {
    if (!art) return;

    $.get(
        "/catalogue/fast-view.php",
        { art: art },
        function(data){
            $("#popup-fast-view").html(data);

            carouselDestroy($('.fast-view .product-gallery'));
            productCarouselInit();

            // Init 3d просмотра
            roundView.init($('.fast-view .threesixty'));

            Spinner();
            customizeScrollbar();
            avalibleToggle();

            $('.fast-view input[data-custom="check"]').customCheck();
        },
        'html'
    );
}

function add2listProductsSetInput(event, art, qty, selectedItems) {
    var el = $(event.target),
        fastView = el.parents('.fast-view').length,
        parentClass = fastView ? '.fast-view ' : '';

    var quantity =
        typeof qty == 'undefined'
        ? $(parentClass + 'input.product_qty-' + art).val()
        : qty;

    if (!quantity) {
        return false;
    }

    if (typeof selectedItems == 'undefined') {
        selectedItems = false;
    }

    var arArt = {};

    if (selectedItems) {
        for (var i in selectedItems) {
            if (selectedItems.hasOwnProperty(i)) {
                arArt[i] = selectedItems[i] * quantity;
            }
        }
    } else {
        arArt[art] = quantity;

        if ($(parentClass + '.products-set').length > 0) {
            $(parentClass + '.products-set .custom-check_type_checkbox input').each(function(i, elem) {
                // если товар находится в быстром просмотре, а берем комплект в карточке, товар не учитываем
                var isInFastView = $(elem).parents('.fast-view').length;
                if ($(elem).attr('data-art') > 0 && $(elem).attr('data-amount') > 0 && (fastView || !isInFastView)) {
                    arArt[parseInt($(elem).attr('data-art'))] = parseInt($(elem).attr('data-amount')) * quantity;
                }
            });
        }
    }

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
        'arArt': arArt,
    }, function (data) {
        reloadSmallListUsingHtml(data);
        el.html('Добавлено');
    });

    return false;
}

function add2listInput(event, art, qty, position) {
    var el = $(event.target);
    var quantity =
        typeof qty == 'undefined'
            ? $('input.product_qty-' + art).val()
            : qty;

    if (!quantity) {
        return false;
    }

    position = (typeof position != 'undefined') ? position : parseInt(el.parents('.catalog__item').index()) + 1;

    $("li[data-art='" + art + "'] .btn__text").text("Добавлено");

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
        art: art,
        cnt: quantity
    }, function (data) {
        reloadSmallListUsingHtml(data);
        gtmEventsShopListPlus(art, quantity, position);
        el.html('Добавлено');
    });
}

function add2listInputSH(event, art, qty) {
    var el = $(event.target);
    var quantity =
        typeof qty == 'undefined'
            ? $('input.product_qty-' + art).val()
            : qty;

    if (!quantity) {
        return false;
    }

    var position = parseInt(el.parents('.catalog__item').index()) + 1;

    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
        art: art,
        cnt: quantity
    }, function (data) {
        reloadSmallListUsingHtml(data);
        gtmEventsShopListPlusSH(art, quantity);
        el.html('Добавлено');
    });
}

function add2basketProductsSetInput(event, art, qty, selectedItems) {
    var el = $(event.target),
        fastView = el.parents('.fast-view').length,
        parentClass = fastView ? '.fast-view ' : '';

    var quantity =
        typeof qty == 'undefined'
        ? $(parentClass + 'input.product_qty-' + art).val()
        : qty;

    if (!quantity) {
        return false;
    }

    if (typeof selectedItems == 'undefined') {
        selectedItems = false;
    }

    var arArt = {};

    if (selectedItems) {
        for (var i in selectedItems) {
            if (selectedItems.hasOwnProperty(i)) {
                arArt[i] = selectedItems[i] * quantity;
            }
        }
    } else {
        arArt[art] = quantity;

        if ($(parentClass + '.products_set_in_estore').length > 0) {
            $(parentClass + '.products_set_in_estore').each(function(i, elem) {
                // если товар находится в быстром просмотре, а берем комплект в карточке, товар не учитываем
                var isInFastView = $(elem).parents('.fast-view').length;
                if ($(elem).attr('data-art') > 0 && $(elem).attr('data-amount') > 0 && (fastView || !isInFastView)) {
                    var curArt = parseInt($(elem).attr('data-art')),
                        curAmount = parseInt($(elem).attr('data-amount')) * quantity;
                    arArt[curArt] = curAmount;
                }
            });
        }
    }

    $.post("/bitrix/php_interface/ajax/basket.php", {
        'arArt': arArt,
        tmpl: 'redesign-mini',
        action: 'addArr'
    }, function(data) {
        reloadSmallBasketUsingHtml(data);
        el.html('Добавлено');
        if ($('li.catalog__item[data-art="'+art+'"]').length) {
            $('li.catalog__item[data-art="'+art+'"] button.btn_red').html('Добавлено');
        } else if ($(parentClass + '.product__buy').length && $(parentClass + '.product__col input[data-art="'+art+'"]').length) {
            $(parentClass + '.product__buy button.btn_red').html('Добавлено');
        }
        setTimeout(function () {
            popups.close('#products-set-popup');
        }, 3000);
    });

    return false;
}

function add2basketInput(event, art, qty, needToReloadBasket, eventLocation) {
    var el = $(event.target);
    var quantity =
        typeof qty == 'undefined'
        ? $('input.product_qty-' + art).val()
        : qty;

    if (!quantity) {
        return false;
    }

    var position = parseInt(el.parents('.catalog__item').index()) + 1;
	if (el.parents('.product').length > 0 && el.parents('.product').data("position") > 0) {
		position = el.parents('.product').data("position");
	}
	
    $.post("/bitrix/php_interface/ajax/basket.php", {
        art: art,
        action: 'add',
        tmpl: 'redesign-mini',
        cnt: quantity
    }, function(data) {
        reloadSmallBasketUsingHtml(data);
        el.html('Добавлено');
        gtmEventsAddProductPlus(art, quantity, position, eventLocation);
        if (needToReloadBasket) {
            reloadBasket();
        }

        /*Проверяем слдует ли открывать попап корзины*/
        if($('#lacking-popup').length <= 0){
            if($(el).parents("[data-nopopup=Y]").length <= 0){
                popupAjaxBasket(art);
            }
            if($(el).parents("[data-basket-popup=Y]").length > 0){
                updateCurrentPopupBasket(art);
            }
        }
    });

    return false;
}

function add2basketArray(arts) {
    var el = $(this);
    var arArt = {};

    arts.forEach(function (art) {
        arArt[art] = 1;
    });

    $.post("/bitrix/php_interface/ajax/basket.php", {
        'arArt': arArt,
        tmpl: 'redesign-mini',
        action: 'addArr'
    }, function(data) {
        reloadSmallBasketUsingHtml(data);
        el.html('Добавлено');
    });

    return false
}

function addAllToBasket(event) {
    var el = $(event.target);
    if (! $.isEmptyObject(arAddToBasket)) {

        $.post('/bitrix/php_interface/ajax/basket.php', {
            tmpl: 'redesign-mini',
            action: 'addArr',
            arArt: JSON.stringify(arAddToBasket)
        }, function(data) {
            reloadSmallBasketUsingHtml(data);
            el.html('Добавлено');
        });
    }
    return false;
}

function reloadBasket() {
        $.post('/bitrix/php_interface/ajax/basket.php', {
            action: 'reload',
            tmpl: 'redesign'
        }, function (data) {
            if($('#big_basket').length > 0) {
                var $old_top = $(window).scrollTop();//Запоминаем старое положение на странице
                $('#big_basket').html(data);
                $(window).scrollTop($old_top);//Прыгаем к нему (незаметно для юзера)
                if($('.cart-item').length > 0) {
                    $('html, body').animate({scrollTop: $('.cart-item').eq(-1).offset().top - 85}, 1000);//Плавно скроллим к последнему добавленному элементу
                }
            }
            Spinner();
            customizeScrollbar();
            tooltip();
        });
}

function add2basketArray2(arts) {
    var arArt = {};

    arts.forEach(function (art) {
        arArt[art] = 1;
    });

    $.post("/bitrix/php_interface/ajax/basket.php", {
        'arArt': arArt,
        tmpl: 'redesign-mini',
        action: 'addArr'
    }, function(data) {
        reloadSmallBasketUsingHtml(data);
        reloadBasket();
    });

    return false
}

function initScroll() {
    $('#nav .offers').addClass('scrollbar-dynamic').scrollbar();
    $('#nav .skubox').hide();
}

function reloadSmallBasket() {
    $.post('/bitrix/php_interface/ajax/basket.php', {
        action: 'reload',
        tmpl: 'redesign-mini',
    }, function (data) {
        reloadSmallBasketUsingHtml(data);
    });
}

function reloadSmallList() {
    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
    }, function (data) {
        reloadSmallListUsingHtml(data);
    });
}

function updateCurrentPopupBasket(art, position){
    $.post('/bitrix/php_interface/ajax/upd_current_popup_basket.php', {
        action: 'reload',
        art: art,
        position:position,
    }, function (data) {
        $('#item-cart-added').html(data);
    }, 'html');
}

function reloadPopupBasket(bsk_id, position) {
    $.post('/bitrix/php_interface/ajax/popup_basket.php', {
        action: 'reload',
        bsk_id: bsk_id,
        position:position,
    }, function (data) {
        updatePopupBasket(data)
    }, 'json');
}

function updatePopupBasket(data){
    if(typeof data.CUR_BASKET != 'object') return;
    var sum = number_format(data.CUR_BASKET.AllSum, 2, ',', ' ', true);
    $("#item-cart-added #cart-item__sum-price").html(sum);
    $("#item-cart-added #sum-bsk").html(number_format(data.allSumBsk, 2, ',', ' ', false));
    $("#item-cart-added #cnt-bsk").html(data.prodAllCnt);
}

function reloadSmallList() {
    $.post('/bitrix/php_interface/ajax/add2list.php', {
        tmpl: 'redesign-mini',
    }, function (data) {
        reloadSmallListUsingHtml(data);
    });
}

$(document)
    .on('click', '#item-cart-added .btn_popup_bsk', function(){
        var input = $(this).closest('#item-cart-added').find('.ui-spinner-input');
        ObjPopUpBask.art = input.data('art');
        ObjPopUpBask.cnt = input.val();
        ObjPopUpBask.id  = input.data('basket-id');
        ObjPopUpBask.url = $(this).data('url');

        $.fancybox.close();

    }).on('blur', '#big_basket input.ui-spinner-input, #item-cart-added input.ui-spinner-input', function() {
        var art = $(this).data('art');
        var cnt = $(this).val();
        var id  = $(this).data('basket-id');
        var boolPopup = $(this).data('input-popup');
        var oldVal = $(this).attr('aria-valuenow');  
        var position = $(this).data('position');
        position = (typeof position != 'undefined') ? position : 1;
        if(boolPopup == 'Y' && (cnt <= 1)) {
            cnt = 1;
            $(this).val(cnt);
        };

        var params = {
            action: 'upd',
            tmpl: 'redesign',
            art: art,
            id: id,
            cnt: cnt
        };

        // пока наверное не нужно.
        // if ($("#deliveryPickupSwitch:checked").length) {
        //     params.ajax_pickup_shop_id = $("#deliveryPickupSwitch").data('shopId');
        // }

        $.post('/bitrix/php_interface/ajax/basket.php', params, function (data) {
            $('#big_basket').html(data);
            Spinner();
            customizeScrollbar();
            tooltip();
            reloadSmallBasket();


            if(boolPopup == 'Y'){
                reloadPopupBasket(id);
               cnt = parseInt(cnt);
               oldVal = parseInt(oldVal);
                if(cnt > oldVal){
                    yandexCounterAddProduct(art, cnt);
                    gtmEventsAddProductPlus(art, (cnt-oldVal), position, 'AddToCartPopup');
                } else{
                    if(cnt < oldVal) {
                        yandexCounterRemoveProduct(art, cnt);
                        gtmEventsRemoveProductMinus(art, (oldVal-cnt), position, 'AddToCartPopup');
                    } 
                } 
            }

        });
    })
    .on('click', '#big_basket .ui-spinner-up, #big_basket .ui-spinner-down, #item-cart-added .ui-spinner-up, #item-cart-added .ui-spinner-down', function() {
        var input = $(this).parent().find('.ui-spinner-input');
        var art = input.data('art');
        var cnt = input.val();
        var id  = input.data('basket-id');
        if($(this).parents('#big_basket .cart-item').length > 0){
            var position = $(this).parents('#big_basket .cart-item').index() + 1;
        }
        else{
            var position = input.data('position');
            position = (typeof position != 'undefined') ? position : 1;
        }
        var boolPopup = $(input).data('input-popup');


        $.post('/bitrix/php_interface/ajax/basket.php', {
            action: 'upd',
            tmpl: 'redesign',
            art: art,
            id: id,
            cnt: cnt
        }, function (data) {
            $('#big_basket').html(data);
            Spinner();
            customizeScrollbar();
            tooltip();
            reloadSmallBasket();
            if(boolPopup == 'Y'){
                reloadPopupBasket(id);
            }
        });

        if($(this).hasClass('ui-spinner-up')){
            yandexCounterAddProduct(art, 1);
            if(boolPopup == 'Y'){
                gtmEventsAddProductPlus(art, 1, position, 'AddToCartPopup');
            }else{
                gtmEventsAddProductPlus(art, 1, position, 'AddToCartPopup');
            }

        } else {
            yandexCounterRemoveProduct(art, 1);
            if(boolPopup == 'Y'){
                gtmEventsRemoveProductMinus(art, 1, 0, 'AddToCartPopup');
            }else{
                gtmEventsRemoveProductMinus(art, 1, 0, 'AddToCartPopup');
            }
        }
    })
    .on('click', '#big_basket .cart-item__remove', function(){
        var art = $(this).data('art'),
            id  = $(this).data('basket-id'),
            cnt  = $(this).data('cnt');

        var position = $(this).parents('#big_basket .cart-item').index() + 1;

        $.post('/bitrix/php_interface/ajax/basket.php', {
            action: 'del',
            tmpl: 'redesign',
            id: id,
            art: art
        }, function (data) {
            $('#big_basket').html(data);
            Spinner();
            customizeScrollbar();
            tooltip();
            reloadSmallBasket();
        });

        yandexCounterRemoveProduct(art, cnt);
        gtmEventsRemoveProductMinus(art, cnt, position);
    })
    .on('click', '#big_basket .move2list', function(){
        var el = $(this);
        var art = el.data('art');
        var id  = el.data('basket-id');
        var cnt = el.data('cnt');

        $.post('/bitrix/php_interface/ajax/add2list.php', {
            tmpl: 'redesign-mini',
            art: art,
            cnt: cnt
        }, function (data) {
            reloadSmallListUsingHtml(data);
            el.find('.btn__text').html('Добавлено');
        });

        // больше не удаляем товар из корзины
        // $.post('/bitrix/php_interface/ajax/basket.php', {
        //     action: 'del',
        //     tmpl: 'redesign',
        //     id: id,
        //     art: art
        // }, function (data) {
        //     $('#big_basket').html(data);
        //     Spinner();
        //     customizeScrollbar();
        //     tooltip();
        //     reloadSmallBasket();
        // });
    })
    .on('click', '#big_basket .clear_cart', function() {
        $.post('/bitrix/php_interface/ajax/basket.php', {
            tmpl: 'redesign',
            action: 'delAll'
        }, function (data) {
            $('#big_basket').html(data);
            Spinner();
            customizeScrollbar();
            tooltip();
            reloadSmallBasket();
        });
    });

$('form#login-form').submit(function () {
    var path = '/bitrix/php_interface/ajax/check-auth.php';
    var form = $(this);
    var formData = form.serialize();
    var button = form.find('button');
    button.attr("disabled", true);

    var success = function (response) {
        if (response.script) {
            eval(response.script);
        }



        if (response.message == 'Y') {
      /*      var backUrl = encodeURI($('#auth-back-url').val());
            window.location.href = backUrl ? backUrl : window.location.href;
        }
        else if(response.message == 'LK'){*/

         if (String(location.href).indexOf('community-login')>0)
               location.href = window.communityServer;
           else
               location.href = '/lk/';
        }
        else {
            $('#auth-error').html(response.message).show();
            $('#auth-error-showblock').show();
            $("input[type='password']").val('');

        }
        button.removeAttr("disabled");
    };

    $.post(path, formData, success, 'json');

    return false;
});

$('form#forgot-password-form').submit(function () {
	event.preventDefault(); // krasnov@media5.com 06/09/2016

    var path = '/bitrix/php_interface/ajax/forgot.php';
    var form = $(this);
    var formData = form.serialize();
    var button = form.find('button');
    button.attr("disabled", true);

    var success = function (response) {
        if (response.script) {
            eval(response.script);
        }

		if (response.message !== 'ok') {
            $('#forgot-password-error').html(response.message.replace(/\0/g, '0').replace(/\\(.)/g, "$1")).show();
        } else {
        	$('form#forgot-password-form').hide();
			$('#forgot-password-success').show();
        }

        button.removeAttr("disabled");
    };

    $.post(path, formData, success, 'json');

    return false;
});

$('form#change-password-form').submit(function (event) {
	event.preventDefault(); // krasnov@media5.com 06/09/2016

    var path = '/bitrix/php_interface/ajax/change-password.php';
    var form = $(this);

    // {{ krasnov@media5.com 06/09/2016
    // var formData = form.serialize();
    var password = form.find('#change-password-input').val();
    var confirmPassword = form.find('#change-password-input-confirm').val();
    if(password  == '') {
        return false;
    }
    if(password != confirmPassword) {
        $('#change-password-error').html("Введенные пароли не совпадают!").show();
        button.removeAttr("disabled");
        return false;
    }

    var token = form.find('#siriusToken').val();

    var n = form.find('#siriusPublicKeyN').val();
    var e = form.find('#siriusPublicKeyE').val();
    var rsa = new RSAKey();
    rsa.setPublic(n, e); //modulus, public exponent as hex strings
    var passwordEncrypted = rsa.encrypt(password);

    var activation = form.find('#activationMode').val();

    var formData = {"token": token, "passwordEncrypted": passwordEncrypted, "activation": activation};
    // krasnov@media5.com 06/09/2016 }}

    var button = form.find('button');
    button.attr("disabled", true);

    var success = function (response) {
        if (response.script) {
            eval(response.script);
        }
        if (response.message !== 'Y') {
            $('#change-password-error').html(response.message.replace(/\0/g, '0').replace(/\\(.)/g, "$1")).show();
        } else {
            $('#change-password-form').hide();
            $('#change-password-success').show();
        }

        button.removeAttr("disabled");
    };

    $.post(path, formData, success, 'json');

    return false;
});

$(".info-panel_pickup .info-panel__close").click(function(){
    var regionId = $('meta[name="region"]').attr('content');

    $.cookie('_info_panel_text_' + regionId, 'close', { path: '/', domain: window.lmSettings.cookieDomain });
});

/**lk **/

$('.b-return-table__headNumber').click(function() {
    $(this).parent().parent().parent().toggleClass("active");
});

$('ul.tabs__caption').on('click', 'li:not(.active)', function() {
    $(this)
        .addClass('active').siblings().removeClass('active')
        .closest('div.tabs').find('div.tabs__content').removeClass('active').eq($(this).index()).addClass('active');
});

$('#search_value').on('keyup',function () {
    $.cookie('_search_cookie', $('#search_value').val(), { path: '/', domain: window.lmSettings.cookieDomain });
});


if ($('.costs-filter').length > 0) {
    $('.costs-from').datepicker({
        dateFormat: "dd.mm.yy",
        beforeShow: function(input, inst) {
            var picker = $('#ui-datepicker-div');
            $(picker).addClass('skin_001');
            $(picker).css('z-index', '50');
        },
        onSelect: function(txt, el){
            $(this).trigger('blur');
        },
        onClose: function( selectedDate ) {
            $('.costs-to').datepicker("option", "minDate", selectedDate);
        }
    });
    $('.costs-to').datepicker({
        dateFormat: "dd.mm.yy",
        beforeShow: function(input, inst) {
            var picker = $('#ui-datepicker-div');
            $(picker).addClass('skin_001');
            $(picker).css('z-index', '50');
        },
        onSelect: function(txt, el){
            $(this).trigger('blur');
        },
        onClose: function( selectedDate ) {
            $('.costs-from').datepicker("option", "maxDate", selectedDate);
        }
    });
}

/** end lk **/

$("#send-product-to-email-form").on("submit", function(event) {
    event.preventDefault();

    var form = $( this ),
        url = form.attr( 'action' );

    var emailInput = form.find('input[name=email]');

    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(),
        success: function( data ) {
            var validator = form.validate();

            $('.cl-green.product-sent').hide();

            if (data == 'error') {
                validator.showErrors({
                    'email': 'Неверный формат email'
                });
            }
            if (data == '1') {
                $('<p class="cl-green product-sent">Отправлено.</p>').insertBefore(form);
                form.hide();

                setTimeout(function () {
                    parent.jQuery.fancybox.close();
                }, 3000);
            }
        }
    });
});

function number_format(number, decimals, dec_point, thousands_sep, tag_i) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };

  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  /*  if(tag_i == true){
        s[1] = "<i>"+s[1]+"</i>";
    }*/
  return s.join(dec);
}

function popupAjaxBasket(art, position){
    var url = '/inc/lm2016/popup-basket.php?art='+art
    url = (typeof position == 'undefined') ? url : url+'&position='+position;
    $.fancybox.open({type: 'ajax', href: url, 'width':'960', fitToView	: false,
        autoSize	: true,
        closeClick	: false,
        openEffect	: 'none',
        closeEffect	: 'none',
        padding: 0,
        helpers : {
          overlay : {
            locked : true
          }
        },
        iframe : {
          scrolling : 'no',
          preload   : true
        },
        beforeClose: function () {
            var input = $('#item-cart-added .ui-spinner-input');
            ObjPopUpBask.art = input.data('art');
            ObjPopUpBask.cnt = input.val();
            ObjPopUpBask.id  = input.data('basket-id');
        },
        afterClose: function(){
            $.post('/bitrix/php_interface/ajax/basket.php', {
                action: 'upd',
                tmpl: 'redesign-mini',
                art: ObjPopUpBask.art,
                id: ObjPopUpBask.id,
                cnt: ObjPopUpBask.cnt,
            }, function (data) {
                reloadSmallBasketUsingHtml(data);
                if($('#lacking-popup').length <= 0){
                    if(ObjPopUpBask.url.length > 0)
                        document.location.href = ObjPopUpBask.url;
                }
            });
        }
    });
}

function gtmGoToProduct(articul){
    $.ajax({
        url: "/bitrix/php_interface/ajax/gaProduct.php",
        method: "POST",
        data: {
            articul: articul,
            cnt: 1
        }
    }).done(function(data) { 
    var obToLoad = {
            'event': 'LeroyMerlin', 
            'eventCategory': 'Interactions',
            'eventAction': 'open',
            'eventLabel': 'productPage',
            'eventContext': null,
            'eventContent': null,
            'eventPosition': 1,
            'eventLocation': AddToCartPopup,
            'eventDivision': data.gtmDivision,
            'eventSubdivision': data.gtmSubdivision,
            'eventCategoryName': data.gtmCategoryName,
            'eventCategoryId': data.gtmCategoryId,
            'eventProductName': data.name,
            'eventProductId': data.article,
            'eventProductPrice': data.gtmPrice,
            'ecommerce': {
                'add': {
                    'actionField': {
                        'list': AddToCartPopup,
                    },
                    'products': [{
                        'id': data.article,
                        'name': data.name,
                        'category': data.gtmCategoryName,
                        'brand': data.brand,
                        'position': 1,
                        'variant': data.gtmWeight,
                        'dimension65': data.gtmDimension65,
                        'dimension77': data.gtmDimension77,
                        'dimension55': data.gtmDimension55,
                        'dimension61': data.gtmDimension61,
                        'dimension62': data.gtmDimension62,
                        'dimension63': data.gtmDimension63,
                        'dimension64': data.gtmDimension64,
                        'dimension9': data.gtmDimension9,
                        'price': data.gtmPrice,
                        'metric1': data.gtmPrice,
                    }],
                }
            }
        }
        
        dataLayer.push(obToLoad);
    });
}

$(document).delegate(".advices-sorting__check a", 'click',  function(){
    dataLayer.push({
        'event': 'LeroyMerlin', 
        'eventCategory': 'Interactions',
        'eventAction': 'add',
        'eventLabel': 'filter',
        'eventContext': 'по формату',
        'eventContent': 'Все форматы',
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null
    });
});
$(document).delegate(".advices-sorting__check input[type=checkbox]", 'click',  function(){
    var eventAction = ($(this).prop('checked') == true) ? 'add' : 'remove';
    var eventContent = $(this).next().text();
    dataLayer.push({
        'event': 'LeroyMerlin', 
        'eventCategory': 'Interactions',
        'eventAction': eventAction,
        'eventLabel': 'filter',
        'eventContext': 'по формату',
        'eventContent': eventContent,
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null
    });
    
});
$(document).delegate(".advices-sorting__order select", 'change',  function(){
    dataLayer.push({
        'event': 'LeroyMerlin', 
        'eventCategory': 'Interactions',
        'eventAction': 'choose',
        'eventLabel': 'sort',
        'eventContext': $(this).val(),
        'eventContent': $(this).children('option:selected').text(),
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null
    });
});
$(document).delegate(".gtm-category li a", 'click',  function(){
    var eventContent = $(this).find('span[data-filter-type="category"]').text();
    eventContent = (eventContent.length > 0) ? eventContent : 'Все типы';
    dataLayer.push({
        'event': 'LeroyMerlin', 
        'eventCategory': 'Interactions',
        'eventAction': 'add',
        'eventLabel': 'filter',
        'eventContext': 'По типу',
        'eventContent': eventContent,
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null
    });
});

$(document).delegate(".gtm-section li a", 'click',  function(){
    var eventContent = $(this).find('span[data-filter-type="section"]').text();
    eventContent = (eventContent.length > 0) ? eventContent : 'Все отделы';
    dataLayer.push({
        'event': 'LeroyMerlin', 
        'eventCategory': 'Interactions',
        'eventAction': 'add',
        'eventLabel': 'filter',
        'eventContext': 'По отделам',
        'eventContent': eventContent,
        'eventPosition': null,
        'eventLocation': null,
        'eventDivision': null,
        'eventSubdivision': null,
        'eventCategoryName': null,
        'eventCategoryId': null,
        'eventProductName': null,
        'eventProductId': null,
        'eventProductPrice': null,
        'ecommerce': null
    });
});
