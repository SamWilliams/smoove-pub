//this is called when a user pressed the smoove button
//or hits the s key on a post
function save_post(){
  var content = $('#editor').val();
  var title = $('#title').val();
  var link = $('#link').val();
  var derived_post_id = $('#derived_post_id').val();

  //alert( content.checkDirty() );
  alert(content );
  $.post("create_post.php",{ 
      "action": "create_post", 
      "derived_post_id": derived_post_id,
      "content": content,
      "title"  : title,
      "link"   : link,
      }, function(xml) {
        alert(xml);
      var success = $(xml).find('create_post').find('success').text();
      success = parseInt(success);
      if(success == 1){
      var post_id = $(xml).find('create_post').find('post_id').text();
      post_id = parseInt(post_id);
      }
      //refresh comments window here
      },"html");
}

function preview_post(){


}

