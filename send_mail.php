<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Charger autoload composer ici si utilisé
require 'vendor/autoload.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['to']) || empty($data['content'])) {
    echo json_encode(['success' => false, 'message' => 'Données invalides']);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.exemple.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'ton-email@exemple.com';
    $mail->Password = 'ton-motdepasse';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('ton-email@exemple.com', 'AirSend');
    $mail->addAddress($data['to']);

    $mail->Subject = $data['name'] ?? 'Message AirSend';

    if (($data['type'] ?? 'Texte') === 'HTML') {
        $mail->isHTML(true);
        $mail->Body = $data['content'];
    } else {
        $mail->isHTML(false);
        $mail->Body = strip_tags($data['content']);
    }

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Mail envoyé avec succès']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Erreur SMTP : {$mail->ErrorInfo}"]);
}
