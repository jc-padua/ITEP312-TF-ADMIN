import React, { useEffect, useState } from "react";
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Drawer,
  IconButton,
  Input,
  Option,
  Radio,
  Select,
  Tab,
  Tabs,
  TabsHeader,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import { auth, db, storage } from "../../../firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Easy",
    value: "easy",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "Difficult",
    value: "difficult",
  },
];

const TABLE_HEAD = [
  "Games",
  "Module",
  "Difficulty",
  "Game Type",
  "Edit",
  "Delete",
];

const initialQuizItem = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "",
};

const initialWordleItem = {
  question: "",
  hint: "",
  answer: "",
};

export function Games() {
  // TABLE HOOKS
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchedData, setSearchedData] = useState("");
  const [moduleData, setModuleData] = useState([]);

  // DRAWER HOOKS
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    difficulty: "",
    gameModule: "",
    gameType: "",
    quiz: [],
    wordle: [],
  });
  const [selectedData, setSelectedData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // GameTypeForm Hooks
  const [quizItems, setQuizItems] = useState([initialQuizItem]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [wordleItems, setWordleItems] = useState([initialWordleItem]);

  // TABLE FUNCTIONS & VARIABLES
  const fetchData = async () => {
    try {
      const moduleDocRef = await getDocs(collection(db, "games-datas"));
      const moduleData = moduleDocRef.docs.map((doc) => {
        const data = doc.data();
        const docID = doc.id;
        return {
          gameID: docID,
          gameType: data.gameType,
          gameModule: data.gameModule,
          difficulty: data.difficulty,
          quiz: data.quiz,
          wordle: data.wordle,
        };
      });
      setModuleData([...moduleData]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    const moduleRef = collection(db, "games-datas");
    const unsubscribeModule = onSnapshot(moduleRef, () => {
      fetchData();
    });

    return () => {
      unsubscribeModule();
    };
  }, []);

  const filteredRows =
    selectedTab === "all"
      ? moduleData
      : moduleData.filter((row) => row.difficulty === selectedTab);

  const filteredAndSearchedRows = filteredRows.filter((row) =>
    row.gameID.toLowerCase().includes(searchedData.toLowerCase()),
  );

  const handleInputChange = (
    fieldName,
    newValue,
    gameType = null,
    index = 0,
  ) => {
    if (fieldName === "search") {
      setSearchedData(newValue);
    } else if (gameType === "quiz") {
      setQuizItems((prevQuizItems) => {
        const updatedQuizItems = [...prevQuizItems];
        updatedQuizItems[index] = {
          ...updatedQuizItems[index],
          [fieldName]: newValue,
        };
        return updatedQuizItems;
      });
    } else if (gameType === "wordle") {
      setWordleItems((prevWordleItem) => {
        const updateWordleItem = [...prevWordleItem];
        updateWordleItem[index] = {
          ...updateWordleItem[index],
          [fieldName]: newValue,
        };
        return updateWordleItem;
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: newValue,
      }));
    }
  };

  // DRAWER FUNCTIONS & VARIABLES

  const openDrawer = (moduleData) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedData(moduleData);
    setFormData({
      difficulty: moduleData.difficulty,
      gameModule: moduleData.gameModule,
      gameType: moduleData.gameType,
      quiz: [...moduleData.quiz],
      wordle: [...moduleData.wordle],
    });
    setQuizItems([...moduleData.quiz]);
    setWordleItems([...moduleData.wordle]);
  };

  const closeDrawer = () => {
    setOpen(false);
    setIsEdit(false);
    setFormData({
      difficulty: "",
      gameModule: "",
      gameType: "",
      quiz: [],
      wordle: [],
    });
    setQuizItems([initialQuizItem]);
    setWordleItems([initialWordleItem]);
    setValidationErrors([]);
  };

  const gameTypeForm = (gameType) => {
    return gameType === "quiz" ? (
      <>
        {quizItems.map((quizItem, index) => (
          <div key={index}>
            <div className="flex items-center justify-between">
              <h1>Add Quiz Data {index + 1}</h1>
              {index === 0 ? (
                ""
              ) : (
                <IconButton
                  variant="text"
                  color="blue-gray"
                  onClick={() => handleRemoveQuiz(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="red"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </IconButton>
              )}
            </div>
            <div className="mt-4 mb-4">
              <Input
                required
                label="Question"
                value={quizItem.question}
                onChange={(e) =>
                  handleInputChange("question", e.target.value, "quiz", index)
                }
              />
              <p className="text-red-500 text-xs">
                {validationErrors.question}
              </p>
            </div>
            <div className="mb-4">
              <Input
                required
                label="Choice 1"
                value={quizItem.optionA}
                onChange={(e) =>
                  handleInputChange("optionA", e.target.value, "quiz", index)
                }
              />
              <p className="text-red-500 text-xs">{validationErrors.optionA}</p>
            </div>
            <div className="mb-4">
              <Input
                required
                label="Choice 2"
                value={quizItem.optionB}
                onChange={(e) =>
                  handleInputChange("optionB", e.target.value, "quiz", index)
                }
              />
              <p className="text-red-500 text-xs">{validationErrors.optionB}</p>
            </div>
            <div className="mb-4">
              <Input
                required
                label="Choice 3"
                value={quizItem.optionC}
                onChange={(e) =>
                  handleInputChange("optionC", e.target.value, "quiz", index)
                }
              />
              <p className="text-red-500 text-xs">{validationErrors.optionC}</p>
            </div>
            <div className="mb-4">
              <Input
                required
                label="Choice 4"
                value={quizItem.optionD}
                onChange={(e) =>
                  handleInputChange("optionD", e.target.value, "quiz", index)
                }
              />
              <p className="text-red-500 text-xs">{validationErrors.optionD}</p>
            </div>
            <div className="mb-4">
              {/* <Select
                label="Answer"
                value={quizItem?.answer}
                onChange={(newValue) =>
                  handleInputChange("answer", newValue, "quiz", index)
                }
              >
                <Option value={quizItem.optionA}>Choice 1</Option>
                <Option value={quizItem.optionB}>Choice 2</Option>
                <Option value={quizItem.optionC}>Choice 3</Option>
                <Option value={quizItem.optionD}>Choice 4</Option>
              </Select> */}
              <Typography variant="paragraph">Answer</Typography>
              <Radio
                label="Choice 1"
                checked={quizItem.answer === quizItem.optionA}
                value={quizItem.optionA}
                onChange={() =>
                  handleInputChange("answer", quizItem.optionA, "quiz", index)
                }
              />
              <Radio
                label="Choice 2"
                checked={quizItem.answer === quizItem.optionB}
                value={quizItem.optionB}
                onChange={() =>
                  handleInputChange("answer", quizItem.optionB, "quiz", index)
                }
              />
              <Radio
                label="Choice 3"
                checked={quizItem.answer === quizItem.optionC}
                value={quizItem.optionC}
                onChange={() =>
                  handleInputChange("answer", quizItem.optionC, "quiz", index)
                }
              />
              <Radio
                label="Choice 4"
                value={quizItem.optionD}
                checked={quizItem.answer === quizItem.optionD}
                onChange={() =>
                  handleInputChange("answer", quizItem.optionD, "quiz", index)
                }
              />
              <p className="text-red-500 text-xs">{validationErrors.answer}</p>
            </div>
          </div>
        ))}
        <Button
          className="mb-3 w-full bg-green-400"
          type="button"
          onClick={handleAddQuiz}
        >
          Add New Quiz
        </Button>
      </>
    ) : gameType === "wordle" ? (
      <>
        {wordleItems.map((wordleItem, index) => (
          <div key={index}>
            <div className="flex items-center justify-between">
              <h1>Add Wordle Data {index + 1}</h1>
              {index === 0 ? (
                ""
              ) : (
                <IconButton
                  variant="text"
                  color="blue-gray"
                  onClick={() => handleRemoveWordle(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="red"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </IconButton>
              )}
            </div>
            <div className="mt-4 mb-4">
              <Input
                label="Question"
                value={wordleItem.question}
                onChange={(e) =>
                  handleInputChange("question", e.target.value, "wordle", index)
                }
                required
              />
              <p className="text-red-500 text-xs">
                {validationErrors.question}
              </p>
            </div>
            <div className="mb-4">
              <Input
                label="Hint"
                value={wordleItem.hint}
                onChange={(e) =>
                  handleInputChange("hint", e.target.value, "wordle", index)
                }
                required
              />
              <p className="text-red-500 text-xs">{validationErrors.hint}</p>
            </div>
            <div className="mb-4">
              <Input
                label="Answer"
                value={wordleItem.answer.toUpperCase()}
                onChange={(e) =>
                  handleInputChange("answer", e.target.value, "wordle", index)
                }
                maxLength={10}
                required
              />
              <p className="text-red-500 text-xs">{validationErrors.answer}</p>
            </div>
          </div>
        ))}
        <Button
          className="mb-3 w-full bg-green-400"
          type="button"
          onClick={handleAddWordle}
        >
          Add New Wordle
        </Button>
      </>
    ) : (
      ""
    );
  };

  const handleAddQuiz = () => {
    const currentQuizItem = quizItems[quizItems.length - 1];
    const errors = {};

    for (const key in currentQuizItem) {
      if (currentQuizItem[key].trim() === "") {
        errors[key] = "This field is required.";
      }
    }

    if (Object.keys(errors).length === 0) {
      setQuizItems((prevQuizItems) => [...prevQuizItems, initialQuizItem]);
      setValidationErrors([]);
    } else {
      setValidationErrors(errors);
    }
  };

  const handleAddWordle = () => {
    const currentWordleItem = wordleItems[wordleItems.length - 1];
    const errors = {};

    for (const key in currentWordleItem) {
      if (currentWordleItem[key].trim() === "") {
        errors[key] = "This field is required.";
      }
    }

    if (Object.keys(errors).length === 0) {
      setWordleItems((prevWordleItems) => [
        ...prevWordleItems,
        initialWordleItem,
      ]);
      setValidationErrors([]);
    } else {
      setValidationErrors(errors);
    }
  };

  const handleRemoveQuiz = (indexToRemove) => {
    setQuizItems((prevQuizItems) =>
      prevQuizItems.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleRemoveWordle = (indexToRemove) => {
    setWordleItems((prevWordleItems) =>
      prevWordleItems.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.difficulty || !formData.gameModule || !formData.gameType) {
      alert("Please fill in all required fields.");
      return;
    }

    // Create a new object for formData with the updated quiz field
    const updatedFormData = {
      ...formData,
      quiz: [...quizItems],
      wordle: [...wordleItems],
    };

    // Add to Firebase
    const collectionRef = collection(db, "games-datas"); // Database to Store

    // FIXME: IF YOU WANT TO APPLY THE RANDOM GAME FUNCTIONALITY ON DEVICE THEN USE GAMETYPE AS YOUR DOCID
    // const gameType = updatedFormData.gameType;
    const module = updatedFormData.gameModule;
    const difficulty = updatedFormData.difficulty;
    const docID = `game${module}-${difficulty}`;

    try {
      if (isEdit) {
        const gameDocRef = doc(collectionRef, docID);
        const gameDocSnapshot = await getDoc(gameDocRef);
        if (gameDocSnapshot.exists() && gameDocSnapshot.id !== docID) {
          alert(`Game ${docID} already exist.`);
          return;
        }

        const gameID = selectedData.gameModule;
        const difficulty = selectedData.difficulty;
        const gameDocID = `game${gameID}-${difficulty}`;

        // DELETE OG
        const ogDocRef = doc(db, "games-datas", gameDocID);
        await deleteDoc(ogDocRef);

        await setDoc(gameDocRef, updatedFormData);

        closeDrawer();
      } else {
        const docRef = doc(collectionRef, docID); // Document to Store
        const docSnapshot = await getDoc(docRef); // Use getDoc to check if the document exists
        if (docSnapshot.exists()) {
          alert(`Game ${docID} data already exists`);
        } else {
          await setDoc(docRef, updatedFormData);
          closeDrawer();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModule = async (moduleData) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this module?",
    );

    if (confirmDelete) {
      try {
        const customDocId = moduleData.gameModule;
        const difficultyID = moduleData.difficulty;

        const gameDocRef = doc(
          db,
          "games-datas",
          `game${customDocId}-${difficultyID}`,
        );

        await deleteDoc(gameDocRef);
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  return (
    <section className=" p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl">Manage Games</h1>
      </div>
      <div className="flex">
        <Card className="h-full w-full">
          <CardHeader floated={false} shadow={false} className="rounded-none">
            <div className="mb-8 flex items-center justify-between gap-8">
              <div>
                <Typography variant="h5" color="blue-gray">
                  Games list
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                  Click the edit button to see games information on the right
                  side
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
                  games data
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
                              {rowData.gameID}
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
                            Module {rowData.gameModule}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              rowData.difficulty === "easy"
                                ? "Easy"
                                : rowData.difficulty === "medium"
                                ? "Medium"
                                : rowData.difficulty === "difficult"
                                ? "Difficult"
                                : ""
                            }
                            color={
                              rowData.difficulty === "easy"
                                ? "green"
                                : rowData.difficulty === "medium"
                                ? "yellow"
                                : rowData.difficulty === "difficult"
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
                              rowData.gameType === "quiz"
                                ? "Quiz"
                                : rowData.gameType === "wordle"
                                ? "Wordle"
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
          <div className="flex ">
            <IconButton variant="text" color="blue-gray" onClick={closeDrawer}>
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
          <Typography variant="h5" color="blue-gray" className="mb-2 p-4">
            Add Game Data
          </Typography>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-4 flex gap-5">
              <Select
                label="Select Game Type"
                value={formData?.gameType || ""}
                onChange={(newValue) => handleInputChange("gameType", newValue)}
              >
                <Option value="quiz">Quiz</Option>
                <Option value="wordle">Wordle</Option>
              </Select>
              <Select
                label="Select Difficulty"
                value={formData?.difficulty || ""}
                onChange={(newValue) =>
                  handleInputChange("difficulty", newValue)
                }
              >
                <Option value="easy">Easy</Option>
                <Option value="medium">Medium</Option>
                <Option value="difficult">Difficult</Option>
              </Select>
            </div>
            <div className="mb-4 flex gap-5">
              <Input
                label="Game Module"
                type="number"
                min={1}
                value={formData?.gameModule || ""}
                onChange={(e) =>
                  handleInputChange("gameModule", e.target.value)
                }
              />
            </div>
            {gameTypeForm(formData.gameType)}
            <Button type="submit" ripple={true}>
              Submit
            </Button>
          </form>
        </Drawer>
      </div>
    </section>
  );
}
