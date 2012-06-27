<?php
/*
 * Feed_Class.php
 * A class representing a feed object in smoove. See description
 * above class name for more details.
 *
 * Written by Sam Williams
 * 1/26/2012
 *
 */



/*
 * generic exception class to use in FeedClass
 */
class FeedException extends Exception
{
  public function __construct($message) {
    parent::__construct($message, 0);
  }

  public function __toString() {
    echo('Error: ' . parent::getMessage());
  }
}

/*
 * Implimentation of a individual rss feed object for smoove
 * 
 * With this class you can 
 * 1)add a new feed to the database,
 * 2)update database with current posts for feed from the web
 * 3)add/remove (subscribe/unsubscribe) users
 * 4)get/set general info about feed
 *  
 * use:
 * @param int $id feed_id that is used in the database. Optional
 *
 */
class FeedClass
{

  private $db;//instance of database

  private $rss_location;//url of rss feed (ex: http://boingboing.net/rss.xml)
  private $www_location;//web version of rss feed (ex: http://boingboing.net)
  private $description;//description of the feed. This is usually pulled from the xml of the feed
  private $title; //title of feed. Stored in db as feed_name

  private $id;//INT id of the feed in local database. aka feed_id
  private $last_checked;//last time the remote/web version of the feed was checked
  private $users = array();//list of current users subscribed to feed
  private $cache;//cache instance for zend
  private $was_cached;//TRUE = we are using the locally cached version of the feed xml
  private $feed_data;//raw feed info from parser
  private $status; //0=disabled, 1=enabled
  private $location_locked;
  private $override_cache = FALSE;

  //when this is true, we are dealing with a new feed that has not been added to the db yet.
  private $new_feed = FALSE;

  /*
   * constructor
   * @param int $id = id of feed in db
   */
  function __construct($id = FALSE){
    //get config 
    $this->config = Zend_Registry::getInstance()->get('config'); 
    //do database setup stuff here
    $this->db = Zend_Registry::getInstance()->get('db'); 
    $this->table_posts = $this->config->database->tables->posts;
    $this->table_user_posts = $this->config->database->tables->user_posts;
    $this->table_feeds = $this->config->database->tables->feeds;
    $this->table_user_feeds = $this->config->database->tables->user_feeds;
    $this->table_feed_locations = $this->config->database->tables->feed_locations;

    //if we get passed a feed_id then populate the variables in the class
    if(is_numeric($id)){
      $this->setup_feed($id);
    }
  }

  /*
   * get users subscribed to feed
   * @param 
   * @return array $users = 1 dimensional array of user_id's 
   */
  public function get_users(){
    if(!$this->id){
      throw new FeedException("feed class not populated yet");
    }else{
      return $this->users;
    }
  }

  /*
   * get the last time the remote feed was checked
   * @return int unixtimestamp
   */
  public function get_last_checked(){
    if(!$this->id){
      throw new FeedException("feed class not populated yet");
    }else{
      return $this->last_checked;
    }
  }

  /*
   * set feed status
   * @param bool $status TRUE = enabled, FALSE = disabled(not going to be updated)
   */
  public function set_status($status){

  }

  /*
   * return status of feed. 
   * @return bool true=feed will not be updated. false=feed be updated
   */ 
  public function get_status(){
    if(!$this->id){
      throw new FeedException("feed class not populated yet");
    }else{
      return $this->status;
    }
  }

