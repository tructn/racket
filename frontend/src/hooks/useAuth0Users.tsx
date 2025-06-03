import httpService from "@/common/httpservice";
import { useQuery } from "@tanstack/react-query";

type Auth0User = {
  user_id: string;
  email: string;
  masked_email: string;
  name: string;
  picture?: string;
  last_login?: string;
  logins_count?: number;
};

export type User = {
  id?: string;
  idpUserId?: string;
  email: string;
  firstName: string;
  lastName?: string;
  picture?: string;
  isActive?: boolean;
  lastLogin?: string;
};

const useAuth0Users = () => {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["auth0Users"],
    queryFn: async () => {
      const data = await httpService.get<Auth0User[]>("/api/v1/users/auth0");
      return data.map((user) => ({
        id: user.user_id,
        idpUserId: user.user_id,
        email: user.masked_email,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ")[1] || "",
        picture: user.picture,
        lastLogin: user.last_login,
      }));
    },
  });

  return {
    users,
    isLoading,
  };
};

export default useAuth0Users;
