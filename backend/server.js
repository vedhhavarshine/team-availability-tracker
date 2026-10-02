const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// DATABASE
// ==========================================

const dbPath = path.join(__dirname, "team.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// ==========================================
// CREATE TABLE
// ==========================================

db.run(`
    CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL
            CHECK(status IN ('Available', 'Busy', 'Away')),
        timezone TEXT NOT NULL
    )
`, (err) => {

    if (err) {
        console.error("Table creation error:", err.message);
        return;
    }

    console.log("Team members table ready.");

    seedDatabase();
});

// ==========================================
// LOAD SEED DATA
// ==========================================

function seedDatabase() {

    db.get(
        "SELECT COUNT(*) AS count FROM team_members",
        [],
        (err, row) => {

            if (err) {
                console.error(
                    "Could not check database:",
                    err.message
                );
                return;
            }

            if (row.count > 0) {
                console.log(
                    `Database already contains ${row.count} team members.`
                );
                return;
            }

            const seedPath = path.join(
                __dirname,
                "data",
                "team_availability_seed.json"
            );

            try {

                const seedData = JSON.parse(
                    fs.readFileSync(seedPath, "utf8")
                );

                const insert = db.prepare(`
                    INSERT INTO team_members
                    (id, name, role, status, timezone)
                    VALUES (?, ?, ?, ?, ?)
                `);

                seedData.forEach((member) => {

                    insert.run(
                        member.id,
                        member.name,
                        member.role,
                        member.status,
                        member.timezone
                    );
                });

                insert.finalize();

                console.log(
                    `Loaded ${seedData.length} team members from seed data.`
                );

            } catch (error) {

                console.error(
                    "Could not load seed data:",
                    error.message
                );
            }
        }
    );
}

// ==========================================
// GET ALL TEAM MEMBERS
// ==========================================

app.get("/api/team", (req, res) => {

    db.all(
        `
        SELECT *
        FROM team_members
        ORDER BY id ASC
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: "Could not retrieve team members."
                });
            }

            res.json(rows);
        }
    );
});

// ==========================================
// UPDATE TEAM MEMBER STATUS
// ==========================================

app.put("/api/team/:id/status", (req, res) => {

    const id = req.params.id;
    const { status } = req.body;

    const validStatuses = [
        "Available",
        "Busy",
        "Away"
    ];

    if (!validStatuses.includes(status)) {

        return res.status(400).json({
            error:
                "Status must be Available, Busy, or Away."
        });
    }

    db.run(
        `
        UPDATE team_members
        SET status = ?
        WHERE id = ?
        `,
        [status, id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: "Could not update team status."
                });
            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error: "Team member not found."
                });
            }

            res.json({
                message: "Status updated successfully.",
                id: Number(id),
                status: status
            });
        }
    );
});

// ==========================================
// GET SUMMARY
// ==========================================

app.get("/api/summary", (req, res) => {

    db.all(
        `
        SELECT status, COUNT(*) AS count
        FROM team_members
        GROUP BY status
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: "Could not retrieve summary."
                });
            }

            const summary = {
                Available: 0,
                Busy: 0,
                Away: 0
            };

            rows.forEach((row) => {
                summary[row.status] = row.count;
            });

            res.json(summary);
        }
    );
});

// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "..", "frontend")
    )
);

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );
});