import type { Route } from "./+types/new";
import { Form, redirect } from "react-router";
import prisma from "~/lib/prisma";

export async function action({ request }: Route.ActionArgs) {
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
    await prisma.user.create({
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
    console.error("Failed to create user:", error);
    return Response.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  return redirect("/users");
}

export default function NewUser() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      
      <Form method="post" className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Enter user name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create User
          </button>
          <a
            href="/users"
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
          >
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}