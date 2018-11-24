//=require 'jquery'
//=require 'rrssb'

// Parallax
'use strict';

$('header, footer').each(function() {
  $(this).mousemove(function(e) {
    var y = e.pageY * -1 / 3;

    $(this).css('background-position', 0 + 'px ' + y + 'px');
  });
});
