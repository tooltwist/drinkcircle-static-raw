var crowdhoundservice = (function() {

  var countAllReviewsAndRatings = 0;
	var countAllRatings = 0;
	var count90To100 = 0;
	var count80To89 = 0;
	var count70To79 = 0;
  var count60to69 = 0;
  var count60Andbelow = 0;
	var reviewCount = 0;

  function cookRatings(params, selection, callback){
    console.log('cooking product ratings');
    CrowdHound.traverse(selection, function cookTopic(level, element, parent, next) {

      //only get review elements
      if (element.type != 'review' && element.deleted != 1) {
              return next(null);
          }

      //check if user logged in owns the rating
      //this should have been in a different cooker
      var userId = '6C36ZESDCRHHKC5J9WPL927A'; //Login_config.getCurrentUser().userId;
      if(userId != ''){
        //check if user own the review
        if(userId == element.user.userId){
          element.user.reviewOwner=true;
        }
      }

      //call vote API to get rating
      var elementId = element.id;
      jQuery.ajax({
              url :  Curia.addAuthenticationToken(CHConfig.API_URL + "/votes/" + elementId),
              async : true, // http://stackoverflow.com/a/29146183/1350573
              success : function(data, textStatus, xhr) {
                  if (xhr.status === 200) {
                    if(data.length > 0){
                      var rating = data[0].score;
                      element.rating = rating;

                          reviewCount += rating;
                      //count all reviews and ratings
                      var reviewTxt = element.description;
                      if(reviewTxt != null && reviewTxt != ''){
                        countAllReviewsAndRatings++;
                      }
                      countAllRatings++;
                      //count rating ranges
                      if(rating > 89 && rating < 101){
                        count90To100++;
                      }else if(rating > 79 && rating < 90){
                        count80To89++;
                      }else if(rating > 69 && rating < 80){
                        count70To79++;
                      }else if(rating > 59 && rating < 70){
                        count60to69++;
                      }else{
                        count60Andbelow++;
                      }
                    }
                    return next(null);
                  }
              }
          });

    },
    function(){
      return callback(); //cooker is finished
    });
  }
  function loadReview() {

          //getting product id from url
          var productVariantId = 0;
          window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
            if (key === 'product') {
              productVariantId = parseInt(value);
            }
          });

          var elementId;
          var elementidHolder = $('#elementId').val();

          if(elementidHolder != null && elementidHolder != '') {
              elementId = parseInt(elementidHolder);
          } else {
              elementId = '$product-'+productVariantId;
          }

          params = {elementId : elementId, withChildren: true};
          var url = CHConfig.API_URL + "/thread/" + elementId+"?newAnchorType=product-reviews";
          /*$.ajax({
              url: Curia.addAuthenticationToken(url),
              dataType: 'json'
          })
          .done(function getPostsCallback(data) {
            var selection = data.thread;
            selection.cooked = {};
            CrowdHound.cook({ }, selection, function(err, selection) {
                  // Now display the data
                  CrowdHound.render({
                      target: '#reviews',
                      theme: 'productReview'
                  }, selection, function(err, selection) {
                      if (err) {
                          console.log('Error during display: ', err);
                          return;
                      }
                      console.log('finished rendered' + selection);

                  }); //end CrowdHound.render
              });//end CrowdHound.cook
          })*/

          Curia.select(params, function (err, selection){
            if(selection == null){
              //means that this is the 1st time this page was visted time to create a new element for this product using /thread api
              $.ajax({
                      url: Curia.addAuthenticationToken(url),
                      dataType: 'json'
                  })
            }else{
              CrowdHound.cook({ }, selection, function(err, selection) {
                      // Now display the data
                      CrowdHound.render({
                          target: '#reviews',
                          theme: 'productReview'
                      }, selection, function(err, selection) {
                          if (err) {
                              console.log('Error during display: ', err);
                              return;
                          }
                          console.log('finished rendered' + selection);
                          //apply counts to their places
                          $('#review-widget-number-of-ratings').html(countAllRatings);
                          $('#review-widget-number-of-reviews').html(countAllReviewsAndRatings);

                          //set rating of product
                          if(reviewCount > 0) {
                              var productRating =  reviewCount / countAllRatings;
                              $('#product_rating').html(productRating.toFixed());
                              if(typeof(elementId) == 'string'){
                                  //show only when its in product details and not in product review page
                                $('.rate-counter').show();
                              }
                          }

                          //set metrix
                          var pcnt90To100 = (count90To100 / countAllRatings) * 100;
                          var pcnt80To89 = (count80To89 / countAllRatings) * 100;
                          var pcnt70To79 = (count70To79 / countAllRatings) * 100;
                          var pcnt60To69 = (count60to69 / countAllRatings) * 100;
                          var pcnt60Andbelow = (count60Andbelow / countAllRatings) * 100;
                          $('#pcnt90To100').attr('aria-valuenow', pcnt90To100).css('width',pcnt90To100+'%');
                          $('#pcnt80To89').attr('aria-valuenow', pcnt80To89).css('width',pcnt80To89+'%');
                          $('#pcnt70To79').attr('aria-valuenow', pcnt70To79).css('width',pcnt70To79+'%');
                          $('#pcnt60To69').attr('aria-valuenow', pcnt60To69).css('width',pcnt60To69+'%');
                          $('#pcnt60AndBelow').attr('aria-valuenow', pcnt60Andbelow).css('width',pcnt60Andbelow+'%');

                          $('#count90To100').html(count90To100);
                          $('#count80To89').html(count80To89);
                          $('#count70To79').html(count70To79);
                          $('#count60To69').html(count60to69);
                          $('#count60AndBelow').html(count60Andbelow);

                      }); //end CrowdHound.render
                  });//end CrowdHound.cook
            }

          }); //end Curia.select

      }

    var CHConfig = function(){
      var serverUrl = "http://"+CROWDHOUND_HOST+":"+CROWDHOUND_PORT,
        apiVersion = CROWDHOUND_VERSION,
        tenant = CROWDHOUND_TENANT,
        port = CROWDHOUND_PORT,
        apiUrl = [serverUrl, "api", apiVersion, tenant].join("/");
      return {
        SERVER_URL: serverUrl,
        API_VERSION: apiVersion,
        TENANT_NAME: tenant,
        API_URL: apiUrl,
              SERVER_PORT : port
      }
    }();

  return {
    init: function() {
      var host = CHConfig.SERVER_URL;
      var port = CHConfig.SERVER_PORT;
      var tenant = CHConfig.TENANT_NAME;
      var ttuat = authservice.getUserAccessToken();//Login_config.getCurrentUser().ttuat;

			var _curiaUrl;
			// Prepare the configuration for Curia
      //var serverUrl = 'http:' + host;
      var serverUrl = host;
      var apiVersion = '2.0'

      console.log("_curiaUrl=" + CHConfig.API_URL + ".");

      curiaConfig = {
        serverUrl : serverUrl,
        apiVersion : apiVersion,
        tenantId : tenant,
        debug: false,
//			development_userId : development_userId,
        authenticationToken : ttuat,
        urlive : false,
        flat: false,
        textonly: false,
        cookers: {
            //cook_avatars : cookAvatars, //definition is in the curia_js widget
            cook_ratings : cookRatings
        },
        themes : {
        "productReview": {
        "product-reviews_0" : "#reviewList",
                "review_0" : "#review"
            }
        }
			};

      // initialize curia
      Curia.init(curiaConfig, function afterCuriaInit() {
        loadReview();
      });

    }
  }
})();
