# Google OAuth Setup Instructions

## To enable real Google Sign-In, follow these steps:

### 1. Go to Google Cloud Console
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

### 2. Enable Google+ API
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it

### 3. Create OAuth 2.0 Credentials
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth Client ID"
   - Application type: "Web application"
   - Name: "KANBAN Inventory System"
   - Authorized JavaScript origins: 
     - http://localhost:8000
     - http://localhost:5000
   - Authorized redirect URIs:
     - http://localhost:8000
     - http://localhost:5000

### 4. Copy your Client ID
   - After creation, copy the Client ID
   - Replace 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' in js/google_auth.js

### 5. Test Google Sign-In
   - Restart both servers
   - Click "Sign in with Google" button
   - Select your Google account
   - You should be automatically logged in

Note: For production, you need to:
- Add your domain to authorized origins
- Use HTTPS
- Store client ID in environment variables
