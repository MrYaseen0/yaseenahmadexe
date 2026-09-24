"use client";

/**
 * Visual inline CMS for the portfolio.
 *
 * - <ContentProvider> wraps the public page. It loads admin-saved overrides
 *   from /api/admin/content and merges them over CONTENT_DEFAULTS.
 * - useContent() gives components t(key) for text and tj<T>(key) for JSON lists.
 * - <Editable id="hero.name" /> renders the text; in edit mode (?edit=1 with a
 *   valid admin token) it shows a pencil button that opens an edit dialog.
 * - Every save goes through PUT /api/admin/content, which audit-logs the
 *   change (who / IP / key / old → new) as a CONTENT_EDIT security event.
 */

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { Pencil, X, ShieldCheck, ListTree } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CONTENT_DEFAULTS, CONTENT_FIELDS, validateJsonField } from "@/lib/content-fields";

const TOKEN_KEY = "ya-admin-token";

interface ContentContextValue {
  values: Record<string, string>;
  loaded: boolean;
  editMode: boolean;
  t: (key: string) => string;
  tj: <T>(key: string) => T;
  save: (key: string, value: string) => Promise<void>;
  /** Delete the DB override for a key, restoring its default. */
  reset: (key: string) => Promise<void>;
  /** True when a DB override exists for the key (i.e. it differs from default). */
  isCustomized: (key: string) => boolean;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}

