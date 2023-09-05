const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/mentoring_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const studentSchema = new mongoose.Schema({
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
});

const mentorSchema = new mongoose.Schema({
  name: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

const Student = mongoose.model('Student', studentSchema);
const Mentor = mongoose.model('Mentor', mentorSchema);

// Create a Student
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student({ name: req.body.name });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Could not create student.' });
  }
});

// Assign a Student to a Mentor
app.put('/api/assign-mentor/:studentId/:mentorId', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.studentId, {
      mentor: req.params.mentorId,
    });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Could not assign mentor.' });
  }
});

// Assign or Change Mentor for a Student
app.put('/api/change-mentor/:studentId/:newMentorId', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.studentId, {
      mentor: req.params.newMentorId,
    });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Could not change mentor.' });
  }
});

// Show all Students for a Particular Mentor
app.get('/api/students-for-mentor/:mentorId', async (req, res) => {
  try {
    const students = await Student.find({ mentor: req.params.mentorId });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve students.' });
  }
});

// Show the Previously Assigned Mentor for a Particular Student
app.get('/api/previous-mentor/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (student && student.mentor) {
      const previousMentor = await Mentor.findById(student.mentor);
      res.status(200).json(previousMentor);
    } else {
      res.status(404).json({ message: 'Student not found or no previous mentor assigned.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve previous mentor.' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
