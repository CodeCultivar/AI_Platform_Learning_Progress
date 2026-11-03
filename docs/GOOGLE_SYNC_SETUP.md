# Set up sign-in sync (site owner, about 10 minutes, once)

Users only click **Sign in with Google**. For that to work, the site needs one Firebase project that you own. Progress is stored in Cloud Firestore, one document per user, behind security rules that let each person reach only their own.

## 1. Create the Firebase project
1. Go to <https://console.firebase.google.com> and choose **Add project**. Skip Google Analytics.
2. **Build, then Authentication, then Get started, then Sign-in method, then Google**: enable it and choose a support email.
3. **Authentication, then Settings, then Authorized domains**: add the domain the site is hosted on, for example `YOURNAME.github.io`. (`localhost` is already there for local testing.)
4. **Build, then Firestore Database, then Create database**: pick a location and start in **production mode**.
5. **Firestore, then Rules**: paste the contents of [`firebase/firestore.rules`](../firebase/firestore.rules) and **Publish**.
   - **Anyone may sign in (default):** leave the rules as they are. Each user can reach only their own document, capped at about 200 KB.
   - **Only you may use it:** uncomment the email line in the rules and put your Google address in it. Everyone else is refused.

## 2. Register the web app and give the site its config
1. **Project settings (gear icon), then Your apps, then the web icon `</>`**: register an app (no hosting needed).
2. Copy the `firebaseConfig` values it shows.
3. Create `public/firebase-config.json` (copy `public/firebase-config.example.json`) with `apiKey`, `authDomain`, `projectId` and `appId`.
4. Commit and push. The site redeploys, and the sign-in button appears.

These values identify your project and are not secrets: Firebase's docs say its API keys "do not need to be treated as secrets" and that access is controlled by security rules. The rules in step 1.5 are what protect the data.

## What you are taking on
- **You can see user data.** Anyone with access to your Firebase console can read what users store (their progress, notes and schedule). Tell users so; the site's sign-in panel already does. Do not use this for confidential data.
- **Shared free quota.** All users share the free plan's limits (check the live [pricing page](https://firebase.google.com/pricing)). If the quota runs out, cloud sync pauses until it resets; local progress keeps working. Consider turning on Firebase App Check and a budget alert if the site gets popular.
- **Deleting data.** Users can erase their own cloud copy from the Account panel. If someone asks you to delete an account's data, remove its `users/{uid}` document in the Firestore console.

## Troubleshooting
| Message | Fix |
| --- | --- |
| "domain is not authorized" | Step 1.3: add the site's domain |
| "Firestore refused the request" | Step 1.5: publish the rules (and check the email line if you locked it to yourself) |
| "database has not been created" | Step 1.4 |
| Popup blocked | Allow popups for the site |
