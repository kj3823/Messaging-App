# Messaging-App

This is a README file for a messaging application built using React for the frontend and Node.js for the backend. The app allows users to send and receive messages in real-time.

## Features
- User authentication: Users can sign up and log in to the application using their email and password.
- Real-time messaging: Users can send and receive messages in real-time.
- User profiles: Users can view and edit their profiles, including their name and profile picture.
- Message notifications: Users receive notifications when they receive new messages.

## Technologies Used
- React: A JavaScript library for building user interfaces.
- Node.js: A JavaScript runtime environment for server-side development.
- Express: A web application framework for Node.js.
- MongoDB: A NoSQL database used to store user and message data.
= Mongoose: An object data modeling (ODM) library for MongoDB and Node.js.

## Installation
To run the messaging app locally, follow these steps:

1. Clone the repository:
```
git clone https://github.com/your-username/messaging-app.git
```

2. Install dependencies for both the frontend and backend:
```
cd messaging-app
cd client
npm install
cd ../server
npm install
```

3. Set up the environment variables:

- Create a .env file in the server directory.
- Define the following variables in the .env file:
```
PORT=3001
MONGODB_URI=mongodb://localhost/messaging-app
```
Note: Adjust the values according to your preferences.

4. Start the development servers:

Start the backend server:
```
cd server
npm start
```

- Start the frontend development server (in a separate terminal)
```
cd client
npm start
```

5. Open the application in your browser:

The frontend development server should automatically open the application in your default browser. If it doesn't, you can manually open it by navigating to http://localhost:3000 in your browser.


## Usage

1. Sign Up:

- Open the application in your browser and click on the "Sign Up" button.
- Fill in the required details, including your name, email, and password.
- Click "Sign Up" to create a new account.
2. Log In:

- After signing up, you can log in to the application using your email and password.
- Click on the "Log In" button.
- Enter your email and password.
- Click "Log In" to access your account.
3. Send Messages:

- Once logged in, you can start sending messages.
- Enter the recipient's email address and your message in the provided input fields.
- Click the "Send" button to send the message.

4. Receive Messages:

- When you receive a new message, it will appear in the chat window.
- You will also receive a notification indicating that you have a new message.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please create a new issue or submit a pull request.

