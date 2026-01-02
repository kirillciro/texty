import { getEffectiveUserRole } from "@/utils/roles";
import { UserRole } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";

/**
 * Hook to get the current user's role
 */
export function useUserRole(): UserRole {
  const { user } = useUser();

  return getEffectiveUserRole(
    user?.publicMetadata?.role as UserRole,
    user?.emailAddresses[0]?.emailAddress
  );
}
