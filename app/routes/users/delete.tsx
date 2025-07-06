import { data } from "react-router";
import type { Route } from "./+types/delete";
import { Form, redirect } from "react-router";
import prisma from "~/lib/prisma";

export async function loader({ params }: Route.LoaderArgs) {
  const { userId } = params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw data("User Not Found", { status: 404 });
  }
  return { user };
}

export async function action({ params }: Route.ActionArgs) {
  const { userId } = params;
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        tasks: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw data("User Not Found", { status: 404 });
    }

    // Delete user and all associated tasks in a transaction
    await prisma.$transaction(async (tx) => {
      if (user.tasks.length > 0) {
        await tx.task.deleteMany({
          where: { userId: parseInt(userId) },
        });
      }
      await tx.user.delete({
        where: { id: parseInt(userId) },
      });
    });
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }

  return redirect("/users");
}

export default function DeleteUser({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const hasAssignedTasks = user.tasks.length > 0;

  const tasksByStatus = {
    FINISHED: user.tasks.filter(task => task.status === "FINISHED"),
    IN_PROGRESS: user.tasks.filter(task => task.status === "IN_PROGRESS"),
    UNFINISHED: user.tasks.filter(task => task.status === "UNFINISHED"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Delete User
              </h1>
              <p className="text-slate-600 mt-2 text-lg font-medium">
                Remove user and all associated data
              </p>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <div className="flex items-center space-x-6 mt-2 text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-semibold">
                    <span className="text-blue-600">{user.tasks.length}</span> tasks assigned
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Card */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-xl flex-shrink-0">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-800 mb-3">
                ⚠️ This action cannot be undone
              </h2>
              <p className="text-red-700 text-lg mb-4">
                Deleting <strong>{user.name}</strong> will permanently remove:
              </p>
              <ul className="space-y-2 text-red-700 mb-6">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>The user account and all associated data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span><strong>{user.tasks.length}</strong> assigned tasks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>All task history and progress</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tasks Overview */}
        {hasAssignedTasks && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tasks that will be deleted ({user.tasks.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700">Completed</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-bold">
                    {tasksByStatus.FINISHED.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {tasksByStatus.FINISHED.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-sm text-emerald-600 truncate">
                      • {task.title}
                    </div>
                  ))}
                  {tasksByStatus.FINISHED.length > 3 && (
                    <div className="text-xs text-emerald-500">
                      +{tasksByStatus.FINISHED.length - 3} more
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-700">In Progress</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-bold">
                    {tasksByStatus.IN_PROGRESS.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {tasksByStatus.IN_PROGRESS.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-sm text-amber-600 truncate">
                      • {task.title}
                    </div>
                  ))}
                  {tasksByStatus.IN_PROGRESS.length > 3 && (
                    <div className="text-xs text-amber-500">
                      +{tasksByStatus.IN_PROGRESS.length - 3} more
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Pending</span>
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-sm font-bold">
                    {tasksByStatus.UNFINISHED.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {tasksByStatus.UNFINISHED.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-sm text-slate-600 truncate">
                      • {task.title}
                    </div>
                  ))}
                  {tasksByStatus.UNFINISHED.length > 3 && (
                    <div className="text-xs text-slate-500">
                      +{tasksByStatus.UNFINISHED.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Form method="post" className="flex-1">
            <button
              type="submit"
              className="w-full group bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-8 rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete User & All Tasks</span>
            </button>
          </Form>
          <a
            href={`/users/${user.id}`}
            className="flex-1 group bg-white/70 backdrop-blur-sm text-slate-700 py-4 px-8 rounded-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg text-center border border-slate-200/50 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Cancel</span>
          </a>
        </div>
      </div>
    </div>
  );
}