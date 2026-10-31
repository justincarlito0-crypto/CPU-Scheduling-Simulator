
let SamyangProcesses = [];

// Add process
function addProcess() {
    SamyangAddProcess();
}

function SamyangAddProcess() {
    let SamyangID = document.getElementById("processID").value;
    let SamyangArrivalInput = document.getElementById("arrivalTime").value;
    let SamyangBurstInput = document.getElementById("burstTime").value;

    let SamyangArrival = Number(SamyangArrivalInput);
    let SamyangBurst = Number(SamyangBurstInput);

    if (SamyangID.trim() === "" || SamyangArrivalInput === "" ||
        SamyangBurstInput === "" || SamyangArrival < 0 || SamyangBurst <= 0) {
        alert("Please enter valid process information.");
        return;
    }

    // Check ID
    if (SamyangProcesses.some(p => p.id === SamyangID.trim())) {
        alert("Process ID already exists.");
        return;
    }

    SamyangProcesses.push({
        id: SamyangID.trim(),
        arrival: SamyangArrival,
        burst: SamyangBurst
    });

    SamyangDisplayProcesses();

    document.getElementById("processID").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
}

// Show processes
function SamyangDisplayProcesses() {
    let SamyangTable = document.getElementById("processTable");

    SamyangTable.innerHTML = "";

    SamyangProcesses.forEach(SamyangProcess => {
        SamyangTable.innerHTML += `
            <tr class="process-row">
                <td>${SamyangProcess.id}</td>
                <td>${SamyangProcess.arrival}</td>
                <td>${SamyangProcess.burst}</td>
            </tr>
        `;
    });
}

// Get process color
function SamyangGetColor(SamyangID) {
    let SamyangColors = [
        "#DCCDF5",
        "#F5D1DF",
        "#C9E5DC",
        "#F6DFC0",
        "#D0DDF5",
        "#EBD5C8",
        "#D8DCEB"
    ];

    let SamyangHash = 0;

    for (let i = 0; i < SamyangID.length; i++) {
        SamyangHash += SamyangID.charCodeAt(i);
    }

    return SamyangColors[SamyangHash % SamyangColors.length];
}

// Run simulation
function runSimulation() {
    SamyangRunSimulation();
}

function SamyangRunSimulation() {

    if (SamyangProcesses.length === 0) {
        alert("Please add processes first.");
        return;
    }

    let SamyangAlgorithm = document.getElementById("algorithm").value;

    let SamyangSorted = [...SamyangProcesses];

    if (SamyangAlgorithm === "fcfs") {
        SamyangSorted.sort((a, b) => a.arrival - b.arrival);
    }

    let SamyangTime = 0;
    let SamyangRemaining = [...SamyangSorted];
    let SamyangResults = [];
    let SamyangGantt = [];

    while (SamyangRemaining.length > 0) {

        let SamyangAvailable = SamyangRemaining.filter(
            p => p.arrival <= SamyangTime
        );

        if (SamyangAvailable.length === 0) {

            let SamyangNextArrival = Math.min(
                ...SamyangRemaining.map(p => p.arrival)
            );

            SamyangGantt.push({
                id: "Idle",
                start: SamyangTime,
                end: SamyangNextArrival
            });

            SamyangTime = SamyangNextArrival;
            continue;
        }

        let SamyangSelected;

        // FCFS
        if (SamyangAlgorithm === "fcfs") {

            SamyangSelected = SamyangAvailable.sort(
                (a, b) => a.arrival - b.arrival
            )[0];

        // SJF
        } else if (SamyangAlgorithm === "sjf") {

            SamyangSelected = SamyangAvailable.sort(
                (a, b) => a.burst - b.burst ||
                          a.arrival - b.arrival
            )[0];
        }

        // Calc times
        let SamyangStart = SamyangTime;
        let SamyangCompletion = SamyangTime + SamyangSelected.burst;

        let SamyangTurnaround =
            SamyangCompletion - SamyangSelected.arrival;

        let SamyangWaiting =
            SamyangTurnaround - SamyangSelected.burst;

        SamyangResults.push({
            id: SamyangSelected.id,
            arrival: SamyangSelected.arrival,
            burst: SamyangSelected.burst,
            completion: SamyangCompletion,
            turnaround: SamyangTurnaround,
            waiting: SamyangWaiting
        });

        SamyangGantt.push({
            id: SamyangSelected.id,
            start: SamyangStart,
            end: SamyangCompletion
        });

        SamyangTime = SamyangCompletion;

        SamyangRemaining = SamyangRemaining.filter(
            p => p !== SamyangSelected
        );
    }

    SamyangGanttChart(SamyangGantt);
SamyangDisplayResults(SamyangResults, SamyangGantt);

// SCROLL ZZZ
setTimeout(() => {
    let SamyangTarget = document.getElementById("ganttChart");

    let SamyangPosition =
        SamyangTarget.getBoundingClientRect().top +
        window.pageYOffset - 100;

    window.scrollTo({
        top: SamyangPosition,
        behavior: "smooth"
    });
}, 200);
}

