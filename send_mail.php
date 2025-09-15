<?php
header("Content-Type: application/json; charset=UTF-8");

// Autoriser uniquement les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée. Utilise POST."
    ]);
    exit;
}

// Récupérer les données envoyées en JSON
$data = json_decode(file_get_contents("php://input"), true);

// Vérification des paramètres
if (!$data || empty($data['to']) || empty($data['content'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Paramètres manquants (to, content)"
    ]);
    exit;
}

$to      = $data['to'];                  // destinataire
$subject = $data['name'] ?? "Sans sujet"; // sujet du mail
$content = $data['content'];              // contenu
$type    = strtolower($data['type'] ?? "text"); // type : html ou texte

// Construction du message et des en-têtes
$headers = "From: MonApp <no-reply@monapp.com>\r\n";

if ($type === "html") {
    $message  = "<html><body>" . $content . "</body></html>";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
} else {
    $message = $content;
}

// Tentative d'envoi
if (mail($to, $subject, $message, $headers)) {
    echo json_encode([
        "success" => true,
        "message" => "Mail envoyé à $to"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Échec de l'envoi du mail"
    ]);
}
