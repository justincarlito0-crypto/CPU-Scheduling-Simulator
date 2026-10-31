
let SamyangProcesses = JSON.parse(localStorage.getItem("cpuLabProcesses")) || [];
let SamyangSchedule = [];
let SamyangResults = [];

let SamyangAlgorithm =
    new URLSearchParams(window.location.search).get("algorithm") || "fcfs";

const SamyangAlgorithms = {
    fcfs: {
        name: "First Come, First Served",
        shortName: "FCFS",
        description: "Processes are executed in the order they arrive in the ready queue."
    },

    sjf: {
        name: "Shortest Job First",
        shortName: "SJF",
        description: "The available process with the shortest burst time is executed first."
    },

    priority: {
        name: "Priority Scheduling",
        shortName: "PRIORITY",
        description: "The available process with the highest priority is executed first."
    }
};


// SAVE PROCESSES

function SamyangSaveProcesses() {
    localStorage.setItem("cpuLabProcesses", JSON.stringify(SamyangProcesses));
}


// LOADING SCREEN

function SamyangShowLoading(message, callback) {
    const overlay = document.getElementById("loadingOverlay");
    const loadingText = document.getElementById("loadingText");

    if (loadingText) {
        loadingText.textContent = message;
    }

    if (!overlay) {
        if (callback) callback();
        return;
    }

    overlay.classList.remove("hidden");

    // MAKE SURE THE BROWSER DISPLAYS THE LOADING SCREEN FIRST
    overlay.style.display = "flex";

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (callback) {
                    callback();
                }
            }, 1500);
        });
    });
}


// THEME

function SamyangSetupTheme() {
    const themeButton = document.getElementById("themeToggle");

    if (!themeButton) return;

    const savedTheme = localStorage.getItem("cpuTheme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);
    themeButton.textContent = savedTheme === "dark" ? "☀" : "☾";

    themeButton.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("cpuTheme", newTheme);

        themeButton.textContent = newTheme === "dark" ? "☀" : "☾";
    });
}


// HOME PAGE

function SamyangSetupHome() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const algorithmSelection = document.getElementById("algorithmSelection");
    const getStartedButton = document.getElementById("getStartedButton");
    const backButton = document.getElementById("backToWelcomeButton");

    if (!welcomeScreen || !algorithmSelection) return;

    if (getStartedButton) {
        getStartedButton.addEventListener("click", () => {
            welcomeScreen.classList.add("hidden");
            algorithmSelection.classList.remove("hidden");
        });
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            algorithmSelection.classList.add("hidden");
            welcomeScreen.classList.remove("hidden");
        });
    }

    document.querySelectorAll(".algorithm-card").forEach(card => {
        card.addEventListener("click", event => {
            event.preventDefault();

            const destination = card.getAttribute("href");

            SamyangShowLoading("Opening simulator...", () => {
                window.location.href = destination;
            });
        });
    });
}


// SIMULATOR PAGE

function SamyangSetupSimulator() {
    const algorithm = SamyangAlgorithms[SamyangAlgorithm] || SamyangAlgorithms.fcfs;

    document.getElementById("algorithmTitle").textContent = algorithm.name;
    document.getElementById("algorithmDescription").textContent = algorithm.description;
    document.getElementById("selectedAlgorithm").textContent = algorithm.shortName;

    const priorityGroup = document.getElementById("priorityGroup");

    if (SamyangAlgorithm === "priority") {
        priorityGroup.classList.remove("hidden");
    } else {
        priorityGroup.classList.add("hidden");
    }

    document.getElementById("addProcessButton").addEventListener("click", SamyangAddProcess);
    document.getElementById("clearProcessesButton").addEventListener("click", SamyangClearProcesses);
    document.getElementById("runSimulationButton").addEventListener("click", SamyangRunSimulation);
    document.getElementById("editProcessesButton").addEventListener("click", SamyangBackToSimulator);
    document.getElementById("runAgainButton").addEventListener("click", SamyangBackToSimulator);

    ["processID", "arrivalTime", "burstTime", "priority"].forEach(id => {
        const input = document.getElementById(id);

        if (input) {
            input.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    SamyangAddProcess();
                }
            });
        }
    });

    SamyangRenderProcessTable();
}


// ADD PROCESS

