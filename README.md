# Task Management App

A task management application backend built with **Express**, **PostgreSQL**, and **Prisma** ORM.

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)    
- [API Endpoints](#api-endpoints)  
- [What I Learned](#what-i-learned)

- Create, read, update, and delete (CRUD) tasks  
- Organize tasks by user (or project, if implemented)  
- Validation and error handling  
- Database migrations using Prisma  
- REST API built with NestJS (or Express, depending on your code)  

## Tech Stack

- **Backend**: Express  
- **Database**: PostgreSQL  
- **ORM**: Prisma  
- **Language**: TypeScript  
- **Tools**: Prisma Migrate, Prisma Client  

## Project Structure

```
├── task-manager-backend/
│   ├── prisma/        # Prisma schema & migrations
│   ├── src/                     
│   │   ├── routes/    # API Routes         
│   │   ├── utils/
│   │   ├── server.ts                              
│   └── package.json            
└── task-manager-frontend/      # (if you have frontend)  
│   ├── src/                     
│   │   ├── api/     
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/  
│   │   ├── app.tsx
│   │   ├── main.tsx                            
│   └── package.json                   
```


## API Endpoints

| Method | Endpoint             | Description                       |
|--------|----------------------|-----------------------------------|
| POST   | `/register`          | Register new user                 |
| POST   | `/login`             | Login and get token               |
| POST   | `/projects`          | Create a new project              |
| GET    | `/projects`          | Get all projects                  |
| GET    | `/projects/:id`      | Get a specific project            |
| PUT    | `/projects/:id`      | Update a project                  |
| DELETE | `/projects/:id`      | Delete a project                  |
| POST   | `/tasks`             | Create a new task                 |
| GET    | `/tasks`             | Get all tasks                     |
| GET    | `/tasks/:id`         | Get a specific task               |
| PUT    | `/tasks/:id`         | Update a task                     |
| DELETE | `/tasks/:id`         | Delete a task                     |
| GET    | `/projects/:id/tasks`| Get tasks belonging to a project  |


## What I Learned

- How to build a REST API using Express with TypeScript
- Implementing user authentication using bcrypt and JWT
- Structuring database models and relationships with Prisma
- Running migrations and managing PostgreSQL through Prisma
- Creating CRUD endpoints for users, projects, and tasks
- Using middleware to protect routes with token validation
- Handling errors and responses
- Organizing backend folder structure for scalability

