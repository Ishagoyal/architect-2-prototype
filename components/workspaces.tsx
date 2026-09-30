"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { Modal, btnOutline, btnPrimary } from "./Modal";
import { useViewer } from "@/lib/viewer-context";
import { useProjects } from "@/lib/projects";
import { useAddOn } from "@/lib/addon";
import { useWorkspaces, type Invite } from "@/lib/workspaces";

/* Workspaces: the list in the workspace menu, Workspace settings, Invite people and
   Create a workspace. Prototype: kept in this browser, and invites don't send an email. */

export type Person = { name: string; detail: string; role: string; invited?: boolean };
export type WorkspaceInfo = { id: string; name: string; initial: string; color: string; team: boolean; plan: string; people: Person[] };

const colors = ["bg-accent", "bg-[#2E4A3B]", "bg-[#2A57C9]", "bg-[#7A3A12]"];

/** Every workspace this person has, with its people (invites included). */
export function useWorkspaceList() {
  const viewer = useViewer();
  const ws = useWorkspaces(viewer.id);
  const you: Person = { name: viewer.name, detail: "You", role: "Owner" };
  const base: WorkspaceInfo[] =
    viewer.kind === "demo"
      ? [
          { id: "main", name: "Alex’s workspace", initial: "A", color: colors[0], team: false, plan: "Pro", people: [you] },
          {
            id: "team",
            name: "Lyzr Product Team",
            initial: "L",
            color: colors[1],
            team: true,
            plan: "Team",
            people: [
              { name: "Priya Shah", detail: "priya@example.com", role: "Owner" },
              { name: viewer.name, detail: "You", role: "Admin" },
              ...["Rahul Verma", "Meera Iyer", "Arjun Rao", "Sana Khan"].map((n) => ({ name: n, detail: `${n.split(" ")[0].toLowerCase()}@example.com`, role: "Member" })),
            ],
          },
        ]
      : [{ id: "main", name: viewer.workspace, initial: viewer.firstName[0]?.toUpperCase() ?? "W", color: colors[0], team: false, plan: "Free", people: [you] }];
  const made: WorkspaceInfo[] = ws.made.map((m, i) => ({ id: m.id, name: m.name, initial: m.name.trim()[0]?.toUpperCase() ?? "W", color: colors[(i + 2) % colors.length], team: false, plan: "Free", people: [you] }));
  const list = [...base, ...made].map((w) => {
    const invited = (ws.invites[w.id] ?? []).map((inv) => ({ name: inv.email, detail: "Invited · no email sent (prototype)", role: inv.role, invited: true }));
    return { ...w, name: ws.names[w.id] ?? w.name, people: [...w.people, ...invited] };
  });
  const current = list.find((w) => w.id === ws.current) ?? list[0];
  return { list, current, ws };
}

export function peopleLine(w: WorkspaceInfo) {
  const invited = w.people.filter((p) => p.invited).length;
  const members = w.people.length - invited;
  const who = members === 1 ? "just you" : `${members} people`;
  return `${w.team ? "Team" : "Personal"} · ${w.plan} plan · ${who}${invited ? `, ${invited} invited` : ""}`;
}

