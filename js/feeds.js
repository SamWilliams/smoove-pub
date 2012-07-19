function toggle_edit(){
  var disable_status = $('#sortable').sortable('option','disabled');
  if(disable_status){
    //user clicked edit button. allow them to sort list
    $('#sortable').sortable('option','disabled', false);
    $('#edit_feed').text('save');
    $("[name=feed_nolink]").show();
    $("#sort_alpha").show();
    $("[name=feed_link]").hide();
  }else{
    //user clicked the save button. Hide stuff and save to sever
    $('#sort_alpha').hide();
    $('#sortable').sortable('option','disabled', true);
    $('#edit_feed').text('edit');
    $("[name=feed_nolink]").hide();
    $("[name=feed_link]").show();
    var sort_order = $('#sortable').sortable('toArray');
  $.post("backend.php",{ "action": "save_sort_order", "feeds_order": sort_order }, function(xml) {
    },"html");

  }

}

function toggleFeedsLock(state){
  //alert($('#feeds').data('feeds_locked'));
  if(state == 'locked'){
    $('#feeds').data('feeds_locked', 1);
    saveSetting('FEEDS_LOCKED',1);
    $('.lock_button').find('span').removeClass('ui-icon-unlocked').addClass('ui-icon-locked'); 
  }
  if(state == 'unlocked'){
    $('#feeds').data('feeds_locked', 0);
    saveSetting('FEEDS_LOCKED',0);
    $('.lock_button').find('span').removeClass('ui-icon-locked').addClass('ui-icon-unlocked'); 
  }

}

function viewPostTitles(){

  $('#parent_container').hide();
  $('#feeds').hide('fade',{'direction':'down'},300,function(){
      $('.back2feeds').button('option','disabled',false).text("< Feeds")
      .next().button('option','disabled',true) 
      .next().button('option','disabled',true); 

      $('#titles').show('fade',{'direction':'down'},300);
      });

  selected_id = $('#titles').children(".t_selected").attr("id");
  if(typeof selected_id != "undefined"){
    selectTitle("#" + selected_id);
  }

}


function initFeedButtons(){

  $( "#list_view" ).buttonset()
  .css('font-size',"10px").find('.ui-button-text').css('padding',"2px")
  .find('.ui-button').css('padding',"2px");
  $("#feeds_radio").button({
    icons: {
    primary: 'ui-icon-grip-solid-horizontal'
  },
  text: false
  }).click(function(){
    if($('body').data("style") == "modern"){

    }else{
      $("#titles").hide(); 
    }
    $("#parent_container").show();
    $("#list_view").find('.ui-button-text').css('padding',"2px");
  });
  $("#posts_radio").button({
    icons: {
    primary: 'ui-icon-grip-dotted-horizontal' 
  },
  text: false
  }).click(function(){
    $("#parent_container").hide();
    $("#titles").show(); 
    if($('body').data('style') == "modern"){

    }else{
      viewPostTitles();
    }
    $("#list_view").find('.ui-button-text').css('padding',"2px");
  });
  
  $('.ui-button-icon-only').css('height',"20px");
  $(".back2feeds").button({
  }).click(function(){
    getFeedsAJAX('');
  });
  $(".back2feeds").text("< Feeds").width("55px").css("font-size","12px").height("20px");

  $(".add_feed_button").button({
    icons: {
    primary: 'ui-icon-plusthick' 
  },
  text: false
  }).click(function(){
    toggleAddFeed();
    //addFeedAJAX();
  });
  $(".add_feed_button").width("20px");

  $(".refresh_button").button({
    icons: {
    primary: 'ui-icon-arrowrefresh-1-e' 
  },
  text: false
  }).click(function(){
    getFeedsAJAX('');
    //addFeedAJAX();
  });
  $(".refresh_button").width("20px");

}

function initFeedsLock(feeds_locked){
if(feeds_locked == 1){
  var lock_icon = 'ui-icon-locked';
  $("#feeds").data('feeds_locked',1);
}else{
  var lock_icon = 'ui-icon-unlocked';
  $("#feeds").data('feeds_locked',0);
}
  $(".lock_button").button({
    icons: {
    primary: lock_icon 
  },
  text: false
  }).click(function(){
  if($('#feeds').data('feeds_locked') == 1){
    toggleFeedsLock('unlocked');
  }else{
    toggleFeedsLock('locked');
  }
  });

  $(".lock_button").width("23px").height("21px");

}

