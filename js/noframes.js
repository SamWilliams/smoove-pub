


function showUsers(){
  $('#feeds').hide();
  $('#titles').hide();
  $('#parent_container').show();
  $('#users').show();
  get_posts('queue=true&unread=true','#selectqueue',{'view':'queue'});
}

function showQueue(){
  $('#feeds').hide();
  $('#parent_container').hide();
  $('#users').hide();
  $('#titles').show();
  get_posts('queue=true&unread=true','#selectqueue',{'view':'queue'});
}

function showFeeds(){
  $('#users').hide();
  $('#titles').hide();
  $('#parent_container').show();
  getFeedsAJAX('');
  $('#feeds').show();
  get_posts('unread=true','#all_unread_posts', {'view':'all_unread', 'show_feeds':true});
}

//this is called when a user pressed the smoove button
//or hits the s key on a post
function materialButtonAJAX(post_id){
  $.post("backend.php",{ "action": "material", "post_id": post_id }, function(xml) {
      var success = $(xml).find('post').find('success').text();
      success = parseInt(success);
      if(success == 1){
      var post_read = $(xml).find('post').find('post_read').text();
      post_read = parseInt(post_read);
      if(post_read == 1){
        $('#post_info'+post_id).removeClass('post_info');
        $('#post_info'+post_id).addClass('post_info_read');
      }

      var new_score = $(xml).find('post').find('material').text();
      var post_init = '#material' + post_id;
      $(post_init).text(new_score);
      $( "#materialButton" + post_id).button({disabled: true});
      //$( "#voteButton" + post_id + " span").html("Material");
      }else{
        topbar_notice("Tell Sam that there was a problem marking your material.", '#posts');
      }  
      update_activitiesJSON();
  },"xml");
}

function initButtons(){
      $('#subscribe_button')
      .button({"disabled":true}).hide()
      .css({ 'font-size': '14px','margin-left':'1px', 
              'margin-top':'1px',height: '19px',  width: '100px', 'padding': '0px'});
      $('#mark_feed_read_button')
      .button({"disabled":true}).hide()
      .css({ 'font-size': '14px','margin-left':'1px', 
              'margin-top':'1px',height: '19px',  width: '120px', 'padding': '0px'});


      $('#add_feed_button')
      .button({"disabled":false})
      .css({ 'font-size': '10px','margin-left':'0px', 
              'margin-top':'1px',height: '19px',  width: '100px', 'padding': '0px'});


}

function initMaterialButton(post_id, user_material){

      if(parseInt(user_material) >= 1){
        $("#materialButton"+post_id).css({ 'font-size': '14px','margin-left':'1px', 'margin-top':'1px',height: '29px',  width: '100px', 'padding': '0px'});
        $( "#materialButton"+post_id).button({disabled: true});
      }else{
        $("#materialButton"+post_id)
        .css({ 'font-size': '14px', height: '29px',  width: '100px','margin-left':'1px','margin-top':'1px', 'padding': '0px'});
        $("#materialButton"+post_id).button();
        $("#materialButton"+post_id).click(function() { 
            materialButtonAJAX(post_id);            
        return false; });
      }
}

function initSmooveButton(post_id, user_score){

      if(parseInt(user_score) >= 1){
        $("#smooveButton"+post_id).css({ 'font-size': '14px','margin-left':'1px', 'margin-top':'1px',height: '29px',  width: '100px', 'padding': '0px'});
        $( "#smooveButton"+post_id).text("Smooved");
        $( "#smooveButton"+post_id).button({disabled: true});
      }else{
        $("#smooveButton"+post_id)
        .css({ 'font-size': '14px', height: '29px',  width: '100px','margin-left':'1px','margin-top':'1px', 'padding': '0px'});
        $("#smooveButton"+post_id).text("Smoove It");
        $("#smooveButton"+post_id).button();
        $("#smooveButton"+post_id).click(function() { 
            smooveItButtonAJAX(post_id);            
        return false; });
      }
}

//this is called when a user pressed the smoove button
//or hits the s key on a post
function smooveItButtonAJAX(post_id){
  $.post("backend.php",{ "action": "smoove_it", "post_id": post_id }, function(xml) {
      var success = $(xml).find('post').find('success').text();
      success = parseInt(success);
      if(success == 1){
      var post_read = $(xml).find('post').find('post_read').text();
      post_read = parseInt(post_read);
      if(post_read == 1){
      $('#post_info'+post_id).removeClass('post_info');
      $('#post_info'+post_id).addClass('post_info_read');
      }

      var new_score = $(xml).find('post').find('smoove_count').text();
      var consec_success = $(xml).find('post').find('consec_success').text();
      consec_success = parseInt(consec_success);
      if(consec_success == 1){
        var consec_message = $(xml).find('post').find('consec_message').text();
        topbar_notice(consec_message, '#posts');
      }
      var post_init = '#score' + post_id;
      $(post_init).text(new_score);
      $( "#smooveButton" + post_id).button({disabled: true});
      $( "#smooveButton" + post_id + " span").html("Smooved");
      }else{
        topbar_notice("Tell Sam that there was a problem saving your smoove.", '#posts');
      }  
      update_activitiesJSON();
  },"xml");
}

