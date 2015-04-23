var A = window.A || {};

/*--------------------------------------------------------------------------
  Alaja 15 Specified Methods
/*------------------------------------------------------------------------*/

A.A15 = {

  isTouch: function() {
    return !!( 'ontouchstart' in window || navigator.msMaxTouchPoints );
  },

  isIE: function() {
    var ag = window.navigator.userAgent;
    return !!( ag.indexOf('MSIE ')>0 || !!ag.match(/Trident.*rv[ :]?11\./) );
  },

  setAttrs: function() {
    jQuery('html')
      .attr('data-touch-on', this.isTouch() ? '' : null)
      .attr('data-ie-on', this.isIE() ? '' : null);
  },

  navUpd: function(ev) {
    if (A.A15.headIsHidden) return; // no change if no head on screen
    var t = ev.currentTarget || ev.target, nav = !!t.checked;
    var sY = window.pageYOffset, mul = nav ? .5 : 2;
    A.A15.dynoHeadFreeze = nav; // freeze header when nav is open
    jQuery('html').attr('data-nav-on', nav ? '' : null); // set attribute
    window.scroll(window.pageXOffset, Math.ceil(sY * mul)); // save position on scale
  }, 

  navInit: function() {
    jQuery('#explore').on('change prepare', this.navUpd).trigger('prepare');
  },

  quickTap: function() {
    if (!this.isTouch()) return; // quickTap make sense for touch devices only
    jQuery('body').on('touchend', '[data-quicktap]', function(ev){
      ev.preventDefault();
      jQuery(this).click();
    });
  },

  headSafeZone: 60, // pixels
  headIsHidden: false,
  changeHead: function(hide) {
    if (this.headIsHidden == hide) return;
    else this.headIsHidden = hide;
    jQuery('.head').attr('data-hide-on', hide ? '' : null);
    // console.log('head is', hide ? 'hidden' : 'shown');
  },

  dynoHeadFreeze: false,
  dynoHead: function() { // using timers for high performance:
    ; (function(window, D, $, t){ 'use strict';
      
      var scrollTimer = null, ticks = 250;
      $(window).scroll(function () {
        if (scrollTimer) clearTimeout(scrollTimer); // clear previous timer
        scrollTimer = setTimeout(handleScroll, ticks); // set new timer
      });

      var docH = function() {
        return Math.max(
          D.body.clientHeight, D.documentElement.clientHeight,
          D.body.offsetHeight, D.documentElement.offsetHeight,
          D.body.scrollHeight, D.documentElement.scrollHeight
        );
      };

      var lastTop = 0, safeZone = t.headSafeZone, mY = false;
      var handleScroll = function() {
        if (t.dynoHeadFreeze) return;

        var st = $(window).scrollTop();
        var isDown = (st > lastTop); // true - downscroll, false - upscroll
        var isSafe = (st > safeZone) || (st < safeZone && !isDown);
        
        if (mY && isDown && isSafe) // disable double triggering
          isSafe = mY > safeZone;

        if (st + $(window).height() >= docH() - safeZone) // show on page's ends
          t.changeHead(false);
        else if (isSafe) // main logic of hide / show
          t.changeHead(isDown);

        lastTop = st;
      };

      var mouseTimer = null, mTicks = 500;
      if (!t.isTouch()) $(D).on('mousemove', function (e) {
        mouseTimer = setTimeout(function(){ handleMouse(e) }, mTicks); // set new timer
      });
      var handleMouse = function(e) {
        if (mouseTimer) clearTimeout(mouseTimer); // clear previous timer
        mY = e.clientY;
        if (mY && mY < t.headSafeZone) t.changeHead(false);
      };

    })(window, document, jQuery, this);
  },

  autoLoad: function() {
    this.setAttrs();
    this.navInit();
    this.quickTap();
    this.dynoHead();
  }
};

/*--------------------------------------------------------------------------
  Alaja 15 LightBox
/*------------------------------------------------------------------------*/

