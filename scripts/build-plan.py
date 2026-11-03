"""Convert scripts/plan-source.txt (exported from the Claude Doc) into src/data/plan.json."""
import json, re, html, pathlib

root = pathlib.Path(__file__).parent
raw = html.unescape((root / "plan-source.txt").read_text())
lines = [l.rstrip() for l in raw.split("\n") if l.strip()]

sections, cur = [], None
intro = None
for l in lines:
    if l.startswith("# "):
        title = l[2:].strip()
    elif l.startswith("## "):
        cur = {"title": l[3:].strip(), "blocks": []}
        sections.append(cur)
    elif cur is None:
        if l.strip() not in ("·",):
            intro = l.strip() if intro is None and "·" not in l[:3] else intro
    else:
        if l.startswith("- "):
            if cur["blocks"] and cur["blocks"][-1]["t"] == "ul":
                cur["blocks"][-1]["items"].append(l[2:])
            else:
                cur["blocks"].append({"t": "ul", "items": [l[2:]]})
        else:
            cur["blocks"].append({"t": "p", "text": l})

LINK = re.compile(r"\[\[LINK (.*?)\|(.*?)\]\]")
def links_in(s): return [{"url": u, "label": t} for u, t in LINK.findall(s)]
def label_split(item):
    m = re.match(r"\*\*(.*?):?\*\*:?\s*(.*)", item)
    return (m.group(1).rstrip(":"), m.group(2)) if m else ("", item)

def lead(s, key):
    return s.replace(f"**{key}**", "").strip()

def unit(sec):
    """Split a section into summary / steps / links / done / notes."""
    out = {"summary": "", "steps": [], "linksText": "", "links": [], "done": "", "notes": []}
    for b in sec["blocks"]:
        if b["t"] == "ul":
            for it in b["items"]:
                lab, txt = label_split(it)
                out["steps"].append({"label": lab, "text": txt})
        else:
            t = b["text"]
            if t.startswith("**Links") or t.startswith("**Links for tonight"):
                out["linksText"] = re.sub(r"^\*\*Links[^*]*:\*\*\s*", "", t)
                out["links"] = links_in(t)
            elif t.startswith("**Done when:**"):
                out["done"] = lead(t, "Done when:")
            elif not out["summary"] and not out["steps"]:
                out["summary"] = t
            else:
                out["notes"].append(t)
    return out

START = {1:"2026-11-03",2:"2026-11-09",3:"2026-11-16",4:"2026-11-23",5:"2026-11-30",6:"2026-12-07",
         7:"2026-12-14",8:"2027-01-04",9:"2027-01-11",10:"2027-01-18",11:"2027-01-25",12:"2027-02-01"}
END = {1:"2026-11-06"}  # others are Mon+4 (Friday)
import datetime as dt
def fri(s): return (dt.date.fromisoformat(s)+dt.timedelta(days=4)).isoformat()

plan = {"title": title, "intro": intro, "kickoff": None, "changed": None, "rules": None,
        "weeks": [], "links": [], "after": None}
for s in sections:
    t = s["title"]
    m = re.match(r"Week (\d+) \((.*?)\)(?:, | )?:? ?(.*)", t)
    if t.startswith("Start tonight"):
        u = unit(s); u["title"] = t; plan["kickoff"] = u
    elif t.startswith("What changed"):
        plan["changed"] = {"title": t, "blocks": s["blocks"]}
    elif t.startswith("Ground rules"):
        plan["rules"] = {"title": t, "blocks": s["blocks"]}
    elif m:
        n = int(m.group(1)); u = unit(s)
        full = t.split("):", 1)
        topic = full[1].strip() if len(full) > 1 else m.group(3)
        u.update({"n": n, "dates": m.group(2), "topic": topic, "start": START[n], "end": END.get(n, fri(START[n])), "title": t})
        # gate detection
        for st in u["steps"]:
            g = re.search(r"Gate (\d)", st["label"])
            if g: u["gate"] = int(g.group(1)); st["gate"] = int(g.group(1))
        plan["weeks"].append(u)
    elif t.startswith("All links"):
        ps = [b["text"] for b in s["blocks"] if b["t"] == "p"]
        note = ps[0]
        i = ps.index("Use it for") + 1
        rows = ps[i:]
        plan["linksNote"] = note
        for a, b_, c in zip(rows[0::3], rows[1::3], rows[2::3]):
            L = links_in(a)[0]
            plan["links"].append({**L, "weeks": b_, "use": c})
    elif t.startswith("After the 90"):
        plan["after"] = {"title": t, "blocks": s["blocks"]}

pathlib.Path(root.parent / "src/data/plan.json").write_text(json.dumps(plan, indent=1, ensure_ascii=False))
print(len(plan["weeks"]), "weeks;", len(plan["links"]), "links; kickoff steps", len(plan["kickoff"]["steps"]))
for w in plan["weeks"]:
    print(w["n"], w["dates"], "|", w["topic"][:50], "| steps", len(w["steps"]), "| links", len(w["links"]), "| done", bool(w["done"]), "| notes", len(w["notes"]), "| gate", w.get("gate"))
