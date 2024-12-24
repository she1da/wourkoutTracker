function ElementBuilder(name) {
  this.element = document.createElement(name);

  this.text = function (text) {
    this.element.textContent = text;
    return this;
  };
  this.labelFor = function (elementName) {
    this.element.setAttribute("for", elementName);
    return this;
  };
  this.ariaLabel = function (elementName) {
    this.element.setAttribute("aria-label", elementName);
    return this;
  };
  this.visible = function (visibility) {
    this.element.style.visibility = visibility;
    return this;
  };

  this.name = function (name) {
    this.element.name = name;
    return this;
  };

  this.getValue = function () {
    return this.element.value;
  };

  this.setValue = function (value) {
    this.element.value = value;
    return this;
  };

  this.appendTo = function (parent) {
    parent.append(this.element);
    return this;
  };

  this.placeholder = function (placeholder) {
    this.element.placeholder = placeholder;
    return this;
  };

  this.type = function (type) {
    this.element.type = type;
    return this;
  };

  this.styles = function (...styles) {
    const validStyles = styles
      .flatMap((style) =>
        typeof style === "string" ? style.split(" ") : style
      )
      .filter((style) => style.trim() !== "");
    this.element.classList.add(...validStyles);
    return this;
  };

  this.id = function (id) {
    this.element.id = id;
    return this;
  };

  this.onclick = function (func) {
    this.element.onclick = func;
    return this;
  };

  this.build = function () {
    return this.element;
  };
}

const builder = {
  create: function (name) {
    return new ElementBuilder(name);
  },
};

function CalorieTracker() {
  this.gainedRecords = JSON.parse(
    localStorage.getItem("gainedRecords") || "[]"
  );
  this.burnedRecords = JSON.parse(
    localStorage.getItem("burnedRecords") || "[]"
  );

  this.add = function (type, amount) {
    const parsedAmount = parseFloat(amount);
    if (type === "gained") {
      this.gainedRecords.unshift(parsedAmount);
    } else if (type === "burned") {
      this.burnedRecords.unshift(parsedAmount);
    }
    this.updateLocalStorage();
  };

  this.remove = function (type, index) {
    if (type === "gained" && index >= 0 && index < this.gainedRecords.length) {
      this.gainedRecords.splice(index, 1);
    } else if (
      type === "burned" &&
      index >= 0 &&
      index < this.burnedRecords.length
    ) {
      this.burnedRecords.splice(index, 1);
    }
    this.updateLocalStorage();
  };

  this.edit = function (type, index, newAmount) {
    const parsedAmount = parseFloat(newAmount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      if (
        type === "gained" &&
        index >= 0 &&
        index < this.gainedRecords.length
      ) {
        this.gainedRecords[index] = parsedAmount;
      } else if (
        type === "burned" &&
        index >= 0 &&
        index < this.burnedRecords.length
      ) {
        this.burnedRecords[index] = parsedAmount;
      }
      this.updateLocalStorage();
    }
  };

  this.updateLocalStorage = function () {
    localStorage.setItem("gainedRecords", JSON.stringify(this.gainedRecords));
    localStorage.setItem("burnedRecords", JSON.stringify(this.burnedRecords));
  };

  this.getTotalCalories = function () {
    const gained = this.gainedRecords.reduce((sum, value) => sum + value, 0);
    const burned = this.burnedRecords.reduce((sum, value) => sum + value, 0);
    return { gained, burned };
  };
}