/** Null-safe variant for components that may render outside the provider. */
export function useContentOptional(): ContentContextValue | null {
  return useContext(ContentContext);
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Load admin overrides (public read; falls back to defaults on failure).
  useEffect(() => {
    fetch("/api/admin/content", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string> = {};
        const contents = d?.contents ?? {};
        for (const [k, v] of Object.entries<any>(contents)) {
          if (typeof v?.value === "string") map[k] = v.value;
        }
        setOverrides(map);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Edit mode: ?edit=1 + a valid admin token in localStorage.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") !== "1") return;
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;
      fetch("/api/admin/auth", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (r.ok) setEditMode(true);
        })
        .catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  // Push the page down so the edit-mode bar never covers the navbar.
  useEffect(() => {
    if (!editMode) return;
    document.body.style.paddingTop = "46px";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, [editMode]);

  const values = useMemo(
    () => ({ ...CONTENT_DEFAULTS, ...overrides }),
    [overrides]
  );

  const t = useCallback((key: string) => values[key] ?? "", [values]);

  const tj = useCallback(
    <T,>(key: string): T => {
      const raw = values[key];
      try {
        return JSON.parse(raw) as T;
      } catch {
        return JSON.parse(CONTENT_DEFAULTS[key]) as T;
      }
    },
    [values]
  );

  const save = useCallback(async (key: string, value: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Admin session expired — log in again.");
    const field = CONTENT_FIELDS.find((f) => f.key === key);
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        key,
        value,
        category: field?.category ?? "general",
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Save failed");
    }
    setOverrides((o) => ({ ...o, [key]: value }));
  }, []);

  const reset = useCallback(async (key: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Admin session expired — log in again.");
    const res = await fetch(
      `/api/admin/content?key=${encodeURIComponent(key)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Reset failed");
    }
    setOverrides((o) => {
      const next = { ...o };
      delete next[key];
      return next;
    });
  }, []);

  const isCustomized = useCallback((key: string) => key in overrides, [overrides]);

  const ctx = useMemo(
    () => ({ values, loaded, editMode, t, tj, save, reset, isCustomized }),
    [values, loaded, editMode, t, tj, save, reset, isCustomized]
  );

  return (
    <ContentContext.Provider value={ctx}>
      {children}
      <EditModeBar />
    </ContentContext.Provider>
  );
}

function EditModeBar() {
  const ctx = useContentOptional();
  if (!ctx?.editMode) return null;
  const exit = () => {
    const u = new URL(window.location.href);
    u.searchParams.delete("edit");
    window.location.href = u.toString();
  };
  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 border-b border-sky-500/30 bg-slate-950/95 px-4 py-2.5 text-sm text-white backdrop-blur">
      <span className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-green-400" />
        <span className="font-semibold">Edit mode</span>
        <span className="hidden text-white/70 sm:inline">
          — click any <Pencil className="inline h-3 w-3" /> pencil to edit that
          text live. Every change saves instantly and is audit-logged.
        </span>
      </span>
      <a
        href="/admin"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium hover:bg-white/10"
      >
        Audit log
      </a>
      <button
        onClick={exit}
        className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20"
      >
        <X className="h-3 w-3" /> Exit
      </button>
    </div>
  );
}

interface EditableProps {
  id: string;
  /** HTML tag to render in normal mode (default: span). */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  /** Force textarea instead of single-line input in the dialog. */
  multiline?: boolean;
  /** JSON list/object field: renders an "edit list" button in edit mode, nothing otherwise. */
  json?: boolean;
  /** Button-only: renders just an "edit" button in edit mode (for fields
   *  whose value is rendered custom, e.g. the code snippet). */
  buttonOnly?: boolean;
  /** Friendly label for the dialog title (defaults to the registry label). */
  label?: string;
}

/**
 * Renders an editable text node. In normal mode it is just the element with
 * the current value. In edit mode it gains a pencil button that opens the
 * edit dialog; saving writes through to the DB and the audit log.
 */
export function Editable({
  id,
  as,
  className,
  style,
  multiline,
  json,
  buttonOnly,
  label,
}: EditableProps) {
  const { t, editMode, save, reset, isCustomized } = useContent();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const field = CONTENT_FIELDS.find((f) => f.key === id);
  const value = t(id);
  const isJson = json ?? field?.json ?? false;
  const isMultiline =
    multiline ??
    field?.multiline ??
    (value.includes("\n") || value.length > 90);
  const title = label ?? field?.label ?? id;
  const customized = isCustomized(id);
  const dirty = draft !== value;

  const openEditor = () => {
    if (isJson) {
      try {
        setDraft(JSON.stringify(JSON.parse(value), null, 2));
      } catch {
        setDraft(value);
      }
    } else {
      setDraft(value);
    }
    setError("");
    setConfirmReset(false);
    setOpen(true);
  };

  const doReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await reset(id);
      setConfirmReset(false);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  const doSave = async () => {
    let v = draft;
    if (isJson) {
      const check = validateJsonField(id, draft);
      if (!check.ok) {
        setError(check.error);
        return;
      }
      v = check.normalized;
    }
    setSaving(true);
    setError("");
    try {
      await save(id, v);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // JSON fields render nothing in normal mode — the section reads them via tj().
  // buttonOnly fields never render inline.
  if ((isJson || buttonOnly) && !editMode) return null;

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit: {title}
            {customized ? (
              <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-semibold text-pink-600">
                Customized
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Default
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono text-[11px]">{id}</span>
            {field?.category && (
              <span className="text-[11px]"> · {field.category}</span>
            )}
            <br />
            Saved instantly to the live site. This change is recorded in the
            audit log with your account and IP.
          </DialogDescription>
        </DialogHeader>
        {isJson ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[280px] font-mono text-xs"
            spellCheck={false}
          />
        ) : isMultiline ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[140px]"
          />
        ) : (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSave();
            }}
          />
        )}
        {!isJson && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{draft.length} characters</span>
            {dirty && (
              <span className="font-semibold text-amber-600">
                ● Unsaved changes
              </span>
            )}
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div>
            {customized && (
              <Button
                variant="ghost"
                onClick={doReset}
                disabled={saving}
                className={
                  confirmReset
                    ? "text-red-600 hover:bg-red-500/10 hover:text-red-700"
                    : "text-muted-foreground"
                }
              >
                {confirmReset ? "Click again to confirm reset" : "Reset to default"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doSave} disabled={saving || (!dirty && !isJson)}>
              {saving ? "Saving…" : "Save change"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (!editMode) {
    const Tag = (as || "span") as any;
    return createElement(Tag, { className, style }, value);
  }

  if (isJson || buttonOnly) {
    return (
      <>
        <div className="my-2 flex justify-center">
          <button
            onClick={openEditor}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-sky-500/50 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-500/20 dark:text-sky-300"
          >
            {isJson ? (
              <ListTree className="h-3.5 w-3.5" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}{" "}
            Edit {isJson ? "list" : "text"}: {title}
          </button>
        </div>
        {dialog}
      </>
    );
  }

  const Tag = (as || "span") as any;
  return (
    <span className="relative rounded-sm transition-all hover:bg-sky-500/10 hover:outline hover:outline-2 hover:outline-dashed hover:outline-sky-400 hover:outline-offset-2">
      {createElement(Tag, { className, style }, value)}
      <button
        onClick={openEditor}
        title={`Edit: ${title}`}
        aria-label={`Edit ${title}`}
        className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white opacity-70 shadow hover:opacity-100"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {dialog}
    </span>
  );
}
