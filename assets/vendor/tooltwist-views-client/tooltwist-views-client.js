// tooltwistViews-client.js



var TooltwistViews = (function(){

  return {
    init: function(options) {

    },

    // API calls
    select: tooltwistViews_select,
    save: tooltwistViews_save,

    // metadata-related
    fieldsForMode: tooltwistViews_findFieldsForMode,

    // Rendering
    htmlForAngular_list: tooltwistViews_htmlForAngular_list,
    htmlForAngular_description: tooltwistViews_htmlForAngular_description,
    htmlForAngular_horizontalDescription: tooltwistViews_htmlForAngular_horizontalDescription,
    htmlForAngular_edit: tooltwistViews_htmlForAngular_edit,
  }

})();



function tooltwistViews_findFieldsForMode(metadata, mode) {
  if (metadata.modes) {

    var modeDef = metadata.modes[mode];
    if (typeof(metadata.modes[mode]) == 'undefined') {

      // unknown mode
      console.log('Mode ' + mode + ' not supported');
      //ZZZZ
      var fields = { };
    } else if (typeof(metadata.modes[mode]) == 'boolean') {
      if (modeDef) {

        // mode=true
        var fields = metadata.fields;
      } else {

        // mode=false
        console.log('Mode ' + mode + ' not supported');
        //ZZZZ
        var fields = { };
      }
    } else if (modeDef == 'all' || modeDef == '*') {

      // mode="all"
      var fields = metadata.fields;
    } else if (typeof(metadata.modes[mode]) == 'string') {

      // mode="field1,field2,..."
      var fields = { };
      modeDef.split(',').forEach(function(fieldName, i) {
        if (metadata.fields[fieldName]) {

          // Found the field.
          fields[fieldName] = metadata.fields[fieldName];
        } else {
          // Unknown field.
          console.log('Mode ' + mode + 'refers to unknown field: ' + fieldName);
        }
      });
    } else {
      // Cannot understand mode definition - display no fields
      console.log('Could not parse definition for mode ' + mode);
      //ZZZZ
      var fields = { };
    }

  } else {

    // No modes defined. Allow all fields to be used.
    var fields = metadata.fields;
  }


  console.log('fields for mode ' + mode, fields);

  return fields;
}// tooltwistViews_findFieldsForMode()


/*
 *  list - use Bootstrap table.
 *  See https://www.w3schools.com/bootstrap/bootstrap_tables.asp
 */
function tooltwistViews_htmlForAngular_list(metadata, fields, options) {

  var extraTableClasses = options.listTableClasses ? options.listTableClasses : '';
  var ngClick = '';
  if (options.listClickFunction) {
    ngClick = 'ng-click="' + options.listClickFunction + '(record)"';
  }

  // Work out the model name for the record list
  var model = 'generic_list';
  if (options.listModel) {
    model = options.listModel;
  }

  // Update the DOM to show these fields
  var html = ''
  html += '<table class="table ' + extraTableClasses + '">';
  html += '  <tr>';
  for (property in fields) {
    //console.log('property is ' + property);
    var details = fields[property];
    html += '    <th>' + details.label + '</th>';
  }
  html += '  </tr>';
  html += '  <tr ng-repeat="record in ' + model + '" ' + ngClick + '>'
  //html += '  <tr>';
  for (property in fields) {
    html += '    <td>';
    //console.log('property is ' + property);
    var details = fields[property];
    if (details.isReference) {
      html += '{{record.' + property + '__desc}} ';
    } else {
      html += '{{record.' + property + '}} ';
    }
    html += '    </td>';
  }
  html += '  </tr>';
  html += '</table>';
  html += '  <br/>';
  //html += '</p>';
    /*a.mouse-pointer(ng-click="supplierSelect(supplier.supplierId)")
      | {{record.product_id__desc}} - {{record.category_id__desc}}
    br*/
  return html;
}// tooltwistViews_htmlForAngular_list()


/*
 *  Display values using Bootstrap horizontalDescription.
 *
 *    Aaa   10
 *    Bbb   20
 *
 *  See http://getbootstrap.com/css/#horizontal-description
 */
