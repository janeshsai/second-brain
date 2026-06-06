import { FileText, Search, Plus, X } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors } from "../theme"

interface Note {
  id: number
  title: string
  excerpt: string
  date: string
  tags: string[]
}

const initialNotes: Note[] = [
  {
    id: 1,
    title: "Project Planning Meeting Notes",
    excerpt: "Key decisions from today's sprint planning session...",
    date: "2 hours ago",
    tags: ["work", "planning"],
  },
  {
    id: 2,
    title: "Machine Learning Study Notes",
    excerpt: "Chapter 5: Neural networks and deep learning basics...",
    date: "Yesterday",
    tags: ["learning", "AI"],
  },
  {
    id: 3,
    title: "Book Review: Atomic Habits",
    excerpt: "Key takeaways from James Clear's bestselling book...",
    date: "2 days ago",
    tags: ["books", "habits"],
  },
  {
    id: 4,
    title: "Weekly Reflection Journal",
    excerpt: "Reflecting on wins and areas for improvement...",
    date: "3 days ago",
    tags: ["personal", "reflection"],
  },
]

function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 8,
        border: "none",
        padding: 6,
        background: hovered ? "oklch(1 0 0 / 0.1)" : "transparent",
        color: hovered ? colors.foreground : colors.mutedForeground,
        transition: "all 0.2s ease",
        display: "flex",
      }}
    >
      {children}
    </button>
  )
}

function NoteRow({ note, onDelete }: { note: Note; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false)
  const [delHover, setDelHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        padding: 16,
        background: hovered ? "oklch(1 0 0 / 0.05)" : "transparent",
        transition: "background-color 0.2s ease",
      }}
    >
      <div style={{ marginBottom: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <h4 style={{ fontWeight: 500, color: colors.foreground }}>{note.title}</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: colors.mutedForeground }}>{note.date}</span>
          <button
            onClick={() => onDelete(note.id)}
            onMouseEnter={() => setDelHover(true)}
            onMouseLeave={() => setDelHover(false)}
            style={{
              opacity: hovered ? 1 : 0,
              borderRadius: 4,
              border: "none",
              padding: 4,
              background: delHover ? "rgba(239,68,68,0.2)" : "transparent",
              color: delHover ? colors.destructive : colors.mutedForeground,
              transition: "all 0.2s ease",
              display: "flex",
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <p
        className="sb-line-clamp-1"
        style={{ marginBottom: 8, fontSize: 14, color: colors.mutedForeground }}
      >
        {note.excerpt}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {note.tags.map((tag) => (
          <span
            key={tag}
            style={{
              borderRadius: 9999,
              background: "oklch(1 0 0 / 0.1)",
              padding: "2px 8px",
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export function RecentNotes() {
  const [notes, setNotes] = useState(initialNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const deleteNote = (id: number) => setNotes(notes.filter((n) => n.id !== id))

  return (
    <CollapsibleCard
      title="Recent Notes"
      icon={<FileText size={20} color="rgb(34,211,238)" />}
      glowColor="cyan"
      rightAction={
        <div
          style={{ display: "flex", alignItems: "center", gap: 4 }}
          onClick={(e) => e.stopPropagation()}
        >
          {isSearching && (
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                height: 28,
                width: 128,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                background: "oklch(1 0 0 / 0.05)",
                padding: "0 8px",
                fontSize: 12,
                color: colors.foreground,
                outline: "none",
              }}
            />
          )}
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              setIsSearching(!isSearching)
              setSearchQuery("")
            }}
          >
            <Search size={16} />
          </IconButton>
          <IconButton onClick={(e) => e.stopPropagation()}>
            <Plus size={16} />
          </IconButton>
        </div>
      }
    >
      <div>
        {filteredNotes.map((note, i) => (
          <div
            key={note.id}
            style={{ borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}
          >
            <NoteRow note={note} onDelete={deleteNote} />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}
