import { chartsConfig } from "@/configs";

const websiteViewsChart = {
  type: "bar",
  height: 220,
  series: [
    {
      name: "Views",
      data: [50, 20, 10, 22, 50, 10, 40],
    },
  ],
  options: {
    ...chartsConfig,
    colors: "#fff",
    plotOptions: {
      bar: {
        columnWidth: "16%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["M", "T", "W", "T", "F", "S", "S"],
    },
  },
};

const dailySalesChart = {
  type: "line",
  height: 220,
  series: [
    {
      name: "Total",
      data: [50, 40, 300, 320, 500, 350, 200, 230, 500],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#fff"],
    stroke: {
      lineCap: "round",
    },
    markers: {
      size: 5,
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  },
};

// TODO: RESIZE THE CARD

const completedTasksChart = {
  type: "donut",
  height: 220,
  series: [44, 55, 41, 17, 15],
  options: {
    plotOptions: {
      pie: {
        donut: {
          size: '50%'
        }
      }
    },
    labels: ['Apple', 'Mango', 'Orange', 'Watermelon'],
    legend: {
      show: true,
      position: 'right', // Display legend on the right side
      horizontalAlign: 'center',
      verticalAlign: 'middle',
      formatter: function (seriesName) {
        return seriesName + ': ' + completedTasksChart.series[completedTasksChart.options.labels.indexOf(seriesName)];
      },
    },
    dataLabels: {
      enabled: true, // Disable data labels
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
            position: 'bottom', // Display legend at the bottom on small screens
          },
        },
      },
    ],
  },
};

export const statisticsChartsData = [
  {
    color: "blue",
    title: "User Age Graph",
    // description: "Last Campaign Performance",
    description: "Users that uses the application by age",
    // footer: "campaign sent 2 days ago",
    footer: "sample live update preview",
    chart: websiteViewsChart,
  },
  {
    color: "pink",
    title: "User Knowledge about Sex Education",
    // description: "15% increase in today sales",
    description: "sample description",
    // footer: "updated 4 min ago",
    footer: "sample live update preview",
    chart: dailySalesChart,
  },
  {
    color: "green",
    title: "User Gender Graph",
    // description: "Last Campaign Performance",
    description: "sample description",
    // footer: "just updated",
    footer: "sample live update preview",
    chart: completedTasksChart,
  },
];

export default statisticsChartsData;
