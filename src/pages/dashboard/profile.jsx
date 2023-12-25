import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Typography,
  Button,
  Dialog,
  Input,
  Chip,
  Drawer,
  Switch,
} from "@material-tailwind/react";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { db } from "../../../firebase-config";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  AtSymbolIcon,
  EnvelopeOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

import { ToastContainer, toast } from "react-toastify";
import { data } from "autoprefixer";

export function Profile() {
  const [currentUser, setCurrentUser] = useState({
    address: "",
    email: "",
    name: "",
    phoneNumber: "",
  });

  const [otherUsers, setOtherUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const dataDocRef = await getDocs(collection(db, "admin-datas"));
      const allUsers = dataDocRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const adminData = allUsers.filter((data) => data.email === auth.email);
      setCurrentUser(...adminData);

      const filteredOtherUsers = allUsers.filter(
        (user) => user.email !== auth.email,
      );
      setOtherUsers(filteredOtherUsers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (name, value) => {
    setCurrentUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    if (!validateInputs()) {
      return;
    }

    setOpenDialog(!openDialog);
    if (openDialog) {
      setOpenLeft(true);
    }
  };
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [openLeft, setOpenLeft] = useState(false);
  const openDrawerLeft = () => setOpenLeft(true);
  const closeDrawerLeft = () => {
    if (openDialog) {
      setOpenLeft(true);
    } else {
      setOpenLeft(false);
    }
  };

  const auth = getAuth().currentUser;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateInputs = () => {
    let isValid = true;

    if (
      !currentUser.name ||
      !currentUser.phoneNumber ||
      !currentUser.email ||
      !currentUser.address
    ) {
      toast.error("Please fill in the input fields");
      isValid = false;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long");
        isValid = false;
      } else if (newPassword !== confirmNewPassword) {
        toast.error("Passwords do not match");
        isValid = false;
      }
    }

    return isValid;
  };

  const confirmUpdate = async () => {
    try {
      const adminDataQuery = collection(db, "admin-datas");
      const adminDataSnapshot = await getDocs(adminDataQuery);
      const adminData = adminDataSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((data) => data.email === auth.email);

      const credential = EmailAuthProvider.credential(
        auth.email,
        currentPassword,
      );
      await reauthenticateWithCredential(auth, credential);
      await updateEmail(auth, currentUser.email);
      await updatePassword(auth, newPassword);

      if (adminData) {
        const adminDocRef = doc(db, "admin-datas", adminData.id);
        await setDoc(adminDocRef, {
          name: currentUser.name,
          phoneNumber: currentUser.phoneNumber,
          email: currentUser.email,
          address: currentUser.address,
          userValidated: true,
        });
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      toast.success("Profile Updated");
      fetchUsers();
      handleOpenDialog();
      closeDrawerLeft();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const [openOtherUserDialog, setOpenOtherUserDialog] = useState(false);
  const [selectedOtherUser, setSelectedOtherUser] = useState({});

  const handleOpenOtherUserDialog = (data) => {
    setOpenOtherUserDialog(!openOtherUserDialog);
    setSelectedOtherUser(data);
    if (openOtherUserDialog) {
      setSelectedOtherUser({});
    }
    setSwitchState(data.userValidated);
  };

  const [switchState, setSwitchState] = useState(
    selectedOtherUser.userValidated || false,
  );

  const updateUserValidity = async (selectedUser, value) => {
    try {
      const otherDataQuery = collection(db, "admin-datas");
      const otherDataSnapshot = await getDocs(otherDataQuery);
      const otherUserData = otherDataSnapshot.docs
        .map((doc) => doc.data())
        .find((data) => data.email === selectedUser.email);

      if (otherUserData) {
        const otherDocRef = doc(db, "admin-datas", selectedUser.id);
        await setDoc(otherDocRef, {
          ...otherUserData,
          userValidated: value,
        });

        setSwitchState(value);

        toast.success(
          `${selectedOtherUser.name} can now ${
            value ? "access" : "no longer access"
          } the admin platform`,
        );
        fetchUsers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Card className="mt-12 mb-8 flex flex-col gap-12">
        <CardHeader>
          <div className="relative h-72 w-full  rounded-xl bg-[url('../../../public/img/bgbanner.jpg')] bg-cover bg-center ">
            <div className="absolute h-full w-full" />
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between gap-6">
            {currentUser && (
              <div className="flex items-center gap-6">
                <div>
                  <div className="mx-5">
                    <div
                      className="flex items-center gap-5
                    "
                    >
                      <Typography
                        variant="h5"
                        color="blue-gray"
                        className="mb-1"
                      >
                        {currentUser.name}{" "}
                      </Typography>
                      <Chip
                        value="Edit"
                        className="cursor-pointer"
                        variant="ghost"
                        onClick={openDrawerLeft}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-2">
            <div>
              {currentUser && (
                <ProfileInfoCard
                  title="Profile Information"
                  details={{
                    mobile: currentUser.phoneNumber,
                    email: currentUser.email,
                    location: currentUser.address,
                  }}
                />
              )}
            </div>
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Admin Platform Users
              </Typography>
              <ul className="flex flex-col gap-6">
                {otherUsers.map((props) => (
                  <MessageCard
                    key={props.name}
                    {...props}
                    isValidated={props.userValidated}
                    action={
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => handleOpenOtherUserDialog(props)}
                      >
                        View
                      </Button>
                    }
                  />
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
      <Drawer
        placement="left"
        open={openLeft}
        onClose={closeDrawerLeft}
        className="p-4"
        size={400}
      >
        <img
          src="../../../public/img/ydao.png"
          style={{
            maxWidth: "100%",
            width: "10rem",
            opacity: 0.5,
            margin: "1rem auto",
          }}
          className="lg:ml-20"
        />
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-6 flex flex-col gap-5 items-center justify-between">
            <Typography variant="h4" color="blue-gray">
              Edit Account Details
            </Typography>
            <Input
              label="Display Name"
              size="lg"
              value={currentUser.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Input
              label="Mobile Number"
              size="lg"
              type="tel"
              maxLength={11}
              max={11}
              value={currentUser.phoneNumber || ""}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
            <Input
              label="Email"
              size="lg"
              value={currentUser.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <Input
              label="Location"
              size="lg"
              value={currentUser.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
            <Input
              label="Password"
              size="lg"
              value={newPassword || ""}
              onChange={(e) => setNewPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              icon={
                <div
                  className="cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-blue-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-blue-gray-500" />
                  )}
                </div>
              }
            />
            <Input
              label="Confirm Password"
              size="lg"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              icon={
                <div
                  className="cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-blue-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-blue-gray-500" />
                  )}
                </div>
              }
            />
          </div>
        </form>
        <div className="flex">
          <Button
            variant="gradient"
            onClick={() => handleOpenDialog()}
            fullWidth
          >
            Update Profile
          </Button>
        </div>
      </Drawer>

      <Dialog size="xs" open={openDialog} handler={handleOpenDialog}>
        <div className="p-5 flex flex-col gap-5">
          <Typography variant="h4" className="-mb-4" color="blue-gray">
            Confirm Updating Details
          </Typography>
          <Typography variant="small" color="blue-gray">
            Enter your password to proceed in updating your profile details
          </Typography>
          <form onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Enter your password"
              type="password"
              size="lg"
              required
              value={currentPassword || ""}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </form>
          <Button variant="gradient" color="green" onClick={confirmUpdate}>
            Confirm
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={openOtherUserDialog}
        handler={handleOpenOtherUserDialog}
        size="md"
      >
        <div className="flex items-center justify-center flex-col-reverse lg:flex-row p-5">
          <div className="p-5">
            <Typography variant="h5" className="mb-2">
              {selectedOtherUser.name || ""}
            </Typography>
            <Typography variant="lead" className="mb-4">
              Other Details
            </Typography>
            <Typography className="flex gap-2">
              <EnvelopeOpenIcon className="w-4" />
              {selectedOtherUser.email || ""}
            </Typography>
            <Typography className="flex gap-2">
              <PhoneIcon className="w-4" />
              {selectedOtherUser.phoneNumber || ""}
            </Typography>
            <Typography className="flex gap-2">
              <MapPinIcon className="w-4" />
              {selectedOtherUser.address || ""}
            </Typography>
            <div className="mt-2">
              {selectedOtherUser?.role === "admin" ? (
                ""
              ) : (
                <Switch
                  checked={switchState}
                  label={switchState ? "Disable User" : "Enable User"}
                  className="h-full w-full checked:bg-[#2ec946]"
                  containerProps={{
                    className: "w-11 h-6",
                  }}
                  circleProps={{
                    className: "before:hidden left-0.5 border-none",
                  }}
                  onChange={(e) => {
                    updateUserValidity(selectedOtherUser, e.target.checked);
                  }}
                />
              )}
            </div>
          </div>
          <img
            src="../../../public/img/ydao.png"
            style={{
              maxWidth: "100%",
              width: "15rem",
              opacity: 0.5,
              margin: "20px 0",
            }}
            className="lg:ml-20"
          />
        </div>
      </Dialog>
    </>
  );
}

export default Profile;
