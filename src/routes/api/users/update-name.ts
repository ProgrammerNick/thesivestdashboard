import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateInitialsAvatar } from "@/lib/avatars";

export const Route = createFileRoute("/api/users/update-name")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get current session
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: {
                "Content-Type": "application/json",
              },
            });
          }

          // Parse request body
          const body = await request.json();
          const { firstName, lastName } = body;

          if (!firstName || !lastName) {
            return new Response(
              JSON.stringify({
                error: "First name and last name are required",
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }

          // Generate a default avatar based on user's name
          const defaultAvatar = generateInitialsAvatar(
            `${firstName} ${lastName}`
          );

          // Update user with default avatar
          await db
            .update(user)
            .set({
              image: defaultAvatar,
              updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id));

          return new Response(
            JSON.stringify({
              success: true,
              message: "Profile updated successfully",
              avatar: defaultAvatar,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Error updating user profile:", error);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      },
    },
  },
});
