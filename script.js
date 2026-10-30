let processes = [];

function addProcess() {
    let id = document.getElementById("processID").value;
    let arrivalInput = document.getElementById("arrivalTime").value;
    let burstInput = document.getElementById("burstTime").value;

    let arrival = Number(arrivalInput);
    let burst = Number(burstInput);

    if (id.trim() === "" || arrivalInput === "" || burstInput === "" || arrival < 0 || burst <= 0) {
        alert("Please enter valid process information.");
        return;
    }

    if (processes.some(p => p.id === id.trim())) {
        alert("Process ID already exists.");
        return;
    }

    processes.push({
        id: id.trim(),
        arrival: arrival,
        burst: burst
    });

    displayProcesses();

    document.getElementById("processID").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
}

function displayProcesses() {
    let table = document.getElementById("processTable");

    table.innerHTML = "";

    processes.forEach(process => {
        table.innerHTML += `
            <tr>
                <td>${process.id}</td>
                <td>${process.arrival}</td>
                <td>${process.burst}</td>
            </tr>
        `;
    });
}


function runSimulation() {

    if (processes.length === 0) {
        alert("Please add processes first.");
        return;
    }

    let algorithm = document.getElementById("algorithm").value;

    let sortedProcesses = [...processes];

    if (algorithm === "fcfs") {
        sortedProcesses.sort((a, b) => a.arrival - b.arrival);
    }

    let currentTime = 0;
    let remaining = [...sortedProcesses];
    let results = [];
    let gantt = [];

    while (remaining.length > 0) {

        let available = remaining.filter(
            p => p.arrival <= currentTime
        );

        // If no process has arrived, move time forward
        if (available.length === 0) {

            let nextArrival = Math.min(
                ...remaining.map(p => p.arrival)
            );

            gantt.push({
                id: "Idle",
                start: currentTime,
                end: nextArrival
            });

            currentTime = nextArrival;
            continue;
        }

        let selected;

        if (algorithm === "fcfs") {

            selected = available.sort(
                (a, b) => a.arrival - b.arrival
            )[0];

        } else if (algorithm === "sjf") {

            selected = available.sort(
                (a, b) => a.burst - b.burst ||
                          a.arrival - b.arrival
            )[0];
        }

        let startTime = currentTime;
        let completion = currentTime + selected.burst;

        let turnaround = completion - selected.arrival;
        let waiting = turnaround - selected.burst;

        results.push({
            id: selected.id,
            arrival: selected.arrival,
            burst: selected.burst,
            completion: completion,
            turnaround: turnaround,
            waiting: waiting
        });

        gantt.push({
            id: selected.id,
            start: startTime,
            end: completion
        });

        currentTime = completion;

        remaining = remaining.filter(
            p => p !== selected
        );
    }

    displayGantt(gantt);
    displayResults(results);
}

function displayGantt(gantt) {

    let chart = document.getElementById("ganttChart");
    chart.innerHTML = "";

    gantt.forEach(block => {

        let div = document.createElement("div");
        div.className = "gantt-block";

        div.style.flex = block.end - block.start;

        div.innerHTML = `
            <strong>${block.id}</strong>
            <div class="gantt-time">
                ${block.start} - ${block.end}
            </div>
        `;

        chart.appendChild(div);
    });
}

function displayResults(results) {

    let table = document.getElementById("resultsTable");
    table.innerHTML = "";

    let totalWaiting = 0;
    let totalTurnaround = 0;

    results.forEach(process => {

        totalWaiting += process.waiting;
        totalTurnaround += process.turnaround;

        table.innerHTML += `
            <tr>
                <td>${process.id}</td>
                <td>${process.arrival}</td>
                <td>${process.burst}</td>
                <td>${process.completion}</td>
                <td>${process.turnaround}</td>
                <td>${process.waiting}</td>
            </tr>
        `;
    });

    let avgWaiting = totalWaiting / results.length;
    let avgTurnaround = totalTurnaround / results.length;

    document.getElementById("averages").innerHTML =
        `Average Waiting Time: ${avgWaiting.toFixed(2)}
         | Average Turnaround Time: ${avgTurnaround.toFixed(2)}`;
}
