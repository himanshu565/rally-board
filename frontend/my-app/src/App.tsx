import type { ReactNode } from "react";
import "./App.css";

type Priority = "Critical" | "High" | "Medium" | "Low";

type StoryCard = {
  id: string;
  title: string;
  points: number;
  owner: string;
  ownerTag: string;
  priority: Priority;
  kind: "Feature" | "Bug" | "Task";
  due: string;
};

const boardData: Record<string, StoryCard[]> = {
  Backlog: [
    {
      id: "US-1421",
      title: "Create personalized sprint summary panel for team leads",
      points: 8,
      owner: "Nina Shaw",
      ownerTag: "NS",
      priority: "High",
      kind: "Feature",
      due: "Apr 12",
    },
    {
      id: "US-1398",
      title: "Refine acceptance criteria for checkout error analytics",
      points: 3,
      owner: "Yash Rai",
      ownerTag: "YR",
      priority: "Medium",
      kind: "Task",
      due: "Apr 10",
    },
  ],
  "In Progress": [
    {
      id: "US-1434",
      title: "Build drag and drop swimlane behavior for iteration board",
      points: 5,
      owner: "Maya Li",
      ownerTag: "ML",
      priority: "Critical",
      kind: "Feature",
      due: "Apr 09",
    },
    {
      id: "DE-771",
      title: "Fix race condition when multiple cards update simultaneously",
      points: 2,
      owner: "Luis Ortega",
      ownerTag: "LO",
      priority: "High",
      kind: "Bug",
      due: "Apr 11",
    },
  ],
  Review: [
    {
      id: "US-1407",
      title: "Polish board filters with keyboard navigation support",
      points: 3,
      owner: "Ava Brown",
      ownerTag: "AB",
      priority: "Medium",
      kind: "Task",
      due: "Apr 08",
    },
    {
      id: "US-1413",
      title: "Add confidence score badge to story estimation workflow",
      points: 5,
      owner: "Rohan Das",
      ownerTag: "RD",
      priority: "Low",
      kind: "Feature",
      due: "Apr 13",
    },
  ],
  Done: [
    {
      id: "US-1364",
      title: "Ship dashboard health widget and velocity sparkline",
      points: 8,
      owner: "Ivy Chen",
      ownerTag: "IC",
      priority: "Low",
      kind: "Feature",
      due: "Apr 06",
    },
    {
      id: "DE-744",
      title: "Resolve stale cache issue for iteration metrics endpoint",
      points: 2,
      owner: "Sam Green",
      ownerTag: "SG",
      priority: "Medium",
      kind: "Bug",
      due: "Apr 05",
    },
  ],
};

const statTiles = [
  { label: "Sprint Goal", value: "79%", trend: "+6%" },
  { label: "Open Stories", value: "24", trend: "-3" },
  { label: "Blocked", value: "3", trend: "+1" },
  { label: "Velocity", value: "44 pts", trend: "+9%" },
];

const priorityClass: Record<Priority, string> = {
  Critical: "priority-critical",
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

function Icon({ children }: { children: ReactNode }) {
  return <span className="icon-shell">{children}</span>;
}

function App() {
  return (
    <main className="rally-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <Icon>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h10l6 6-6 6H4z" />
            </svg>
          </Icon>
          <div>
            <p className="label">Nimbus Agile</p>
            <h1>Rally Board</h1>
          </div>
        </div>
        <div className="actions">
          <button className="ghost-btn">Release 24.7</button>
          <button className="primary-btn">+ New Story</button>
        </div>
      </header>

      <section className="summary-strip" aria-label="Sprint summary">
        {statTiles.map((tile) => (
          <article key={tile.label} className="stat-card">
            <p>{tile.label}</p>
            <h2>{tile.value}</h2>
            <span>{tile.trend}</span>
          </article>
        ))}
      </section>

      <section className="toolbar" aria-label="Board filters">
        <div className="pill-group">
          <button className="pill active">Current Sprint</button>
          <button className="pill">All Teams</button>
          <button className="pill">Priority: Any</button>
        </div>
        <input
          type="search"
          className="board-search"
          placeholder="Search stories, owners, tags..."
          aria-label="Search board"
        />
      </section>

      <section className="board" aria-label="Rally board columns">
        {Object.entries(boardData).map(([column, cards], columnIndex) => (
          <article
            className="lane"
            key={column}
            style={{ animationDelay: `${columnIndex * 0.09}s` }}
          >
            <header className="lane-head">
              <h3>{column}</h3>
              <span>{cards.length}</span>
            </header>

            <div className="lane-cards">
              {cards.map((card) => (
                <article className="story-card" key={card.id}>
                  <div className="story-top">
                    <span className="story-id">{card.id}</span>
                    <span
                      className={`priority-chip ${priorityClass[card.priority]}`}
                    >
                      {card.priority}
                    </span>
                  </div>

                  <p className="story-title">{card.title}</p>

                  <div className="meta-row">
                    <span
                      className={`kind-badge kind-${card.kind.toLowerCase()}`}
                    >
                      {card.kind}
                    </span>
                    <span>{card.points} pts</span>
                    <span>Due {card.due}</span>
                  </div>

                  <footer className="story-footer">
                    <span className="avatar" aria-label={card.owner}>
                      {card.ownerTag}
                    </span>
                    <span className="owner-name">{card.owner}</span>
                  </footer>
                </article>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
