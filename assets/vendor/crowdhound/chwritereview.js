var chwritereview = (function() {


  function saveReview(productVariantId, heading, review, recommended, callback/*(err)*/) {
    console.log('saveReview(productVariantId=' + productVariantId + ', heading=' + heading + ', recommended=' + recommended + ')')

    var title = heading;
    var userId = authservice.getCurrentUser().id;
    var productAnchor = "$product-"  + productVariantId;
    var myReviewAnchor = "$product-"+productVariantId+"-reviewer-"+userId;
    var data = {
      id: myReviewAnchor,
      type: 'review',
      userId: userId,
      rootId: productAnchor,
      parentId: productAnchor,
      title: heading,
      description: review,
      summary: recommended,
    };

    // Save the new element. With an update, a new element is created
    // if required when you provide and the anchor and the type.
    CrowdHound.update(data, function(err) {
      //alert('Finished update.')
      return callback(err);
    });

  }

  function saveRating(productVariantId, rating, callback/*(err)*/) {
    var anchor = '$product-rating-' + productVariantId;

    var aggregationElementId = anchor;
    var voteElementId = anchor;
    var aspect = 'percentage';
    var anchorElementType = 'product-review'; // This allows Crowdhound to create a new anchor element if required.

    CrowdHound.saveVote(aggregationElementId, voteElementId, aspect, rating, anchorElementType, function(err) {
      //console.log('saveVote returned', err);
      return callback(err);
    });
  }



    function showRatingRequiredAlert() {
        bootbox.alert("Please select a rating value for this product.", function(){});
    }


    function checkReview(existingElementId/*optional*/, productVariantId, rating, heading, review, recommended) {
        var reviewHeading = heading;
        //var review = $('#review').val();
        if( !reviewHeading.trim()){
            var message = "Do you want to add a heading to your review?";
            bootConfirm( message, "#reviewHeading");
        } else if ( !review.trim()) {
            var message = "Do you want to add your review?";
            bootConfirm(message, "#review");
        } else {
            //$(saveReview());
            return true;
        }
        return false;
    }//- checkReview()

    function bootConfirm(messageString, elementId) {

        bootbox.confirm({
            message: messageString,
            buttons: {
                confirm: {
                    label: 'Yes',
                    //className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    //className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (!result) {
                    $(saveReview());
                } else {
                    setTimeout(function () {
                        $(elementId).focus();
                    }, 300);
                    //window.location.href = '#rate';
                    var offset = $(elementId).offset().top - $('nav').height();
                    $('html, body').animate({scrollTop: offset }, 'slow');
                }
            }
        }); //- bootbox.confirm
    }//- bootConfirm()



    return {
      // init: function() {
      //   $(initCuria());
      //   $(populateReview() );
      //
      //
      //   $('#submit-product-rating').on('click', function(){
      //     var loginId = 61;
      //     console.log("userid: " + 61);
      //     if(!loginId){
      //       $(showAlertNeedToLogin() );
      //       return;
      //     }
      //
      //     var rating = $('#rate').html();
      //     if(rating) {
      //       var proceedWithReview = checkReview();
      //     }else {
      //       $(showRatingRequiredAlert() );
      //     }
      //   });// click
      //
      // },// init

      checkReview: checkReview,
      saveReview: saveReview,
      saveRating: saveRating
    }; // returned object
})();