function SamyangAddProcess() {
    const id = document.getElementById("processID").value.trim();
    const arrival = document.getElementById("arrivalTime").value;
    const burst = document.getElementById("burstTime").value;
    const priorityInput = document.getElementById("priority").value;

    if (!id || arrival === "" || burst === "") {
        alert("Please fill in the Process ID, Arrival Time, and Burst Time.");
        return;
    }

    if (Number(arrival) < 0 || !Number.isInteger(Number(arrival))) {
        alert("Arrival Time must be a non-negative whole number.");
        return;
    }

    if (Number(burst) <= 0 || !Number.isInteger(Number(burst))) {
        alert("Burst Time must be a positive whole number.");
        return;
    }

    if (SamyangProcesses.some(process => process.id.toLowerCase() === id.toLowerCase())) {
        alert("That Process ID already exists.");
        return;
    }

    let priority = null;

    if (SamyangAlgorithm === "priority") {
        if (priorityInput === "" || Number(priorityInput) < 1 ||
            !Number.isInteger(Number(priorityInput))) {
            alert("Please enter a valid priority number.");
            return;
        }

        priority = Number(priorityInput);
    }

    SamyangProcesses.push({
        id: id,
        arrival: Number(arrival),
        burst: Number(burst),
        priority: priority,
        order: SamyangProcesses.length
    });

    SamyangSaveProcesses();

    document.getElementById("processID").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
    document.getElementById("priority").value = "";

    SamyangRenderProcessTable();
}


// REMOVE PROCESS

function SamyangRemoveProcess(index) {
    if (!confirm("Remove this process?")) return;

    SamyangProcesses.splice(index, 1);

    SamyangSaveProcesses();
    SamyangRenderProcessTable();
}


// SET PRIORITY

function SamyangSetPriority(index) {
    const current = SamyangProcesses[index].priority ?? "";

    const answer = prompt("Enter priority number (smaller number = higher priority):", current);

    if (answer === null) return;

    if (answer.trim() === "" || Number(answer) < 1 ||
        !Number.isInteger(Number(answer))) {
        alert("Please enter a valid positive whole number.");
        return;
    }

    SamyangProcesses[index].priority = Number(answer);

    SamyangSaveProcesses();
    SamyangRenderProcessTable();
}


// CLEAR PROCESSES

function SamyangClearProcesses() {
    if (SamyangProcesses.length === 0) return;

    if (!confirm("Are you sure you want to clear all processes?")) return;

    SamyangProcesses = [];

    SamyangSaveProcesses();
    SamyangRenderProcessTable();
}


// RENDER PROCESS TABLE

