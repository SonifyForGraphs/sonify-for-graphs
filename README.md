# Soundviz

-- Developer Setup Guide

Prerequisites:
Node.js: Ensure you have the latest version of Node.js installed. You can download it from the official website.

Python 3: Make sure Python 3 is installed on your system. You can download it from the official website.

Surge (optional, for deployment): If the project is deployed using Surge, install it globally: npm install -g surge
For more details, refer to the [Surge Installation Guide](https://surge.sh/help/getting-started-with-surge).

Installation Instructions
Mac Installation Steps
1. Clone the repository and navigate into the project folder: git clone https://github.com/SonifyForGraphs/sonify-for-graphs.git
cd sonify-for-graphs
2. Create a Python virtual environment: python3 -m venv venv
3. Activate the virtual environment: source venv/bin/activate
4. Install Node.js dependencies: npm install
5. Start the development server: npm run dev
6. Open the application in your browser: Navigate to http://localhost:3000

Windows Installation Steps
1. Install the latest version of Python 3 from the Microsoft Store: Ensure you install from this link to prevent installation issues.
2. Clone the repository and navigate into the folder: git clone https://github.com/SonifyForGraphs/sonify-for-graphs.git
cd sonify-for-graphs
3. Create a Python virtual environment: python -m venv venv
4. Activate the virtual environment: cd venv/Scripts/
./activate
cd ../../  # Move back to the main folder
5. Install Node.js dependencies: npm install
6. Create an environment file:
- Inside the project folder, create a new file called .env.local
- Add the required environment variables to this file and save it.
7. Start the development server: npm run dev
8. Open the application in your browser: Navigate to http://localhost:3000

Deployment Instructions
If the project is being deployed manually (instead of using Vercel's automatic deployment), follow these steps:

1. Ensure all environment variables are correctly configured.
2. Build the project for production: npm run build
3. Deploy to a hosting service (e.g., Vercel, Surge, or VPS).
   
For Vercel:
Run: vercel deploy
- Follow the deployment instructions in the terminal.

For Surge (if applicable):
Deploy using Surge with: surge
If you haven’t set up Surge,refer to the [Surge Deployment Guide](https://surge.sh/help/deploying-projects-on-surge).


Additional Notes
Common Issues:
If npm install fails, try running:
 npm cache clean --force
 npm install
If Python virtual environment activation fails, use:
 source venv/bin/activate
on macOS/Linux or:
 venv\Scripts\activate
on Windows.
Updating Dependencies:
To ensure your dependencies are up to date, run:
 npm update
