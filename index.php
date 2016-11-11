<?php

header('Access-Control-Allow-Origin: *');

require_once 'flight/Flight.php';

$dbhost = getenv('OPENSHIFT_MYSQL_DB_HOST');
$dbport = getenv('OPENSHIFT_MYSQL_DB_PORT');
$dbusername = getenv('OPENSHIFT_MYSQL_DB_USERNAME');
$dbpassword = getenv('OPENSHIFT_MYSQL_DB_PASSWORD');
$db_name = getenv('OPENSHIFT_GEAR_NAME');

$max_round = 4;
$player_per_table = 4;

Flight::register('db', 'PDO', array("mysql:host=$dbhost;port=$dbport;dbname=$db_name", $dbusername, $dbpassword), function($db) {
  $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
  $db->query ("set character_set_client='utf8'");
  $db->query ("set character_set_results='utf8'");
  $db->query ("set collation_connection='utf8_general_ci'");
});

function quote($input) {
  return $input ? "'$input'" : "NULL";
}

Flight::route('GET /api/info', function() {
  Flight::json(['status' => 'ok', 'data' => getallheaders()]);
});

Flight::route('GET /api/language', function() {
  Flight::json(['status' => 'ok', 'data' => explode(',', getallheaders()['Accept-Language'])]);
});

Flight::route('GET /api/status', function() {
  $conn = Flight::db();
  $data = $conn->query("SELECT status, round, time, lobby, delay FROM params WHERE id=1");

  if (!$data) {
    Flight::json(['status' => 'error', 'error' => 'query_failed']);
  } elseif ($data->rowCount() == 0) {
    Flight::json(['status' => 'error', 'error' => 'not_found']);
  } else {
    Flight::json(['status' => 'ok','data' => $data->fetch()]);
  }
});

function isForbidden2($params) {
  if (!isset($params['payload']) || $params['payload'] !== 'matte_is_the_greatest') {
    return true;
  }
  return false;
}

function isForbidden($params) {
  if (!isset($params['payload']) || $params['payload'] !== 'matte_is_the_greatest') {
    Flight::json(['status' => 'error', 'error' => 'forbidden']);
    return true;
  }
  return false;
}

function append($arrayFrom, $index, $arrayTo) {
  if (isset($arrayFrom[$index])) {
    $value = $arrayFrom[$index];
    $arrayTo[] = "$index=$value";
  }
  return $arrayTo;
}

function appendQuoted($arrayFrom, $index, $arrayTo) {
  if (isset($arrayFrom[$index])) {
    $arrayTo[] = "$index=".quote($arrayFrom[$index]);
  }
  return $arrayTo;
}

Flight::route('POST /api/status', function() {
  $params = json_decode(file_get_contents("php://input"), true);

  if (isForbidden($params)) return;

  $updates = [];
  $updates = appendQuoted($params, 'status', $updates);
  $updates = appendQuoted($params, 'lobby', $updates);
  $updates = append($params, 'time', $updates);
  $updates = append($params, 'round', $updates);
  $updates = append($params, 'delay', $updates);
  $set = implode($updates, ',');
  $data = Flight::db()->query("UPDATE params SET $set WHERE id=1");

  if (!$data) {
    Flight::json(['status' => 'error', 'error' => 'query_failed']);
  } else {
    Flight::json(['status' => 'ok']);
  }
});

Flight::route('GET /api/registrations', function() {
  $conn = Flight::db();
  $data = $conn->query("SELECT name FROM registrations WHERE anonymous=0");

  if (!$data) {
    Flight::json(['status' => 'error', 'error' => 'query_failed']);
  } else {
    $count = $conn->query("SELECT COUNT(*) as count FROM registrations");
    if (!$count) {
      Flight::json(['status' => 'error', 'error' => 'query_failed']);
    } else {
      $names = array_map(function($item) { return $item->name; }, $data->fetchAll());
      Flight::json(['status' => 'ok','data' => ['count' => $count->fetch()->count, 'names' => $names]]);
    }
  }
});

// Flight::route('GET /api/confirmed', function() {
//   $conn = Flight::db();
//   $data = $conn->query("SELECT name FROM confirms WHERE idle=1");
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed']);
//   } else {
//     $result = $data->fetchAll();
//     $names = array_map(function($item) { return $item->name; }, $result);
//     Flight::json(['status' => 'ok','data' => ['count' => count($result), 'names' => $names]]);
//   }
// });

