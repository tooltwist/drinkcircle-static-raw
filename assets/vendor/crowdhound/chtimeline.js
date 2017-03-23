var TimelinePost = (function() {
    var AUTHSERVICE_TTUAT = null;
    var AUTHSERVICE_USERID = null;

    var CHConfig = function(){
        var serverUrl = "http://"+CROWDHOUND_HOST+":"+CROWDHOUND_PORT,
        apiVersion = CROWDHOUND_VERSION,
        tenant = CROWDHOUND_TENANT,
        port = CROWDHOUND_PORT,
        apiUrl = [serverUrl, "api", apiVersion, tenant].join("/");

        return {
            SERVER_URL: serverUrl,
            API_VERSION: apiVersion,
            TENANT_NAME: tenant,
            API_URL: apiUrl,
            SERVER_PORT : port
        }
    }();

    return {

        init: function(userIdForPage, userIdsForWall) {
          console.log('-------------------------------------');
          console.log('TimelinePost(' + userIdForPage + ', ' + userIdsForWall + ')');
          //serverUrl : '//' + CROWDHOUND_HOST + ':' + CROWDHOUND_PORT,
          //apiVersion : CROWDHOUND_VERSION,
          //tenantId : CROWDHOUND_TENANT,
          //   var host = CROWDHOUND_HOST;
            // var port = CHConfig.SERVER_PORT;
        	// var tenant = CHConfig.TENANT_NAME;
        	//var ttuat = Login_config.getCurrentUser().ttuat;

			//var _curiaUrl;
			// Prepare the configuration for Curia
          //var serverUrl = 'http:' + host;
          //var serverUrl = host;
        	//var apiVersion = '2.0'

        	//console.log("_curiaUrl=" + CHConfig.API_URL + ".");

          var curiaConfig = {
            // serverUrl : "http://"+CROWDHOUND_HOST+":"+CROWDHOUND_PORT,
            // //serverUrl : CHConfig.SERVER_URL,
            // apiVersion : CROWDHOUND_VERSION,
            // tenantId : CROWDHOUND_TENANT,
            // debug: false,

            serverUrl : '//' + CROWDHOUND_HOST + ':' + CROWDHOUND_PORT,
            apiVersion : CROWDHOUND_VERSION,
            tenantId : CROWDHOUND_TENANT,
            debug: false,



            authenticationToken: authservice.getUserAccessToken(),
            //			development_userId : development_userId,
            //                authenticationToken : ttuat,
            urlive : false,
            flat: false,
            textonly: false,
            cookers: {
              cook_post : TimelinePost.cookPost,
              cook_likes : TimelinePost.cookLikes,
              //cook_avatars : cookAvatars
            },
            themes : {
              "timeline": {
                "community-page-user_0" : "#timelineList",
                //"wrapper" : "#timelineList",
                "post_0" : "#timelinePost",
                "comment_0" : "#timelinePostComment"
              }

            }
          };


          // initialize curia
          CrowdHound.init(curiaConfig, function afterCuriaInit() {
            AUTHSERVICE_TTUAT = authservice.getUserAccessToken();
            AUTHSERVICE_USERID = authservice.getCurrentUser().id;


            // Make sure we have a parent element per page
            var url = CHConfig.API_URL + "/thread/$community-page-user-"+AUTHSERVICE_USERID+"?newAnchorType=community-page-user";
            $.ajax({
              url: Curia.addAuthenticationToken(url),
              dataType: 'json',
            });



            TimelinePost.loadPost(userIdForPage, userIdsForWall);
            //TimelinePost.getFriendsPosts();

            //show or hide postComposer
            //check if user is logged in
            if (authservice.getCurrentUser() == null || (authservice.getCurrentUser().id != getUserId())){

              $("#postComposer").remove();

            }else{
              $("#postComposer").show();
            }

            $(document).on('keydown', '.comment .input-group input', function(event){
              if(event.keyCode == 13){
                $(this).siblings('.input-group-addon').find('a').trigger('click');
              }
            });
          });
        }, //end of init





      loadPost: function(userIdForPage, userIdsForWall) {
        console.log('loadPost(' + userIdForPage + ', ' + userIdsForWall + ')');

        //var userId = $('#timeLineOwnerTtauthId').val();
        //var userId = getUserId();//Login_config.getCurrentUser().userId;
        //var params = {};
        //var elementId = $('#eid').val();

        /*
        var getFriendIds = (function() {
          var method = 'op=drinkpoint_widgets.requestHandlers.userTimeline&subop=getFriendsIds';
          var customerIdStr = $('#customerId').val();

          var friendIds = null;
          $.ajax({
            async : true, // http://stackoverflow.com/a/29146183/1350573
            type : 'POST',
            url :  location.href.replace("#","")+"?"+method,
            data : {
              customerIdStr : customerIdStr
            },
            success: function(data) {
              if(data.status === "success"){
                var idList = data.friendIds;
                friendIds= idList.substring(1, idList.length - 1);
              }
            }
          });
          console.log('friendIds:' + friendIds);
          return friendIds;
        })();
        */



        // if (elementId != null && elementId != ''){
        //   params = {
        //     elementId : elementId,
        //     type : 'post',
        //     withChildren : true
        //   };
        // } else {
          //var friendIds = getFriendIds;
          console.log('friends are: '+userIdsForWall);
          params = {
            //user: userId, //friendIds.length<1? 0: friendIds,  //passing empty friend ids fetches all results so set to 0 to fetch none instead
            user: userIdsForWall,
            type: 'post',
            withChildren : true,
            //deleted : 0,
          };
        // }
        console.log('params=', params);

        CrowdHound.select(params, function(err, selection){
          console.log('after select:', err, selection);
          if (err) {
            console.log('Error during select: ', err);
            return;
          }

          if (selection.elements.length > 0){
            //cook the data 1st
            CrowdHound.cook({ }, selection, function(err, selection) {
              console.log('after cooking:', err, selection);
              if (err) {
                console.log('Error during cook: ', err);
                return;
              }

              // Now display the data
              CrowdHound.render({
                target: '#timelineSection',
                theme: 'timeline'
              }, selection, function(err, selection) {
                if (err) {
                  console.log('Error during display: ', err);
                  return;
                }
                console.log('finished rendered' + selection);

                //init 3rd party plugins
                //TimelinePost.initMagnificPopUp(selection);
                //FB.XFBML.parse() //FB share button init

              });// render
            });// cook
          }// length > 0


        });
      },







        post : function(){
            //check which action to do (post status, photos, events, etc ...)

            if(TimelineUpload.uploadedFiles.length > 0){
                 TimelineUpload.savePhotosVideos();
            }else{
                TimelinePost.postMessage();
            }

        },

        postMessage : function(){
            var message = $('#postMessage').val();

            if(message && message != ''){
                var url = CrowdHound.addAuthenticationToken(CHConfig.API_URL + '/element');
                var userId = AUTHSERVICE_USERID;

                var data = {
					"type" : "post",
                    "rootId" : "$community-page-user-"+userId,
                    "parentId" : "$community-page-user-"+userId,
                    "description" : message,
                    //"anchor" : 'community-page-post-'+userId,
                    "deleted" : 0
                };

                $.ajax({
                    type : "POST",
                    url : url,
                    data : data,
                    success : function(messageResponse) {
                        if (messageResponse
                            && messageResponse.status
                            && messageResponse.status === "ok") {

                            //check message for any url links
                            //var urls = findUrls(message);
                            //if(urls.length == 1){
                                //found a url now we save an element
                            //    TimelinePost.savePostElement(messageResponse.elementId, urls[0]);
                            //}else{
                                //just post the message
                                TimelinePost.manualRenderPost(messageResponse.elementId, '#timelineSection');
                            //}

                            //clear textarea
                            $('#postMessage').val('');

                        } else {
                            //Alerts.showStandardError(".textarea");
                        }
                    },

                    error : function(qXHR, textStatus, errorThrown) {
                        console.log('An error occurred while posting.\n  status: ' + qXHR.status + "\n  responseText: ", qXHR.responseText);
                        //Alerts.showStandardError(".textarea");
                    }
                });

            }

        },


        deletePost : function(id, parent, root){
          alert('BAD URL 1');
            var userId = AUTHSERVICE_USERID;
            var params = {};
            var method = 'op=drinkpoint_widgets.requestHandlers.userTimeline&subop=deletePost'
				console.log("test delete");

                $.ajax({
                    type : 'POST',
                    url :  location.href.replace("#","")+"?"+method,
                    data : {
                        elementId: id,
                        authenticationToken : AUTHSERVICE_TTUAT,
                        parentId : parent,
                        rootId : root,
                    },
                    success: function(data) {
                        if(data.status === "success"){
                            console.log(data.status);
                            $('div[data-post-id='+id+']').remove();

                        }

                    }
                });


        },





        cookPost: function (params, selection, callback) {
          //alert('invoked cooker');
          CrowdHound.traverse(selection, function cookPost(level, element, parent, next) {

            var message = element.description;

            if(element.children.length > 0){

              for (i = 0; i < element.children.length; i++) {
                var childElement = element.children[i];
                if (childElement.type === 'externalLink'){

                  var jsonData = jQuery.parseJSON(childElement.description);
                  element.htmlLinkPost = TimelinePost.constructPostLinkHTML(jsonData);
                  element.description = "";
                  break;
                }
                else if(childElement.type === 'externalVideo'){
                  element.description = childElement.description;
                  break;
                }
                else if (childElement.type === 'uploadedPhotos'){
                  var imageJsonArray = jQuery.parseJSON(childElement.description);
                  element.htmlLinkPost = TimelinePost.constructPostPhotosHTML(element.id, imageJsonArray);
                }

              }

            }

            return next(null);

          }, callback);

        },// cookPost

        constructPostLinkHTML: function(data) {
          var html = "<div class='shared'>"+
          "	<img src='"+data.image+"' alt=''>"+
          "    <div class='caption'>"+
          "         <div class='input-group'>"+
          "        	<span class='form-control'>"+
          "        		<a href='"+data.redirectUrl+"' target='_blank'><strong>"+data.title+"</strong></a>"+
          "        		<br>"+ data.description +
          "        	</span>"+
          "        </div>"+
          "    </div>"+
          "</div>";

          return html;
        },// constructPostLinkHTML



        constructPostPhotosHTML : function(parentId, data){
        	var totalNumberPhotos = data.length;
            var firstToSecondCol = 12;
            var thridToFifthCol = 12;

            //determine the Col computation base on number of post photos
            if(totalNumberPhotos >= 2){
            	firstToSecondCol = 6;
            }

            if(totalNumberPhotos >= 5){
            	thridToFifthCol = 4;
            }else if (totalNumberPhotos == 4){
            	thridToFifthCol = 6;
            }

            var html = "<div class='post'>";
            html += "    <div id='post-photo-"+parentId+"' class='row photos'>";

            for (var index = 0; index < data.length; index++){
            	if((index + 1) == 1 || (index + 1) == 2){
            		//first 2 photos
            		html += "        <div class='col-md-"+firstToSecondCol+" col-sm-"+firstToSecondCol+" col-xs-"+firstToSecondCol+" prev'><a href='"+data[index]+"'><img src='"+data[index]+"' style='width: 100%;'></a></div>";
            	}else if ((index +1) == 3 || (index +1) == 4 || (index +1) == 5){
            		html += "        <div class='col-md-"+thridToFifthCol+" col-sm-"+thridToFifthCol+" col-xs-"+thridToFifthCol+" prev'><a href='"+data[index]+"'><img src='"+data[index]+"' style='width: 100%;'></a>";

            		if((index +1) == 5 && totalNumberPhotos > 5){
            			html+= "<div class='more-photos'>+"+(totalNumberPhotos - 5)+"</div>";
            		}
            		html+="</div>";
            	}else{
            		html += "        <div style='display:none'><a href='"+data[index]+"'<img src='"+data[index]+"' style='width: 100%;'></a></div>";
            	}
            }
            html += "   </div>";
            html += "</div>";
            return html;
        },

        savePostElement : function(elementId, url){
          alert('BAD URL 2');
            $.ajax({
                type : 'POST',
                url : '?op=drinkpoint_widgets.requestHandlers.crowdhound&subop=saveMetaData',
                data : {
                    u: url,
                    pid : elementId,
                    token : AUTHSERVICE_TTUAT
                },
                success: function(data) {
                    TimelinePost.manualRenderPost(elementId, '#timelineSection');

                }
            });


        },// savePostElement



        manualRenderPost : function(elementId, htmlElementSelector){
          //insert blank div element at the top of #timelineSection
          $(htmlElementSelector).prepend('<div></div>');
          CrowdHound.select({elementId : elementId ,withChildren: true}, function (err, selection){
            if(selection.elements.length > 0){
              //cook the data 1st
              CrowdHound.cook({ }, selection, function(err, selection) {
                // Now display the data
                CrowdHound.render({
                  target: htmlElementSelector+' div:first',
                  theme: 'timeline'
                }, selection, function(err, selection) {
                  if (err) {
                    console.log('Error during display: ', err);
                    return;
                  }
                  console.log('finished rendered' + selection);

                  //init 3rd party plugins
                  //TimelinePost.initMagnificPopUp(selection);
                  //FB.XFBML.parse();

                });// render
              });// cook
            } // length > 0
          });// select
        },// manualRenderPost




        toogleComment : function(elementId){
            $('#comment-'+elementId).toggle();
            $('#comment-'+elementId).find('div.input-group input').focus();
        },


        commentOnAPost : function(parentId){
          alert('commentOnAPost');
            var comment = $('#comment-'+parentId).find('div.input-group input').val();

            if(comment && comment != ''){
                var url = CrowdHound.addAuthenticationToken(CHConfig.API_URL + '/element');
                var userId = AUTHSERVICE_USERID;

                var data = {
          					"type" : "comment",
                    "rootId" : parentId,
                    "parentId" : parentId,
                    "description" : comment,
                };

                /*
                "type" : "post",
                "rootId" : "$community-page-user-"+userId,
                "parentId" : "$community-page-user-"+userId,
                "description" : message,
                //"anchor" : 'community-page-post-'+userId,
                "deleted" : 0
                */

                $.ajax({
                    type : "POST",
                    url : url,
                    data : data,
                    success : function(messageResponse) {
                        if (messageResponse
                            && messageResponse.status
                            && messageResponse.status === "ok") {
                            var elementId = messageResponse.elementId;
                            TimelinePost.manualRenderPost(elementId, '#comments-'+parentId);

                            //clear textarea
                            $('#comment-'+parentId).find('div.input-group input').val('');
                            TimelinePost.toogleComment(parentId);

                            //send notification via email to the owner of the post
                            var type="commented";
                            var ownerUserId = $('#comment-'+parentId).parents('.timeline:eq(0)').attr('data-owner-id');

                            sendEmailNotification(ownerUserId, userId, type, parentId);

                        }
                    },

                    error : function(qXHR, textStatus, errorThrown) {
                        console.log('An error occurred while posting.\n  status: ' + qXHR.status + "\n  responseText: ", qXHR.responseText);
                        //Alerts.showStandardError(".textarea");
                    }
                });

            }
        },




        like: function(parentId, score){
            var userId = AUTHSERVICE_USERID;

       		var	aggregationElementId = parentId;
       		var	voteElementId = parentId;
       		var	aspect = 'like';
       		var	rating = score;

            CrowdHound.saveVote(aggregationElementId, voteElementId, aspect, rating, null, function(err) {

                var likesCount = parseInt($('#post-likes-counter-'+parentId).html());
                if(likesCount == 0){
                    $('#post-likes-'+parentId).show();
                }

                if(score == 1){
                    likesCount = likesCount + 1;
                    $('#post-like-anchor-'+parentId).attr('onclick', 'TimelinePost.like('+parentId+',0)');
                    $('#post-like-anchor-'+parentId).html('<i class="fa fa-heart"></i>Unlike');

                    //send notification via email to the owner of the post
                    var type="liked";
                    var ownerUserId = $('#comment-'+parentId).parents('.timeline:eq(0)').attr('data-owner-id');

                    sendEmailNotification(ownerUserId, userId, type, parentId);

                }else{
                    likesCount = likesCount - 1;
                    $('#post-like-anchor-'+parentId).attr('onclick', 'TimelinePost.like('+parentId+',1)');
                    $('#post-like-anchor-'+parentId).html('<i class="fa fa-heart"></i>Like');
                    if(likesCount <= 0){
                        $('#post-likes-'+parentId).hide();
                    }
                }

                var postCounterElement = $('#post-likes-counter-'+parentId);
                postCounterElement.fadeOut(300,function(){
                    postCounterElement.html(likesCount);
                    postCounterElement.fadeIn(300);
                });

                //return callback(err);
            });

            /*jQuery.ajax({
       			url :  CrowdHound.addAuthenticationToken(CHConfig.API_URL + "/vote"),
       			method : 'POST',
       			data : params,
                success : function(data, textStatus, xhr) {
                    if (xhr.status === 200) {
                        var likesCount = parseInt($('#post-likes-counter-'+parentId).html());
                        if(likesCount == 0){
                            $('#post-likes-'+parentId).show();
                        }

                        if(score == 1){
                            likesCount = likesCount + 1;
                            $('#post-like-anchor-'+parentId).attr('onclick', 'TimelinePost.like('+parentId+',0)');
                            $('#post-like-anchor-'+parentId).html('<i class="fa fa-heart"></i>Unlike');

                            //send notification via email to the owner of the post
                            var type="liked";
                            var ownerUserId = $('#comment-'+parentId).parents('.timeline:eq(0)').attr('data-owner-id');

                            sendEmailNotification(ownerUserId, userId, type, parentId);

                        }else{
                            likesCount = likesCount - 1;
                            $('#post-like-anchor-'+parentId).attr('onclick', 'TimelinePost.like('+parentId+',1)');
                            $('#post-like-anchor-'+parentId).html('<i class="fa fa-heart"></i>Like');
                            if(likesCount <= 0){
                                $('#post-likes-'+parentId).hide();
                            }
                        }

                        var postCounterElement = $('#post-likes-counter-'+parentId);
                        postCounterElement.fadeOut(300,function(){
                            postCounterElement.html(likesCount);
                            postCounterElement.fadeIn(300);
                        });
                        //$('#post-likes-counter-'+parentId).html(likesCount);




                    }
                }
   			});*/

        },
        cookLikes : function(params, selection, callback){
            console.log('cook_likes()');
            var ids = '';
            var sep = '';
            var posts = [ ]; // [ element ]
            CrowdHound.traverse(selection, function cookTopic(level, element, parent, next) {

                // Called for each element in the hierarchy.
                if (element.type != 'post' && element.deleted != 1) {
                    return next(null);
                }
                posts.push(element);
                ids += sep + element.id;
                sep = ',';
                //console.log('ids=' + ids);
                return next(null);
            }, function() {

                if(ids != ''){
                    // Called after traversal is finished (and we have the ids and elements).
                    //console.log('select with ids=' + ids)
                    TimelinePost.getLikesTotals(ids, 'like', function(reply) {
                        // reply is [ { elementId, num, total } ]
                        //console.log('votes reply is ', reply)

                        // Create an index of vote records
                        var index = [ ]; // elementId -> { elementId, num, total }
                        for (var i = 0; i < reply.length; i++) {
                            var rec = reply[i];
                            index[rec.elementId] = rec;
                        }

                        // Now patch the vote details into the topic elements.
                        for (var i = 0; i < posts.length; i++) {
                            var element = posts[i];
                            //console.log('have element ', element)
                            var vote = index[element.id];
                            //console.log('have vote ', vote)
                            if (vote) {
                                element.likes = vote.total;
                                if (element.likes > 1) {
                                    element.likePlural = true;
                                }
                            }
                        }

                        TimelinePost.getMyLikes(ids, 'post', function(reply) {

                            var index = [ ]; // elementId -> { elementId, num, total }
                            for (var i = 0; i < reply.length; i++) {
                                var rec = reply[i];
                                index[rec.elementId] = rec;
                            }

                            for (var i = 0; i < posts.length; i++) {
                                var element = posts[i];
                                element.liked = false;
                                for(var cnt = 0; cnt < reply.length; cnt++){
                                    if(element.id == reply[cnt].voteElementId && reply[cnt].score != 0){
                                        element.liked = true;
                                    }
                                }
                            }

                            // This cooker is finished.
                            return callback();

                        }, false); // getMyLikes

                        // This cooker is finished.
                        //return callback();

                    }, false);// getVoteTotals

                }else{
                    //nothing to cook just return;
                    return callback();
                }

            });// traverse
        },
        getLikesTotals : function(elementIds, type, callback, async) {
            if (elementIds != undefined) {
                CrowdHound.getVoteTotals(elementIds, type, function(err,result){
                    callback(result);
                });
                /*jQuery.ajax({
                    url :  CrowdHound.addAuthenticationToken(CHConfig.API_URL + "/vote/totals/" + elementIds + "/" + type),
                    async : async == undefined ? true : async,
                    success : function(data, textStatus, xhr) {
                        if (xhr.status === 200) {
                            callback(data);
                        }
                    }
                });*/
            } else {
                callback();
            }
        },
        getMyLikes : function(elementIds, type, callback, async) {
            if (type == undefined || type == 'post') {
                CrowdHound.getMyVotes(elementIds, function(err, result){
                    callback(result);
                });
                /*jQuery.ajax({
                    url :  CrowdHound.addAuthenticationToken(CHConfig.API_URL + "/votes/mine/" + elementIds),
                    async : async == undefined ? true : async,
                    success : function(data, textStatus, xhr) {
                        if (xhr.status === 200) {
                            callback(data);
                        }
                    }
                });*/
            } else {
                callback();
            }
        },

        postPhotosVideos : function (){
            var message = $('#postMessage').val();
            if(TimelineUpload.uploadedFiles.length > 0){
                var uploadedFiles = TimelineUpload.uploadedFiles;

                var files = '';
            	var sep = '';

                for(index in uploadedFiles){
                    files += sep + uploadedFiles[index];
                    sep = ',';
                }

                //start posting
                var url = CrowdHound.addAuthenticationToken(CHConfig.API_URL + '/element');
                var userId = AUTHSERVICE_USERID;

                var data = {
					"type" : "post",
                    "rootId" : "$community-page-user-"+userId,
                    "parentId" : "$community-page-user-"+userId,
                    "description" : message,
                    "anchor" : 'community-page-post-'+userId
                };

                $.ajax({
                    type : "POST",
                    url : url,
                    data : data,
                    success : function(messageResponse) {
                        if (messageResponse
                            && messageResponse.status
                            && messageResponse.status === "ok") {
                            TimelinePost.savePhotoElement(messageResponse.elementId,files);

                        } else {
                            //Alerts.showStandardError(".textarea");
                        }
                    },

                    error : function(qXHR, textStatus, errorThrown) {
                        console.log('An error occurred while posting.\n  status: ' + qXHR.status + "\n  responseText: ", qXHR.responseText);
                        //Alerts.showStandardError(".textarea");
                    }
                });

            }
        },
        savePhotoElement : function(elementId, files){
          alert('BAD URL 3');
            $.ajax({
                type : 'POST',
                url : '?op=drinkpoint_widgets.requestHandlers.crowdhound&subop=createPhotosCHElement',
                data : {
                    files: files,
                    pid : elementId,
                    token : AUTHSERVICE_TTUAT
                },
                success: function(data) {
                    TimelinePost.manualRenderPost(elementId, '#timelineSection');
                }
            });
        },
        initMagnificPopUp : function(selection){
        	//select all post that has a child type=uploadedPhotos
        	var elements = selection.elements;
        	for(index in elements){
        		if(elements[index].children.length > 0){
        			var element = elements[index];
        			var childElements = element.children;
        			for(childIndex in childElements){
        				var child = childElements[childIndex];
        				if(child.type == 'uploadedPhotos'){
        					console.log("found a post of photos initializing magnific popup... " +element.id);
        					//init magnific pop-up
                            $('#post-photo-'+element.id).magnificPopup({
 	                       		delegate: 'a',
 	                       		type: 'image',
 	                       		tLoading: 'Loading image #%curr%...',
 	                       		mainClass: 'mfp-img-mobile',
 	                       		gallery: {
 	                       			enabled: true,
 	                       			navigateByImgClick: true,
 	                       			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
 	                       		},
 	                       		image: {
 	                       			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
 	                       			titleSrc: function(item) {
 	                       				//return item.el.attr('title') + '<small>by Marsel Van Oosten</small>';
 	                       				return '';
 	                       			}
 	                       		}
                            });
        				}
        			}
        		}
        	}
        }
    }
}());

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function getUserId(){
    var userId = authservice.getCurrentUser().id; //use current Login user
    /*window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
        key = key.toLowerCase();
        if (key === 'userid') {
            userId = parseInt(value); // if userId is provided in the url use that instead
        }

        return userId;
    });*/
    var urlUserId = getUrlParameter("userId");
    if(urlUserId){
        userId = urlUserId;
    }
    return userId;
}

