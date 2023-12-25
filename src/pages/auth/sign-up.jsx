import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../../../firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
export function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (fieldName, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const validateFields = () => {
    const requiredFields = ["name", "email", "phoneNumber", "address"];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }

    if (!validatePassword()) {
      return false;
    }

    setError("");
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const user = userCredential.user;

      const userDocRef = await addDoc(collection(db, "admin-datas"), {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        createdAt: serverTimestamp(),
        userValidated: false,
      });

      setLoading(false);
      navigate("/auth/sign-in", { state: { userCreated: true } });
    } catch (error) {
      setLoading(false);
      console.error("Error signing up:", error.message);
      setError("Error signing up. Please try again.");
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
              Sign Up
            </Typography>
          </CardHeader>
          <form onSubmit={submitHandler}>
            <CardBody className="flex flex-col gap-4">
              <Input
                onChange={(e) => handleInputChange("name", e.target.value)}
                label="Name"
                size="lg"
              />
              <Input
                onChange={(e) => handleInputChange("email", e.target.value)}
                type="email"
                label="Email"
                size="lg"
              />
              <Input
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                label="Number"
                min={0}
                type="tel"
                max={11}
                size="lg"
              />
              <Input
                onChange={(e) => handleInputChange("address", e.target.value)}
                type="text"
                label="Address"
                size="lg"
              />
              <Input
                onChange={(e) => handleInputChange("password", e.target.value)}
                type="password"
                label="Password"
                size="lg"
              />
              <Input
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                type="password"
                label="Confirm Password"
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
                <Spinner className="h-6 w-6 mr-3 self-center" color="white" />
              ) : (
                <Button type="submit" variant="gradient" fullWidth>
                  Sign Up
                </Button>
              )}
              <Typography variant="small" className="mt-6 flex justify-center">
                Already have an account?
                <Link to="/auth/sign-in">
                  <Typography
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold"
                  >
                    Sign in
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

export default SignUp;