Flight::route('POST /api/registrations', function() {
  $params = json_decode(file_get_contents("php://input"), true);
  if (isForbidden($params)) return;

  $conn = Flight::db();
  $data = $conn->query("SELECT name FROM registrations");

  if (!$data) {
    Flight::json(['status' => 'error', 'error' => 'query_failed']);
  } else {
    $names = array_map(function($item) { return $item->name; }, $data->fetchAll());
    Flight::json(['status' => 'ok','data' => $names]);
  }
});

// Flight::route('GET /api/results', function() {
//   $conn = Flight::db();
//   $data = $conn->query("SELECT id, player, state, score, place, url FROM results ORDER BY id ASC");
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed']);
//   } else {
//     $results = array_map(function($item) { return [$item->player, $item->state, $item->place, $item->score, $item->id, $item->url]; }, $data->fetchAll());
//     Flight::json(['status' => 'ok','data' => $results]);
//   }
// });

// Flight::route('POST /api/result', function() {
//   $params = json_decode(file_get_contents("php://input"), true);
//   if (isForbidden($params)) return;
//   $round = $params['round'];
//   $board = $params['board'];
//   $player = quote($params['player']);
//   $score = $params['score'];
//   $points = $params['points'];
//   $place = $params['place'];
//
//   $conn = Flight::db();
//   $sql = "UPDATE results SET score=$score,points=$points,place=$place WHERE round=$round AND board=$board AND player=$player";
//   $data = $conn->query($sql);
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed', 'query' => $sql]);
//   } else {
//     Flight::json(['status' => 'ok']);
//   }
// });

// Flight::route('POST /api/results', function() {
//   $params = json_decode(file_get_contents("php://input"), true);
//   if (isForbidden($params)) return;
//   $results = $params['data'];
//
//   $conn = Flight::db();
//
//   $data = $conn->query("SELECT round FROM params WHERE id=0");
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed']);
//   } else {
//     $round = $data->fetch()->round;
//     $sql = "";
//     for ($i = 0; $i < count($results); $i++) {
//       $name = $results[$i]['name'];
//       $score = $results[$i]['score'];
//       $place = $results[$i]['place'];
//       $points = $results[$i]['points'];
//       $sql = $sql."UPDATE results SET state='idle',score=$score,points=$points,place=$place WHERE round=$round AND player='$name';";
//     }
//
//     $data = $conn->query($sql);
//     if (!$data) {
//       Flight::json(['status' => 'error', 'error' => 'query_failed', 'query' => $sql]);
//     } else {
//       Flight::json(['status' => 'ok']);
//     }
//   }
//
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed', 'query' => $sql]);
//   } else {
//     Flight::json(['status' => 'ok']);
//   }
// });

// Flight::route('POST /api/seatings', function() {
//   $params = json_decode(file_get_contents("php://input"), true);
//   if (isForbidden($params)) return;
//
//   global $max_round;
//   global $player_per_table;
//
//   $seatings = $params['data'];
//   $size = count($seatings) / $max_round;
//   $values = array();
//   for ($i = 1; $i <= $max_round; $i++) { // rounds
//     for ($j = 1; $j <= $size; $j++) { // tables
//       for ($k = 1; $k <= $player_per_table; $k++) { // players
//         $name = $seatings[$j - 1 + ($i - 1) * $size][$k - 1];
//         $values[] = "($i, $j, '$name')";
//       }
//     }
//   }
//
//   $conn = Flight::db();
//   $sql = "DELETE FROM results WHERE 1; INSERT INTO results(round, board, player) VALUES ".implode(',', $values);
//   $data = $conn->query($sql);
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed', 'query' => $sql]);
//   } else {
//     Flight::json(['status' => 'ok']);
//   }
// });

// Flight::route('GET /api/confirmations', function() {
//   $conn = Flight::db();
//   $data = $conn->query("SELECT name, confirmation, idle FROM confirms");
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed']);
//   } else {
//     $results = array_map(function($item) {
//       return [$item->name, $item->confirmation, $item->idle];
//     }, $data->fetchAll());
//     Flight::json(['status' => 'ok','data' => $results]);
//   }
// });

