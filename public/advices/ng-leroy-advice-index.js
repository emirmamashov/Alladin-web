if (typeof angular != 'undefined') {
    angular.module('leroymerlin', ['ngResource'])
        .controller('CatalogMenuCtrl', ['$scope', '$http', function ($scope, $http) {

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
                .then(function (response) {
                    if (response.data) {
                        $scope.sections = response.data;
                    }
                });

            //computed
            $scope.lvl2sections = function () {
                if (!$scope.selectedLvl1) {
                    return [];
                }

                return $scope.sections.lvl2[$scope.selectedLvl1];
            };

            $scope.lvl3sections = function () {
                if (!$scope.selectedLvl2) {
                    return [];
                }

                return $scope.sections.lvl3[$scope.selectedLvl2];
            };

            $scope.isSectionSelected = function (section, level) {
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

            $scope.selectedLvl2Data = function () {
                if (!$scope.selectedLvl1 || !$scope.selectedLvl2) {
                    return null;
                }

                var lvl2 = $scope.lvl2sections().filter(function (sec) {
                    return sec.ID == $scope.selectedLvl2;
                });

                if (!lvl2.length) {
                    return null;
                }

                return lvl2[0];
            };

            $scope.showDropdown = function () {
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
            $scope.selectSection = function (section, level) {
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

            $scope.unselectLvl3 = function () {
                $scope.selectedLvl3 = null
            };
            $scope.unselectLvl2 = function () {
                $scope.selectedLvl2 = null
            };

            $scope.unselectSections = function () {
                $scope.selectedLvl1 = null;
                $scope.selectedLvl2 = null;
                $scope.selectedLvl2 = null;
            }
        }])
        .controller('FavShop', ['$scope', '$http', function ($scope, $http) {
            var URL = '/bitrix/php_interface/ajax/shop_data.php';
            $scope.fav_shop = {};
            $scope.shops = {};

            $http.get(URL)
                .then(function (response) {
                    if (response.data) {
                        $scope.fav_shop = response.data.FAV_SHOP;
                        $scope.shops = response.data.SHOPS;
                    }
                });

            $scope.setFav = function (shop) {
                $scope.fav_shop = shop;
                $('#fav-shop button').text($scope.fav_shop.PROPERTY_NAME_VALUE)
                $.cookie('_FAV_SHOP', shop.XML_ID, { expires: 7, path: '/', domain: window.lmSettings.cookieDomain });
                $('.fancybox-close').trigger('click');
                location.reload();
            }
        }]);
}

var AdvicesIndex = function() {
    var self = this;

    self.model = {
        selectedCategory: selectedCategoryCode ? selectedCategoryCode : '',
        selectedSection: selectedSectionCode ? selectedSectionCode : '',
        types: types ? types : [],
        selectedSort: 'show_counter',
        selectedPage: selectedPage ? selectedPage : 1
    };

    self.selectType = function (index) {
        if (self.model.types[index]) {
            self.model.types[index].checked = !self.model.types[index].checked;
            self.setCurrentPage(1);
            self.loadItems();
        }
    }

    self.setAllTypes = function () {
        for (var i in self.model.types) {
            self.model.types[i].checked = true;
        }
        $('.advices-sorting__check .custom-check').addClass('is-active');
        self.setCurrentPage(1);
        self.loadItems();
    }

    self.selectSort = function (sort) {
        self.model.selectedSort = sort;
        self.setCurrentPage(1);
        self.loadItems();
    }

    self.setCurrentPage = function (page) {
        if (page > 0) {
            self.model.selectedPage = page;

            self.checkPageForSeoBlock();

            window.history.pushState({}, "", self.queryStringUrlReplacement(window.location.href, 'page', page));
            /*var urlQueryParams = $location.search();
            if (urlQueryParams.page || page != 1) {
                urlQueryParams.page = parseInt(page, 10);
            } else {
                delete urlQueryParams.page;
            }
            $location.search(urlQueryParams);
            self.sortUrlQueryParams();*/
        }
    }

    self.queryStringUrlReplacement = function(url, param, value) {
        var re = new RegExp("[\\?&]" + param + "=([^&#]*)"), match = re.exec(url), delimiter, newString;

        if (match === null) {
            // append new param
            var hasQuestionMark = /\?/.test(url);
            delimiter = hasQuestionMark ? "&" : "?";
            newString = url + delimiter + param + "=" + value;
        } else {
            delimiter = match[0].charAt(0);
            newString = url.replace(re, delimiter + param + "=" + value);
        }

        return newString;
    }

    /*self.sortUrlQueryParams = function() {
        var urlQueryParams = $location.search(),
            sortedUrlQueryParams = {};

        if (urlQueryParams.type) {
            sortedUrlQueryParams.type = urlQueryParams.type;
        }
        if (urlQueryParams.page) {
            sortedUrlQueryParams.page = urlQueryParams.page;
        }

        $location.search(sortedUrlQueryParams);
    }*/

    self.setPage = function (page) {
        self.setCurrentPage(page);
        self.loadItems(true);
    }

    self.checkPageForSeoBlock = function () {
        if ($('.seo-block-container').length) {
            if (self.model.selectedPage > 1) {
                $('.seo-block-container').hide();
            } else {
                $('.seo-block-container').show();
            }
        }
    }

    self.loadItems = function(scrollToTop) {
        var model = this.model;
        var selectedTypes = [];
        for (var i in model.types) {
            if (model.types[i].checked === true) {
                selectedTypes.push(model.types[i].id);
            }
        }
        var selectedNoTypes = !selectedTypes.length ? 1 : 0;

        $.post('/bitrix/php_interface/ajax/advices_index.php',
            {
                types: selectedTypes,
                type: model.selectedCategory,
                section_code: model.selectedSection,
                page: model.selectedPage,
                sort: model.selectedSort,
                selectedNoTypes: selectedNoTypes
            },
            function (data) {
                $('.advices-list').html($(data).find('.advices-list'));
                $('.pagination_small').html($(data).find('.pagination_small'));
                $('.advices-sidebar').html($(data).find('.advices-sidebar'));

                if (scrollToTop) {
                    $(window).scrollTo(0, $('.advices-list').offset().top);
                }

                self.reloadPageEventHandlers();
            },
            'html'
        );
    }

    self.initEventHandlers = function() {
        $('.advices-sorting__check input[type="checkbox"]').change(function () {
            self.selectType($(this).data('index'));
        });

        $('.advices-sorting__check a').click(function () {
            self.setAllTypes();
            return false;
        });

        $('.advices-sorting__order select').change(function () {
            self.selectSort($(this).val());
        });
    }

    self.reloadPageEventHandlers = function() {

        $('.pagination_small a').click(function () {
            self.setPage($(this).data('page'));
            return false;
        });

        window.onpopstate = function (event) {
            if (event.state) { // history changed because of pushState/replaceState

                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    query  = window.location.search.substring(1);

                var urlParams = {};
                while (match = search.exec(query))
                    urlParams[decode(match[1])] = decode(match[2]);

                var page = urlParams['page'];

                if (!page) {
                    page = 1;
                }

                if (page > 0) {
                    self.model.selectedPage = page;

                    self.checkPageForSeoBlock();
                }
                self.loadItems(true);
            }
        }
    }

    self.checkPageForSeoBlock();
    self.initEventHandlers();
    self.reloadPageEventHandlers();
}

var advicesIndex = new AdvicesIndex();
