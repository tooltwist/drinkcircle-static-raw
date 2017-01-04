
/*
 *  Functions for accessing TEA, using Angular.
 */

  var teaservice = (function() {

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
     *    - $scope.sharedOrders_num
     *    - $scope.sharedOrders
     *    - $scope.sharedOrders_shortList
     *    - $scope.sharedOrders_longList
     *
     *  It also adds the following values to the sharedOrder records:
     *    - sharedOrder.d_unitPrice
     *    - sharedOrder.d_packPrice
     *    - sharedOrder.d_packSave
     */
    function getSharedOrdersAndSetAngularVariables(paramsForAPI, $scope, teaService, callback/*(sharedOrders)*/) {

        console.log('getSharedOrdersAndSetAngularVariables', callback)
        // Call the TEA API to get the product details
        teaService.getSharedOrders(paramsForAPI).then(function(sharedOrders){

          $scope.sharedOrders_num = sharedOrders.length;

          // Put the shared orders into two lists, one that is always
          // visible, and another when the 'more' button is pressed.
          var NUM_IN_SHORT_LIST = 2;
          var NUM_IN_LONG_LIST = 16;
          if (paramsForAPI.shortListSize) {
            NUM_IN_SHORT_LIST = params.shortListSize;
          }
          if (paramsForAPI.longListSize) {
            NUM_IN_LONG_LIST = params.longListSize;
          }
          var sharedOrders_shortList = [ ];
          var sharedOrders_longList = [ ];
          $.each(sharedOrders, function(index, sharedOrder) {
            if (index < NUM_IN_SHORT_LIST) {
              //console.log('adding so ' + sharedOrder.shared_order_id + 'to short list', sharedOrder);
              sharedOrders_shortList.push(sharedOrder);
            } else if (index < NUM_IN_SHORT_LIST + NUM_IN_LONG_LIST){
              //console.log('adding so ' + sharedOrder.sharedOrder.shared_order_id + 'to long list', sharedOrder);
              sharedOrders_longList.push(sharedOrder);
            }
          });
          $scope.sharedOrders = sharedOrders;
          $scope.sharedOrders_shortList = sharedOrders_shortList;
          $scope.sharedOrders_longList = sharedOrders_longList;

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

          // Return the sharedOrders
          if (callback) {
            return callback(sharedOrders);
          }
        });

    } // getSharedOrdersAndSetAngularVariables

    /*
    *  Summarise the prices for a product variant and calculate a
    *  pricing table with information easy to display:
    *
    *   Returns: {
    *       packSize    (number in the box)
    *       rrp
    *       rrpPack
    *       unitPrice
    *       packPrice
    *       pricingTable
    *       tea_calcs.bulkPrices   ([record from the pricing_quantity table])
    *      }
    *
    * The pricing table:
    *   [{min, label, unitPrice, packPrice, save, showBuy, showSharedBuy, styles}]
    *
    */
    function calculatePriceTable(variant) {
      var priceInfo = { };
      priceInfo.priceTable = [ ];

      // Set the basic info
      var packSize = variant.componentsQty;
      priceInfo.packSize = packSize;


      // Calculate the RRP Prices
      var rrp = variant.manufacturerPrice;
      var rrpPack = rrp * packSize;
      //rrpPack = Math.ceil(rrpPack * 100) / 100; // round to nearest cent
      priceInfo.rrp = accounting.formatMoney(rrp);
      priceInfo.rrpPack = accounting.formatMoney(rrpPack);

      var rrpPricing = {
        min: 1,
        label: 'RRP',
        unitPrice: accounting.formatMoney(rrp),
        packPrice: accounting.formatMoney(rrpPack),
        save: '$0.00',
        showBuy: false,
        showSharedBuy: false,
        style1: 'font-size: 110%; font-weight: 100%; color: #f22;',
        style2: 'font-size: 110%; font-weight: 100%; color: #f22; text-decoration: line-through;'
      };
      priceInfo.priceTable.push(rrpPricing);


      // Calculate our non-quantity price
      var unitPrice = variant.lastPrice;
      var packPrice = unitPrice * packSize;
      //packPrice = Math.round(packPrice * 100) / 100; // round to nearest cent
      var packSave = rrpPack - packPrice;
      //packSave = Math.round(packSave * 100) / 100; // round to nearest cent
      priceInfo.unitPrice = accounting.formatMoney(unitPrice);
      priceInfo.packPrice = accounting.formatMoney(packPrice);

      var ourPricing = {
        min: 1,
        label: '1',
        unitPrice: accounting.formatMoney(unitPrice),
        packPrice: accounting.formatMoney(packPrice),
        save: accounting.formatMoney(packSave),
        showBuy: true,
        showSharedBuy: false,
        styles: ''
      };
      priceInfo.priceTable.push(ourPricing);

      // Add the 'pricing_quantity' prices to the table.
      //$scope.singlePrice = variant.pricing[0];
      if (variant.pricing.length < 1) {
        console.log('No pricing information available for product variant ' + variant.productVariantId);
        priceInfo.bulkPrices = [ ];
      } else {
          priceInfo.bulkPrices = variant.pricing[0].pricingQuantity;

        // Sort the quantity prices in quantity order.
        //ZZZZ

        // Now add the quantity prices
        for (var i = 0; i < priceInfo.bulkPrices.length; i++) {
          var qp = priceInfo.bulkPrices[i];

          var qty = qp.quantity;
          var qtyPrice = qp.price;
          packPrice = qtyPrice * packSize;
          packPrice = Math.ceil(packPrice * 100) / 100; // round to nearest cent
          packSave = rrpPack - packPrice;
          packSave = Math.ceil(packSave * 100) / 100; // round to nearest cent

          // Update the label on the previous price entry,
          // for example from "1", to "1 - 5".
          // Up till now the label be the minimum qty.
          var arr = priceInfo.priceTable;
          arr[arr.length - 1].label += ' - ' + (qty - 1);

          // Add this bulk price to the list
          var bulkPrice = {
            min: qty,
            label: '' + qty,
            unitPrice: accounting.formatMoney(qtyPrice),
            packPrice: accounting.formatMoney(packPrice),
            save: accounting.formatMoney(packSave),
            showBuy: true,
            showSharedBuy: true,
            styles: ''
          };
          priceInfo.priceTable.push(bulkPrice);
        }

        // Add a '+' onto the label of the final price,
        // for example from "10", to "10+".
        var arr = priceInfo.priceTable;
        arr[arr.length - 1].label += '+';
      } // have pricing record

      // Return the price table.
      //priceInfo.priceTable = pTable;
      return priceInfo;
    }

    /*
     *  Any elements similar to
     *    <... class="countdownTimer" expiresAt="<<sharedOrder.expiresAt>>"></...>
     *  will have their content updated every second to the time remaining
     *  to that timestamp (e.g. 32:22:10).
     */
    function startCountdownTimers() {

        setInterval(function() {
          // Update any countdown timers
          $('.countdownTimer').each( function( index, element ){
            var expiresAt = $(element).attr("expiresAt");
            $(element).text(expiresAt_HMS(expiresAt));
          });
        }, 1000);
    }


    // Convert from 2016-12-30T00:00:00.000Z to a
    // relative time in hours, minutes and seconds.
    function expiresAt_HMS(expiresAt) {

      if (expiresAt) {
        var expires = moment(expiresAt);
        var duration = moment.duration(expires.diff(moment.now()));

        var hours = duration.asHours(); // Float
        if (hours < 0) {
          return "expired";
        }
      } else {
        // ExpiresAt not set - first order not placed yet
        return "waiting for first order";
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
      init: function(config) {
        console.log('teaservice.init()');

        // Check the config
        var protocol = 'http';
        var host = 'localhost';
        // var host = '192.168.200.15';
        var port = 3000;
        // var host = 'drinkcircle.teaservice.io';
        // var port = 80;
        if (config && config.host && config.host != host) {
          host = config.host;
        }
        if (config && config.port && config.port != port) {
          port = config.port;
        }
        var baseUrl = protocol + '://' + host + ':' + port;
        //console.log('baseUrl=' + baseUrl);

        // Add a directive for the sharedOrder widget
        app.directive('circlebuyWidget', function(){
          return {
            restrict: 'E',
            scope: false,
            templateUrl: 'circlebuy-widget.html'
          }
        });

        // Add an Angular directive for the login widget
        console.log('adding directive for login widget')
        app.directive('authservice-login-widget', function(){
          return {
            restrict: 'E',
            scope: false,
            templateUrl: 'assets/vendor/authservice/authservice-login-widget.html'
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
              var url = baseUrl + '/philChristmas/product';
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
              var url = baseUrl + '/philChristmas/getSharedOrders';
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



            /**
            *	  Create a new shared_order.
            *	  Returns a promise (since $http(req) is asyncronous)
            */
            newSharedOrder: function newSharedOrder(paramsToAPI) {
              var url = baseUrl + '/philChristmas/newSharedOrder';
              console.log('url is ' + url)
              console.log('paramsToAPI:', paramsToAPI);

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
            getSharedOrdersAndSetAngularVariables: getSharedOrdersAndSetAngularVariables,

            startCountdownTimers: startCountdownTimers,

            calculatePriceTable: calculatePriceTable

          }; // end of object
        }); // end of app.factory

      }, // End of init()

      nocomma: null // does nothing

    }; //



  })();
