$(document).ready(function () {
    $(".categories").hover(function () {
        $(".categories-2").fadeIn("fast");
    }, function () {
        $(".categories-2").hide();
    });

    $(".categories-2 li").hover(function () {
        $(this).children(".categories-3").fadeIn('fast');
    }, function () {
        $(this).children(".categories-3").hide();
    });
})