function SamyangRenderProcessTable() {
    const tableBody = document.getElementById("processTableBody");
    const count = document.getElementById("processCount");
    const emptyMessage = document.getElementById("emptyProcessMessage");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const priorityColumns = document.querySelectorAll(".priority-column");

    priorityColumns.forEach(column => {
        column.classList.toggle("hidden", SamyangAlgorithm !== "priority");
    });

    count.textContent = `${SamyangProcesses.length} process${SamyangProcesses.length === 1 ? "" : "es"}`;

    emptyMessage.classList.toggle("hidden", SamyangProcesses.length > 0);

    SamyangProcesses.forEach((process, index) => {
        const row = document.createElement("tr");

        let priorityCell = "";

        if (SamyangAlgorithm === "priority") {
            const priorityText = process.priority ?? "Set";

            priorityCell = `
                <td>
                    <button class="table-action priority-button"
                        onclick="SamyangSetPriority(${index})">
                        ${priorityText}
                    </button>
                </td>
            `;
        }

        row.innerHTML = `
            <td><strong>${SamyangEscapeHTML(process.id)}</strong></td>
            <td>${process.arrival}</td>
            <td>${process.burst}</td>
            ${priorityCell}
            <td>
                <button class="table-action"
                    onclick="SamyangRemoveProcess(${index})">
                    Remove
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ESCAPE HTML

function SamyangEscapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
}


// RUN SIMULATION

function SamyangRunSimulation() {
    if (SamyangProcesses.length === 0) {
        alert("Please add at least one process.");
        return;
    }

    if (SamyangAlgorithm === "priority") {
        const missingPriority = SamyangProcesses.some(process =>
            process.priority === null || process.priority === undefined
        );

        if (missingPriority) {
            alert("Please set a priority for every process.");
            return;
        }
    }

    SamyangShowLoading("Running simulation...", () => {
        SamyangSchedule = SamyangScheduleProcesses();
        SamyangCalculateResults();
        SamyangDisplayResults();

        document.getElementById("simulatorView").classList.add("hidden");
        document.getElementById("resultsView").classList.remove("hidden");
        document.getElementById("editProcessesButton").classList.remove("hidden");

        window.scrollTo({ top: 0, behavior: "smooth" });

        const overlay = document.getElementById("loadingOverlay");
        overlay.classList.add("hidden");
    });
}


// SCHEDULE PROCESSES

function SamyangScheduleProcesses() {
    const remaining = SamyangProcesses.map((process, index) => ({
        ...process,
        originalOrder: index
    }));

    const schedule = [];
    let currentTime = 0;

    while (remaining.length > 0) {
        const available = remaining.filter(process => process.arrival <= currentTime);

        if (available.length === 0) {
            const nextArrival = Math.min(...remaining.map(process => process.arrival));

            schedule.push({
                id: "Idle",
                start: currentTime,
                end: nextArrival,
                idle: true
            });

            currentTime = nextArrival;
            continue;
        }

        let selectedProcess;

        if (SamyangAlgorithm === "fcfs") {
            available.sort((a, b) =>
                a.arrival - b.arrival || a.originalOrder - b.originalOrder
            );
        }

        else if (SamyangAlgorithm === "sjf") {
            available.sort((a, b) =>
                a.burst - b.burst ||
                a.arrival - b.arrival ||
                a.originalOrder - b.originalOrder
            );
        }

        else if (SamyangAlgorithm === "priority") {
            available.sort((a, b) =>
                a.priority - b.priority ||
                a.arrival - b.arrival ||
                a.originalOrder - b.originalOrder
            );
        }

        selectedProcess = available[0];

        const startTime = currentTime;
        const endTime = currentTime + selectedProcess.burst;

        schedule.push({
            id: selectedProcess.id,
            start: startTime,
            end: endTime,
            arrival: selectedProcess.arrival,
            burst: selectedProcess.burst,
            priority: selectedProcess.priority,
            idle: false
        });

        currentTime = endTime;

        const removeIndex = remaining.findIndex(process =>
            process.originalOrder === selectedProcess.originalOrder
        );

        remaining.splice(removeIndex, 1);
    }

    return schedule;
}


// CALCULATE RESULTS

function SamyangCalculateResults() {
    SamyangResults = [];

    SamyangSchedule.forEach(block => {
        if (block.idle) return;

        const completion = block.end;
        const turnaround = completion - block.arrival;
        const waiting = turnaround - block.burst;

        SamyangResults.push({
            id: block.id,
            arrival: block.arrival,
            burst: block.burst,
            completion: completion,
            turnaround: turnaround,
            waiting: waiting
        });
    });
}


// DISPLAY RESULTS

function SamyangDisplayResults() {
    const algorithm = SamyangAlgorithms[SamyangAlgorithm];

    document.getElementById("resultsAlgorithm").textContent = algorithm.shortName;

    const totalWaiting = SamyangResults.reduce((sum, process) => sum + process.waiting, 0);
    const totalTurnaround = SamyangResults.reduce((sum, process) => sum + process.turnaround, 0);
    const totalBurst = SamyangResults.reduce((sum, process) => sum + process.burst, 0);

    const processCount = SamyangResults.length;

    document.getElementById("averageWaiting").textContent =
        (totalWaiting / processCount).toFixed(2);

    document.getElementById("averageTurnaround").textContent =
        (totalTurnaround / processCount).toFixed(2);

    document.getElementById("totalBurst").textContent = totalBurst;

    SamyangRenderResultsTable();
    SamyangRenderGanttChart();
}


// RESULTS TABLE

function SamyangRenderResultsTable() {
    const tableBody = document.getElementById("resultsTableBody");

    tableBody.innerHTML = "";

    SamyangResults.forEach(process => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${SamyangEscapeHTML(process.id)}</strong></td>
            <td>${process.arrival}</td>
            <td>${process.burst}</td>
            <td>${process.completion}</td>
            <td>${process.turnaround}</td>
            <td>${process.waiting}</td>
        `;

        tableBody.appendChild(row);
    });
}


// GANTT CHART

function SamyangRenderGanttChart() {
    const chart = document.getElementById("ganttChart");

    chart.innerHTML = "";

    const colors = [
        "#8652d9",
        "#ed75ad",
        "#38a9bb",
        "#b28b52",
        "#8068a8",
        "#cf7190"
    ];

    let processColorIndex = 0;

    SamyangSchedule.forEach(block => {
        const duration = block.end - block.start;

        const item = document.createElement("div");
        item.className = "gantt-item";

        if (block.idle) {
            item.classList.add("idle");
        } else {
            item.style.background = colors[processColorIndex % colors.length];
            processColorIndex++;
        }

        item.style.flexGrow = duration;
        item.style.flexBasis = "0";

        item.innerHTML = `
            ${SamyangEscapeHTML(block.id)}
            <span class="gantt-time">${block.start}</span>
            <span class="gantt-time end">${block.end}</span>
        `;

        chart.appendChild(item);
    });
}


// BACK TO SIMULATOR

function SamyangBackToSimulator() {
    document.getElementById("resultsView").classList.add("hidden");
    document.getElementById("simulatorView").classList.remove("hidden");
    document.getElementById("editProcessesButton").classList.add("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });

    SamyangRenderProcessTable();
}


// START

document.addEventListener("DOMContentLoaded", () => {
    SamyangSetupTheme();
    SamyangSetupHome();

    if (document.getElementById("simulatorView")) {
        SamyangSetupSimulator();
    }
});