function Render(container) {
  this.container = container;
  let divDetails, errMessage;
  const calorieTracker = new CalorieTracker();
  let inputAmount;

  this.init = function () {
    const divContent = builder
      .create("div")
      .styles("max-w-sm mx-auto")
      .appendTo(this.container)
      .build();

    builder
      .create("h1")
      .text("Calorie Tracker")
      .styles("title-custom")
      .appendTo(divContent)
      .build();

    const fieldsetTracker = builder
      .create("fieldset")
      .appendTo(divContent)
      .build();

    inputAmount = builder
      .create("input")
      .id("amount")
      .styles(
        "w-full bg-gray-900 text-sm text-gray-400 transition border border-gray-800 focus:outline-none focus:border-gray-600 rounded py-1 px-2 pl-10 appearance-none leading-normal"
      )
      .type("text")
      .name("amount")
      .ariaLabel("amount")
      .placeholder("Enter calories")
      .appendTo(fieldsetTracker);

    errMessage = builder
      .create("p")
      .visible("hidden")
      .styles(
        "flex items-center w-full max-w-xs p-4 text-gray-500  rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
      )
      .appendTo(divContent)
      .build();

    builder
      .create("button")
      .text("Add Gained Calories")
      .onclick(() => {
        const amount = inputAmount.getValue();
        if (checkValue(amount)) {
          calorieTracker.add("gained", amount);
          inputAmount.setValue(null);
          updateCalorieList();
          updateDonutChart();
        }
      })
      .styles(
        "focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 p-2"
      )
      .appendTo(divContent);

    builder
      .create("button")
      .text("Add Burned Calories")
      .onclick(() => {
        const amount = inputAmount.getValue();
        if (checkValue(amount)) {
          calorieTracker.add("burned", amount);
          inputAmount.setValue(null);
          updateCalorieList();
          updateDonutChart();
        }
      })
      .styles(
        "focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 p-2"
      )
      .appendTo(divContent);

    divDetails = builder
      .create("div")
      .id("divDetails")
      .styles("tracker-table")
      .appendTo(divContent)
      .build();

    updateCalorieList();
    updateDonutChart();
  };

  function checkValue(amount) {
    errMessage.textContent = "";
    if (amount === null || amount === "" || isNaN(amount) || amount <= 0) {
      errMessage.textContent = "Please enter a valid calorie amount!";
      errMessage.style.visibility = "visible";
      return false;
    }
    return true;
  }

  function updateCalorieList() {
    divDetails.innerHTML = "";

    const calTable = builder
      .create("table")
      .styles("min-w-full divide-y divide-gray-200")
      .appendTo(divDetails)
      .build();
    const caltHead = builder.create("thead").appendTo(calTable).build();
    const calTr = builder.create("table").appendTo(caltHead).build();
    const calTh = builder
      .create("th")
      .styles(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      )
      .appendTo(calTr)
      .build();
    const calTBody = builder
      .create("tbody")
      .styles(" divide-y divide-gray-200")
      .appendTo(calTable)
      .build();
    calorieTracker.gainedRecords.forEach((amount, index) => {
      const calBodyTr = builder
        .create("tr")
        .id(index + "gained")
        .appendTo(calTBody)
        .build();

      const listItem = builder
        .create("td")
        .styles("px-6 py-4 whitespace-nowrap")
        .appendTo(calBodyTr)
        .build();
      builder
        .create("i")
        .styles("fas fa-caret-up font-bold text-3xl p-2 text-red-600 ")
        .appendTo(listItem);

      builder
        .create("span")
        .text(`gained ${amount} calories`)
        .styles(" font-bold text-gray-600")
        .appendTo(listItem);
      const listItemEdit = builder
        .create("td")
        .id(index)
        .styles("px-6 py-4 whitespace-nowrap")
        .appendTo(calBodyTr)
        .build();

      builder
        .create("button")
        .text("Edit")
        .onclick(() => {
          inputAmount.setValue(amount);
          const newAmount = inputAmount.getValue();
          if (newAmount !== null) {
            calorieTracker.edit("gained", index, newAmount);
            updateCalorieList();
            updateDonutChart();
          }
        })
        .styles(
          "px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue active:bg-blue-600 transition duration-150 ease-in-out"
        )
        .appendTo(listItemEdit);

      builder
        .create("button")
        .text("Delete")
        .onclick(() => {
          calorieTracker.remove("gained", index);
          updateCalorieList();
          updateDonutChart();
        })
        .styles(
          "ml-2 px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-600 transition duration-150 ease-in-out"
        )
        .appendTo(listItemEdit);
    });

    calorieTracker.burnedRecords.forEach((amount, index) => {
      const calBodyTr = builder
        .create("tr")
        .id(index + "burned")
        .appendTo(calTBody)
        .build();

      const listItem = builder
        .create("td")
        .styles("px-6 py-4 whitespace-nowrap")
        .appendTo(calBodyTr)
        .build();
      builder
        .create("i")
        .styles("fas fa-caret-down font-bold text-3xl p-2 text-green-600 ")
        .appendTo(listItem);

      builder
        .create("span")
        .text(`burned ${amount} calories`)
        .styles("font-bold  text-gray-600")
        .appendTo(listItem);
      const burnedIcon = builder
        .create("span")
        .styles("text-yellow-600")
        .appendTo(listItem);

      const listItemEdit = builder
        .create("td")
        .id(index)
        .styles("px-6 py-4 whitespace-nowrap")
        .appendTo(calBodyTr)
        .build();
      builder
        .create("button")
        .text("Edit")
        .onclick(() => {
          inputAmount.setValue(amount);
          const newAmount = inputAmount.getValue();
          if (newAmount !== null) {
            calorieTracker.edit("burned", index, newAmount);
            updateCalorieList();
            updateDonutChart();
          }
        })
        .styles(
          "px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue active:bg-blue-600 transition duration-150 ease-in-out"
        )
        .appendTo(listItemEdit);

      builder
        .create("button")
        .text("Delete")
        .onclick(() => {
          calorieTracker.remove("burned", index);
          updateCalorieList();
          updateDonutChart();
        })
        .styles(
          "ml-2 px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-600 transition duration-150 ease-in-out"
        )
        .appendTo(listItemEdit);
    });
  }
  function updateDonutChart() {
    const totals = calorieTracker.getTotalCalories();
    const data = {
      labels: ["Gained", "Burned"],
      datasets: [
        {
          data: [totals.gained, totals.burned],
          backgroundColor: ["#10B981", "#EF4444"],
        },
      ],
    };
    const options = { cutout: "50%" };
    new Chart(document.getElementById("chartjs-4"), {
      type: "doughnut",
      data,
      options,
    });
  }
  // function updateDonutChart() {
  //   const totals = calorieTracker.getTotalCalories();

  // const chart = echarts.init(document.getElementById("donut-chart"));

  // const options = {
  //   title: {
  //     text: "Calories",
  //     left: "center",
  //     textStyle: {
  //       fontSize: 16,
  //       fontWeight: "bold",
  //     },
  //   },
  //   tooltip: {
  //     trigger: "item",
  //     formatter: "{a} <br/>{b}: {c} ({d}%)",
  //   },
  //   legend: {
  //     orient: "horizontal",
  //     bottom: "10%",
  //     data: ["Gained", "Burned"],
  //   },
  //   series: [
  //     {
  //       name: "Calories",
  //       type: "pie",
  //       radius: ["50%", "70%"],
  //       avoidLabelOverlap: false,
  //       label: {
  //         show: false,
  //         position: "center",
  //       },
  //       emphasis: {
  //         label: {
  //           show: true,
  //           fontSize: "18",
  //           fontWeight: "bold",
  //         },
  //       },
  //       labelLine: {
  //         show: false,
  //       },
  //       data: [
  //         {
  //           value: totals.gained,
  //           name: "Gained",
  //           itemStyle: { color: "#10B981" },
  //         },
  //         {
  //           value: totals.burned,
  //           name: "Burned",
  //           itemStyle: { color: "#EF4444" },
  //         },
  //       ],
  //     },
  //   ],
  // };

  // chart.setOption(options);
  // }
}

const calorieTrackerContainer = document.getElementById(
  "calorie-tracker-container"
);
const app = new Render(calorieTrackerContainer);
app.init();
