import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  id: any;
  role: string;
  lastName: string;
  enabled: boolean;
}

const RequireAdmin = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithAdminCheck: React.FC<P> = (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token) as JwtPayload;

        if (decodedToken.role !== "ADMIN") {
          navigate("/error-403");
        }
      } catch (error) {
        navigate("/login");
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };

  return WithAdminCheck;
};

export default RequireAdmin;
