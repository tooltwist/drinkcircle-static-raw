var chratingsandreview = (function() {

  var countAllReviewsAndRatings = 0;
	var countAllRatings = 0;
	var count90To100 = 0;
	var count80To89 = 0;
	var count70To79 = 0;
  var count60to69 = 0;
  var count60AndBelow = 0;
	var reviwerCount = 0;

  function cookRatings(params, selection, callback){
    console.log('DO NOT cooking product ratings');
    return callback(null, selection);//ZZZZZ

    CrowdHound.traverse(selection, function cookTopic(level, element, parent, next) {

      //only get review elements
      if (element.type != 'review' && element.deleted != 1) {
              return next(null);
          }

      //check if user logged in owns the rating
      //this should have been in a different cooker
      var userId = 'QWER62I57JPR70WV7GN1SAK5'; //Login_config.getCurrentUser().userId;
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

                          reviwerCount += rating;
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
                        count60AndBelow++;
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


  function loadReviews(productVariantId) {
    //alert('chratingsandreview.loadReview(' + productVariantId + ')')


    /*
     *  Load ratings for this product, already aggregated by CrowdHound.
     */
    var anchor = '$product-rating-' + productVariantId;
    var aspect = 'percentage';
    CrowdHound.getVoteTotals(anchor, aspect, function(err, totals) {
      if (err) {
        console.log('Error while selecting votes:', err);
        return;
      }

      /*
       *  Display the average rating and grouping of values.
       *  We normally use patchInProductRatings() for this, but
       *  we need to display the groupings here as well.
       */
      //setTimeout(function() {
        var t = totals[0];
        if (t.num) {

          /*
           *  Update the average of ratings for this product.
           */
          var average = Math.round(t.total / t.num);
          $('#product_rating').html('' + average);

          /*
           *  Update the total number of votes (ratings).
           */
          var label = '' + t.num + ' Rating' + (t.num==1 ? '' : 's');
          $('#review-widget-number-of-ratings').html(label);

          /*
           *  Group the ratings into groupings to create a bar graph.
           */
          var count90To100 = (t['91to100'] ? t['91to100'] : 0);
          var count80To89 = (t['81to90'] ? t['81to90'] : 0);
          var count70To79 = (t['71to80'] ? t['71to80'] : 0);
          var count60to69 = (t['61to70'] ? t['61to70'] : 0);
          var count60AndBelow = (t['51to60'] ? t['51to60'] : 0)
                + (t['41to50'] ? t['41to50'] : 0)
                + (t['31to40'] ? t['31to40'] : 0)
                + (t['21to30'] ? t['21to30'] : 0)
                + (t['11to20'] ? t['11to20'] : 0)
                + (t['0to10'] ? t['0to10'] : 0);

          // console.log('Greoupings are: '
          //   + count90To100 + ', '
          //   + count80To89 + ', '
          //   + count70To79 + ', '
          //   + count60to69 + ', '
          //   + count60AndBelow);

          var pcnt90To100 = (count90To100 / t.num) * 100;
          var pcnt80To89 = (count80To89 / t.num) * 100;
          var pcnt70To79 = (count70To79 / t.num) * 100;
          var pcnt60To69 = (count60to69 / t.num) * 100;
          var pcnt60AndBelow = (count60AndBelow / t.num) * 100;

          // console.log('Ratios are: '
          //   + pcnt90To100 + ', '
          //   + pcnt80To89 + ', '
          //   + pcnt70To79 + ', '
          //   + pcnt60To69 + ', '
          //   + pcnt60AndBelow);

          // Update the Bars
          $('#pcnt90To100').attr('aria-valuenow', pcnt90To100).css('width',pcnt90To100+'%');
          $('#pcnt80To89').attr('aria-valuenow', pcnt80To89).css('width',pcnt80To89+'%');
          $('#pcnt70To79').attr('aria-valuenow', pcnt70To79).css('width',pcnt70To79+'%');
          $('#pcnt60To69').attr('aria-valuenow', pcnt60To69).css('width',pcnt60To69+'%');
          $('#pcnt60AndBelow').attr('aria-valuenow', pcnt60AndBelow).css('width',pcnt60AndBelow+'%');

          // Update the Numeric values
          $('#count90To100').html(count90To100);
          $('#count80To89').html(count80To89);
          $('#count70To79').html(count70To79);
          $('#count60To69').html(count60to69);
          $('#count60AndBelow').html(count60AndBelow);
        }

      //}, 100);

    });// getVotesTotals


          // var elementId;
          // var elementidHolder = $('#elementId').val();
          //
          // if (elementidHolder != null && elementidHolder != '') {
          //     elementId = parseInt(elementidHolder);
          // } else {
          //     elementId = '$product-'+productVariantId;
          // }
          var anchor = '$product-'+productVariantId;

          params = {
            elementId: anchor,
            withChildren: true,
            type: 'product-reviews' // Used if a new anchor is created
          };
          CrowdHound.select(params, function(err, selection) {
            if (err) {
              console.log('Error loading reviews', err);
              return;
            }

            /*
             *  Update the number of reviews.
             */
            console.log('reviews selection=', selection);
            var reviewsRoot = selection.elements[0];
            var numReviews = reviewsRoot.children.length;
            var label = '' + numReviews + ' Review' + (numReviews==1 ? '' : 's');
            $('#review-widget-number-of-reviews').html(label);


console.log('After selecting product reviews (but before cooking):', selection)
            if (selection == null) {
              alert('Loading reviews failed (selection == null)');
              return;
            }


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
                      // $('#review-widget-number-of-ratings').html(countAllRatings);
                      // $('#review-widget-number-of-reviews').html(countAllReviewsAndRatings);

                      // //set rating of product
                      // if(reviwerCount > 0) {
                      //     var productRating =  reviwerCount / countAllRatings;
                      //     $('#product_rating').html(productRating.toFixed());
                      //     if(typeof(elementId) == 'string'){
                      //         //show only when its in product details and not in product review page
                      //       $('.rate-counter').show();
                      //     }
                      // }

                      //set metrix
                      // var pcnt90To100 = (count90To100 / countAllRatings) * 100
                      // var pcnt80To89 = (count80To89 / countAllRatings) * 100;
                      // var pcnt70To79 = (count70To79 / countAllRatings) * 100;
                      // var pcnt60To69 = (count60to69 / countAllRatings) * 100;
                      // var pcnt60AndBelow = (count60AndBelow / countAllRatings) * 100;
                      // $('#pcnt90To100').attr('aria-valuenow', pcnt90To100).css('width',pcnt90To100+'%');
                      // $('#pcnt80To89').attr('aria-valuenow', pcnt80To89).css('width',pcnt80To89+'%');
                      // $('#pcnt70To79').attr('aria-valuenow', pcnt70To79).css('width',pcnt70To79+'%');
                      // $('#pcnt60To69').attr('aria-valuenow', pcnt60To69).css('width',pcnt60To69+'%');
                      // $('#pcnt60AndBelow').attr('aria-valuenow', pcnt60AndBelow).css('width',pcnt60AndBelow+'%');
                      //
                      // $('#count90To100').html(count90To100);
                      // $('#count80To89').html(count80To89);
                      // $('#count70To79').html(count70To79);
                      // $('#count60To69').html(count60to69);
                      // $('#count60AndBelow').html(count60AndBelow);

                      /*
                       *  Finished rendering, now get all the ratings for this
                       *  product, and patch the value of each the ratings onto
                       *  the UI for any review by the same user.
                       */
                      var anchor = '$product-rating-'+productVariantId;
                      CrowdHound.getVotes(anchor, function(err, votes) {
                        if (err) {
                          console.log('Error selecting votes for ' + anchor, err);
                          return;
                        }
                        //console.log('votes:', votes);
                        // For each user's rating, patch values on the page
                        for (var i = 0; i < votes.length; i++) {
                          var classname = '.review-widget-rating-user-' + votes[i].userId;
                          var rating = votes[i].score;
                          $(classname).html('' + rating);
                        }
                      });

                  }); //end CrowdHound.render

              });//end CrowdHound.cook

          }); //end Curia.select

      }


  /*
   *  This function searches for elements on the page that match:
   *
   *      .patch-in-average-product-rating(productVariantId="...")
   *      .patch-in-number-of-product-ratings(productVariantId="...")
   *      .patch-in-number-of-product-ratings-ess(productVariantId="...")
   *
   *  and patches in the appropriate value. The 'ess' variable is used
   *  to add the plural 's' on labels when their is more than one rating.
   *
   *  Before calling this function:
   *  1. Crowdhound muct have been initialised.
   *  2. The elements have already been added to the page, for
   *     example, after selecting the product list from tesservice.
   *
   */
  function patchInProductRatings() {
    //console.log('patchInProductRatings()');

    // Get a list of unique productVariantId.
    var anchors = [ ]; // productVariantId -> anchor
    $('.patch-in-average-product-rating').each(function() {
      var productVariantId = $(this).attr('productVariantId');
      console.log('productVariantId=' + productVariantId);
      if (productVariantId) {
        anchors[productVariantId] = '$product-rating-'+productVariantId;
      }
      else { alert('no productVariantId'); }
    });
    //console.log('anchors=', anchors)

    // Prepare a list of anchors for these products to
    // use as the elementIds parameter to getVoteTotals().
    var elementIds = '';
    var sep = '';
    for (productVariantId in anchors) {
      var anchor = anchors[productVariantId];
      elementIds += sep + anchor;
      sep = ',';
    }

    //console.log('elementIds is ' + elementIds)

    var aspect = 'percentage';
    CrowdHound.getVoteTotals(elementIds, aspect, function(err, totals) {
      if (err) {
        console.log('Error while selecting votes:', err);
        return;
      }

      //console.log('totals=', totals);
      // Patch the values into the UI
      for (var i = 0; i < totals.length; i++) {
        var t = totals[i];
        if (t.anchor) {
          var offset = '$product-rating-'.length;
          var productVariantId = t.anchor.substring(offset);
          console.log('++++> ' + productVariantId);
          var average = Math.round(t.total / t.num);
          var ess = (t.num == 1 ? '' : 's');
          $('.patch-in-average-product-rating[productVariantId='+productVariantId+']').html(average);
          $('.patch-in-number-of-product-ratings[productVariantId='+productVariantId+']').html(t.num);
          $('.patch-in-number-of-product-ratings-ess[productVariantId='+productVariantId+']').html(ess);
        }
      }
    });
  }// patchInProductRatings




    var CHConfig = function(){
      var serverUrl = "//127.0.0.1:4000",
        apiVersion = "2.0",

        tenant = "drinkpoint",
              port = "4000",
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

//     init: function() {
//       var host = CHConfig.SERVER_URL;
//       var port = CHConfig.SERVER_PORT;
//       var tenant = CHConfig.TENANT_NAME;
//       var ttuat = 'WV0QU6NFJX0U7HHTZCAZM187';//Login_config.getCurrentUser().ttuat;
//
// 			var _curiaUrl;
// 			// Prepare the configuration for Curia
//       var serverUrl = 'http:' + host;
//       var apiVersion = '2.0'
//
//       console.log("_curiaUrl=" + CHConfig.API_URL + ".");
//
//       curiaConfig = {
//         serverUrl : serverUrl,
//         apiVersion : apiVersion,
//         tenantId : tenant,
//         debug: false,
// //			development_userId : development_userId,
//         authenticationToken : ttuat,
//         urlive : false,
//         flat: false,
//         textonly: false,
//         cookers: {
//             //cook_avatars : cookAvatars, //definition is in the curia_js widget
//             cook_ratings : cookRatings
//         },
//         themes : {
//             "productReview": {
//                 "product-reviews_0" : "#reviewList",
//                 "review_0" : "#review"
//             }
//         }
// 			};

    patchInProductRatings: patchInProductRatings,

    //cookRatings: cookRatings,

    loadReviews: loadReviews,

    //
    nocomma: null
  }
})();
