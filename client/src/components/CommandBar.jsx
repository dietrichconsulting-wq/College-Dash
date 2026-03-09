import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Icon components ──
const icons = {
    task: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    school: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0124 12.083V21l-6-3.27M6 21V12.083A12.083 12.083 0 010 12.083" />
        </svg>
    ),
    upload: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    ),
    chat: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    edit: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    dollar: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    test: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    nav: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    ),
};

// ── Build the static command list ──
function buildCommands({ schools, onAddTask, onToggleChat, onEditSchools, onScrollToTasks }) {
    const commands = [
        // Actions
        {
            id: 'add-task',
            label: 'Add task',
            description: 'Create a new task',
            icon: icons.task,
            group: 'Actions',
            keywords: 'create new task add todo',
            action: onAddTask,
        },
        {
            id: 'ask-advisor',
            label: 'Ask AI Advisor',
            description: 'Open the AI chat panel',
            icon: icons.chat,
            group: 'Actions',
            keywords: 'ai chat advisor ask question help',
            action: onToggleChat,
        },
        {
            id: 'edit-schools',
            label: 'Edit schools',
            description: 'Update your target schools',
            icon: icons.edit,
            group: 'Actions',
            keywords: 'edit schools colleges change update',
            action: onEditSchools,
        },
        {
            id: 'scroll-tasks',
            label: 'Go to tasks',
            description: 'Scroll to task list',
            icon: icons.nav,
            group: 'Navigation',
            keywords: 'tasks list scroll navigate',
            action: onScrollToTasks,
        },

        // Quick links
        {
            id: 'find-scholarships',
            label: 'Find scholarships',
            description: 'Search for scholarship opportunities',
            icon: icons.dollar,
            group: 'Quick Links',
            keywords: 'scholarship money financial aid grants',
            action: () => window.open('https://www.fastweb.com/', '_blank'),
        },
        {
            id: 'sat-practice',
            label: 'SAT Practice',
            description: 'Practice SAT on Khan Academy',
            icon: icons.test,
            group: 'Quick Links',
            keywords: 'sat practice test prep study khan',
            action: () => window.open('https://www.khanacademy.org/digital-sat', '_blank'),
        },
        {
            id: 'common-app',
            label: 'Open Common App',
            description: 'Go to commonapp.org',
            icon: icons.nav,
            group: 'Quick Links',
            keywords: 'common app application apply',
            action: () => window.open('https://www.commonapp.org/', '_blank'),
        },
        {
            id: 'apply-texas',
            label: 'Open Apply Texas',
            description: 'Go to applytexas.org',
            icon: icons.nav,
            group: 'Quick Links',
            keywords: 'apply texas application',
            action: () => window.open('https://www.applytexas.org/', '_blank'),
        },
        {
            id: 'fafsa',
            label: 'Open FAFSA',
            description: 'Go to studentaid.gov',
            icon: icons.dollar,
            group: 'Quick Links',
            keywords: 'fafsa financial aid student',
            action: () => window.open('https://studentaid.gov/', '_blank'),
        },
        {
            id: 'upload-transcript',
            label: 'Upload transcript',
            description: 'Coming soon — track your transcripts',
            icon: icons.upload,
            group: 'Actions',
            keywords: 'upload transcript document file',
            action: () => { }, // placeholder
        },
    ];

    // Add a command for each school in the profile
    if (schools?.length) {
        schools.forEach((s) => {
            if (!s?.name || !s.name.trim()) return;
            commands.push({
                id: `school-${s.name}`,
                label: `Open ${s.name}`,
                description: `Visit ${s.name} website`,
                icon: icons.school,
                group: 'Schools',
                keywords: `${s.name.toLowerCase()} school college university open visit`,
                action: () => {
                    // Attempt a search for the school
                    const q = encodeURIComponent(s.name + ' admissions');
                    window.open(`https://www.google.com/search?q=${q}`, '_blank');
                },
            });
        });
    }

    return commands;
}

