<?php
// Database connection details
$host = "localhost";
$username = "YOUR_DB_USER";
$password = "YOUR_DB_PASSWORD";
$database = "YOUR_DB_NAME";

// Initialize variables
$booking = null;
$error = "";
$cancelled = false;

// Check if ID and token are provided
if (isset($_GET['id']) && isset($_GET['token'])) {
    $bookingId = $_GET['id'];
    $token = $_GET['token'];
    
    // In a real implementation, you would verify the token against the database
    // For now, we'll simulate a successful cancellation
    
    if (isset($_POST['confirm']) && $_POST['confirm'] === 'yes') {
        // Process cancellation
        $cancelled = true;
        
        // In a real implementation, you would update the database
        // and send cancellation emails
    }
    
    // Simulate booking data
    $booking = [
        'id' => $bookingId,
        'name' => 'John Smith',
        'email' => 'john@example.com',
        'date' => '2023-12-15',
        'time' => 'Morning (09:30 - 12:30)',
        'vehicle' => 'Ford Focus 2018',
        'issue' => 'Engine problem'
    ];
} else {
    $error = "Invalid cancellation link. Please check your email for the correct link.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cancel Booking - Jamie's Auto Care</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <header class="bg-blue-900 text-white py-4">
        <div class="container mx-auto px-4">
            <div class="flex items-center">
                <a href="/" class="flex items-center text-gray-300 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Home</span>
                </a>
                <div class="mx-auto font-bold">Jamie's Auto Care</div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <?php if ($cancelled): ?>
                <h1 class="text-2xl font-bold mb-4 text-green-600">Booking Cancelled</h1>
                <p class="mb-4">Your booking has been successfully cancelled. A confirmation email has been sent to your registered email address.</p>
                <div class="flex justify-center">
                    <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Return to Homepage
                    </a>
                </div>
            <?php elseif (!empty($error)): ?>
                <h1 class="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <p class="mb-4"><?php echo htmlspecialchars($error); ?></p>
                <div class="flex justify-center">
                    <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Return to Homepage
                    </a>
                </div>
            <?php elseif ($booking): ?>
                <h1 class="text-2xl font-bold mb-4">Cancel Booking</h1>
                <p class="mb-4">Are you sure you want to cancel your booking for <strong><?php echo htmlspecialchars($booking['vehicle']); ?></strong> on <strong><?php echo htmlspecialchars($booking['date']); ?></strong> at <strong><?php echo htmlspecialchars($booking['time']); ?></strong>?</p>
                
                <form method="post" class="mt-6">
                    <input type="hidden" name="confirm" value="yes">
                    <div class="flex justify-center space-x-4">
                        <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Yes, Cancel Booking
                        </button>
                        <a href="/" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            No, Keep Booking
                        </a>
                    </div>
                </form>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
