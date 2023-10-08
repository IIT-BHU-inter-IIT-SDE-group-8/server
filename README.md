Trip Companion app Backend
This is the backend repository for a Trip Sharing application that allows users to create and join trips, connect with other users, form and manage communities, and receive real-time notifications.

Table of Contents
Overview
Technologies Used
Database
API Endpoints
Authentication
Real-time Notifications
Getting Started
Contributing
License


Overview
The Trip Sharing App Backend serves as the foundation for the Trip Sharing application's functionality. Users can create accounts, form communities, create and join trips, and receive real-time notifications about their friends' activities and community events. Key features include:

User management with profile information.
Community creation and management.
Trip creation, tracking, and group formation.
Real-time notifications using Web Push.
Technologies Used
Node.js: The server-side JavaScript runtime environment.
Express.js: A web application framework for building RESTful APIs.
PostgreSQL: A powerful open-source relational database system.
Sequelize: An ORM for Node.js, used for PostgreSQL database interactions.
Web Push: For real-time notifications.
JSON Web Tokens (JWT): For user authentication.
Database
PostgreSQL is used as the relational database to store user, community, trip, and notification data. The database schema includes the following entities:

User
Community
Trip
Notification
User-Community Mapping
User-Trip Mapping
Friendship Mapping
Admin-Community Mapping
Trip-Transport Mapping
Trip-Notification Mapping
Please refer to the /api/openapi.yaml for more info

API Endpoints
The backend exposes a set of API endpoints for various functionalities. Refer to  /api/openapi.yaml

Authentication
Users can sign up and log in using their email or choose to sign in with Google. Authentication is handled using JWT tokens for secure access to the application's resources.

Real-time Notifications
Real-time notifications are implemented using Web Push technology. Users can subscribe to push notifications, and the server sends notifications to subscribed users when relevant events occur, such as new trip postings or community updates.

Getting Started
To set up and run the backend server locally with PostgreSQL, follow these steps:

Clone this repository.
Install dependencies with npm install.
Create a .env file and configure your PostgreSQL database connection details, JWT secret, and other environment variables.
Run the server with npm start.
For a more detailed setup guide, refer to the Getting Started documentation.

Contributing
We welcome contributions from the community! Please see the Contributing Guide for details on how to contribute to this project.

License
This project is licensed under the MIT License.
