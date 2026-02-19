import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  console.log("🔔 Webhook received!");
  console.log("📝 WEBHOOK_SECRET exists:", !!WEBHOOK_SECRET);

  if (!WEBHOOK_SECRET) {
    console.error("❌ WEBHOOK_SECRET is missing!");
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  console.log("📨 Svix Headers:", {
    id: svixId ? "✅" : "❌",
    timestamp: svixTimestamp ? "✅" : "❌",
    signature: svixSignature ? "✅" : "❌",
  });

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("❌ Missing svix headers!");
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;

    const eventType = evt.type;
    console.log("✅ Webhook verified successfully!");
    console.log("📋 Event Type:", eventType);
    console.log("👤 User Data:", JSON.stringify(evt.data, null, 2));

    // Handle session and email events (return success without processing)
    if (
      eventType === "session.created" ||
      eventType === "session.ended" ||
      eventType === "email.created"
    ) {
      return NextResponse.json({ message: "OK", event: eventType });
    }

    if (eventType === "user.created") {
      const { id, email_addresses, image_url, first_name, last_name, username } =
        evt.data;
      
      console.log("🆕 Creating user in MongoDB...");
      console.log("📧 Email:", email_addresses[0]?.email_address);
      console.log("👤 Name:", first_name, last_name);
      console.log("🔑 Clerk ID:", id);

      // Create a new user in our database
      const mongoUser = {
        clerkId: id,
        firstName: first_name || username || "User",
        lastName: last_name || "N/A", // Default value for required field
        username: username || `${first_name || "User"}${last_name ? ` ${last_name}` : ""}`,
        email: email_addresses[0].email_address,
        picture: image_url || "",
      };

      console.log("💾 Saving user:", mongoUser);

      try {
        const user = await createUser(mongoUser);
        console.log("✅ User created successfully in MongoDB:", user);
        return NextResponse.json({ message: "OK", user });
      } catch (error: any) {
        console.error("❌ Error creating user in MongoDB:", error);
        return NextResponse.json(
          { message: "Error creating user", error: error.message },
          { status: 500 }
        );
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, image_url, first_name, last_name } =
        evt.data;
      
      console.log("🔄 Updating user in MongoDB...");
      console.log("🔑 Clerk ID:", id);
      
      // Do something with the user created event:  Update a new user in our database*
      const updatedData = {
        clerkId: id,
        data: {
          firstName: first_name || "User",
          lastName: last_name || "N/A",
          userName: `${first_name || "User"}${last_name ? ` ${last_name}` : ""}`,
          email: email_addresses[0].email_address,
          picture: image_url,
        },
      };

      try {
        const updatedUser = await updateUser(updatedData);
        console.log("✅ User updated successfully in MongoDB");
        return NextResponse.json({ message: "User Updated", updatedUser });
      } catch (error: any) {
        console.error("❌ Error updating user in MongoDB:", error);
        return NextResponse.json(
          { message: "Error updating user", error: error.message },
          { status: 500 }
        );
      }
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      console.log("HEY IM DELETED", id);

      const deletedUser = await deleteUser({ clerkId: id! });

      return NextResponse.json({ message: "User Deleted", deletedUser });
    }
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  return new Response("", { status: 200 });
}
