<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// In a real implementation, you would fetch bookings from a database
// For now, we'll use sample data
$bookings = [
    [
        'id' => 'booking_1234567890',
        'name' => 'John Smith',
        'email' => 'john@example.com',
        'phone' => '07123456789',
        'vehicle' => 'Ford Focus 2018',
        'issue' => 'Engine problem',
        'date' => '2023-12-15',
        'time_slot' => 'Morning (09:30 - 12:30)',
        'status' => 'pending',
        'created_at' => '2023-12-10 14:30:00'
    ],
    [
        'id' => 'booking_0987654321',
        'name' => 'Sarah Johnson',
        'email' => 'sarah@example.com',
        'phone' => '07987654321',
        'vehicle' => 'Audi A4 2020',
        'issue' => 'Brake issues',
        'date' => '2023-12-18',
        'time_slot' => 'Afternoon (13:30 - 17:30)',
        'status' => 'confirmed',
        'created_at' => '2023-12-11 09:15:00'
    ]
];

// Handle status update
if (isset($_POST['update_status']) && isset($_POST['booking_id']) && isset($_POST['status'])) {
    $booking_id = $_POST['booking_id'];
    $new_status = $_POST['status'];
    
    // In a real implementation, you would update the database
    // For now, we'll update our sample data
    foreach ($bookings as &$booking) {
        if ($booking['id'] === $booking_id) {
            $booking['status'] = $new_status;
            break;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Jamie's Auto Care</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <header class="bg-blue-950 text-white py-4 px-6 flex justify-between items-center">
        <div class="font-bold text-xl">Jamie's Auto Care - Admin</div>
        <div class="flex items-center space-x-4">
            <a href="/" class="text-sm text-gray-300 hover:text-white">
                View Website
            </a>
            <a href="logout.php" class="flex items-center text-sm text-gray-300 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </a>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">Booking Requests</h1>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold mb-4">All Bookings</h2>
            
            <?php if (empty($bookings)): ?>
                <p class="text-center py-8 text-gray-500">No bookings found</p>
            <?php else: ?>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                <th class="py-3 px-6 text-left">Date</th>
                                <th class="py-3 px-6 text-left">Customer</th>
                                <th class="py-3 px-6 text-left">Vehicle</th>
                                <th class="py-3 px-6 text-left">Time Slot</th>
                                <th class="py-3 px-6 text-left">Status</th>
                                <th class="py-3 px-6 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="text-gray-600 text-sm">
                            <?php foreach ($bookings as $booking): ?>
                                <tr class="border-b border-gray-200 hover:bg-gray-50">
                                    <td class="py-3 px-6">
                                        <div class="font-medium"><?php echo htmlspecialchars($booking['date']); ?></div>
                                        <div class="text-xs text-gray-500">Created: <?php echo htmlspecialchars($booking['created_at']); ?></div>
                                    </td>
                                    <td class="py-3 px-6">
                                        <div><?php echo htmlspecialchars($booking['name']); ?></div>
                                        <div class="text-xs text-gray-500"><?php echo htmlspecialchars($booking['email']); ?></div>
                                        <div class="text-xs text-gray-500"><?php echo htmlspecialchars($booking['phone']); ?></div>
                                    </td>
                                    <td class="py-3 px-6"><?php echo htmlspecialchars($booking['vehicle']); ?></td>
                                    <td class="py-3 px-6"><?php echo htmlspecialchars($booking['time_slot']); ?></td>
                                    <td class="py-3 px-6">
                                        <?php
                                        $statusClass = '';
                                        switch ($booking['status']) {
                                            case 'pending':
                                                $statusClass = 'status-pending';
                                                break;
                                            case 'confirmed':
                                                $statusClass = 'status-confirmed';
                                                break;
                                            case 'completed':
                                                $statusClass = 'status-completed';
                                                break;
                                            case 'cancelled':
                                                $statusClass = 'status-cancelled';
                                                break;
                                        }
                                        ?>
                                        <span class="status-badge <?php echo $statusClass; ?>">
                                            <?php echo ucfirst(htmlspecialchars($booking['status'])); ?>
                                        </span>
                                    </td>
                                    <td class="py-3 px-6">
                                        <form method="post" class="flex items-center">
                                            <input type="hidden" name="booking_id" value="<?php echo htmlspecialchars($booking['id']); ?>">
                                            <select name="status" class="mr-2 border border-gray-300 rounded-md px-2 py-1 text-sm">
                                                <option value="pending" <?php echo $booking['status'] == 'pending' ? 'selected' : ''; ?>>Pending</option>
                                                <option value="confirmed" <?php echo $booking['status'] == 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                                <option value="completed" <?php echo $booking['status'] == 'completed' ? 'selected' : ''; ?>>Completed</option>
                                                <option value="cancelled" <?php echo $booking['status'] == 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                                            </select>
                                            <button type="submit" name="update_status" class="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
                                                Update
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
