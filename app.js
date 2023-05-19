require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const User = require("./model/user");
const Event = require("./model/event");
const auth = require("./middleware/auth");
const Patent = require("./model/patent");
const Notice = require("./model/notice");
const Query = require("./model/query");

const app = express();
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(cors());

const sessionOptions = {
  secret: "somethingSecret",
  cookie: {
    maxAge: 269999999999,
  },
  saveUninitialized: true,
  resave: true,
};

// SET STORAGE
const storage = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
    // filename
    // destination: function (req, file, cb) {
    //   cb(null, "uploads");
  },
});
// Configuration for cloudinary
cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret_key,
});

var upload = multer({ storage: storage }).single("image");

app.use(session(sessionOptions));
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.json());

//create admin loginID and password
app.post("/test", (req, res)=>{
  console.log(req.body.name);
})
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { email, password, key } = req.body;

  
  
    // Validate user input
    if (!(email && password && key==="AdminAccessControl")) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      
      password: encryptedPassword,

    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });
    console.log("User:" ,user);
    console.log("Body:" , req.body);
    console.log("password: " , user.password);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      // user.token = token;
      req.session.user = token;

      // user
      res.status(200).send(req.session.user);
    }
    //
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid Credentials");
  }
});

app.get("/events", (req, res) => {
  Event.find({}, function (err, foundEvents) {
    if (err) {
    } else {
      console.log(foundEvents);
      res.send(foundEvents);
    }
  });
});

app.post("/addevents", (req, res) => {
  // const { title, content, img } = req.body;
  // const event =new Event ({
  //   title: req.body.title,
  //   content: req.body.title,
  //   img:{

  //   }
  // });
  if(!(req.files.image && req.body.title && req.body.content && req.body.date)){
    res.status(400).send("All input is required");
  }

  let fileUrl = "";
  const file = req.files.image;
  const uniquefilename = new Date().toISOString();

  cloudinary.uploader.upload(
    file.tempFilePath,
    {
      public_id: `img/${uniquefilename}`,
      use_filename: true,
      unique_filename: false,
      folder: "IPU-IIF/EventImages",
    },
    (err, result) => {
      if (err) {
        res.status(502).send(err);
      } else {
        // res.send(result.secure_url);
        fileUrl = result.url;
        const event = new Event({
          title: req.body.title,
          content: req.body.content,
          date: req.body.date,
          image: fileUrl,
        });
        // console.log("third");
        event.save((err, response) => {
          if (err) {
            res.status(502).send(err);
          } else {
            res.status(200).send(response);
            // console.log("Succesfully Submitted");
            // console.log(response.pdfaddress);
          }
        });
      }
    }
  );

  // upload(req, res, (err) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     const event = new Event({
  //       title: req.body.title,
  //       content: req.body.content,
  //       img: {
  //         data: fs.readFileSync(
  //           path.join(__dirname + "/uploads/" + req.file.filename)
  //         ),
  //         // data: req.file.filename,
  //         contentType: "image/png",
  //       },
  //       date: req.body.date,
  //     });
  //     event.save(function (err, response) {
  //       if (err) {
  //         console.log(err);
  //         res.status(502).send(err);
  //       } else {
  //         res.status(200).send(response);
  //       }
  //     });
  //   }
  // });
  // console.log(req.body);
  // var encode_img = obj.img.toString('base64');
  // var final_img = {
  //     contentType:req.file.mimetype,
  //     image:new Buffer.alloc(encode_img,'base64')
  // };

  // Validate user input
  // if (!(obj.title && obj.content)) {
  //   res.status(400).send("All input is required");
  // }

  // check if user already exist
  // Validate if user exist in our database
  // let t = ;
  // const oldtitle = await Event.findOne({ t });

  // if (oldtitle) {
  //   return res.status(409).send("Title Already Exist. Please Change");
  // }

  // Create user in our database
});

app.get("/patents", async (req, res) => {
  const patents = await Patent.find({}, function (err, foundPatents) {
    if (err) {
      res.send(err);
    }
  }).sort({ date: -1 });

  res.status(200).send(patents);
});