function embedLink(link,post_id){
    $('#items').hide();
    $('#posts').append('<iframe class="ex_frame" id="ex_frame"/>');
    $('#ex_frame').attr('src', link);
    $('#ex_frame').height($('#posts').height()-5);
}

function toggleAddFeed(){
  $('#add_feed_box').toggle()
  feeds_offset = $('#activities').height() + $("#feed_header").height() + 25;
  //$('#feeds').height($(window).height() - feeds_offset).css("top",feeds_offset);
  $('#feeds').height($(window).height() - feeds_offset);
}
function twitter_link(item_link)
	{
		var link = 'http://twitter.com/share?url=' + item_link;
		var load = window.open(link,'_blank','directories=yes,width=500,height=400,scrollbars=yes,toolbar=yes,location=yes');
		if(window.focus)
            {
                load.focus();
            }
	}


function facebook_link(item_link)
	{
		var link = 'http://www.facebook.com/sharer/sharer.php?u=' + item_link;
		var load = window.open(link,'_blank','directories=true,width=500,height=400,scrollbars=yes,toolbar=yes,location=yes');
		if(window.focus)
            {
                load.focus();
            }
	}

function addFeedAJAX(){
  var rss_location = $('#add_feed_input').val();
  //notify user that we are adding the feed
  
  $.post("backend.php",{ 
      "action": "add_feed", 
      "rss_location": rss_location,
      "beforeSend": function (){

        $('#add_feed_button').button({
        "disabled":true,
        "label":"adding feed...",
       });
      }
      }, function(data) {
      $('#add_feed_button').button({
        "disabled":false,
        "label":"add feed",
      });
      if(data == "undefined"){
        topbar_notice("Something broke: " + error_msg, '#posts');
        success = "0";
      }else{
        var success = data.success;
        var error_msg = data.error;
      }
    if(success == "1"){
      //var feed_id = $(xml).find('add_feed').find('feed_id').text();
      //topbar_notice("Adding Feed");

      //get new feed_id from xml
      //refresh feed list.
      get_posts('feed_id='+feed_id,'#feed_id_'+feed_id);
      getFeedsAJAX('');
      //scroll to new feed in feed list
    }else{
      topbar_notice("Not able to add feed: " + error_msg, '#posts');
    }
  },"json");

}

function selectElement(elem){
    $('#un_sortable').children()
      .css('background-image','url(images/ui-bg_glass_75_e6e6e6_1x400.png)').removeClass('v_selected');
    $('#sortable').children()
      .css('background-image','url(images/ui-bg_glass_75_e6e6e6_1x400.png)').removeClass('v_selected');
    $(elem).css('background-image','url(images/ui-bg_glass_75_dadada_1x400.png)').addClass('v_selected');
}

function selectTitle(title_selector){

    $('#titles').children('.t_selected')
     .css('background-image','url(images/ui-bg_glass_75_e6e6e6_1x400.png)')
     .removeClass('t_selected');
    $('#titles').children(title_selector).css('background-image','url(images/ui-bg_glass_75_dadada_1x400.png)')
     .addClass('t_selected');
     
    var $btn = $('#titles');
    var div_height = $btn.height();
    var parent_height = $('#parent_container').height();
    var div_scroll = $btn.scrollTop();
    if(title_selector == "#undefined"){
      return;
    }
    //$('#dickbar').html(title_selector);
    var title_position = $(title_selector).position().top;
    var title_height = $(title_selector).height();

    var div_offset = parent_height + div_height - div_scroll;
    var title_bottom = title_position + title_height;
            //$('#dickbar').html("title height: "+title_bottom+" div scroll: "+div_offset
            //+ " scroll" + div_scroll + " parent: " + parent_height);
        //if(title_position < 208 ){
        if(title_position < parent_height/2 + 208 ){

            $('#titles').scrollTo(title_selector,1,{'margin': "true", "offset":-parent_height/2 + title_height + 25} );
            //$('#top_title').html("above");
        }else{
          if(title_bottom > parent_height/2 + 158){
            $('#titles')
            .scrollTo(title_selector,1,{'margin': "true","offset":-parent_height/2 + title_height + 25} );
            //$('#top_title').html("below");
          }else{
            //$('#top_title').html("all good");
          }
        }

        if($('.t_selected').scrollTop() > ($btn.offset().top+$btn.height())){
            //  $('#titles').scrollTo(".v_selected",1);
        }

}


