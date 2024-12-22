document.addEventListener('DOMContentLoaded', () => {
  const studentNameInput = document.getElementById('student-name');
  const totalSubjectsInput = document.getElementById('total-subjects');
  const studentForm = document.getElementById('student-info-form');
  const subjectForm = document.getElementById('subject-form');
  const gpaForm = document.getElementById('gpa-calculator-form');
  const resultContainer = document.getElementById('result');

  // If on the landing page
  if (studentForm) {
    studentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const studentName = studentNameInput.value;
      const totalSubjects = totalSubjectsInput.value;
      if (studentName && totalSubjects) {
        localStorage.setItem('studentName', studentName);
        localStorage.setItem('totalSubjects', totalSubjects);
        window.location.href = 'subject-entry.html';
      } else {
        alert('Please enter valid details');
      }
    });
  }

  // If on the subject entry page
  if (subjectForm) {
    const subjectNamesContainer = document.getElementById('subject-names-container');
    const totalSubjects = localStorage.getItem('totalSubjects');

    // Create input fields dynamically for each subject
    for (let i = 0; i < totalSubjects; i++) {
      const div = document.createElement('div');
      div.classList.add('form-group');
      div.innerHTML = `
        <label for="subject${i + 1}">Subject ${i + 1}:</label>
        <input type="text" id="subject${i + 1}" placeholder="Enter subject name" required>
      `;
      subjectNamesContainer.appendChild(div);
    }

    subjectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const subjectNames = [];
      for (let i = 0; i < totalSubjects; i++) {
        const subjectName = document.getElementById(`subject${i + 1}`).value;
        if (subjectName) {
          subjectNames.push(subjectName);
        }
      }

      if (subjectNames.length === parseInt(totalSubjects)) {
        localStorage.setItem('subjectNames', JSON.stringify(subjectNames));
        window.location.href = 'Calculator.html';
      } else {
        alert('Please fill out all subject names');
      }
    });
  }

  // If on the GPA calculator page
  if (gpaForm) {
    const subjectDropdown = document.getElementById('subject-name');
    const subjectNames = JSON.parse(localStorage.getItem('subjectNames'));
    const creditsDropdown = document.getElementById('credits'); // Credits dropdown
    const endSemField = document.getElementById('endsem'); // End Sem field

    // Populate dropdown with subject names
    subjectNames.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectDropdown.appendChild(option);
    });

    let totalGPA = 0;  // Store the cumulative GPA
    let subjectCount = 0;  // Count of subjects processed
    const totalSubjects = subjectNames.length;  // Total number of subjects
    let subjectGPA = [];  // Store individual subject GPA

    // Track the number of button clicks
    let clickCount = 0;

    // Event listener to handle credits dropdown change
    creditsDropdown.addEventListener('change', () => {
      const credits = parseInt(creditsDropdown.value);

      // Hide or show the End Sem field based on the selected credits
      if (credits === 2) {
        endsemtext.style.display = 'none';
        endSemField.style.display = 'none';  // Hide End Sem field for 2-credit courses
      } else {
        endsemtext.style.display = 'block';
        endSemField.style.display = 'block';  // Show End Sem field for other courses
      }
    });

    // Listen for the click to calculate GPA
    document.getElementById('calculate-gpa').addEventListener('click', () => {
      if (clickCount < totalSubjects) {
        const selectedSubject = document.getElementById('subject-name').value;
        const credits = parseInt(creditsDropdown.value);
        const ca1 = parseFloat(document.getElementById('ca1').value) || 0;
        const ca2 = parseFloat(document.getElementById('ca2').value) || 0;
        const midterm = parseFloat(document.getElementById('midterm').value) || 0;
        const endsem = parseFloat(document.getElementById('endsem').value) || 0;

        const totalMarks = ca1 + ca2 + midterm + endsem;
        const gpa = calculateGPA(totalMarks, credits);

        // Store GPA for each subject in an array
        subjectGPA.push({ subject: selectedSubject, gpa: gpa });

        totalGPA += gpa;  // Add the current subject GPA to the total GPA
        subjectCount++;  // Increment subject count
        clickCount++;  // Increment the click count

        // Update GPA display
        const averageGPA = (totalGPA / subjectCount).toFixed(2);
        document.getElementById('total-gpa').textContent = averageGPA;

        // Clear the form fields after submission
        clearFormFields();

        // Save subject GPA data to local storage
        localStorage.setItem('subjectGPA', JSON.stringify(subjectGPA));

        // If all subjects are processed, disable the button and generate report card
        if (clickCount >= totalSubjects) {
          document.getElementById('calculate-gpa').disabled = true;
          // Automatically generate the report card after the final click
          setTimeout(() => {
            window.location.href = 'report-card.html';  // Redirect to report card page
          }, 500);  // Delay for smooth transition
        }
      }
    });

    // Function to clear form fields after each submission
    function clearFormFields() {
      document.getElementById('ca1').value = '';
      document.getElementById('ca2').value = '';
      document.getElementById('midterm').value = '';
      document.getElementById('endsem').value = '';
      document.getElementById('subject-name').value = '';
      creditsDropdown.value = 0;
    }
  }

  // If on the report card page
  if (resultContainer) {
    const reportCardContainer = document.getElementById('report-card');
    const studentName = localStorage.getItem('studentName');
    const subjectNames = JSON.parse(localStorage.getItem('subjectNames'));
    const subjectGPA = JSON.parse(localStorage.getItem('subjectGPA'));

    // Display student name on report card
    document.getElementById('student-name').textContent = studentName;

    // Generate subject-wise GPA table
    const subjectsList = document.getElementById('subjects-list');
    subjectNames.forEach((subject, index) => {
      const subjectData = subjectGPA.find(item => item.subject === subject);
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${subject}</td>
        <td>${subjectData ? subjectData.gpa : 'N/A'}</td>
        <td>${getGrade(subjectData ? subjectData.gpa : 0)}</td>
      `;
      subjectsList.appendChild(row);
    });
  }
});

// Function to calculate GPA based on marks and credits
function calculateGPA(totalMarks, credits) {
  let gpa = 0;

  if (credits === 2) {
    // GPA calculation for 2-credit courses (out of 100)
    const percentage = (totalMarks / 100) * 100;

    if (percentage >= 90) gpa = 10;
    else if (percentage >= 80) gpa = 9;
    else if (percentage >= 70) gpa = 8;
    else if (percentage >= 60) gpa = 7;
    else if (percentage >= 50) gpa = 6;
    else if (percentage >= 40) gpa = 5;
    else if (percentage >= 30) gpa = 4;
    else if (percentage >= 20) gpa = 3;
    else if (percentage >= 10) gpa = 2;
    else if (percentage >= 1) gpa = 1;
    else gpa = 0;
  } else {
    // GPA calculation for 3 or 4-credit courses (out of 150)
    const percentage = (totalMarks / 150) * 100;

    if (percentage >= 90) gpa = 10;
    else if (percentage >= 80) gpa = 9;
    else if (percentage >= 70) gpa = 8;
    else if (percentage >= 60) gpa = 7;
    else if (percentage >= 50) gpa = 6;
    else if (percentage >= 40) gpa = 5;
    else if (percentage >= 30) gpa = 4;
    else if (percentage >= 20) gpa = 3;
    else if (percentage >= 10) gpa = 2;
    else if (percentage >= 1) gpa = 1;
    else gpa = 0;
  }

  return gpa;  // Return the GPA based on the percentage
}

// Function to get grade based on GPA
function getGrade(gpa) {
  if (gpa >= 9) return 'A+';
  if (gpa >= 8) return 'A';
  if (gpa >= 7) return 'B+';
  if (gpa >= 6) return 'B';
  if (gpa >= 5) return 'C';
  return 'F';
}
