
var LOCAL_DEPLOYENT = true;
var STORE_ID = 6;

// Authservice-related
if (LOCAL_DEPLOYENT) {

  // Local Authservice
  var AUTHSERVICE_HOST = 'localhost';
  var AUTHSERVICE_PORT = 9090;
  var AUTHSERVICE_TENANT = 'nodeclient';
  var AUTHSERVICE_USE_DUMMY_LOGIN = false;

  // Local Crowdhound
  var CROWDHOUND_HOST = 'localhost';
  var CROWDHOUND_PORT = 4000;
  var CROWDHOUND_VERSION = "2.0";
  var CROWDHOUND_TENANT = 'drinkpoint';

  // Local TEAservice
  var TEASERVICE_HOST = 'localhost';
  var TEASERVICE_PORT = 3000;
  var TEASERVICE_ACCESS_TOKEN = '0613952f81da9b3d0c9e4e5fab123437';
  var TEASERVICE_VERSION = '2.0.0';

} else {
  var REMOTE_PREFIX = 'dcdev';
  var REMOTE_PREFIX = 'dcmvp';
  var REMOTE_PREFIX = 'ratdev';

  // Authservice
  var AUTHSERVICE_HOST = REMOTE_PREFIX + '.authservice.io';
  var AUTHSERVICE_PORT = 80;
  var AUTHSERVICE_TENANT = 'nodeclient';
  var AUTHSERVICE_USE_DUMMY_LOGIN = false;

  // Crowdhound
  var CROWDHOUND_HOST = REMOTE_PREFIX + '.crowdhound.io';
  var CROWDHOUND_PORT = 80;
  var CROWDHOUND_VERSION = "2.0";
  var CROWDHOUND_TENANT = 'drinkpoint';

  // TEAservice
  var TEASERVICE_HOST = REMOTE_PREFIX + '.teaservice.io';
  var TEASERVICE_PORT = 80;
  var TEASERVICE_ACCESS_TOKEN = '0613952f81da9b3d0c9e4e5fab123437';
  var TEASERVICE_VERSION = '2.0.0';
}

// Image handling variables
const CLOUDINARY_CLOUD_NAME = 'twist-resources';


// A few system-wide constants
const CATEGORY_RED = 1;
const CATEGORY_WHITE = 2;
const CATEGORY_BEER = 3;
const CATEGORY_SPIRITS = 4;
const CATEGORY_BUBBLES = 5;
const CATEGORY_CIDER = 6;
const CATEGORY_ORGANIC = 7;
const CATEGORY_OTHER = 8;
const CATEGORY_FORTIFIED = 13;
const CATEGORY_DESSERT = 14;
const CATEGORY_LIQUEUR = 15;
