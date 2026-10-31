// CPU SCHEDULING SIMULATOR

let SamyangProcesses = JSON.parse(localStorage.getItem("cpuLabProcesses")) || [];
let SamyangSchedule = [];
let SamyangResults = [];

const SamyangAlgorithm =
    new URLSearchParams(window.location.search).get("algorithm") || "fcfs";

const SamyangAlgorithmNames = {
    fcfs: "First Come, First Served (FCFS)",
    sjf: "Shortest Job First (SJF)",
    priority: "Priority Scheduling"
};


// THEME

function SamyangSetupTheme() {
    const isDark = localStorage.getItem("cpuTheme") === "dark";

    document.body.dataset.theme = isDark ? "dark" : "light";
    SamyangUpdateThemeButton();

    const button = document.getElementById("themeToggle");

    if (button) {
        button.onclick = SamyangToggleTheme;
    }
}

function SamyangToggleTheme() {
    const isDark = document.body.dataset.theme !== "dark";

    document.body.dataset.theme = isDark ? "dark" : "light";
    localStorage.setItem("cpuTheme", isDark ? "dark" : "light");

    SamyangUpdateThemeButton();
}

function SamyangUpdateThemeButton() {
    const button = document.getElementById("themeToggle");

    if (!button) return;

    button.textContent =
        document.body.dataset.theme === "dark" ? "☀" : "☾";
}

window.toggleTheme = SamyangToggleTheme;


// LOADING SCREEN

function SamyangShowLoading(message, callback) {
    const overlay = document.getElementById("loadingOverlay");

    if (!overlay) {
        if (callback) callback();
        return;
    }

    const loadingText = document.getElementById("loadingText");

    if (loadingText) {
        loadingText.textContent = message;
    }

    overlay.classList.remove("hidden");

    setTimeout(() => {
        if (callback) callback();
    }, 900);
}

function SamyangHideLoading() {
    const overlay = document.getElementById("loadingOverlay");

    if (overlay) {
        overlay.classList.add("hidden");
    }
}


// HOME PAGE

function SamyangSetupHomePage() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const algorithmSelection = document.getElementById("algorithmSelection");

    if (!welcomeScreen || !algorithmSelection) return;

    const getStartedButton = document.getElementById("getStartedButton");
    const backButton = document.getElementById("backToWelcomeButton");
    const algorithmCards = document.querySelectorAll(".algorithm-card");

    // OPEN ALGORITHM SELECTION DIRECTLY WHEN RETURNING FROM RESULTS

    const parameters = new URLSearchParams(window.location.search);
    const openSelection = parameters.get("select") === "1";

    if (openSelection) {
        welcomeScreen.classList.add("hidden");
        algorithmSelection.classList.remove("hidden");
    }

    if (getStartedButton) {
        getStartedButton.onclick = () => {
            SamyangShowLoading("Preparing simulation options...", () => {
                welcomeScreen.classList.add("hidden");
                algorithmSelection.classList.remove("hidden");
                SamyangHideLoading();
            });
        };
    }

    if (backButton) {
        backButton.onclick = () => {
            algorithmSelection.classList.add("hidden");
            welcomeScreen.classList.remove("hidden");
        };
    }

    algorithmCards.forEach(card => {
        card.onclick = event => {
            event.preventDefault();

            const destination = card.getAttribute("href");

            SamyangShowLoading("Opening simulator...", () => {
                window.location.href = destination;
            });
        };
    });
}


// PROCESS STORAGE

function SamyangSaveProcesses() {
    localStorage.setItem(
        "cpuLabProcesses",
        JSON.stringify(SamyangProcesses)
    );
}


// THEMED MESSAGE POPUP

