// LOAD PROCESSES
let SamyangProcesses = JSON.parse(localStorage.getItem("cpuLabProcesses")) || [];
let SamyangSchedule = [];
let SamyangResults = [];

let SamyangAlgorithm = new URLSearchParams(window.location.search).get("algorithm") || "fcfs";

const SamyangAlgorithms = {
    fcfs: {
        name: "First Come, First Served",
        shortName: "FCFS",
        description: "Processes are executed in the order they arrive.",
        icon: "⏱",
        method: "Arrival time",
        sideText: "FCFS selects the process that arrives first in the ready queue.",
        tip: "If two processes arrive at the same time, the one added first is selected first."
    },

    sjf: {
        name: "Shortest Job First",
        shortName: "SJF",
        description: "The available process with the shortest burst time is executed first.",
        icon: "⚡",
        method: "Shortest burst time",
        sideText: "SJF selects the available process with the smallest burst time.",
        tip: "SJF only considers processes that have already arrived. It does not interrupt a running process."
    },

    priority: {
        name: "Priority Scheduling",
        shortName: "PRIORITY",
        description: "The available process with the highest priority is executed first.",
        icon: "✦",
        method: "Priority number",
        sideText: "Priority scheduling selects the available process with the highest priority.",
        tip: "A smaller priority number means a higher priority. For example, priority 1 is higher than priority 3."
    }
};

// CUSTOM POPUP
function SamyangPopup(SamyangTitle, SamyangMessage, SamyangType = "info", SamyangInput = null) {
    return new Promise(function (resolve) {
        const SamyangOverlay = document.createElement("div");
        SamyangOverlay.className = "popup-overlay";

        const SamyangBox = document.createElement("div");
        SamyangBox.className = "popup-box";

        const SamyangIcons = {
            info: "✦",
            success: "✓",
            warning: "!",
            question: "?",
            input: "✎"
        };

        const SamyangIcon = document.createElement("div");
        SamyangIcon.className = "popup-icon";
        SamyangIcon.textContent = SamyangIcons[SamyangType] || "✦";

        const SamyangHeading = document.createElement("h2");
        SamyangHeading.className = "popup-title";
        SamyangHeading.textContent = SamyangTitle;

        const SamyangText = document.createElement("p");
        SamyangText.className = "popup-message";
        SamyangText.textContent = SamyangMessage;

        SamyangBox.appendChild(SamyangIcon);
        SamyangBox.appendChild(SamyangHeading);
        SamyangBox.appendChild(SamyangText);

        let SamyangInputElement = null;

        if (SamyangInput !== null) {
            SamyangInputElement = document.createElement("input");
            SamyangInputElement.className = "popup-input";
            SamyangInputElement.value = SamyangInput;
            SamyangInputElement.type = "text";

            SamyangBox.appendChild(SamyangInputElement);
        }

        const SamyangActions = document.createElement("div");
        SamyangActions.className = "popup-actions";

        const SamyangCancel = document.createElement("button");
        SamyangCancel.className = "popup-cancel";
        SamyangCancel.textContent = SamyangType === "info" ||
            SamyangType === "success" ||
            SamyangType === "warning" ? "CLOSE" : "CANCEL";

        const SamyangConfirm = document.createElement("button");
        SamyangConfirm.className = "popup-confirm";
        SamyangConfirm.textContent = SamyangType === "question" ? "CONFIRM" :
            SamyangType === "input" ? "SAVE" : "OK";

        SamyangActions.appendChild(SamyangCancel);

        if (SamyangType === "question" || SamyangType === "input") {
            SamyangActions.appendChild(SamyangConfirm);
        } else {
            SamyangCancel.classList.add("popup-confirm");
        }

        SamyangBox.appendChild(SamyangActions);
        SamyangOverlay.appendChild(SamyangBox);
        document.body.appendChild(SamyangOverlay);

        function SamyangClose(SamyangValue) {
            SamyangOverlay.remove();
            resolve(SamyangValue);
        }

        SamyangCancel.addEventListener("click", function () {
            SamyangClose(SamyangType === "input" ? null : false);
        });

        SamyangConfirm.addEventListener("click", function () {
            if (SamyangType === "input") {
                SamyangClose(SamyangInputElement.value);
            } else {
                SamyangClose(true);
            }
        });

        SamyangOverlay.addEventListener("click", function (event) {
            if (event.target === SamyangOverlay) {
                SamyangClose(SamyangType === "input" ? null : false);
            }
        });

        if (SamyangInputElement) {
            SamyangInputElement.focus();
            SamyangInputElement.select();

            SamyangInputElement.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    SamyangClose(SamyangInputElement.value);
                }
            });
        }

        if (SamyangType !== "question" && SamyangType !== "input") {
            SamyangCancel.focus();
        }
    });
}

