// src/components/modals/InfoModal.jsx
import React, { useEffect, useRef } from "react";

const TITLES = {
  about: "About",
  how: "How It Works",
  features: "Features",
  help: "Help",
};

const CONTENT = {
  about: (
    <section className="space-y-6">
      {/* Paragraph */}
      <p
        className="text-[15px] leading-7 md:text-[16px]"
        style={{ textAlign: "justify", textJustify: "inter-word" }}
      >
        This offline simulation is a hands-on Food &amp; Beverages POS and
        Inventory management system designed for the College of Business
        Administration. It replicates real F&amp;B operations so students can
        practice sales transactions, stock inventory management, supplier
        recording, and managerial reporting without affecting live systems,
        supporting role-based tasks for cashiers and admins and enabling safe,
        repeatable practice of operational and decision-making skills. This
        system also includes managing sales transactions, void logs and display
        real-time data analytics dashboard.
      </p>

      {/* OUR TEAM card */}
      <div className="rounded-2xl bg-[#7A0E0E] text-white px-8 py-6">
        <h3 className="text-center font-semibold tracking-wide">OUR TEAM</h3>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Leader (center, spans both columns) */}
          <div className="md:col-span-2 flex flex-col items-center gap-1">
            <div className="h-14 w-14 rounded-full bg-neutral-300 overflow-hidden">
              <img src="/team/leader.jpg" alt="Project Leader" className="h-full w-full object-cover" />
            </div>
            <div className="text-sm opacity-90 mt-1">Project Leader</div>
            <div className="text-[13px] mt-0.5">Lanticse, Rose Ann</div>
          </div>

          {/* Backend Developer */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-300 overflow-hidden shrink-0">
              <img src="mbj.jpg" alt="Backend Developer" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-sm">Backend Developer</div>
              <div className="text-[12px] opacity-90 mt-0.5">Jamil, Bless Mycho</div>
            </div>
          </div>

          {/* Quality Assurance (QA) */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-300 overflow-hidden shrink-0">
              <img src="jdm.jpg" alt="Quality Assurance" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-sm">Quality Assurance/ Frontend</div>
              <div className="text-[12px] opacity-90 mt-0.5">Milan, Jhapet Dave </div>
            </div>
          </div>

          {/* Technical Writer */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-300 overflow-hidden shrink-0">
              <img src="/team/writer.jpg" alt="Technical Writer" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-sm">Technical Writer</div>
              <div className="text-[12px] opacity-90 mt-0.5">Villarde, John Paul</div>
            </div>
          </div>

          {/* Frontend Developer */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-300 overflow-hidden shrink-0">
              <img src="gjm.jpg" alt="Frontend Developer" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-sm">Frontend Developer</div>
              <div className="text-[12px] opacity-90 mt-0.5">Montajes, Genesis John </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  ),

  how: (
    <ol>
      <li>
        Sign in with your school ID and password. Teachers use a special admin
        ID; students use IDs from the uploaded CSV.
      </li>
      <li>
        Choose a role: <strong>Admin</strong> (manage inventory, suppliers,
        reports) or <strong>Cashier</strong> (take orders, receipt/void).
      </li>
      <li>
        Place orders in POS. The system applies item rules, sizes, add-ons, and
        stock deductions; low-stock alerts appear on the Admin dashboard.
      </li>
      <li>
        Cashier may request a void. Admin approves/denies; audit entries are
        generated.
      </li>
      <li>
        Admin manages items, suppliers, POS monitoring, and sales reports.
        Superadmin can reset data for training cycles.
      </li>
    </ol>
  ),
  features: (
    <ul>
      <li><strong>Role-based access</strong> — Admin &amp; Cashier; teacher has superadmin.</li>
      <li><strong>Items &amp; categories</strong> — description, sizes, add-ons, allergens, stock, status.</li>
      <li><strong>Real-time dashboard</strong> — revenue, top-sellers, stock levels, recent logins.</li>
      <li><strong>POS monitoring</strong> — full transaction list with filters and export.</li>
      <li><strong>Supplier management</strong> — receipts and stock updates.</li>
      <li><strong>Audit &amp; change logs</strong> — product/supplier changes, void approvals.</li>
      <li><strong>KVS</strong> — live order screen and status logs.</li>
      <li><strong>Simulation payments</strong> — card, cash, or QR (mocked).</li>
      <li><strong>Superadmin tools</strong> — reset transactions, logs, users, or full system.</li>
    </ul>
  ),
  help: (
    <ul>
      <li>Can’t log in? Confirm your school ID; ask instructor to re-upload CSV.</li>
      <li>Role issues? Switch roles on the Role Selection screen and retry.</li>
      <li>Resets or void approvals? Contact the teacher (superadmin).</li>
    </ul>
  ),
};


export default function InfoModal({
  isOpen,
  onClose,
  variant,
  title,
  children,
  maxWidth = "sm", // changed from "md" to "sm" for a narrower modal
  closeOnBackdrop = true,
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const widthMap = {
    sm: "max-w-md",      // ~28rem
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panelRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === overlayRef.current) onClose();
  };

  const resolvedTitle = title || TITLES[variant] || "Info";
  const resolvedBody = children ?? CONTENT[variant] ?? null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "w-[92%]",
          widthMap[maxWidth] || widthMap.lg,
          "rounded-2xl bg-white shadow-xl border border-neutral-200",
          "animate-in fade-in zoom-in duration-150",
        ].join(" ")}
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <span
              aria-hidden
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#B22222] text-white text-[12px] font-semibold select-none"
              title="Info"
            >
              i
            </span>

            <h2
              id="info-modal-title"
              className="absolute left-1/2 -translate-x-1/2 text-sm tracking-[0.08em] font-semibold text-neutral-800"
            >
              {resolvedTitle.toUpperCase()}
            </h2>

            <button
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-neutral-200" />

        {/* Body */}
        <div className="px-6 py-4 max-h:[70vh] md:max-h-[70vh] overflow-y-auto text-[13px] leading-relaxed text-neutral-800">
          <div className="[&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-5 [&>p]:mb-3">
            {resolvedBody}
          </div>
        </div>
      </div>
    </div>
  );
}