  /*
   * add a user to this feed. The feed will also get updated with most
   * current content from web. 
   * @param int $user_id
   * @param string $user_feed_name name that user wants to see in their feed list. if blank use default 
   * 
   */
  public function add_user($user_id, $user_feed_name = ''){

    if(!$this->id){
      throw new FeedException("feed class not populated yet");
    }elseif(!is_numeric($user_id)){
      throw new FeedException("not a valid user id");
    }elseif(isset($this->users)){
      if(in_array($user_id,$this->users)){
        $return_array['status'] = FALSE;
        $return_array['error'] = "already subscribed to feed";
        return $return_array; 
      }
    }
    $data = array(
        'feed_id' => $this->id,
        'user_id' => $user_id,
        'user_feed_name' => $user_feed_name
        );
    $this->db->insert($this->table_user_feeds, $data);

    //refresh the feed, so we know the user has the most recent posts
    $this->update_feed(TRUE);
    //make sure the users in the class is update to date
    //$this->get_feed_users();

    //add the actual user posts
    //$this->sync_user_posts($user_id);
    $return_array['status'] = TRUE;
    return $return_array;

  }
  /*
   * get a list of feeds from a given url
   * @param string $uri = website url
   * @return array $feed_links = array of links found inside html of given url
   */
  public function find_feed_links($url, &$error){
    $url = $this->clean_url($url);
    if($url == "" || $url == NULL){
      $error = "feed_link error: url is empty!";
      return NULL;
    }
    //$links = Zend_Feed_Reader::findFeedLinks('http://www.gizmodo.com');
    try{
      $links = Zend_Feed_Reader::findFeedLinks($url);
    } catch (Zend_Exception $e) {
      $error = $e->getMessage();
      return NULL;
    }
    $feed_links = array(); 
    foreach ($links as $link) {
      $feed_links[] = $link['href'];
      if($this->config->debug->verbose){
        echo "url:" . $link['href'] . "<br/>\n";
      }
    }
    return $feed_links;

  } 

  /*
   * update the database with the newest content
   * from the web
   */
  public function update_feed($override_cache = FALSE){
    if(!$this->id){
      throw new FeedException("No feed id is set");
    }

    $this->override_cache = $override_cache;
    $this->was_cached = FALSE;

    $error = NULL;
    $imported_feed = $this->import_feed($this->rss_location,$error);
    if(isset($error)){
      $error = "Update error: " . $error;
      return;
    }


    if($this->config->debug->verbose){
      echo "feed_url: " . $this->rss_location . "<br/>";
      echo "cached_status: " . $this->was_cached . "<br/>";
      echo "cached_disabled: " . $this->config->debug->cache_disabled . "<br/>";
    }

    if(!$this->was_cached || $this->config->debug->cache_disabled || $override_cache){

      if($imported_feed){
        $PostObject = new PostClass();

        //see if we need to add new entries to feed_locations table
        if($this->clean_url($imported_feed->getFeedLink()) != $this->rss_location){
          $this->update_feed_link($imported_feed->getFeedLink());
        }
        if($this->clean_url($imported_feed->getLink()) != $this->www_location){
          $this->update_www_link($this->clean_url($imported_feed->getLink()));
        }
        //for future use of pubsubhubbub
        //$hubs = $imported_feed->getHubs();
        $exclude_posts = array(); 
        foreach ($imported_feed as $entry) {
          $post_timestamp = $this->get_timestamp($entry);
          $post_author_array   = $entry->getAuthor();
          $title = $entry->getTitle();
          isset($post_author_array['name']) ? $post_author = $post_author_array['name'] : $post_author = '';
          !isset($title) ? $title = "" : NULL;

          $pdata = array(
              'id'           => NULL,
              'feed_id'      => $this->id,
              'title'        => $title,
              'post_subject'      => $entry->getDescription(),
              'post_timestamp' => $post_timestamp,
              'post_author'      => $post_author,
              'link'         => $entry->getLink(),
              'content'      => $entry->getContent(),
              'guid'         => $entry->getId(),
              'comment_count'=> 0
              );

          $exclude_posts[] = $PostObject->save_post_data($pdata,$this->users);
        }
        //if(!$override_cache){
          //$this->delete_outdated_posts($exclude_posts, $del_error);
        //}
      }
    }

  }