// SAVE PROCESSES
function SamyangSaveProcesses() {
    localStorage.setItem("cpuLabProcesses", JSON.stringify(SamyangProcesses));
}

// SET UP THEME
function SamyangSetupTheme() {
    const SamyangThemeButton = document.getElementById("themeToggle");

    if (!SamyangThemeButton) return;

    const SamyangSavedTheme = localStorage.getItem("cpuTheme");

    if (SamyangSavedTheme === "dark") {
        document.body.classList.add("dark");
        SamyangThemeButton.textContent = "☾";
    } else {
        document.body.classList.remove("dark");
        SamyangThemeButton.textContent = "☀";
    }

    SamyangThemeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark");

        const SamyangIsDark = document.body.classList.contains("dark");

        localStorage.setItem("cpuTheme", SamyangIsDark ? "dark" : "light");
        SamyangThemeButton.textContent = SamyangIsDark ? "☾" : "☀";
    });
}

// SET UP SIMULATOR
function SamyangSetupSimulator() {
    if (!SamyangAlgorithms[SamyangAlgorithm]) {
        SamyangAlgorithm = "fcfs";
    }

    const SamyangInfo = SamyangAlgorithms[SamyangAlgorithm];

    document.title = "PLACEHOLDER | " + SamyangInfo.shortName;

    document.getElementById("algorithmTitle").textContent = SamyangInfo.name;
    document.getElementById("algorithmDescription").textContent = SamyangInfo.description;
    document.getElementById("selectedAlgorithm").textContent = SamyangInfo.shortName;

    document.getElementById("sideAlgorithmIcon").textContent = SamyangInfo.icon;
    document.getElementById("sideAlgorithmName").textContent = SamyangInfo.shortName;
    document.getElementById("sideAlgorithmText").textContent = SamyangInfo.sideText;
    document.getElementById("selectionMethod").textContent = SamyangInfo.method;
    document.getElementById("sideTip").textContent = SamyangInfo.tip;

    if (SamyangAlgorithm === "priority") {
        document.getElementById("priorityGroup").classList.remove("hidden");
        document.querySelectorAll(".priority-column").forEach(function (element) {
            element.classList.remove("hidden");
        });
    }

    document.getElementById("addProcessButton").addEventListener("click", SamyangAddProcess);
    document.getElementById("clearProcessesButton").addEventListener("click", SamyangClearProcesses);
    document.getElementById("runSimulationButton").addEventListener("click", SamyangRunSimulation);

    document.getElementById("backToSimulatorButton").addEventListener("click", SamyangBackToSimulator);
    document.getElementById("runAgainButton").addEventListener("click", SamyangBackToSimulator);

    // ENTER TO ADD
    ["processID", "arrivalTime", "burstTime", "priority"].forEach(function (id) {
        const SamyangInput = document.getElementById(id);

        if (SamyangInput) {
            SamyangInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    SamyangAddProcess();
                }
            });
        }
    });

    SamyangRenderProcessTable();
}

// ADD PROCESS
async function SamyangAddProcess() {
    const SamyangID = document.getElementById("processID").value.trim();
    const SamyangArrival = document.getElementById("arrivalTime").value;
    const SamyangBurst = document.getElementById("burstTime").value;
    const SamyangPriorityInput = document.getElementById("priority").value;

    if (!SamyangID || SamyangArrival === "" || SamyangBurst === "") {
        await SamyangPopup("Missing Information", "Please fill in the Process ID, Arrival Time, and Burst Time.", "warning");
        return;
    }

    if (Number(SamyangArrival) < 0 || Number(SamyangBurst) <= 0 ||
        !Number.isFinite(Number(SamyangArrival)) ||
        !Number.isFinite(Number(SamyangBurst))) {
        await SamyangPopup("Invalid Values", "Arrival time must be 0 or higher, and burst time must be greater than 0.", "warning");
        return;
    }

    if (SamyangProcesses.some(function (process) {
        return process.id.toLowerCase() === SamyangID.toLowerCase();
    })) {
        await SamyangPopup("Duplicate Process", "That Process ID already exists. Please use another ID.", "warning");
        return;
    }

    let SamyangPriorityValue = null;

    if (SamyangAlgorithm === "priority") {
        if (SamyangPriorityInput === "" || Number(SamyangPriorityInput) < 1 ||
            !Number.isInteger(Number(SamyangPriorityInput))) {
            await SamyangPopup("Priority Required", "Please enter a whole-number priority of 1 or higher.", "warning");
            return;
        }

        SamyangPriorityValue = Number(SamyangPriorityInput);
    }

    SamyangProcesses.push({
        id: SamyangID,
        arrival: Number(SamyangArrival),
        burst: Number(SamyangBurst),
        priority: SamyangPriorityValue
    });

    SamyangSaveProcesses();
    SamyangRenderProcessTable();

    document.getElementById("processID").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
    document.getElementById("priority").value = "";
    document.getElementById("processID").focus();

    await SamyangPopup("Process Added!", SamyangID + " has been added to your process queue.", "success");
}

