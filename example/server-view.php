<?php

$dir = __DIR__ . '/server-data';
$id = $_REQUEST['id'];
$file = $dir . '/' . $id . '.json';
#print $file;
$data = json_decode(file_get_contents($file), true);

?>

<div style="float: left; width: 400px; border: 1px solid #aaa; padding: 10px;font-family: arial; font-size: 12px;">
 <? foreach ($data as $k => $v) { if ($k == 'screenshot') continue; ?>
   <div>
    <span class="label" style="text-transform: uppercase; font-weight: bold; display: block"><?= $k ?></span>
    <span class="value" style="display: block; margin-bottom: 10px"><?= $v ?></span>
   </div>
 <? } ?>
</div>

<div style="float: left; width: 800px; border: 1px solid #aaa; margin-left: 20px;padding: 10px;">
 <img src="<?= $data['screenshot'] ?>" style="max-width: 800px" />
</div>
