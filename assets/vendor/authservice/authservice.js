var authservice = (function() {

  var COOKIE_NAME = 'authservice-user';
  var LOGIN_TIMEOUT_DAYS = 3;

  // Currently logged in user
  var _currentUser = null;


  // Are we simulating?
  var _pretend = false;

  // User callbacks
  var _onLoggedIn = null;
  var _onLoggedOut = null;



  function resetMenu() {
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
  }


  function getUserFromCookie() {
    var user = getCookie(COOKIE_NAME);
    //console.log('Cookie user is ' + user + '.');
    if (user) {
      var tmpUser = JSON.parse(user);
      //ZZZZZ Do a quick sanity check
      return tmpUser;
    } else {
      return null;
    }
  }


  function getCurrentUser() {

    if (_currentUser) {
      // Create a new object, so external code can't hack our values here.
      var details = {
        ttuat: _currentUser.ttuat,
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

  function setCurrentUser(user) {
    var oldCurrentUser = _currentUser;
    _currentUser = user;
    if (user) {
      //console.log('Setting _currentUser to ', user);

      setCookie(COOKIE_NAME, JSON.stringify(_currentUser), LOGIN_TIMEOUT_DAYS);
      $('.authservice-logged-in').show();
      $('.authservice-logged-out').hide();
      $('.authservice-current-user-firstname').text(user.firstname);
      $('.authservice-current-user-lastname').text(user.lastname);
      $('.authservice-current-user-avatar').attr('src', user.avatar).show();

      if (_onLoggedIn && oldCurrentUser==null) {
        (_onLoggedIn)(user);
      }
    } else {

      // No longer logged in
      setCookie(COOKIE_NAME, null, LOGIN_TIMEOUT_DAYS);
      $('.authservice-logged-in').hide();
      $('.authservice-logged-out').show();
      $('.authservice-current-user-firstname').text('');
      $('.authservice-current-user-lastname').text('');
      $('.authservice-current-user-avatar').attr('src', '').hide();
      if (_onLoggedOut && oldCurrentUser != null) {
        _onLoggedOut();
      }
    }
  }


  /*
  *  Set a cookie in the browser, for the entire site.
  */
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }// setCookie()


  /*
  *  Get a cookie from the browser.
  */
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }// getCookie()


  return {

    setCookie: setCookie,
    getCookie: getCookie,
    getCurrentUser: getCurrentUser,

    init: function init(params) {

      /*
      *  Check the input parameters.
      */
      var host = params.host ? params.host : 'authservice.io';
      var port = params.port ? params.port : 80;
      var ENDPOINT = 'http://' + host + ':' + port;
      var APIKEY = params.tenant;
      //console.log('endpoint = ' + ENDPOINT);

      if (params.onLoggedIn) {
        _onLoggedIn = params.onLoggedIn;
      }
      if (params.onLoggedOut) {
        _onLoggedOut = params.onLoggedOut;
      }

      // In pretend mode, we use hard coded usernames
      _pretend = (params.pretend) ? true : false;

      // See if we are currently logged in, based on the browser cookie.
      var user = getUserFromCookie();
      setCurrentUser(user);


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



      $('#authservice-forgot-cancel').click(resetMenu);
      $('#authservice-forgot-ok').click(resetMenu);
      $('#authservice-register-cancel').click(resetMenu);
      $('#authservice-register-ok').click(resetMenu);



      $('#authservice-logout-button').click(function(){
        setCurrentUser(null);
        resetMenu();
        return false;
      });




      $('#authservice-login-submit').click(function() {
        var username = $('#authservice-login-username').val();
        var password = $('#authservice-login-password').val();
        //				alert('login(' + username + ', ' + password + ')');

        // If we are pretending, get the user details now.
        if (_pretend) {

          if (username == 'bob') {
            var user = {
              ttuat: 901,
              firstname: 'Bob',
              lastname: 'Bloggs',
              avatar: 'http://localhost:3030/assets/images/activity/img_advisor_2.jpg'
            };

          } else if (username == 'jim') {

            var user = {
              ttuat: 902,
              firstname: 'Jim',
              lastname: 'Boots',
              avatar: 'http://localhost:3030/assets/images/activity/img_advisor_1.jpg'
            };
          } else if (username == 'jill') {

            var user = {
              ttuat: 903,
              firstname: 'Jill',
              lastname: 'Jones',
              avatar: 'http://localhost:3030/assets/images/activity/img_advisor_2.jpg'
            };
          } else {

            // Bad login - Display an error message
            setCurrentUser(null);
            $('#authservice-login-errmsg').show();
            return false;
          }

          console.log('logged in now as', _currentUser);

          setCurrentUser(user);
          resetMenu();
          return false;
        }

        // Call the server to authenticate the username/password.
        var url = ENDPOINT + '/v1/' + APIKEY + '/login';
        var data = {
          username: username,
          password: password
        };
        console.log('url is ' + url)
        console.log('data is ', data);

        var json = JSON.stringify(data)
        console.log('json is ', json);

        // Using CORS
        console.log('Using CORS');
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
            console.log( "JSON Data: ", response);
            if (response.status == 'ok') {
              // Logged in.
              // Forward to some other page, or redraw this page.
              var ttuat = response.ttuat;
              console.log('ttuat=' + ttuat);
              window.location = '/african.html';
              return true;
            } else {
              // Display an error message
              $('#authservice-login-errmsg').show();
              return false;
            }

          },
          error: function (jqxhr, textStatus, error ) {
            //alert("error");
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
            console.log('jqxhr=', jqxhr);
            console.log('textStatus=', textStatus);
            console.log('error=', error);
            alert('An error occurred while logging in. Please try again later.');
            return false;
          }
        });


        // Using JSONP
        /*
        console.log('Using JSONP');
        $.getJSON(url, data)
        .done(function( json ) {
        console.log( "JSON Data: ", json);
      })
      .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
    */
    return false;
    // Try to login
    var success = false;
    if (password == 'hello') success = true;
    if (success) {
      // Forward to some other page, or redraw this page
      window.location = '/african.html';
      return true;
    } else {
      // Display an error message
      $('#authservice-login-errmsg').show();
      return false;
    }
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
  });
},// init()

};
})();


//tta2.init('http://localhost:9090', 'nodeclient');
//tta2.init('http://127.0.0.1:9090', 'nodeclient');
