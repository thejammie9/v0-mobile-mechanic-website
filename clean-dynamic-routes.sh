#!/bin/bash

echo "Cleaning dynamic routes..."

# Remove the dynamic route directory if it exists
if [ -d "app/bookings/[id]" ]; then
  echo "Removing app/bookings/[id] directory"
  rm -rf app/bookings/[id]
fi

# Remove any cached files
if [ -d ".next" ]; then
  echo "Removing .next directory"
  rm -rf .next
fi

echo "Dynamic routes cleaned!"
