import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";
import { authAdmin } from "../config/firebase";
import { db, usersTable } from "@workspace/db";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

async function upsertFirebaseUser(decodedToken: any) {
  const [firstName, ...lastNames] = (decodedToken.name || "").split(" ");
  const lastName = lastNames.join(" ");

  const userData = {
    id: decodedToken.uid,
    email: decodedToken.email || null,
    firstName: firstName || null,
    lastName: lastName || null,
    profileImageUrl: decodedToken.picture || null,
  };

  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    const dbUser = await upsertFirebaseUser(decodedToken);
    
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
    };
  } catch (error) {
    console.error("Firebase auth error:", error);
  }


  next();
}
