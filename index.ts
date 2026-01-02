require('dotenv').config();

interface IResults {
  high_risk_patients: string[], // patient_ids
  fever_patients: string[], // patient_ids
  data_quality_issues: string[] // patient_ids
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

interface IApiResponse {
  data: IPatient[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean,
  }
}

const results: IResults = {
  high_risk_patients: [],
  fever_patients: [],
  data_quality_issues: []
};

// Fetch patients data from the API with pagination
// Default to page 1 and limit 10
// Retries up to `retryCount` times for transient errors (429, 500, 503) with exponential backoff + jitter
async function fetchDataFromAPI(page: number = 1, limit: number = 10): Promise<IApiResponse> {
  const url = `https://assessment.ksensetech.com/api/patients?page=${page}&limit=${limit}`;
  const retryCount = 5;
  let attempt = 0;
  const baseDelay = 500; // milliseconds

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (attempt < retryCount) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": process.env.API_KEY || ""
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Handle 429 (rate limiting)
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        let delay = baseDelay * Math.pow(2, attempt); // exponential backoff
        if (retryAfter) {
          const parsed = parseInt(retryAfter, 10);
          if (!Number.isNaN(parsed)) {
            delay = Math.max(delay, parsed * 1000);
          } else {
            const date = Date.parse(retryAfter);
            if (!isNaN(date)) {
              const delta = date - Date.now();
              if (delta > 0) delay = Math.max(delay, delta);
            }
          }
        }
        attempt++;
        await sleep(delay + Math.floor(Math.random() * 100)); // add jitter
        continue;
      }

      // Retry on server errors 500/503
      if (response.status === 500 || response.status === 503) {
        attempt++;
        const delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
        await sleep(delay);
        continue;
      }

      // Non-retryable error - throw with body for debugging
      const text = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    } catch (err) {
      // Network or other unexpected errors - retry
      attempt++;
      if (attempt >= retryCount) {
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
      await sleep(delay);
      continue;
    }
  }

  throw new Error(`Failed to fetch patients after ${retryCount} attempts`);
}

// Process patients to identify high risk, fever, and data quality issues
const processPatients = async () => {
  // Fetch all patients using fetchDataFromAPI with pagination
  // Initial fetch to get total pages and patients
  const patientRecords = await fetchDataFromAPI(1, 20);
  const totalRecords = patientRecords.pagination.total;
  const perPage = patientRecords.pagination.limit;
  const totalPages = Math.ceil(totalRecords / perPage);
  // if totalRecords is 0, return early
  if (totalRecords === 0) {
    console.error("No patient records found.");
    return;
  }

  // Evaluate the first page immediately to avoid keeping all pages in memory
  evaluatePatients(patientRecords.data);
  let processedCount = patientRecords.data.length;

  if (totalPages > 1) {
    for (let page = 2; page <= totalPages; page++) {
      const pageData = await fetchDataFromAPI(page, perPage);
      // Evaluate patients for this page immediately to keep memory usage low
      evaluatePatients(pageData.data);
      processedCount += pageData.data.length;
    }
  }

  submitResult();
}

const checkBloodPressure = (bp?: string) => {
  const bpResult = {
    bpScore: 0,
    hasDataQualityIssue: false,
  };
  if (!bp || bp.split("/").length !== 2) {
    bpResult.hasDataQualityIssue = true;
    return bpResult;
  }
  const bpParts = bp.split("/");
  const systolic = parseInt(bpParts[0], 10);
  const diastolic = parseInt(bpParts[1], 10);
  if (isNaN(systolic) || isNaN(diastolic)) {
    bpResult.hasDataQualityIssue = true;
    return bpResult;
  }
  if (systolic < 120 && diastolic < 80) {
    bpResult.bpScore = 0;
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    bpResult.bpScore = 1;
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    bpResult.bpScore = 2;
  }
  if (systolic >= 140 || diastolic >= 90) {
    bpResult.bpScore = 3;
  }
  return bpResult;
}

const checkTemperature = (temp?: number | string) => {
  const tempResult = {
    tempScore: 0,
    hasDataQualityIssue: false,
  };
  if (temp === undefined) {
    tempResult.hasDataQualityIssue = true;
    return tempResult;
  }
  const temperature = typeof temp === "string" ? parseFloat(temp) : temp;
  if (isNaN(temperature)) {
    tempResult.hasDataQualityIssue = true;
    return tempResult;
  }
  if (temperature <= 99.5) {
    tempResult.tempScore = 0;
  }
  if (temperature >= 99.6 && temperature <= 100.9) {
    tempResult.tempScore = 1;
  }
  if (temperature >= 101.0) {
    tempResult.tempScore = 2;
  }
  return tempResult;
}

const checkAge = (age?: number | string) => {
  const ageResult = {
    ageScore: 0,
    hasDataQualityIssue: false,
  };
  if (age === undefined) {
    ageResult.hasDataQualityIssue = true;
    return ageResult;
  }
  const patientAge = typeof age === "string" ? parseInt(age, 10) : age;
  if (isNaN(patientAge)) {
    ageResult.hasDataQualityIssue = true;
    return ageResult;
  }
  if (patientAge < 40) {
    ageResult.ageScore = 0;
  }
  if (patientAge >= 40 && patientAge <= 65) {
    ageResult.ageScore = 1;
  }
  if (patientAge > 65) {
    ageResult.ageScore = 2;
  }
  return ageResult;
}

// Evaluate patients for risk scoring and data quality issues
const evaluatePatients = (patients: IPatient[]) => {
  patients.forEach(patient => {
    let bpScore = 0;
    let tempScore = 0;
    let ageScore = 0;
    let hasDataQualityIssue = false;

    // Total Risk Score = (BP Score) + (Temp Score) + (Age Score)
    // to push onto IResults results to submit to api/submit-assessment (submitResult function)

    // BP Risk Criteria: {points: criteria}
    // {
    //   0: (systolic < 120 && diastolic < 80) | invalid/missing (not number)
    //   1: systolic 120-129 && diastolic < 80
    //   2: systolic 130-139 || diastolic 80-89
    //   3: systolic >= 140 || diastolic >= 90
    // }
    const bpCheck = checkBloodPressure(patient.blood_pressure);
    bpScore = bpCheck.bpScore;
    // Temp Risk Criteria:
    // {
    //   0: temp <= 99.5  | invalid/missing (not number)
    //   1: temp >= 99.6-100.9
    //   2: temp >= 101.0
    // }

    const tempCheck = checkTemperature(patient.temperature);
    tempScore = tempCheck.tempScore;
    if (tempScore >= 1) {
      results.fever_patients.push(patient.patient_id);
    }
    // Age Risk Criteria:
    // {
    //   0: age < 40 | invalid/missing (not number)
    //   1: age 40-65
    //   2: age > 65
    // }
    const ageCheck = checkAge(patient.age);
    ageScore = ageCheck.ageScore;
    hasDataQualityIssue = bpCheck.hasDataQualityIssue || tempCheck.hasDataQualityIssue || ageCheck.hasDataQualityIssue;

    const totalRiskScore = bpScore + tempScore + ageScore;
    if (totalRiskScore >= 4) {
      results.high_risk_patients.push(patient.patient_id);
    }
    if (hasDataQualityIssue) {
      results.data_quality_issues.push(patient.patient_id);
    }
  });
};

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

processPatients();