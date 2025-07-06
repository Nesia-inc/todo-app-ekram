import { data } from "react-router";
import type { Route } from "./+types/edit";
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

export async function action({ request, params }: Route.ActionArgs) {
  const { userId } = params;
  const formData = await request.formData();
  const name = formData.get("name") as string;

  // Validation
  if (!name || name.trim().length === 0) {
    return Response.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name: name.trim(),
      },
    });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return Response.json(
        { error: "A user with this name already exists" },
        { status: 400 }
      );
    }
    console.error("Failed to update user:", error);
    return Response.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }

  return redirect(`/users/${userId}`);
}

export default function EditUser({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  const tasksByStatus = {
    FINISHED: user.tasks.filter(task => task.status === "FINISHED").length,
    IN_PROGRESS: user.tasks.filter(task => task.status === "IN_PROGRESS").length,
    UNFINISHED: user.tasks.filter(task => task.status === "UNFINISHED").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Edit User
                </h1>
                <p className="text-slate-600 mt-2 text-lg font-medium">
                  Update user information and details
                </p>
              </div>
            </div>
            <a
              href={`/users/${user.id}`}
              className="group bg-white/70 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium border border-slate-200/50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to User</span>
            </a>
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

          {/* Task Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-emerald-700">{tasksByStatus.FINISHED}</p>
                </div>
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-amber-700">{tasksByStatus.IN_PROGRESS}</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-slate-700">{tasksByStatus.UNFINISHED}</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              User Information
            </h2>
          </div>

          <Form method="post" className="p-8 space-y-8">
            {/* Enhanced Name Input */}
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 flex items-center">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs mr-2">Required</span>
                User Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                  placeholder="Enter the user's full name"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm group-hover:bg-white/80 text-black"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                This name will be displayed throughout the application and used for task assignments.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200/50">
              <button
                type="submit"
                className="flex-1 group bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Update User</span>
              </button>
              <a
                href={`/users/${user.id}`}
                className="flex-1 group bg-slate-100/80 backdrop-blur-sm text-slate-700 py-4 px-8 rounded-xl hover:bg-slate-200/80 transition-all duration-300 font-semibold text-lg text-center border border-slate-200/50 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </a>
            </div>
          </Form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Tips for User Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👤</span>
                <p className="font-semibold text-slate-700">Clear Names</p>
              </div>
              <p className="text-slate-600 text-sm">Use full names or clear identifiers that team members will recognize easily.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🔄</span>
                <p className="font-semibold text-slate-700">Regular Updates</p>
              </div>
              <p className="text-slate-600 text-sm">Keep user information current to maintain accurate task assignments and reporting.</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📊</span>
                <p className="font-semibold text-slate-700">Task Overview</p>
              </div>
              <p className="text-slate-600 text-sm">Monitor task distribution to ensure balanced workload across team members.</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">✅</span>
                <p className="font-semibold text-slate-700">Validation</p>
              </div>
              <p className="text-slate-600 text-sm">Names must be unique to avoid confusion in task assignments and reporting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}