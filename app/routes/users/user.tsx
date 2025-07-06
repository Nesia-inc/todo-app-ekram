import { data } from "react-router";
import type { Route } from "./+types/user";
import { Link, Form } from "react-router";
import prisma from "~/lib/prisma";

export async function loader({ params }: Route.LoaderArgs) {
  const { userId } = params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
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
  const taskId = formData.get("taskId") as string;
  const newStatus = formData.get("status") as string;

  if (!taskId || !newStatus) {
    return Response.json(
      { error: "Task ID and status are required" },
      { status: 400 }
    );
  }

  try {
    // Verify the task belongs to this user
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        userId: parseInt(userId),
      },
    });

    if (!task) {
      return Response.json(
        { error: "Task not found or does not belong to this user" },
        { status: 404 }
      );
    }

    // Update the task status
    await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status: newStatus as any },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update task status:", error);
    return Response.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}

export default function UserDetail({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  const tasksByStatus = {
    FINISHED: user.tasks.filter(task => task.status === "FINISHED"),
    IN_PROGRESS: user.tasks.filter(task => task.status === "IN_PROGRESS"),
    UNFINISHED: user.tasks.filter(task => task.status === "UNFINISHED"),
  };

  const statusOptions = [
    { value: "UNFINISHED", label: "Unfinished", color: "bg-gray-100 text-gray-800", icon: "⏳" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: "🔄" },
    { value: "FINISHED", label: "Finished", color: "bg-green-100 text-green-800", icon: "✅" },
  ];

  const getStatusColor = (status: string) => {
    return statusOptions.find(option => option.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Enhanced User Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-6">
              {/* User Avatar */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  {user.name}
                </h1>
                <div className="flex items-center space-x-6 text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">
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
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/users/${user.id}/edit`}
                className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit User</span>
              </Link>
              <Link
                to="/users"
                className="group bg-white/70 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium border border-slate-200/50 flex items-center space-x-2"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Users</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Task Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-800">{user.tasks.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{tasksByStatus.FINISHED.length}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">{tasksByStatus.IN_PROGRESS.length}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Enhanced Task Status Sections */}
          {Object.entries(tasksByStatus).map(([status, tasks]) => (
            <div key={status} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              <div className={`px-8 py-6 border-b border-white/20 relative overflow-hidden ${
                status === "FINISHED" ? "bg-gradient-to-r from-emerald-50 to-green-50" :
                status === "IN_PROGRESS" ? "bg-gradient-to-r from-amber-50 to-yellow-50" :
                "bg-gradient-to-r from-slate-50 to-gray-50"
              }`}>
                {/* Background Pattern */}
                <div className={`absolute inset-0 opacity-5 ${
                  status === "FINISHED" ? "bg-emerald-500" :
                  status === "IN_PROGRESS" ? "bg-amber-500" :
                  "bg-slate-500"
                }`} style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-5 h-5 rounded-full shadow-sm ${
                      status === "FINISHED" ? "bg-emerald-500 animate-pulse" :
                      status === "IN_PROGRESS" ? "bg-amber-500 animate-bounce" :
                      "bg-slate-500"
                    }`}></div>
                    <div>
                      <h3 className="text-2xl font-bold capitalize text-slate-800">
                        {status.replace("_", " ").toLowerCase()}
                      </h3>
                      <p className={`text-sm font-medium ${
                        status === "FINISHED" ? "text-emerald-600" :
                        status === "IN_PROGRESS" ? "text-amber-600" :
                        "text-slate-600"
                      }`}>
                        {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                      status === "FINISHED" ? "bg-emerald-100 text-emerald-800" :
                      status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                      "bg-slate-100 text-slate-800"
                    }`}>
                      {tasks.length}
                    </div>
                    
                    {/* Status Icon */}
                    <div className={`p-3 rounded-xl ${
                      status === "FINISHED" ? "bg-emerald-100 text-emerald-600" :
                      status === "IN_PROGRESS" ? "bg-amber-100 text-amber-600" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {status === "FINISHED" ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : status === "IN_PROGRESS" ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                {tasks.length > 0 ? (
                  <div className="space-y-6">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="group relative bg-gradient-to-r from-slate-50 to-white border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300/50 hover:from-blue-50 hover:to-white transform hover:-translate-y-1"
                      >
                        {/* Task Priority Indicator */}
                        <div className="absolute top-4 right-4">
                          <div className={`w-3 h-3 rounded-full ${
                            index < 2 ? "bg-red-400 animate-pulse" : 
                            index < 4 ? "bg-amber-400" : "bg-emerald-400"
                          }`}></div>
                        </div>
                        
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-6">
                            <div className="flex items-start space-x-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                status === "FINISHED" ? "bg-emerald-100 text-emerald-600" :
                                status === "IN_PROGRESS" ? "bg-amber-100 text-amber-600" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-xl group-hover:text-blue-600 transition-colors duration-200 mb-3">
                                  {task.title}
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-base">
                                  {task.content}
                                </p>
                                
                                {/* Task Metadata */}
                                <div className="flex items-center space-x-6 mt-4 text-sm text-slate-500">
                                  <div className="flex items-center space-x-2">
                                    <div className="bg-slate-100 p-1.5 rounded-lg">
                                      <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <span className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="bg-blue-100 p-1.5 rounded-lg">
                                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                    <span className="font-medium">{user.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-4">
                            <Form method="post" className="flex items-center">
                              <input type="hidden" name="taskId" value={task.id} />
                              <div className="relative group/select">
                                <select
                                  name="status"
                                  defaultValue={task.status}
                                  className={`appearance-none text-sm px-5 py-3 pr-10 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 cursor-pointer ${getStatusColor(task.status)} font-semibold shadow-sm hover:shadow-md group-hover/select:shadow-lg text-black`}
                                  onChange={(e) => {
                                    // Auto-submit the form when selection changes
                                    e.target.form?.requestSubmit();
                                  }}
                                >
                                  {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.icon} {option.label}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-700">
                                  <svg className="fill-current h-4 w-4 transition-transform duration-200 group-hover/select:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                  </svg>
                                </div>
                              </div>
                            </Form>
                            
                            {/* Quick Actions */}
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center ${
                      status === "FINISHED" ? "bg-emerald-100" :
                      status === "IN_PROGRESS" ? "bg-amber-100" :
                      "bg-slate-100"
                    }`}>
                      <svg className={`w-12 h-12 ${
                        status === "FINISHED" ? "text-emerald-500" :
                        status === "IN_PROGRESS" ? "text-amber-500" :
                        "text-slate-400"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-700 mb-3">No tasks in this status</h4>
                    <p className="text-slate-500 mb-6 text-lg">Tasks will appear here when their status matches</p>
                    <Link
                      to={`/tasks/new/${user.id}`}
                      className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create a task
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {user.tasks.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 text-center py-20">
            <div className="bg-slate-100 w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-slate-700 mb-3">No tasks assigned</h3>
            <p className="text-slate-500 text-xl mb-8">This user doesn't have any tasks yet.</p>
            <Link
              to={`/tasks/new/${user.id}`}
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create a task
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}