// Flight::route('POST /api/updateConfirmations', function() {
//   $params = json_decode(file_get_contents("php://input"), true);
//   if (isForbidden($params)) return;
//   $players = $params['data'];
//   $caseQuery = "case";
//
//   for ($i = 0; $i < count($players); $i++) {
//     $value = $players[$i];
//     $caseQuery = $caseQuery." when name = '$value' then 1";
//     $caseQuery = $caseQuery." when idle = 1 then 1";
//   }
//
//   $caseQuery = $caseQuery." end";//$caseQuery = $caseQuery." else 0 end";
//
//   $conn = Flight::db();
//   $sql = "UPDATE confirms SET idle=($caseQuery) WHERE 1";
//   $data = $conn->query($sql);
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed', 'query' => $sql]);
//   } else {
//     Flight::json(['status' => 'ok']);
//   }
//
// });

// Flight::route('POST /api/confirmations', function() {
//   $params = json_decode(file_get_contents("php://input"), true);
//   if (isForbidden($params)) return;
//
//   $players = $params['data'];
//   $size = count($players);
//   $values = array();
//   for ($i = 0; $i < $size; $i++) {
//     $name = $players[$i];
//     $values[] = "('$name')";
//   }
//
//   $conn = Flight::db();
//   $sql = "DELETE FROM confirms WHERE 1; INSERT INTO confirms(name) VALUES ".implode(',', $values);
//   $data = $conn->query($sql);
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed', 'query' => $sql]);
//   } else {
//     Flight::json(['status' => 'ok']);
//   }
// });

// Flight::route('GET /api/totals', function() {
//   $conn = Flight::db();
//   $data = $conn->query("SELECT player, SUM(points) total, SUM(score) score, SUM(place) place FROM results WHERE player!='NoName' GROUP BY player ORDER BY total DESC");
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed']);
//   } else {
//     $results = array_map(function($item) { global $max_round; return [$item->player, $item->total, $item->score, $item->place / $max_round]; }, $data->fetchAll());
//     Flight::json(['status' => 'ok','data' => $results]);
//   }
// });

Flight::route('POST /api/apply', function() {
  $conn = Flight::db();

  $params = json_decode(file_get_contents("php://input"), true);
  //if (isForbidden($params)) return;

  $name = quote($params['name']);
  $contacts = quote($params['contacts']);
  $notify = $params['notify'];
  $anonymous = $params['anonymous'];
  $news = $params['news'];
  $lang = quote(getallheaders()['Accept-Language']);
  $data = $conn->query("INSERT INTO registrations(name, contacts, notify, anonymous, news, lang) VALUES($name, $contacts, $notify, $anonymous, $news, $lang)");

  if (!$data) {
    Flight::json(['status' => 'error', 'error' => 'query_failed']);
  } else {
    Flight::json(['status' => 'ok', 'data' => intval($conn->lastInsertId())]);
  }
});

Flight::route('POST /api/report', function() {
  $conn = Flight::db();

  $params = json_decode(file_get_contents("php://input"), true);

  $who = quote($params['name']);
  $message = quote($params['message']);

  $data = $conn->query("INSERT INTO reports(who, message) VALUES($who, $message)");

  if (!$data) {
    Flight::json(['status' => 'error', 'error' => 'query_failed']);
  } else {
    Flight::json(['status' => 'ok', 'data' => intval($conn->lastInsertId())]);
  }
});

// Flight::route('POST /api/replay', function() {
//   $conn = Flight::db();
//
//   $params = json_decode(file_get_contents("php://input"), true);
//   if (isForbidden2($params)) {
//     $url = quote($params['url']);
//
//     $data = $conn->query("INSERT INTO replays(url) VALUES($url)");
//
//     if (!$data) {
//       Flight::json(['status' => 'error', 'error' => 'query_failed']);
//     } else {
//       Flight::json(['status' => 'ok', 'data' => intval($conn->lastInsertId())]);
//     }
//   } else {
//     $url = quote($params['url']);
//     $round = $params['round'];
//     $board = $params['board'];
//
//     $data = Flight::db()->query("UPDATE results SET url=$url WHERE round=$round AND board=$board");
//
//     if (!$data) {
//       Flight::json(['status' => 'error', 'error' => 'query_failed']);
//     } else {
//       Flight::json(['status' => 'ok']);
//     }
//   }
//
//
// });

// Flight::route('GET /api/replays', function() {
//   $conn = Flight::db();
//   $data = $conn->query("SELECT url FROM replays");
//
//   if (!$data) {
//     Flight::json(['status' => 'error', 'error' => 'query_failed']);
//   } else {
//     $results = array_map(function($item) { return $item->url; }, $data->fetchAll());
//     Flight::json(['status' => 'ok','data' => $results]);
//   }
// });


Flight::start();
?>
