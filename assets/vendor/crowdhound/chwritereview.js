var chwritereview = (function() {
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

  function initCuria() {
      var host = CHConfig.SERVER_URL;
      var port = CHConfig.SERVER_PORT;
      var tenant = CHConfig.TENANT_NAME;
      var ttuat = '0YFW4AUKIQXVTH15Z172DRBT';
    
      var _curiaUrl;
      // Prepare the configuration for Curia
      var serverUrl = 'http:' + host;
      var apiVersion = '2.0'
      
      console.log("_curiaUrl=" + CHConfig.API_URL + ".");
        
      curiaConfig = {
            serverUrl : serverUrl,
            apiVersion : apiVersion,
            tenantId : tenant,
            debug: false,
            authenticationToken : ttuat,
            urlive : false,
            flat: false, 
            textonly: false,
            // cookers: {
                //cook_avatars : cookAvatars, //definition is in the curia_js widget
                //cook_ratings : ProductReview.cookRatings
            //},
            //themes : {
      //"productReview": {
        //"product-reviews_0" : "#reviewList",
                    //"review_0" : "#review",
                    //"options":  { flat: false, textonly: true, readonly: false },
              //}
            
            //}
      };


      // initialize curia
      Curia.init(curiaConfig, function afterCuriaInit() {
        //ProductReview.loadReview();
      });
    }
    
    function postRating() {

        //getting product id from url
        var productId = 0;
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
          if (key === 'product') {
            productId = parseInt(value);
          }
        });

        var title = $('#reviewHeading').val();
        console.log("title: " + title);
        
        var review = $('#review').val();
        console.log("review: "+ review);

        var url = Curia.addAuthenticationToken(CHConfig.API_URL + '/element');
        var userId = 61;
        var recommended = $('#recommend-checkbox').is(':checked')? "recommended" : null;
        var elementId = $('#review-element-id').val();
        //var elementId = null;
        var data = {
            "type" : "review",
            "userId":userId,
            "rootId" : "$product-"  + productId,
            "parentId" : "$product-"  + productId,
            "title": (title? title: " "),
            "description" : (review? review: " "),
            "extraProperties" : recommended,
            
        };
        //add id to data if review already exists and pass it to PUT (edit)
        if(isEdit){
            data.id = elementId;
        }else{
            //new review = pass an elementId or anchor
            data.anchor = "product-"+productId+"-reviewer-"+userId;
        }
        
        //change method whether this is an edit or first review
        var ajaxType = elementId? "PUT": "POST";
        
        $.ajax({
            type : ajaxType,
            url : url,
            data : data,
            success : function(response) {
                if (response
                    && response.status
                    && response.status === "ok") {
                    var reviewId = response.elementId;
                    var score = $('#rate').html();
                    $(rate(productId, reviewId, score ) );
                }
            },

            error : function(qXHR, textStatus, errorThrown) {
                console.log('An error occurred while submitting the review.\n  status: ' + qXHR.status + "\n  responseText: ", qXHR.responseText);
            }
        });
    }
    
    function rate(pid, reviewId, score) {
        var userId = 61;
        
        Curia.select({elementId : '$product-'+pid, withChildren : false, level : 0}, function (err, selection){
            var elementProductId = selection.elements[0].id;
            var params = {
                aggregationElement: elementProductId,
                voteElement: reviewId,
                aspect: 'ratings',
                score: score
            }
    
            jQuery.ajax({
                url :  Curia.addAuthenticationToken(CHConfig.API_URL + "/vote"),
                method : 'POST',
                data : params,
                success : function(data, textStatus, xhr) {
                    if (xhr.status === 200) {
                        var productName = $('#title-product-name').text();
                        var message = isEdit? 
                          "You have successfully updated a rating/ review for " + productName +"!" :
                          "You have successfully submitted a rating/ review for " + productName +"!" ;
                        bootbox.alert(message, function() {
                            window.location.href = "productdetails2.html?product=" + productId;
                        });
                        var type = isEdit? "editRating": "addRating";
                        var productId = pid;
                        //sendEmailNotification(productId, userId, type, elementProductId);
                    }
                },
                error : function(qXHR, textStatus, errorThrown) {
                    console.log('An error occurred while submitting the rating.\n  status: ' + qXHR.status + "\n  responseText: ", qXHR.responseText);
                }
            });
        });

    }

          
    function showRatingRequiredAlert() {
        bootbox.alert("Please select a rating value for this product.", function(){});
    }
    
    function populateReview(){

        //getting product id from url
        var productId = 0;
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
          if (key === 'product') {
            productId = parseInt(value);
          }
        });

        var userId = 61;
        console.log("current user" +userId);
        var url = Curia.addAuthenticationToken(CHConfig.API_URL + '/elements');
        var params = {
            elementId: "$product-"+productId+"-reviewer-"+userId
        }
        
        Curia.select("$product-"+productId+"-reviewer-"+userId, function (err, selection){
            if(err){
                isEdit = false;
                console.log("No items returned from select.")
            }else{
                isEdit = true;
                console.log("returned " +selection.elements.length+ " from select.");
                var element = selection.elements[0]; 
                $('#review-element-id').val(element.id);

                $('#reviewHeading').val(element.title);
                $('#review').val(element.description);

                var isRecommended = element.extraProperties === "recommended"? true : false;
                $('#recommend-checkbox').prop("checked", isRecommended);

                jQuery.ajax({
                    url :  Curia.addAuthenticationToken(CHConfig.API_URL + "/votes/" + element.id),
                    success : function(data, textStatus, xhr) {
                        if (xhr.status === 200) {
                            if(data.length > 0){
                                var rating = data[0].score;
                                $('#rate').html(rating);
                            }
                        }
                    }
                });
            }
        });
    }
  return {
    init: function() {
      $(initCuria()); 
        $(populateReview() );
        
        $('#submit-product-rating').on('click', function(){
            var loginId = 61;
            console.log("userid: " + 61);
            if(!loginId){
                $(showAlertNeedToLogin() );
                return;
            }
            
            var rating = $('#rate').html();
            if(rating) {
                var proceedWithReview = checkReview();
            }else {
                $(showRatingRequiredAlert() );
            }

        } );
        
        var checkReview = function () {
            var reviewHeading = $('#reviewHeading').val();
            var review = $('#review').val();
            if( !reviewHeading.trim() ){
                var message = "Do you want to add a heading to your review?";
                bootConfirm( message, "#reviewHeading");
            }else if ( !review.trim() ) {
                var message = "Do you want to add your review?";
                bootConfirm( message, "#review");
            }else{
                $(postRating());
            }
            return false;
        };
        
        var bootConfirm = function ( messageString, elementId ) {

        bootbox.confirm(  {
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
                    $(postRating());
                }else{
                    setTimeout(function (){
                        $(elementId).focus();
                    }, 300);
                    //window.location.href = '#rate';
                    var offset = $(elementId).offset().top - $('nav').height();
                    $('html, body').animate({scrollTop: offset }, 'slow');
                }
            }
        } );
      };
    }
  }
})();

