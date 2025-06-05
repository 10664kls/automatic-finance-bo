import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/Auth";
import { useEffect, useState } from "react";
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, getProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const user = profile || (await getProfile());
      setValid(!!user);
      setLoading(false);
    };
    checkProfile();
  }, [profile, getProfile]);

  if (loading) return <div>Loading...</div>;

  return valid ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
