# Team Availability Tracker

A full-stack real-time team availability dashboard that allows users to monitor and update team member status.

## Project Overview

The Team Availability Tracker provides a centralized dashboard for viewing team members and their current availability.

Each team member can have one of three statuses:

- Available
- Busy
- Away

Status changes are stored in a SQLite database and automatically synchronized with the dashboard.

## Features

- Team availability dashboard
- Available, Busy, and Away status controls
- SQLite database persistence
- REST API for team data
- REST API for status updates
- Automatic refresh every 3 seconds
- Live status synchronization across browser tabs
- Search team members
- Filter members by status
- Visual status badges
- Team member roles
- Team timezone information
- Responsive design for desktop and mobile

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- SQLite
- REST API

## Project Structure

```text
team-availability-tracker/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── data/
│   │   └── team_availability_seed.json
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── .gitignore
└── README.md