function getSettingsUI(){
    $.ajax({
      url: "admin/settings_inline.php",
      success: function(resp){
               $('#posts').hide();
               $('#settings_container').html(resp).show();
             }
    });
}

function setCookie(c_name,value,exdays)
{
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++)
  {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name)
    {
      return unescape(y);
    }
  }
}

function changePassword(){

  currPass = $('#curr_pass').val();
  newPass = $('#new_pass').val();
  newPass2 = $('#new_pass2').val();

  if(newPass == "" || newPass2 == ""){
    topbar_notice("Password cannot be blank.", '#notice_div');
    return false;
  }
  if(newPass != newPass2){
    topbar_notice("new passwords do not match.", '#notice_div');
    alert(newPass + " " + newPass2 + " " + currPass);
    return false;
  }


  $.post("backend.php",{ "action": "change_password", "curr_pass": currPass, "new_pass": newPass,"new_pass2": newPass2}, function(data) {
      var success = data.success;
      success = parseInt(success);
      if(success == 1){
        topbar_notice("Password changed.", '#notice_div');
      }else{
        var error = data.error
        topbar_notice("Error:" + error, '#notice_div');
        return false;

      }
  },"json");
}


function saveSetting(setting_key, value){
  $.post("backend.php",{ 
      "action": "save_setting", 
      "setting_key": setting_key, 
      "setting_value": value, 
      }, function(xml) {
    var success = $(xml).find('save_setting').find('success').text();
  },"xml");
}

function saveSettingCB(setting_key, elem, data_selector){
  if($(elem).attr('checked')){
    var value = 1;
  }else{
    var value = 0;
  }
  $.post("backend.php",{ 
      "action": "save_setting", 
      "setting_key": setting_key, 
      "setting_value": value, 
      }, function(xml) {
    var success = $(xml).find('save_setting').find('success').text();
    $(data_selector).data(setting_key,value);
    if(success == "1"){
      topbar_notice("Setting Saved", '#settings_container');
    }else{
      topbar_notice("Setting NOT Saved", '#settings_container');
      $(elem).attr('checked','');
    }
  },"xml");

}
