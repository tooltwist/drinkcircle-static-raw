function findUrls( text ){
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    // Regular expression to find FTP, HTTP(S) and email URLs.
    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    // Iterate through any URLs in the text.
    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    return urlArray;
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function sendEmailNotification(ownerUserId, userId, type, elementId){
    jQuery.ajax({
        type : 'POST',
        url: location.href,
        data: {
            op : 'drinkpoint_widgets.requestHandlers.crowdhound',
            subop : 'sendEmailNotification',
            ownerUserId : ownerUserId,
            userId : userId,
            type : type,
            elemId : elementId
        },
        success: function(data) {
            
        }
    });
}

function userNotLoggedInNotification(){
    /*bootbox.alert({message : "You need to be logged in to perform that action.", 
                   buttons : {
                       ok : {label: "Continue to Facebook"}, 
                   	   callback : function(){
                       		location.href="/ttsvr/n/ttauth2_login_facebook"
                   	    } 
                   } 
    });*/
    
    bootbox.confirm({
    	message: "You need to be logged in to perform that action. Would you like to login?",
    	buttons: {
            confirm: {
                label: 'Continue with Facebook',
                className: 'btn-primary'
            }
            
    	},
        callback: function (result) {
            if(result){
                location.href = "/ttsvr/n/ttauth2_login_facebook";
            }
        }
});
    
}

function cookAvatars(params, selection, callback){
    console.log('cook_avatars()');
    var ids = '';
    var sep = '';
    var elements = [ ];
    var users = [ ];
    CrowdHound.traverse(selection, function cookPost(level, element, parent, next) {

        // Called for each element in the hierarchy.

        elements.push(element);
        if(users[element.user.userId] == null){
            ids += sep + element.user.userId;
            sep = ',';
            users[element.user.userId] = element.user;
        }

        return next(null);

    }, function(){

        $.ajax({
            type : 'POST',
            url: location.href,
            data: {
                op : 'drinkpoint_widgets.requestHandlers.crowdhound',
                subop : 'getPrimaryPhotos',
                ids : ids
            },
            success: function(data) {

                if(data.status =='success'){
                    //alert(data.primaryPhotos);
                    var primaryPhotos = $.parseJSON(data.primaryPhotos);
                    var reply =[ ];
                    for(index in primaryPhotos){
                        reply[primaryPhotos[index].ttauth_id] = primaryPhotos[index];
                    }

                    //apply it to all elements
                    for (var i = 0; i < elements.length; i++) {
                        var element = elements[i];
                        if(reply[element.user.userId] != null){
                            element.user.firstName = reply[element.user.userId].firstname;
                            element.user.lastName = reply[element.user.userId].lastname;
                            if(reply[element.user.userId].url != null && reply[element.user.userId].url != "null"){
                                element.user.avatar = reply[element.user.userId].url;
                            }
                            element.user.communityPage = location.protocol+'//'+location.host+'/ttsvr/member/'+reply[element.user.userId].hashId;
                            element.user.shareLink = location.protocol+'//'+location.host+'/ttsvr/post/'+reply[element.user.userId].hashId;

                        }
                    }
                }
                //cooking finished;
                callback();
            }
        });

    }); //end of traverse

}