function saveNewPost(){
  var data = $('#content').val();
  alert(data);
}

function createNewPost(){
  var instance = CKEDITOR.instances['content'];

  if(instance)
  {
    CKEDITOR.remove(instance);
  }
  var new_post_form = "<textarea id=\"content\" name=\"content\"></textarea>\
                       <button onclick=\"saveNewPost()\">currently disabled</button>";

  $('#posts').html(new_post_form);
  //CKEDITOR.replace( '#content' );
  $("#content").ckeditor();
  getFeedsAJAX('#'+$('.v_selected').attr('id'));


  //CKEDITOR.replace(id);
}

function addCommentAJAX(post_id){
  var comment_id = "#commentInput" + post_id;
  //var comment_text = $(comment_id).text();
  //$(post_init).text(new_score);
  $.post("backend.php",{ "action": "add_comment", "post_id": post_id, "comment_body": $(comment_id).val() }, function(xml) {
      var results = $(xml).find('success').text();
      if(results=="TRUE"){
      posts_view_notice("comment saved");
      var comments_id = "#comments" + post_id; 
      var comment_container = '<div style="width:80%"><div style="background:#CCCCCC;border:dotted;border-width:1px;margin-top:10px">';
      comment_container = comment_container + "author: me" + '</div><div style="border:dotted;border-width:1px;padding:10px">';
      comment_container = comment_container + $(comment_id).val() + "</div></div>";
      $(comments_id).append(comment_container);
      $(comment_id).val('');
      update_activitiesJSON();
      }else{
      alert("comment NOT saved");
      }
      },"xml");
}
function scrollToComment(comments_id){
  var window_height = 0 - $(window).height()/2 - 20;
  $('#posts').scrollTo(comments_id,1,{'offset': window_height} );
}

function topbar_notice(notice_text,selector){
  //  var notice_text =" <div  class=\"top_bar_notice_outter\">\
  //                 <div id=\"topbar_notice\" class=\"top_bar_notice\">\
  //                "+notice_text+"</div></div>";

  var notice_text =" <div id=\"topbar_notice\" class=\"top_bar_notice\">\
                    "+notice_text+"</div>";


  $(selector).prepend(notice_text);
  //$('#topbar_notice').text(notice_text);
  $('#topbar_notice').show({'effect':'highlight'});
  setTimeout(
      function() 
      {
      $('#topbar_notice').hide({'effect':'highlight'});
      }, 1700);
}

function markFeedRead(feed_id){

var view = $('#posts').data('view');

$.post("backend.php",{ "action": "mark_feed_read", "feed_id": feed_id, "view": view }, function(xml) {

});

}

function markPostRead(post_id){

var view = $('#posts').data('view');

$.post("backend.php",{ "action": "mark_post_read", "post_id": post_id, "view": view }, function(xml) {
  $('[name='+post_id+']').data('post_read',1).find('#post_info'+post_id).addClass('post_info_read');
});

}
function keepPostUnread(post_id){

$.post("backend.php",{ "action": "keep_post_unread", "post_id": post_id }, function(xml) {
  $('[name='+post_id+']').data('post_read',0).find('#post_info'+post_id).removeClass('post_info_read')
  .addClass('post_info');
});

}
function markPostsReadNF(post_ids, post_index){
  var post_index_int = parseInt(post_index);
  if(post_index_int == 0){
    post_index_int = post_ids.length - 1; 
  }

  var confirm_message;
  if(post_index_int == 1){
    confirm_message = "Mark post read?";
  }else{
    confirm_message = "Mark " + post_index_int + " posts read?";
  }
  //if(!confirm(confirm_message)){
  // return NULL;
  //}
  $( "#dialog-confirm" ).dialog({
dialogClass: 'mark_read_alert',
resizable: false,
height:40,
title: confirm_message, 
modal: true,
buttons: {
"Mark read?": function() {
var viewed_posts = post_ids;
var posts_read = [];
var i = 1;
for(i = 1;i<=post_index_int;i++)
{
  posts_read.push(post_ids[i]);
}
var view = $('#posts').data('view');
$.post("backend.php",{ "action": "mark_posts_read", "post_ids": posts_read, "view":view }, function(xml) {
  var li_id_array = $('.v_selected').attr('id').split('_');
  if(li_id_array[0]=="feed"){
  get_posts('feed_id='+li_id_array[2]+'&unread=true','#'+$('.v_selected').attr('id'));
  getFeedsAJAX('#'+$('.v_selected').attr('id'));
  }
  if($('.v_selected').attr('id') == "selectqueue"){
  get_posts('queue=true','#'+$('.v_selected').attr('id'));
  }
  if($('.v_selected').attr('id') == "selectall_new"){
  get_posts('unread=true','#'+$('.v_selected').attr('id'));
  }
  if($('.v_selected').attr('id') == "selectsaved"){
  get_posts('saved=true','#'+$('.v_selected').attr('id'));
  }
  if($('.v_selected').attr('id') == "selectsaved"){
  get_posts('saved=true','#'+$('.v_selected').attr('id'));
  }
  },"xml");
$( this ).dialog( "close" );
},
Cancel: function() {
          $( this ).dialog( "close" );
        }
}
});

}

