# Bunai From The Hills - Admin Panel

This is the admin panel for the Bunai From The Hills e-commerce application. It provides a management interface for products, orders, and customer data.

## Features

- **Dashboard**: Overview of key metrics and recent orders
- **Product Management**: Add, edit, and delete products with image uploads
- **Order Management**: View and update order statuses
- **Customer Management**: View customer inquiries and contact information
- **Authentication**: Secure login system with role-based access

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The admin panel will be available at `http://localhost:3001`

## Login Credentials

For demo purposes, use the following credentials:
- Email: `admin@bunaifromhills.com`
- Password: `admin123`

## API Integration

The admin panel connects to the backend API running on `http://localhost:5000`. Make sure the backend server is running before using the admin panel.

## Technology Stack

- React 18
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Font Awesome for icons
- Vite for build tooling

## Folder Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── pages/          # Page components
├── styles/         # CSS files
└── utils/          # Utility functions
```

## Environment Variables

The application uses the following environment variables:
- `VITE_API_BASE_URL`: Base URL for the backend API (default: http://localhost:5000)

## Production Build

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```# bunai-from-hills-admin