A.Box = {

  getNext: function($el, prev) {
    var $el = (prev) ? $el.prev(this.selector) : $el.next(this.selector);
    return ($el.length) ? $el : false;
  },

  go: function(e) {
    var sY = window.pageYOffset // save scroll pos
    A.A15.dynoHeadFreeze = true; // freeze header
    jQuery('html').attr('data-stage-on', true); // set attr

    var $this = jQuery(this);
    var data = $this.data();
    var $box = jQuery('<div class="stage" data-quicktap><div class="stage-wrap"></div><i class="if-angle-right" data-next data-quicktap></i><i class="if-angle-left" data-prev data-quicktap></i></div>');
    var $wrap = $box.children('.stage-wrap');

    $wrap.html(A.Box.getContent(data.zoomOn, data.zoomType)); // insert content
    jQuery('body').append($box); // show full box
    window.scroll(window.pageXOffset, 0); // scroll to top

    var $n = A.Box.getNext($this);
    var $p = A.Box.getNext($this, true);

    if ($n) $box.find('[data-next]').attr('data-on', true);
    if ($p) $box.find('[data-prev]').attr('data-on', true);

    $box.on('click', function(ev) { // close the box
      $box.remove();
      
      jQuery('html').attr('data-stage-on', null); // disable attr
      A.A15.dynoHeadFreeze = false; // unfreeze header
      window.scroll(window.pageXOffset, sY); // restore scroll pos

      ev.target.hasAttribute('data-next') && $n && $n.click(); // go next
      ev.target.hasAttribute('data-prev') && $p && $p.click(); // go prev
    });

    jQuery(document).one('keyup', function(ev) { // key control
      var sel = '[data-next]'; // default next
      if (ev.which == 37) sel = '[data-prev]'; // back
      if (ev.which == 27) sel = 'div'; // escape
      $box.find(sel).trigger('click');
    });
  },

  getContent: function(src, type) {
    var str = '', c = 'class="stage-content"';
    var parse = document.createElement('a'); parse.href = src; // create parser
    var id = parse.pathname; if (A.A15.isIE()) id = '/'+ id; // get id

    switch(type && type.toLowerCase()) {
      case 'youtube':
        str = '<iframe '+ c +' allowfullscreen src="//www.youtube.com/embed'+ id +'?autoplay=1"></iframe>';
        break;
      case 'vimeo':
        str = '<iframe '+ c +' src="//player.vimeo.com/video'+ id +'?autoplay=1"></iframe>';
        break;
      default: // serve image by default
        str = '<img '+ c +' src="'+ src +'">';
    }

    return str;
  },

  selector: '[data-zoom-on]',
  autoLoad: function() {
    jQuery('.main').on('click', this.selector, this.go);
  }
};

/*--------------------------------------------------------------------------
  Alaja 15 Forms
/*------------------------------------------------------------------------*/

A.Form = {

  notEmail: function(s) {
    return !s.match(/[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,}/)},
  notFilled: function(s) {
    return !s.length},
  
  errTrggr: 'errors:aform',
  initItem: function(item) {
    var $el = jQuery(item).find('input,textarea'); if (!$el.length) return;
    var dat = $el.data();

    $el.$hl = jQuery('<span/>'); // init helper
    $el.$hl.attr('data-help', dat.help).insertAfter($el);
    
    if ($el[0].type == 'textarea') // text autosize
      $el.attr('rows', 1).autosize().blur();

    if (dat.ph = dat.placeholder) { // init placeholder
      $el.Val = function() { return $el.val() == dat.ph ? '' : $el.val() };
      var onBlur = function(){ if (!$el.val()) $el.val(dat.ph) };
      var onFocus = function(){ $el.val($el.Val()) };
      $el.val(dat.ph).focus(onFocus).blur(onBlur);
    }
    
    $el.$fm = $el.parents('.aform').on('check:aform',function(){ A.Form.checkItem($el) }); // check trigger
    
    $el.$fm.on('serial:aform',function(){ $el.val($el.Val()) }); // serialization trigger
  },

  checkItem: function($el) {
    var dat = $el.data();
    var val = $el.Val();

    $el.$hl.attr('data-error', null); // initial clear

    if (dat.required && A.Form.notFilled(val)) // is required
      $el.$hl.attr('data-error', dat.required);

    if (dat.email && A.Form.notEmail(val)) // is email
      $el.$hl.attr('data-error', dat.email);

    if ($el.$hl.attr('data-error')) // check result
      $el.$fm.data(A.Form.errTrggr, true); // form inform
  },

  initSubmit: function(el) {
    var $el = jQuery(el);
    var $fm = $el.parents('.aform');

    var submitMe = function() {
      var __=$fm.trigger('serial:aform').serialize();__+='&id'+eval(0x1234&0x4321|-''-+'001')+'=';$el.remove();
      jQuery.post( $fm.attr('action'), __, function(resp) {
        if (resp) $fm.fadeOut(function(){ $fm.replaceWith(resp).fadeIn() }); }); };

    var onClick = function() {
      $fm.data(A.Form.errTrggr,false).trigger('check:aform');
      if (!$fm.data(A.Form.errTrggr)) submitMe() };

    $el.on('mouseup', onClick);
  },

  autoLoad: function() {
    var _t = this;
    jQuery('.aform-item').each(function(){ _t.initItem(this) });
    jQuery('.aform [data-submit]').each(function(){ _t.initSubmit(this) });
  }
};

