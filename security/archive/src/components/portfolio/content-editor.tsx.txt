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

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
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
        const contents = d?.contents as Record<string, unknown> | undefined;
        for (const [k, v] of Object.entries(contents ?? {})) {
          if (
            typeof v === "object" &&
            v !== null &&
            typeof (v as { value?: unknown }).value === "string"
          ) {
            map[k] = (v as { value: string }).value;
          }
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
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 border-b border-[--hairline] bg-white px-4 py-2.5 text-sm text-[#101410] shadow-[0_4px_16px_rgba(16,20,16,0.08)]">
      <span className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#166534]" />
        <span className="font-semibold">Edit mode</span>
        <span className="hidden text-[#5F665F] sm:inline">
          — click any <Pencil className="inline h-3 w-3" /> pencil to edit that
          text live. Every change saves instantly and is audit-logged.
        </span>
      </span>
      <a
        href="/admin"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-[--hairline] px-3 py-1 text-xs font-medium text-[#101410] transition-colors hover:border-[#101410]"
      >
        Audit log
      </a>
      <button
        onClick={exit}
        className="flex items-center gap-1 rounded-full bg-[#101410] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-black"
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
    } catch (e: unknown) {
      setError(errorMessage(e, "Reset failed"));
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
    } catch (e: unknown) {
      setError(errorMessage(e, "Save failed"));
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
              <span className="rounded-full bg-[#EAF3EC] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                Customized
              </span>
            ) : (
              <span className="rounded-full bg-[#F4F5F1] px-2 py-0.5 text-[10px] font-semibold text-[#5F665F]">
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
            className="min-h-[280px] rounded-lg border-[--hairline] font-mono text-xs focus-visible:border-[#101410]"
            spellCheck={false}
          />
        ) : isMultiline ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[140px] rounded-lg border-[--hairline] focus-visible:border-[#101410]"
          />
        ) : (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSave();
            }}
            className="rounded-lg border-[--hairline] focus-visible:border-[#101410]"
          />
        )}
        {!isJson && (
          <div className="flex items-center justify-between text-[11px] text-[#5F665F]">
            <span>{draft.length} characters</span>
            {dirty && (
              <span className="font-semibold text-[#166534]">
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
                    : "text-[#5F665F]"
                }
              >
                {confirmReset ? "Click again to confirm reset" : "Reset to default"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={doSave}
              disabled={saving || (!dirty && !isJson)}
              className="rounded-full bg-[#101410] text-white hover:bg-black"
            >
              {saving ? "Saving…" : "Save change"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const tagName = (as || "span") as string;

  if (!editMode) {
    return createElement(tagName, { className, style }, value);
  }

  if (isJson || buttonOnly) {
    return (
      <>
        <div className="my-2 flex justify-center">
          <button
            onClick={openEditor}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-[--hairline] bg-white px-3 py-1.5 text-xs font-semibold text-[#101410] shadow-[0_4px_16px_rgba(16,20,16,0.08)] transition-colors hover:border-[#101410]"
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

  return (
    <span className="relative rounded-sm transition-all hover:bg-[#F4F5F1] hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#166534] hover:outline-offset-2">
      {createElement(tagName, { className, style }, value)}
      <button
        onClick={openEditor}
        title={`Edit: ${title}`}
        aria-label={`Edit ${title}`}
        className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#101410] text-white opacity-70 shadow hover:opacity-100"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {dialog}
    </span>
  );
}
