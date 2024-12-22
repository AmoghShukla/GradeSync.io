document.addEventListener('DOMContentLoaded', () => {
    const subjectGPAData = JSON.parse(localStorage.getItem('subjectGPA')) || []; // Retrieve GPA data
    const subjectsListContainer = document.getElementById('subjects-list');
    const studentNameElement = document.getElementById('student-name');
    const finalGPAElement = document.getElementById('final-gpa');
    const finalGradeElement = document.getElementById('final-grade');

    // Get student name from local storage
    const studentName = localStorage.getItem('studentName');
    studentNameElement.textContent = studentName; // Display student's name

    let totalGPA = 0;
    let subjectCount = subjectGPAData.length;

    // If there is GPA data, generate the report
    if (subjectGPAData.length > 0) {
        subjectGPAData.forEach((data) => {
            const subjectRow = document.createElement('tr');
            subjectRow.innerHTML = `
                <td>${data.subject}</td>
                <td>${data.gpa}</td>
                <td>${getGrade(data.gpa)}</td>
            `;
            subjectsListContainer.appendChild(subjectRow);

            totalGPA += data.gpa; // Add subject GPA to total GPA
        });

        // Calculate final GPA
        const finalGPA = (totalGPA / subjectCount).toFixed(2);
        finalGPAElement.textContent = finalGPA; // Display final GPA

        // Display final grade based on GPA
        finalGradeElement.textContent = getGrade(finalGPA);
    } else {
        subjectsListContainer.innerHTML = '<tr><td colspan="3">No subjects found.</td></tr>';
    }

    // Add event listener to the download button
    const downloadButton = document.getElementById('download-pdf');
    downloadButton.addEventListener('click', () => {
        const element = document.getElementById('report-card-content');

        // Use html2pdf.js to capture the HTML content and convert it into PDF
        const options = {
            margin:       10,
            filename:     'report-card.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Call the html2pdf function
        html2pdf().from(element).set(options).save();
    });
});

// Function to determine the grade based on GPA
function getGrade(gpa) {
    if (gpa >= 9) return 'A+';
    if (gpa >= 8) return 'A';
    if (gpa >= 7) return 'B+';
    if (gpa >= 6) return 'B';
    if (gpa >= 5) return 'C';
    return 'F';
}
