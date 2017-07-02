$(document).ready(function(){

    $(".menu li").hover(function(){
        $(this).children(".menu-content").fadeIn('fast');
    }, function(){
        $(this).children(".menu-content").fadeOut('fast');
    });

    $(".categories-item-content").hover(function(){

        $(this).animate({
            bottom: "0%"
        }, 200)

    }, function(){
        $(this).animate({
            bottom: "-45%"
        }, 200)
    });

    $("#main-slider").bxSlider({
        maxSlides: 1,
        easing: 'swing',
        auto: true,
        pause: 5000,
        speed: 2000
    });

    $("#company-slider").bxSlider({
        slideWidth: 190,
        minSlides: 2,
        maxSlides: 6,
        moveSlides: 1,
        auto: true,
        pause: 4000,
        speed: 2000,
        pager: false
    })

    $(".waterfall-tab-list a").click(function(e){
        e.preventDefault();
        var elem = $(this).attr("data-role");
        $(".waterfall-tab-list a").removeClass("selected")
        $(this).addClass("selected");
        $("ul.product-list").hide();
        $("ul.product-list[data-role='" + elem + "']").show();
    });

    $("#category-slider").bxSlider({
       slideWidth: 230,
       minSlides: 2,
       maxSlides: 5,
       pager: false,
       moveSlides: 1,
       speed: 1000 
    });

});