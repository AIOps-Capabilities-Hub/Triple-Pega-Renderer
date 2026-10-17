import { useEffect, useMemo, useState } from "react";

const CARS = [
  { id: "e6", name: "Nova E6", kind: "Electric sedan", price: 2450000, range: "465 km", tag: "Lower running cost" },
  { id: "hybrid", name: "Civic Hybrid", kind: "Hybrid sedan", price: 1980000, range: "900+ km", tag: "Balanced everyday choice" },
  { id: "suv", name: "Trail X", kind: "Compact SUV", price: 1725000, range: "620 km", tag: "Extra family space" },
];
const SYSTEMS = [
  ["structure", "Structure and foundation", "Walls, cracks, floors and settlement"],
  ["roof", "Roof and drainage", "Leaks, gutters and waterproofing"],
  ["electrical", "Electrical systems", "Panels, outlets and visible hazards"],
  ["plumbing", "Plumbing and water", "Fixtures, leaks, pressure and drainage"],
  ["hvac", "HVAC and ventilation", "Cooling, heating and air circulation"],
  ["safety", "Fire and life safety", "Alarms, extinguishers and exit paths"],
];
const RATINGS = ["Good", "Monitor", "Repair", "Urgent"];
const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const SAMPLE_CASES = [
  { id: "RT-10422", flow: "retirement", title: "Retirement readiness estimate", type: "Retirement Planning", owner: "Demo User", status: "Draft", updated: "Today" },
  { id: "IN-20817", flow: "inspection", title: "Lakeview office inspection", type: "Property Inspection", owner: "Demo Inspector", status: "In review", updated: "Yesterday" },
  { id: "VP-30091", flow: "vehicle", title: "Hybrid vehicle application", type: "Vehicle Purchase", owner: "Demo Applicant", status: "Awaiting selection", updated: "Oct 06" },
];

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { const saved = window.localStorage.getItem(key); if (saved !== null) return JSON.parse(saved); } catch { /* Storage is optional. */ }
    return initialValue;
  });
  useEffect(() => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep working in memory. */ } }, [key, value]);
  return [value, setValue];
}

function Field({ label, value, onChange, type = "text", options, min, max, step, hint }) {
  return <label className="mock-field"><span>{label}</span>{options
    ? <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option value={item} key={item}>{item}</option>)}</select>
    : <input type={type} value={value} min={min} max={max} step={step} onChange={(event) => onChange(type === "number" ? Number(event.target.value || 0) : event.target.value)} />}
    {hint && <small>{hint}</small>}</label>;
}

function Heading({ eyebrow, title, description, action }) {
  return <div className="mock-heading"><div><span className="mock-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function Progress({ current, labels }) {
  return <div className="mock-progress-steps">{labels.map((label, index) => <div key={label} className={"mock-progress-step" + (current === index ? " current" : current > index ? " done" : "")}><span>{current > index ? "✓" : String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></div>)}</div>;
}

function CasesTable({ cases, onOpen }) {
  return <div className="mock-table-wrap"><table className="mock-table"><thead><tr><th>Case / title</th><th>Workflow</th><th>Owner</th><th>Updated</th><th>Status</th><th /></tr></thead><tbody>{cases.length ? cases.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.id}</small></td><td>{item.type}</td><td>{item.owner}</td><td>{item.updated}</td><td><span className={"mock-status status-" + item.status.toLowerCase().replace(/[^a-z]+/g, "-")}>{item.status}</span></td><td><button className="mock-link-button" onClick={() => onOpen(item)}>Open →</button></td></tr>) : <tr><td colSpan="6" className="mock-no-cases"><strong>No local cases</strong><p>Save or submit a workflow to create a browser-local record.</p></td></tr>}</tbody></table></div>;
}

