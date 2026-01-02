var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
require('dotenv').config();
;
var results = {
    high_risk_patients: [],
    fever_patients: [],
    data_quality_issues: []
};
// Fetch patients from the API with pagination
// Default to page 1 and limit 10
// Retries up to `retryCount` times for transient errors (429, 500, 503) with exponential backoff + jitter
function fetchPatientsFromAPI() {
    return __awaiter(this, arguments, void 0, function (page, limit) {
        var url, retryCount, attempt, baseDelay, sleep, response, data, retryAfter, delay, parsed, date, delta, delay, text, err_1, delay;
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://assessment.ksensetech.com/api/patients?page=".concat(page, "&limit=").concat(limit);
                    retryCount = 5;
                    attempt = 0;
                    baseDelay = 500;
                    sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
                    _a.label = 1;
                case 1:
                    if (!(attempt < retryCount)) return [3 /*break*/, 14];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 13]);
                    return [4 /*yield*/, fetch(url, {
                            method: "GET",
                            headers: {
                                "x-api-key": process.env.API_KEY || ""
                            }
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    return [2 /*return*/, data.patients];
                case 5:
                    if (!(response.status === 429)) return [3 /*break*/, 7];
                    retryAfter = response.headers.get("Retry-After");
                    delay = baseDelay * Math.pow(2, attempt);
                    if (retryAfter) {
                        parsed = parseInt(retryAfter, 10);
                        if (!Number.isNaN(parsed)) {
                            delay = Math.max(delay, parsed * 1000);
                        }
                        else {
                            date = Date.parse(retryAfter);
                            if (!isNaN(date)) {
                                delta = date - Date.now();
                                if (delta > 0)
                                    delay = Math.max(delay, delta);
                            }
                        }
                    }
                    attempt++;
                    return [4 /*yield*/, sleep(delay + Math.floor(Math.random() * 100))];
                case 6:
                    _a.sent(); // add jitter
                    return [3 /*break*/, 1];
                case 7:
                    if (!(response.status === 500 || response.status === 503)) return [3 /*break*/, 9];
                    attempt++;
                    delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
                    return [4 /*yield*/, sleep(delay)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 9: return [4 /*yield*/, response.text()];
                case 10:
                    text = _a.sent();
                    throw new Error("Request failed with status ".concat(response.status, ": ").concat(text));
                case 11:
                    err_1 = _a.sent();
                    // Network or other unexpected errors - retry
                    attempt++;
                    if (attempt >= retryCount) {
                        throw err_1;
                    }
                    delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
                    return [4 /*yield*/, sleep(delay)];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 13: return [3 /*break*/, 1];
                case 14: throw new Error("Failed to fetch patients after ".concat(retryCount, " attempts"));
            }
        });
    });
}
function fetchDataFromAPI() {
    return __awaiter(this, arguments, void 0, function (page, limit) {
        var url, retryCount, attempt, baseDelay, sleep, response, data, retryAfter, delay, parsed, date, delta, delay, text, err_2, delay;
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://assessment.ksensetech.com/api/patients?page=".concat(page, "&limit=").concat(limit);
                    retryCount = 5;
                    attempt = 0;
                    baseDelay = 500;
                    sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
                    _a.label = 1;
                case 1:
                    if (!(attempt < retryCount)) return [3 /*break*/, 14];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 13]);
                    return [4 /*yield*/, fetch(url, {
                            method: "GET",
                            headers: {
                                "x-api-key": process.env.API_KEY || ""
                            }
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 5:
                    if (!(response.status === 429)) return [3 /*break*/, 7];
                    retryAfter = response.headers.get("Retry-After");
                    delay = baseDelay * Math.pow(2, attempt);
                    if (retryAfter) {
                        parsed = parseInt(retryAfter, 10);
                        if (!Number.isNaN(parsed)) {
                            delay = Math.max(delay, parsed * 1000);
                        }
                        else {
                            date = Date.parse(retryAfter);
                            if (!isNaN(date)) {
                                delta = date - Date.now();
                                if (delta > 0)
                                    delay = Math.max(delay, delta);
                            }
                        }
                    }
                    attempt++;
                    return [4 /*yield*/, sleep(delay + Math.floor(Math.random() * 100))];
                case 6:
                    _a.sent(); // add jitter
                    return [3 /*break*/, 1];
                case 7:
                    if (!(response.status === 500 || response.status === 503)) return [3 /*break*/, 9];
                    attempt++;
                    delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
                    return [4 /*yield*/, sleep(delay)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 9: return [4 /*yield*/, response.text()];
                case 10:
                    text = _a.sent();
                    throw new Error("Request failed with status ".concat(response.status, ": ").concat(text));
                case 11:
                    err_2 = _a.sent();
                    // Network or other unexpected errors - retry
                    attempt++;
                    if (attempt >= retryCount) {
                        throw err_2;
                    }
                    delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
                    return [4 /*yield*/, sleep(delay)];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 13: return [3 /*break*/, 1];
                case 14: throw new Error("Failed to fetch patients after ".concat(retryCount, " attempts"));
            }
        });
    });
}
// Process patients to identify high risk, fever, and data quality issues
var processPatients = function () { return __awaiter(_this, void 0, void 0, function () {
    var patientRecords, totalRecords, perPage, totalPages, processedCount, page, pageData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchDataFromAPI(1, 20)];
            case 1:
                patientRecords = _a.sent();
                totalRecords = patientRecords.pagination.total;
                perPage = patientRecords.pagination.limit;
                totalPages = Math.ceil(totalRecords / perPage);
                // if totalRecords is 0, return early
                if (totalRecords === 0) {
                    console.error("No patient records found.");
                    return [2 /*return*/];
                }
                // Evaluate the first page immediately to avoid keeping all pages in memory
                evaluatePatients(patientRecords.data);
                processedCount = patientRecords.data.length;
                if (!(totalPages > 1)) return [3 /*break*/, 5];
                page = 2;
                _a.label = 2;
            case 2:
                if (!(page <= totalPages)) return [3 /*break*/, 5];
                return [4 /*yield*/, fetchDataFromAPI(page, perPage)];
            case 3:
                pageData = _a.sent();
                // Evaluate patients for this page immediately to keep memory usage low
                evaluatePatients(pageData.data);
                processedCount += pageData.data.length;
                console.log({ processedPages: page, processedCount: processedCount });
                _a.label = 4;
            case 4:
                page++;
                return [3 /*break*/, 2];
            case 5:
                console.log({ allPatientsProcessed: processedCount });
                return [2 /*return*/];
        }
    });
}); };
var checkBloodPressure = function (bp) {
    var bpResult = {
        bpScore: 0,
        hasDataQualityIssue: false,
    };
    if (!bp || bp.split("/").length !== 2) {
        bpResult.hasDataQualityIssue = true;
        return bpResult;
    }
    var bpParts = bp.split("/");
    var systolic = parseInt(bpParts[0], 10);
    var diastolic = parseInt(bpParts[1], 10);
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
};
var checkTemperature = function (temp) {
    var tempResult = {
        tempScore: 0,
        hasDataQualityIssue: false,
    };
    if (temp === undefined) {
        tempResult.hasDataQualityIssue = true;
        return tempResult;
    }
    var temperature = typeof temp === "string" ? parseFloat(temp) : temp;
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
};
var checkAge = function (age) {
    var ageResult = {
        ageScore: 0,
        hasDataQualityIssue: false,
    };
    if (age === undefined) {
        ageResult.hasDataQualityIssue = true;
        return ageResult;
    }
    var patientAge = typeof age === "string" ? parseInt(age, 10) : age;
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
};
// Evaluate patients for risk scoring and data quality issues
var evaluatePatients = function (patients) {
    patients.forEach(function (patient) {
        var bpScore = 0;
        var tempScore = 0;
        var ageScore = 0;
        var hasDataQualityIssue = false;
        // Total Risk Score = (BP Score) + (Temp Score) + (Age Score)
        // to push onto IResults results to submit to api/submit-assessment (submitResult function)
        // BP Risk Criteria: {points: criteria}
        // {
        //   0: (systolic < 120 && diastolic < 80) | invalid/missing (not number)
        //   1: systolic 120-129 && diastolic < 80
        //   2: systolic 130-139 || diastolic 80-89
        //   3: systolic >= 140 || diastolic >= 90
        // }
        var bpCheck = checkBloodPressure(patient.blood_pressure);
        bpScore = bpCheck.bpScore;
        // Temp Risk Criteria:
        // {
        //   0: temp <= 99.5  | invalid/missing (not number)
        //   1: temp >= 99.6-100.9
        //   2: temp >= 101.0
        // }
        var tempCheck = checkTemperature(patient.temperature);
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
        var ageCheck = checkAge(patient.age);
        ageScore = ageCheck.ageScore;
        hasDataQualityIssue = bpCheck.hasDataQualityIssue || tempCheck.hasDataQualityIssue || ageCheck.hasDataQualityIssue;
        var totalRiskScore = bpScore + tempScore + ageScore;
        if (totalRiskScore >= 4) {
            results.high_risk_patients.push(patient.patient_id);
        }
        if (hasDataQualityIssue) {
            results.data_quality_issues.push(patient.patient_id);
        }
    });
    console.log({ resultsAfterEvaluation: results });
};
// submit the results to the API (3 total attempts)
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
processPatients();
