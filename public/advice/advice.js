/*function(e) {
  $(this).parent().addClass('active').siblings().removeClass('active');
  var target = $(this).attr('href');
  if (target == '#') {
    $('.advice-items').show();
  } else {
    $(target).show().siblings().hide();
  }
  e.preventDefault();
}*/

$(function() {
    $('.vid-playlist .inner').owlCarousel({
        items : 4,
        navigation : true,
        navigationText : false,
        itemsMobile : false
    });
    $('.b-nav .inner').owlCarousel({
        slideSpeed : 200,
        paginationSpeed : 200,
        items : 4,
        navigation : true,
        navigationText : false,
        itemsMobile : false,
        afterInit : function(elem){
            var that = this
            that.owlControls.prependTo(elem)
        }
    });
});

function advicePrintOrPdfGTM(eventAction){
    dataLayer.push({
            'event': 'LeroyMerlin', 
            'eventCategory': 'Interactions',
            'eventAction': eventAction,
            'eventLabel': 'advice',
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
            'ecommerce': null
        });    
}