// REMOVE PROCESS
async function SamyangRemoveProcess(SamyangIndex) {
    const SamyangProcess = SamyangProcesses[SamyangIndex];

    const SamyangConfirmed = await SamyangPopup(
        "Remove Process?",
        "Do you want to remove " + SamyangProcess.id + " from the queue?",
        "question"
    );

    if (!SamyangConfirmed) return;

    SamyangProcesses.splice(SamyangIndex, 1);

    SamyangSaveProcesses();
    SamyangRenderProcessTable();
}

// SET PRIORITY
async function SamyangSetPriority(SamyangIndex) {
    const SamyangProcess = SamyangProcesses[SamyangIndex];

    const SamyangNewPriority = await SamyangPopup(
        "Set Process Priority",
        "Enter a priority for " + SamyangProcess.id + ". A smaller number means higher priority.",
        "input",
        SamyangProcess.priority ?? 1
    );

    if (SamyangNewPriority === null) return;

    if (SamyangNewPriority.trim() === "" ||
        !Number.isInteger(Number(SamyangNewPriority)) ||
        Number(SamyangNewPriority) < 1) {
        await SamyangPopup("Invalid Priority", "Priority must be a whole number of 1 or higher.", "warning");
        return;
    }

    SamyangProcess.priority = Number(SamyangNewPriority);

    SamyangSaveProcesses();
    SamyangRenderProcessTable();

    await SamyangPopup("Priority Updated!", SamyangProcess.id + " now has priority " + SamyangProcess.priority + ".", "success");
}

// CLEAR ALL PROCESSES
async function SamyangClearProcesses() {
    if (SamyangProcesses.length === 0) {
        await SamyangPopup("Queue Is Empty", "There are no processes to clear.", "info");
        return;
    }

    const SamyangConfirmed = await SamyangPopup(
        "Clear All Processes?",
        "This will remove every process from your queue.",
        "question"
    );

    if (!SamyangConfirmed) return;

    SamyangProcesses = [];

    SamyangSaveProcesses();
    SamyangRenderProcessTable();

    await SamyangPopup("Queue Cleared", "All processes have been removed.", "success");
}

// DISPLAY PROCESS TABLE
function SamyangRenderProcessTable() {
    const SamyangTable = document.getElementById("processTable");
    const SamyangCount = document.getElementById("processCount");

    SamyangTable.innerHTML = "";

    SamyangCount.textContent = SamyangProcesses.length +
        (SamyangProcesses.length === 1 ? " PROCESS" : " PROCESSES");

    if (SamyangProcesses.length === 0) {
        const SamyangRow = document.createElement("tr");
        const SamyangCell = document.createElement("td");

        SamyangCell.colSpan = SamyangAlgorithm === "priority" ? 5 : 4;
        SamyangCell.className = "empty-table";
        SamyangCell.textContent = "No processes added yet.";

        SamyangRow.appendChild(SamyangCell);
        SamyangTable.appendChild(SamyangRow);
        return;
    }

    SamyangProcesses.forEach(function (process, index) {
        const SamyangRow = document.createElement("tr");

        const SamyangIDCell = document.createElement("td");
        const SamyangIDPill = document.createElement("span");

        SamyangIDPill.className = "process-pill";
        SamyangIDPill.textContent = process.id;
        SamyangIDCell.appendChild(SamyangIDPill);

        const SamyangArrivalCell = document.createElement("td");
        SamyangArrivalCell.textContent = process.arrival;

        const SamyangBurstCell = document.createElement("td");
        SamyangBurstCell.textContent = process.burst;

        SamyangRow.appendChild(SamyangIDCell);
        SamyangRow.appendChild(SamyangArrivalCell);
        SamyangRow.appendChild(SamyangBurstCell);

        if (SamyangAlgorithm === "priority") {
            const SamyangPriorityCell = document.createElement("td");
            const SamyangPriorityButton = document.createElement("button");

            SamyangPriorityButton.className = "text-button";
            SamyangPriorityButton.textContent =
                process.priority === null ? "Set priority" : process.priority;

            SamyangPriorityButton.addEventListener("click", function () {
                SamyangSetPriority(index);
            });

            SamyangPriorityCell.appendChild(SamyangPriorityButton);
            SamyangRow.appendChild(SamyangPriorityCell);
        }

        const SamyangActionCell = document.createElement("td");
        const SamyangRemoveButton = document.createElement("button");

        SamyangRemoveButton.className = "remove-button";
        SamyangRemoveButton.textContent = "×";
        SamyangRemoveButton.title = "Remove process";

        SamyangRemoveButton.addEventListener("click", function () {
            SamyangRemoveProcess(index);
        });

        SamyangActionCell.appendChild(SamyangRemoveButton);
        SamyangRow.appendChild(SamyangActionCell);

        SamyangTable.appendChild(SamyangRow);
    });
}