//
//param_string = get string for backend.php
//elem = the selector for the element that will be highlighted
//
function get_post(param_string, elem){
  $('#posts').empty().html('Loading post...');
  $('#top_title').html($('span[name=display_name]',elem).text());
  selectElement(elem);

  $.ajax({
    url: "posts.php?"+param_string,
    context: $(elem),
    success: function(resp){
    $('#settings_contaner').empty().hide();
    $('#posts').empty().html(resp);
//$('#feeds').hide('slide',{},1000,function(){
// $('#feeds').empty();
// $('#items').children().each(function(){
//   var post_id = $(this).attr('name');
//   var title = $(this).find('.headline').text();
//   var post_li = "<li id=\"\" class=\"ui-state-default\"\
//   onclick=\"get_post('post_id="+post_id+"','')\">"+title+"</li>";
//   $('#feeds').append(post_li);
// });
// $('#feeds').show('slide',{'direction':'right'},1000);

//});
}
});
}

function get_postsDOM(param_string, elem){

  $.post("backend.php",{ "action": "get_posts", 
                        "queue": true,
      }, function(data) {
        $('#posts').data('posts',data); 
        var post_results = $('#posts').data('posts');
        var pc = post_results.comments;
        //alert(pc[611097][0]["content"]);
        //$.each(pc[611097], function (index, comment){
        //  alert(comment.content + ":" + comment.post_id);
        //});
        var post_ids = new Array();
        $.each(post_results.posts, function (index, key){
          post_ids[index] = key.post_id;
          if(key.post_read == 1){
            var read_class = "post_info_read";
          }else{
            var read_class = "post_info";
          }
          if(key.s_score == 0){
            var score_class = "scoreZero"; 
          }else{
            var score_class = "score"; 
          }

          if(key.s_score == 1){
            var smoove_text = "smoove";
          }else{
            var smoove_text = "smooves";
          }

          var post_info = "<div id=\"post_info" + key.post_id + "\" class=\""+read_class+"\">";
          post_info += '<span class="post_info_left">';
          post_info += '<button name="button id="smooveButton' + key.post_id + '"></button>';
          post_info += '<span class="scoreText">';
          post_info += '<span id="score'+key.post_id+'" class="scoreText">';
          post_info += key.s_score + '</span>';
          post_info += '<span class="smooveText" id="smooveText'+key.post_id+'">';
          post_info += smoove_text + '</span></span>';
          post_info += "</span></div>";
          $('#posts').append("<div id=\"pi_"+key.post_id+"\"></div>")
          .find("#pi_"+key.post_id)
          .addClass('item')
          .attr("name",key.post_id)
          .append(post_info);

          if(key.post_id in pc){
            $.each(pc[key.post_id], function (index, comment){
             $('#pi_'+key.post_id)
             .data('position',index)
             .append("<div class=\"comments\" >"+comment.content+"</div>");
             
           });
          }
        });
        $('#posts').data('post_ids',post_ids);
  },"json");
  return 0;
}

function get_following(){
  $.post("backend.php",{ "action": "following"}, function(data) {
      var following = data.following;
      $('#users').data('following',following);
      $('#users_list').empty();

      $.each(following, function (index,user){
        var li_open = "<li style=\"cursor:pointer\" id=\"following_" + user['user_id'] + "\">";
        $('#users_list').append(li_open + user['username'] + "</li>")
        .find('#following_'+user['user_id']).click(function(){
          get_posts('smoover='+user['user_id'],'#'+user['username'],{
            'view':'smoover',
            'user_name':user['username'], 
            'smoover':user['user_id'],
            'user_id':user['user_id'],
          });
        });
      });
  },"json");


}

function submitSearch(){
  var search_string = $("#search_input").val();
  if(search_string == ""){
    return false;
  }
  
  get_posts('search=true&search_string='+search_string,'#search_xbox');

}

