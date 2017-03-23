
var LOCAL_DEPLOYENT = true;
var STORE_ID = 6;

// Authservice-related
if (LOCAL_DEPLOYENT) {
  var AUTHSERVICE_HOST = 'localhost';
  var AUTHSERVICE_PORT = 9090;

} else {
  var AUTHSERVICE_HOST = 'dcdev.authservice.io';
  // var AUTHSERVICE_PORT = 443;
  var AUTHSERVICE_PORT = 80;
}
var AUTHSERVICE_TENANT = 'nodeclient';
var AUTHSERVICE_USE_DUMMY_LOGIN = false;



// Crowdhound-related
if (LOCAL_DEPLOYENT) {
  var CROWDHOUND_HOST = 'localhost';
  var CROWDHOUND_PORT = 4000;
} else {
  //var CROWDHOUND_HOST = 'ttcf-ch-alb-ch4dc-8064752.ap-southeast-1.elb.amazonaws.com';
  var CROWDHOUND_HOST = 'dcdev.crowdhound.io';
  //var CROWDHOUND_PORT = 443;
  var CROWDHOUND_PORT = 80;
}
var CROWDHOUND_VERSION = "2.0";
var CROWDHOUND_TENANT = 'drinkpoint';



// Teaservice-related
if (LOCAL_DEPLOYENT) {
  var TEASERVICE_HOST = 'localhost';
  var TEASERVICE_PORT = 3000;
} else {
  //var TEASERVICE_HOST = 'ttcf-tea-alb-tea4dc-841762890.ap-southeast-1.elb.amazonaws.com';
  var TEASERVICE_HOST = 'dcdev.teaservice.io';
  //var TEASERVICE_PORT = 443;
  var TEASERVICE_PORT = 80;
}
var TEASERVICE_ACCESS_TOKEN = '0613952f81da9b3d0c9e4e5fab123437';
var TEASERVICE_VERSION = '2.0.0';
