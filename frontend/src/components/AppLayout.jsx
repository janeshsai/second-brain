import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AISearch from './AISearch';
import Button from './ui/Button';
import { FileText, Bookmark, Target, CalendarDays, GraduationCap, Search, LogOut } from 'lucide-react';
import C from '../theme';

// All app sections in fixed order — add new ones here only
const TABS = [
  { path: '/notes',     Icon: FileText,      label: 'Notes'     },
  { path: '/bookmarks', Icon: Bookmark,       label: 'Bookmarks' },
  { path: '/habits',    Icon: Target,         label: 'Habits'    },
  { path: '/calendar',  Icon: CalendarDays,   label: 'Calendar'  },
  { path: '/learning',  Icon: GraduationCap,  label: 'Learning'  },
];

function SidebarButton({ icon, label, onClick, isActive = false, danger = false, shortcut }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: C.space.xs }}
        >
            {/* The visible button — always 44x44 icon */}
            <Button
                onClick={onClick}
                variant={danger ? 'danger' : isActive ? 'primary' : 'ghost'}
                size="sm"
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isActive ? C.accent : (hovered ? 'rgba(255,255,255,0.08)' : 'transparent'),
                    color: isActive ? '#000' : (danger ? C.danger : 'rgba(235,235,245,0.7)'),
                    padding: 0,
                    minHeight: 44,
                }}
            >
                {icon}
            </Button>

            {/* The expanding label — appears on hover, extends to the right */}
            <div style={{
                position: 'absolute',
                left: 54,
                top: '50%',
                transform: `translateY(-50%) translateX(${hovered ? 0 : -8}px)`,
                opacity: hovered ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.15s, transform 0.15s',
                whiteSpace: 'nowrap',
                zIndex: 1,
            }}>
                <span style={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: danger ? C.danger : (isActive ? C.accent : C.t1),
                    background: C.sidebar,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${C.sep}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                    {label}
                    {shortcut && <span style={{ marginLeft: 8, color: C.t3, fontSize: 11 }}>{shortcut}</span>}
                </span>
            </div>
        </div>
    );
}


export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  //const [sidebarHovered, setSidebarHovered] = useState(false); -del later

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Fixed vertical nav strip on the far left */}
      <div
        style={{
          width: 64,
          background: C.sidebar,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRight: `1px solid ${C.sep}`,
          paddingTop: C.space.xl,
          paddingBottom: C.space.xl,
          flexShrink: 0,
          zIndex: 10,
          overflow: 'visible',  // ← allow buttons to expand outside
        }}
        >
        {/* Brain logo — click goes to dashboard home */}
        <div
          onClick={() => navigate('/')}
          title="Dashboard"
          style={{
            fontSize: 22, marginBottom: C.space.xl,
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🧠
        </div>

        <SidebarButton 
          icon={<Search size={20} strokeWidth={1.8} color="rgba(235,235,245,0.6)" />}
          label="Search"
          onClick={() => setSearchOpen(true)}
          shortcut="⌘K"
        />

        {/* Tab buttons — fixed order, never reorder */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          {TABS.map(tab => {
              const isActive = location.pathname === tab.path;
              return (
                  <SidebarButton
                      key={tab.path}
                      icon={<tab.Icon size={20} strokeWidth={1.8} color={isActive ? '#000' : 'rgba(235,235,245,0.6)'} />}
                      label={tab.label}
                      isActive={isActive}
                      onClick={() => navigate(tab.path)}
                  />
              );
          })}
        </div>

        {/* Logout at the very bottom */}
        <SidebarButton
          icon={<LogOut size={18} strokeWidth={1.8} color={C.danger} />}
          label="Sign Out"
          danger
          onClick={handleLogout}
        />
      </div>

      {/* Page content fills the rest */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', minWidth: 0 }}>
        {children}
      </div>
      <AISearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}