/* Script for photo upload
var TimelineUpload = (function() {

    var uploadedFiles = [];

    return {
        uploadedFiles: uploadedFiles,
        //methods for file uploads here!!!
        init : function(){
            $('#uploadPhotoVideos').dropzone({
                url : '?op=drinkpoint_widgets.requestHandlers.crowdhound&subop=uploadPhotosVideos',
                paramName: "file", // The name that will be used to transfer the file
  				maxFilesize: 12, // MB
                addRemoveLinks : true,
                removedfile : function (file) {
                     var photoObj = $.parseJSON(file.xhr.response);
                    for (index in uploadedFiles){
                        if (uploadedFiles[index] == photoObj.photo){
                            uploadedFiles.pop(index);
                            $(file.previewElement).remove();

                        }
                    }


                },
                success : function (file){

                    var photoObj = $.parseJSON(file.xhr.response);
                    uploadedFiles.push(photoObj.photo);
            	},

                canceled : function (file){
                    uploadedFiles = [];
                    $('.dz-preview.dz-processing.dz-image-preview').remove();
                    $(file.previewElement).remove();
                    this.emit("reset");
                }

            });

        },
        savePhotosVideos : function (){

            var files = '';
            var sep = '';

            for(index in uploadedFiles){
                files += sep + uploadedFiles[index];
                sep = ',';
            }

            if(files !=''){
                 jQuery.ajax({
                    type : 'POST',
                    url: location.href,
                    data: {
                        op : 'drinkpoint_widgets.requestHandlers.crowdhound',
                        subop : 'savePhotosVideos',
                        files : files
                    },
                    success: function(data) {
                        TimelinePost.postPhotosVideos();
						uploadedFiles = [];
                        $('.dz-preview.dz-processing.dz-image-preview').remove();
                        //Dropzone.forElement("#uploadPhotoVideos").removeAllFiles(true);
                    }
                 });
        	}
        }

    }
}());
*/
