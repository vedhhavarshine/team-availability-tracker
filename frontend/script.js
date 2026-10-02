let teamMembers = [];

async function loadTeam() {

    try {

        const response = await fetch("/api/team");

        if (!response.ok) {
            throw new Error("Could not load team.");
        }

        teamMembers = await response.json();

        renderTeam();
        updateSummary();

        document.getElementById("lastUpdated").textContent =
            `Last updated: ${new Date().toLocaleTimeString()}`;

    } catch (error) {

        console.error(error);

        document.getElementById("teamGrid").innerHTML = `
            <div class="empty-state">
                Could not load team members.
                Please make sure the backend is running.
            </div>
        `;
    }
}


function renderTeam() {

    const grid = document.getElementById("teamGrid");

    const searchTerm =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const selectedStatus =
        document.getElementById("statusFilter").value;

    const filteredMembers = teamMembers.filter((member) => {

        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm) ||
            member.role.toLowerCase().includes(searchTerm);

        const matchesStatus =
            selectedStatus === "All" ||
            member.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });


    if (filteredMembers.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                No team members match your search.
            </div>
        `;

        return;
    }


    grid.innerHTML = filteredMembers.map((member) => {

        const statusClass =
            member.status.toLowerCase();

        return `
            <article class="team-card">

                <div class="member-header">

                    <div>

                        <div class="member-name">
                            ${member.name}
                        </div>

                        <div class="member-role">
                            ${member.role}
                        </div>

                    </div>

                    <span class="status-badge status-${statusClass}">
                        ${member.status}
                    </span>

                </div>


                <div class="member-info">

                    <div>
                        🌍 Timezone: ${member.timezone}
                    </div>

                    <div>
                        👤 Member ID: ${member.id}
                    </div>

                </div>


                <div class="status-controls">

                    <button
                        class="status-btn available ${
                            member.status === "Available"
                                ? "active"
                                : ""
                        }"
                        onclick="updateStatus(${member.id}, 'Available')"
                    >
                        Available
                    </button>

                    <button
                        class="status-btn busy ${
                            member.status === "Busy"
                                ? "active"
                                : ""
                        }"
                        onclick="updateStatus(${member.id}, 'Busy')"
                    >
                        Busy
                    </button>

                    <button
                        class="status-btn away ${
                            member.status === "Away"
                                ? "active"
                                : ""
                        }"
                        onclick="updateStatus(${member.id}, 'Away')"
                    >
                        Away
                    </button>

                </div>

            </article>
        `;

    }).join("");
}


async function updateStatus(id, status) {

    try {

        const response = await fetch(
            `/api/team/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.error);

            return;
        }


        await loadTeam();

    } catch (error) {

        console.error(error);

        alert("Could not update team member status.");
    }
}


function updateSummary() {

    document.getElementById("availableCount").textContent =
        teamMembers.filter(
            member => member.status === "Available"
        ).length;

    document.getElementById("busyCount").textContent =
        teamMembers.filter(
            member => member.status === "Busy"
        ).length;

    document.getElementById("awayCount").textContent =
        teamMembers.filter(
            member => member.status === "Away"
        ).length;

    document.getElementById("totalCount").textContent =
        teamMembers.length;
}


document
    .getElementById("searchInput")
    .addEventListener("input", renderTeam);


document
    .getElementById("statusFilter")
    .addEventListener("change", renderTeam);


loadTeam();


setInterval(loadTeam, 3000);