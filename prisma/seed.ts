import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Johnson",
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Smith",
      },
    }),
    prisma.user.create({
      data: {
        name: "Charlie Brown",
      },
    }),
    prisma.user.create({
      data: {
        name: "Diana Prince",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Setup project structure",
        content: "Initialize the React Router 7 project with proper folder structure and dependencies",
        status: TaskStatus.FINISHED,
        userId: users[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Design database schema",
        content: "Create Prisma schema with User and Task models including relationships",
        status: TaskStatus.FINISHED,
        userId: users[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement user management",
        content: "Create CRUD operations for users with proper validation",
        status: TaskStatus.IN_PROGRESS,
        userId: users[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Build task management features",
        content: "Implement task creation, editing, deletion, and status updates",
        status: TaskStatus.IN_PROGRESS,
        userId: users[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Create user interface components",
        content: "Build React components for user and task management pages",
        status: TaskStatus.UNFINISHED,
        userId: users[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Add form validation",
        content: "Implement client-side and server-side validation for all forms",
        status: TaskStatus.UNFINISHED,
        userId: users[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Style the application",
        content: "Apply TailwindCSS styling and ensure responsive design",
        status: TaskStatus.UNFINISHED,
        userId: users[3].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Write documentation",
        content: "Create comprehensive documentation for the API and usage",
        status: TaskStatus.UNFINISHED,
        userId: users[3].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Testing and debugging",
        content: "Perform thorough testing and fix any bugs found",
        status: TaskStatus.UNFINISHED,
        userId: users[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Deploy to production",
        content: "Set up production environment and deploy the application",
        status: TaskStatus.UNFINISHED,
        userId: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Display summary
  const tasksByStatus = await Promise.all([
    prisma.task.count({ where: { status: TaskStatus.FINISHED } }),
    prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    prisma.task.count({ where: { status: TaskStatus.UNFINISHED } }),
  ]);

  console.log("📊 Task summary:");
  console.log(`   - Finished: ${tasksByStatus[0]}`);
  console.log(`   - In Progress: ${tasksByStatus[1]}`);
  console.log(`   - Unfinished: ${tasksByStatus[2]}`);

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });