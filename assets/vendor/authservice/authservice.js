var authservice = (function() {

  var LOGIN_DETAILS_COOKIE_NAME = 'authservice-login-details';
  var LOGIN_TIMEOUT_DAYS = 3;
  var ENDPOINT = null;

  // Currently logged in user
  var _currentEntityId = -1; // Separate, so user code can't hack it
  var _currentUser = null;

  // Current Access token
  var _ttuat = null;


  // Are we simulating?
  var _pretend = false;

  // User callbacks
  var _onUserChange = null;


  var dummyUserBob =  {
    "tenant": "nodeclient",
    "id": 901,
    "authority": "email",
    "type": "user",
    "external_id": "jim",
    "status": "new",
    "email": "Bob",
    "email_status": "",
    "full_name": "Bob the Builder",
    "avatar": "",
    "entity_type_description": "User",
    "is_login_account": 1,
    "user": {
      "locale": "",
      "location": "",
      "timezone": "",
      "user_first_name": "Bob",
      "user_gender": "male",
      "user_languages": "EN",
      "user_last_name": "Builder",
      "user_media_page": "",
      "user_middle_name": "B"
    },
    "relationshipSummary": {
      "isFriendedBy": [
        {
          "entity_id": 902,
          "full_name": "Jim Boots",
          "last_name": "Boots",
          "entity_type": "user"
        }
      ],
      "hasFriend": [
        {
          "entity_id": 903,
          "full_name": "Jill Jones",
          "last_name": "Jones",
          "entity_type": "user"
        }
      ]
    },
    "relationships": [
      {
        "relationship_id": 6,
        "relationship_type": "friend",
        "entity_id_1": 901,
        "entity_id_2": 902
      }
    ]
  };

  function getDummyUser(username) {
    if (username == 'bob') {
      return dummyUserBob;
    } else {
      return null;
    }
  }



  /*
   *  Perform an AJAX, using jQuery or Angular if available.
   */
  function authservice_ajax_call(urlpath, params, $http_from_angular, callback) {

    var url = ENDPOINT + urlpath;
    console.log('authservice_ajax_call()')
    console.log(url)
    console.log(params);
    console.log("vvvvvv calling vvvvvv");


    // See if this is an Angular AJAX call
    if ($http_from_angular) {
      // Call the API to get the product details
      // ZZZZ This should use JSONP, as some browsers do not support CORS.
      // ZZZZ Unfortunately JSONP does not support headers, so we need
      // ZZZZ to pass details either in the url or the data. i.e. the
      // ZZZZ server requires changes.
      var req = {
        method: 'POST',
        url: url,
        data: params
      };
      $http_from_angular(req).then(handleSuccess, handleError).then(function(result){
        return callback(result);
      });
    } else {

      // We don't have Angular's $http, so use jQuery AJAX.
      var json = JSON.stringify(params)

      // Using CORS
      //console.log('Using CORS');
      $.ajax({
        url: url,
        type: "POST",
        crossDomain: true,
        data: json,
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
          // var resp = JSON.parse(response)
          // alert(resp.status);
          // console.log( "Login response: ", response);
          // if (response.status == 'ok') {
          //   // Logged in.
          //   // Forward to some other page, or redraw this page.
          //   var ttuat = response.ttuat;
          //   console.log('ttuat=' + ttuat);
          //   //window.location = '/african.html';
          //   return;
          // } else {
          //   // Display an error message
          //   $('#authservice-login-errmsg').show();
          //   return;
          // }
          return callback(response);
        },
        error: function (jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
          console.log('jqxhr=', jqxhr);
          console.log('textStatus=', textStatus);
          console.log('error=', error);
          alert('An error occurred while calling the authservice server. Please try again later.');
          return callback(null);
        }
      });

    }

  }

  /*
   *  With luck, a previous page logged in, and saved the current user
   *  details and an access token in a cookie so we could pick it up here.
   */
  function setCurrentUserFromCookie() {
    var json = getCookie(LOGIN_DETAILS_COOKIE_NAME);
    if (json) {
      try {
          // Parse the JSON, and check the required values exist
          var obj = JSON.parse(json); // May throw an exception
      } catch(e) {

          // Dud cookie data
          console.log('Error parsing login cookie', e);
          setCurrentUser(null, null, true);
          return;
      }

      // Check the cookie data has user details.
      if (obj.user && obj.ttuat) {

        // All good.
        console.log("FOUND LOGIN COOKIE.", obj)
        var isFromCookie = true;
        setCurrentUser(obj.user, obj.ttuat, isFromCookie);
        return;

      } else {
        console.log('Login cookie missing user or ttuat');
      }

    } else {
      console.log('no login cookie');
    }

    // no good cookie
    setCurrentUser(null, null, true);
  }

  /*
   *  Place the current user details and access token in a cookie,
   *  so the next page we go to knows who are logged in as.
   */
  function setCookieFromCurrentUser() {

    if (_currentUser) {

      // Create a new object here, but not with all the details
      var obj = {
        //user: _currentUser,
        user: {
          id: _currentUser.id,
          full_name: _currentUser.full_name,
          avatar: _currentUser.avatar,
          user: {
            user_first_name: _currentUser.user.user_first_name,
            user_last_name: _currentUser.user.user_last_name
          }
          //userZ: _currentUser
        },
        ttuat: _ttuat
      }
      setCookie(LOGIN_DETAILS_COOKIE_NAME, JSON.stringify(obj), LOGIN_TIMEOUT_DAYS);
    } else {
      // Remove the cookie
      setCookie(LOGIN_DETAILS_COOKIE_NAME, null, 0);
    }
  }

  function getCurrentUser() {

    if (_currentUser) {
      // Create a new object, so external code can't hack our values here.
      var details = {
        //ttuat: _currentUser.ttuat,
        id: _currentEntityId,
        firstname: _currentUser.firstname,
        lastname: _currentUser.lastname,
        avatar: _currentUser.avatar
      };
      return details;
    } else {

      // No current user
      return null;
    }
  }

  function setCurrentUser(user, ttuat, fromCookie) {
    //console.log();
    console.log('setCurrentUser(): ttuat=' + ttuat + ', user=', user)

    // Change the current user.
    var oldCurrentUser = _currentUser;
    if (user) {
      //console.log('Setting _currentUser to ', user);

      // // If relationships are loaded, sort the summey
      // if (user.relationshipSummary) {
      //   var arrayOfFriends = user.relationshipSummary.hasFriend
      //   arrayOfFriends.sort(sortRelationshipSummaryByFullname)
      //
      //   // Short those who have friended me
      //   var arrayOfFriendedBy = user.relationshipSummary.isFriendedBy;
      //   arrayOfFriendedBy.sort(sortRelationshipSummaryByFullname)
      // }
      _currentUser = user;
      _currentEntityId = user.id;
      if (ttuat) {
        _ttuat = ttuat;
      }

      setCookieFromCurrentUser();
      $('.authservice-logged-in').show();
      $('.authservice-logged-out').hide();
      $('.authservice-current-user-firstname').text(user.user.user_first_name);
      $('.authservice-current-user-lastname').text(user.user.user_last_name);
      $('.authservice-current-user-avatar').attr('src', user.avatar).show();

      if (_onUserChange) { // && oldCurrentUser==null) {
        (_onUserChange)(user, fromCookie);
      }
    } else {

      // No longer logged in
      _currentUser = null;
      _currentEntityId = -1;
      _ttuat = null;
      setCookieFromCurrentUser();
      //setCookie(LOGIN_DETAILS_COOKIE_NAME, null, LOGIN_TIMEOUT_DAYS);
      $('.authservice-logged-in').hide();
      $('.authservice-logged-out').show();
      $('.authservice-current-user-firstname').text('');
      $('.authservice-current-user-lastname').text('');
      $('.authservice-current-user-avatar').attr('src', '').hide();
      if (_onUserChange) { // && oldCurrentUser != null) {
        var fromCookie = false;
        _onUserChange(null, fromCookie);
      }
    }
  }


  /*
  *  Set a cookie in the browser, for the entire site.
  */
  function setCookie(cname, cvalue, exdays) {
    //console.log('setCookie(' + cname + ', ' + cvalue + ')');
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }// setCookie()


  /*
  *  Get a cookie from the browser.
  */
  function getCookie(cname) {
    //console.log('getCookie(' + cname + ')')
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        //console.log('- found cookie')
        return c.substring(name.length, c.length);
      }
    }
    //console.log('- no cookie with this name')
    return "";
  }// getCookie()




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



  /**
  ***
  ***   Now comes the actual object used by the application.
  ***
  ***/
  return {

    setCookie: setCookie,
    getCookie: getCookie,
    getCurrentUser: getCurrentUser,

    // admin_getUser: function(params, callback/*(err, user)*/) {
    //   authserviceApi.internal_admin_getUser(params).then(function(result){
    //     return callback(result);
    //   });
    // },

    init: function init(options) {
      console.log('authservice.init()')

      /*
      *  Check the input parameters.
      */
      var host = options.host ? options.host : 'authservice.io';
      var port = options.port ? options.port : 80;
      var version = options.version ? options.version : 'v1';
      var APIKEY = options.tenant;
      ENDPOINT = 'http://' + host + ':' + port + '/' + version + '/' + APIKEY;
      //console.log('endpoint = ' + ENDPOINT);


      if (options.onUserChange) {
        _onUserChange = options.onUserChange;
      }


      // In pretend mode, we use hard coded usernames
      _pretend = (options.pretend) ? true : false;

      // See if we are currently logged in, based on the browser cookie.
      setCurrentUserFromCookie();


      /*
       *  Set up nice callbacks for buttons, etc.
       */
      $('#authservice-login-button').click(function(){
        $('#authservice-login-div').show();
        $('#authservice-forgot-div').hide();
        $('#authservice-register-div').hide();
        return false;
      });


      $('#authservice-forgot-button').click(function(){
        $('#authservice-login-button').hide();
        $('#authservice-login-div').hide();
        $('#authservice-forgot-div').show();
        $('#authservice-register-button').hide();
        $('#authservice-register-div').hide();
        return false;
      });



      $('#authservice-register-button').click(function(){
        $('#authservice-login-button').hide();
        $('#authservice-login-div').hide();
        $('#authservice-forgot-button').hide();
        $('#authservice-forgot-div').hide();
        $('#authservice-register-div').show();
        return false;
      });



      $('#authservice-forgot-cancel').click(authservice.resetLoginMenu);
      $('#authservice-forgot-ok').click(authservice.resetLoginMenu);
      $('#authservice-register-cancel').click(authservice.resetLoginMenu);
      $('#authservice-register-ok').click(authservice.resetLoginMenu);



      $('#authservice-logout-button').click(function(){
        setCurrentUser(null, null);
        authservice.resetLoginMenu();
        return false;
      });




      $('#authservice-login-submit').click(function() {
         var username = $('#authservice-login-username').val();
         var password = $('#authservice-login-password').val();
         //				alert('login(' + username + ', ' + password + ')');

         authservice.login(username, password, function(user){
           // Success
           authservice.resetLoginMenu();
         }, function() {
           // Fail
           $('#authservice-login-errmsg').show();
         })

      });


      $('#authservice-forgot-submit').click(function() {
        var username = $('#authservice-forgot-username').val();
        alert('forgot(' + username + ')');

        // Try to login
        var success = false;
        if (username == 'ok') success = true;
        if (success) {
          // Forward to some other page, or redraw this page
          $('#authservice-forgot-email2').val(username); // redisplay the email
          $('#authservice-forgot-button').hide();
          $('#authservice-forgot-div').hide();
          $('#authservice-forgot-done').show();
          return false;

        } else {
          // We don't tell the user if they have entered
          // and incorrect email address, as it could be used
          // by nasty people to fish for email addresses.
          // An error here indicates some sort of system error.
          $('#authservice-forgot-errmsg').show();
          return false;
        }
      });



      $('#authservice-register-submit').click(function() {
        var username = $('#authservice-register-username').val();
        var password = $('#authservice-register-password').val();
        alert('register(' + username + ', ' + password + ')');

        // Try to login
        var success = false;
        if (password == 'ok') success = true;
        if (success) {
          // Display the sucess message
          $('#authservice-register-button').hide();
          $('#authservice-register-div').hide();
          $('#authservice-register-done').show();
          return false;
        } else {
          // Display an error message
          $('#authservice-register-errmsg').show();
          return false;
        }
      });//- click
    },// init()


    login: function login(username, password, successCallback, failCallback) {

      // If we are pretending, get the user details now.
      if (_pretend) {
        console.log('seems we are pretending')
        var user = getDummyUser(username);
        setCurrentUser(user, null);
        //console.log('logged in now as', _currentUser);
        //authservice.resetLoginMenu();
        return successCallback(user);
      }

      /*
       *  Not pretending.
       *  Call the server to authenticate the username/password.
       */
      var params = {
        username: username,
        password: password
      };
      authservice_ajax_call('/login', params, null, function(response) {

          if (response.status == 'ok') {
            // Logged in.
            var user = response.identity
            var ttuat = response.ttuat;
            setCurrentUser(user, ttuat);
            return successCallback(user);
          } else {
            // Display an error message
            //$('#authservice-login-errmsg').show();
            return failCallback();
          }
      });
    },


    reloadUser: function reloadUser(callback) {
      console.log('reloadUser');
      if (_currentUser) {

        if (_pretend) {
          console.log('reloading dummy data')
          var user = getDummyUser(_currentUser.username);
          setCurrentUser(user);
          return callback(user);
        }


        // Get the current user from the database again
        var params = {
          entityId: _currentEntityId,
          needRelationships: true,
          needProperties: true
        };
        authservice_ajax_call('/admin/getUser', params, null, function(users) {
          //console.log('back from reload ', users)
          var user = (users.length > 0) ? users[0] : null;
          var fromCookie = false;
          setCurrentUser(user, null, fromCookie);
          if (callback) {
            callback(user)
          }
        });
      } else {

        // There is no current user
        setCurrentUser(null, null);
        if (callback) {
          callback(null);
        }
      }
    },// reloadUser



    /*
     *  Reset the login menu.
     */
    resetLoginMenu: function resetLoginMenu() {
      $('#authservice-login-button').show();
      $('#authservice-login-div').show();
      $('#authservice-forgot-button').show();
      $('#authservice-forgot-div').hide();
      $('#authservice-forgot-ok').hide();
      $('#authservice-register-button').show();
      $('#authservice-register-div').hide();
      $('#authservice-register-ok').hide();

      // Clear the username and password fields
      $('#authservice-login-username').val('');
      $('#authservice-login-password').val('');
      $('#authservice-forgot-username').val('');
      $('#authservice-register-username').val('');
      $('#authservice-register-password').val('');


      // hide the menu
      // $('#authservice-user-dropdown').dropdown('toggle');
      $('#authservice-user-dropdown').parent().removeClass('open');
      // $('[data-toggle="dropdown"]').parent().removeClass('open');
      return true;
    },


    getUser: function getUser(params, callback/*(user)*/) {
      console.log('getUser()');
      authservice_ajax_call('/admin/getUser', params, null, callback);
    }, //getUser


    /*
     *  Create a new auth_relationship
     */
    addRelationship: function addRelationship(params, callback/*(result)*/) {
      console.log('addRelationship()');
      authservice_ajax_call('/admin/addRelationship', params, null, callback);
    },// addRelationship


    /*
     *  Remove an auth_relationship
     */
    removeRelationship: function removeRelationship(params, callback/*(result)*/) {
      console.log('removeRelationship()');
      authservice_ajax_call('/admin/removeRelationship', params, null, callback);
    },// addRelationship



    /*
     *  Create a new auth_property
     */
    addProperty: function addProperty(params, callback/*(result)*/) {
      console.log('addProperty()');
      authservice_ajax_call('/admin/addProperty', params, null, callback);
    },// addRelationship


    /*
     *  Remove an auth_property
     */
    removeProperty: function removeProperty(params, callback/*(result)*/) {
      console.log('removeProperty()');
      authservice_ajax_call('/admin/removeProperty', params, null, callback);
    },// addRelationship


    nocomma: null


  };//- object

})(); // authservice


//tta2.init('http://localhost:9090', 'nodeclient');
//tta2.init('http://127.0.0.1:9090', 'nodeclient');
