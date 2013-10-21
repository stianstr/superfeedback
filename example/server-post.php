<?php

$dir = __DIR__ . '/server-data';
if (!file_exists($dir))
	mkdir($dir);
if (!file_exists($dir))
	throw new Exception("No such dir: $dir");
$id = uniqid();
$file = $dir . '/' . $id;

$data = $_REQUEST;
#$image = $_REQUEST['screenshot'];
#unset($data['screenshot']);

$ok = file_put_contents($file.'.json', json_encode($data));
if (!$ok)
	throw new Exception("Could not write file: $file");

#file_put_contents($file.'.jpg', $image);

header('Content-Type: application/json');
print json_encode(array('id' => $id));

?>
