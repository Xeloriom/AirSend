<?php
header('Content-Type: application/json');

// Récupérer les données envoyées par fetch()
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['to']) || empty($data['content'])) {
    echo json_encode(["success" => false, "message" => "Paramètres manquants"]);
    exit;
}

$to = $data['to'];
$subject = $data['name'] ?? "Sans sujet";
$content = $data['content'];
$type = $data['type'] ?? "Texte";

// Construction du message
if (strtolower($type) === "html") {
    $message = "<html><body>" . $content . "</body></html>";
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
} else {
    $message = $content;
    $headers = "";
}

// Expéditeur par défaut
$headers .= "From: MonApp <no-reply@monapp.com>\r\n";

// Envoi
if (mail($to, $subject, $message, $headers)) {
    echo json_encode(["success" => true, "message" => "Mail envoyé à $to"]);
} else {
    echo json_encode(["success" => false, "message" => "Échec de l'envoi"]);
}
