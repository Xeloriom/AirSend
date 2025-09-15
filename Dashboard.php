<?php
// --- Partie traitement PHP ---
$messageStatus = null;

if (isset($_GET['send']) && isset($_GET['to'])) {
    $to = $_GET['to'];
    $subject = $_GET['subject'] ?? "Test Mail";
    $content = $_GET['content'] ?? "Message vide";

    $headers = "From: AirSend <no-reply@airsend.com>\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";

    $htmlMessage = "<html><body>$content</body></html>";

    if (mail($to, $subject, $htmlMessage, $headers)) {
        $messageStatus = "✅ Mail envoyé à $to";
    } else {
        $messageStatus = "❌ Échec d'envoi du mail.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr" class="h-full">
<head>
    <meta charset="UTF-8" />
    <title>AirSend Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="h-screen w-screen">

<?php if ($messageStatus): ?>
    <div class="p-4 bg-green-200 text-green-800 text-center font-bold">
        <?= htmlspecialchars($messageStatus) ?>
    </div>
<?php endif; ?>

<!-- Ton HTML existant -->
<main class="p-10">
    <h1 class="text-3xl font-thin mb-6">Gestion Clients</h1>
    <button onclick="sendMail('houirib@gmail.com')"
            class="px-6 py-3 rounded bg-blue-500 text-white">
        Envoyer mail test
    </button>
</main>

<script>
// Simule l’envoi : recharge la page avec des paramètres GET
function sendMail(to) {
    const subject = "Test AirSend";
    const content = "<h2>Hello depuis AirSend</h2><p>Ceci est un test</p>";
    window.location.href = `?send=1&to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&content=${encodeURIComponent(content)}`;
}
</script>

</body>
</html>
