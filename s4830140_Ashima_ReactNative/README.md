# 📌 FormBase – Dynamic Form Builder (Expo / React Native)

FormBase is a mobile app that allows users to create custom form fields and record data dynamically. It supports multiple field types and provides a smooth form-filling experience along with filtering and location selection features.

---

## ✅ Features
- Create custom fields (Text, Numeric, Multiline, Dropdown, Date, Image, Location)
- Apply filters to show conditional fields
- Add / Edit / Delete records
- Map-based location picker (with reverse geocoding)
- Works on iPhone through Expo Go

---

## 🤖 GenAI Use Reference
I used **ChatGPT (GenAI)** during development **for assistance only**, including:

- Debugging UI and logic issues
- Suggesting code improvements and optimisations
- Generating comments and improving readability
- Helping resolve edge-case behaviours (map selection, filters, re-renders)

> **Note:** All final implementation decisions, UI structure, logic, and code integration were done by me. GenAI was only used as a helper, not to generate the project.

---

## 📱 Testing & Device Details
The app was tested using the **Expo Go** application on:

| Platform | Device / Emulator | OS |
|-----------|------------------|-----|
| iOS | **iPhone 17 Simulator** | iOS 17 |

Everything was verified including:
- Navigation
- Adding/editing fields
- Adding/editing records
- Location selection
- Image picking
- Filters
- Validations

---

## 🛠️ Tech Stack
| Category | Tool |
|----------|------|
| Framework | Expo (React Native) |
| Language | TypeScript |
| Navigation | expo-router |
| Maps & Location | react-native-maps, expo-location |
| API | REST (Supabase style) |

---

## 🚀 Run the Project

```sh
npm install
npx expo start

---

## 🚀  Project Structure
/app
  /form
    /fields      → Field list & add field
    /records     → Add/Edit record
    /map         → Location picker
/components     → Shared UI elements
/constants      → Texts, Theme, Types
/lib            → API & config
/hooks          → Custom logic

---

## Privacy Risks When Capturing User Data in a Mobile Form App

When building mobile apps like FormBase | Custom that collect user data, developers must consider how data is stored, transmitted, and protected. Below are the key privacy risks associated with capturing text, media, and location information through a mobile form app:

---
## 📌 Privacy Risks

### Unauthorized Access
Sensitive form data could be accessed by attackers if stored without proper encryption or if the device is compromised.

###  Exposure of Personal Information
Text fields may contain personal or confidential details (e.g., identity information, medical notes, or client records) which can be exploited if leaked.

###  Location Tracking & Personal Safety Risks
GPS coordinates can reveal a user’s home, workplace, or daily movement patterns, increasing risks such as stalking, profiling, or physical harm.

###  Data Interception During Transmission
If data is transmitted without encryption (e.g., not using HTTPS/TLS), it may be intercepted by attackers while in transit.

###  Misuse by Third-Party Services
Media files or location data sent to external APIs (storage, map services, analytics) may be used beyond the intended purpose or without full user awareness.

### Long-Term Retention Risk
Storing user data indefinitely increases the consequences of a future data breach or unauthorized access.

### Limited User Control & Consent Issues
If users cannot view, edit, or delete their submitted data, it may violate privacy expectations or legal standards (e.g., GDPR-like principles).

### Metadata Leakage in Media
Photos and videos may contain hidden metadata (e.g., timestamp, GPS coordinates) that exposes additional private information unintentionally.

---