function sort_by_order(){
  var sort_order = $('#feeds').data('SORT_ORDER').split(',');

  var el_list = $('#sortable');
  var map = {};

  $('#sortable li').each(function() { 
      var el = $(this);
      var feed_id_array = el.attr('id').split("_");
      map[feed_id_array[2]] = el;
      });

  for (var i = 0, l = sort_order.length; i < l; i ++) {
    if (map[sort_order[i]]) {
      el_list.append(map[sort_order[i]]);
    }
  }

}

function sort_by_alpha(){
  var confirm_message;
    confirm_message = "Are you sure you want to modify your custom sort order (this can not be undone)?";
  $( "#dialog-confirm" ).dialog({
dialogClass: 'mark_read_alert',
resizable: false,
height:40,
title: confirm_message, 
modal: true,
buttons: {
"Sort alphabetically?": function() {

  var mylist = $('#sortable');
  var listitems = mylist.children('li').get();
  listitems.sort(function(a, b) {
      var compA = $(a).text().toUpperCase();
      var compB = $(b).text().toUpperCase();
      return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
      })
  $.each(listitems, function(idx, itm) { mylist.append(itm); });
  $('#sortable').sortable('refreshPositions');
  feed_ids_sort = $('#sortable').sortable('toArray');

  var new_sort_order = new Array();
  $.each(feed_ids_sort,function(index, value){ 
    var feed_id_array = value.split("_"); 
    new_sort_order[index] = feed_id_array[2];
    });


  $.post("backend.php",{ "action": "save_sort_order", "feeds_order": new_sort_order }, function(xml) {
       $('#feeds').data('SORT_ORDER',new_sort_order.join(','));
    },"html");


  $( this ).dialog( "close" );
  },
  Cancel: function() {
          $( this ).dialog( "close" );
 }
}
});



}

function setFeedsData(){

  var feeds = new Array();
  $('#sortable').children('li').each(function(){

    var li_id_array = $(this).attr('id').split('_');
    feed_id = li_id_array[2]; 
    feed_id = parseInt(feed_id);
    name = $(this).find('span[name=display_name]').text();
    //www_location = itm.;
    var feed = {
      'feed_id': feed_id,
      'name': name,
      'www_location': '',
    }

    feeds[feed_id] = feed;

  });
  //alert(feeds[2].name);
  $('#feeds').data('feeds',feeds);

}

function getFeedsAJAX(feed_selector){
    if($('body').data('style') == "modern"){

    }else{
      $('#titles').hide();
      $('#users').hide();
    } 
    $.ajax({
      url: "feeds_inline.php",
      success: function(resp){
               $('#feeds').html(resp);
                if(feed_selector != ""){
                  selectElement(feed_selector);
                }
               $("#unsortable").sortable(); 
               $( "#sortable" ).sortable({
                  update: function(event, ui) { 
                  var sort_order = new Array(); 
                  feed_ids_sort = $('#sortable').sortable('toArray');
                  $.each(feed_ids_sort,function(index, value){ 
                    var feed_id_array = value.split("_"); 
                    sort_order[index] = feed_id_array[2];
                  });
                  $.post("backend.php",{ 
                    "action": "save_sort_order", 
                    "feeds_order": sort_order }, function(xml) {}
                  ,"html");

                $('#feeds').data('SORT_ORDER',sort_order.join(','));
                },
                 delay:300});
     //$( "#sortable" ).disableSelection();
     //$('#sortable').sortable('option','disabled', true);
     sort_by_order();
     setFeedsData();
     $('.back2feeds').button('option','disabled',true).text("< Feeds")
      .next().button('option','disabled',false)
      .next().button('option','disabled',false);
       
     $('#parent_container').show();
     //$('#feeds').show('slide',{'direction':'left'});
     $('#feeds').show();
             }
    });
}


