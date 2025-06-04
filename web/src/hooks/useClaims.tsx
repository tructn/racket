import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import constant from "../common/constant";

interface Claims {
  roles: string[];
  isAdmin: boolean;
  isLoading: boolean;
}

export const useClaims = (): Claims => {
  const { user, isAuthenticated, getIdTokenClaims } = useAuth0();
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const claims = await getIdTokenClaims();
        const userRoles: string[] = claims?.[constant.auth0.claims.roles] || [];
        setRoles(userRoles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [isAuthenticated, user, getIdTokenClaims]);

  return {
    roles,
    isAdmin: roles.includes(constant.auth0.roles.ADMIN),
    isLoading,
  };
};
