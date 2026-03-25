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



EmailJS setup for direct email notifications:
1. Create an EmailJS account.
2. Connect your mailbox service.
3. Create an email template with these variables:
   - {{from_name}}
   - {{from_email}}
   - {{message}}
   - {{reply_to}}
4. Open script.js and replace:
   - PUT_YOUR_EMAILJS_PUBLIC_KEY_HERE
   - PUT_YOUR_EMAILJS_SERVICE_ID_HERE
   - PUT_YOUR_EMAILJS_TEMPLATE_ID_HERE
5. The contact form will keep saving messages to Firebase, and once those keys are added it will also send each message to your email.



Admin dashboard added:
- admin-dashboard.html
- admin.js

What it can do:
- Restrict access to the admin email: ibrahimashrf301@gmail.com
- Edit brand name, logo URL, favicon URL, footer text, contact email
- Edit homepage text and other main page headings
- Add / edit / delete pets from Firestore
- Track page visits in Firestore analytics
- Save user profiles in Firestore on sign up / sign in

Important Firebase rules you should add:
1) pets, users, siteContent, analytics should only be writable by signed-in admin users.
2) contactMessages can remain create:true for public sending, but read should be admin only.