  /*
   * create a new feed in database
   * @param string $url website or rss feed url
   * @param string reference to error message that gets passed back if the feed won't get inserted
   * @param bool $ignore_alts set to true if we want to force provided url to be added, even if it is finds alt link
   * @return int feed_id
   */
  public function add_feed($url, &$error, $ignore_alts = FALSE){
    $this->override_cache = TRUE;
    $this->clear_feed_info();
    $url = $this->clean_url($url);

    $results = $this->add_feed_rss_link($url, $ignore_alts);
    if($results['found']){ 
      $error = $results['error'];
      return $this->id;
    }elseif(!$results['valid_rss']){
      //find a rss link from a web url and see if it's valid.
      $feed_links = $this->find_feed_links($url, $error);
      if(!isset($feed_links[0])){
        $error = "No valid rss feed found. No links found anywhere";
        return NULL;
      }
      $feed_link = $feed_links[0];
      $results = $this->add_feed_rss_link($feed_link, $ignore_alts);
      if($results['found']){
        $error = $results['error'] . " From web url provided";
        return $this->id;
      }elseif(!$results['valid_rss']){
        $error = $results['error'] . " From web url provided";
        return NULL;
      }
      $rss_location = $feed_link;
      $html_link = $url;
    }

    //we have a valid new feed. Time to insert it...
    //
    //set the class data up
    $feed_data = $results['feed_data'];
    if(!isset($feed_data)){
      throw new FeedException("Sanity check. We should already have valid feed_data at this point");
    }
    $this->rss_location = $url;
    if($feed_data->getTitle()){
      $this->title = $feed_data->getTitle();
    }else{
      $this->title = $this->rss_location;
    }
    $this->www_location = $this->clean_url($feed_data->getLink());

    //Make sure the RSS feed we are pointing to is the one the RSS feed tells us is
    //the most currect
    if($feed_data->getFeedLink()){
      $this->rss_location = $this->clean_url($feed_data->getFeedLink());
    }

    $this->description = $feed_data->getDescription();

    //now save to database
    $data = array(
        'feed_name' => $this->title,
        'rss_location' => $this->rss_location,
        'last_checked' => $this->last_checked,
        'www_location' => $this->www_location,
        'description' => $this->description,
        'id' => NULL
        );

    if($this->config->debug->verbose){
      echo "inserting new feed: " . $this->rss_location . "<br/>";
      //echo "FEED INSERTING CURRECTLY DISABLED<br/>";
      //echo "this is what would get inserted:<br/>";
      var_dump($data);
      echo "<br/>";
    }
    $this->db->insert($this->table_feeds, $data);
    $this->id = $this->db->lastInsertId();
    $this->insert_feed_location($this->rss_location);

    //user provided an html think to get this feed, so we should insert it as a known location
    if(isset($html_link) 
        && $this->rss_location != $html_link){

      $this->insert_feed_location($html_link);
    }
    if(isset($this->www_location)
        && isset($html_link)
        && ($this->rss_location != $this->www_location)
        && ($html_link != $this->www_location)){

      $this->insert_feed_location($this->www_location);
    }

    $this->new_feed = FALSE;
    return $this->id;



  }


  /*
   * set important data in this class to null so we don't
   * overwrite something in database that we shouldn't
   */
  private function clear_feed_info(){
    $this->id = NULL;
    $this->rss_location = NULL;
    $this->users = NULL;
  } 


  /*
   * return a comma separated string of post_ids from posts table that do not
   * have a corrisponding user_post table entry and have not been smooved.
   * 
   * @params $feed_id
   * @return string comma seperated string of post_id's
   *
   */
  private function get_orphaned_posts_clause($feed_id){
    if(isset($feed_id)){
      $feed_clause = "AND p.feed_id = " . $this->db->quote($feed_id);
    }else{
      $feed_clause = "";
    }
    $orphaned_posts_sql =  " SELECT p.id
      FROM " . $this->table_posts . " as p
      LEFT JOIN " . $this->table_user_posts . " as u 
      ON p.id = u.post_id 
      WHERE u.post_id is NULL 
      AND p.smoove_post = 0
      AND p.score < 1 " . $feed_clause;
    try {
      $orphaned_posts_result = $this->db->fetchAll($orphaned_posts_sql);
    } catch (Zend_Exception $e) {
      echo "Caught Exception: " . get_class($e) . "\n";
      echo "Message: " . $e->getMessage() . "\n";
      return NULL;
    }
    $post_ids = array();
    foreach($orphaned_posts_result as $post){
      $post_ids[] = $post['id']; 
    }
    if(!isset($post_ids[0])){
      return NULL;
    }else{
      return implode(",", $post_ids);
    }
  }