app.post("/addpatents", async (req, res) => {
  // const { patentGrantDate, patentNo, patentee } = req.body;

  // Validate user input
  // if (!(patentGrantDate && patentNo && patentee)) {
  //   res.status(400).send("All input is required");
  // }

  // check if same patent no already exist
  // Validate if same patent no. already exist in our database
  const patentno = req.body.patentNo;
  const oldPatentNo = await Patent.findOne({ patentNo: patentno });

  if (oldPatentNo) {
    return res.status(409).send("Patent No. Already Exist. Please Change");
  }
  //getting the files details from the request
  let fileUrl = "";
  const file = req.files.certificate;
  const uniquefilename = new Date().toISOString();

  cloudinary.uploader.upload(
    file.tempFilePath,
    {
      public_id: `certificate/${uniquefilename}`,
      use_filename: true,
      unique_filename: false,
      folder: "IPU-IIF/Certificate",
    },
    (err, result) => {
      if (err) {
        res.status(502).send(err);
      } else {
        // res.send(result.secure_url);
        fileUrl = result.url;
        const patent = new Patent({
          patentGrantDate: req.body.patentGrantDate,
          patentNo: req.body.patentNo,
          patentee: req.body.patentee,
          certificate: fileUrl,
        });
        // console.log("third");
        patent.save((err, response) => {
          if (err) {
            res.status(502).send(err);
          } else {
            res.status(200).send(response);
            // console.log("Succesfully Submitted");
            // console.log(response.pdfaddress);
          }
        });
      }
    }
  );
});
//to delete a event from the DB
app.post("/deleteevent", async function (req, res) {
  const eventId = req.body.name; //coz the id of events are unique
  console.log(req.body.name);
  const deleteCount = await Event.deleteOne({ _id:eventId }, function (err) {
    if (err) {
      res.send(err);
    }
  });
  
  if(deleteCount === 1){
      res.status(200).send("Successfully deleted the event");
  }else{
    res.send("Data is not present in the database");
  }
});

// add notices in the database ------

app.post("/addnotices", async function (req, res) {
  //check if the title of the notice already exist in the database
  const titleOfNotice = req.body.title;
  const oldtitle = await Notice.findOne({ title: titleOfNotice });

  if (oldtitle) {
    return res
      .status(409)
      .send("Title of notice Already Exist. Please Change the title");
  }
  // console.log(req.body);
  let fileUrl = "";
  // const path = req.files.path;
  const file = req.files.pdf;
  const uniquefilename = new Date().toISOString();
  // console.log("first");
  cloudinary.uploader.upload(
    file.tempFilePath,
    {
      public_id: `notice/${uniquefilename}`,
      use_filename: true,
      unique_filename: false,
      folder: "IPU-IIF/Notices",
    },
    (err, result) => {
      if (err) {
        res.status(502).send(err);
      } else {
        // res.send(result.secure_url);
        fileUrl = result.url;
        const notice = new Notice({
          title: req.body.title,
          pdfaddress: fileUrl,
        });
        // console.log("third");
        notice.save(function (err, response) {
          if (err) {
            res.status(502).send(err);
          } else {
            res.status(200).send(response);
            // console.log("Succesfully Submitted");
            // console.log(response.pdfaddress);
          }
        });
      }
      // console.log(typeof(result.url));
      // console.log("Second");
    }
  );
});

//get all the notices details from the database
app.get("/notices", async function (req, res) {
  const result = await Notice.find({}, function (err, foundNotices) {
    if (err) {
      res.send(err);
    }
    //  else {
    //   res.send(foundNotices);
    // }
  }).sort({ date: -1 });
  res.status(200).send(result);
});

//to post all the queries
app.post("/contact", async function (req, res) {
  const { name, email, message } = req.body;

  const query = await Query.create({
    name: name,
    email: email,
    message: message,
  });
  query.save(function (err, response) {
    if (err) {
      res.status(502).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

app.get("/queries" , async function (req, res) {
  Query.find({}, function (err, foundqueries) {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(foundqueries);
    }
  });
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
