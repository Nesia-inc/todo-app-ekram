import { Form, redirect } from "react-router";
import { Link } from "react-router";
import prisma from "~/lib/prisma";

export async function loader({ params }: { params: { userId: string } }) {
  const { userId } = params;
  
  // Load all users for the dropdown
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });
  
  // Load the specific user to pre-select
  const selectedUser = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
  
  return { users, selectedUser };
}

export async function action({ request, params }: { request: Request; params: { userId: string } }) {
  const { userId } = params;
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const selectedUserId = formData.get("userId") as string;
  const status = formData.get("status") as string;

  // Validation
  if (!title || title.trim().length === 0) {
    return Response.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  if (!content || content.trim().length === 0) {
    return Response.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  if (!selectedUserId) {
    return Response.json(
      { error: "Please select a user" },
      { status: 400 }
    );
  }

  try {
    await prisma.task.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        status: (status as any) || "UNFINISHED",
        userId: parseInt(selectedUserId),
      },
    });
  } catch (error: any) {
    console.error("Failed to create task:", error);
    return Response.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }

  // Redirect back to the user detail page
  return redirect(`/users/${selectedUserId}`);
}

export default function NewTask({ loaderData }: { loaderData: { users: any[]; selectedUser: any } }) {
  const { users, selectedUser } = loaderData;

  const statusOptions = [
    { value: "UNFINISHED", label: "Unfinished", color: "bg-gray-100 text-gray-800", icon: "⏳" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: "🔄" },
    { value: "FINISHED", label: "Finished", color: "bg-green-100 text-green-800", icon: "✅" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Create New Task
                </h1>
                <p className="text-slate-600 mt-2 text-lg font-medium">
                  {selectedUser ? `Assign a new task to ${selectedUser.name}` : "Assign a new task to a team member"}
                </p>
              </div>
            </div>
            <Link
              to={`/users/${selectedUser?.id || ''}`}
              className="group bg-white/70 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium border border-slate-200/50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to User</span>
            </Link>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Task Details
            </h2>
          </div>

          <Form method="post" className="p-8 space-y-8">
            {/* Enhanced Task Title */}
            <div className="space-y-3">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 flex items-center">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs mr-2">Required</span>
                Task Title
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="Enter a descriptive title for the task"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm group-hover:bg-white/80 text-black"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Task Content */}
            <div className="space-y-3">
              <label htmlFor="content" className="block text-sm font-semibold text-slate-700 flex items-center">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs mr-2">Required</span>
                Task Description
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={6}
                placeholder="Provide detailed description of the task, requirements, and any specific instructions..."
                className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm hover:bg-white/80 text-black"
              />
            </div>

            {/* Enhanced User Assignment and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Assign to User */}
              <div className="space-y-3">
                <label htmlFor="userId" className="block text-sm font-semibold text-slate-700 flex items-center">
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs mr-2">Required</span>
                  Assign to
                </label>
                <div className="relative group">
                  <select
                    id="userId"
                    name="userId"
                    required
                    defaultValue={selectedUser?.id || ""}
                    className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer bg-white/50 backdrop-blur-sm group-hover:bg-white/80 text-black"
                  >
                    <option value="">Select a team member</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Initial Status */}
              <div className="space-y-3">
                <label htmlFor="status" className="block text-sm font-semibold text-slate-700">
                  Initial Status
                </label>
                <div className="relative group">
                  <select
                    id="status"
                    name="status"
                    defaultValue="UNFINISHED"
                    className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer bg-white/50 backdrop-blur-sm group-hover:bg-white/80 text-black"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200/50">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Task
              </button>
              <Link
                to={`/users/${selectedUser?.id || ''}`}
                className="flex-1 bg-slate-100/80 backdrop-blur-sm text-slate-700 py-4 px-8 rounded-xl hover:bg-slate-200/80 transition-all duration-300 font-semibold text-lg text-center border border-slate-200/50"
              >
                Cancel
              </Link>
            </div>
          </Form>
        </div>

        {/* Enhanced Help Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Tips for Creating Effective Tasks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📝</span>
                <p className="font-semibold text-slate-700">Clear Title</p>
              </div>
              <p className="text-slate-600 text-sm">Use descriptive, action-oriented titles that clearly indicate what needs to be done.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📋</span>
                <p className="font-semibold text-slate-700">Detailed Description</p>
              </div>
              <p className="text-slate-600 text-sm">Include specific requirements, deadlines, and any relevant context or resources.</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👤</span>
                <p className="font-semibold text-slate-700">Right Assignment</p>
              </div>
              <p className="text-slate-600 text-sm">Choose the team member best suited for the task based on their skills and availability.</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🎯</span>
                <p className="font-semibold text-slate-700">Appropriate Status</p>
              </div>
              <p className="text-slate-600 text-sm">Set the initial status that accurately reflects the current state of the task.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