function SamyangCreateMessagePopup() {
    if (document.getElementById("messagePopup")) return;

    const popup = document.createElement("div");

    popup.id = "messagePopup";
    popup.className = "message-overlay hidden";

    popup.innerHTML = `
        <div class="message-modal"
             role="alertdialog"
             aria-modal="true"
             aria-labelledby="messagePopupTitle"
             aria-describedby="messagePopupText">

            <div class="message-icon">!</div>

            <h2 id="messagePopupTitle">Notice</h2>

            <p id="messagePopupText"></p>

            <button type="button"
                id="messagePopupCloseButton"
                class="message-button">
                Okay
            </button>

        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("messagePopupCloseButton").onclick =
        SamyangCloseMessagePopup;

    popup.onclick = event => {
        if (event.target === popup) {
            SamyangCloseMessagePopup();
        }
    };
}

function SamyangShowMessage(title, message) {
    let popup = document.getElementById("messagePopup");

    if (!popup) {
        SamyangCreateMessagePopup();
        popup = document.getElementById("messagePopup");
    }

    if (!popup) return;

    document.getElementById("messagePopupTitle").textContent = title;
    document.getElementById("messagePopupText").textContent = message;

    popup.classList.remove("hidden");

    document.getElementById("messagePopupCloseButton").focus();
}

function SamyangCloseMessagePopup() {
    const popup = document.getElementById("messagePopup");

    if (popup) {
        popup.classList.add("hidden");
    }
}


// ADD PROCESS

function SamyangAddProcess() {
    const idInput = document.getElementById("processID");
    const arrivalInput = document.getElementById("arrivalTime");
    const burstInput = document.getElementById("burstTime");
    const priorityInput = document.getElementById("priority");

    if (!idInput || !arrivalInput || !burstInput) {
        console.error("Process input fields could not be found.");
        return;
    }

    const id = idInput.value.trim();
    const arrivalText = arrivalInput.value.trim();
    const burstText = burstInput.value.trim();

    const arrival = Number(arrivalText);
    const burst = Number(burstText);

    let priority = 0;

    // CHECK PRIORITY FIRST

    if (priorityInput && SamyangAlgorithm === "priority") {
        const priorityText = priorityInput.value.trim();

        if (priorityText === "") {
            SamyangShowMessage(
                "Priority Required",
                "Please enter a priority value."
            );

            priorityInput.focus();
            return;
        }

        priority = Number(priorityText);

        if (!Number.isFinite(priority)) {
            SamyangShowMessage(
                "Invalid Priority",
                "Please enter a valid priority number."
            );

            priorityInput.focus();
            return;
        }
    }

    // CHECK REQUIRED FIELDS

    if (id === "" || arrivalText === "" || burstText === "") {
        SamyangShowMessage(
            "Missing Information",
            "Please complete the required fields."
        );

        if (id === "") {
            idInput.focus();
        } else if (arrivalText === "") {
            arrivalInput.focus();
        } else {
            burstInput.focus();
        }

        return;
    }

    // CHECK NUMERIC VALUES

    if (
        !Number.isFinite(arrival) ||
        !Number.isFinite(burst) ||
        arrival < 0 ||
        burst <= 0
    ) {
        SamyangShowMessage(
            "Invalid Process Values",
            "Arrival time must be 0 or higher, and burst time must be greater than 0."
        );

        return;
    }

    // CHECK DUPLICATE PROCESS ID

    const duplicate = SamyangProcesses.some(process =>
        process.id.toLowerCase() === id.toLowerCase()
    );

    if (duplicate) {
        SamyangShowMessage(
            "Duplicate Process ID",
            "That Process ID already exists."
        );

        idInput.focus();
        return;
    }

    // ADD NEW PROCESS

    const newProcess = {
        id: id,
        arrival: arrival,
        burst: burst,
        priority: priority,
        order: SamyangProcesses.length
    };

    SamyangProcesses.push(newProcess);

    SamyangSaveProcesses();
    SamyangRenderProcessTable();

    idInput.value = "";
    arrivalInput.value = "";
    burstInput.value = "";

    if (priorityInput) {
        priorityInput.value = "";
    }

    idInput.focus();
}

window.addProcess = SamyangAddProcess;


// REMOVE PROCESS

function SamyangRemoveProcess(index) {
    if (index < 0 || index >= SamyangProcesses.length) return;

    SamyangProcesses.splice(index, 1);

    SamyangProcesses.forEach((process, i) => {
        process.order = i;
    });

    SamyangSaveProcesses();
    SamyangRenderProcessTable();
}

window.SamyangRemoveProcess = SamyangRemoveProcess;


// CLEAR ALL POPUP

function SamyangCreateClearPopup() {
    if (document.getElementById("clearConfirmPopup")) return;

    const popup = document.createElement("div");

    popup.id = "clearConfirmPopup";
    popup.className = "confirm-overlay hidden";

    popup.innerHTML = `
        <div class="confirm-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="confirmTitle">

            <div class="confirm-icon">!</div>

            <h2 id="confirmTitle">Clear all processes?</h2>

            <p>
                This will remove all processes from your queue.
                This action cannot be undone.
            </p>

            <div class="confirm-actions">

                <button type="button"
                    id="cancelClearButton"
                    class="confirm-button">
                    Cancel
                </button>

                <button type="button"
                    id="confirmClearButton"
                    class="confirm-button confirm-danger">
                    Clear All
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("cancelClearButton").onclick =
        SamyangCloseClearPopup;

    document.getElementById("confirmClearButton").onclick =
        SamyangConfirmClearProcesses;

    popup.onclick = event => {
        if (event.target === popup) {
            SamyangCloseClearPopup();
        }
    };
}

