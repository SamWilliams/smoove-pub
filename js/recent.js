


function update_activities(){
  $.post("backend.php",{ "action": "recent_activity", "unix_timestamp": 0 }, function(xml) {
      var users = new Array();
      $(xml).find('activities').find('users').find('user').each(function() {
        users[$(this).find('user_id').text()] = $(this).find('username').text();
      });

      $(xml).find('activities').find('smooves').find('smoove').each(function() {
        var username = users[$(this).find('user_id').text()];
        var user_id = $(this).find('user_id').text();
        var active_id = $(this).find('active_id').text();
        var title = $(this).find('title').text();
        var post_id = $(this).find('post_id').text();
        var unix_timestamp = $(this).find('unix_timestamp').text();
        var onclickjs = "get_posts('post_id=" + post_id + "','#selectqueue',{'single_post':true});";

        if(!$('#' + unix_timestamp+'_'+active_id).length){
          //we aren't currently showing this item
          if(!$('li[name='+post_id+'_'+user_id+']').length){
            //no activity for this user+post... go ahead and insert new smoove
            $('#activity_list').prepend('<li class="smoove" onclick="'+onclickjs+'" id="'+unix_timestamp+'_'
            +active_id+'" name="'+post_id+'_'+user_id+'">'
            +'<img src="images\\smoove_icon.png" height="15px"/><b class="act_username">'
            +username+'</b> '+title+'</li>').fadeIn("slow");
            $('#'+unix_timestamp+'_'+active_id).hide().fadeIn("slow");
            
          }
          //element doesn't already exist, add it to the top
        }
      });

      $(xml).find('activities').find('comments').find('comment').each(function() {
        var username = users[$(this).find('user_id').text()];
        var user_id = $(this).find('user_id').text();
        var active_id = $(this).find('active_id').text();
        var title = $(this).find('title').text();
        var post_id = $(this).find('post_id').text();
        var unix_timestamp = $(this).find('unix_timestamp').text();
        //var onclickjs = 'parent.items.location=\'view.php?post_id=' + post_id + '\'';
        var onclickjs = "get_posts('post_id=" + post_id + "','#selectqueue', {'single_post':true});";

        if(!$('#' + unix_timestamp+'_'+active_id+'_'+user_id).length){
           if($('li[name='+post_id+'_'+user_id+'].comment').length){
            //a comment already exists. get the current count and add one to is, then add the comment
            var new_comment_id = unix_timestamp+'_'+active_id+'_'+user_id;
         
                $('#activity_list').prepend('<li class="comment" id="'
                +unix_timestamp+'_'+active_id+'_'+user_id+'" name="'+post_id+'_'+user_id+'" onclick="'+onclickjs+'">'
                +'<img src="images\\comment_small.png"/><b style="color:black">'
                +username+'</b> '+title+'</li>').fadeIn("slow");;
            
              $('#'+unix_timestamp+'_'+active_id+'_'+user_id).hide().fadeIn("slow");


          }else{
            //no comment from this user exists for this post. insert a new one.
            $('#activity_list').prepend('<li class="comment" id="'
              +unix_timestamp+'_'+active_id+'_'+user_id+'" name="'+post_id+'_'+user_id+'" onclick="'+onclickjs+'">'
            +'<img src="images\\comment_small.png"/><b style="color:black">'
              +username+'</b> '+title+'</li>').fadeIn("slow");
            $('#'+unix_timestamp+'_'+active_id+'_'+user_id).hide().fadeIn("slow");
          }
           if($('li[name='+post_id+'_'+user_id+'].smoove').length){
              $('li[name='+post_id+'_'+user_id+'].smoove').remove();
           }
          
        }

      });
      var mylist = $('#activity_list');
      var listitems = mylist.children('li').get();
      listitems.sort(function(a, b) {
          var compA = $(a).attr('id');
          var compB = $(b).attr('id');
          return (compA > compB) ? -1 : (compA < compB) ? 1 : 0;
          })
      $.each(listitems, function(idx, itm) { mylist.append(itm); });

  },"xml");
}