function initPostButtons(){
  feed_id = $('#posts').data('feed_id');
  feed_name = $('#posts').data('feed_name');
  $( "#posts_view_switch" ).buttonset()
  .css('font-size',"10px").find('.ui-button-text').css('padding',"2px")
  .find('.ui-button').css('padding',"2px");

  $("#unread_radio").button({
  }).click(function(){
    feed_name = $('#posts').data('feed_name');
    feed_id = $('#posts').data('feed_id');
    params = "feed_id=" + feed_id + "&unread=true";
    $('#posts').data('unread',true);
    $('#posts').data('all',false);
    get_posts(params,'#feed_id_'+feed_id,{
      'feed_id':feed_id, 
      'feed_name':feed_name,
      'view':'feed',
      
    });


    $("#posts_view_switch").find('.ui-button-text').css("padding","0px"); 
  }).find('.ui-button-text').val("test");

  $("#all_radio").button({
  }).click(function(){
    feed_id = $('#posts').data('feed_id');
    feed_name = $('#posts').data('feed_name');
    params = "feed_id=" + feed_id;
    $('#posts').data('unread',false);
    $('#posts').data('all',true);
    get_posts(params,'#feed_id_'+feed_id,{
      'feed_id':feed_id, 
      'feed_name':feed_name,
      'view':'feed'
    });


  $("#posts_view_switch").find('.ui-button-text').css("padding","0px"); 
  });
   $("#smooved_radio").button({
  text: "test"
  }).click(function(){

  $("#posts_view_switch").find('.ui-button-text').css("padding","0px"); 
  });
 
  $("#posts_view_switch").find('label').width("56px").height("17px");
  $("#posts_view_switch").find('.ui-button-text').css("padding","0px"); 

}
function subscribe(){
  var feed_id = $('#posts').data('feed_id');
  feed_id = parseInt(feed_id);


$.post("backend.php",{ "action": "subscribe", "feed_id": feed_id }, function(data) {
      var success = data.success;
      success = parseInt(success);
      if(success == 1){
        alert("feed added");
        getFeedsAJAX('');
      }else{
        alert("feed NOT added");
      }
  },"json");

  $('#subscribe_button').unbind("click").click(function(){
      unsubscribe();
      }).text("unsubscribe");

}

function unsubscribe(){
  var feed_id = $('#posts').data('feed_id');
  feed_id = parseInt(feed_id);
  $.post("backend.php",{ "action": "unsubscribe", "feed_id": feed_id }, function(data) {
      var success = data.success;
      success = parseInt(success);
      if(success == 1){
        alert("feed removed");
        getFeedsAJAX('');
      }else{
        alert("feed NOT removed");
      }
  },"json");

  $('#subscribe_button').unbind("click").click(function(){
      subscribe();
      }).text("+subscribe");


}

function unfollow(){
  var user_id = $('#posts').data('user_id');
  user_id = parseInt(user_id);
  $.post("backend.php",{ "action": "unfollow", "f_user_id": user_id }, function(data) {
      var success = data.success;
      success = parseInt(success);
      if(success == 1){
        get_following();
        update_activitiesJSON();
        alert("user removed");
      }else{
        alert("user NOT removed");
      }
  },"json");

  $('#follow_button').unbind("click").click(function(){
      follow();
      }).text("+follow");


}
function follow(){
  var user_id = $('#posts').data('user_id');
  user_id = parseInt(user_id);


$.post("backend.php",{ "action": "follow", "f_user_id": user_id }, function(data) {
      var success = data.success;
      success = parseInt(success);
      if(success == 1){
        get_following();
        update_activitiesJSON();
        alert("user added");

      }else{
        alert("user NOT added");
      }
  },"json");

  $('#follow_button').unbind("click").click(function(){
      unfollow();
      }).text("unfollow");

}

