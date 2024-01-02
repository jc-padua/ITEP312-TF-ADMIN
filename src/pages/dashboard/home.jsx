import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  SpeedDial,
  SpeedDialHandler,
  SpeedDialContent,
  SpeedDialAction,
  Progress,
  Dialog,
  Input,
  Checkbox,
  CardFooter,
  Button,
  Chip,
  Badge,
  Textarea,
} from "@material-tailwind/react";
import {
  ClockIcon,
  CheckIcon,
  PlusIcon,
  HomeIcon,
  CogIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import {
  UserPlusIcon,
  UserIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/solid";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { projectsTableData } from "@/data";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../firebase-config";
import { chartsConfig } from "@/configs";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import Pagination from "@/components/Pagination";
import { read, utils, writeFileXLSX } from "xlsx";
import ReportDocument from "@/components/ReportDocument";
import { BlobProvider } from "@react-pdf/renderer";
import { Margin, usePDF } from "react-to-pdf";
import { jsPDF } from "jspdf";
import "svg2pdf.js";
import html2canvas from "html2canvas";
import * as htmlToImage from "html-to-image";

export function Home() {
  const [dataCount, setDataCount] = useState({
    moduleCount: 0,
    gamesCount: 0,
    userToday: 0,
    userTotal: 0,
  });
  const [userGender, setUserGender] = useState({
    male: 0,
    female: 0,
  });
  const [userAge, setUserAge] = useState([]);
  const [userMonthTotal, setUserMonthTotal] = useState({
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  });
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [triviaData, setTriviaData] = useState([]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(userProgress.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleUsers = userProgress.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const eventItemsPerPage = 6;
  const eventTotalPages = Math.ceil(eventsData.length / eventItemsPerPage);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);

  const onPageEventChange = (page) => {
    setEventCurrentPage(page);
  };

  const eventStartIndex = (eventCurrentPage - 1) * eventItemsPerPage;
  const visibleEvents = eventsData.slice(
    eventStartIndex,
    eventStartIndex + eventItemsPerPage,
  );

  const triviaItemsPerPage = 5;
  const triviaTotalPages = Math.ceil(triviaData.length / triviaItemsPerPage);
  const [triviaCurrentPage, setTriviaCurrentPage] = useState(1);

  const onPageTriviaChange = (page) => {
    setTriviaCurrentPage(page);
  };

  const triviaStartIndex = (triviaCurrentPage - 1) * triviaItemsPerPage;
  const visibleTrivia = triviaData.slice(
    triviaStartIndex,
    triviaStartIndex + triviaItemsPerPage,
  );

  const fetchData = async () => {
    const currentTime = new Date();
    const today = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
    );
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    try {
      const userDocRef = await getDocs(collection(db, "user-datas"));
      const moduleDocRef = await getDocs(collection(db, "modules-datas"));
      const gamesDocRef = await getDocs(collection(db, "games-datas"));
      const surveyDocRef = await getDocs(collection(db, "survey-datas"));
      const eventDocRef = await getDocs(collection(db, "events-datas"));
      const feedbackDocRef = await getDocs(collection(db, "user-feedbacks"));
      const triviaDocRef = await getDocs(collection(db, "trivia-datas"));

      const triviaDocData = triviaDocRef.docs.map((doc) => {
        const data = doc.data();
        const triviaID = doc.id;
        return { triviaID, ...data };
      });

      setTriviaData(triviaDocData);

      const userFeedbackData = feedbackDocRef.docs.map((doc) => {
        const data = doc.data();
        const userID = doc.id;
        return { userID, ...data };
      });

      setFeedbackData(userFeedbackData);

      const userData = userDocRef.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          createdAt: data.createdAt.toDate(),
        };
      });
      const moduleData = moduleDocRef.docs;
      const gamesData = gamesDocRef.docs;
      const surveyData = surveyDocRef.docs;

      const eventsData = eventDocRef.docs.map((doc) => {
        const data = doc.data();
        const eventID = doc.id;
        return { ...data, eventID };
      });

      setEventsData(eventsData);

      const userProgressData = [];

      for (const userDoc of userDocRef.docs) {
        const userID = userDoc.id;
        const userName = userDoc.data().name;
        const userCreatedAt = userDoc.data().createdAt.toDate();

        if (userCreatedAt <= today && userCreatedAt > twoWeeksAgo) {
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
              return parseInt(progressData.progress);
            },
          );

          const totalCompletion =
            userModuleProgressDocs.reduce(
              (sum, progress) => sum + progress,
              0,
            ) / userModuleProgressDocs.length;

          userProgressData.push({
            name: userName,
            createdAt: userCreatedAt,
            moduleProgress: Math.floor(totalCompletion),
          });
        }
      }

      setUserProgress(userProgressData);

      const userToday = userData.filter(
        (user) => user.createdAt >= today,
      ).length;

      const userRecently = userData.filter(
        (user) => user.createdAt >= twoWeeksAgo && user.createdAt <= today,
      );

      const userGender = userDocRef.docs.map((doc) => {
        const data = doc.data();
        return {
          user: data.gender,
        };
      });

      const userAge = userDocRef.docs.map((doc) => {
        const data = doc.data();
        const birthDate = new Date(data.birthDate);
        if (isNaN(birthDate.getTime())) {
          return 0;
        }
        const ageInMilliseconds = Date.now() - birthDate;
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365);
        return Math.floor(ageInYears);
      });

      const userTotalPerMonth = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
      };

      userData.forEach((user) => {
        const month = user.createdAt.getMonth();
        const monthName = Object.keys(userTotalPerMonth)[month];
        userTotalPerMonth[monthName]++;
      });

      const userSurvey = surveyData
        .filter((doc) => doc.id !== "survey-questions")
        .map((doc) => {
          const data = doc.data();
          const userId = doc.id;
          return {
            name: userId,
            data: data.surveyAnswers,
          };
        });

      setRecentUsers(userRecently);

      setSurveyAnswers(userSurvey);

      setUserMonthTotal(userTotalPerMonth);

      setUserAge(userAge);

      setDataCount({
        userToday,
        userTotal: userData.length,
        moduleCount: moduleData.length,
        gamesCount: gamesData.length,
      });

      setUserGender({
        male: userGender.filter((user) => user.user === "Male").length,
        female: userGender.filter((user) => user.user === "Female").length,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statisticsCardsData = [
    {
      color: "pink",
      icon: UserPlusIcon,
      title: "Today's Users",
      value: dataCount.userToday,
    },
    {
      color: "green",
      icon: UserIcon,
      title: "Total Users",
      value: dataCount.userTotal,
    },
    {
      color: "blue",
      icon: BookOpenIcon,
      title: "No. of Modules",
      value: dataCount.moduleCount,
    },
    {
      color: "orange",
      icon: PuzzlePieceIcon,
      title: "Games Applied",
      value: dataCount.gamesCount,
    },
  ];

  const userTotalChart = {
    type: "line",
    height: 220,
    series: [
      {
        name: "Total",
        data: Object.values(userMonthTotal),
      },
    ],
    options: {
      chart: {
        ...chartsConfig.chart,
        id: "TotalData",
      },
      colors: ["#fff"],
      stroke: {
        lineCap: "round",
      },
      markers: {
        size: 5,
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: Object.keys(userMonthTotal),
      },
    },
  };

  const ageCounts = userAge.reduce((countMap, age) => {
    countMap[age] = (countMap[age] || 0) + 1;
    return countMap;
  }, {});

  const uniqueAges = [...new Set(userAge)];

  const ageViewChart = {
    type: "bar",
    height: 220,
    series: [
      {
        name: "Count",
        data: uniqueAges.sort((a, b) => a - b).map((age) => ageCounts[age]),
      },
    ],
    options: {
      chart: {
        ...chartsConfig.chart,
        id: "AgeData",
      },
      colors: "#fff",
      plotOptions: {
        bar: {
          columnWidth: "30%",
          borderRadius: 5,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: uniqueAges.map(String),
      },
    },
  };

  const genderChart = {
    type: "donut",
    height: 220,
    series: [userGender.male, userGender.female],
    options: {
      chart: {
        ...chartsConfig.chart,
        id: "AgeData",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "10%",
          },
        },
      },
      labels: ["Male", "Female"],
      legend: {
        show: true,
        position: "right",
        horizontalAlign: "center",
        verticalAlign: "middle",
        formatter: function (seriesName) {
          return (
            seriesName +
            ": " +
            genderChart.series[genderChart.options.labels.indexOf(seriesName)]
          );
        },
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              show: true,
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  const yesAnswers = surveyAnswers.map((item) => item.data);
  const yesCount = yesAnswers
    .flat()
    .filter(({ answer }) => answer === "Yes").length;
  const noCount = yesAnswers
    .flat()
    .filter(({ answer }) => answer === "No").length;

  const surveyChart = {
    type: "donut",
    height: 220,
    series: [yesCount, noCount],
    options: {
      chart: {
        ...chartsConfig.chart,
        id: "SurveyData",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "10%",
          },
        },
      },
      labels: ["Yes", "No"],
      legend: {
        show: true,
        position: "right",
        horizontalAlign: "center",
        verticalAlign: "middle",
        formatter: function (seriesName) {
          if (seriesName === "Yes") {
            return `Yes: ${yesCount}%`;
          } else if (seriesName === "No") {
            return `No: ${noCount}%`;
          }
          return "";
        },
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              show: true,
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  const statisticsChartsData = [
    {
      id: "lineGraph",
      color: "pink",
      title: "Users Total",
      description: "Total number of user per month",
      footer: "sample live update preview",
      chart: userTotalChart,
    },
    {
      id: "barGraph",
      color: "blue",
      title: "User Age Graph",
      description: "Users that uses the application by age",
      footer: "sample live update preview",
      chart: ageViewChart,
    },
    {
      id: "pieGraph",
      color: "green",
      title: "User Gender Graph",
      description: "Users gender count",
      footer: "sample live update preview",
      chart: genderChart,
    },
    {
      id: "pieGraph2",
      color: "orange",
      title: "Users Knowledge about Sex Education",
      description: "Users that uses the application by age",
      footer: "sample live update preview",
      chart: surveyChart,
    },
  ];

  const labelProps = {
    variant: "h6",
    color: "blue-gray",
    className:
      "absolute top-2/4 -left-16 -translate-y-2/4 -translate-x-3/4 w-[15rem] font-normal bg-black text-white p-1 rounded",
  };

  const [triviaForm, setTriviaForm] = useState({});
  const handleTriviaForm = (name, value) => {
    setTriviaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [openTrivia, setOpenTrivia] = useState(false);
  const [isEditTrivia, setIsEditTrivia] = useState(false);
  const [selectedTrivia, setSelectedTrivia] = useState(null);

  const handleOpenTrivia = (data) => {
    setOpenTrivia(!openTrivia);
    setSelectedTrivia((prev) => ({
      ...prev,
      ...data,
    }));
    setTriviaForm((prev) => ({
      ...prev,
      ...data,
    }));
    setOpenTrivia(data);

    if (openTrivia) {
      setOpenTrivia(false);
      setIsEditTrivia(false);
      setSelectedTrivia(null);
      setTriviaForm("");
    } else {
      setOpenTrivia(true);
    }
  };

  const submitHandlerTrivia = async (e) => {
    e.preventDefault();
    try {
      if (!triviaForm.trivia) {
        alert("Please fill the trivia field");
        return;
      }

      if (isEditTrivia && selectedTrivia) {
        await updateDoc(doc(db, "trivia-datas", selectedTrivia.triviaID), {
          trivia: triviaForm.trivia,
        });
      } else {
        await addDoc(collection(db, "trivia-datas"), {
          trivia: triviaForm.trivia,
        });
      }
      setOpenTrivia(false);
      fetchData();
      setTriviaForm("");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTrivia = async (triviaID) => {
    try {
      await deleteDoc(doc(db, "trivia-datas", triviaID));
      const updatedTriviaData = triviaData.filter(
        (trivia) => trivia.triviaID !== triviaID,
      );
      setTriviaData(updatedTriviaData);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const [open, setOpen] = React.useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleOpen = (data) => {
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp.seconds * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formattedEventDateStart = data.eventDateStart
      ? formatTimestamp(data.eventDateStart)
      : "";

    const formattedEventDateDue = data.eventDateDue
      ? formatTimestamp(data.eventDateDue)
      : "";

    setSelectedEvent({
      ...data,
      eventDateStart: formattedEventDateStart,
      eventDateDue: formattedEventDateDue,
    });

    setEventForm((prev) => ({
      ...prev,
      ...data,
      eventDateStart: formattedEventDateStart,
      eventDateDue: formattedEventDateDue,
      otherEvent: prev.otherEvent !== undefined ? prev.otherEvent : false,
    }));

    if (open) {
      setOpen(false);
      setIsEdit(false);
      setSelectedEvent(null);
      clearEventForm();
    } else {
      setOpen(true);
    }
  };

  const currentDate = new Date().toISOString().slice(0, 16);

  const [eventForm, setEventForm] = useState({
    eventName: "",
    eventLocation: "",
    eventDateStart: currentDate,
    eventDateDue: "",
    otherEvent: false,
  });

  const handleChange = (name, value) => {
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (
        !eventForm.eventName ||
        !eventForm.eventLocation ||
        !eventForm.eventDateStart ||
        !eventForm.eventDateDue
      ) {
        alert("Please fill up the fields");
        return;
      }

      if (isEdit && selectedEvent) {
        await updateDoc(doc(db, "events-datas", selectedEvent.eventID), {
          eventName: eventForm.eventName,
          eventLocation: eventForm.eventLocation,
          eventDateDue: new Date(eventForm.eventDateDue),
          eventDateStart: new Date(eventForm.eventDateStart),
          otherEvent: eventForm.otherEvent,
        });
      } else {
        await addDoc(collection(db, "events-datas"), {
          eventName: eventForm.eventName,
          eventLocation: eventForm.eventLocation,
          eventDateDue: new Date(eventForm.eventDateDue),
          eventDateStart: new Date(eventForm.eventDateStart),
          otherEvent: eventForm.otherEvent,
        });
      }
      setOpen(false);
      clearEventForm();
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events-datas", eventId));
      const updatedEventsData = eventsData.filter(
        (event) => event.eventID !== eventId,
      );
      setEventsData(updatedEventsData);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const clearEventForm = () => {
    setEventForm({
      eventName: "",
      eventLocation: "",
      eventDateStart: "",
      eventDateDue: "",
      otherEvent: false,
    });
  };

  const generateExcelReport = async () => {
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet([
      ["a", "b", "c"],
      [1, 2, 3],
    ]);
    utils.book_append_sheet(wb, ws, "Sheet1");
    writeFileXLSX(wb, "SheetJSDynamicWrapperTest.xlsx");
  };

  const { toPDF, targetRef } = usePDF({
    filename: "PDF-REPORT.pdf",
    page: { margin: Margin.MEDIUM },
    method: "open",
  });

  const pdfRef = useRef(null);

  const handleDownload = () => {
    let imageData;
    const docElement = document.getElementById("charts");
    html2canvas(docElement, { logging: false, useCORS: true }).then(
      (canvas) => {
        imageData = canvas.toDataURL("image/png");
        const doc = new jsPDF("p", "pt", "a4");
        const imgProps = doc.getImageProperties(imageData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const marginTop = 140;
        doc.addImage(imageData, "PNG", 0, marginTop, pdfWidth, pdfHeight);

        const headerTitle = "YDA Report";
        const fontSize = 16;
        const textWidth = doc.getStringUnitWidth(headerTitle) * fontSize;
        const textX = (pdfWidth - textWidth) / 2;
        doc.setFontSize(19);
        doc.text(headerTitle, textX, 70);

        doc.setLineWidth(1.5);
        doc.setDrawColor(200, 200, 200);
        const pageWidth = doc.internal.pageSize.width;
        const centerX = pageWidth / 2;
        const startX = centerX - 535 / 2;
        const endX = centerX + 535 / 2;

        doc.line(startX, 130, endX, 130);

        const headerLogo = "/img/ydao.png";
        const leftImageWidth = 70;
        const leftImageHeight = 70;
        doc.addImage(
          headerLogo,
          "PNG",
          40,
          40,
          leftImageWidth,
          leftImageHeight,
        );

        const currentDate = new Date().toLocaleDateString();
        const dateX = 500;
        const dateY = 70;
        doc.setFontSize(12);
        doc.text(currentDate, dateX, dateY);

        doc.setLineWidth(1.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(startX, 600, endX, 600);

        //TODO:
        //! INTERPRETATION
        doc.text("Interpretation", 40, 650);

        window.open(doc.output("bloburl"));
      },
    );
  };

  return (
    <div className="mt-12 relative">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
          />
        ))}
      </div>
      <div className="mb-4">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex items-end justify-between p-1"
          >
            <div>
              <Typography
                variant="h6"
                color="blue-gray"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <ChartBarIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-500"
                />
                Data Statistics
              </Typography>
            </div>

            <Button variant="gradient" color="green" onClick={handleDownload}>
              Generate Report
            </Button>
          </CardHeader>
          <CardBody
            ref={targetRef}
            className="overflow-x-scroll px-0 pt-0 pb-2"
          >
            <div
              ref={pdfRef}
              id="charts"
              className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-2"
            >
              {statisticsChartsData.map((props) => (
                <StatisticsChart id={props.id} key={props.title} {...props} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Recent Users
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <UserIcon strokeWidth={3} className="h-4 w-4 text-blue-500" />
                Users for the past 2 weeks
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-hidden px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["name", "created on", "completion"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map(
                  ({ name, createdAt, moduleProgress }, key) => {
                    const className = `py-3 px-5 ${
                      key === recentUsers.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={key}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {`${createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}`}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-10/12">
                            <Typography
                              variant="small"
                              className="mb-1 block text-xs font-medium text-blue-gray-600"
                            >
                              {moduleProgress}%
                            </Typography>
                            <Progress
                              value={moduleProgress}
                              variant="gradient"
                              color={moduleProgress === 100 ? "green" : "blue"}
                              className="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography
              variant="h6"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ChatBubbleBottomCenterIcon
                strokeWidth={3}
                className="h-4 w-4 text-blue-500"
              />
              Feedback Overview
            </Typography>
          </CardHeader>
          <CardBody className="pt-0 h-[25rem] overflow-auto">
            {feedbackData.map(({ userID, rating, feedback }, key) => (
              <div key={userID} className="flex items-center gap-4 py-3">
                <div
                  className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                    key === feedbackData.length - 1
                      ? "after:h-0"
                      : "after:h-4/6"
                  }`}
                >
                  <Badge
                    color={
                      rating >= 4
                        ? "green"
                        : rating >= 3
                        ? "yellow"
                        : rating == 2
                        ? "orange"
                        : "red"
                    }
                  >
                    <Chip value={rating} />
                  </Badge>
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-medium"
                  >
                    {feedback}
                  </Typography>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-full">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Events Listing
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CalendarDaysIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-500"
                />
                {`${eventsData.length} ${
                  eventsData.length === 1 ? "event" : "events"
                } listed`}
              </Typography>
            </div>
            <div>
              <Button onClick={handleOpen} variant="gradient" color="green">
                Post Event
              </Button>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["event", "location", "date", "time", ""].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleEvents.map((data, key) => {
                  const className = `py-3 px-5 ${
                    key === eventsData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={data.eventID}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {data.eventName}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {data.eventLocation}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {data.eventDateStart
                            .toDate()
                            .toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {`${data.eventDateStart
                            .toDate()
                            .toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} 
                            - 
                            ${data.eventDateDue
                              .toDate()
                              .toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          as="a"
                          className="cursor-pointer text-xs font-semibold text-blue-gray-600"
                          onClick={() => {
                            setIsEdit(true);
                            handleOpen(data);
                          }}
                        >
                          Edit
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          as="a"
                          className="cursor-pointer text-xs font-semibold text-blue-gray-600"
                          onClick={() => {
                            const userConfirmed = window.confirm(
                              "Are you sure you want to delete this Event?",
                            );

                            if (userConfirmed) {
                              deleteEvent(data.eventID);
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
            <Pagination
              totalPages={eventTotalPages}
              currentPage={eventCurrentPage}
              onPageChange={onPageEventChange}
            />
          </CardBody>
        </Card>

        <Card className="xl:col-span-full">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Trivia
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CalendarDaysIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-500"
                />
                {`${triviaData.length} ${
                  triviaData.length === 1 ? "trivia" : "trivias"
                } listed`}
              </Typography>
            </div>
            <div>
              <Button
                onClick={handleOpenTrivia}
                variant="gradient"
                color="green"
              >
                Add Trivia
              </Button>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Trivia", "Edit", "Delete"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleTrivia.map((data, key) => {
                  const className = `py-3 px-5 ${
                    key === triviaData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={data.triviaID}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {data.trivia}
                          </Typography>
                        </div>
                      </td>
                      <td className={"py-3 px-5 w-36"}>
                        <Typography
                          as="a"
                          className="cursor-pointer text-xs font-semibold text-blue-gray-600"
                          onClick={() => {
                            setIsEditTrivia(true);
                            handleOpenTrivia(data);
                          }}
                        >
                          Edit
                        </Typography>
                      </td>
                      <td className={"py-3 px-5 w-36"}>
                        <Typography
                          as="a"
                          className="cursor-pointer text-xs font-semibold text-blue-gray-600"
                          onClick={() => {
                            const userConfirmed = window.confirm(
                              "Are you sure you want to delete this trivia?",
                            );

                            if (userConfirmed) {
                              deleteTrivia(data.triviaID);
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
            <Pagination
              totalPages={triviaTotalPages}
              currentPage={triviaCurrentPage}
              onPageChange={onPageTriviaChange}
            />
          </CardBody>
        </Card>
      </div>

      <Dialog
        size="sm"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full">
          <form onSubmit={submitHandler}>
            <CardBody className="flex flex-col gap-4">
              <Typography variant="h4" color="blue-gray">
                {isEdit ? "Edit Event" : "Post new Event"}
              </Typography>
              <Input
                label="Event Name"
                size="lg"
                value={eventForm.eventName || ""}
                onChange={(e) => handleChange("eventName", e.target.value)}
              />
              <Input
                label="Location Name"
                size="lg"
                value={eventForm.eventLocation || ""}
                onChange={(e) => handleChange("eventLocation", e.target.value)}
              />
              <Input
                type="datetime-local"
                label="Date Start"
                size="lg"
                onChange={(e) => {
                  handleChange("eventDateStart", e.target.value);
                }}
                value={eventForm.eventDateStart || ""}
              />
              <Input
                type="datetime-local"
                label="Date Due"
                size="lg"
                onChange={(e) => {
                  handleChange("eventDateDue", e.target.value);
                }}
                value={eventForm.eventDateDue || ""}
              />

              <Checkbox
                label={"Other Event"}
                onChange={(e) => {
                  handleChange("otherEvent", e.target.checked);
                }}
                checked={eventForm.otherEvent || false}
              />
            </CardBody>
            <CardFooter className="pt-0">
              <Button variant="gradient" color="blue" fullWidth type="submit">
                {isEdit ? "Save Changes" : "Submit Event"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      <Dialog
        size="sm"
        open={openTrivia}
        handler={handleOpenTrivia}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full">
          <form onSubmit={submitHandlerTrivia}>
            <CardBody className="flex flex-col gap-4">
              <Typography variant="h4" color="blue-gray">
                {isEditTrivia ? "Edit Trivia" : "Post new Trivia"}
              </Typography>
              <Textarea
                label="Trivia"
                size="lg"
                value={triviaForm.trivia || ""}
                onChange={(e) => handleTriviaForm("trivia", e.target.value)}
              />
            </CardBody>
            <CardFooter className="pt-0">
              <Button variant="gradient" color="blue" fullWidth type="submit">
                {isEditTrivia ? "Save Changes" : "Submit Trivia"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>
    </div>
  );
}

export default Home;