  /*
   * delete posts that are no longer needed in the database.
   * @param array $exclude_posts 1D array of post_ids that will NOT get deleted (this is usually
   * going to be posts that are in the current remote RSS feed, so we don't keep importing the same thing)
   * @return array of counts of how much data got deleted
   */
  public function delete_outdated_posts($exclude_posts, &$error){
    if(!isset($this->id)){
      $error = "Feed data is not populated";
      return NULL;
    }
    if(!$this->config->delete->enabled){
      $error = "deleting is currently disabled";
      return NULL;
    }

    //$delete_user_posts_sql = "SELECT u.id,
    //  u.post_timestamp 
    $from_user_posts_sql = " FROM " . $this->table_user_posts . "
      WHERE rec_score = 0
      AND cat_id = 0
      AND ((post_read = 1 AND post_timestamp < NOW() - INTERVAL " . $this->db->quote($this->config->delete->read_days) . " DAY)
          OR 
          (post_read = 0 AND post_timestamp < NOW() - INTERVAL " . $this->db->quote($this->config->delete->not_read_days) . " DAY))
      AND feed_id = " . $this->db->quote($this->id);

    //exclude any posts passed in via $exclude_posts
    if(count($exclude_posts)){
      $from_user_posts_sql = $from_user_posts_sql . " AND post_id NOT IN(" . implode(",", $exclude_posts) . ")";
    }


    if($this->config->debug->verbose){
      $select_user_posts_sql = "SELECT count(id) as deleted_count " . $from_user_posts_sql;
      $select_user_posts_result = $this->db->fetchAll($select_user_posts_sql);
      echo "user_posts deleted: " . $select_user_posts_result[0]['deleted_count'] . "<br>";
    }


    try {
      $delete_user_posts_sql = "DELETE " . $from_user_posts_sql;
      //echo "DELETE USER_POSTS DISABLED!<BR/>";
      $delete_user_posts_result = $this->db->fetchAll($delete_user_posts_sql);
    } catch (Zend_Exception $e) {
      echo "Delete user_posts Caught Exception: " . get_class($e) . "\n";
      echo "Message: " . $e->getMessage() . "\n";
    }
    if($this->config->debug->verbose){
      echo "delete user posts query: " . $delete_user_posts_sql . "<br/>";
    }

    $deleted_info['user_posts_deleted'] = $delete_user_posts_result;

    $orphaned_posts = $this->get_orphaned_posts_clause($this->id);

    //if there was nothing in associated posts table, return
    if(!isset($orphaned_posts)){
      $deleted_info['posts_deleted'] = 0;
      return $deleted_info;
    }

    //Now delete old data from posts table
    //we are doing this by deleting orphaned posts entries that don't have a corrisponding entry in user_posts
    $from_posts_sql = "
      FROM " . $this->table_posts . "
      WHERE comment_count <= 0
      AND smoove_post = 0
      AND id IN( " . $orphaned_posts . ")";

    if($this->config->debug->verbose){
      $select_posts_sql = "SELECT count(id) as post_count " . $from_posts_sql;
      $select_posts_result = $this->db->fetchAll($select_posts_sql);
      echo $this->table_posts . " deleted: " . $select_posts_result[0]['post_count'];
    }

    try {
      $delete_posts_sql = "DELETE " . $from_posts_sql;
      //echo "DELETE POSTS DISABLED!<BR/>";
      $delete_posts_result = $this->db->fetchAll($delete_posts_sql);
    } catch (Zend_Exception $e) {
      echo "delete posts Caught Exception: " . get_class($e) . "\n";
      echo "Message: " . $e->getMessage() . "\n";
    }

    if($this->config->debug->verbose){
      echo "delete posts query: " . $delete_posts_sql . "<br/>";
    }


    $deleted_info['posts_deleted'] = $delete_posts_result;

    return $deleted_info; 

  }


  /*
   * make sure we are dealing with a good url. must have http:// at beginning
   * @param string $url
   * @return string cleaned up url
   */
  private function clean_url($url){
    if(substr($url, 0, 7) != 'http://' && substr($url, 0, 8) != 'https://')
    {
      $url = 'http://' . $url;
    }
    $url = rtrim($url,"/");
    /*
       if (!filter_var($x, FILTER_VALIDATE_FLOAT)) {
       echo "$x is a valid float";
       } else {
       echo "$x is NOT a valid float";
       }
     */
    return $url;
  }


