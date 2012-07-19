function iScrollToElement(theElement){

    var selectedPosX = 0;
    var selectedPosY = -40;
          
    while(theElement != null){
        selectedPosX += theElement.offsetLeft;
        selectedPosY += theElement.offsetTop;
        theElement = theElement.offsetParent;
    }
    
    window.scrollTo(selectedPosX,selectedPosY);
}

function selectNextPost(){
    if($('#selected').next().length){
            $('#selected').hide();
            selected_item = document.getElementById("selected");
            next_item = selected_item.nextSibling.nextSibling;
            iScrollToElement(next_item);
            //selected_item.style.color = "";
            selected_item.style.border="none";
            selected_item.id = "";
            next_item.style.border="red 1px solid";
            //next_item.style.color = "red";
            next_item.id = "selected";
            $('#selected').show();
    }
}

function flag_upto(id)
{    
        elements = document.forms[0].elements;
        
        for(i=0; i<elements.length; i++)
        {
            elements[i].checked = true;
            
            if(elements[i].name == id)
            {
                break;
            }//endif
        }//endfor
}

function flag_all()
{    
	elements = document.forms[0].elements;
	
	for(i=0; i<elements.length; i++)
	{
		elements[i].checked = true;
	}
}

function unflag_all()
{
	elements = document.forms[0].elements;
	
	for(i=0; i<elements.length; i++)
	{
		elements[i].checked = false;
	}
}

function mark_read()
{ 
          document.items['action'].value = 'read';
	        document.items['return'].value = escape(location);
	        document.items.submit();
}

function mark_unread()
{
	document.items['action'].value = 'unread';
	document.items['return'].value = escape(location);
	document.items.submit();
}

function mark_saved()
{
	document.items['action'].value = 'save';
	document.items['return'].value = escape(location);
	document.items.submit();
}
function mark_id_saved(page_id)
{
	document.items['pagelink'].value = page_id;
	document.items.submit();
}
function mark_unsaved()
{
	document.items['action'].value = 'unsave';
	document.items['return'].value = escape(location);
	document.items.submit();
}
function mark_smooved()
{
	document.items['action'].value = 'smoove';
	document.items['return'].value = escape(location);
	document.items.submit();
}
function mark_desmooved()
{
	document.items['action'].value = 'desmoove';
	document.items['return'].value = escape(location);
	document.items.submit();
}
function select_item_comment(e){
    var evtobj=window.event? event : e; //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    var unicode=evtobj.charCode? evtobj.charCode : evtobj.keyCode;
    var actualkey=String.fromCharCode(unicode);
            
            
    if (actualkey=="w")
    {
        window.close();
    }
}

function clear_keys(e){
    var evtobj=window.event? event : e; //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    var unicode=evtobj.charCode? evtobj.charCode : evtobj.keyCode;
    var actualkey=String.fromCharCode(unicode);
            
            
    if (actualkey=="j")
    {
    }
    if (actualkey=="k")
    {
    }

    if (actualkey=="s")
    {
    }
    if (actualkey=="e")
    {
    }
    if (actualkey=="u")
    {
    }
    if (actualkey=="r")
    {    
    }
    if (actualkey=="n")
    {
        }
    if (actualkey=="p")
    {
    }
    if (actualkey=="p")
    {
    }



}

function get_key_bindings(){
  $(document).bind('keydown', 'j', function(){
        selectedPosY = window.pageYOffset + 35;
        selectedPosX = window.pageXOffset;
        window.scrollTo(selectedPosX,selectedPosY);
  });

  $(document).bind('keydown', 'k', function(){
        selectedPosY = window.pageYOffset - 35;
        selectedPosX = window.pageXOffset;
        window.scrollTo(selectedPosX,selectedPosY);
  });

  $(document).bind('keydown', 's', function(){
        selected_item = document.getElementById("selected");
        smooveItButton(selected_item.getAttribute("name"));
  });

  $(document).bind('keydown', 'r', function(){
        if (confirm("mark read?")) 
        {
            var position = $("#selected").children(":first").attr('id');
            markPostsRead(post_ids,position);
        }
  });

  $(document).bind('keydown', 'n', function(){
    
    if($('#selected').next().length){
            selected_item = document.getElementById("selected");
            next_item = selected_item.nextSibling.nextSibling;
            ScrollToElement(next_item);
            //selected_item.style.color = "";
            selected_item.style.border="none";
            selected_item.id = "";
            next_item.style.border="red 1px solid";
            //next_item.style.color = "red";
            next_item.id = "selected";
    }
  });

  $(document).bind('keydown', 'p', function(){
        selected_item = document.getElementById("selected");
        if(selected_item.previousSibling.previousSibling.hasAttributes() &&
            selected_item.previousSibling.previousSibling.tagName == "DIV")
        {
            prev_item = selected_item.previousSibling.previousSibling;
            ScrollToElement(prev_item);


            selected_item.style.border="none";
            selected_item.id = "";
            prev_item.style.border="red 1px solid";
            //prev_item.style.color = "red";
            prev_item.id = "selected";
        }

  });

 $(document).bind('keydown', 'c', function(){

  selected_item = document.getElementById("selected");
  var post_id = selected_item.getAttribute("name");
  ScrollToElement(document.getElementById('comments' + post_id));
  });

 $(document).bind('keydown', '', function(){
  });



}