// ── Fuzzy-ish matcher ──
function matchScore(command, query) {
    const q = query.toLowerCase();
    const label = command.label.toLowerCase();
    const keywords = (command.keywords || '').toLowerCase();
    const desc = (command.description || '').toLowerCase();

    // Exact start of label
    if (label.startsWith(q)) return 100;
    // Label contains
    if (label.includes(q)) return 80;
    // Keywords contain
    if (keywords.includes(q)) return 60;
    // Description contains
    if (desc.includes(q)) return 40;
    // Any word starts with query
    const words = `${label} ${keywords} ${desc}`.split(/\s+/);
    if (words.some((w) => w.startsWith(q))) return 30;

    return 0;
}

export default function CommandBar({
    open,
    onClose,
    schools,
    onAddTask,
    onToggleChat,
    onEditSchools,
    onScrollToTasks,
}) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const allCommands = useMemo(
        () => buildCommands({ schools, onAddTask, onToggleChat, onEditSchools, onScrollToTasks }),
        [schools, onAddTask, onToggleChat, onEditSchools, onScrollToTasks]
    );

    // Filtered + scored
    const filtered = useMemo(() => {
        if (!query.trim()) return allCommands;
        return allCommands
            .map((cmd) => ({ ...cmd, score: matchScore(cmd, query.trim()) }))
            .filter((cmd) => cmd.score > 0)
            .sort((a, b) => b.score - a.score);
    }, [allCommands, query]);

    // Group items for rendering
    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach((cmd) => {
            if (!groups[cmd.group]) groups[cmd.group] = [];
            groups[cmd.group].push(cmd);
        });
        return groups;
    }, [filtered]);

    // Flat list for keyboard nav
    const flatList = useMemo(() => {
        const flat = [];
        Object.values(grouped).forEach((items) => flat.push(...items));
        return flat;
    }, [grouped]);

    // Reset selection on filter change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input on open
    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Scroll selected into view
    useEffect(() => {
        if (!listRef.current) return;
        const active = listRef.current.querySelector('[data-active="true"]');
        if (active) {
            active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    const runCommand = useCallback(
        (cmd) => {
            onClose();
            // Small delay so the overlay closes before the action fires
            setTimeout(() => cmd.action(), 120);
        },
        [onClose]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (flatList[selectedIndex]) runCommand(flatList[selectedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        },
        [flatList, selectedIndex, runCommand, onClose]
    );

    if (!open) return null;

    let flatIdx = -1;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="cmd-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="cmd-overlay"
                    onClick={onClose}
                >
                    <motion.div
                        key="cmd-panel"
                        initial={{ opacity: 0, scale: 0.96, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="cmd-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search input */}
                        <div className="cmd-input-wrap">
                            <svg className="cmd-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                className="cmd-input"
                                placeholder="Type a command or search…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <kbd className="cmd-kbd">esc</kbd>
                        </div>

                        {/* Results */}
                        <div className="cmd-results" ref={listRef}>
                            {flatList.length === 0 ? (
                                <div className="cmd-empty">
                                    <span className="cmd-empty-icon">🔍</span>
                                    <p>No results for "<strong>{query}</strong>"</p>
                                </div>
                            ) : (
                                Object.entries(grouped).map(([group, items]) => (
                                    <div key={group} className="cmd-group">
                                        <div className="cmd-group-label">{group}</div>
                                        {items.map((cmd) => {
                                            flatIdx++;
                                            const isActive = flatIdx === selectedIndex;
                                            const idx = flatIdx; // capture for click
                                            return (
                                                <button
                                                    key={cmd.id}
                                                    data-active={isActive}
                                                    className={`cmd-item ${isActive ? 'cmd-item--active' : ''}`}
                                                    onClick={() => runCommand(cmd)}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                >
                                                    <span className="cmd-item-icon">{cmd.icon}</span>
                                                    <div className="cmd-item-text">
                                                        <span className="cmd-item-label">{cmd.label}</span>
                                                        <span className="cmd-item-desc">{cmd.description}</span>
                                                    </div>
                                                    {isActive && (
                                                        <kbd className="cmd-item-enter">↵</kbd>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="cmd-footer">
                            <span><kbd>↑↓</kbd> navigate</span>
                            <span><kbd>↵</kbd> select</span>
                            <span><kbd>esc</kbd> close</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
