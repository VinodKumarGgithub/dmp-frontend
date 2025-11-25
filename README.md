# Clinical Frontend Application

A modern, responsive React-based frontend application for managing clinical data with dynamic page configuration, multi-tenant support, and role-based access control.

## Technologies Used

### Core Framework
- **React 18.3.1**: Modern React with hooks and functional components
- **React Router DOM 7.9.6**: Client-side routing and navigation
- **Vite 7.2.2**: Fast build tool and development server

### UI Framework
- **Ant Design 5.29.0**: Enterprise-grade UI component library
- **@ant-design/pro-layout 7.22.7**: Professional layout components

### State Management
- **Zustand 5.0.8**: Lightweight state management with persistence
- **@tanstack/react-query 5.90.10**: Server state management and data fetching

### HTTP & Data
- **Axios 1.13.2**: HTTP client for API requests
- **ExcelJS 4.4.0**: Excel file generation for exports
- **crypto-js 4.2.0**: Encryption utilities

### Development Tools
- **ESLint 9.39.1**: Code linting and quality checks

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager
- Backend API server running and accessible

### Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd clinical-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory (if needed):
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build:**
   ```bash
   npm run preview
   ```

## Usage Instructions

### Getting Started

1. **Access the Application:**
   - Open your browser and navigate to `http://localhost:5173` (default Vite port)
   - You will be redirected to the login page

2. **Login:**
   - Enter your username and password
   - Click "Sign In" to authenticate
   - Upon successful login, you'll be redirected to the home page

3. **Select a Tenant:**
   - After login, select a tenant from the tenant selector in the header
   - All data pages will show data specific to the selected tenant

### Using Data Pages

1. **Navigate to a Page:**
   - From the home page, click on any available page card
   - Or use the navigation menu if the page is listed

2. **Search Data:**
   - Use the search box at the top to search across configured searchable fields
   - Search is debounced and updates automatically

3. **Filter Data:**
   - Use filter dropdowns for immediate filtering
   - Use date range pickers for date-based filtering
   - Text filters update with debouncing

4. **Manage Columns:**
   - Click the "Columns" button to open column preferences
   - Toggle column visibility using checkboxes
   - Drag and drop columns to reorder them
   - Click "Save" to persist your preferences
   - You can also drag columns directly in the table header to reorder

5. **View Additional Details:**
   - Click the "More" icon (⋮) in any row to view hidden columns in a drawer

6. **Download Data:**
   - Click the "Download" button (if enabled for the page)
   - Select format: CSV or Excel
   - Only visible columns will be included in the download

### Managing Page Configurations (Developer/Admin Only)

1. **Access Page Config:**
   - Navigate to "Page Config" from the menu (requires DEVELOPER or ADMIN role)

2. **Create a New Page:**
   - Click "Create New Page"
   - Fill in page details (title, page key, data source)
   - Configure columns, searchable fields, and filterable fields
   - Set download permissions and limits
   - Save the configuration

3. **Edit Existing Page:**
   - Click "Edit" on any page configuration
   - Modify settings as needed
   - Save changes

4. **Browse Database:**
   - Use "Browse Tables" to see available tables and views
   - Use "Browse Procedures" to see available stored procedures
   - Click to select a data source

### Managing Users (Admin Only)

1. **Access User Management:**
   - Navigate to "User Management" from the menu (requires ADMIN role)

2. **Create User:**
   - Click "Create User"
   - Fill in user details (username, password, name, email, phone, role)
   - Assign tenant permissions
   - Assign page permissions per tenant
   - Save the user

3. **Edit User:**
   - Click "Edit" on any user
   - Modify user details, roles, or permissions
   - Save changes

4. **Block/Unblock User:**
   - Toggle the user's active status to block or unblock access

### Theme Toggle

- Click the theme toggle icon in the header to switch between dark and light themes
- Your preference is automatically saved and will persist across sessions

### Logout

- Click on your username in the header
- Select "Logout" from the dropdown menu
- You will be redirected to the login page

## Project Structure

```
clinical-frontend/
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable React components
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── hooks/            # Custom React hooks
│   ├── layout/           # Layout components
│   ├── pages/            # Page components
│   ├── stores/           # Zustand state stores
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files (routes)
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── package.json          # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- The application requires a running backend API server
- All API requests are automatically authenticated using JWT tokens
- Column preferences are stored in browser localStorage
- Theme preference is stored in browser localStorage
- The application automatically handles 401 errors by logging out the user

