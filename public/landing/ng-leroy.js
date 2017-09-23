window.mousePos = {
    x: 0,
    y: 0
};
$(window).load(function () {
    if ($('.catalog-menu').length > 0) {
        $(document)
            .on('mouseout', '.catalog-menu li', function () {
                if ($('.mCustomScrollBox').hasClass('not-active')) {
                    $('.mCustomScrollBox').removeClass('not-active');
                }
                if ($(this).index() > 8)
                {
                    var target = $(this).closest('.mCustomScrollBox');
                    target.removeClass('transparentAfter');
                }
            })
            .on('mouseover', ".catalog-menu li", function() {
                if ($(this).index() > 8)
                {
                    var target = $(this).closest('.mCustomScrollBox');
                    target.addClass('transparentAfter');
                }
            })
            .on('mousemove', '.catalog-menu', function (event) {
                var dot, eventDoc, doc, body, pageX, pageY;

                event = event || window.event; // IE-ism

                // If pageX/Y aren't available and clientX/Y are,
                // calculate pageX/Y - logic taken from jQuery.
                // (This is to support old IE)
                if (event.pageX == null && event.clientX != null) {
                    eventDoc = (event.target && event.target.ownerDocument) || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = event.clientX +
                        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                        (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = event.clientY +
                        (doc && doc.scrollTop || body && body.scrollTop || 0) -
                        (doc && doc.clientTop || body && body.clientTop || 0 );
                }

                mousePos = {
                    x: event.pageX,
                    y: event.pageY
                };
            })

    }
});
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
                if ($scope.dropdownFlag) {
                    if (!$('body').hasClass('no-active')) {
                        $('body').addClass('no-active');
                    }
                } else {
                    if ($('body').hasClass('no-active')) {
                        $('body').removeClass('no-active');
                    }
                }
                return $scope.dropdownFlag;
            }

            //methods
            function setSect(section, level) {
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
            }

            $scope.selectSection = function (section, level) {
                window.mousePos.time = new Date().getTime();
                window.mousePos.id = section.ID;

                if (level < 3) {
                    catalogMenuHeight(level + 1);
                }

                if ($scope.mousePos
                    && $scope.mousePos[level]
                    && window.mousePos.id == $scope.mousePos[level].id) {
                    $scope.mousePos = $scope.mousePos || {};
                    $scope.mousePos[level] = window.mousePos;
                    return false;
                }

                if (level < 3
                    && $scope.mousePos
                    && $scope.mousePos[level]
                    && (parseInt(window.mousePos.x, 10) - parseInt($scope.mousePos[level].x, 10) > 3)
                    && (parseInt(window.mousePos.x, 10) - parseInt($scope.mousePos[level].x, 10)) /
                    (window.mousePos.time - $scope.mousePos[level].time) > 0.18
                )
                    return false;

                setSect(section, level);
                $scope.mousePos = $scope.mousePos || {};
                $scope.mousePos[level] = window.mousePos;
                return this;
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
                delete $scope.mousePos;
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
		.controller('UserRegistrationController', ['$scope', '$rootScope', '$sce', '$window',
			function ($scope, $rootScope, $sce, $window) {
				$scope.sce = $sce;
				$scope.model = {};

				$scope.getLabelClass = function (formField) {
					if (formField == undefined) return {'white-label': true};
					var hasRequiredError = $scope.hasRequiredError(formField);
					return {'green-label': !hasRequiredError, 'red-label': hasRequiredError};
				};
				$scope.hasRequiredError = function (formField) {
					if (formField == undefined){
						return false;
					}
					return (formField.$touched || formField.$dirty) && formField.$error.required;
				};
				
				$scope.isValid = function(){
					//console.log($scope.forms.register.$invalid);
					if ($scope.forms.register.$invalid){
						return false;
					}
					//console.log($scope.forms.register.$valid);
					
					if (!$scope.checkSiriusPassword($scope.model.password)){
						return false;
					}
					if (!$scope.checkSiriusEmail($scope.model.email)){
						return false;
					}
					if (!$scope.checkPasswordConfirm($scope.model.password,$scope.model.passwordConfirm)){
						return false;
					}
					return $scope.forms.register.$valid;
				}
				
				$scope.checkPasswordConfirm = function (pwd, pwdConfirm) {
					$scope.forms.register.$valid = false;
					if (!pwd || !pwdConfirm){
						return true;
					}
					if (pwd != pwdConfirm){
						return false;
					}
					$scope.forms.register.$valid = true;
					return true;			
				}
				$scope.checkSiriusPassword = function (pwd) {
					$scope.forms.register.$valid = false;
					if (pwd==undefined){
						return true;
					}
					var pat = /^[0-9A-Za-zА-Яа-я\&\<\>\!\#\$\%\(\)\*\+\,\-\.\/\:\;\=\?\@\[\]\^\_\{\}\|]{6,}$/g;
					if (!pwd.match(pat)){
					  return false;
					}
					if (!(pwd.match(/[A-Za-z]/g) && pwd.match(/[0-9]/g))){
					  return false;
					}
					$scope.forms.register.$valid = true;
					return true;
				};

				$scope.checkSiriusEmail = function (eml) {
					$scope.forms.register.$valid = false;
					if (eml==undefined){
						return true;
					}
					var pat = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,4})$/i;
					if (!eml.match(pat)){
					  return false;
					}
					$scope.forms.register.$valid = true;
					return true;
				};
				
			}
		]);
}
