document.addEventListener("DOMContentLoaded", () => {
  const hello = document.getElementById("hello");
  const addOpen = document.getElementById("add_show_list");
  const addList = document.getElementById("add_list");
  const extend = document.getElementById("extend");
  const openClose = document.getElementById("open_close");
  const menu = document.querySelector(".menu");
  const content = document.querySelector(".content");
  const names = document.querySelectorAll(".text");
  const linkButton = document.querySelectorAll(".link_button");
  const list = document.querySelector(".list");
  const icons = document.querySelectorAll(".uc");
  const listDiv = document.getElementById("lists");
  const date = document.getElementById("date");
  const addTask = document.getElementById("add-task");
  const taskSide = document.getElementById("task_side");
  const taskSubmit = document.getElementById("task_submit");
  const nameSurname = document.getElementById("nameSurname");
  const helloByName = document.getElementById("helloByName");
  const motivation = document.getElementById("motivation_message");

  // to add a list
  addOpen.addEventListener("click", () => {});

  async function put() {
    const response = await fetch("/motivation");
    const json = await response.json();
    const messages = JSON.parse(json).messages;
    motivation.innerText =
      messages[Math.floor(Math.random() * messages.length)];
  }

  put();

  async function fetchData() {
    try {
      const response = await fetch("/tasks");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  async function personal() {
    try {
      const response = await fetch("/userData");
      const { name, surname } = await response.json().then();
      // make first letter upercase
      nameSurname.innerText = `for ${name} ${surname}`;
      helloByName.innerText = `Hi, ${name}`;
    } catch (e) {
      console.log(e);
    }
  }

  personal();

  fetchData().then((tasks) => {
    tasks.forEach((task) => {
      divCreator(task);
    });
  });

  // continue here

  openClose.addEventListener("click", () => {
    const iconFileName = extend.src.split("/").pop();
    if (iconFileName === "chevron_right_FILL0_wght400_GRAD0_opsz24.png") {
      extend.src = "icons/chevron_left_FILL0_wght400_GRAD0_opsz24.png";
      openClose.style.left = "100%";
      openClose.style.transform = "translateX(-125%)";
      menu.style.width = "22%";
      content.style.width = "78%";
      linkButton.forEach((elem) => {
        elem.style.height = "35px";
        elem.style.width = "85%";
        elem.style.borderRadius = "17.5px";
        elem.style.paddingLeft = "12px";
      });
      icons.forEach((icon) => {
        icon.style.height = "24px";
        icon.style.width = "24px";
        icon.parentNode.style.justifyContent = "";
        icon.style.marginRight = "20px";
      });
      setTimeout(() => {
        list.style.display = "block";
        names.forEach((elem) => {
          elem.style.display = "block";
        });
      }, 125);
      setTimeout(() => {
        hello.style.display = "block";
      }, 200);
    } else {
      extend.src = "icons/chevron_right_FILL0_wght400_GRAD0_opsz24.png";
      openClose.style.left = "50%";
      openClose.style.transform = "translateX(-50%)";
      menu.style.width = "7%";
      content.style.width = "93%";
      list.style.display = "none";
      hello.style.display = "none";
      linkButton.forEach((elem) => {
        elem.style.height = "75px";
        elem.style.width = "75px";
        elem.style.padding = "0";
        elem.style.borderRadius = "50%";
      });
      icons.forEach((icon) => {
        icon.style.height = "40px";
        icon.style.width = "40px";
        icon.parentNode.style.justifyContent = "center";
        icon.style.margin = "0";
      });
      names.forEach((elem) => {
        elem.style.display = "none";
      });
    }
  });
  addList.addEventListener("click", () => {
    listDiv.style.display =
      listDiv.style.display === "block" ? "none" : "block";
  });

  (function () {
    let currentDate = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let month = monthNames[currentDate.getMonth()];
    let day = currentDate.getDate();
    let week = null;
    switch (currentDate.getDay()) {
      case 0:
        week = "Sunday";
        break;
      case 1:
        week = "Monday";
        break;
      case 2:
        week = "Tuesday";
        break;
      case 3:
        week = "Wednesday";
        break;
      case 4:
        week = "Thursday";
        break;
      case 5:
        week = "Friday";
        break;
      case 6:
        week = "Saturday";
        break;
    }
    date.innerText = `${week}, ${month} ${day}`;
  })();
  async function divCreator({ title, description }) {
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task");
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("title_cont");
    const titleParagraph = document.createElement("p");
    titleParagraph.id = "title";
    titleParagraph.textContent = title;
    titleContainer.appendChild(titleParagraph);
    const descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("description_cont");
    const descriptionParagraph = document.createElement("p");
    descriptionParagraph.id = "description";
    descriptionParagraph.textContent = description;
    descriptionContainer.appendChild(descriptionParagraph);
    const doneButton = document.createElement("button");
    doneButton.classList.add("done");
    doneButton.textContent = "DONE";
    doneButton.addEventListener("click", () => {
      doneButton.parentElement.remove();
      fetch("/delete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });
    });
    taskContainer.appendChild(titleContainer);
    taskContainer.appendChild(descriptionContainer);
    taskContainer.appendChild(doneButton);
    taskSide.appendChild(taskContainer);
    closePopup();
  }
  taskSubmit.addEventListener("click", () => {
    const title = document.getElementById("title").value
      ? document.getElementById("title").value
      : "task";
    const description = document.getElementById("descriptionX").value;
    divCreator({ title, description });
    fetch("/addTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Task saved successfully!");
        } else {
          console.error("Failed to save task");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  const closeButton = document.getElementById("closePopupButton");
  const popup = document.getElementById("popup");
  const overlay = document.createElement("div");
  overlay.className = "overlay";

  function openPopup() {
    overlay.style.display = "block";
    popup.style.display = "block";
  }

  function closePopup() {
    overlay.style.display = "none";
    popup.style.display = "none";
  }

  addTask.addEventListener("click", openPopup);
  closeButton.addEventListener("click", closePopup);

  document.body.appendChild(overlay);
});
