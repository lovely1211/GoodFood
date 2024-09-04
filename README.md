# GoodFood 🍽️

GoodFood is a comprehensive food delivery platform built using the MERN stack. The platform allows multiple sellers to list their food items, and buyers can browse, order, and leave feedback. The project includes features like user authentication, email verification, order management, and real-time notifications.

## Features 🌟

- **User Authentication:** Register and log in as a buyer or seller.
- **Email Verification:** Secure registration with a 6-digit verification code sent to the user's email.
- **Multiple Sellers:** Each seller can list their own menu items.
- **Order Management:** Buyers can place orders and track them in real-time.
- **Feedback System:** Buyers can leave feedback with ratings and images.
- **Liked Items:** Buyers can like items, which are saved and displayed in a separate section and also share items.
- **Real-time Notifications:** Sellers receive notifications for new orders and feedback.

## Tech Stack 🛠️

- **Frontend:** React.js, Redux, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer
- **Version Control:** Git, GitHub

## Getting Started 🚀

### Prerequisites

- Node.js
- MongoDB
- Git

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/lovely1211/goodfood.git
    cd goodfood
    ```

2. **Install dependencies:**

    ```bash
    npm install
    cd client
    npm install
    cd ..
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following:

    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_SERVICE=your_email_service_provider
    EMAIL_USER=your_email_address
    EMAIL_PASS=your_email_password
    ```

4. **Run the application:**

    ```bash
    npm run dev
    ```

    This will start both the backend and frontend servers.

## Usage 📖

- **Buyer:** Register or log in to browse food items, place orders, and like items.
- **Seller:** Log in to manage your menu, view orders, and respond to feedback.
- **Admin:** Manage users, sellers, and oversee the platform’s operation.

## Contributing 🤝

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## Acknowledgements 🙏

- Special thanks to all open-source contributors whose libraries were used in this project.

---

Feel free to explore the project and connect with me for any queries or collaboration opportunities!