function set_topbar(){

  var view = $('#posts').data('view');
  var unread = $('#posts').data('unread');
  var all = $('#posts').data('all');

  if(unread){
    $('#unread_radio').attr("checked","checked");
    $('#all_radio').attr("checked","");
    $('#smooved_radio').attr("checked","");
    $('#posts_view_switch').buttonset('refresh');
  }
  if(all){
    $('#unread_radio').attr("checked","");
    $('#all_radio').attr("checked","checked");
    $('#smooved_radio').attr("checked","");
    $('#posts_view_switch').buttonset('refresh');
  }
  switch(view){
    case "feed":
      var feed_id = $('#posts').data('feed_id');
      var feed_name = $('#posts').data('feed_name');
      var feeds = $('#feeds').data('feeds');
      feed_id = parseInt(feed_id);
      if(typeof feeds[feed_id] != "undefined"){
        var subscribe_text = "unsubscribe";
        var feed_action = "remove";
        var disabled = false;
        //    feed_name = feeds[feed_id].name;
      }else{
        var subscribe_text = "+subscribe";
        var feed_action = "add";
        var disabled = false;
      }
      
      $('#top_title').text(feed_name);
      $('#follow_button').hide();
      $('#subscribe_button')
      .text(subscribe_text) 
      .button('option','disabled',disabled).text(subscribe_text)
      .show()
      .unbind("click").click(function(){
        if(feed_action == "add"){
          subscribe();
        }else{
          unsubscribe();
        }
      });

      $('#mark_feed_read_button')
      .text('mark feed read') 
      .button('option','disabled',disabled).text('mark feed read')
      .show()
      .unbind("click").click(function(){
          markFeedRead($('#posts').data('feed_id'));
      });


      break;
    case "queue":
      $('#top_title').text("Smooves by other users");
      $('#subscribe_button').hide();
      $('#mark_feed_read_button').hide();
      $('#follow_button').hide();
      break;
    
    case "saved":
      $('#top_title').text("Saved Posts");
      $('#subscribe_button').hide();
      $('#mark_feed_read_button').hide();
      $('#follow_button').hide();
      break;

    case "all_unread":
      $('#top_title').text("All Unread Posts");
      $('#subscribe_button').hide();
      $('#mark_feed_read_button').hide();
      $('#follow_button').hide();
      break;

    case "original":
      $('#top_title').text("User created Posts");
      $('#mark_feed_read_button').hide();
      $('#subscribe_button').hide();
      $('#follow_button').hide();
      break;

    case "smoover":
      var user_name = $('#posts').data('user_name');
      var user_id = $('#posts').data('user_id');
      var following = $('#users').data('following');
      
      if(typeof following != "undefined"){
        if(typeof following[user_id] != "undefined"){
          var is_following = true;
          var follow_text = "unfollow";
          var follow_action = "remove";
        }else{
          var is_following = false;
          var follow_text = "+follow";
          var follow_action = "add";
        }
      }else{
          var is_following = false;
          var follow_text = "unknown";
          var follow_action = "add";
      }

      $('#top_title').text("Smooves by " + user_name);
      $('#mark_feed_read_button').hide();
      $('#subscribe_button').hide();
      $('#follow_button')
      .button('option','disabled',disabled).text(follow_text)
      .show()
      .unbind("click").click(function(){
        if(follow_action == "add"){
          follow();
        }else{
          unfollow();
        }
      });

      break;

    default:
      $('#top_title').text("");
      $('#subscribe_button').hide();
      $('#mark_feed_read_button').hide();
      $('#follow_button').hide();
      break;

  }
}

//
//param_string = get string for backend.php
//elem = the selector for the element that will be highlighted
//
function get_posts(param_string, elem, options){

  var start_time = new Date().getTime();
  //var elapsed = new Date().getTime() - start;
  var feed_id = false;
  var view = false;
  var feed_name = false;
  var unread = false;
  var all = false;
  var smoover = false;
  var user_id = false;
  var user_name = false;
  var show_feeds = false;
  var single_post = false;
  
  var start = 0;

  if (typeof options != "undefined") {
    if(options.feed_id != "undefined"){
      feed_id = options.feed_id;
    } 
    if(options.single_post != "undefined"){
      single_post = options.single_post;
    } 

    if(typeof options.feed_name != "undefined"){
      feed_name = options.feed_name;
    } 
    if(typeof options.start != "undefined"){
      start = options.start;
    } 

    if(typeof options.show_feeds != "undefined"){
      show_feeds = options.show_feeds;
    } 

    if(typeof options.view != "undefined"){
      view = options.view;
    }      
    if(typeof options.unread != "undefined"){
      unread = options.unread;
    }
    if(typeof options.all != "undefined"){
      all = options.all;
    }
    if(typeof options.smoover != "undefined"){
      smoover = options.smoover;
    }
    if(typeof options.user_id != "undefined"){
      user_id = options.user_id;
    }
    if(typeof options.user_name != "undefined"){
      user_name = options.user_name;
    }



  }

  //$('#posts').hide('fade',800).empty();
  //.show('fade',500).html('Loading posts...');
  selectElement(elem);
  var existing_ajax = $('#posts').data('ajax_call');
  if(typeof existing_ajax != 'undefined'){
    existing_ajax.abort();  
  }

    var ajax_call =  $.ajax({
    url: "posts.php?"+param_string+"&start="+start+"&limit=4",
    context: $(elem),
    success: function(resp){
    //$('.add_post_text').html(elapsed);

      $('#settings_container').empty().hide();
      $('#posts').show();
      $('#items').empty();
      $('#posts').data('feed_id',false);
      $('#posts').hide('fade',100,function(){
        if(feed_id){
          $('#posts').data('feed_id',feed_id);
          $('#posts').data('feed_name', feed_name);
        }
        if(smoover){
          $('#posts').data('user_name',user_name); 
          $('#posts').data('user_id',user_id);
        }else{
          $('#posts').data('user_name',''); 
          $('#posts').data('user_id','');
        }

        $('#posts').data('view',view);
        $('#posts').data('unread',unread);
        $('#posts').data('all', all);
        set_topbar();


        $('#items').html(resp);
        var first_post = '<div id="pi_0" name="0" class="item selected" style="display:none"></div>';
        
        $('#items').prepend(first_post);
        
        var post_counts = parseInt($("#items").attr('name'));
        var start_offset = start + 4;
        $(this).show('fade',100);
        if(!single_post && post_counts >= 4){
        var second_ajax = $.ajax({
          url: "posts.php?"+param_string+"&start="+start_offset+"&limit=35&second=true",
          context: $(elem),
          success: function(second_resp){
            $('#items').append(second_resp);
            var post_count = parseInt($("#items").attr('name'));
            var last_item_id = post_count + 1;
            var last_post = "<div id='pi_" + last_item_id + "' name='00' class='item'> ";
            last_post += "<center>Mark all of these posts read</center></div>";
            $('#items').append(last_post);
            $('#pi_'+last_item_id).click(function (){
              markPostsReadNF(post_ids,0);
              //var feed_id = $('#posts').data('feed_id');
              //var feed_name = $('#posts').data('feed_name');
              //get_posts("unread=true&feed_id=" + feed_id,'#feed_id_'+feed_id,
              //  {
              //  'feed_id':feed_id,
              //  'feed_name':feed_name,
              //  'unread':true,
              //  'view':'feed',
              //  'start':40,
              //  });
            });

            populateTitles();
          },
        });
        }
        $('#posts').data('ajax_call',second_ajax);
        
        if($('body').data('user_id') == 2){
          var elapsed = new Date().getTime() - start_time;
          $('.smoove_title').html(elapsed);
        }

        populateTitles();
        first_id = $('#titles').children(":first").attr("id");
        selectTitle("#"+first_id);
        var single_post_view = $('#posts').data("SINGLE_POST_VIEW");
        single_post_view = parseInt(single_post_view);
        //alert(single_post_view);
        if(single_post_view){
          $(this).find("#items").children().hide();
          $(this).find('.selected').show();
        }
        
        $(this).show('fade',100);

        if($("body").data("style") == "modern"){

        }else{
          if(($('#feeds').data('feeds_locked') == 0 || $("#posts_radio").attr("checked") == "checked")
            && !show_feeds
            ){
          viewPostTitles();

          }//end if feeds_locked
        }

      }); //end hide function
 
    }//end ajax success call
  }); //end ajax call
  $('#posts').data('ajax_call',ajax_call);

  
}


