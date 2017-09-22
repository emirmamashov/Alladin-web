$(function() {
  var el = $(this).find('.tooltip001'),
    tooltipHeight = el.outerHeight();
  el.css('margin-top', '-' + (tooltipHeight / 2) + 'px');

  $(this).addClass('shown');
  helper_height = $(this).children('span.help-txt').outerHeight() /* + 15*/ ;
  $(this).children('span.help-txt').css({
    'top': '-' + helper_height + 'px'
  });

  $(this).removeClass('shown');
  $(this).children('span').hide();

    $('.services .itemwrap.hastooltip').on('mouseover', function(){
        var el = $(this).find('.tooltip001'),
            tooltipHeight = el.outerHeight();
        el.css('margin-top', '-'+(tooltipHeight / 2)+'px');
    });
});
