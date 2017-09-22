if (typeof angular != 'undefined') {
    angular.module('leroymerlin', [])
        .controller('CatalogMenuCtrl',  ['$scope', '$http', function($scope, $http) {

            // data
            $scope.dropdownFlag = false;
            $scope.sections = {
                lvl1: [],
                lvl2: {},
                lvl3: {}
            };
            $scope.selectedLvl1 = null;
            $scope.selectedLvl2 = null;
            $scope.selectedLvl3 = null;

            // ready
            $http.get('/bitrix/php_interface/ajax/catalog_menu.php')
                .then(function(response) {
                    if (response.data) {
                        $scope.sections = response.data;
                    }
                });

            //computed
            $scope.lvl2sections = function() {
                if (!$scope.selectedLvl1) {
                    return [];
                }

                return $scope.sections.lvl2[$scope.selectedLvl1];
            };

            $scope.lvl3sections = function() {
                if (!$scope.selectedLvl2) {
                    return [];
                }

                return $scope.sections.lvl3[$scope.selectedLvl2];
            };

            $scope.isSectionSelected = function(section, level) {
                if (!section.ID) {
                    return false;
                }

                if (level == 1) {
                    return $scope.selectedLvl1 && ($scope.selectedLvl1 == section.ID);
                }

                if (level == 2) {
                    return $scope.selectedLvl2 && ($scope.selectedLvl2 == section.ID);
                }

                return $scope.selectedLvl3 && ($scope.selectedLvl3 == section.ID);
            };

            $scope.selectedLvl1Data = function () {
                if (!$scope.selectedLvl1) {
                    return null;
                }

                var lvl1 = $scope.sections['lvl1'].filter(function (sec) {
                    return sec.ID == $scope.selectedLvl1;
                });

                if (!lvl1.length) {
                    return null;
                }

                return lvl1[0];
            };

            $scope.selectedLvl2Data = function() {
                if (!$scope.selectedLvl1 || !$scope.selectedLvl2) {
                    return null;
                }

                var lvl2 =  $scope.lvl2sections().filter(function(sec) {
                    return sec.ID == $scope.selectedLvl2;
                });

                if (!lvl2.length) {
                    return null;
                }

                return lvl2[0];
            };

            $scope.showDropdown = function() {
                if ($('.catalog-menu').hasClass('is-hover')) {
                    if (!$('body').hasClass('no-active')) {
                        $('body').addClass('no-active');
                        $('.search-main input').trigger('blur');
                    }
                } else {
                    if ($('body').hasClass('no-active')) {
                        $('body').removeClass('no-active');
                    }
                }

                return $scope.dropdownFlag;
            }

            //methods
            $scope.selectSection = function(section, level) {
                if (level < 3) {
                    catalogMenuHeight(level + 1);
                }

                if (level == 1) {
                    $scope.selectedLvl1 = section.ID;
                    $scope.selectedLvl2 = null;
                    $scope.selectedLvl3 = null;
                } else if (level == 2) {
                    $scope.selectedLvl2 = section.ID;
                    $scope.selectedLvl3 = null;
                } else {
                    $scope.selectedLvl3 = section.ID;
                }
            };

            $scope.unselectLvl3 = function() {
                $scope.selectedLvl3 = null
            };
            $scope.unselectLvl2 = function() {
                $scope.selectedLvl2 = null
            };

            $scope.unselectSections = function() {
                $scope.selectedLvl1 = null;
                $scope.selectedLvl2 = null;
                $scope.selectedLvl2 = null;
            }
        }])
        .controller('FavShop',  ['$scope', '$http', function($scope, $http) {
            var URL = '/bitrix/php_interface/ajax/shop_data.php';
            $scope.fav_shop = {};
            $scope.shops = {};

            $http.get(URL)
                .then(function(response) {
                    if (response.data) {
                        $scope.fav_shop = response.data.FAV_SHOP;
                        $scope.shops = response.data.SHOPS;
                    }
                });

            $scope.setFav = function(shop){
                $scope.fav_shop = shop;
                $('#fav-shop button').text($scope.fav_shop.PROPERTY_NAME_VALUE)
                $.cookie('_FAV_SHOP', shop.XML_ID, { expires: 7, path: '/', domain: window.lmSettings.cookieDomain });
                $('.fancybox-close').trigger('click');
                location.reload();
            }
        }])
        .controller('ProductsAdvicesCtrl', ['$scope', '$http', '$sce', '$timeout', '$rootScope', '$window', function($scope, $http, $sce, $timeout, $rootScope, $window){

            $scope.productsList = extendAndReformat(_.toArray(adviceProducts)); // initial products;

            $scope.basket = basket;
            $scope.shopList = shopList;
            $scope.plitkaSections = plitkaSections;

            /* Prebuild with initial products from php template var */
            function extendAndReformat(p){
                var _products = [];
                var _po = {};

                [].forEach.call(p, function(el, i){
                    /* Get only those who has "EXT" property */

                    if(el.EXT){

                        // To numeric if string contain only nums
                        _.forIn(el.prop,function(value, key){
                            if(/^\d+(\.\d{2})?$/.test(value)){
                                el.prop[key] = parseInt(value);
                            }
                        });

                        el.UF_PRICE = parseInt(el.EXT.UF_PRICE);

                        if(!el.prop){
                            el.prop = {}
                        }

                        el.prop['9999999999'] = el.UF_PRICE;
                        el.UF_POPULARITY = el.UF_POPULARITY ? parseInt(el.UF_POPULARITY) : 0;

                        if(el.EXT.UF_UDA20 == 3){
                            _.assign(el.prop, {'UF_SPEC_OFFER':'СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ'});
                        }
                        if(el.EXT.UF_UDA20 == 2){
                            _.assign(el.prop, {'UF_SPEC_PRICE':'ЛУЧШАЯ ЦЕНА'});
                        }
                        if(!!el.ESTORE){
                            _.assign(el.prop, {'8888888888':'Онлайн'});
                        }

                        // Push them for forward work
                        _products.push(el);
                    }

					/*
                    _products.sort(function (a, b) {
                        if (a.UF_UDA20 < b.UF_UDA20) {
                            return 1;
                        }

                        if (a.UF_UDA20 > b.UF_UDA20) {
                            return -1;
                        }

                        return 0;
                    });
					*/
                });

                return _products;
            };

            /* Render as html */
            $scope.to_trusted = function(html_code) {
                return $sce.trustAsHtml(html_code);
            };

            // section list | add function add2list
            $scope.add2list = function(e,prod_position) {
                var that = $(e.target),
                    cnt = 1,
                    art = that.parents('.inner').data('art');
                itname = that.parents('.inner').data('name');
                item = adviceProducts[art];

                prod_position = (typeof prod_position != "undefined") ? prod_position : 0;
                $.post('/bitrix/php_interface/ajax/add2list.php', {
                    tmpl: 'redesign-mini',
                    art: art,
                    cnt: cnt
                }, function (data) {
                    reloadSmallListUsingHtml(data);
                    that.html('Добавлено');
                    // ----------
                    gtmEventsProductAjax(art, prod_position, null, 'Advice', 'Conversions', 'add', 'WishList', true);
                });
            }
            // small-basket
            $scope.add2basket = function(e,prod_position) {
                var that = $(e.target),
                    cnt = 1; //that.parents('.inner').find('input').val(),
                art = that.parents('.inner').data('art');
                itname = that.parents('.inner').data('name');
                item = adviceProducts[art];

                prod_position = (typeof prod_position != "undefined") ? prod_position : 0;
                $.post('/bitrix/php_interface/ajax/basket.php', {
                    tmpl: 'redesign-mini',
                    action: 'add',
                    art: art,
                    cnt: cnt
                }, function (data) {
                    reloadSmallBasketUsingHtml(data);
                    that.html('Добавлено');

                    //yandexCounterAddProduct(art, cnt);
                    /*Проверяем слдует ли открывать попап корзины*/
                    if($('#lacking-popup').length <= 0){
                        gtmEventsAddProductPlus(art, cnt, prod_position, 'AdviceProducts', 'cart', 'single');
                        if($(that).parents("[data-nopopup=Y]").length <= 0){
                            popupAjaxBasket(art, prod_position);
                        }
                        if($(that).parents("[data-basket-popup=Y]").length > 0){
                            updateCurrentPopupBasket(art, prod_position);
                        }
                    }
                });
            };
            $scope.addAllToBasketItertion = function(i, products){
                //var count = $('.catalog__item_banner').length > 0 ? 2 : 1;
                var ii = i;
                $.post('/bitrix/php_interface/ajax/basket.php', {
                    tmpl: 'redesign-mini',
                    action: 'add',
                    art: $scope.productsList[i]['UF_ARTICUL'],
                    cnt: 1,
                    status: 0
                }, function (data) {
                    reloadSmallBasketUsingHtml(data);
                    $.ajax({
                        url: "/bitrix/php_interface/ajax/gaProduct.php",
                        method: "POST",
                        data: {
                            articul: $scope.productsList[ii]['UF_ARTICUL'],
                            cnt: 1
                        }
                    }).done(function(data) {
                        if(typeof data.article != 'undefined') {
							var product_element = angular.element(document.querySelector('.advices li[data-art="'+data.article+'"]'));
							if (product_element && product_element.attr('data-estore') == '1') {
								var position = product_element.attr('data-position');
								products.push({
									'id': data.article,
									'name': data.name,
									'category': data.gtmCategoryName,
									'brand': data.brand,
									'position': Number(position),
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
									'quantity': 1
								});
							}
                        }
                        if(ii < $scope.productsList.length-1) {
                        ii++;
                        $scope.addAllToBasketItertion(ii, products);
                        }
                        else{
                            if(products.length > 0){
                                for(var prod_i = 0; prod_i < products.length; prod_i++){
                                    if(prod_i == 0){
                                        var item = [];
                                        var num_pos = 0;
                                    }
                                    num_pos = prod_i+1;
                                    item.push(products[prod_i]);
                                    if(num_pos%7 == 0 || num_pos == products.length){
                                        dataLayer.push({
                                            'event': 'LeroyMerlin',
                                            'eventCategory': 'Conversions',
                                            'eventAction': 'add',
                                            'eventLabel': 'cart',
                                            'eventContext': null,
                                            'eventContent': 'bundle',
                                            'eventPosition': null,
                                            'eventLocation': 'Advice',
                                            'eventDivision': null,
                                            'eventSubdivision': null,
                                            'eventCategoryName': null,
                                            'eventCategoryId': null,
                                            'eventProductName': null,
                                            'eventProductId': null,
                                            'eventProductPrice': null,
                                            'ecommerce': {
                                                'add': {
                                                    'actionField': {
                                                        'list': 'AdviceProducts'
                                                    },
                                                    'products': item
                                                }
                                            }
                                        });
                                        item = [];
                                    }

                                }
                            }

                        }
                    });

                });
            }

            $scope.addAllToBasket = function() {
                $scope.addAllToBasketItertion(0, []);
                $('button.advices-buy-button').html('Добавлено');
            };

            $scope.fastView = function(product, position){
              /*  if($('.catalog__item_banner').length > 0) {
                    position++;
                }*/
            //    position++;
                $.get(
                    "/catalogue/fast-view.php",
                    { art: product.UF_ARTICUL,
                      advice_page: true,
                      advice_page_position: position
                    },
                    function(data){
                        gtmEventsProductAjaxClick(product.UF_ARTICUL, position, null, 'AdviceProducts', 'Interactions', 'click', 'quickView');
                        $("#popup-fast-view").html(data);
                        $("#btnFastView").trigger("click");
                    },
                    'html'
                );
            };

    /* аналоги методов PHP-класса GTMHelpers - start */

    $scope.gtmFormatProductTag = function (item) {
        switch (parseInt(item.UF_UDA20)) {
            case 1:
                return "lowPrice";
            case 2:
                return "bestPrice";
            case 3:
                return "offerLimited";
            default:
                return "(not set)";
        }
    };

    $scope.gtmFormatBrand = function (item) {
        if (item.UF_BRAND) return item.UF_BRAND;
        if (item.prop['377']) return item.prop['377'];
        return "(not set)";
    };

    $scope.gtmFormatRating = function (item) {
        return item.UF_RATING ? item.UF_RATING.toString() : 'default';
    };

    $scope.gtmFormatWeight = function (item) {
        return (+item.UF_WEIGHT * 1000).toString();
    };

    $scope.gtmFormatPrice = function (item) {
        return item.UF_PRICE + '.00';
    };

    $scope.gtmFormatPosition = function (position) {
        return ++position;
    };

    $scope.gtmFormatProduct = function (product, position) {
        return {
            'id': product.UF_ARTICUL,
            'name': product.UF_NAME,
            'category': product.SECT_3,
            'brand': $scope.gtmFormatBrand(product),
            'position': $scope.gtmFormatPosition(position),
            'variant': $scope.gtmFormatWeight(product),
            'dimension65': $scope.gtmFormatProductTag(product),
            'price': $scope.gtmFormatPrice(product),
            'metric1': $scope.gtmFormatPrice(product),
            'list': dataLayer[0].pageType
        }
    };

    $scope.gtmFormatAvailability = function (item) {
        return item.UF_BUTTON_BUY ? 'available' : 'notAvailable';
    }

            $scope.checkCompare = function(products){
                var art = products.UF_ARTICUL;
                if(typeof(compareVals) !== 'undefined' && compareVals.indexOf(art) >=0){
                    $scope.compareProduct[art] = true;
                    return true;
                } else{
                    $scope.compareProduct[art] = false;
                    return false;
                }
            };

            $scope.compareProduct = {};
            $scope.compare = function(products){
                var art = products.UF_ARTICUL;
                var checked = $scope.compareProduct[art];
                if(checked){
                    $.post('/catalogue/compare.php', {
                        add: art
                    }, function(response) {});
                } else{
                    $.post('/catalogue/compare.php', {
                        delete: art
                    }, function(response) {});
                }
            };

            $scope.testCompare = function(products){
              //  console.log('tested');
            };

        }]);
}