  private function strip_www($url){
    $url = str_replace("www.","",$url);
    return $url;
  }
  /*
   * update user_posts table to be in sync with posts table
   * @param int $user_id
   */
  private function sync_user_posts($user_id){
    //get post_id's that need to be added to user_posts table for this user
    // AND p.post_timestamp >= NOW() - INTERVAL " . $this->db->quote($this->config->delete->not_read_days) . " DAY
    $sql = "SELECT p.id,
      p.post_timestamp 
        FROM " . $this->table_posts . " as p
        WHERE p.feed_id = " . $this->db->quote($this->id) . "
        AND p.id NOT IN(SELECT u.post_id
            FROM " . $this->table_user_posts . " as u
            WHERE u.user_id = " . $this->db->quote($user_id) . " 
            AND u.feed_id = " . $this->db->quote($this->id) . ")";

    $result = $this->db->fetchAll($sql);
    //loop through each item in the feed and insert into database
    foreach($result as $post_data)
    {
      //
      //create entry in user_posts table for each of those post_id's
      //
      $post_id = $post_data['id']; 
      $user_post_data = array(
          'feed_id'        => $this->id,
          'post_id'         => $post_id,
          'post_timestamp' => $post_data['post_timestamp'],
          'user_id'  => $user_id,
          'cat_id'     => 0,
          'rec_score'     => 0,
          'post_read'     => 0
          ); 

      if($this->config->debug->verbose){
        echo "inserting user data for post: " . $user_id . "<br/>";
      }
      try{
      $this->db->insert($this->table_user_posts, $user_post_data);
      }catch (Zend_Exception $e) {
        $error = "import error: " . $e->getMessage();
        echo $error;
        return NULL;
      }
    }

  }

  /*
   * parse a zend_date and get timestamp from a post
   * @param zendObject $entry zend rss feed entry
   * @return timestamp in format Y-m-d H:i:s
   */
  private function get_timestamp($entry){

    $zend_timestamp = $entry->getDateModified();

    if($zend_timestamp){
      $post_timestamp = $zend_timestamp->get(Zend_Date::W3C);
    }else{
      $zend_timestamp = $entry->getDateCreated();
      if($zend_timestamp){
        if($this->config->debug->verbose){
          echo "timestamp: getDateCreated ";
        }
        $post_timestamp = $zend_timestamp->get(Zend_Date::W3C);
      }else{

        if($this->config->debug->verbose){
          echo "timestamp: current time ";
        }
        $post_timestamp = date ("Y-m-d H:i:s");
      }
    }
    return $post_timestamp;
  }

  /*
   * save the last time the feed was checked into the database
   * @param string $last_checked ("Y-m-d H:i:s")
   */
  private function save_last_checked($last_checked){

    $this->last_checked = $last_checked;
    $this->save_feed_info();
  }

  /*
   * search for a feed based off of $rss_location and populate class with info
   * @param string $rss_location
   * @return array id,rss_location, feed_name, last_checked of feed
   */
  public function find_feed($rss_location){
    $rss_location = $this->clean_url($rss_location);
    if(!isset($rss_location)){
      return NULL;
    }
    $sql = "SELECT feed_id
      FROM " . $this->table_feed_locations . "
      WHERE uri_hash = 
      UNHEX(MD5(" . $this->db->quote($rss_location) . "))"
      ;
    $result = $this->db->fetchRow($sql);
    if(!isset($result['feed_id'])){
      return NULL;
    }else{
      return $result['feed_id'];
    }
  }


  /*
   * save the current feed info in this class to the db
   *
   */
  private function save_feed_info(){

    if(!$this->id){ 
      throw new Exception("Can not save. No feed set");
    }

    //$sql = 'SELECT * FROM nucleus_plug_danger_user_posts limit ?';
    $sql = 'UPDATE ' . $this->table_feeds . '
      SET feed_name = ' . $this->db->quote($this->title) . ',
          last_checked = ' . $this->db->quote($this->last_checked) . ',
          rss_location = ' . $this->db->quote($this->rss_location) . '
            WHERE id = ' . $this->db->quote($this->id);

    $result = $this->db->fetchAll($sql);

  }