function populateTitles(){

    $('#titles').empty();
    $('#items').children('div').each(function(){
      var post_id = $(this).attr('name');
      if(post_id == "0" || post_id == "00"){
        return;
      }
      var title = $(this).find('.headline').text();
      var comment_count = parseInt($(this).find('.comment_count').text());
      if(comment_count != 0){
        var comment_count_string = "<span class='comment_count_li'>\
          "+comment_count+"<img src='images\\comment_small.png'/></span>";
      }else{
        var comment_count_string = "";
      }
      var post_li = "<li id='post_li_"+post_id+"' class=\"posts_list ui-state-default\"\
        ><span class=\"post_title_li\">\
        "+title+"</span>"+comment_count_string+"</li>";

      $('#titles').append(post_li);
      $('#post_li_'+post_id)
        .click(function(){
        selectTitle('#post_li_'+post_id);
        var single_post_view = $('#posts').data("SINGLE_POST_VIEW");
        single_post_view = parseInt(single_post_view);
        if(!single_post_view){
          scrollToPost(post_id); 
        }else{
          $('#items').find('.selected').addClass('not_selected')
          .removeClass('selected').hide();
          $('#items').find('[name="'+post_id+'"]').addClass('selected')
          .removeClass('not_selected').show();
        }
      if(!($('.selected').data('post_read') == 1 && $('.selected').data('smoove_read') == 1) 
        && $('#posts').data('MARK_SELECTED_READ') == 1){
          //mark post read
          markPostRead(post_id);
        }

      })
    .bind('mouseover mouseenter', function(){
      $('#post_li_'+post_id).css('color',"blue");   
      });
    
    $('#post_li_'+post_id).bind('mouseout', function(){
      $('#post_li_'+post_id).css('color',"");   
      });
    

    });

    $('#titles').children(':first').addClass('t_selected');

}

function enableScrollSelect(){
  $('#posts').scroll(function() {
      var cutoff = $(window).scrollTop();
      $('.item').removeClass('selected')
      .removeClass('v_selected') 
      .addClass('not_selected').each(function() {

        var elemTop = $(this).offset().top;
        var elemBottom = elemTop + $(this).height();
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        if (elemBottom > docViewBottom/2) {
        $(this)
        .addClass('selected')
        .addClass('v_selected')
        .removeClass('not_selected');
        return false; // stops the iteration after the first one on screen
        }
        });
      });
}
function scrollToPost(post_id){
  if($('#ex_frame').length){
    $('#ex_frame').remove();
    $('#items').show();
  }
  var elem = '[name="'+post_id+'"]';
  $('#posts').scrollTo(elem,1,{'margin': "true"} );

  $('.selected')
  .removeClass('selected')
  .removeClass('v_selected')
  .addClass('not_selected');
  $(elem)
  .addClass('selected')
  .addClass('v_selected')
  .removeClass('not_selected');
}