/*--------------------------------------------------------------------------
  Alaja 15 Twitter Methods
/*------------------------------------------------------------------------*/

A.Twitter = {

  get: function(usr,cb) {
    jQuery.getJSON('twitter.php?id='+usr, function(resp) {
      var t = resp[0].tweet; if (cb&&t) cb(t); });
  },

  autoLoad: function() {
    jQuery('[data-tweet-from]').each(function() {
      var $this = jQuery(this);
      var cb = function(msg) { $this.html(msg) };
      A.Twitter.get($this.attr('data-tweet-from') || 'helloalaja', cb); });
  }
};

/*--------------------------------------------------------------------------
  Init jQuery & A Object
/*------------------------------------------------------------------------*/

; (function(){jQuery.noConflict();jQuery(document).ready(function(){for(var p in A)A.hasOwnProperty(p)&&A[p]&&A[p].autoLoad&&A[p].autoLoad()})})(jQuery);

/*--------------------------------------------------------------------------
  Load & Set Global jQuery Plugins
/*------------------------------------------------------------------------*/

A.PackedPlugins = {
  autoLoad: function() {
    // init smooth scroll
    if (jQuery.fn.smoothScroll) jQuery('a').smoothScroll ({ speed: 808 });
  }
};

/*--------------------------------------------------------------------------
  Packed Global jQuery Plugins
/*------------------------------------------------------------------------*/

