require('dotenv').config();

interface IResults {
  high_risk_patients: string[],
  fever_patients: string[],
  data_quality_issues: string[]
};

interface IPatient {
  patient_id: string,
  name?: string,
  age?: number | string,
  gender?: string,
  blood_pressure?: string,
  temperature?: number | string,
  visit_date?: string,
  diagnosis?: string,
  medications?: string
}

const results: IResults = {
  high_risk_patients: [],
  fever_patients: [],
  data_quality_issues: []
};

// Fetch patients from the API with pagination
// Default to page 1 and limit 10
// Returns a promise that resolves to the list of patients
async function fetchPatientsFromAPI(page: number = 1, limit: number = 10): Promise<IPatient[]> {
  const response = await fetch(`https://assessment.ksensetech.com/api/patients?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY || ""
    }
  });
  const data = await response.json();
  console.log(data);
  return data.patients;
}

// Process patients to identify high risk, fever, and data quality issues

// submit the results to the API (3 total attempts)
const submitResult = () => {
  fetch("https://assessment.ksensetech.com/api/submit-assessment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY || ""
    },
    body: JSON.stringify(results)
  })
    .then(response => response.json())
    .then(data => console.log("Assessment Results:", data));
}

// fetchPatientsFromAPI();