function tooltwistViews_htmlForAngular_horizontalDescription(metadata, fields, options) {

  // Work out the model name for the record list
  var model = 'generic_record';
  if (options.recordModel) {
    model = options.recordModel;
  }

  // Construct the HTML
  var html = ''
  html += '<dl class="dl-horizontal">'
  for (property in fields) {
    //console.log('property is ' + property);
    var field = fields[property];
    html += '  <dt> ' + field.label + '</dt>';
    //html += '  <dd ng-model="'+model+'.'+field.name+'"/>';
    html += '  <dd>{{'+model+'.'+field.name+'}}</dd>';
  }
  html += '</dl>'
  return html;
}// tooltwistViews_htmlForAngular_horizontalDescription()


/*
 *  Display values using Bootstrap description.
 *
 *    Aaa
 *    10
 *    Bbb
 *    20
 *
 *  See http://getbootstrap.com/css/#description
 */
function tooltwistViews_htmlForAngular_description(metadata, fields, options) {

  // Work out the model name for the record list
  var model = 'generic_record';
  if (options.recordModel) {
    model = options.recordModel;
  }

  // Construct the HTML
  var html = ''
  html += '<dl>'
  for (property in fields) {
    //console.log('property is ' + property);
    var field = fields[property];
    html += '  <dt> ' + field.label + '</dt>';
    //html += '  <dd ng-model="'+model+'.'+field.name+'"/>';
    html += '  <dd>{{'+model+'.'+field.name+'}}</dd>';
  }
  html += '</dl>'
  return html;
}// tooltwistViews_htmlForAngular_description()


/*
 *  edit - use Bootstrap labels and inputs.
 */
function tooltwistViews_htmlForAngular_edit(metadata, fields, options) {

  // Work out the model name for the record list
  var model = 'generic_record';
  if (options.recordModel) {
    model = options.recordModel;
  }

  // Construct the HTML
  var html = ''
  for (property in fields) {
    //console.log('property is ' + property);
    var field = fields[property];
    html += '<label for="generic-' + field.name + '"> ' + field.label + '</label>';
    html += '<input id="generic-' + field.name + '" class="form-control" ng-model="'+model+'.'+field.name+'" placeholder=""/>';
    html += '</br>';
  }
  return html;
}// tooltwistViews_htmlForAngular_edit()


/*
 *  Load the list of records that match a filter.
 */
function tooltwistViews_select(context, viewName, params, callback/*(err,data,metadata)*/) {
  console.log('tooltwistViews_select(' + viewName + ')', params);

  var $scope = context.$scope;

  // Check the config
  var protocol = 'http';
  // var host = 'localhost';
  // var port = 3000;
  var host = context.TEASERVICE_HOST;
  var port = context.TEASERVICE_PORT;
  // var baseUrl = protocol + '://' + host + ':' + port;
  var baseUrl = '//' + host + ':' + port;


  // Load all the records
  var url = baseUrl + '/admin/' + viewName + '/select';
  console.log('url is ' + url)

  // var params = {
  //   storeId: STORE_ID,
  //   loadReferences: true
  // };

  // Call the API to get the supplier details
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

  context.$http(req).then(function(response) {
    console.log('success:', response)

    var data = response.data.data;
    var metadata = response.data.metadata;

    return callback(null, data, metadata);

    //$scope.categoryIndex
    /*context.$timeout(function() {
      $scope.$apply();
    }, 2000);*/
    //return response.data;

  }, function(response) {
    alert('An error occurred calling the TEA API.\nSee the Javascript console for details.')
    console.log('failure:', response)
    console.log('failure:', response.data.message);
  });

}// tooltwistViews_select


function tooltwistViews_save(context, viewName, record, callback/*(err, reply)*/) {
  console.log('tooltwistViews_save()', record);

  //return callback(null, { hello: 'there '});

  // Check the config
  var protocol = 'http';
  // var host = 'localhost';
  // var port = 3000;
  var host = TEASERVICE_HOST;
  var port = TEASERVICE_PORT;
  var baseUrl = protocol + '://' + host + ':' + port;


  // Load all the categories
  var url = baseUrl + '/admin/' + viewName + '/save';
  console.log('url is ' + url)

  //console.log('params=', params);
  var req = {
    method: 'POST',
    url: url,
    headers: {
      "access-token": "0613952f81da9b3d0c9e4e5fab123437",
      "version": "2.0.0"
    },
    data: record
  };
  context.$http(req).then(function(response) {
    console.log('success:', response)

    return callback(null, response);

  }, function(response) {
    alert('An error occurred calling the TEA API.\nSee the Javascript console for details.')
    console.log('failure:', response)
    console.log('failure:', response.data.message);
  });
  return false;
}// tooltwistViews_save
