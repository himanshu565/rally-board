import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./App.css";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Status = "Backlog" | "In Progress" | "Review" | "Done";
type Kind = "Feature" | "Bug" | "Task";

type StoryCard = {
  id: number;
  code: string;
  title: string;
  points: number;
  ownerName: string;
  ownerTag: string;
  priority: Priority;
  kind: Kind;
  dueDate: string;
  status: Status;
};

type StoryForm = {
  code: string;
  title: string;
  points: number;
  ownerName: string;
  ownerTag: string;
  priority: Priority;
  kind: Kind;
  dueDate: string;
  status: Status;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const laneOrder: Status[] = ["Backlog", "In Progress", "Review", "Done"];

const defaultForm: StoryForm = {
  code: "",
  title: "",
  points: 1,
  ownerName: "",
  ownerTag: "",
  priority: "Medium",
  kind: "Feature",
  dueDate: new Date().toISOString().slice(0, 10),
  status: "Backlog",
};

const statTiles = [
  { label: "Sprint Goal", value: "79%", trend: "+6%" },
  { label: "Open Stories", value: "--", trend: "live" },
  { label: "Blocked", value: "3", trend: "+1" },
  { label: "Velocity", value: "-- pts", trend: "live" },
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

function formatDueDate(dateInput: string) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function App() {
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"Any" | Priority>("Any");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storyForm, setStoryForm] = useState<StoryForm>(defaultForm);

  const openStories = stories.filter((story) => story.status !== "Done").length;
  const velocity = stories
    .filter((story) => story.status === "Done")
    .reduce((sum, story) => sum + story.points, 0);

  const computedStatTiles = statTiles.map((tile) => {
    if (tile.label === "Open Stories") {
      return { ...tile, value: String(openStories) };
    }
    if (tile.label === "Velocity") {
      return { ...tile, value: `${velocity} pts` };
    }
    return tile;
  });

  const boardData = useMemo<Record<Status, StoryCard[]>>(() => {
    const lanes: Record<Status, StoryCard[]> = {
      Backlog: [],
      "In Progress": [],
      Review: [],
      Done: [],
    };

    const search = searchTerm.trim().toLowerCase();

    for (const story of stories) {
      const passesPriority =
        priorityFilter === "Any" || story.priority === priorityFilter;
      const passesSearch =
        !search ||
        story.code.toLowerCase().includes(search) ||
        story.title.toLowerCase().includes(search) ||
        story.ownerName.toLowerCase().includes(search) ||
        story.ownerTag.toLowerCase().includes(search);

      if (passesPriority && passesSearch) {
        lanes[story.status].push(story);
      }
    }

    return lanes;
  }, [stories, searchTerm, priorityFilter]);

  async function loadStories() {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories from API");
      }
      const data = (await response.json()) as StoryCard[];
      setStories(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStories();
  }, []);

  async function updateStory(id: number, payload: Partial<StoryForm>) {
    setErrorMessage("");
    const response = await fetch(`${API_BASE_URL}/api/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(body?.message ?? "Failed to update story");
    }

    const updated = (await response.json()) as StoryCard;
    setStories((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }

  async function deleteStory(id: number) {
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Could not delete story");
      }
      setStories((prev) => prev.filter((story) => story.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function createStory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyForm),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Could not create story");
      }

      const created = (await response.json()) as StoryCard;
      setStories((prev) => [created, ...prev]);
      setStoryForm({ ...defaultForm, dueDate: storyForm.dueDate });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Create failed");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <button className="primary-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            + New Story
          </button>
        </div>
      </header>

      <section className="composer-wrap" aria-label="Create story">
        <form className="composer" onSubmit={createStory}>
          <input
            className="composer-input"
            placeholder="Story Code (US-1490)"
            value={storyForm.code}
            onChange={(e) => setStoryForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            required
          />
          <input
            className="composer-input title"
            placeholder="Story title"
            value={storyForm.title}
            onChange={(e) => setStoryForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <input
            className="composer-input"
            placeholder="Owner name"
            value={storyForm.ownerName}
            onChange={(e) => setStoryForm((prev) => ({ ...prev, ownerName: e.target.value }))}
            required
          />
          <input
            className="composer-input"
            placeholder="Tag"
            maxLength={3}
            value={storyForm.ownerTag}
            onChange={(e) => setStoryForm((prev) => ({ ...prev, ownerTag: e.target.value.toUpperCase() }))}
            required
          />
          <input
            className="composer-input points"
            type="number"
            min={0}
            value={storyForm.points}
            onChange={(e) =>
              setStoryForm((prev) => ({
                ...prev,
                points: Number(e.target.value),
              }))
            }
            required
          />
          <select
            className="composer-input"
            value={storyForm.priority}
            onChange={(e) =>
              setStoryForm((prev) => ({
                ...prev,
                priority: e.target.value as Priority,
              }))
            }
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            className="composer-input"
            value={storyForm.kind}
            onChange={(e) =>
              setStoryForm((prev) => ({
                ...prev,
                kind: e.target.value as Kind,
              }))
            }
          >
            <option value="Feature">Feature</option>
            <option value="Bug">Bug</option>
            <option value="Task">Task</option>
          </select>
          <select
            className="composer-input"
            value={storyForm.status}
            onChange={(e) =>
              setStoryForm((prev) => ({
                ...prev,
                status: e.target.value as Status,
              }))
            }
          >
            {laneOrder.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            className="composer-input"
            type="date"
            value={storyForm.dueDate}
            onChange={(e) => setStoryForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            required
          />
          <button className="primary-btn submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </form>
      </section>

      <section className="summary-strip" aria-label="Sprint summary">
        {computedStatTiles.map((tile) => (
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
          <select
            className="pill filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "Any" | Priority)}
            aria-label="Filter by priority"
          >
            <option value="Any">Priority: Any</option>
            <option value="Critical">Priority: Critical</option>
            <option value="High">Priority: High</option>
            <option value="Medium">Priority: Medium</option>
            <option value="Low">Priority: Low</option>
          </select>
        </div>
        <input
          type="search"
          className="board-search"
          placeholder="Search stories, owners, tags..."
          aria-label="Search board"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      {errorMessage && <p className="error-banner">{errorMessage}</p>}
      {isLoading && <p className="loading-banner">Loading stories from API...</p>}

      <section className="board" aria-label="Rally board columns">
        {laneOrder.map((column, columnIndex) => (
          <article
            className="lane"
            key={column}
            style={{ animationDelay: `${columnIndex * 0.09}s` }}
          >
            <header className="lane-head">
              <h3>{column}</h3>
              <span>{boardData[column].length}</span>
            </header>

            <div className="lane-cards">
              {boardData[column].map((card) => (
                <article className="story-card" key={card.id}>
                  <div className="story-top">
                    <span className="story-id">{card.code}</span>
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
                    <span>Due {formatDueDate(card.dueDate)}</span>
                  </div>

                  <footer className="story-footer">
                    <span className="avatar" aria-label={card.ownerName}>
                      {card.ownerTag}
                    </span>
                    <span className="owner-name">{card.ownerName}</span>
                    <select
                      className="status-select"
                      value={card.status}
                      onChange={(e) => {
                        void updateStory(card.id, { status: e.target.value as Status }).catch(
                          (error: unknown) => {
                            setErrorMessage(
                              error instanceof Error ? error.message : "Move failed",
                            );
                          },
                        );
                      }}
                    >
                      {laneOrder.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => void deleteStory(card.id)}
                      aria-label={`Delete ${card.code}`}
                    >
                      Delete
                    </button>
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

// hello himanshu bisht 