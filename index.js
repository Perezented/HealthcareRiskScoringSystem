require('dotenv').config();
;
var results = {
    high_risk_patients: [],
    fever_patients: [],
    data_quality_issues: []
};
function fetchPatientsFromAPI() {
    fetch("https://assessment.ksensetech.com/api/patients?page=1&limit=10", {
        method: "GET",
        headers: {
            "x-api-key": process.env.API_KEY || ""
        }
    })
        .then(function (response) { return response.json(); })
        .then(function (data) { return console.log(data); });
}
var submitResult = function () {
    fetch("https://assessment.ksensetech.com/api/submit-assessment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.API_KEY || ""
        },
        body: JSON.stringify(results)
    })
        .then(function (response) { return response.json(); })
        .then(function (data) { return console.log("Assessment Results:", data); });
};
fetchPatientsFromAPI();
