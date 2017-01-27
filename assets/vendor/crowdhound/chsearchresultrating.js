var chsearchresultrating = (function() {

var reviewCount = 0;
var ratingCount = 0;
var ratingTotal = 0;

  var isEdit = false;
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
<<<<<<< HEAD
      var ttuat = '0YFW4AUKIQXVTH15Z172DRBT';

=======
      var ttuat = 'RJTDQGP394702Q31NDN72B53';
    
>>>>>>> philChristmas
      var _curiaUrl;
      // Prepare the configuration for Curia
      var serverUrl = 'http:' + host;
      var apiVersion = '2.0';
<<<<<<< HEAD

      curiaConfig = {
=======
      
      crowdHoundConfig = {
>>>>>>> philChristmas
            serverUrl : serverUrl,
            apiVersion : apiVersion,
            tenantId : tenant,
            debug: false,
            //          development_userId : development_userId,
            authenticationToken : ttuat,
            urlive : false,
            flat: false,
            textonly: false,
<<<<<<< HEAD
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
      alert('Before CH.init - loc #2')
      Curia.init(curiaConfig, function afterCuriaInit() {
        loadRatings();
      });
=======
            cookers: {
                cook_ratings : cookRatings
            }
        };

        // initialize crowdHound
        CrowdHound.init(crowdHoundConfig, function afterCrowdHoundInit() {
            loadRatings();
        });
>>>>>>> philChristmas
    }
function loadRatings(){
    $('#products .product-id').each(function() {
        var obj = $(this);
        var elementId = '$product-'+obj.val();
        params = {elementId : elementId, withChildren: true};
        var url = CHConfig.API_URL + "/thread/" + elementId +"?newAnchorType=product-reviews";
        CrowdHound.select(params, function (err, selection){
            if(selection == null){
                //means that this is the 1st time this page was visted time to create a new element for this product using /thread api
                $.ajax({
                    url: CrowdHound.addAuthenticationToken(url),
                    dataType: 'json'
                })
            }else{
                CrowdHound.cook({ }, selection, function(err, selection) {
                    // Now display the data
                    var productRating =  ratingTotal / ratingCount;
                    if(ratingTotal > 0) {
                        obj.parents(".product").find(".product-rating").html(productRating.toFixed());
                    }
                    //obj.parents(".product").find(".rating-total").html(ratingCount);
                    //obj.parents(".product").find(".review-total").html(reviewCount);
                });
            }

        }); //end CrowdHound.select
    });

}
function cookRatings(params, selection, callback){
<<<<<<< HEAD
    console.log('cooking product ratings');

    //Reset Values
    reviewCount = 0;
    ratingCount = 0;
    ratingTotal = 0;

    CrowdHound.traverse(selection, function cookTopic(level, element, parent, next) {

        //only get review elements
        if (element.type != 'review' && element.deleted != 1) {
            return next(null);
        }


        //call vote API to get rating
        var elementId = element.id;
        jQuery.ajax({
            url :  CrowdHound.addAuthenticationToken(CHConfig.API_URL + "/votes/" + elementId),
            async : false,
            success : function(data, textStatus, xhr) {
                if (xhr.status === 200) {
                    if(data.length > 0){
                        var rating = data[0].score;
                        var reviewTxt = element.description;
=======
            console.log('cooking product ratings');
            
            //Reset Values
            reviewCount = 0;
            ratingCount = 0;
            ratingTotal = 0;
            
            CrowdHound.traverse(selection, function cookTopic(level, element, parent, next) {
                
                //only get review elements
                if (element.type != 'review' && element.deleted != 1) {
                    return next(null);
                }
                
                
                //call vote API to get rating
                var elementId = element.id;
                jQuery.ajax({
                    url :  CrowdHound.addAuthenticationToken(CHConfig.API_URL + "/votes/" + elementId),
                    async : false, 
                    success : function(data, textStatus, xhr) {
                        if (xhr.status === 200) {
                            if(data.length > 0){
                                var rating = data[0].score;
                                var reviewTxt = element.description;
>>>>>>> philChristmas

                                element.rating = rating;
                                ratingTotal += rating;
                                ratingCount++;

                                if(reviewTxt != null && reviewTxt != ''){
                                   reviewCount++;
                                }
                                
                            }
                            return next(null);
                        }
<<<<<<< HEAD

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
=======
                    }
                });
                
            },
            function(){
                return callback(); //cooker is finished
            });
        }
        
>>>>>>> philChristmas
 return {
    init: function() {
    $(initCuria());

    }
 }
})();