; // Smooth Scroll by Karl Swedberg; MIT, GPL
; (function(a){"function"===typeof define&&define.amd?define(["jquery"],a):a(jQuery)})(function(a){function q(a){return a.replace(/(:|\.)/g,"\\$1")}var k={},p=function(c){var d=[],b=!1,f=c.dir&&"left"===c.dir?"scrollLeft":"scrollTop";this.each(function(){if(this!==document&&this!==window){var c=a(this);0<c[f]()?d.push(this):(c[f](1),(b=0<c[f]())&&d.push(this),c[f](0))}});d.length||this.each(function(){"BODY"===this.nodeName&&(d=[this])});"first"===c.el&&1<d.length&&(d=[d[0]]);return d};a.fn.extend({scrollable:function(a){a=p.call(this,{dir:a});return this.pushStack(a)},firstScrollable:function(a){a=p.call(this,{el:"first",dir:a});return this.pushStack(a)},smoothScroll:function(c,d){c=c||{};if("options"===c)return d?this.each(function(){var b=a(this),b=a.extend(b.data("ssOpts")||{},d);a(this).data("ssOpts",b)}):this.first().data("ssOpts");var b=a.extend({},a.fn.smoothScroll.defaults,c),f=a.smoothScroll.filterPath(location.pathname);this.unbind("click.smoothscroll").bind("click.smoothscroll",function(c){var d=a(this),e=a.extend({},b,d.data("ssOpts")||{}),l=b.exclude,m=e.excludeWithin,k=0,p=0,n=!0,r={},t=location.hostname===this.hostname||!this.hostname,u=e.scrollTarget||a.smoothScroll.filterPath(this.pathname)===f,s=q(this.hash);if(e.scrollTarget||t&&u&&s){for(;n&&k<l.length;)d.is(q(l[k++]))&&(n=!1);for(;n&&p<m.length;)d.closest(m[p++]).length&&(n=!1)}else n=!1;n&&(e.preventDefault&&c.preventDefault(),a.extend(r,e,{scrollTarget:e.scrollTarget||s,link:this}),a.smoothScroll(r))});return this}});a.smoothScroll=function(c,d){if("options"===c&&"object"===typeof d)return a.extend(k,d);var b,f,g,h,e;h=0;var l="offset";e="scrollTop";var m={};g={};"number"===typeof c?(b=a.extend({link:null},a.fn.smoothScroll.defaults,k),g=c):(b=a.extend({link:null},a.fn.smoothScroll.defaults,c||{},k),b.scrollElement&&(l="position","static"===b.scrollElement.css("position")&&b.scrollElement.css("position","relative")));e="left"===b.direction?"scrollLeft":e;b.scrollElement?(f=b.scrollElement,/^(?:HTML|BODY)$/.test(f[0].nodeName)||(h=f[e]())):f=a("html, body").firstScrollable(b.direction);b.beforeScroll.call(f,b);g="number"===typeof c?c:d||a(b.scrollTarget)[l]()&&a(b.scrollTarget)[l]()[b.direction]||0;m[e]=g+h+b.offset;h=b.speed;"auto"===h&&(e=m[e]-f.scrollTop(),0>e&&(e*=-1),h=e/b.autoCoefficient);g={duration:h,easing:b.easing,complete:function(){b.afterScroll.call(b.link,b)}};b.step&&(g.step=b.step);f.length?f.stop().animate(m,g):b.afterScroll.call(b.link,b)};a.smoothScroll.version="1.5.3";a.smoothScroll.filterPath=function(a){return(a||"").replace(/^\//,"").replace(/(?:index|default).[a-zA-Z]{3,4}$/,"").replace(/\/$/,"")};a.fn.smoothScroll.defaults={exclude:[],excludeWithin:[],offset:0,direction:"top",scrollElement:null,scrollTarget:null,beforeScroll:function(){},afterScroll:function(){},easing:"swing",speed:400,autoCoefficient:2,preventDefault:!0}});
; // Autosize by Jack Moore; MIT
; (function(e){var t,o={className:"autosizejs",append:"",callback:!1},i="hidden",n="border-box",s="lineHeight",a='<textarea tabindex="-1" style="position:absolute;top:-999px;left:0;right:auto;bottom:auto;border:0;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box;word-wrap:break-word;height:0 !important;min-height:0 !important;overflow:hidden;"/>',r=["fontFamily","fontSize","fontWeight","fontStyle","letterSpacing","textTransform","wordSpacing","textIndent"],l="oninput",c="onpropertychange",h=e(a).data("autosize",!0)[0];h.style.lineHeight="99px","99px"===e(h).css(s)&&r.push(s),h.style.lineHeight="",e.fn.autosize=function(s){return s=e.extend({},o,s||{}),h.parentNode!==document.body&&e(document.body).append(h),this.each(function(){function o(){t=b,h.className=s.className,e.each(r,function(e,t){h.style[t]=f.css(t)})}function a(){var e,n,a;if(t!==b&&o(),!d){d=!0,h.value=b.value+s.append,h.style.overflowY=b.style.overflowY,a=parseInt(b.style.height,10),h.style.width=Math.max(f.width(),0)+"px",h.scrollTop=0,h.scrollTop=9e4,e=h.scrollTop;var r=parseInt(f.css("maxHeight"),10);r=r&&r>0?r:9e4,e>r?(e=r,n="scroll"):p>e&&(e=p),e+=g,b.style.overflowY=n||i,a!==e&&(b.style.height=e+"px",x&&s.callback.call(b)),setTimeout(function(){d=!1},1)}}var p,d,u,b=this,f=e(b),g=0,x=e.isFunction(s.callback);f.data("autosize")||((f.css("box-sizing")===n||f.css("-moz-box-sizing")===n||f.css("-webkit-box-sizing")===n)&&(g=f.outerHeight()-f.height()),p=Math.max(parseInt(f.css("minHeight"),10)-g,f.height()),u="none"===f.css("resize")||"vertical"===f.css("resize")?"none":"horizontal",f.css({overflow:i,overflowY:i,wordWrap:"break-word",resize:u}).data("autosize",!0),c in b?l in b?b[l]=b.onkeyup=a:b[c]=a:b[l]=a,e(window).resize(function(){d=!1,a()}),f.bind("autosize",function(){d=!1,a()}),a())})}})(window.jQuery||window.Zepto);