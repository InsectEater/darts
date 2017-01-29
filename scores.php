<?php
if ( !isset( $_GET['action'] ) )
    output_and_die( 'Command not exist' );

if ( !class_exists('SQLite3') ) {
   output_and_die( 'SQLite3 extention not installed' );
}

if (file_exists('./scores.db')) {
    $db = new SQLite3 ('scores.db');
} else {
    $SQL = <<<SQL
    CREATE TABLE `scores` (
        `id` CHAR(6) NOT NULL,
        `md5` CHAR(32) NOT NULL,
        `data` CHAR(32),
        `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    );
SQL;
    $db = new SQLite3 ('scores.db');    
    @$result = $db->query( $SQL );
    if (!$result)
        output_and_die( $db->lastErrorMsg() );
    output_and_die('Database created', 'OK');
}

switch ( $_GET['action'] ) {
    case 'get':
        get();
        break;
    case 'put':
        put();
        break;
    case 'content':
        content();
        break;
    default: 
        output_and_die( 'Command not recognized' );
        break;
}

function get() {
    global $db;
    if ( !isset($_GET['data']) )
        $_GET['data'] = '';
    switch ($_GET['data']) {
        case 'id':
            clear_old_records();
            $body = array(
              'id'    => generate_id(),
              'token' => md5 ( uniqid() )
            );
            output_and_die('Id generated', 'OK',  $body);
            break;
        case '':
            show_lastest_record();
            break;
        default:
            $id = substr($_GET['data'], 0, 32);
            $stmt = $db->prepare('SELECT * FROM `scores` WHERE  id = ?;');
            $stmt->bindValue(1, $id, SQLITE3_TEXT);
            $result = $stmt->execute();
            if (false == $result)
                output_and_die( $db->lastErrorMsg() );
            $result = $result->fetchArray(SQLITE3_ASSOC);
            if (false == $result)
                output_and_die( 'The requested data not found' );
            output_and_die( 'Scores extracted', 'OK', array('id'=>$id, 'content' => $result['data'] ) );
            break;
    }
}

function output($msg, $status ='ERROR', $body = false) {
    echo json_encode(array(
        'status' => $status,
        'msg'    => $msg,
        'body'   => $body,
    ));
}

function output_and_die($msg, $status='ERROR', $body = false) {
    output($msg, $status, $body);
    die();
}

function generate_id($length = 6) {
    global $db;
    $chars = 'abcdefgjijklmnopqrstuvwxyz123456789';
    $stmt = $db->prepare('SELECT count(`id`) as count FROM `scores` WHERE  id = ?;');
    $id = '';
    while ( '' == $id ) {
        for ($i = 0; $i < $length; $i++) {
            $pos = rand(0, strlen($chars) - 1);
            $id .= $chars[ $pos ];
        }
        $stmt->bindValue(1, $id, SQLITE3_TEXT);
        $result = $stmt->execute();
        if (false == $result)
            output_and_die( $db->lastErrorMsg() );
        $result = $result->fetchArray(SQLITE3_ASSOC);
        if ( $result['count'] > 0 )
            $id = '';
        $stmt->clear();
    }
    return $id;
}

function put() {
    //Prepare data
    global $db;
    $_POST['id'] = substr($_POST['id'], 0, 32);
    $_POST['token'] = substr($_POST['token'], 0, 32);
    //$_POST['data'] = $_POST['data'] );

    //Get data for this id
    $stmt = $db->prepare('SELECT * FROM `scores` WHERE  id = ?;');
    $stmt->bindValue(1, $_POST['id'], SQLITE3_TEXT);
    $result = @$stmt->execute();
    if (false == $result)
        output_and_die( $db->lastErrorMsg() );
    $result = $result->fetchArray(SQLITE3_ASSOC);

    //Check if we are allowed to write data
    if ( !empty($result['id']) && ( $_POST['token'] != $result['md5'] ) )
        output_and_die( 'Security token do not match' );

    //Write data
    $stmt = $db->prepare('INSERT OR REPLACE INTO `scores` (id, md5, data) VALUES (?, ?, ?)');
    $stmt->bindValue(1, $_POST['id'], SQLITE3_TEXT);
    $stmt->bindValue(2, $_POST['token'], SQLITE3_TEXT);
    $stmt->bindValue(3, $_POST['data'], SQLITE3_TEXT);
    $result = @$stmt->execute();
    if (false == $result)
        output_and_die( $db->lastErrorMsg() );
    //$result = $result->fetchArray();
    output_and_die( 'Scores updated', 'OK');
}

function content() {
    global $db;
    $stmt = $db->prepare('SELECT * FROM `scores`;');
    $result = @$stmt->execute();
    echo "-------------------------\r\n";
    while ( $row = $result->fetchArray( SQLITE3_ASSOC ) ) {
        var_dump($row);
    }
    echo "-------------------------\r\n";
    clear_old_records();
}

function show_lastest_record() {
    global $db;
    $stmt = $db->prepare('SELECT * FROM `scores` ORDER BY `CREATED` DESC LIMIT 1;');
    $result = @$stmt->execute();
    if (false == $result)
        output_and_die( $db->lastErrorMsg() );
    $result = $result->fetchArray( SQLITE3_ASSOC );
    if (!$result['id'])
        output_and_die( 'No score records in database found' );
    output_and_die( 'Latest scores extracted', 'OK', array('id' => $result['id'], 'content' => $result['data'] ) );
};


function clear_old_records($age = '1 week') {
    global $db;
    $interval = DateInterval::createFromDateString($age);
    $deadline = new DateTime();
    $deadline->sub($interval);

    $stmt = $db->prepare('DELETE FROM `scores` WHERE `created` < ?;');
    $stmt->bindValue(1, $deadline->format('Y-m-d H:i:s'), SQLITE3_TEXT);
    $result = @$stmt->execute();
    if (false == $result)
        output_and_die( $db->lastErrorMsg() );
    
}