// RUN SIMULATION
async function SamyangRunSimulation() {
    if (SamyangProcesses.length === 0) {
        await SamyangPopup("No Processes Found", "Add at least one process before running the simulation.", "warning");
        return;
    }

    if (SamyangAlgorithm === "priority" &&
        SamyangProcesses.some(function (process) {
            return process.priority === null || process.priority === undefined;
        })) {
        await SamyangPopup("Priority Missing", "Please set a priority for every process before running the simulation.", "warning");
        return;
    }

    SamyangSchedule = SamyangScheduleProcesses();
    SamyangResults = SamyangCalculateResults(SamyangSchedule);

    SamyangDisplayResults();

    document.getElementById("simulatorView").classList.add("hidden");
    document.getElementById("resultsView").classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// SCHEDULE PROCESSES
function SamyangScheduleProcesses() {
    let SamyangRemaining = SamyangProcesses.map(function (process, index) {
        return {
            ...process,
            originalIndex: index
        };
    });

    let SamyangTimeline = [];
    let SamyangCurrentTime = 0;

    while (SamyangRemaining.length > 0) {
        const SamyangAvailable = SamyangRemaining.filter(function (process) {
            return process.arrival <= SamyangCurrentTime;
        });

        if (SamyangAvailable.length === 0) {
            const SamyangNextArrival = Math.min.apply(
                null,
                SamyangRemaining.map(function (process) {
                    return process.arrival;
                })
            );

            SamyangTimeline.push({
                id: "Idle",
                start: SamyangCurrentTime,
                end: SamyangNextArrival,
                idle: true
            });

            SamyangCurrentTime = SamyangNextArrival;
            continue;
        }

        // CHOOSE NEXT PROCESS
        SamyangAvailable.sort(function (a, b) {
            if (SamyangAlgorithm === "sjf") {
                return a.burst - b.burst ||
                    a.arrival - b.arrival ||
                    a.originalIndex - b.originalIndex;
            }

            if (SamyangAlgorithm === "priority") {
                return a.priority - b.priority ||
                    a.arrival - b.arrival ||
                    a.originalIndex - b.originalIndex;
            }

            return a.arrival - b.arrival ||
                a.originalIndex - b.originalIndex;
        });

        const SamyangSelected = SamyangAvailable[0];
        const SamyangStart = SamyangCurrentTime;
        const SamyangEnd = SamyangStart + SamyangSelected.burst;

        SamyangTimeline.push({
            id: SamyangSelected.id,
            arrival: SamyangSelected.arrival,
            burst: SamyangSelected.burst,
            priority: SamyangSelected.priority,
            start: SamyangStart,
            end: SamyangEnd,
            idle: false
        });

        SamyangCurrentTime = SamyangEnd;

        SamyangRemaining = SamyangRemaining.filter(function (process) {
            return process.originalIndex !== SamyangSelected.originalIndex;
        });
    }

    return SamyangTimeline;
}

// CALCULATE RESULTS
function SamyangCalculateResults(SamyangTimeline) {
    let SamyangFinalResults = [];

    SamyangTimeline.forEach(function (block) {
        if (block.idle) return;

        const SamyangCompletion = block.end;
        const SamyangTurnaround = SamyangCompletion - block.arrival;
        const SamyangWaiting = SamyangTurnaround - block.burst;

        SamyangFinalResults.push({
            id: block.id,
            arrival: block.arrival,
            burst: block.burst,
            completion: SamyangCompletion,
            turnaround: SamyangTurnaround,
            waiting: SamyangWaiting
        });
    });

    return SamyangFinalResults;
}

// DISPLAY RESULTS
function SamyangDisplayResults() {
    const SamyangResultsTable = document.getElementById("resultsTable");
    const SamyangGanttChart = document.getElementById("ganttChart");

    SamyangResultsTable.innerHTML = "";
    SamyangGanttChart.innerHTML = "";

    document.getElementById("resultsAlgorithm").textContent =
        SamyangAlgorithms[SamyangAlgorithm].shortName;

    const SamyangColors = [
        "linear-gradient(135deg, #9a68e8, #c078dc)",
        "linear-gradient(135deg, #e66fa9, #f49bc0)",
        "linear-gradient(135deg, #38afc5, #64c9d7)",
        "linear-gradient(135deg, #e8a84c, #f2c66f)",
        "linear-gradient(135deg, #8264d6, #a68ae8)"
    ];

    SamyangSchedule.forEach(function (block, index) {
        const SamyangItem = document.createElement("div");

        SamyangItem.className = "gantt-item" + (block.idle ? " idle" : "");

        if (!block.idle) {
            SamyangItem.style.background =
                SamyangColors[index % SamyangColors.length];
        }

        SamyangItem.style.flex = (block.end - block.start) + " 1 0";
        SamyangItem.style.animationDelay = (index * 0.12) + "s";

        const SamyangName = document.createElement("strong");
        SamyangName.textContent = block.id;

        const SamyangDuration = document.createElement("small");
        SamyangDuration.textContent =
            (block.end - block.start) + " unit" +
            (block.end - block.start === 1 ? "" : "s");

        const SamyangTimes = document.createElement("div");
        SamyangTimes.className = "gantt-times";

        const SamyangStart = document.createElement("span");
        SamyangStart.textContent = block.start;

        const SamyangEnd = document.createElement("span");
        SamyangEnd.textContent = block.end;

        SamyangTimes.appendChild(SamyangStart);
        SamyangTimes.appendChild(SamyangEnd);

        SamyangItem.appendChild(SamyangName);
        SamyangItem.appendChild(SamyangDuration);
        SamyangItem.appendChild(SamyangTimes);

        SamyangGanttChart.appendChild(SamyangItem);
    });

    // DISPLAY RESULTS TABLE
    SamyangResults.forEach(function (result, index) {
        const SamyangRow = document.createElement("tr");
        SamyangRow.style.animationDelay = (index * 0.1) + "s";

        const SamyangValues = [
            result.id,
            result.arrival,
            result.burst,
            result.completion,
            result.turnaround,
            result.waiting
        ];

        SamyangValues.forEach(function (value, cellIndex) {
            const SamyangCell = document.createElement("td");

            if (cellIndex === 0) {
                const SamyangPill = document.createElement("span");
                SamyangPill.className = "process-pill";
                SamyangPill.textContent = value;
                SamyangCell.appendChild(SamyangPill);
            } else {
                SamyangCell.textContent = value;
            }

            SamyangRow.appendChild(SamyangCell);
        });

        SamyangResultsTable.appendChild(SamyangRow);
    });

    // DISPLAY AVERAGES
    const SamyangTotalWaiting = SamyangResults.reduce(function (total, result) {
        return total + result.waiting;
    }, 0);

    const SamyangTotalTurnaround = SamyangResults.reduce(function (total, result) {
        return total + result.turnaround;
    }, 0);

    const SamyangTotalBurst = SamyangProcesses.reduce(function (total, process) {
        return total + process.burst;
    }, 0);

    document.getElementById("averageWaiting").textContent =
        (SamyangTotalWaiting / SamyangResults.length).toFixed(2);

    document.getElementById("averageTurnaround").textContent =
        (SamyangTotalTurnaround / SamyangResults.length).toFixed(2);

    document.getElementById("totalBurst").textContent = SamyangTotalBurst;
}

// BACK TO SIMULATOR
function SamyangBackToSimulator() {
    document.getElementById("resultsView").classList.add("hidden");
    document.getElementById("simulatorView").classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// START EVERYTHING
SamyangSetupTheme();

if (document.getElementById("simulatorView")) {
    SamyangSetupSimulator();
}