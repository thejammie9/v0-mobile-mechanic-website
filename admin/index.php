<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Connect to database
$conn = new mysqli('localhost', 'YOUR_DB_USER', 'YOUR_DB_PASSWORD', 'YOUR_DB_NAME');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get bookings
$result = $conn->query("SELECT * FROM bookings ORDER BY created_at DESC");
$bookings = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
}

// Handle status update
if (isset($_POST['update_status']) && isset($_POST['booking_id']) && isset($_POST['status'])) {
    $booking_id = $_POST['booking_id'];
    $status = $_POST['status'];
    
    $stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->bind_param("ss", $status, $booking_id);
    $stmt->execute();
    
    // Redirect to refresh the page
    header('Location: index.php');
    exit;
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Jamie's Auto Care</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .badge-pending { background-color: #ffc107; }
        .badge-confirmed { background-color: #0d6efd; }
        .badge-completed { background-color: #198754; }
        .badge-cancelled { background-color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Requests</h1>
            <a href="logout.php" class="btn btn-outline-danger">Logout</a>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5>All Bookings</h5>
            </div>
            <div class="card-body">
                <?php if (empty($bookings)): ?>
                    <p class="text-center text-muted">No bookings found</p>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Vehicle</th>
                                    <th>Time Slot</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($bookings as $booking): ?>
                                    <tr>
                                        <td>
                                            <div><?php echo htmlspecialchars($booking['booking_date']); ?></div>
                                            <small class="text-muted">Created: <?php echo date('Y-m-d H:i', strtotime($booking['created_at'])); ?></small>
                                        </td>
                                        <td>
                                            <div><?php echo htmlspecialchars($booking['name']); ?></div>
                                            <small class="text-muted"><?php echo htmlspecialchars($booking['email']); ?></small><br>
                                            <small class="text-muted"><?php echo htmlspecialchars($booking['phone']); ?></small>
                                        </td>
                                        <td><?php echo htmlspecialchars($booking['vehicle']); ?></td>
                                        <td><?php echo htmlspecialchars($booking['time_slot']); ?></td>
                                        <td>
                                            <span class="badge badge-<?php echo $booking['status']; ?>">
                                                <?php echo ucfirst($booking['status']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <form method="post" class="d-inline">
                                                <input type="hidden" name="booking_id" value="<?php echo $booking['id']; ?>">
                                                <select name="status" class="form-select form-select-sm" style="width: 130px; display: inline-block;">
                                                    <option value="pending" <?php echo $booking['status'] == 'pending' ? 'selected' : ''; ?>>Pending</option>
                                                    <option value="confirmed" <?php echo $booking['status'] == 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                                    <option value="completed" <?php echo $booking['status'] == 'completed' ? 'selected' : ''; ?>>Completed</option>
                                                    <option value="cancelled" <?php echo $booking['status'] == 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                                                </select>
                                                <button type="submit" name="update_status" class="btn btn-sm btn-primary">Update</button>
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
    </div>
</body>
</html>
