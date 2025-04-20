# Setting Up Google OAuth for Casual Pay

This guide explains how to set up Google OAuth for the Casual Pay application.

## Creating a Google OAuth Client ID

### Step 1: Go to the Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project
1. Click on the project dropdown at the top of the page
2. Click "New Project"
3. Enter a name for your project (e.g., "Casual Pay")
4. Click "Create"

### Step 3: Configure the OAuth Consent Screen
1. In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you're restricting to a specific organization)
3. Click "Create"
4. Fill in the required information:
   - App name: "Casual Pay"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. For Scopes, add the following:
   - `email`
   - `profile`
   - `openid`
7. Click "Save and Continue"
8. Add any test users if you're still in development (your email)
9. Click "Save and Continue"
10. Review your settings and click "Back to Dashboard"

### Step 4: Create OAuth Client ID
1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. For Application type, select "Web application"
4. Name: "Casual Pay Web Client"
5. Add Authorized JavaScript origins:
   - For development: `http://localhost:5173` (use the port your Vite server is running on)
   - For production (when ready): Your production domain
6. Add Authorized redirect URIs:
   - For development: `http://localhost:5173`
   - For production (when ready): Your production domain
7. Click "Create"

You'll receive a client ID. Copy this ID as you'll need it for your application.

## Setting Up Environment Variables

1. Create a `.env.local` file in the root of your project (this file is gitignored for security)
2. Add your Google Client ID to the file:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   ```
3. Restart your development server for the changes to take effect

## Troubleshooting

If you encounter issues with Google Sign-In:

1. Make sure your Client ID is correctly set in the `.env.local` file
2. Verify that the authorized JavaScript origins and redirect URIs match your development or production URLs
3. Check the browser console for any error messages
4. Ensure your OAuth consent screen is properly configured
5. If in development mode, make sure you've added yourself as a test user

## Security Considerations

- Never commit your Client ID to version control
- Always use environment variables for sensitive information
- For production, consider implementing additional security measures like CSRF protection
