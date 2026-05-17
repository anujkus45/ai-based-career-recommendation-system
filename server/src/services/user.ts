import { db, usersTable, assessmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

export interface UserContext {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  recentAssessments: any[];
}

export async function buildUserContext(userId: string): Promise<UserContext> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const recentAssessments = await db
    .select()
    .from(assessmentsTable)
    .where(eq(assessmentsTable.userId, userId))
    .orderBy(desc(assessmentsTable.createdAt))
    .limit(3);

  return {
    user: {
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      email: user?.email ?? null,
    },
    recentAssessments: recentAssessments ?? [],
  };
}

export function formatUserContextPrompt(context: UserContext): string {
  if (!context.user.firstName && context.recentAssessments.length === 0) {
    return "";
  }

  let prompt = "\n\nAdditional User Context (Personalization):";
  if (context.user.firstName) {
    prompt += `\nStudent Name: ${context.user.firstName} ${context.user.lastName ?? ""}`;
  }

  if (context.recentAssessments.length > 0) {
    prompt += "\nRecent Career Interests/Assessments:";
    context.recentAssessments.forEach((assessment, i) => {
      prompt += `\n${i + 1}. ${assessment.careerTitle} (Match Score: ${assessment.matchScore}%)`;
    });
  }

  return prompt;
}
