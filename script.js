
let SamyangProcesses = [];

// Add process
function addProcess() {
    SamyangAddProcess();
}

function SamyangAddProcess() {
    let SamyangID = document.getElementById("processID").value.trim();
    let SamyangArrivalInput = document.getElementById("arrivalTime").value;
    let SamyangBurstInput = document.getElementById("burstTime").value;

    let SamyangArrival = Number(SamyangArrivalInput);
    let SamyangBurst = Number(SamyangBurstInput);

    if (SamyangID === "" || SamyangArrivalInput === "" ||
        SamyangBurstInput === "" || SamyangArrival < 0 || SamyangBurst <= 0) {
        alert("Please enter valid process information.");
        return;
    }

    if (SamyangProcesses.some(p => p.id === SamyangID)) {
        alert("Process ID already exists.");
        return;
    }

    SamyangProcesses.push({
        id: SamyangID,
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
    let lightColors = [
        "#DCCDF5",
        "#F5D1DF",
        "#C9E5DC",
        "#F6DFC0",
        "#D0DDF5",
        "#EBD5C8",
        "#D8DCEB"
    ];

    let darkColors = [
        "#51445F",
        "#634653",
        "#40594F",
        "#66513D",
        "#414F68",
        "#604B40",
        "#484B60"
    ];

    let colors = document.body.classList.contains("dark-mode")
        ? darkColors
        : lightColors;

    let index = parseInt(SamyangID.replace(/\D/g, "")) || 0;

    return colors[index % colors.length];
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
    let SamyangTime = 0;
    let SamyangRemaining = [...SamyangProcesses];
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

        // Calculate times
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
    SamyangDisplayResults(SamyangResults);

    // Scroll to Gantt chart
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

        SamyangDiv.dataset.processId = SamyangBlock.id;

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
function SamyangDisplayResults(SamyangResults) {

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

    let SamyangAvgWaiting =
        SamyangTotalWaiting / SamyangResults.length;

    let SamyangAvgTurnaround =
        SamyangTotalTurnaround / SamyangResults.length;

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
                <strong>${SamyangTotalBurst}</strong>
                <small>CPU busy time units</small>
            </div>

        </div>
    `;
}

// Change theme
function toggleTheme() {
    let isDark = !document.body.classList.contains("dark-mode");

    document.body.classList.toggle("dark-mode", isDark);

    localStorage.setItem("cpuTheme", isDark ? "dark" : "light");

    document.getElementById("themeToggle").textContent =
        isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    recolorGanttChart();
}

// Recolor Gantt chart
function recolorGanttChart() {
    let SamyangBlocks = document.querySelectorAll(".gantt-block");

    SamyangBlocks.forEach(block => {
        let processID = block.dataset.processId;

        if (processID && processID !== "Idle") {
            block.style.backgroundColor = SamyangGetColor(processID);
        }
    });
}

// Load saved theme
function loadTheme() {
    let isDark = localStorage.getItem("cpuTheme") === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    document.getElementById("themeToggle").textContent =
        isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

loadTheme();
