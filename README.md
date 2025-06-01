
# Task Manager App

Sebuah Fullstack Web App Untuk Memanage Task yang dibangun menggunakan Django, React, dan JavaScript. Web App ini dirancang dengan desain yang menarik dan intuitif, serta memiliki fitur-fitur yang memudahkan pengguna dalam mengelola Task.
 


## Tech Stack

**Client:** React, Bootstrap 5

**Server:** Django


## Features

- Task Manage App (Create Update Delete Task)
- Sign in / Sign Up Account 
- Forget Password Email Verification
- Change profile and Password


## Environment Variables

Untuk Dapat Menjalankan Project Ini , Anda Perlu Menambahkan Beberapa Variabel di Dalam .env file

`VITE_API_URL` = 'your-backend-url'

`SECRET_KEY` = 'your-django-secret-key'

`ALLOWED_HOSTS` = 'allowed-host-django'

`CORS_ALLOWED_ORIGINS` = 'your-frontend-url'

`PROTECTED_ROUTES` = '/api/

`FRONTEND_BASE_URL` = 'your-frontend-url'

`EMAIL_HOST_PASSWORD` = 'your-email-host-password'

`DEFAULT_FROM_EMAIL` = 'your-default-from-email'

`EMAIL_HOST_USER` = 'your-email-host-user'


## Running Program

To run program, run the following command:

- Clone Repositories :
```bash
git clone https://github.com/SyalomielePratama/TaskManagerApp
```
- Run Backend
```bash
py manage.py makemigrations
```
```bash
py manage.py migrate
```

- Default Admin / Superuser Password
```bash
Username : Admin
Password : admin123
```

- Run Frontend
```bash
npm install
```
```bash
npm run dev
```
## Authors

- [@SyalomielePratama](https://www.github.com/SyalomielePratama)