function prevPost() {

  var pi_array = $('div.selected').attr('id').split('_');
  curr_pi = parseInt(pi_array[1]);
  prev_pi = curr_pi - 1;
  if(prev_pi >= 1){
    var prev_pi_id = '#pi_' + prev_pi;
    var single_post_view = $('#posts').data("SINGLE_POST_VIEW");

    var post_id = $(prev_pi_id).attr('name');
    selectTitle("#post_li_"+post_id);

    single_post_view = parseInt(single_post_view);
    if(!single_post_view){
      $('#posts').scrollTo(prev_pi_id,1,{'margin': "true"} );
      $('.selected').removeClass('selected').addClass('not_selected');
      $(prev_pi_id).addClass('selected').removeClass('not_selected');

    }else{
      $('.selected').removeClass('selected').addClass('not_selected').hide();
      $(prev_pi_id).addClass('selected').removeClass('not_selected').show();
      $('#posts').scrollTo(0);
    }

  }
}

function nextPost() {
  post_count = parseInt($('#items').attr("name"));
  var pi_array = $('div.selected').attr('id').split('_');
  curr_pi = parseInt(pi_array[1]);
  next_pi = curr_pi + 1;
  if(next_pi <= post_count + 1){

    var next_pi_id = '#pi_' + next_pi;

    var single_post_view = $('#posts').data("SINGLE_POST_VIEW");
    single_post_view = parseInt(single_post_view);

    var post_id = $(next_pi_id).attr('name');
    if(post_id != "00"){
      selectTitle("#post_li_"+post_id);
    }
    
    if(!single_post_view){
      $('#posts').scrollTo(next_pi_id,1,{'margin': "true"} );
      $('.selected').removeClass('selected').addClass('not_selected');
      $(next_pi_id).addClass('selected').removeClass('not_selected');
    }else{
      $('.selected').removeClass('selected').addClass('not_selected').hide();
      $(next_pi_id).addClass('selected').removeClass('not_selected').show();
      $('#posts').scrollTo(0);
    }

    //only mark a post read if we haven't already, and if the user actually 
    //wants to (MARK_SELECTED_READ setting
    if(!($('.selected').data('post_read') == 1 || $('.selected').data('smoove_read') == 1) 
      && $('#posts').data('MARK_SELECTED_READ') == 1){
      //mark post read
      markPostRead(post_id);
    }
  }

}

function get_key_bindings(){

  $(document).bind('keydown', 'j', function(){
      $('#posts').scrollTo("+=45px",{'axis':"y"});
      });

  $(document).bind('keydown', 'k', function(){
      $('#posts').scrollTo("-=45px",{'axis':"y"});
      });

  $(document).bind('keydown', 's', function(){
      smooveItButtonAJAX($('.selected').attr("name"));
      });

  $(document).bind('keydown', 'r', function(){
      var position = $(".selected").children(":first").attr('id');
      markPostsReadNF(post_ids,position);
      });

  $(document).bind('keydown', 'n', function(){
      nextPost();
      });

  $(document).bind('keydown', 'p', function(){
      prevPost();
      });

  $(document).bind('keydown', 'c', function(){
      var post_id = $('.selected').attr("name");
      var comments_id = '#comments' + post_id;
      var comment_input = '#commentInput' + post_id;
      var window_height = 0 - $(window).height()/2 - 20;
      $('#posts').scrollTo(comments_id,1,{'offset': window_height} );
      //$(comment_input).focus();
      });




}


function clickSelect(theElement)
{
  if($(theElement).attr('id') != $('div.selected').attr('id')){
    $('div.selected').removeClass('selected').addClass('not_selected');
    $(theElement).addClass('selected').removeClass('not_selected');
    if(!($('.selected').data('post_read') == 1 && $('.selected').data('smoove_read') == 1) 
      && $('#posts').data('MARK_SELECTED_READ') == 1){
      var post_id = $('.selected').attr('name');
      //mark post read
      markPostRead(post_id);
    }

  }
}

function ScrollToElement(theElement){

  var selectedPosX = 0;
  var selectedPosY = -40;

  while(theElement != null){
    selectedPosX += theElement.offsetLeft;
    selectedPosY += theElement.offsetTop;
    theElement = theElement.offsetParent;
  }
  window.scrollTo(selectedPosX,selectedPosY);
}

