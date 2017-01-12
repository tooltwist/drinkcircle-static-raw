var Main = (function () {
	// variables
	var ctr = 0;

	// object
	return {
		init: function () {

			var whereAmI = $.cookie('pageactive');
			$('.navbar .minisite li').addClass(function() {
				if ($(this).find('a').attr('data-flag') == whereAmI) {
					return 'active';
				}
			});
			$('body').on('click', '.navbar .minisite li', function() {
				$.cookie('pageactive', $(this).find('a').attr('data-flag'), {path: '/'});
			});

			$('a').click(function() {
				var linksTo = $(this).attr('href');
				if (linksTo == 'profile' || linksTo == 'seller') {
					$.cookie("pageactive", "thecircle", {path: "/"});
				}
			})

			$(window).on('scroll resize', function() {
				if ($(this).width() > 767) {
					if($(this).scrollTop() > 50) {
						$('.nav-category').slideUp('fast');
					} else {
						$('.nav-category').slideDown('fast');
					}
				}
			});
			$('.navbar-collapse').mouseover(function() {
				// console.log('test')
				$('.nav-category').slideDown();
			});

			$("[data-expand]").click(function(e) {
				e.preventDefault();
				$("[data-expand-items]").toggle();
				$(this).find('span.text').toggle();
				$(this).find('i').toggleClass('fa-caret-down fa-caret-up');
			});

			$('.photos .prev').each(function() {
				"use strict";
				var _this = $(this);
				var wrapW = (_this.parent().width()/2);

				_this.find('img').each(function() {
					var w = $(this).width();
					var h = $(this).height();
					if (w > h) {
						$(this).height('100%')
					} else {
						$(this).width('100%');
					}

					if ( (_this.width() < wrapW) && (w < h) ) {
						$(this).height('100%').width('auto');
					}

				});
			});

			$(window).on('load resize', function() {
				if ( $(window).width() > 990 ) {
					$('#pageFilter').css('display', 'block');
				} else {
					$('#pageFilter').removeAttr('style');
				}
			});

			$(".circlebuyGauge").dxCircularGauge({
        geometry: {
          "endAngle": 300,
          "startAngle": 240
        },
        rangeContainer: {
          backgroundColor: '#fff',
          offset: -35,
          ranges: [
            {
              startValue: 0, endValue: null, color: '#4abd55'
            }
          ],
          width: 17
        },
        redrawOnResize: true,
        size: {
          width: '100%',
          height: '190'
        },
        scale: {
          startValue: 0,
          endValue: null,
          majorTick: { tickInterval: 1 },
          label: {
            format: 'number',
            font: {
              color: '#000'
            }
          }
        },
        title: {
          text: '04:56.12',
          position: 'bottom-center',
          font: {
            color: '#868686',
            size: '18px'
          }
        },
        value: 0,
        valueIndicator: {
          type: 'rangeBar'
        }
      });

      $('.circlebuyGauge').each(function() {
        var size = $(this).data('size');
        var sold = $(this).data('sold');
				var _this = $(this).dxCircularGauge('instance');
        _this.option('scale.endValue', size);
        _this.option('rangeContainer.ranges[0].endValue', sold);
      });

		},

		//--------
		nocomma: null
	};
}());

// Init after the page has loaded
jQuery(Main.init);
