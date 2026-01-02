import { UserRole } from "./types";

// Define admin and editor emails
const ADMIN_EMAILS = ["kirillsnuf@gmail.com"];
const EDITOR_EMAILS: string[] = ["kirill.st2022@gmail.com"]; // Add editor emails here

/**
 * Get user role based on email address
 */
export function getUserRoleByEmail(email: string | undefined): UserRole {
  if (!email) return "user";

  const lowerEmail = email.toLowerCase();

  if (ADMIN_EMAILS.includes(lowerEmail)) {
    return "admin";
  }

  if (EDITOR_EMAILS.includes(lowerEmail)) {
    return "editor";
  }

  return "user";
}

/**
 * Get the effective user role, prioritizing publicMetadata but falling back to email-based role
 */
export function getEffectiveUserRole(
  metadataRole: UserRole | undefined,
  email: string | undefined
): UserRole {
  // If metadata has a role, use it
  if (metadataRole && ["admin", "editor", "user"].includes(metadataRole)) {
    return metadataRole;
  }

  // Otherwise, determine by email
  return getUserRoleByEmail(email);
}
