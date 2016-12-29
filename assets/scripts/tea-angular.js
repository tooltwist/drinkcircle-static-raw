

  var teaAngular = (function() {




    /**
    *	Display the product with the specified productId.
    *	This will call the TEA API then update the page.
    *
    * Parameters:
    *   See philChristmas/getProduct
    *   - productId
    *   - productVariantId
    *
    * Scope values set:
    *   - $scope.product
    *   - $scope.variant
    *
    * Derived values:
    *   - $scope.available = $scope.variant.quantity;
    *   - $scope.singlePrice = $scope.variant.pricing[0];
    *   - $scope.quantityPrice = $scope.singlePrice.pricingQuantity;
    *   - $scope.packSize = packSize;
    *   - $scope.rrp = accounting.formatMoney(rrp);
    *
    * Pricing table (contains )
    *   - $scope.priceTable = pTable;
    *   [{min, label, unitPrice, packPrice, save, showBuy, showCircleBuy, styles}]
    *
    */
    function getProductAndDisplay(params, $scope, teaService, callback/*(product)*/) {
      console.log('getProductAndDisplay(). Params=', params)

      // Call the TEA API to get the product details
      teaService.getProduct(params).then(function(product){

        // Display the product details
        $scope.product = product;

        // In Drinkcircle there is one-to-one between products and variants
        // Check there is only one variant, and it is active. ZZZZ
        variant = product.variants[0];
        $scope.variant = variant;

        // Calculate the RRP Prices
        rrp = $scope.variant.manufacturerPrice;
        packSize = $scope.variant.componentsQty;
        rrpPack = rrp * packSize;
        rrpPack = Math.ceil(rrpPack * 100) / 100; // round to nearest cent

        $scope.available = $scope.variant.quantity;
        $scope.singlePrice = $scope.variant.pricing[0];
        $scope.quantityPrice = $scope.singlePrice.pricingQuantity;

        $scope.packSize = packSize;
        $scope.rrp = accounting.formatMoney(rrp);

        var rrpPricing = {
          min: 1,
          label: 'RRP',
          unitPrice: accounting.formatMoney(rrp),
          packPrice: accounting.formatMoney(rrpPack),
          save: '$0.00',
          showBuy: false,
          showCircleBuy: false,
          style1: 'font-size: 110%; font-weight: 100%; color: #f22;',
          style2: 'font-size: 110%; font-weight: 100%; color: #f22; text-decoration: line-through;'
        };

        // Calculate our non-quantity price
        var unitPrice = variant.lastPrice;
        packPrice = unitPrice * packSize;
        packPrice = Math.ceil(packPrice * 100) / 100; // round to nearest cent
        packSave = rrpPack - packPrice;
        packSave = Math.ceil(packSave * 100) / 100; // round to nearest cent
        var ourPricing = {
          min: 1,
          label: '1',
          unitPrice: accounting.formatMoney(unitPrice),
          packPrice: accounting.formatMoney(packPrice),
          save: accounting.formatMoney(packSave),
          showBuy: true,
          showCircleBuy: false,
          styles: ''
        };

        // Create the prices tables
        var pTable = [
          rrpPricing,
          ourPricing,
        ];

        // Sort the quantity prices in quantity order.
        //ZZZZ

        // Now add the quantity prices
        for (var i = 0; i < $scope.quantityPrice.length; i++) {
          var qp = $scope.quantityPrice[i];

          var qty = qp.quantity;
          var qtyPrice = qp.price;
          packPrice = qtyPrice * packSize;
          packPrice = Math.ceil(packPrice * 100) / 100; // round to nearest cent
          packSave = rrpPack - packPrice;
          packSave = Math.ceil(packSave * 100) / 100; // round to nearest cent

          // Update the label on the previous quantity price
          // Up till not it should only have the minimum qty.
          pTable[pTable.length - 1].label += ' - ' + (qty - 1);


          pTable.push({
            min: qty,
            label: '' + qty,
            unitPrice: accounting.formatMoney(qtyPrice),
            packPrice: accounting.formatMoney(packPrice),
            save: accounting.formatMoney(packSave),
            showBuy: true,
            showCircleBuy: true,
            styles: ''
          });
        }

        // Add a '+' onto the final quantity.
        pTable[pTable.length - 1].label += '+';

        // Return the price table.
        $scope.priceTable = pTable;

        return callback(product);
      });
    }



    /**
     *  Display Circle Buys
     *
     *  Input params:
     *    (See API /philChristmas/getSharedOrders)
     *    - sharedOrderId (single record)
     *    - productVariantId (returns a list)
     *    - customerId (creator of the sharedOrder, returns a list)
     *    - orderedBy (comma separated list of customerIds, returns a list)
     *
     *  Extra parameters, specifically for this function:
     *    - shortListSize
     *    - longListSize
     *
     *  This function sets the following values in $scope:
     *    - $scope.numSharedOrders
     *    - $scope.sharedOrders
     *    - $scope.shortSharedOrdersList
     *    - $scope.longSharedOrdersList
     *
     *  It also adds the following values to the sharedOrder records:
     *    - sharedOrder.d_unitPrice
     *    - sharedOrder.d_packPrice
     *    - sharedOrder.d_packSave
     *
     *  Any elements similar to
     *    <... class="countdownTimer" expiresAt="<<sharedOrder.expiresAt>>"></...>
     *  will have their content updated every second to the time remaining
     *  to that timestamp (e.g. 32:22:10).
     */
    function getSharedOrdersAndDisplayAsCircleBuys(paramsForAPI, $scope, teaService) {

        // Call the TEA API to get the product details
        teaService.getSharedOrders(paramsForAPI).then(function(sharedOrders){

          $scope.numSharedOrders = sharedOrders.length;

          // Put the shared orders into two lists, one that is always
          // visible, and another when the 'more' button is pressed.
          var NUM_IN_SHORT_LIST = 1;
          var NUM_IN_LONG_LIST = 16;
          if (paramsForAPI.shortListSize) {
            NUM_IN_SHORT_LIST = params.shortListSize;
          }
          if (paramsForAPI.longListSize) {
            NUM_IN_LONG_LIST = params.longListSize;
          }
          var shortSharedOrdersList = [ ];
          var longSharedOrdersList = [ ];
          $.each(sharedOrders, function(index, sharedOrder) {
            if (index < NUM_IN_SHORT_LIST) {
              //console.log('adding so ' + sharedOrder.shared_order_id + 'to short list', sharedOrder);
              shortSharedOrdersList.push(sharedOrder);
            } else if (index < NUM_IN_SHORT_LIST + NUM_IN_LONG_LIST){
              //console.log('adding so ' + sharedOrder.sharedOrder.shared_order_id + 'to long list', sharedOrder);
              longSharedOrdersList.push(sharedOrder);
            }
          });
          $scope.sharedOrders = sharedOrders;
          $scope.shortSharedOrdersList = shortSharedOrdersList;
          $scope.longSharedOrdersList = longSharedOrdersList;

          // Calculate the derived (d_) values
          $.each(sharedOrders, function(index, sharedOrder) {

            // Recommended retail price
            var rrp = sharedOrder.productVariant.manufacturerPrice;
            var packSize = sharedOrder.productVariant.componentsQty;
            var rrpPack = rrp * packSize;

            // Work out the bottle and pack price, and the saving
            var qty = sharedOrder.pricingQuantity.quantity;
            var price = sharedOrder.pricingQuantity.price;
            unitPrice = Math.ceil(price * 100) / 100; // round to nearest cent
            sharedOrder.d_unitPrice = accounting.formatMoney(unitPrice);
            var packPrice = price * packSize;
            packPrice = Math.ceil(packPrice * 100) / 100; // round to nearest cent
            sharedOrder.d_packPrice = accounting.formatMoney(packPrice);
            var packSave = rrpPack - packPrice;
            packSave = Math.ceil(packSave * 100) / 100; // round to nearest cent
            sharedOrder.d_packSave = accounting.formatMoney(packSave);
          });

          // Update the countdown timers
          setInterval(function() {
            $('.countdownTimer').each( function( index, element ){
              var expiresAt = $(element).attr("expiresAt");
              $(element).text(expiresAt_HMS(expiresAt));
            });
          }, 1000);
        });
    }


    // Convert from 2016-12-30T00:00:00.000Z to a
    // relative time in hours, minutes and seconds.
    function expiresAt_HMS(expiresAt) {

      var expires = moment(expiresAt);
      var duration = moment.duration(expires.diff(moment.now()));

      var hours = duration.asHours(); // Float
      if (hours < 0) {
        return "expired";
      }
      var hours = '' + Math.floor(hours);
      var minutes = '' + duration.minutes()
      var seconds = '' + duration.seconds()
      while (hours.length < 2) { hours = '0' + hours; }
      while (minutes.length < 2) { minutes = '0' + minutes; }
      while (seconds.length < 2) { seconds = '0' + seconds; }

      expiresAt_hms = hours + ':' + minutes + ':' + seconds;
      return expiresAt_hms;
    };


    function handleSuccess(response) {
      console.log('success:', response)
      return response.data;
    }

    function handleError(response){
      alert('An error occurred calling the TEA API.\nSee the Javascript console for details.')
      console.log('failure:', response)
      console.log('failure:', response.data.message)
      return null;
    }


    return {
      init: function() {
        console.log('teaAngular.init()');


        // Add a directive for the sharedOrder widget
        app.directive('circlebuyWidget', function(){
          return {
            restrict: 'E',
            scope: false,
            templateUrl: 'circlebuy-widget.html'
          }
        });


          // Define 'teaService' to Angular.
        app.factory('teaService', function($http, $q) {

          return { // start of object

            /**
            *	Get details about a product from the TEA API.
            *	Returns a promise (since $http(req) is asyncronous)
            */
            getProduct: function getProduct(params) {
              var url = 'http://localhost:3000/philChristmas/product'
              console.log('url is ' + url)

              // Call the API to get the product details
              // ZZZZ This should use JSONP, as some browsers do not support CORS.
              // ZZZZ Unfortunately JSONP does not support headers, so we need
              // ZZZZ to pass details either in the url or the data. i.e. the
              // ZZZZ server requires changes.
              var req = {
                method: 'POST',
                url: url,
                headers: {
                  "access-token": "0613952f81da9b3d0c9e4e5fab123437",
                  "version": "2.0.0"
                },
                data: params
              };

              // Prepare the promise, so the caller can use .then(fn) to handle the result.
              var promise = $http(req).then(handleSuccess, handleError);
              return promise;
            },


            /**
            *	Get details about a product from the TEA API.
            *	Returns a promise (since $http(req) is asyncronous)
            */
            getSharedOrders: function getSharedOrders(paramsToAPI) {
              var url = 'http://localhost:3000/philChristmas/getSharedOrders';
              console.log('url is ' + url)

              // Call the API to get the product details
              // ZZZZ This should use JSONP, as some browsers do not support CORS.
              // ZZZZ Unfortunately JSONP does not support headers, so we need
              // ZZZZ to pass details either in the url or the data. i.e. the
              // ZZZZ server requires changes.
              var req = {
                method: 'POST',
                url: url,
                headers: {
                  "access-token": "0613952f81da9b3d0c9e4e5fab123437",
                  "version": "2.0.0"
                },
                data: paramsToAPI
              };

              // Prepare the promise, so the caller can use .then(fn) to handle the result.
              var promise = $http(req).then(handleSuccess, handleError);
              return promise;
            },


            // Other functions to be exposed by teaService.
            getProductAndDisplay: getProductAndDisplay,

            getSharedOrdersAndDisplayAsCircleBuys: getSharedOrdersAndDisplayAsCircleBuys

          }; // end of object
        }); // end of app.factory

      }, // End of init()

      nocomma: null // does nothing

    }; //



  })();
