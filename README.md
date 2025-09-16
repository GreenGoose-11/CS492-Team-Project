# CS492_GP2 Bookstore Inventory and Sales Automation

This is a web-based application for user authentication, book store functionality, admin management, and cart/sales automation, built with Node.js, Express, SQLite, and HTML/CSS/JavaScript. Users can register, log in, view a book inventory, and add books to a cart. Admins can register, log in, and manage the book inventory (add/delete books).

## Prerequisites
- Install **Node.js** and **npm** from [nodejs.org](https://nodejs.org) (version 16 or later recommended).
- Verify installation:
  ```bash
  node -v
  npm -v

  Example output: v22.14.0 and 10.9.2.
Setup Instructions

Extract the ZIP:

Unzip CS492_GP2.ZIP to a folder (e.g., C:\CS492_GP2).


Install Dependencies:

Open a terminal (PowerShell or Command Prompt) in the project folder.
Run:npm install


This installs express, jsonwebtoken, bcryptjs, cors, and sqlite3.


Run the Server:

Run:npm start


Expected output:Server running on port 3000
Connected to SQLite database


If a firewall prompt appears, allow access for Node.js on Private networks.
If port 3000 is in use (EADDRINUSE):netstat -aon | findstr :3000
taskkill /PID <PID> /F


Alternatively, update server.js to use port 3001 (change app.listen(3000, ...) to app.listen(3001, ...)) and update all public/*.html files to use http://localhost:3001.




Access the App:

User Flow:
Register: Open http://localhost:3000/register.html and use a unique email (e.g., user@example.com, password: password123).
Login: At http://localhost:3000/index.html, log in with the same credentials.
Books: At http://localhost:3000/books.html, view the book inventory and add books to the cart.
Cart: At http://localhost:3000/cart.html, view and remove books from the cart.


Admin Flow:
Admin Register: Open http://localhost:3000/admin_register.html and use a unique email (e.g., admin@example.com, password: admin123).
Login: At http://localhost:3000/index.html, log in with admin credentials.
Admin Panel: At http://localhost:3000/admin.html, add or delete books from the inventory.





Features

User Authentication: Register and log in with JWT-based authentication.
Admin Authentication: Separate admin registration for managing the book inventory.
Book Inventory: Displays a list of 20 books with title, author, price, and stock (each with 10 copies).
Cart System: Users can add books to their cart from books.html and remove them from cart.html, with total price calculation.
Admin Panel: Admins can add new books or delete existing ones.

Usage Examples

User:
Register at http://localhost:3000/register.html (e.g., user@example.com, password123).
Log in at index.html.
View the book list at books.html (e.g., “The Great Gatsby”, “1984”).
Click “Add to Cart” on a book, then go to cart.html to view or remove items.


Admin:
Register at http://localhost:3000/admin_register.html (e.g., admin@example.com, admin123).
Log in at index.html.
Manage books at admin.html (e.g., add “Dune” or delete “1984”).



Troubleshooting

“No books found” on books.html:
Ensure the server is running (npm start).
Check if database.db is seeded:
Stop the server (Ctrl + C).
Delete database.db:del database.db


Restart the server (npm start).


Open developer tools (F12 > Console/Network) and check the /books request:
Should return 200 OK with a JSON array of 20 books.
If 401 Unauthorized or 403 Forbidden, verify the JWT token in Local Storage (F12 > Application > Local Storage > token).
If empty ([]), the database seeding failed—delete database.db and restart.


Check server logs in the terminal for errors (e.g., “Error retrieving books”).


“User already exists”: Use a new email or delete database.db and restart.
“Cannot GET /.html”: Ensure files are in the public folder and the server is running.
Connection Errors: Check firewall settings, server status, and port (3000).
Browser Errors: Use developer tools (F12 > Console/Network) to inspect requests.

Known Issues

Cart uses a database with user email; no checkout functionality implemented.
Admin registration is separate for security.

Project Structure
CS492_GP2/
├── .github/
│   └── workflows/
│       ├── ci.yml
├── public/
│   ├── register.html
│   ├── index.html
│   ├── books.html
│   ├── admin_register.html
│   ├── admin.html
│   ├── cart.html
├── package.json
├── server.js


