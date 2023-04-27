const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://sandhyakumari3122003:SYWwcLCYPx6hyevP@cluster0.ywkgl0l.mongodb.net/PeopleDB");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// schema
const personSchema = mongoose.Schema({
    FirstName:{
      type: String,
      required: [true, "First name is required"],
      minlength: 3
    },
    LastName:{
      type: String,
      required: [true, "Last name is required"],
      minlength: 3
    },
    contactNo:{
      type: String,
      required: [true, "Mobile number is required"],
      validate: {
        validator: function(v) {
          return /\d{10}/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      }
    }
  });
  
// model
const Person = mongoose.model("person",personSchema);


// show the data on frontent
app.get("/", async (req, res) => {
    try {
      const foundPerson = await Person.find({});
      if (foundPerson && foundPerson.length > 0) {
        res.render("home", { person: foundPerson });
      } else {
        res.render("home", { person: [] }); // render an empty array if no documents are found
      }
    } catch (err) {
      console.log(err);
    }
  });
  
  
// save the data into database
app.post("/", async (req, res) => {
    const person = req.body;
  
    try {
      const existingFirstName = await Person.findOne({ FirstName: person.FirstName });
      const existingLastName = await Person.findOne({ LastName: person.LastName });
      if (existingFirstName && existingLastName) {
        return res.send('<script>alert("User already exists."); window.location.href = "/";</script>');
      }
  
      const existingContact = await Person.findOne({ contactNo: person.contactNo });
      if (existingContact) {
        return res.send('<script>alert("Contact number already exists."); window.location.href = "/";</script>');
      }
  
      if (!person.FirstName.trim() || !person.LastName.trim() || !person.contactNo.trim()) {
        return res.send('<script>alert("First name and last name must not be empty or contain only whitespace."); window.location.href = "/";</script>');
      }
      const contactNo = parseInt(person.contactNo);
    if (isNaN(contactNo) || person.contactNo.length !== 10) {
      return res.send('<script>alert("ContactNo should be a 10-digit number."); window.location.href = "/";</script>');
    }
      
     
  
      const newPerson = new Person({
        FirstName:person.FirstName,
        LastName:person.LastName,
        contactNo: person.contactNo,
      });
  
      await newPerson.save();
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      return res.redirect("/")
    }
  });
  
// delete the data
app.post("/delete", async(req,res)=>{
    try {
        const id = new mongoose.Types.ObjectId(req.body.DelBtn.replace(/`/g, ''));
        console.log(id); 
        await Person.findByIdAndRemove(id); // delete the entry with the given ID
        res.status(204).redirect("/");// return a 204 status code indicating success
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }

}) 
  

app.listen(PORT, function () {
    console.log(`Server has started at port ${PORT}`);
  });