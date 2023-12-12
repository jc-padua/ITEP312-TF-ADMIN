import React, { useEffect, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  PencilIcon,
  UserPlusIcon,
  TrashIcon,
  BookOpenIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  IconButton,
  Tooltip,
  Drawer,
  Select,
  Option,
  Textarea,
  Checkbox,
} from "@material-tailwind/react";
import { TabView, TabPanel } from "primereact/tabview";
// import { Checkbox } from "primereact/checkbox";

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import {
  ref,
  getDownloadURL,
  deleteObject,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "../../../firebase-config";

const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Easy",
    value: "easy-module",
  },
  {
    label: "Medium",
    value: "medium-module",
  },
  {
    label: "Difficult",
    value: "difficult-module",
  },
];

const TABLE_HEAD = [
  "Topic",
  "Module",
  "Difficulty",
  "Module Type",
  "Edit",
  "Delete",
];

// TODO: FIX THE DRAWER TAB AND BADGE CHECKBOX

export function Modules() {
  const [open, setOpen] = useState(false);
  const [moduleData, setModuleData] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchedData, setSearchedData] = useState("");
  const [activeTab, setActiveTab] = useState("module");
  const [selectedTableHeader, setSelectedTableHeader] = useState("Module");
  const [file, setFile] = useState("");
  const [per, setPerc] = useState(null);
  const [formData, setFormData] = useState({
    topic: "",
    module: "",
    difficulty: "",
    moduleType: "",
    videoDescription: "",
    sourcePath: "",
    badgePath: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [checked, setChecked] = useState(false);
  const [badgeChecked, setBadgeChecked] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [moduleFileName, setModuleFileName] = useState("");
  const [selectedBadgeFile, setSelectedBadgeFile] = useState(null);
  const [badgeFileName, setBadgeFileName] = useState(""); // State for badge file name

  const fetchData = async () => {
    try {
      const moduleDocRef = await getDocs(collection(db, "modules-datas"));
      const moduleData = moduleDocRef.docs.map((doc) => {
        const data = doc.data();
        return {
          topic: data.topic,
          module: data.module,
          difficulty: data.difficulty,
          moduleType: data.moduleType,
          videoDescription: data.videoDescription,
          sourcePath: data.sourcePath,
          badgePath: data.badgePath,
        };
      });
      setModuleData([...moduleData]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();

    const moduleRef = collection(db, "modules-datas");
    const unsubscribeModule = onSnapshot(moduleRef, () => {
      fetchData();
    });

    return () => {
      unsubscribeModule();
    };
  }, []);

  const openDrawer = (moduleData) => {
    setSelectedModule(moduleData);
    setFormData({
      topic: moduleData?.topic || "",
      module: moduleData?.module || "",
      difficulty: moduleData?.difficulty || "",
      moduleType: moduleData?.moduleType || "",
      videoDescription: moduleData?.videoDescription || "",
      badgePath: moduleData?.badgePath || "",
      sourcePath: moduleData?.sourcePath || "",
    });

    if (moduleData.moduleType === "module") {
      const sourceHttpRef = ref(storage, moduleData.sourcePath);
      setModuleFileName(sourceHttpRef.name);
      if (moduleData.badgePath) {
        setChecked(true);
        setBadgeChecked(true);
        const badgeHttpRef = ref(storage, moduleData.badgePath);
        setBadgeFileName(badgeHttpRef.name);
        getDownloadURL(badgeHttpRef)
          .then((downloadURL) => {
            setImagePreviewUrl(downloadURL);
            const httpsRef = ref(storage, downloadURL);
            console.log(httpsRef);
          })
          .catch((error) => {
            console.error("Error loading badge image URL:", error);
          });
      }
    } else if (moduleData.moduleType === "video") {
      if (moduleData.badgePath) {
        setChecked(true);
        setBadgeChecked(true);

        const badgeHttpRef = ref(storage, moduleData.badgePath);
        setBadgeFileName(badgeHttpRef.name);
        getDownloadURL(badgeHttpRef)
          .then((downloadURL) => {
            setImagePreviewUrl(downloadURL);
          })
          .catch((error) => {
            console.error("Error loading badge image URL:", error);
          });
      }
      setUrlVideo(moduleData.sourcePath || ""); // Initialize videoURL with sourcePath
      // setYoutubeKey(prevKey => prevKey + 1);
    }

    const tab = moduleData.moduleType === "module" ? "module" : "video";
    setActiveTab(tab);
    setActiveIndex(tab === "module" ? 0 : 1);
    setIsEdit(true);
    setOpen(true);
  };

  const closeDrawer = () => {
    setSelectedModule(null);
    setFormData({
      topic: "",
      module: "",
      difficulty: "",
      videoDescription: "",
      moduleType: "",
      sourcePath: "",
    });
    setActiveTab("module");
    setIsEdit(false);
    setFile(null);
    setSelectedFile(null);
    setModuleFileName("");
    setBadgeFileName("");
    setSelectedBadgeFile(null);
    setChecked(false);
    setBadgeChecked(false);
    setImagePreviewUrl("");
    setOpen(false);
    setUrlVideo("");
  };

  const handleInputChange = (fieldName, newValue) => {
    if (fieldName === "search") {
      console.log(newValue);
      setSearchedData(newValue);
    } else {
      // Update the formData with the selected Table Header value
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: newValue,
      }));
    }
  };

  const filteredRows =
    selectedTab === "all"
      ? moduleData
      : moduleData.filter((row) => row.difficulty === selectedTab);

  const filteredAndSearchedRows = filteredRows.filter((row) =>
    row.topic.toLowerCase().includes(searchedData.toLowerCase()),
  );

  // PDF UPLOAD
  const handleBadgeFileInputChange = (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    setSelectedBadgeFile(file);
    setBadgeFileName(fileName);
    setFormData((prevData) => ({
      ...prevData,
      badgePath: fileName,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleModuleFileInputChange = (e) => {
    const file = e.target.files[0];
    const fileName = new Date().getTime() + file.name;
    setSelectedFile(file);
    setModuleFileName(fileName);
    setFormData((prevData) => ({
      ...prevData,
      sourcePath: fileName,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (activeIndex == 0) {
      if (
        !formData.topic ||
        !formData.module ||
        !formData.difficulty ||
        !formData.sourcePath
      ) {
        alert("Please fill in all required fields.");
        return;
      }
    } else {
      if (
        !formData.topic ||
        !formData.module ||
        !formData.difficulty ||
        !formData.sourcePath ||
        !formData.videoDescription
      ) {
        alert("Please fill in all required fields.");
        return;
      }
    }

    if (checked && !formData.badgePath) {
      alert("Please upload an image when the checkbox is checked.");
      return;
    }

    const documentID = formData.module;
    const difficultyID = formData.difficulty.split("-")[0];
    const moduleCollectionRef = collection(db, "modules-datas");

    // ADD TO FIREBASE
    formData.moduleType = selectedTableHeader.toLowerCase(); // USE selectedTabHeader IF THE MODULE TYPE IS ALWAYS `MODULE`

    try {
      if (isEdit) {
        const updatedDocumentID = `module${documentID}-${difficultyID}`;
        const moduleDocRef = doc(moduleCollectionRef, updatedDocumentID);
        const moduleDocSnapshot = await getDoc(moduleDocRef);

        if (
          moduleDocSnapshot.exists() &&
          moduleDocSnapshot.id !== updatedDocumentID
        ) {
          alert(`Module ${updatedDocumentID} already exist.`);
          return;
        }

        if (formData.topic !== selectedModule.topic) {
          await updateDoc(moduleDocRef, {
            ...formData,
            module: documentID,
          });
          closeDrawer();
          return;
        }

        if (formData.videoDescription !== selectedModule.videoDescription) {
          await updateDoc(moduleDocRef, {
            ...formData,
            module: documentID,
          });
          closeDrawer();
          return;
        }

        if (formData.badgePath !== selectedModule.badgePath) {
          let badgeDownloadURL;
          if (checked && formData.badgePath) {
            const badgeStorageRef = ref(storage, formData.badgePath);
            const badgeFileSnapshot = await uploadBytes(
              badgeStorageRef,
              selectedBadgeFile,
              { contentType: "image/png" },
            );
            badgeDownloadURL = await getDownloadURL(badgeStorageRef);
          }

          if (selectedModule.badgePath) {
            const badgeFileRef = ref(storage, selectedModule.badgePath);
            await deleteObject(badgeFileRef);
          }

          await updateDoc(moduleDocRef, { badgePath: badgeDownloadURL });
          closeDrawer();
          return;
        }

        if (formData.sourcePath !== selectedModule.sourcePath) {
          // Only update sourcePath if it has changed
          const storageRef = ref(storage, formData.sourcePath);
          const fileSnapshot = await uploadBytes(storageRef, selectedFile);
          const downloadURL = await getDownloadURL(storageRef);

          const filePath = selectedModule.sourcePath;
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);

          await updateDoc(moduleDocRef, { sourcePath: downloadURL });
          closeDrawer();
          return;
        }

        // ! FIXME: UPDATING ISSUE. IT REPLACES THE EXISITING MODULE/VIDEO
        const ogModuleID = selectedModule.module;
        const ogDifficultyID = selectedModule.difficulty.split("-")[0];
        const ogDocumentID = `module${ogModuleID}-${ogDifficultyID}`;

        //* DELETE SOURCE PATH
        if (formData.moduleType === "module") {
          const filePath = selectedModule.sourcePath;
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }

        //* DELETE BADGE PATH
        if (selectedModule.badgePath) {
          const badgeFileRef = ref(storage, selectedModule.badgePath);
          await deleteObject(badgeFileRef);
        }

        //* DELETE OG DATA
        const ogDocRef = doc(db, "modules-datas", ogDocumentID);
        await deleteDoc(ogDocRef);

        //* SET NEW DATA FOR VIDEO TYPE
        if (formData.moduleType === "video") {
          await setDoc(moduleDocRef, {
            ...formData,
            module: documentID,
          });
          closeDrawer();
          return;
        }

        //* SET NEW DATA FOR MODULE TYPE
        const storageRef = ref(storage, formData.sourcePath);
        const fileSnapshot = await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(storageRef);

        let badgeDownloadURL;

        // Check if the checkbox is checked and badgePath exists
        if (checked && formData.badgePath) {
          const badgeStorageRef = ref(storage, formData.badgePath);
          const badgeFileSnapshot = await uploadBytes(
            badgeStorageRef,
            selectedBadgeFile,
            { contentType: "image/png" },
          );
          badgeDownloadURL = await getDownloadURL(badgeStorageRef);
        }

        // FIXME: ADDED (MIGHT CAUSE BUGS)
        await setDoc(moduleDocRef, {
          ...formData,
          module: documentID,
          sourcePath: downloadURL,
          badgePath: badgeDownloadURL || "",
        });

        closeDrawer();
      } else {
        const newDocumentID = `module${documentID}-${difficultyID}`;
        const moduleDocRef = doc(moduleCollectionRef, newDocumentID);
        const moduleDocSnapshot = await getDoc(moduleDocRef);

        if (moduleDocSnapshot.exists()) {
          alert(`Module ${newDocumentID} already exists!`);
          return;
        }

        let badgeDownloadURL;
        if (formData.badgePath) {
          const badgeStorageRef = ref(storage, formData.badgePath);
          const badgeFileSnapshot = await uploadBytes(
            badgeStorageRef,
            selectedBadgeFile,
            { contentType: "image/png" },
          );
          badgeDownloadURL = await getDownloadURL(badgeStorageRef);
        }

        if (formData.moduleType === "video") {
          if (checked) {
            await setDoc(moduleDocRef, {
              ...formData,
              module: documentID,
              badgePath: badgeDownloadURL,
            });
            closeDrawer();
            return;
          }
          await setDoc(moduleDocRef, {
            ...formData,
            module: documentID,
          });
          closeDrawer();
          return;
        } else {
          const sourceStorageRef = ref(storage, formData.sourcePath);
          const sourceFileSnapshot = await uploadBytes(
            sourceStorageRef,
            selectedFile,
          );
          const sourceDownloadURL = await getDownloadURL(sourceStorageRef);

          if (checked) {
            await setDoc(moduleDocRef, {
              ...formData,
              module: documentID,
              badgePath: badgeDownloadURL,
              sourcePath: sourceDownloadURL,
            });
          } else {
            await setDoc(moduleDocRef, {
              ...formData,
              module: documentID,
              badgePath: "",
              sourcePath: sourceDownloadURL,
            });
          }
        }
        closeDrawer();
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  };

  const handleDeleteModule = async (moduleData) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this module?",
    );

    if (confirmDelete) {
      try {
        const customDocId = moduleData.module;
        const difficultyID = moduleData.difficulty.split("-")[0];
        const moduleType = moduleData.moduleType;

        if (moduleType === "module") {
          const filePath = moduleData.sourcePath; // Use the sourcePath directly
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }

        if (moduleData.badgePath) {
          const badgePath = moduleData.badgePath;
          const badgeRef = ref(storage, badgePath);
          await deleteObject(badgeRef);
        }

        const moduleDocRef = doc(
          db,
          "modules-datas",
          `module${customDocId}-${difficultyID}`,
        );

        await deleteDoc(moduleDocRef);

        updateModuleDataAfterDelete(moduleData);
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const updateModuleDataAfterDelete = (moduleToDelete) => {
    setModuleData((prevModuleData) =>
      prevModuleData.filter((module) => module !== moduleToDelete),
    );
  };

  // YOUTUBE VIDEO FETCHING
  const [videoURL, setUrlVideo] = useState("");
  const handlePaste = (event) => {
    setUrlVideo(event.clipboardData.getData("text").split("v=")[1]);
  };

  useEffect(() => {
    const handlePasteAnywhere = (event) => {
      console.log(event.clipboardData.getData("text"));
    };

    window.addEventListener("paste", handlePasteAnywhere);

    return () => {
      window.removeEventListener("paste", handlePasteAnywhere);
    };
  }, []);

  const data = [
    {
      label: "Module",
      value: "module",
      icon: BookOpenIcon,
      body: () => {
        return (
          <>
            <div className="mb-2 flex items-center justify-between p-4 ">
              <Typography variant="h5" color="blue-gray">
                Edit Module
              </Typography>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={closeDrawer}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
            <form className="flex flex-col" onSubmit={submitHandler}>
              <div className="mb-4">
                <Input
                  label="Topic"
                  value={formData?.topic || ""}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                />
              </div>
              <div className="mb-4 flex gap-5">
                <Input
                  label="Module"
                  type="number"
                  min={1}
                  value={formData?.module || ""}
                  onChange={(e) => handleInputChange("module", e.target.value)}
                />
                <Select
                  label="Select Difficulty"
                  value={formData?.difficulty || ""}
                  onChange={(newValue) =>
                    handleInputChange("difficulty", newValue)
                  }
                >
                  <Option value="easy-module">Easy</Option>
                  <Option value="medium-module">Medium</Option>
                  <Option value="difficult-module">Difficult</Option>
                </Select>
              </div>
              <div className="mb-4">
                <div className="">
                  <label htmlFor="badge" className="mr-2">
                    Badge
                  </label>
                  <Checkbox
                    // inputId="badge"
                    name="badge"
                    value="badge"
                    onChange={(e) => {
                      setChecked(e.target.checked);
                      setBadgeChecked(e.target.checked);
                    }}
                    checked={checked}
                  />
                </div>

                {badgeChecked && (
                  <div className="">
                    <Card className="w-full flex justify-center items-center gap-5 p-4">
                      {imagePreviewUrl && (
                        <Card className="w-28">
                          <img src={imagePreviewUrl} alt="Image Preview" />
                        </Card>
                      )}
                      <label className="relative inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform transform hover:scale-105 active:scale-95 overflow-hidden max-w-[15rem]">
                        <input
                          type="file"
                          accept="image/png"
                          id="badge-file"
                          className="hidden"
                          onChange={handleBadgeFileInputChange}
                        />
                        <span className="truncate">
                          {badgeFileName || "Choose a file"}
                        </span>
                      </label>
                    </Card>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h2>Module File Upload</h2>
                <Card className="w-full">
                  <CardFooter className="mt-5 pt-0 flex justify-center">
                    <label className="relative inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform transform hover:scale-105 active:scale-95 overflow-hidden max-w-[15rem]">
                      <input
                        type="file"
                        id="module-file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleModuleFileInputChange}
                      />
                      <span className="truncate">
                        {moduleFileName || "Choose a file"}
                      </span>
                    </label>
                  </CardFooter>
                </Card>
              </div>
              <Button
                type="submit"
                disabled={per !== null && per < 100}
                ripple={true}
              >
                Submit
              </Button>
            </form>
          </>
        );
      },
    },
    {
      label: "Video",
      value: "video",
      icon: ViewfinderCircleIcon,
      body: () => {
        return (
          <>
            <div className="mb-2 flex items-center justify-between p-4 ">
              <Typography variant="h5" color="blue-gray">
                Edit Video
              </Typography>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={closeDrawer}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
            <form className="flex flex-col " onSubmit={submitHandler}>
              <div className="mb-4">
                <Input
                  label="Topic"
                  value={formData?.topic || ""}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                />
              </div>
              <div className="mb-4 flex gap-5">
                <Input
                  label="Module"
                  type="number"
                  min={1}
                  value={formData?.module || ""}
                  onChange={(e) => handleInputChange("module", e.target.value)}
                />
                <Select
                  label="Select Difficulty"
                  value={formData?.difficulty || ""}
                  onChange={(newValue) =>
                    handleInputChange("difficulty", newValue)
                  }
                >
                  <Option value="easy-module">Easy</Option>
                  <Option value="medium-module">Medium</Option>
                  <Option value="difficult-module">Difficult</Option>
                </Select>
              </div>
              <div className="mb-4 flex gap-5">
                <Textarea
                  label="Video Description"
                  value={formData?.videoDescription || ""}
                  onChange={(e) =>
                    handleInputChange("videoDescription", e.target.value)
                  }
                />
                {/* <Input label="Video Description" /> */}
              </div>
              <div className="mb-4">
                <div className="">
                  <label htmlFor="badge" className="mr-2">
                    Badge
                  </label>
                  <Checkbox
                    // inputId="badge"
                    name="badge"
                    value="badge"
                    onChange={(e) => {
                      setChecked(e.checked);
                      setBadgeChecked(e.checked);
                    }}
                    checked={checked}
                  />
                </div>

                {badgeChecked && (
                  <div className="">
                    <Card className="w-full flex justify-center items-center gap-5 p-4">
                      {imagePreviewUrl && (
                        <Card className="w-28">
                          <img src={imagePreviewUrl} alt="Image Preview" />
                        </Card>
                      )}
                      <label className="relative inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform transform hover:scale-105 active:scale-95 overflow-hidden max-w-[15rem]">
                        <input
                          type="file"
                          accept="image/png"
                          id="badge-file"
                          className="hidden"
                          onChange={handleBadgeFileInputChange}
                        />
                        <span className="truncate">
                          {badgeFileName || "Choose a file"}
                        </span>
                      </label>
                    </Card>
                  </div>
                )}
              </div>
              <div className="mb-4 flex justify-around">
                <Card className="mt-5 w-full">
                  {/* <CardHeader
                    color="blue-gray"
                    className="relative h-26 w-25rem]"
                  >
                    <YouTube
                      videoId={videoURL || formData.sourcePath}
                      key={youtubeKey}
                      opts={{
                        height: '300',
                        width: '100%',
                      }}
                    />
                  </CardHeader> */}
                  <CardFooter className="mt-5 pt-0 flex justify-center">
                    <Input
                      type="text"
                      label="Video Link"
                      className="flex items-center gap-3"
                      value={formData.sourcePath}
                      onChange={(event) =>
                        handleInputChange("sourcePath", event.target.value)
                      }
                      onPaste={handlePaste}
                    />
                  </CardFooter>
                </Card>
              </div>
              <Button type="submit" ripple={true}>
                Submit
              </Button>
            </form>
          </>
        );
      },
    },
  ];

  return (
    <section className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl">Manage Modules</h1>
      </div>

      <div className="flex">
        <Card className="h-full w-full">
          <CardHeader floated={false} shadow={false} className="rounded-none">
            <div className="mb-8 flex items-center justify-between gap-8">
              <div>
                <Typography variant="h5" color="blue-gray">
                  Modules list
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                  Click to see information about all modules on the right side
                </Typography>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button
                  className="flex items-center gap-3"
                  size="sm"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add new
                  module
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <Tabs
                value={selectedTab}
                onChange={setSelectedTab}
                className="w-full md:w-max"
              >
                <TabsHeader>
                  {TABS.map(({ label, value }) => (
                    <Tab
                      key={value}
                      value={value}
                      onClick={() => setSelectedTab(value)}
                    >
                      &nbsp;&nbsp;{label}&nbsp;&nbsp;
                    </Tab>
                  ))}
                </TabsHeader>
              </Tabs>
              <div className="w-full md:w-72">
                <Input
                  label="Search"
                  onChange={(e) => handleInputChange("search", e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                />
              </div>
            </div>
          </CardHeader>
          <CardBody className="overflow-scroll px-0">
            <table className="mt-4 w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head, index) => (
                    <th
                      key={head}
                      className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                    >
                      <div className="flex items-center justify-between gap-2 font-normal leading-none opacity-70">
                        {head}{" "}
                        {head === index && (
                          <ChevronUpDownIcon
                            strokeWidth={2}
                            className={`h-4 w-4`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSearchedRows.map((rowData, index) => {
                  const isLast = index === moduleData.length - 1;
                  const classes = isLast
                    ? "p-4 "
                    : "p-4 border-b border-blue-gray-50 ";

                  return (
                    <tr key={index}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {rowData.topic}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            Module {rowData.module}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              rowData.difficulty === "easy-module"
                                ? "Easy"
                                : rowData.difficulty === "medium-module"
                                ? "Medium"
                                : rowData.difficulty === "difficult-module"
                                ? "Difficult"
                                : ""
                            }
                            color={
                              rowData.difficulty === "easy-module"
                                ? "green"
                                : rowData.difficulty === "medium-module"
                                ? "yellow"
                                : rowData.difficulty === "difficult-module"
                                ? "red"
                                : ""
                            }
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              rowData.moduleType === "module"
                                ? "Module"
                                : rowData.moduleType === "video"
                                ? "Video"
                                : ""
                            }
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Edit Module">
                          <IconButton
                            variant="text"
                            onClick={() => openDrawer(rowData)} // Pass the rowData to the openDrawer function
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete Module">
                          <IconButton
                            variant="text"
                            onClick={() => handleDeleteModule(rowData)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
          <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              Page 1 of 10
            </Typography>
            <div className="flex gap-2">
              <Button variant="outlined" size="sm">
                Previous
              </Button>
              <Button variant="outlined" size="sm">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Drawer
          placement="right"
          open={open}
          size={500}
          onClose={closeDrawer}
          className="p-4 overflow-y-auto"
        >
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            {data.map(({ label, value, body, icon }) => (
              <TabPanel
                key={value}
                header={label}
                onClick={() => {
                  setSelectedTableHeader(label);
                }}
                disabled={isEdit ? value !== activeTab : false}
              >
                {body()}
              </TabPanel>
            ))}
          </TabView>
        </Drawer>
      </div>
    </section>
  );
}
