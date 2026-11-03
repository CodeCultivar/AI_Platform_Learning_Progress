# Set up Google sync (about 10 minutes, once)

Progress is stored in Cloud Firestore in a Firebase project that you own, and you sign in with Google. Nothing here costs money on Firebase's free plan for a tracker this small (check the live [pricing page](https://firebase.google.com/pricing) for current limits).

## 1. Create the Firebase project
1. Go to <https://console.firebase.google.com> and choose **Add project**. Skip Google Analytics.
2. **Build, then Authentication, then Get started, then Sign-in method, then Google**: enable it and choose a support email.
3. **Authentication, then Settings, then Authorized domains**: add the domain the site is hosted on, for example `YOURNAME.github.io`. (`localhost` is there already for local testing.)
4. **Build, then Firestore Database, then Create database**: pick a location and start in **production mode**.
5. In **Firestore, then Rules**, paste the contents of [`firebase/firestore.rules`](../firebase/firestore.rules), replace `YOUR_EMAIL@gmail.com` with your Google address in the optional line (recommended), and **Publish**.

## 2. Register the web app and give the site its config
1. **Project settings (gear icon), then Your apps, then the web icon `</>`**: register an app (no hosting needed).
2. Copy the `firebaseConfig` values it shows.
3. Create `public/firebase-config.json` in this repository (copy `public/firebase-config.example.json`) with the four values `apiKey`, `authDomain`, `projectId`, `appId`.
4. Commit and push. The site redeploys.

These values identify your project and are not secrets. Firebase's docs say its API keys "do not need to be treated as secrets" and that access is controlled by security rules, not by hiding the key. So the rules in step 1.5 are what protect your data.

## 3. Use it
Open the site, choose **Sync devices, then Sign in with Google**. Repeat on each device. Your existing progress is merged in, not replaced.

## Troubleshooting
| Message | Fix |
| --- | --- |
| "domain is not authorized" | Step 1.3: add the site's domain |
| "Firestore refused the request" | Step 1.5: publish the rules; sign in with the account they allow |
| "database has not been created" | Step 1.4 |
| Popup blocked | Allow popups for the site |
