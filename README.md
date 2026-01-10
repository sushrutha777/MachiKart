# 🐟 MacchiKart - Sea to Home

**MacchiKart** is a premium fish delivery web application designed to bring the freshest coastal catch directly to customers' doorsteps. It features a stunning, high-end "Black & Gold" UI, real-time order tracking, and a robust Admin Dashboard for business operations.

![MacchiKart App](public/logo.jpg)

## ✨ Features

- **Premium UI/UX:**
  - **Light Mode:** "Golden Pitch" animated gradient background.
  - **Dark Mode:** Deep blue premium "Coastal Night" theme.
  - Next-gen responsive design using Tailwind CSS.
  
- **Customer Experience:**
  - **Browse & Filter:** Premium vs. Standard catch filtering.
  - **Customizable Orders:** Add "Cleaning Services" (₹30/kg).
  - **Cart Management:** 0.5kg quantity increments.
  - **Real-Time Tracking:** Check order status using just a phone number.
  - **Payment Info:** Clear instructions for Cash/UPI upon delivery.

- **Admin Dashboard (Management Portal):**
  - **Inventory Management:** Add, edit, and delete products.
  - **Image Upload:** Built-in image compression and preview.
  - **Order Management:**
    - Visual status workflow (New -> Confirm -> Transit -> Deliver).
    - **Dynamic Action Buttons:** Buttons strictly follow the order lifecycle.
    - **Maintenance:** Batch clear old orders or delete all.
  - **Secure Navigation:** Distinct Admin/Customer views.

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database:** [Firebase](https://firebase.google.com/) (Firestore & Storage)
- **Deployment:** Ready for Vercel / Netlify / Firebase Hosting

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher installed)
- A [Firebase Project](https://console.firebase.google.com/) (for database & storage)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sushrutha777/MachiKart.git
    cd MachiKart
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    *   Create a project in the Firebase Console.
    *   Enable **Firestore Database** and **Storage**.
    *   Copy your web app configuration keys.
    *   Open `src/firebase.ts` (or create it) and update the `firebaseConfig` object with your credentials:
        ```typescript
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_PROJECT_ID.appspot.com",
          messagingSenderId: "YOUR_SENDER_ID",
          appId: "YOUR_APP_ID"
        };
        ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:3000` (or similar).

## 📦 Build for Production

To create an optimized build for deployment:

```bash
npm run build
```

## 📜 License

This project is licensed under the MIT License.