  /*
   * setup of the class with the given feed_id
   * @param int $feed_id
   * @return 
   */
  private function setup_feed($feed_id){

    $sql = 'SELECT f.id 
      , f.rss_location
      , f.www_location
      , f.feed_name 
      , f.last_checked
      , f.disabled
      , f.location_locked
      FROM ' . $this->table_feeds . ' as f
      WHERE f.id = ' . $this->db->quote($feed_id) . '
      ORDER BY f.id';

    $result = $this->db->fetchAll($sql);

    if(count($result)){

      $this->id = $result[0]['id'];
      $this->rss_location = $result[0]['rss_location'];
      $this->www_location = $result[0]['www_location'];
      $this->title = $result[0]['feed_name'];
      $this->last_checked = $result[0]['last_checked'];
      $this->location_locked = $result[0]['location_locked'];
      $this->disabled = $result[0]['disabled'];

      $this->get_feed_users();
      return TRUE;
    }

  }


  /*
   * pull down the rss feed from the web. we are assuming $rss_location is currently set
   * @return object Zend_Feed_Reader object containing all the info from the feed
   */
  private function import_feed($rss_location, &$error){


    //first check the cache
    if(!$this->config->debug->cache_disabled && !$this->override_cache){
      $this->load_cache();
      Zend_Feed_Reader::setCache($this->cache);
    }
    Zend_Feed_Reader::useHttpConditionalGet();
    try {
      $feed_data = Zend_Feed_Reader::import($rss_location);
    } catch (Zend_Exception $e) {
      $error = "import error: " . $e->getMessage();
      return NULL;
    }


    //sync up cached date. If the date on the cache is newer, then 
    //the we are not using the cached version. 

    if(!$this->config->debug->cache_disabled && !$this->override_cache){
      $cache_id = "Zend_Feed_Reader_" . md5($this->rss_location);
      //this will return array of metadata. mtime is the one we want
      $metadata = $this->cache->getMetadatas($cache_id);
      $last_modified = date("Y-m-d H:i:s",$metadata['mtime']);

      if($last_modified > $this->last_checked){
        if(!$this->new_feed){
         $this->save_last_checked($last_modified);
        }
        //new content was found and pulled down, so we return true
        $this->was_cached = FALSE;
      }else{
        //we pulled in the cached version
        $this->was_cached = TRUE;
      }
    }else{
        $this->was_cached = FALSE;
    }

    return $feed_data;

  }

  /*
   * initilize the cache 
   */
  private function load_cache(){

    $frontendOptions = array(
        'lifetime' => 86400,
        'automatic_serialization' => true
        );

    
    $backendOptions = array('cache_dir' => $this->config->cache->location);
    try {
      $cache = Zend_Cache::factory(
          'Core', 'File', $frontendOptions, $backendOptions
          );
    } catch (Zend_Exception $e) {
      echo "Caught Exception: " . get_class($e) . "\n";
      echo "Message: " . $e->getMessage() . "\n";
    }
    $this->cache = $cache;
    return;
  }

  /*
   * get users of feed from db and store them in $user
   * @return array 1 dimensional array of user_id's
   */
  private function get_feed_users(){

    $sql = 'SELECT u.user_id 
      FROM ' . $this->table_user_feeds . ' as u
      WHERE u.feed_id = ' . $this->db->quote($this->id) . ' 
      ORDER BY u.user_id';

    $result = $this->db->fetchAll($sql);
    $users = array();
    foreach($result as $user){
      $users[] = $user['user_id'];
    }
    $this->users = $users;
  }

  /*
   * insert a feed into the feed_locations table. 
   */
  private function insert_feed_location($uri){

    //(UNHEX(MD5(\''.$url.'\'))) 
    $quoted_uri = $this->db->quote($uri); 

    $curr_feed_data = array("feed_id"=>$this->id,
        "uri" => $uri,
        "uri_hash" => new Zend_Db_Expr('UNHEX(MD5('. $quoted_uri . '))'),
        );

    if($this->config->debug->verbose){
      echo "inserting feed into locations table: " . $quoted_uri . "<br/>";
    }
    $this->db->insert($this->table_feed_locations, $curr_feed_data);


  }

