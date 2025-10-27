# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.


## Privacy Risks When Capturing User Data in a Mobile Form App

When building mobile apps like FormBase | Custom that collect user data, developers must consider how data is stored, transmitted, and protected. Below are the key privacy risks associated with capturing text, media, and location information through a mobile form app:

### 📌 Privacy Risks

#### Unauthorized Access
Sensitive form data could be accessed by attackers if stored without proper encryption or if the device is compromised.

####  Exposure of Personal Information
Text fields may contain personal or confidential details (e.g., identity information, medical notes, or client records) which can be exploited if leaked.

####  Location Tracking & Personal Safety Risks
GPS coordinates can reveal a user’s home, workplace, or daily movement patterns, increasing risks such as stalking, profiling, or physical harm.

####  Data Interception During Transmission
If data is transmitted without encryption (e.g., not using HTTPS/TLS), it may be intercepted by attackers while in transit.

####  Misuse by Third-Party Services
Media files or location data sent to external APIs (storage, map services, analytics) may be used beyond the intended purpose or without full user awareness.

####  Long-Term Retention Risk
Storing user data indefinitely increases the consequences of a future data breach or unauthorized access.

#### Limited User Control & Consent Issues
If users cannot view, edit, or delete their submitted data, it may violate privacy expectations or legal standards (e.g., GDPR-like principles).

#### Metadata Leakage in Media
Photos and videos may contain hidden metadata (e.g., timestamp, GPS coordinates) that exposes additional private information unintentionally.