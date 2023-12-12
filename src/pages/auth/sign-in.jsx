import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase-config";

export function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (fieldName, valueName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: valueName,
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (formData.password.length >= 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    setError("");
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in the input fields");
        return;
      }

      setLoading(true);
      signInWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;
          setLoading(false);
          navigate("/dashboard/home");
          console.log("Login Success");
        })
        .catch((error) => {
          setLoading(false);
          setError("Invalid email or password");
          console.error("Error Message", error);
        });
    } catch (error) {
      setLoading(false);
      console.error("Error Message", error);
    }
  };
  return (
    <>
      <img
        src="https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Sign In
            </Typography>
          </CardHeader>
          <form onSubmit={submitHandler}>
            <CardBody className="flex flex-col gap-4">
              <Input
                onChange={(e) => handleInputChange("email", e.target.value)}
                value={formData.email || ""}
                type="email"
                label="Email"
                size="lg"
              />
              <Input
                onChange={(e) => handleInputChange("password", e.target.value)}
                value={formData.password || ""}
                type="password"
                autoComplete="current-password"
                label="Password"
                size="lg"
              />
              {error && (
                <Typography
                  variant="small"
                  color="red"
                  className="text-center font-semibold"
                >
                  {error}
                </Typography>
              )}
            </CardBody>
            <CardFooter className="pt-0 flex flex-col">
              {loading ? (
                <Spinner className="h-6 w-6 mr-3 self-center" color="white" /> // Show spinner when loading
              ) : (
                <Button type="submit" variant="gradient" fullWidth>
                  Sign In
                </Button>
              )}
              <Typography variant="small" className="mt-6 flex justify-center">
                Don't have an account?
                <Link to="/auth/sign-up">
                  <Typography
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold"
                  >
                    Sign up
                  </Typography>
                </Link>
              </Typography>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}

export default SignIn;
