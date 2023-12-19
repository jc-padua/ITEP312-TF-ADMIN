import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  CardFooter,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";

import { useEffect, useState } from "react";
import { db, storage } from "../../../firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export function Tables() {
  const [usersData, setUsersData] = useState([]);
  const [incompleteUsers, setIncompleteUsers] = useState([]);
  const [completedUsers, setCompletedUsers] = useState([]);

  const fetchUserData = async () => {
    try {
      const userDocRef = await getDocs(collection(db, "user-datas"));
      const userData = userDocRef.docs.map((doc) => {
        const data = doc.data();
        return data;
      });

      const userProgressData = [];
      for (const userDoc of userDocRef.docs) {
        const userID = userDoc.id;
        const userData = userDoc.data();
        const userCreatedAt = userDoc.data().createdAt.toDate();

        const userModuleProgressCollectionRef = collection(
          db,
          "user-datas",
          userID,
          "module-progress",
        );

        const userModuleProgressSnapshot = await getDocs(
          userModuleProgressCollectionRef,
        );
        const userModuleProgressDocs = userModuleProgressSnapshot.docs.map(
          (doc) => {
            const progressData = doc.data();
            return {
              progress: parseInt(progressData.progress),
              complete: progressData.complete || false,
              badge: progressData.badge || {
                badgePath: "",
                isClaimed: false,
              },
            };
          },
        );

        const totalCompletion =
          userModuleProgressDocs.length > 0
            ? userModuleProgressDocs.reduce(
                (sum, progress) => sum + progress.progress,
                0,
              ) / userModuleProgressDocs.length
            : 0;
        const totalModulesCompleted = userModuleProgressDocs.filter(
          (module) => module.complete,
        ).length;
        const totalBadgesClaimed = userModuleProgressDocs.filter(
          (module) => module.badge.isClaimed,
        ).length;

        userProgressData.push({
          ...userData,
          userID: userID,
          createdAt: userCreatedAt,
          moduleProgress: Math.floor(totalCompletion),
          moduleCompleted: totalModulesCompleted,
          badgesClaimed: totalBadgesClaimed,
        });
      }

      const incomplete = userProgressData.filter(
        (user) => user.moduleProgress !== 100,
      );
      const complete = userProgressData.filter(
        (user) => user.moduleProgress === 100,
      );

      setUsersData(userProgressData);
      setIncompleteUsers(incomplete);
      setCompletedUsers(complete);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserData();
    const userCollectionRef = collection(db, "user-datas");
    const unsubscribeUser = onSnapshot(userCollectionRef, () => {
      fetchUserData();
    });

    return () => {
      unsubscribeUser();
    };
  }, []);

  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "user-datas", userId));
      // Update incomplete and completed users separately
      setIncompleteUsers((prevIncompleteUsers) =>
        prevIncompleteUsers.filter((user) => user.userId !== userId),
      );
      setCompletedUsers((prevCompletedUsers) =>
        prevCompletedUsers.filter((user) => user.userId !== userId),
      );
      setOpen(false);
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while deleting the user.");
    }
  };

  const [open, setOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  const handleOpen = (data) => {
    setSelectedUserData(data);
    setOpen(!open);
  };

  const [openInvitation, setOpenInvitation] = useState(false);
  const handleInvitationOpen = () => setOpenInvitation((cur) => !cur);

  const currentUserEmail = getAuth().currentUser.email;
  const currentUserName = getAuth().currentUser.displayName;
  const [invitationDetails, setInvitationDetails] = useState({
    seminarDetails: "",
    date: "",
    platform: "",
    platformLink: "",
  });

  const [loading, setLoading] = useState(false);

  const sendInvitation = async (userName, userEmail) => {
    setLoading(true);

    const serviceId = "service_ux63io4";
    const templateId = "template_t4vw3ql";
    const publicKey = "D3BeG9S63k40E_WB8";

    const templateParams = {
      from_name: currentUserName,
      from_email: currentUserEmail,
      to_email: userEmail,
      to_name: userName,
      seminarDetails: invitationDetails.seminarDetails,
      date: invitationDetails.date,
      platform: invitationDetails.platform,
      platformLink: invitationDetails.platformLink,
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setInvitationDetails({
        seminarDetails: "",
        date: "",
        platform: "",
        platformLink: "",
      });

      toast.success("Invitation sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error sending invitation");
    } finally {
      setLoading(false);
    }
  };

  const canSendInvitation = completedUsers.length >= 2;
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Users Table
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Address", "Gender", "Completion", ""].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incompleteUsers.map((data, key) => {
                const className = `py-3 px-5 ${
                  key === incompleteUsers.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={key}>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {data.name}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {data.email}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {data.municipality}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {data.cityProvince}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={data.gender === "Male" ? "blue" : "pink"}
                        value={data.gender === "Male" ? "Male" : "Female"}
                        className="py-0.5 px-2 text-[11px] font-medium"
                      />
                    </td>
                    <td className={className}>
                      <div className="w-10/12">
                        <Typography
                          variant="small"
                          className="mb-1 block text-xs font-medium text-blue-gray-600"
                        >
                          {data.moduleProgress}%
                        </Typography>
                        <Progress
                          value={data.moduleProgress}
                          variant="gradient"
                          color={40 === 100 ? "green" : "blue"}
                          className="h-1"
                        />
                      </div>
                    </td>
                    <td className={className}>
                      <Typography
                        onClick={() => handleOpen(data)}
                        as="a"
                        href="#"
                        className="text-xs font-semibold text-blue-gray-600"
                      >
                        View
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        as="a"
                        href="#"
                        className="text-xs font-semibold text-blue-gray-600"
                        onClick={() => {
                          const userConfirmed = window.confirm(
                            "Are you sure you want to delete this user?",
                          );

                          if (userConfirmed) {
                            deleteUser(data.userID);
                          }
                        }}
                      >
                        Delete
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <Card>
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 flex justify-between
        "
        >
          <Typography variant="h6" color="white">
            Completers Table
          </Typography>
          <Button
            variant="gradient"
            color="white"
            onClick={() => {
              if (canSendInvitation) {
                handleInvitationOpen(true);
              } else {
                toast.error(
                  "There must be 30 or more completers to send invitations.",
                );
              }
            }}
            disabled={!canSendInvitation}
          >
            Send Invitation<span>({completedUsers.length} / 30+)</span>
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Address", "Gender", "Completion", ""].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedUsers.map((data, key) => {
                const className = `py-3 px-5 ${
                  key === completedUsers.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={key}>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {data.name}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {data.email}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {data.municipality}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {data.cityProvince}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={data.gender === "Male" ? "blue" : "pink"}
                        value={data.gender === "Male" ? "Male" : "Female"}
                        className="py-0.5 px-2 text-[11px] font-medium"
                      />
                    </td>
                    <td className={className}>
                      <div className="w-10/12">
                        <Typography
                          variant="small"
                          className="mb-1 block text-xs font-medium text-blue-gray-600"
                        >
                          {data.moduleProgress}%
                        </Typography>
                        <Progress
                          value={data.moduleProgress}
                          variant="gradient"
                          color={40 === 100 ? "green" : "blue"}
                          className="h-1"
                        />
                      </div>
                    </td>
                    <td className={className}>
                      <Typography
                        onClick={() => handleOpen(data)}
                        as="a"
                        href="#"
                        className="text-xs font-semibold text-blue-gray-600"
                      >
                        View
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        as="a"
                        href="#"
                        className="text-xs font-semibold text-blue-gray-600"
                        onClick={() => {
                          const userConfirmed = window.confirm(
                            "Are you sure you want to delete this user?",
                          );

                          if (userConfirmed) {
                            deleteUser(data.userID);
                          }
                        }}
                      >
                        Delete
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} size="lg">
        <Card className="mt-6">
          {selectedUserData && (
            <CardBody className="flex">
              <CardHeader
                color="blue-gray"
                className="w-[50%] flex flex-col items-center p-10 gap-10"
              >
                <img
                  src="https://campussafetyconference.com/wp-content/uploads/2020/08/iStock-476085198-300x300.jpg"
                  alt="card-image"
                  className="rounded-full w-[70%]"
                />
                <Progress
                  variant="gradient"
                  color={40 === 100 ? "green" : "blue"}
                  className="h-10"
                  size="lg"
                  label="Complete"
                  value={selectedUserData && selectedUserData.moduleProgress}
                />
              </CardHeader>

              <CardBody className="w-[50%]">
                <Typography variant="h2" color="gray" className="uppercase">
                  {selectedUserData && selectedUserData.name}
                </Typography>
                <Typography variant="small" color="gray" className="mb-4">
                  {selectedUserData && selectedUserData.municipality},{" "}
                  {selectedUserData && selectedUserData.cityProvince}
                </Typography>
                <hr className="border-2 border-blue-gray-900 mb-4" />
                <Typography
                  variant="h6"
                  color="gray"
                  className="uppercase mb-5"
                >
                  Email: {selectedUserData && selectedUserData.email}
                </Typography>
                <Typography
                  variant="h6"
                  color="gray"
                  className="uppercase mb-5"
                >
                  Phone Number:{" "}
                  {selectedUserData && selectedUserData.phoneNumber}
                </Typography>
                <Typography
                  variant="h6"
                  color="gray"
                  className="uppercase mb-5"
                >
                  Status: {selectedUserData && selectedUserData.status}
                </Typography>
                <Typography
                  variant="h6"
                  color="gray"
                  className="uppercase mb-5"
                >
                  Module Completed:{" "}
                  {selectedUserData && selectedUserData.moduleCompleted}
                </Typography>
                <Typography variant="h6" color="gray" className="uppercase">
                  Badge Acquired:{" "}
                  {selectedUserData && selectedUserData.badgesClaimed}
                </Typography>
              </CardBody>
            </CardBody>
          )}
          <CardFooter className="pt-0 flex justify-end">
            <Button
              variant="gradient"
              color="red"
              onClick={() => handleOpen(null)}
              className="mr-1"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
      <Dialog
        size="xs"
        open={openInvitation}
        handler={handleInvitationOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[24rem]">
          <form onSubmit={(e) => e.preventDefault()}>
            <CardBody className="flex flex-col gap-4">
              <Typography className="mb-4" variant="h5">
                Send Invitation
              </Typography>
              <Input
                type="text"
                label="Seminar Details"
                required
                value={invitationDetails.seminarDetails}
                onChange={(e) =>
                  setInvitationDetails((prev) => ({
                    ...prev,
                    seminarDetails: e.target.value,
                  }))
                }
              />
              <Input
                label="Date Start and Due"
                required
                value={invitationDetails.date}
                onChange={(e) =>
                  setInvitationDetails((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
              <Select
                label="Online Platform"
                value={invitationDetails.platform}
                onChange={(value) =>
                  setInvitationDetails((prev) => ({
                    ...prev,
                    platform: value,
                  }))
                }
              >
                <Option value="Google Meet">Google Meet</Option>
                <Option value="Zoom">Zoom</Option>
              </Select>
              <Input
                required
                label="Platform Link"
                size="lg"
                value={invitationDetails.platformLink}
                onChange={(e) =>
                  setInvitationDetails((prev) => ({
                    ...prev,
                    platformLink: e.target.value,
                  }))
                }
              />
            </CardBody>
            <CardFooter className="pt-0">
              <Button
                type="submit"
                variant="gradient"
                onClick={() => {
                  setLoading(true);
                  Promise.all(
                    completedUsers.map((user) =>
                      sendInvitation(user.name, user.email),
                    ),
                  ).finally(() => {
                    setLoading(false);
                    handleInvitationOpen();
                  });
                }}
                fullWidth
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Now"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>
    </div>
  );
}

export default Tables;
