
function showSmoovesFull(){
//  $('#feeds').hide();
//  $('#titles').hide();
  $('#parent_container').hide();
  $('#smoove_activity').show();
  //get_posts('queue=true&unread=true','#selectqueue',{'view':'queue'});
}

function showFeedsFull(){
  $('#smoove_activity').hide();
  $('#titles').show();
  $('#parent_container').show();
  getFeedsAJAX('');
  $('#feeds').show();
  get_posts('unread=true','#all_unread_posts', {'view':'all_unread'});
}