function SamyangOpenClearPopup() {
    if (SamyangProcesses.length === 0) return;

    const popup = document.getElementById("clearConfirmPopup");

    if (!popup) return;

    popup.classList.remove("hidden");

    document.getElementById("cancelClearButton").focus();
}

function SamyangCloseClearPopup() {
    const popup = document.getElementById("clearConfirmPopup");

    if (popup) {
        popup.classList.add("hidden");
    }
}

function SamyangConfirmClearProcesses() {
    SamyangProcesses = [];

    SamyangSaveProcesses();
    SamyangRenderProcessTable();

    SamyangCloseClearPopup();
}

function SamyangClearProcesses() {
    SamyangOpenClearPopup();
}


// HTML PROTECTION

function SamyangEscapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// PROCESS TABLE

function SamyangRenderProcessTable() {
    const tableBody = document.getElementById("processTableBody");
    const emptyMessage = document.getElementById("emptyProcessMessage");
    const processCount = document.getElementById("processCount");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const isPriority = SamyangAlgorithm === "priority";

    if (processCount) {
        processCount.textContent =
            SamyangProcesses.length +
            (SamyangProcesses.length === 1 ? " process" : " processes");
    }

    if (emptyMessage) {
        emptyMessage.classList.toggle(
            "hidden",
            SamyangProcesses.length > 0
        );
    }

    document.querySelectorAll(".priority-column").forEach(header => {
        header.classList.toggle("hidden", !isPriority);
    });

    SamyangProcesses.forEach((process, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${SamyangEscapeHTML(process.id)}</td>
            <td>${process.arrival}</td>
            <td>${process.burst}</td>
            <td class="${isPriority ? "" : "hidden"}">
                ${process.priority ?? 0}
            </td>
            <td>
                <button type="button"
                    class="text-button danger-text"
                    onclick="SamyangRemoveProcess(${index})">
                    Remove
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// SCHEDULING LOGIC

function SamyangScheduleProcesses(algorithm) {
    let remaining = [...SamyangProcesses];
    let currentTime = 0;

    SamyangSchedule = [];

    while (remaining.length > 0) {
        const available = remaining.filter(
            process => process.arrival <= currentTime
        );

        // CPU IDLE TIME

        if (available.length === 0) {
            const nextArrival = Math.min(
                ...remaining.map(process => process.arrival)
            );

            SamyangSchedule.push({
                id: "Idle",
                start: currentTime,
                end: nextArrival,
                idle: true
            });

            currentTime = nextArrival;
            continue;
        }

        let selected;

        // FCFS

        if (algorithm === "fcfs") {
            selected = available.sort((a, b) =>
                a.arrival - b.arrival ||
                a.order - b.order
            )[0];
        }

        // SJF

        else if (algorithm === "sjf") {
            selected = available.sort((a, b) =>
                a.burst - b.burst ||
                a.arrival - b.arrival ||
                a.order - b.order
            )[0];
        }

        // PRIORITY

        else {
            selected = available.sort((a, b) =>
                a.priority - b.priority ||
                a.arrival - b.arrival ||
                a.order - b.order
            )[0];
        }

        const start = currentTime;
        const end = start + selected.burst;

        SamyangSchedule.push({
            id: selected.id,
            start: start,
            end: end,
            idle: false
        });

        currentTime = end;

        remaining = remaining.filter(
            process => process !== selected
        );
    }
}


// CALCULATE RESULTS

function SamyangCalculateResults() {
    SamyangResults = SamyangProcesses.map(process => {
        const scheduled = SamyangSchedule.find(
            item => item.id === process.id
        );

        const completion = scheduled.end;
        const turnaround = completion - process.arrival;
        const waiting = turnaround - process.burst;

        return {
            ...process,
            completion: completion,
            turnaround: turnaround,
            waiting: waiting
        };
    });
}


// RUN SIMULATION

function SamyangRunSimulation() {
    if (SamyangProcesses.length === 0) {
        SamyangShowMessage(
            "No Processes Added",
            "Please add at least one process before running the simulation."
        );

        return;
    }

    SamyangShowLoading(
        "Running CPU scheduling simulation...",
        () => {
            SamyangScheduleProcesses(SamyangAlgorithm);
            SamyangCalculateResults();

            SamyangDisplaySimulatorResults(SamyangAlgorithm);

            const simulatorView = document.getElementById("simulatorView");
            const resultsView = document.getElementById("resultsView");

            if (simulatorView) {
                simulatorView.classList.add("hidden");
            }

            if (resultsView) {
                resultsView.classList.remove("hidden");
            }

            window.scrollTo({ top: 0, behavior: "smooth" });

            SamyangHideLoading();
        }
    );
}

window.runSimulation = SamyangRunSimulation;


// DISPLAY RESULTS

function SamyangDisplaySimulatorResults(algorithm) {
    const resultsAlgorithm = document.getElementById("resultsAlgorithm");

    if (resultsAlgorithm) {
        resultsAlgorithm.textContent =
            SamyangAlgorithmNames[algorithm] || algorithm.toUpperCase();
    }

    const totalWaiting = SamyangResults.reduce(
        (sum, process) => sum + process.waiting,
        0
    );

    const totalTurnaround = SamyangResults.reduce(
        (sum, process) => sum + process.turnaround,
        0
    );

    const totalBurst = SamyangResults.reduce(
        (sum, process) => sum + process.burst,
        0
    );

    const averageWaiting = document.getElementById("averageWaiting");
    const averageTurnaround = document.getElementById("averageTurnaround");
    const totalBurstElement = document.getElementById("totalBurst");

    if (averageWaiting) {
        averageWaiting.textContent =
            (totalWaiting / SamyangResults.length).toFixed(2);
    }

    if (averageTurnaround) {
        averageTurnaround.textContent =
            (totalTurnaround / SamyangResults.length).toFixed(2);
    }

    if (totalBurstElement) {
        totalBurstElement.textContent = totalBurst;
    }

    SamyangRenderResultsTable();
    SamyangRenderGanttChart();
}


// RESULTS TABLE

function SamyangRenderResultsTable() {
    const tableBody = document.getElementById("resultsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    SamyangResults.forEach(process => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="result-process">
                ${SamyangEscapeHTML(process.id)}
            </td>

            <td>${process.arrival}</td>
            <td>${process.burst}</td>

            <td>
                <span class="result-number result-completion">
                    ${process.completion}
                </span>
            </td>

            <td>
                <span class="result-number result-turnaround">
                    ${process.turnaround}
                </span>
            </td>

            <td>
                <span class="result-number result-waiting">
                    ${process.waiting}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// GANTT CHART

function SamyangRenderGanttChart() {
    const chart = document.getElementById("ganttChart");

    if (!chart) return;

    chart.innerHTML = "";

    if (SamyangSchedule.length === 0) return;

    let processColorIndex = 0;

    SamyangSchedule.forEach(item => {
        const duration = item.end - item.start;
        const block = document.createElement("div");

        if (item.idle) {
            block.className = "gantt-block idle";
        } else {
            block.className =
                `gantt-block process-${processColorIndex % 6}`;

            processColorIndex++;
        }

        block.style.flexGrow = Math.max(duration, 1);
        block.style.flexShrink = "0";
        block.style.flexBasis = "0px";

        const processName = document.createElement("strong");
        processName.textContent = item.id;

        const time = document.createElement("div");
        time.className = "gantt-time";
        time.textContent = `${item.start} - ${item.end}`;

        block.appendChild(processName);
        block.appendChild(time);

        chart.appendChild(block);
    });
}


// RETURN TO PROCESS PAGE

function SamyangBackToSimulator() {
    const resultsView = document.getElementById("resultsView");
    const simulatorView = document.getElementById("simulatorView");

    if (!resultsView || !simulatorView) return;

    resultsView.classList.add("hidden");
    simulatorView.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// RETURN TO ALGORITHM SELECTION

function SamyangGoToAlgorithmSelection() {
    SamyangShowLoading(
        "Returning to algorithm selection...",
        () => {
            window.location.href = "index.html?select=1";
        }
    );
}


// INITIALIZE

document.addEventListener("DOMContentLoaded", () => {

    SamyangSetupTheme();
    SamyangSetupHomePage();
    SamyangCreateClearPopup();
    SamyangCreateMessagePopup();

    const simulatorView = document.getElementById("simulatorView");

    if (!simulatorView) return;

    const details = {
        fcfs: {
            title: "First Come, First Served",
            description: "Processes are executed in the order they arrive.",
            tag: "FCFS"
        },

        sjf: {
            title: "Shortest Job First",
            description: "The available process with the shortest burst time runs first.",
            tag: "SJF"
        },

        priority: {
            title: "Priority Scheduling",
            description: "The available process with the highest priority runs first. A smaller number means higher priority.",
            tag: "PRIORITY"
        }
    };

    const selected = details[SamyangAlgorithm] || details.fcfs;

    const algorithmTitle = document.getElementById("algorithmTitle");
    const algorithmDescription = document.getElementById("algorithmDescription");
    const selectedAlgorithm = document.getElementById("selectedAlgorithm");

    if (algorithmTitle) {
        algorithmTitle.textContent = selected.title;
    }

    if (algorithmDescription) {
        algorithmDescription.textContent = selected.description;
    }

    if (selectedAlgorithm) {
        selectedAlgorithm.textContent = selected.tag;
    }

    const priorityGroup = document.getElementById("priorityGroup");

    if (priorityGroup) {
        priorityGroup.classList.toggle(
            "hidden",
            SamyangAlgorithm !== "priority"
        );
    }

    const addButton = document.getElementById("addProcessButton");
    const runButton = document.getElementById("runSimulationButton");
    const clearButton = document.getElementById("clearProcessesButton");
    const runAgainButton = document.getElementById("runAgainButton");
    const chooseAlgorithmButton = document.getElementById("chooseAlgorithmButton");

    if (addButton) {
        addButton.onclick = SamyangAddProcess;
    }

    if (runButton) {
        runButton.onclick = SamyangRunSimulation;
    }

    if (clearButton) {
        clearButton.onclick = SamyangClearProcesses;
    }

    if (runAgainButton) {
        runAgainButton.onclick = SamyangBackToSimulator;
    }

    if (chooseAlgorithmButton) {
        chooseAlgorithmButton.onclick = SamyangGoToAlgorithmSelection;
    }

    SamyangRenderProcessTable();

    // PRESS ENTER TO ADD A PROCESS

    ["processID", "arrivalTime", "burstTime", "priority"].forEach(id => {
        const input = document.getElementById(id);

        if (input) {
            input.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    SamyangAddProcess();
                }
            });
        }
    });

    // CLOSE POPUPS WITH ESCAPE

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            SamyangCloseMessagePopup();
            SamyangCloseClearPopup();
        }
    });

});