export default function MockModeApp() {
  const [page, setPage] = useState("overview");
  const [notice, setNotice] = useState("");
  const [cases, setCases] = useLocalState("triple-pega-mock-cases", SAMPLE_CASES);
  const [retirement, setRetirement] = useLocalState("triple-pega-mock-retirement", { name: "Alex Morgan", age: 34, retireAge: 60, savings: 1850000, contribution: 32000, returnRate: 8, spending: 85000, income: 15000 });
  const [property, setProperty] = useLocalState("triple-pega-mock-property", { name: "Lakeview Business Centre", kind: "Commercial office", address: "18 Lakeview Road, Pune", date: "2026-10-15", inspector: "Demo Inspector", priority: "Medium", notes: "Check HVAC noise on level three and verify roof drainage after heavy rain.", cost: 45000 });
  const [ratings, setRatings] = useLocalState("triple-pega-mock-ratings", { structure: "Good", roof: "Monitor", electrical: "Good", plumbing: "Repair", hvac: "Repair", safety: "Good" });
  const [inspectionStep, setInspectionStep] = useState(0);
  const [vehicleStep, setVehicleStep] = useState(0);
  const [carId, setCarId] = useLocalState("triple-pega-mock-car", "hybrid");
  const [applicant, setApplicant] = useLocalState("triple-pega-mock-applicant", { name: "Avery Patel", email: "avery@example.test", phone: "98765 43210", income: 1800000, employment: "Salaried" });
  const [finance, setFinance] = useLocalState("triple-pega-mock-finance", { downPayment: 450000, term: 5, interest: 9.25, tradeIn: 0, insurance: "Comprehensive" });

  const projection = useMemo(() => {
    const years = Math.max(0, Number(retirement.retireAge) - Number(retirement.age));
    const r = Number(retirement.returnRate) / 1200;
    const n = years * 12;
    const growth = Math.pow(1 + r, n);
    const added = r === 0 ? Number(retirement.contribution) * n : Number(retirement.contribution) * (growth - 1) / r;
    const corpus = Math.max(0, Number(retirement.savings) * growth + added);
    const target = Math.max(0, Number(retirement.spending) - Number(retirement.income)) * 12 / 0.04;
    const points = Array.from({ length: 6 }, (_, index) => {
      const year = Math.round(years * index / 5);
      const count = year * 12;
      const factor = Math.pow(1 + r, count);
      const deposits = r === 0 ? Number(retirement.contribution) * count : Number(retirement.contribution) * (factor - 1) / r;
      return { year, value: Math.max(0, Number(retirement.savings) * factor + deposits) };
    });
    return { years, corpus, target, gap: Math.max(0, target - corpus), progress: target ? Math.min(100, corpus / target * 100) : 100, points };
  }, [retirement]);
  const car = CARS.find((item) => item.id === carId) || CARS[0];
  const loan = Math.max(0, car.price - Number(finance.downPayment) - Number(finance.tradeIn));
  const monthlyRate = Number(finance.interest) / 1200;
  const paymentCount = Math.max(1, Number(finance.term) * 12);
  const emi = monthlyRate === 0 ? loan / paymentCount : loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -paymentCount));
  const repairCount = Object.values(ratings).filter((item) => item === "Repair" || item === "Urgent").length;

  function edit(setter, key, value) { setter((current) => ({ ...current, [key]: value })); }
  function announce(message) { setNotice(message); window.setTimeout(() => setNotice(""), 4000); }
  function saveCase(flow, title, status, prefix, owner) {
    const old = cases.find((item) => item.flow === flow && item.status === "Draft");
    const record = { id: old ? old.id : prefix + "-" + String(Date.now()).slice(-5), flow, title, status, type: flow === "retirement" ? "Retirement Planning" : flow === "inspection" ? "Property Inspection" : "Vehicle Purchase", owner: owner || "Demo User", updated: "Just now" };
    setCases((current) => [record, ...current.filter((item) => item.id !== record.id)].slice(0, 15));
    announce(record.id + " saved locally; no Pega request was made.");
  }
  function openCase(item) { setPage(item.flow); setInspectionStep(0); setVehicleStep(0); }

  const nav = [
    { id: "overview", symbol: "▦", label: "Overview" },
    { id: "retirement", symbol: "◷", label: "Retirement Planning" },
    { id: "inspection", symbol: "⌂", label: "Property Inspection" },
    { id: "vehicle", symbol: "↗", label: "Vehicle Purchase" },
    { id: "cases", symbol: "▤", label: "Recent Cases" },
  ];

  return <div className="mock-workspace">
    <aside className="mock-sidebar">
      <div className="mock-sidebar-brand"><span>DEMO WORKSPACE</span><strong>Solutions hub</strong><small>Three workflows · local simulation</small></div>
      <nav aria-label="Mock workspace navigation">{nav.map((item) => <button key={item.id} className={"mock-nav-item" + (page === item.id ? " active" : "")} onClick={() => setPage(item.id)}><span>{item.symbol}</span>{item.label}{item.id === "cases" && <small>{cases.length}</small>}</button>)}</nav>
      <div className="mock-sidebar-bottom"><i /> <div><strong>Offline simulation</strong><small>API requests disabled</small></div></div>
    </aside>

    <main className="mock-main">
      <div className="mock-topbar"><span>Workspace <b>/</b> {nav.find((item) => item.id === page)?.label}</span><label className="mock-local-badge">● MOCK DATA ONLY</label></div>
      {notice && <div role="status" className="mock-toast">{notice}</div>}

      {page === "overview" && <div className="mock-content">
        <section className="mock-hero"><div><span className="mock-eyebrow">OFFLINE DEMO ENVIRONMENT</span><h1>Good afternoon, Alex.</h1><p>Explore connected journeys from planning to inspection and purchase, without a Pega connection.</p><div className="mock-actions"><button className="mock-button main" onClick={() => setPage("retirement")}>Start a workflow →</button><button className="mock-button light" onClick={() => setPage("cases")}>Browse sample cases</button></div></div><div className="mock-hero-art" aria-hidden="true"><span>LOCAL</span><strong>100%</strong><small>independent demo</small><i>✦</i></div></section>
        <div className="mock-metrics"><article><span>Demo cases</span><strong>{cases.length}</strong><small>Stored in this browser</small></article><article><span>Available journeys</span><strong>03</strong><small>All workflows available</small></article><article><span>Pega calls</span><strong>0</strong><small>Live app is not mounted</small></article><article><span>Configuration needed</span><strong>None</strong><small>No OAuth secrets required</small></article></div>
        <Heading eyebrow="WORKFLOW CATALOGUE" title="Choose a journey" description="Editable sample data, realistic state changes and local-only submissions." />
        <div className="mock-flow-cards">
          <button className="mock-flow-card" onClick={() => setPage("retirement")}><span className="mock-flow-icon mint">◷</span><small>FINANCIAL WELLNESS</small><strong>Retirement planning</strong><p>Estimate a future corpus, track the gap to your target and test different savings scenarios.</p><footer>Calculator and projection <b>→</b></footer></button>
          <button className="mock-flow-card" onClick={() => { setPage("inspection"); setInspectionStep(0); }}><span className="mock-flow-icon lavender">⌂</span><small>PROPERTY OPERATIONS</small><strong>Property inspection</strong><p>Review condition, capture findings and create a maintenance recommendation.</p><footer>3-step inspection <b>→</b></footer></button>
          <button className="mock-flow-card" onClick={() => { setPage("vehicle"); setVehicleStep(0); }}><span className="mock-flow-icon amber">↗</span><small>CUSTOMER JOURNEYS</small><strong>Vehicle purchase</strong><p>Compare options, enter applicant details and preview a financing estimate.</p><footer>Comparison and financing <b>→</b></footer></button>
        </div>
        <Heading eyebrow="RECENT ACTIVITY" title="Case activity" description="Sample records let you explore the experience immediately." action={<button className="mock-link-button" onClick={() => setPage("cases")}>View all cases →</button>} />
        <CasesTable cases={cases.slice(0, 3)} onOpen={openCase} />
      </div>}

      {page === "retirement" && <div className="mock-content">
        <Heading eyebrow="FINANCIAL WELLNESS · DEMO" title="Retirement planning" description="Change an assumption to recalculate the projection instantly. Illustrative estimates, not financial advice." action={<span className="mock-case-id">Scenario RT-10422</span>} />
        <div className="mock-retirement-layout">
          <section className="mock-panel"><header><div><h3>Your assumptions</h3><p>Adjust the values to explore a scenario.</p></div><span>EDIT</span></header><div className="mock-fields">
            <Field label="Your name" value={retirement.name} onChange={(v) => edit(setRetirement, "name", v)} />
            <Field label="Current age" type="number" min={18} max={100} value={retirement.age} onChange={(v) => edit(setRetirement, "age", v)} />
            <Field label="Retirement age" type="number" min={retirement.age} max={100} value={retirement.retireAge} onChange={(v) => edit(setRetirement, "retireAge", v)} />
            <Field label="Current savings (₹)" type="number" min={0} step={50000} value={retirement.savings} onChange={(v) => edit(setRetirement, "savings", v)} />
            <Field label="Monthly contribution (₹)" type="number" min={0} step={1000} value={retirement.contribution} onChange={(v) => edit(setRetirement, "contribution", v)} />
            <Field label="Expected annual return (%)" type="number" min={0} max={20} step={0.5} value={retirement.returnRate} onChange={(v) => edit(setRetirement, "returnRate", v)} hint="Assumption, not a guarantee." />
            <Field label="Retirement spending / month (₹)" type="number" min={0} step={5000} value={retirement.spending} onChange={(v) => edit(setRetirement, "spending", v)} />
            <Field label="Other income / month (₹)" type="number" min={0} step={1000} value={retirement.income} onChange={(v) => edit(setRetirement, "income", v)} />
          </div><div className="mock-actions"><button className="mock-button main" onClick={() => saveCase("retirement", "Retirement readiness estimate", "Draft", "RT", retirement.name)}>Save scenario locally</button><button className="mock-button pale" onClick={() => setRetirement({ name: "Alex Morgan", age: 34, retireAge: 60, savings: 1850000, contribution: 32000, returnRate: 8, spending: 85000, income: 15000 })}>Reset</button></div></section>
          <div className="mock-results"><section className="mock-corpus"><span>PROJECTED RETIREMENT CORPUS</span><strong>{INR.format(projection.corpus)}</strong><small>In {projection.years} years · {retirement.returnRate}% assumed annual return</small><div className="mock-target-label"><span>Progress to target</span><b>{projection.progress.toFixed(1)}%</b></div><div className="mock-meter"><span style={{ width: projection.progress + "%" }} /></div></section>
            <div className="mock-result-pair"><article><span>Target corpus</span><strong>{INR.format(projection.target)}</strong><small>Illustrative 4% withdrawal rule</small></article><article><span>Estimated gap</span><strong>{INR.format(projection.gap)}</strong><small>{projection.gap === 0 ? "Target reached in this scenario" : "Additional corpus to target"}</small></article></div>
            <section className="mock-panel"><header><div><h3>Corpus projection</h3><p>Estimated value by year</p></div></header><div className="mock-chart">{projection.points.map((point, index) => { const top = Math.max(1, ...projection.points.map((row) => row.value)); return <div className="mock-chart-col" key={point.year + "-" + index}><small>{INR.format(point.value)}</small><div><i style={{ height: Math.max(5, point.value / top * 100) + "%" }} /></div><span>Year {point.year}</span></div>; })}</div></section>
          </div>
        </div>
      </div>}

      {page === "inspection" && <div className="mock-content">
        <Heading eyebrow="PROPERTY OPERATIONS · DEMO" title="Property inspection" description="Capture a condition assessment and create a local maintenance recommendation." action={<span className="mock-case-id">Case IN-20817</span>} />
        <Progress current={inspectionStep} labels={["Property details", "Condition review", "Summary and submit"]} />
        <section className="mock-panel mock-wizard">
          {inspectionStep === 0 && <><header><div><h3>Inspection details</h3><p>Identify the asset and schedule the visit.</p></div><span>STEP 1 OF 3</span></header><div className="mock-fields"><Field label="Property name" value={property.name} onChange={(v) => edit(setProperty, "name", v)} /><Field label="Property type" value={property.kind} onChange={(v) => edit(setProperty, "kind", v)} options={["Residential apartment", "Commercial office", "Retail unit", "Warehouse", "Industrial facility"]} /><Field label="Address" value={property.address} onChange={(v) => edit(setProperty, "address", v)} /><Field label="Inspection date" type="date" value={property.date} onChange={(v) => edit(setProperty, "date", v)} /><Field label="Inspector" value={property.inspector} onChange={(v) => edit(setProperty, "inspector", v)} /><Field label="Overall priority" value={property.priority} onChange={(v) => edit(setProperty, "priority", v)} options={["Low", "Medium", "High", "Critical"]} /></div></>}
          {inspectionStep === 1 && <><header><div><h3>Condition assessment</h3><p>Rate each visible system. Findings are illustrative.</p></div><span>STEP 2 OF 3</span></header><div className="mock-system-list">{SYSTEMS.map(([id, label, detail]) => <div key={id}><span className="mock-system-icon">{id === "electrical" ? "ϟ" : id === "hvac" ? "◉" : "⌂"}</span><div><strong>{label}</strong><small>{detail}</small></div><select className={"mock-rating rating-" + (ratings[id] || "Good").toLowerCase()} value={ratings[id] || "Good"} onChange={(event) => setRatings((current) => ({ ...current, [id]: event.target.value }))}>{RATINGS.map((rating) => <option key={rating}>{rating}</option>)}</select></div>)}</div><div className="mock-fields mock-after-list"><Field label="Estimated repair cost (₹)" type="number" min={0} step={1000} value={property.cost} onChange={(v) => edit(setProperty, "cost", v)} /><Field label="Findings and recommendations" value={property.notes} onChange={(v) => edit(setProperty, "notes", v)} /></div></>}
          {inspectionStep === 2 && <><header><div><h3>Review inspection</h3><p>Confirm the details before creating the local case.</p></div><span>STEP 3 OF 3</span></header><div className="mock-review-grid"><article><span>Property</span><strong>{property.name || "Untitled property"}</strong><small>{property.kind}</small></article><article><span>Visit date</span><strong>{property.date || "Not set"}</strong><small>{property.inspector || "No inspector"}</small></article><article><span>Priority and follow-up</span><strong>{property.priority}</strong><small>{repairCount} system(s) need repair or urgent follow-up</small></article><article><span>Estimated maintenance</span><strong>{INR.format(property.cost || 0)}</strong><small>Planning estimate only</small></article></div><div className="mock-notes"><span>FIELD NOTES</span><p>{property.notes || "No findings recorded."}</p></div><div className="mock-disclaimer">Submitting creates a sample case in browser storage. It does not create a Pega case.</div></>}
          <footer className="mock-wizard-footer"><button className="mock-button pale" disabled={inspectionStep === 0} onClick={() => setInspectionStep((v) => Math.max(0, v - 1))}>← Previous</button><div><button className="mock-link-button" onClick={() => saveCase("inspection", property.name || "Property inspection", "Draft", "IN", property.inspector)}>Save draft</button>{inspectionStep < 2 ? <button className="mock-button main" onClick={() => setInspectionStep((v) => Math.min(2, v + 1))}>Continue →</button> : <button className="mock-button main" onClick={() => { saveCase("inspection", property.name || "Property inspection", "Submitted locally", "IN", property.inspector); setPage("cases"); }}>Submit inspection</button>}</div></footer>
        </section>
      </div>}

      {page === "vehicle" && <div className="mock-content">
        <Heading eyebrow="CUSTOMER JOURNEY · DEMO" title="Vehicle purchase" description="Compare vehicles, complete applicant details and preview financing." action={<span className="mock-case-id">Case VP-30091</span>} />
        <Progress current={vehicleStep} labels={["Compare vehicles", "Applicant details", "Financing review"]} />
        <section className="mock-panel mock-wizard">
          {vehicleStep === 0 && <><header><div><h3>Choose your vehicle</h3><p>Select an option to personalize the estimate.</p></div><span>STEP 1 OF 3</span></header><div className="mock-car-grid">{CARS.map((item) => <button key={item.id} className={"mock-car-card" + (carId === item.id ? " selected" : "")} onClick={() => setCarId(item.id)}><div className={"mock-car-art car-" + item.id}><span>{item.id === "e6" ? "EV" : item.id === "hybrid" ? "HYBRID" : "SUV"}</span><i /><b /></div><div className="mock-car-copy"><small>{item.kind}</small><strong>{item.name}</strong><h4>{INR.format(item.price)}</h4><p>{item.range} · {item.tag}</p><footer>{carId === item.id ? "✓ Selected" : "Select vehicle"} <b>→</b></footer></div></button>)}</div><p className="mock-footnote">Illustrative catalogue. All specifications are local sample content.</p></>}
          {vehicleStep === 1 && <><header><div><h3>Applicant details</h3><p>Use sample data or replace it with your own demo scenario.</p></div><span>STEP 2 OF 3</span></header><div className="mock-selected-car"><strong>{car.name}</strong><span>{car.kind} · {INR.format(car.price)}</span><button className="mock-link-button" onClick={() => setVehicleStep(0)}>Change vehicle</button></div><div className="mock-fields"><Field label="Applicant name" value={applicant.name} onChange={(v) => edit(setApplicant, "name", v)} /><Field label="Email address" type="email" value={applicant.email} onChange={(v) => edit(setApplicant, "email", v)} /><Field label="Phone number" value={applicant.phone} onChange={(v) => edit(setApplicant, "phone", v)} /><Field label="Annual income (₹)" type="number" min={0} step={50000} value={applicant.income} onChange={(v) => edit(setApplicant, "income", v)} /><Field label="Employment type" value={applicant.employment} onChange={(v) => edit(setApplicant, "employment", v)} options={["Salaried", "Self-employed", "Business owner", "Retired"]} /></div></>}
          {vehicleStep === 2 && <><header><div><h3>Financing estimate</h3><p>Non-binding local estimate; no lender is contacted.</p></div><span>STEP 3 OF 3</span></header><div className="mock-emi"><span>ESTIMATED MONTHLY PAYMENT</span><strong>{INR.format(emi)}</strong><small>{finance.term} years · illustrative rate {finance.interest}% p.a.</small></div><div className="mock-fields"><Field label="Down payment (₹)" type="number" min={0} step={25000} value={finance.downPayment} onChange={(v) => edit(setFinance, "downPayment", v)} /><Field label="Loan term (years)" type="number" min={1} max={8} value={finance.term} onChange={(v) => edit(setFinance, "term", v)} /><Field label="Interest rate (%)" type="number" min={0} max={25} step={0.25} value={finance.interest} onChange={(v) => edit(setFinance, "interest", v)} /><Field label="Trade-in value (₹)" type="number" min={0} step={10000} value={finance.tradeIn} onChange={(v) => edit(setFinance, "tradeIn", v)} /><Field label="Insurance package" value={finance.insurance} onChange={(v) => edit(setFinance, "insurance", v)} options={["Comprehensive", "Third-party", "Comprehensive + roadside assistance"]} /></div><div className="mock-review-grid"><article><span>Vehicle price</span><strong>{INR.format(car.price)}</strong></article><article><span>Amount financed</span><strong>{INR.format(loan)}</strong></article><article><span>Estimated interest</span><strong>{INR.format(Math.max(0, emi * paymentCount - loan))}</strong></article><article><span>Applicant</span><strong>{applicant.name || "Not provided"}</strong></article></div><div className="mock-disclaimer">Illustrative EMI only. Actual rates, fees, eligibility and approved amounts may differ.</div></>}
          <footer className="mock-wizard-footer"><button className="mock-button pale" disabled={vehicleStep === 0} onClick={() => setVehicleStep((v) => Math.max(0, v - 1))}>← Previous</button><div>{vehicleStep > 0 && <button className="mock-link-button" onClick={() => saveCase("vehicle", car.name + " application", "Draft", "VP", applicant.name)}>Save draft</button>}{vehicleStep < 2 ? <button className="mock-button main" onClick={() => setVehicleStep((v) => Math.min(2, v + 1))}>Continue →</button> : <button className="mock-button main" onClick={() => { saveCase("vehicle", car.name + " application", "Submitted locally", "VP", applicant.name); setPage("cases"); }}>Submit application</button>}</div></footer>
        </section>
      </div>}

      {page === "cases" && <div className="mock-content"><Heading eyebrow="LOCAL CASE STORE" title="Recent cases" description="Mock records are stored in this browser only and are not synced to a server." action={<span className="mock-local-badge">● BROWSER STORAGE</span>} /><CasesTable cases={cases} onOpen={openCase} /><div className="mock-case-actions"><button className="mock-button pale" onClick={() => { setCases(SAMPLE_CASES); announce("Sample cases restored."); }}>Restore sample cases</button><button className="mock-link-button danger" onClick={() => { setCases([]); announce("Local case list cleared."); }}>Clear local case list</button></div><p className="mock-footnote">These are simulated records, not real customer data. Clearing this browser's site data removes local changes.</p></div>}
    </main>
  </div>;
}
