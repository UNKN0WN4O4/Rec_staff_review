
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, '../data/faculty_raw.txt');
const outputPath = path.join(__dirname, '../data/facultyData.json');

const rawData = fs.readFileSync(rawDataPath, 'utf-8');

const lines = rawData.split('\n').map(line => line.trim()).filter(line => line);

let currentDept = '';
let currentSection = 'Faculty'; // Default section
const facultyList = [];

const DEPARTMENTS = [
    "AERO", "AUTOMOBILE", "BME", "BIOTECH", "CHEMICAL", "CSE – CS", "CSBS", "CSD", "ECE", "FOOD TECH", "AIML", "AIDS", "MEGATRONICS", "R&A", "HUMANITIES", "MANAGEMENT AND STUDIES(MBA)"
];

const SECTIONS = ["Faculty", "Supporting Staff", "Supporting Staff Members", "Supporting Staffs"];

for (const line of lines) {
    // Check if line is a department header
    const upperLine = line.toUpperCase();

    // Exact match or closely matching department header
    const deptMatch = DEPARTMENTS.find(dept => line.includes(dept) && line.length < dept.length + 5);

    if (deptMatch) {
        currentDept = deptMatch === "CSE – CS" ? "CSE" :
            deptMatch === "MANAGEMENT AND STUDIES(MBA)" ? "MBA" :
                deptMatch;
        currentSection = "Faculty"; // Reset to Faculty by default when dept changes
        continue;
    }

    // Check if line is a section header
    const sectionMatch = SECTIONS.find(sec => upperLine.includes(sec.toUpperCase()) && line.length < 30);
    if (sectionMatch) {
        if (sectionMatch.toUpperCase().includes("FACULTY")) {
            currentSection = "Faculty";
        } else {
            currentSection = "Supporting Staff";
        }
        continue;
    }

    // Determine if it's a faculty/staff line
    if (currentDept) {
        // Split by comma to separate name and designation
        const parts = line.split(',');
        if (parts.length >= 2) {
            const name = parts[0].trim();
            const designation = parts.slice(1).join(',').trim();

            facultyList.push({
                name,
                designation,
                department: currentDept,
                section: currentSection
            });
        }
    }
}

fs.writeFileSync(outputPath, JSON.stringify(facultyList, null, 2));

console.log(`Successfully parsed ${facultyList.length} staff members.`);
console.log(`Data saved to ${outputPath}`);
