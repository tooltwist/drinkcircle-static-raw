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

		},

		//--------
		nocomma: null
	};
}());

// Init after the page has loaded
jQuery(Main.init);
