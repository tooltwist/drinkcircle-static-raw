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

		},

		//--------
		nocomma: null
	};
}());

// Init after the page has loaded
jQuery(Main.init);
