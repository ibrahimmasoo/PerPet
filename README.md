# PerPet static multi-page GitHub Pages version

Files included:
- index.html
- find-pet.html
- list-pet.html
- why-perpet.html
- contact.html
- style.css
- script.js

Deploy on GitHub Pages:
1. Upload all files to the repository root.
2. Go to Settings > Pages.
3. Choose Deploy from a branch.
4. Select main and /(root).
5. Save.

Notes:
- Top navigation opens a separate page for each section.
- Clicking the PerPet logo returns to home.
- Added pets are stored in browser localStorage.
Static GitHub Pages version.


Added auth pages: signin.html, signup.html, auth.css, auth.js with Firebase Email/Password + Google sign-in.


## Firestore rules for the upgraded inbox

Use rules that allow visitors to create messages and signed-in users to read, update status, and delete messages:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contactMessages/{messageId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```
