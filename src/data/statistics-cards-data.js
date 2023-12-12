import {
  UserPlusIcon,
  UserIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/solid";


// TODO: FETCH DATA FROM THE FIREBASE 
//* COUNT ALL THE DATA EACH TABLE




const fetchStatisticData = async () => {


  try {
    const userDocRef = await getDocs(collection(db, 'user-datas'));
    const userData = userDocRef.docs.map(doc => {
      const data = doc.data();
      return {

      }
    })
  } catch (error) {
    console.log(error);
  }
};


export const statisticsCardsData = [
  {
    color: "pink",
    icon: UserPlusIcon,
    title: "Today's Users",
    value: "223",
    footer: {
      color: "text-green-500",
      value: "+3%",
      label: "than last month",
    },
  },
  {
    color: "green",
    icon: UserIcon,
    title: "Total Users",
    value: "3,462",
    footer: {
      color: "text-red-500",
      value: "-2%",
      label: "than yesterday",
    },
  },
  {
    color: "blue",
    icon: BookOpenIcon,
    title: "No. of Modules",
    value: "6",
    footer: {
      color: "text-green-500",
      value: "+55%",
      label: "than last week",
    },
  },
  {
    color: "orange",
    icon: PuzzlePieceIcon,
    title: "Games Applied",
    value: "6",
    footer: {
      color: "text-green-500",
      value: "+5%",
      label: "than yesterday",
    },
  },
];

export default statisticsCardsData;
