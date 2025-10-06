# SEO Link Analyzer - Setup Guide

## Current Status

The application code is ready, but requires Supabase configuration to work properly.

## Required Supabase Configuration

### 1. Google OAuth Setup

1. Go to your Supabase Dashboard: https://gfuhchqxaqcsofapitwd.supabase.co
2. Navigate to **Authentication → Providers**
3. Enable **Google** provider
4. Add OAuth scopes: `https://www.googleapis.com/auth/webmasters.readonly`
5. Get your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Search Console API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `https://gfuhchqxaqcsofapitwd.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/v1/callback` (for development)
6. Copy Client ID and Client Secret to Supabase Google provider settings

### 2. Edge Function Secrets

You need to add these environment variables to your Supabase Edge Functions:

Go to **Settings → Edge Functions** in your Supabase dashboard and add:

```
FIRECRAWL_API_KEY=fc-025c704ab3d04739b4cb1cf672ba4789
DATAFORSEO_USERNAME=george.k@growthrocks.com
DATAFORSEO_PASSWORD=6f820760d2c324ac
```

### 3. Deploy Edge Functions

The edge functions are in the `supabase/functions/` directory:

- `list-gsc-properties` - Fetches Google Search Console properties
- `analyze-seo` - Performs SEO analysis

You can deploy them using the Supabase CLI:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref gfuhchqxaqcsofapitwd

# Deploy the functions
supabase functions deploy list-gsc-properties
supabase functions deploy analyze-seo
```

Or deploy via the Supabase Dashboard:
1. Go to **Edge Functions**
2. Click **Deploy new function**
3. Upload the function code from `supabase/functions/[function-name]/index.ts`

## How The Application Works

### Authentication Flow

1. User clicks "Sign in with Google"
2. OAuth flow redirects to Google for authorization
3. User grants permission for Google Search Console access
4. User is redirected back with OAuth token
5. Token is stored in session and used for GSC API calls

### Analysis Flow

1. After login, app fetches GSC properties using `list-gsc-properties` function
2. User selects a property and enters site URL
3. User clicks "Run Analysis"
4. `analyze-seo` function:
   - Crawls the site with Firecrawl
   - Extracts keywords using TF-IDF
   - Gets keyword metrics from DataForSEO
   - Fetches GSC data using user's OAuth token
   - Calculates link opportunities
   - Returns ranked recommendations

## Testing After Setup

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click "Sign in with Google"
4. Grant permissions when prompted
5. Select a GSC property from the dropdown
6. Enter a site URL to analyze
7. Click "Run Analysis"

## Troubleshooting

### "Sign in doesn't work"
- Verify Google OAuth is enabled in Supabase
- Check OAuth credentials are correct
- Ensure redirect URIs are properly configured
- Check browser console for errors

### "Properties not loading"
- Verify edge function `list-gsc-properties` is deployed
- Check edge function logs in Supabase dashboard
- Ensure OAuth scope includes `webmasters.readonly`

### "Analysis fails"
- Verify all API keys are set in edge function secrets
- Check edge function `analyze-seo` is deployed
- Review edge function logs for specific errors
- Ensure Firecrawl and DataForSEO accounts are active

## API Credentials Summary

**Firecrawl API:**
- API Key: `fc-025c704ab3d04739b4cb1cf672ba4789`

**DataForSEO API:**
- Username: `george.k@growthrocks.com`
- Password: `6f820760d2c324ac`
- Base64: `Z2VvcmdlLmtAZ3Jvd3Rocm9ja3MuY29tOjZmODIwNzYwZDJjMzI0YWM=`

**Supabase:**
- Project URL: `https://gfuhchqxaqcsofapitwd.supabase.co`
- Project Reference: `gfuhchqxaqcsofapitwd`

## Next Steps

1. Complete Google OAuth setup in Supabase
2. Add API credentials to edge function secrets
3. Deploy both edge functions
4. Test the complete flow
5. Monitor edge function logs for any issues
