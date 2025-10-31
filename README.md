<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/10naAu5DfhvDJ3tht35YUDhFMC_aZgmZG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` or `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase & Google Cloud (Service account, rules, and deployment)

For server-side functionality (Admin SDK, Firestore, Cloud Storage), you'll need a Google Cloud service account and to deploy security rules. Steps:

1. Create a service account in Google Cloud Console with the following roles:
   - Firebase Admin (or appropriate Firestore/Storage permissions)
   - Storage Admin (if you need full control of the bucket)
2. Download the service account JSON and place it at `backend/service-account.json`.
3. Make sure `backend/.gitignore` contains `service-account.json` to avoid committing it.
4. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of this file, or set the following in `backend/.env`:

```
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. Install the Firebase CLI (if not already):

```bash
npm install -g firebase-tools
```

5. Authenticate and select your project:

```bash
firebase login
firebase use --add your-project-id
```

6. Deploy Firestore and Storage rules only (safe):

```bash
firebase deploy --only firestore:rules,storage:rules
```

7. Optional: Use the Firebase Emulator Suite for local testing (Auth, Firestore, Storage) to avoid using production credits:

```bash
firebase emulators:start --only auth,firestore,storage
```

## AI cost controls (recommended with limited credits)

- Cache generated AI outputs in Firestore under `aiContent` to avoid re-calling Gemini for the same inputs.
- Add a per-user daily quota for AI endpoints (default: 5/day) to avoid accidental overuse.
- Use smaller models or shorter prompts where possible.
