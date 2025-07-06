# Todo App with React Router 7 & Prisma

A modern, full-stack task management application built with React Router 7, Prisma ORM, and PostgreSQL. This application allows teams to manage users and their assigned tasks with a beautiful, responsive interface.

## 🚀 Features

- **User Management**: Create, edit, and delete team members
- **Task Management**: Assign tasks to users with detailed descriptions
- **Task Status Tracking**: Three status levels (Unfinished, In Progress, Finished)
- **Real-time Updates**: Dynamic task status updates without page refresh
- **Beautiful UI**: Modern design with TailwindCSS and glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Integration**: PostgreSQL with Prisma ORM for robust data management
- **Type Safety**: Full TypeScript support throughout the application

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router 7, TypeScript
- **Styling**: TailwindCSS 4
- **Backend**: React Router 7 (Server-side rendering)
- **Database**: PostgreSQL with Prisma ORM
- **Development**: Vite, Hot Module Replacement (HMR)
- **Deployment**: Docker support with multi-stage builds

## 📋 Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd todo-app-ekram
npm install
```

### 2. Database Setup

#### Option A: Using Docker Compose (Recommended)

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance on port `25432` with the following credentials:
- Database: `kachi`
- Username: `root`
- Password: `root`

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally, create a database and update the `DATABASE_URL` in your environment variables.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://root:root@localhost:25432/kachi"
```

### 4. Database Migration and Seeding

Set up the database schema and seed with sample data:

```bash
# Push the database schema
npm run db:push

# Seed the database with sample users and tasks
npm run db:seed
```

### 5. Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## 📊 Database Schema

The application uses two main models:

### User Model
- `id`: Unique identifier
- `name`: User's name (unique)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
- `tasks`: Relationship to assigned tasks

### Task Model
- `id`: Unique identifier
- `title`: Task title
- `content`: Detailed task description
- `status`: Task status (UNFINISHED, IN_PROGRESS, FINISHED)
- `userId`: Reference to assigned user
- `createdAt`: Task creation timestamp
- `updatedAt`: Last update timestamp

## 🎯 Application Features

### User Management
- **View All Users**: Dashboard showing all team members with task statistics
- **User Details**: Individual user pages with their assigned tasks
- **Create Users**: Add new team members to the system
- **Edit Users**: Update user information
- **Delete Users**: Remove users from the system

### Task Management
- **Create Tasks**: Assign new tasks to team members with detailed descriptions
- **Task Status Updates**: Change task status (Unfinished → In Progress → Finished)
- **Task Organization**: Tasks are organized by status for easy tracking
- **Task Statistics**: Visual representation of task completion rates

### User Interface
- **Modern Design**: Glassmorphism effects with backdrop blur
- **Responsive Layout**: Optimized for all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Status Indicators**: Color-coded task status badges
- **Statistics Cards**: Overview of user and task metrics

## 🐳 Docker Deployment

### Building the Application

```bash
docker build -t todo-app .
```

### Running with Docker Compose

```bash
# Start the full stack (database + application)
docker-compose up -d
```

### Manual Docker Run

```bash
# Run the containerized application
docker run -p 3000:3000 --env-file .env todo-app
```

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio for database management

## 🌱 Database Seeding

The application comes with a comprehensive seed script that creates:

- **4 Sample Users**: Alice Johnson, Bob Smith, Charlie Brown, Diana Prince
- **10 Sample Tasks**: Various tasks with different statuses assigned to users
- **Realistic Data**: Tasks that simulate a real project development workflow

To reset and reseed the database:

```bash
npm run db:seed
```

## 🔧 Development Tools

- **Prisma Studio**: Database management interface
  ```bash
  npm run db:studio
  ```
- **TypeScript**: Full type safety and IntelliSense support
- **Hot Module Replacement**: Instant updates during development
- **ESLint**: Code quality and consistency

## 📁 Project Structure

```
todo-app-ekram/
├── app/
│   ├── routes/           # React Router routes
│   │   ├── users/        # User management pages
│   │   └── tasks/        # Task management pages
│   ├── lib/              # Utility libraries
│   └── welcome/          # Welcome page components
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Database seeding script
│   └── migrations/      # Database migrations
├── public/              # Static assets
├── docker-compose.yml   # Docker services configuration
├── Dockerfile          # Multi-stage Docker build
└── package.json        # Dependencies and scripts
```

## 🚀 Production Deployment

The application is production-ready and can be deployed to various platforms:

### Cloud Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **Render**: Application hosting

### Container Platforms
- **AWS ECS**: Container orchestration
- **Google Cloud Run**: Serverless containers
- **Azure Container Apps**: Managed container service
- **Digital Ocean App Platform**: Container deployment

### Self-Hosted
- **Docker Swarm**: Container orchestration
- **Kubernetes**: Production-grade container management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using React Router 7, Prisma, and TailwindCSS.