  private function update_www_link($rss_location){

    if($rss_location == $this->www_location
        || $rss_location == ""
        || $this->location_locked)
      return null;

    $feed_id = $this->find_feed($rss_location);
    if(isset($feed_id)){
      if($this->config->debug->verbose){
        echo "feed already exists in feed_locations table. Not inserting<br/>";
      }
    }else{
      $this->insert_feed_location($rss_location);
    }
    //now we update the active rss location in feeds table
    $feed_data = array(
        'www_location'        => $rss_location,
        ); 

    $where = $this->db->quoteInto("id = ?",$this->id);
    if($this->config->debug->verbose){
      echo "updating feed www location to: " . $rss_location . "<br/>";
    }
    $this->db->update($this->table_feeds, $feed_data, $where);


  }

  private function update_feed_link($rss_location){

    if($rss_location == $this->rss_location
        || $rss_location == ""
        || $this->location_locked)
      return null;

    $feed_id = $this->find_feed($rss_location);
    if(isset($feed_id)){
      if($this->config->debug->verbose){
        echo "feed already exists in feed_locations table. Not inserting<br/>";
      }
    }else{
      $this->insert_feed_location($rss_location);
    }
    //now we update the active rss location in feeds table
    $feed_data = array(
        'rss_location'        => $rss_location,
        ); 

    $where = $this->db->quoteInto("id = ?",$this->id);
    if($this->config->debug->verbose){
      echo "updating feed rss location to: " . $rss_location . "<br/>";
    }
    $this->db->update($this->table_feeds, $feed_data, $where);


  }

  /*
   * attempt to import feed and see if FeedLink provided in feed is already in db
   */
  private function add_feed_rss_link($url, $ignore_alts){
    //initilize the found variable.
    $return_data['found'] = FALSE;

    //make sure we don't already have the feed in the db
    $feed_id = $this->find_feed($url);
    if(isset($feed_id)){
      $this->setup_feed($feed_id); 
      $return_data['error'] = "Feed provided already exists in db: " . $this->id;
      $return_data['found'] = TRUE;
      return $return_data;
    }


    //given rss location was not in database, now make sure it's not 
    //in the database under the feed location that is stored in the xml 
    //of the url provided. Ex: old bb url: http://www.boingboing.net/index.rdf redirects to 
    //http://feeds.feedburner.com/boingboing/iBag and gives the feed location in the xml as http://feeds.feedburner.com/boingboing/iBag
    //So we should be able to pass in either of those feeds and get back the same feed_id
    $this->new_feed = TRUE;
    $feed_data = $this->import_feed($url, $error);
    if(isset($error)){
      $return_data['error'] = $error;
      $return_data['valid_rss'] = FALSE;
      return $return_data;
    }
    $return_data['valid_rss'] = TRUE;

    //Bypass the rest of the logic to check alt links, if $ignore_alt = TRUE
    if($ignore_alts){
      $this->rss_locaiton = $url;
      $return_data['feed_data'] = $feed_data;
      return $return_data;
    }

    //check to make sure the RSS link providied inside rss feed is not in db
    $feed_id = $this->find_feed($feed_data->getFeedLink());
    if(isset($feed_id)){
      $this->setup_feed($feed_id); 
      $return_data['found'] = TRUE;
      $return_data['error'] = "Feed already exists in db. Found in FeedLink(rss) provided by rss feed" ;
      $return_data['feed_id'] = $this->id;
      return $return_data;
    }

    //check to make sure the WWW link providied inside rss_feed is not in db
    $feed_id = $this->find_feed($feed_data->getLink());
    if(isset($feed_id)){
      $this->setup_feed($feed_id); 
      $return_data['found'] = TRUE;
      $return_data['error'] = "Feed already exists in db. Found in GetLink(www) provided by rss feed" ;
      $return_data['feed_id'] = $this->id;
      return $return_data;
    }
    $this->rss_locaiton = $url;
    $return_data['feed_data'] = $feed_data;
    return $return_data;

  }





}

