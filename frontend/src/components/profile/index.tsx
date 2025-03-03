import React from "react";
import SectionLoading from "../loading/section-loading";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

interface UserProfileProp {
  showLabel: boolean;
}

const UserProfile: React.FC<UserProfileProp> = ({ showLabel }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <SectionLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <div className="flex items-center justify-start gap-2">
      <img
        className="rounded-full"
        src={user!.picture}
        alt={user!.name}
        height={40}
        width={40}
      />
      {showLabel && (
        <div className="flex flex-col items-start justify-start">
          <h2 className="font-bold">{user!.name}</h2>
          {user?.email && <small>{user?.email}</small>}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
