# Mamool Malikee

A premium Arabian fragrance e-commerce web application built with Django. The platform offers traditional Arabian perfumery products including handcrafted oud, premium bakhoor, and natural musk oils.

## Tech Stack

- **Backend Framework:** Django (v4.2.30)
- **API Framework:** Django REST Framework (v3.18.0)
- **Database:** MySQL / MariaDB (via `mysqlclient` v2.2.8)
- **Frontend:** HTML, CSS (Custom styling), JavaScript
- **Icons:** FontAwesome (v6.5.1)
- **Fonts:** Playfair Display, Inter (Google Fonts)

## Project Structure

```text
perfume/
├── accounts/         # Django app for user authentication & management
├── perfume/          # Main project configuration (settings, wsgi, root urls)
├── static/           # Static assets (css, images, js)
├── templates/        # HTML templates (index.html, login.html, etc.)
├── venv/             # Python virtual environment (ignored in git)
└── manage.py         # Django CLI utility
```

## Features

### Currently Implemented Authentication Features
- User Registration (Frontend + Backend)
- User Login (Email/Password)
- User Logout
- Remember Me functionality
- Dynamic Navbar login state (Displays user name when logged in, handles login/logout toggling)
- Custom User Model (`accounts.User`)

### Features Not Yet Implemented
- **Forgot Password** (Password reset email flow & setting a new password)

## Important URLs/Routes

- **Homepage:** `/`
- **Register API (Class-Based):** `/api/accounts/register/`
- **Register Page:** `/api/accounts/registers/`
- **Login:** `/api/accounts/login/`
- **Logout:** `/api/accounts/logout/`

## Local Setup & Development

### 1. Create and Activate Virtual Environment (Windows)
```bash
python -m venv venv
venv\Scripts\activate
```

### 2. Install Dependencies
*(If `requirements.txt` exists)*
```bash
pip install -r requirements.txt
```
*Otherwise, manually install the required packages:*
```bash
pip install Django==4.2.30 djangorestframework==3.18.0 mysqlclient==2.2.8
```

### 3. Database Configuration
Ensure MySQL or MariaDB is running on your machine.
Create a database named `perfume_db`:
```sql
CREATE DATABASE perfume_db;
```
The project expects the default MySQL credentials:
- **Host:** localhost
- **Port:** 3306
- **User:** root
- **Password:** (empty)

*(Check `perfume/settings.py` -> `DATABASES` if your local database credentials differ).*

### 4. Apply Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Run the Development Server
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000/` in your browser.
