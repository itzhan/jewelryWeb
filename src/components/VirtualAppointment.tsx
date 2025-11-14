'use client';

import { Calendar } from "lucide-react";

export default function VirtualAppointment() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
          <Calendar className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Virtual Appointment
          </p>
          <h3 className="text-lg font-semibold text-gray-900">
            See Keyzar&apos;s jewelry up close with a personal appointment.
          </h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Explore engagement rings, diamonds, and fine jewelry with an expert in a
        one-on-one virtual session. Bring your ideas, and we&apos;ll guide you
        through every detail.
      </p>
      <button className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-black">
        Book Appointment
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
