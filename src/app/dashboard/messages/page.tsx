"use client";

import { useState } from "react";

const demoEmails = [
  {
    id: "1",
    carrier: "Maersk Line",
    tag: "QUOTATION RECEIVED",
    tagColor: "amber",
    subject: "RE: Quote Request #SHA293-2",
    preview: "Attached are the updated spot rates for your 40' HC containers on the Shanghai-Rotterdam corridor...",
    time: "14:20 PM",
    refId: "29381-MSK",
    body: `Dear Arslan Logistics Team,

Thank you for your inquiry regarding the Shanghai to Rotterdam shipment.

We are pleased to provide the following updated spot rates for 40' HC containers:

Ocean Freight: $4,850.50 per unit
Vessel / Voyage: MAERSK HANOI / 431W
ETD Shanghai: Oct 30, 2024
ETA Rotterdam: Dec 02, 2024

Rate validity: 7 business days from the date of this email.

Please note that BAF (Bunker Adjustment Factor) and THC (Terminal Handling Charges) may apply additionally at origin and destination.

We look forward to your confirmation.

Best regards,
The Maersk Spot Team`,
    detected: { freight: "$4,850.50", vessel: "MAERSK HANOI / 431W", etd: "Oct 30, 2024", eta: "Dec 02, 2024" },
  },
  {
    id: "2",
    carrier: "MSC Mediterranean",
    tag: "BOOKING CONFIRMED",
    tagColor: "green",
    subject: "Booking Confirmation: MEDU6102831",
    preview: "Space confirmed on MSC AMBRA voy 234E. Your container has been allocated at Yangshan Terminal...",
    time: "11:05 AM",
    refId: "61028-MSC",
    body: `Dear Valued Customer,

We are pleased to confirm your booking:

Booking Reference: MEDU6102831
Vessel: MSC AMBRA Voyage 234E
Container: 40' HC
Origin: Shanghai (Yangshan Terminal)
Destination: Los Angeles
ETD: Nov 05, 2024
ETA: Nov 28, 2024

Please ensure your cargo is delivered to the terminal by Nov 03, 2024.

Regards,
MSC Booking Team`,
    detected: null,
  },
  {
    id: "3",
    carrier: "CMA CGM Support",
    tag: "INQUIRY SENT",
    tagColor: "red",
    subject: "Inquiry #CMA-882: Rate Validity",
    preview: "We are reviewing your inquiry regarding detention and demurrage charges for the Jeddah shipment...",
    time: "Yesterday",
    refId: "00923-CMA",
    body: `Dear Arslan Integrated Solutions,

Thank you for reaching out regarding detention and demurrage charges on your recent Jeddah shipment.

We are currently reviewing the case and will respond within 2-3 business days. Your inquiry reference is CMA-882.

For urgent matters, please contact our local office at +90 212 XXX XXXX.

Best regards,
CMA CGM Customer Support`,
    detected: null,
  },
];

const tagColors: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
};

export default function MessagesPage() {
  const [selected, setSelected] = useState(demoEmails[0]);
  const [tab, setTab] = useState("all");
  const [reply, setReply] = useState("");

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Email List */}
      <div className="w-full md:w-[380px] border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Integrated Carrier Inbox</h2>
          <div className="flex gap-2 overflow-x-auto">
            {["all", "quotation", "booking", "alerts"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${tab === t ? "bg-[#137fec] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t === "all" ? "All Carriers" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Email Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {demoEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelected(email)}
              className={`p-4 cursor-pointer transition-colors ${selected.id === email.id ? "bg-[#137fec]/5 border-l-2 border-l-[#137fec]" : "hover:bg-slate-50 border-l-2 border-l-transparent"}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-slate-900">{email.carrier}</span>
                <span className="text-[11px] text-slate-400">{email.time}</span>
              </div>
              <h5 className="text-sm font-semibold text-slate-800 truncate mb-1">{email.subject}</h5>
              <p className="text-xs text-slate-500 line-clamp-1">{email.preview}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tagColors[email.tagColor]}`}>
                  {email.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {email.refId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {/* Actions Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex gap-2">
            {["check", "flag", "delete", "forward"].map((icon) => (
              <button key={icon} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </button>
            ))}
          </div>
          {selected.detected && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-semibold hover:bg-[#137fec]/90">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              One-Click Quote Extraction
            </button>
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900">{selected.subject}</h2>
              {selected.detected && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Quotation Detected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{selected.carrier}</span>
              <span>·</span>
              <span>{selected.time}</span>
            </div>

            {/* AI Detected Data */}
            {selected.detected && (
              <div className="border-2 border-dashed border-[#137fec]/30 rounded-xl p-5 mb-6 bg-[#137fec]/5 relative">
                <span className="absolute -top-3 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">AI Detected Data</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Ocean Freight</p>
                    <p className="text-xl font-black text-slate-900">{selected.detected.freight}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Vessel / Voyage</p>
                    <p className="text-sm font-bold text-slate-900">{selected.detected.vessel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">ETD</p>
                    <p className="text-sm font-bold text-slate-900">{selected.detected.etd}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">ETA</p>
                    <p className="text-sm font-bold text-slate-900">{selected.detected.eta}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 pt-3 border-t border-[#137fec]/10">
                  <button className="text-sm text-slate-500 hover:text-slate-700 font-medium">Reject Data</button>
                  <button className="text-sm text-[#137fec] font-bold flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    Sync to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Email Body */}
            <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
              {selected.body}
            </div>
          </div>
        </div>

        {/* Reply Composer */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec]"
              placeholder={`Reply to ${selected.carrier}...`}
            />
            <button className="p-2 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">attach_file</span></button>
            <button className="w-10 h-10 bg-[#137fec] text-white rounded-full flex items-center justify-center hover:bg-[#137fec]/90">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