function select_item_old(e){
    var evtobj=window.event? event : e; //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    var unicode=evtobj.charCode? evtobj.charCode : evtobj.keyCode;
    var actualkey=String.fromCharCode(unicode);
            
            
    if (actualkey=="j")
    {
        selectedPosY = window.pageYOffset + 20;
        selectedPosX = window.pageXOffset;
        window.scrollTo(selectedPosX,selectedPosY);
    }
    if (actualkey=="k")
    {
        selectedPosY = window.pageYOffset - 20;
        selectedPosX = window.pageXOffset;
        window.scrollTo(selectedPosX,selectedPosY);
    }

    if (actualkey=="s")
    {
        selected_item = document.getElementById("selected");
        smoove_link(selected_item.getAttribute("name"));
    }
    if (actualkey=="e")
    {
        selected_item = document.getElementById("selected");
        save_link(selected_item.getAttribute("name"));
    }
    if (actualkey=="u")
    {
        selected_item = document.getElementById("selected");
        unsave_link(selected_item.getAttribute("name"));
    }
    if (actualkey=="r")
    {    
        if (confirm("mark read?")) 
        {
            selected_item = document.getElementById("selected");
            flag_upto('c' + selected_item.getAttribute("name"));
            mark_read();
        }

    }
    if (actualkey=="n")
    {
        selected_item = document.getElementById("selected");
        if(selected_item.nextSibling.nextSibling.hasAttributes() &&
            selected_item.nextSibling.nextSibling.tagName == "DIV")
        {
            next_item = selected_item.nextSibling.nextSibling;
            ScrollToElement(next_item);
            //selected_item.style.color = "";
            selected_item.style.border="none";
            selected_item.id = "";
            next_item.style.border="red 1px solid";
            //next_item.style.color = "red";
            next_item.id = "selected";
        }
    }
    if (actualkey=="p")
    {
        selected_item = document.getElementById("selected");
        if(selected_item.previousSibling.previousSibling.hasAttributes() &&
            selected_item.previousSibling.previousSibling.tagName == "DIV")
        {
            prev_item = selected_item.previousSibling.previousSibling;
            ScrollToElement(prev_item);


            selected_item.style.border="none";
            selected_item.id = "";
            prev_item.style.border="red 1px solid";
            //prev_item.style.color = "red";
            prev_item.id = "selected";
        }
    }
}
function clickSelect(theElement)
{
        selected_item = document.getElementById("selected");
        if(selected_item.id != theElement.id )
        {
            ScrollToElement(theElement);
            selected_item.style.border="none";
            selected_item.id = "";
            theElement.style.border="red 1px solid";
            theElement.id = "selected";
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
function smoove_link(post_id)
	{
		var link = 'comments.php?post_id=' + post_id + '&action=smoove';
		var load = window.open(link,'smooved','width=500,height=400,scrollbars=yes,toolbar=yes,location=yes');
		if(window.focus)
            {
                load.focus();
            }
	}
function unsave_link(post_id)
	{
		var link = 'comments.php?post_id=' + post_id + '&action=unsave';
		var load = window.open(link,'unsaved','width=500,height=400,scrollbars=yes,toolbar=yes,location=yes');
		if(window.focus)
        {
            load.focus();
        }
	}

function save_link(post_id)
	{
		var link = 'comments.php?post_id=' + post_id + '&action=save';
		var load = window.open(link,'saved','width=500,height=400,scrollbars=yes,toolbar=yes,location=yes');
		if(window.focus)
        {
            load.focus();
        }
	}
function blogit_link(post_id)
    {
        if(post_id)
        {
 		    var link = 'blogit.php?post_id=' + post_id;
        }else
        {
            var link = 'blogit.php';
        }

		var load = window.open(link,'blogit','resizable=yes,width=600,height=500,scrollbars=yes,toolbar=no,location=no');
		if(window.focus){load.focus()}
    }
function edit_link(post_id)
    {
        if(post_id)
        {
 		    var link = 'blogit.php?type=blog&post_id=' + post_id;
        }else
        {
            var link = 'blogit.php';
        }

		var load = window.open(link,'blogit','resizable=yes,width=600,height=500,scrollbars=yes,toolbar=no,location=no');
		if(window.focus){load.focus()}
    }
    function email_link(post_id)
	{
		var link = 'comments.php?post_id=' + post_id + '&action=email';
		var load = window.open(link,'email','width=500,height=400,scrollbars=yes,toolbar=yes,location=yes');
		if(window.focus)
        {
            load.focus();
        }
	}

