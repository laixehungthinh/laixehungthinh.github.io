<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
$file=__DIR__.'/stats-data.json';
$input=json_decode(file_get_contents('php://input'),true);
if(!is_array($input)) $input=$_POST;
$action=$input['action']??'';

$fp=@fopen($file,'c+');
if(!$fp){ http_response_code(500); echo json_encode(['error'=>'stats-file-unavailable']); exit; }
flock($fp,LOCK_EX);
rewind($fp);
$raw=stream_get_contents($fp);
$data=json_decode($raw,true);
if(!is_array($data)) $data=['views'=>0,'ratings'=>[]];
if(!isset($data['views'])) $data['views']=0;
if(!isset($data['ratings'])||!is_array($data['ratings'])) $data['ratings']=[];

if($action==='view') $data['views']=(int)$data['views']+1;
if($action==='rating'){
  $rating=(int)($input['rating']??0);
  if($rating>=1 && $rating<=5) $data['ratings'][]=$rating;
}

rewind($fp);
ftruncate($fp,0);
fwrite($fp,json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
fflush($fp);
flock($fp,LOCK_UN);
fclose($fp);
echo json_encode($data,JSON_UNESCAPED_UNICODE);
