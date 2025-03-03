import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mantine/core";
import { FaSignInAlt } from "react-icons/fa";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      fullWidth
      color="blue"
      leftSection={<FaSignInAlt />}
      size="lg"
      onClick={() => loginWithRedirect()}
    >
      Login
    </Button>
  );
};

export default LoginButton;
