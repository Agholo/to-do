const express = require("express");
const bcrypt = require("bcrypt");
const collection = require("./mongodb.js");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
require("dotenv").config();

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authenticateUserSession = async (req, res, next) => {
  const userId = req.cookies["userSession"];

  const user = await collection.findById(userId);
  req.user = user;
  next();
};

app.get("/login", authenticateUserSession, async (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

app.get("/userData", authenticateUserSession, (req, res) => {
  res.json({ name: req.user.name, surname: req.user.surname });
});

app.get("/signup", authenticateUserSession, async (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
  }
});

app.get("/", authenticateUserSession, async (req, res) => {
  if (req.user) {
    res.sendFile(path.join(__dirname, "public", "main.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/tasks", authenticateUserSession, (req, res) => {
  if (req.user) {
    res.json(req.user.tasks);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/motivation", async (req, res) => {
  try {
    const data = fs.readFileSync("./motivation.json", "utf8");
    res.json(data);
  } catch (err) {
    console.error("Error reading the file:", err);
  }
});

app.post("/signup", async (req, res) => {
  try {
    let data = {
      name: req.body.name.trim(),
      surname: req.body.surname.trim(),
      rp: req.body.rp,
      password: req.body.password,
      email: req.body.email,
    };
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let existEmail = await collection.findOne({ email: data.email });

    if (
      existEmail &&
      data.rp !== data.password &&
      !passwordRegex.test(data.password) &&
      !emailRegex.test(data.email)
    ) {
      res.redirect("/signup");
    } else {
      let salt = 6;
      let hashedPass = await bcrypt.hash(data.password, salt);
      data.password = hashedPass;
      data.name = data.name[0].toUpperCase() + data.name.slice(1);
      data.surname = data.surname[0].toUpperCase() + data.surname.slice(1);
      collection.create({
        name: data.name,
        surname: data.surname,
        password: data.password,
        email: req.body.email,
      });
      res.redirect("/login");
    }
  } catch (e) {}
});

app.post("/login", async (req, res) => {
  try {
    let user = await collection.findOne({ email: req.body.email });
    let isCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isCorrectPassword && user) {
      res.cookie("userSession", user._id, { httpOnly: true });
      return res.redirect("/");
    } else {
      res.redirect("/login");
    }
  } catch (e) {}
});

app.post("/addTask", authenticateUserSession, async (req, res) => {
  try {
    const currentUser = req.user;
    const newTask = {
      title: req.body.title,
      description: req.body.description,
    };
    await collection.updateOne(
      { _id: currentUser._id },
      {
        $push: {
          tasks: newTask,
        },
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

app.post("/delete", authenticateUserSession, async (req, res) => {
  try {
    let currentUser = req.user;
    let title = req.body.title;
    let description = req.body.description;
    await collection.updateOne(
      { _id: currentUser._id },
      { $pull: { tasks: { title, description } } }
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running`);
});