function update_activitiesJSON(){
  $.post("backend.php",{ "action": "recent_activity", "unix_timestamp": 0 }, function(data) {
      var users = new Array();
      $.each(data.users, function(i,user){
        users[user.user_id] = user.username;
        });
      var following = $('#users').data('following');

      $.each(data.consecutive, function(key,c){
        if(!$('#' + c.unix_timestamp+'_'+c.active_id).length){
          //we aren't currently showing this item
            if(!$('li[name=consec_'+c.user_id+']').length){
            //no activity for this user+post... go ahead and insert new smoove
            $('#activity_list').prepend('<li class="consecutive ui-state-default" id="'+c.unix_timestamp+'_'
            +c.active_id+'" name="consec_'+c.user_id+'">'
            +''+c.message+'</li>').fadeIn("slow");
            $('#'+c.unix_timestamp+'_'+c.active_id).hide().fadeIn("slow")
            .click(function (){
              
              get_posts('smoover='+c.user_id,'#'+users[c.user_id],{
                'view':'smoover',
                'user_name':users[c.user_id], 
                'smoover':c.user_id,
                'user_id':c.user_id,
              });
            });
            
            }
          //element doesn't already exist, add it to the top
          }
      });

      $.each(data.comments_smooves, function(key,cs){

        var user_id = cs.user_id;
        if(typeof following != "undefined"){
          if(typeof following[user_id] == "undefined"){
          alert(following[user_id]['username']); 
            return;
          }
        }

        var username = users[cs.user_id];
        var active_id = cs.active_id;
        var post_id = cs.post_id;
        var title = cs.title;
        var message = cs.message;
        var unix_timestamp = cs.unix_timestamp;
        var onclickjs = "get_posts('post_id=" + post_id + "','#selectqueue',{'show_feeds':true, 'single_post':true});";
        if(cs.action == 2){ 
          if(!$('#activities').data('show_smooves')){
            return;
          }
          if(!$('#' + unix_timestamp+'_'+active_id).length){
          //we aren't currently showing this item
            if(!$('li[name='+post_id+'_'+user_id+']').length){
            //no activity for this user+post... go ahead and insert new smoove
            $('#activity_list').prepend('<li class="smoove ui-state-default" onclick="'+onclickjs+'" id="'+unix_timestamp+'_'
            +active_id+'" name="'+post_id+'_'+user_id+'">'
            +'<img src="images\\smoove_icon.png" height="15px"/><b class="act_username">'
            +username+'</b> '+title+'</li>').fadeIn("slow");
            $('#'+unix_timestamp+'_'+active_id).hide().fadeIn("slow");
            
            }
          //element doesn't already exist, add it to the top
          }
        }
       
        if(cs.action == 3){ 

          if(!$('#' + unix_timestamp+'_'+active_id+'_'+user_id).length){
            if($('li[name='+post_id+'_'+user_id+'].comment').length){
            //a comment already exists. get the current count and add one to is, then add the comment
            var new_comment_id = unix_timestamp+'_'+active_id+'_'+user_id;
         
                $('#activity_list').prepend('<li class="comment ui-state-default" id="'
                +unix_timestamp+'_'+active_id+'_'+user_id+'" name="'+post_id+'_'+user_id+'" onclick="'+onclickjs+'">'
                +'<img src="images\\comment_small.png"/><b style="color:black">'
                +username+'</b> '+title+'</li>').fadeIn("slow");;
            
              $('#'+unix_timestamp+'_'+active_id+'_'+user_id).hide().fadeIn("slow");


          }else{
            //no comment from this user exists for this post. insert a new one.
            $('#activity_list').prepend('<li class="comment ui-state-default" id="'
              +unix_timestamp+'_'+active_id+'_'+user_id+'" name="'+post_id+'_'+user_id+'" onclick="'+onclickjs+'">'
            +'<img src="images\\comment_small.png"/><b style="color:black">'
              +username+'</b> '+title+'</li>').fadeIn("slow");
            $('#'+unix_timestamp+'_'+active_id+'_'+user_id).hide().fadeIn("slow");
          }
           if($('li[name='+post_id+'_'+user_id+'].smoove').length){
              $('li[name='+post_id+'_'+user_id+'].smoove').remove();
           }
          
        }
      }
      });
      var mylist = $('#activity_list');
      var listitems = mylist.children('li').get();
      listitems.sort(function(a, b) {
          var compA = $(a).attr('id');
          var compB = $(b).attr('id');
          return (compA > compB) ? -1 : (compA < compB) ? 1 : 0;
          })
      $.each(listitems, function(idx, itm) { mylist.append(itm); });

  },"json");
}
