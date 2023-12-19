import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Spinner } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { auth } from "../firebase-config";
import { ToastContainer } from "react-toastify";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/dashboard/*"
          element={user ? <Dashboard /> : <Navigate to="/auth/sign-in" />}
        />
        <Route path="/auth/*" element={<Auth />} />
        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/dashboard/home" replace />
            ) : (
              <Navigate to="/auth/sign-in" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