// Show Gantt chart
function SamyangGanttChart(SamyangGantt) {

    let SamyangChart = document.getElementById("ganttChart");
    SamyangChart.innerHTML = "";

    SamyangGantt.forEach((SamyangBlock, index) => {

        let SamyangDiv = document.createElement("div");
        SamyangDiv.className = "gantt-block";

        SamyangDiv.style.flex =
            SamyangBlock.end - SamyangBlock.start;

        SamyangDiv.style.animationDelay = `${index * 0.18}s`;

        if (SamyangBlock.id === "Idle") {
            SamyangDiv.classList.add("idle-block");
        } else {
            SamyangDiv.style.backgroundColor =
                SamyangGetColor(SamyangBlock.id);
        }

        SamyangDiv.innerHTML = `
            <strong>${SamyangBlock.id}</strong>
            <div class="gantt-time">
                ${SamyangBlock.start} - ${SamyangBlock.end}
            </div>
        `;

        SamyangChart.appendChild(SamyangDiv);
    });
}

// Show results
function SamyangDisplayResults(SamyangResults, SamyangGantt) {

    let SamyangTable = document.getElementById("resultsTable");
    SamyangTable.innerHTML = "";

    let SamyangTotalWaiting = 0;
    let SamyangTotalTurnaround = 0;
    let SamyangTotalBurst = 0;

    SamyangResults.forEach((SamyangProcess, index) => {

        SamyangTotalWaiting += SamyangProcess.waiting;
        SamyangTotalTurnaround += SamyangProcess.turnaround;
        SamyangTotalBurst += SamyangProcess.burst;

        SamyangTable.innerHTML += `
    <tr class="result-row" style="animation-delay: ${index * 0.12}s">
        <td><strong>${SamyangProcess.id}</strong></td>
        <td>${SamyangProcess.arrival}</td>
        <td>${SamyangProcess.burst}</td>
        <td><span class="result-number completion">${SamyangProcess.completion}</span></td>
        <td><span class="result-number turnaround">${SamyangProcess.turnaround}</span></td>
        <td><span class="result-number waiting">${SamyangProcess.waiting}</span></td>
    </tr>
`;
    });

    // Get averages
    let SamyangAvgWaiting =
        SamyangTotalWaiting / SamyangResults.length;

    let SamyangAvgTurnaround =
        SamyangTotalTurnaround / SamyangResults.length;

    // Get total execution time
    let SamyangTotalExecution = SamyangTotalBurst;

    document.getElementById("averages").innerHTML = `
        <div class="stats-grid">

            <div class="stat-card">
                <span>Average Waiting Time</span>
                <strong>${SamyangAvgWaiting.toFixed(2)}</strong>
                <small>Time units</small>
            </div>

            <div class="stat-card">
                <span>Average Turnaround Time</span>
                <strong>${SamyangAvgTurnaround.toFixed(2)}</strong>
                <small>Time units</small>
            </div>

            <div class="stat-card">
                <span>Total Execution Time</span>
                <strong>${SamyangTotalExecution}</strong>
                <small>CPU busy time units</small>
            </div>

        </div>
    `;
}
function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const button = document.getElementById("themeToggle");

    if (document.body.classList.contains("dark-mode")) {
        button.textContent = "☀️ Light Mode";
    } else {
        button.textContent = "🌙 Dark Mode";
    }
}