<?php

    $recipient_list = [ '@AnatoliySamara', ];

    $file_handle = fopen("/sys/class/thermal/thermal_zone0/temp", "r");
    
	while (!feof($file_handle)) {
	 	$line = fgets($file_handle);
			   
	 	if ($line) {
	 	    $tempCPU = $line/1000;

            $connection = new PDO ('mysql:host=localhost; dbname=njkzy204_tempcpu; charset=utf8', '***', '***');
	 	    $connection->query("INSERT INTO `njkzy204_tempcpu`.`tempCPU` (`temperature`) VALUES ('$tempCPU');");

	 	    if ($tempCPU > 85) {
	 	        $arrDateAlarm = $connection->query("SELECT `date` FROM `njkzy204_tempcpu`.`tempCPU` ORDER BY `id` DESC LIMIT 1;");
	 	        foreach ($arrDateAlarm as $data) {
                    $dateAlarm = $data['date'];
                };
                
                $arrDateSend = $connection->query("SELECT `date` FROM `njkzy204_tempcpu`.`alarm_send` ORDER BY `id` DESC LIMIT 1;");
	 	        foreach ($arrDateSend as $data) {
                    $dateSend = $data['date'];
                };
                
                $date = strtotime($dateAlarm) - strtotime($dateSend);
                
                if ($date > 600) {
                    $connection->query("INSERT INTO `njkzy204_tempcpu`.`alarm_send` (`temperature`) VALUES ('$tempCPU');");
                    
                    // if (!file_exists('madeline.php')) {
                    //     copy('https://phar.madelineproto.xyz/madeline.php', 'madeline.php');
                    // };
                    include 'madeline.php';
                    
                    $MadelineProto = new \danog\MadelineProto\API('session.madeline');
                    $MadelineProto->start();                    
                    foreach ($recipient_list as $key=>$user) {
                        $MadelineProto->messages->sendMessage(['peer' => $user, 'message' => "Внимание! Температура CPU достигла " . $tempCPU . "°С."]);
                    };
                };
	        };
		};
	};
    
	fclose($file_handle);

?>