/** Invite people: an email and a role. The person shows under People as "Invited". */
export function InviteModal({ open, onClose, workspace }: { open: boolean; onClose: () => void; workspace: WorkspaceInfo }) {
  const viewer = useViewer();
  const { invite } = useWorkspaces(viewer.id);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Invite["role"]>("Member");
  const [sent, setSent] = useState<string | null>(null);
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const close = () => {
    setEmail("");
    setSent(null);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={close}
      title={`Invite people to ${workspace.name}`}
      actions={
        sent ? (
          <button type="button" onClick={close} className={btnPrimary}>Done</button>
        ) : (
          <>
            <button type="button" onClick={close} className={btnOutline}>Cancel</button>
            <button
              type="button"
              disabled={!ok}
              onClick={() => {
                invite(workspace.id, { email: email.trim(), role });
                setSent(email.trim());
                setEmail("");
              }}
              className={btnPrimary}
            >
              Invite
            </button>
          </>
        )
      }
    >
      {sent ? (
        <p>
          <strong>{sent}</strong> is added to People as invited. This is a prototype, so no email was sent.
        </p>
      ) : (
        <>
          <p>They’ll see this workspace’s projects, agents and credits.</p>
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Email
            <input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="h-11 rounded-xl border border-line-strong bg-raised px-3 text-[15px] placeholder:text-ink-3" />
          </label>
          <div className="flex flex-col gap-1.5 text-sm text-ink">
            Role
            <div className="flex w-fit gap-1 rounded-xl bg-sunken p-1">
              {(["Member", "Admin"] as const).map((r) => (
                <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)} className={`h-9 rounded-[9px] px-3 text-[13px] ${role === r ? "border border-line-strong bg-raised font-medium" : "text-ink-2"}`}>
                  {r}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-2">{role === "Admin" ? "Can also invite people and change the plan." : "Can build and change projects."}</span>
          </div>
        </>
      )}
    </Modal>
  );
}

/** Create a workspace: a name, then you're switched to the new, empty workspace. */
export function CreateWorkspaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const viewer = useViewer();
  const router = useRouter();
  const { create } = useWorkspaces(viewer.id);
  const [name, setName] = useState("");
  const close = () => {
    setName("");
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={close}
      title="Create a workspace"
      actions={
        <>
          <button type="button" onClick={close} className={btnOutline}>Cancel</button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => {
              create(name.trim());
              close();
              router.push("/home");
            }}
            className={btnPrimary}
          >
            Create
          </button>
        </>
      }
    >
      <p>A workspace has its own projects, agents, credits, people and GitHub connection. You can invite people after.</p>
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Name
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marketing team" className="h-11 rounded-xl border border-line-strong bg-raised px-3 text-[15px] placeholder:text-ink-3" />
      </label>
      <p className="text-xs">This is a prototype: the new workspace is kept in this browser.</p>
    </Modal>
  );
}

const page = "mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 pt-8 pb-24 md:px-8 md:pt-10 md:pb-10";
const card = "flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5";

/** Workspace settings: name, people and invites, plan and billing. */
export function WorkspaceSettingsPage() {
  const { current, ws } = useWorkspaceList();
  const { projects } = useProjects();
  const { addOn } = useAddOn();
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState<string | null>(null);
  return (
    <div className={page}>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-ink-2">Workspace settings</span>
        <h1 className="font-serif text-[44px] leading-none">{current.name}</h1>
      </div>

      <div className={card}>
        <span className="text-lg font-semibold">Name</span>
        <div className="flex flex-wrap gap-2">
          <input
            aria-label="Workspace name"
            value={name ?? current.name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full max-w-sm rounded-[10px] border border-line-strong bg-raised px-3 text-sm"
          />
          <button
            type="button"
            disabled={name === null || !name.trim() || name.trim() === current.name}
            onClick={() => {
              ws.rename(current.id, name!.trim());
              setName(null);
            }}
            className={btnOutline + " disabled:opacity-50"}
          >
            Save
          </button>
        </div>
      </div>

      <div className={card}>
        <span className="flex items-center justify-between text-lg font-semibold">
          People
          <button type="button" onClick={() => setInviting(true)} className={btnPrimary}>
            <Icon name="people" size={14} />
            <span className="ml-1.5">Invite people</span>
          </button>
        </span>
        <ul className="flex flex-col">
          {current.people.map((p) => (
            <li key={p.name + p.role} className="flex items-center justify-between gap-3 border-t border-line py-3 text-sm first:border-0">
              <span className="flex min-w-0 items-center gap-3">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${p.invited ? "border border-dashed border-line-strong text-ink-2" : "bg-primary text-on-primary"}`}>
                  {p.invited ? <Icon name="people" size={13} /> : p.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{p.name}</span>
                  <span className="text-xs text-ink-2">{p.detail}</span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-ink-2">{p.role}</span>
                {p.invited && (
                  <button type="button" onClick={() => ws.uninvite(current.id, p.name)} className="text-[13px] text-accent">
                    Cancel invite
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={card}>
        <span className="flex items-center justify-between text-lg font-semibold">
          Plan and billing
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-normal text-accent-strong">{addOn ? `${current.plan} + Developer add-on` : current.plan}</span>
        </span>
        <p className="text-sm text-ink-2">
          {projects.length === 0 ? "No projects yet." : `${projects.length} project${projects.length === 1 ? "" : "s"}.`} Credits are shared by everyone in this workspace.
        </p>
        <span className="flex flex-wrap gap-2">
          <Link href="/usage" className={btnOutline}>See usage</Link>
          <Link href="/settings" className={btnOutline}>Developer add-on</Link>
        </span>
        <p className="text-xs text-ink-2">Prototype: there’s no real billing.</p>
      </div>

      <InviteModal open={inviting} onClose={() => setInviting(false)} workspace={current} />
    </div>
  );
}
