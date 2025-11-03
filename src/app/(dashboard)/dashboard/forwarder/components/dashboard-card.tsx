"use client"

import { ArrowRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function FreightInquiryCard() {


  return (
    <div className="w-full max-w-2xl mb-6">
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 to-primary p-6 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-12 w-32 h-32 bg-rose-500/5 rounded-full"></div>

        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="relative z-10">
          <div className="inline-block mb-6">
            <span className="text-xs font-bold tracking-widest text-white uppercase">Neu!</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-balance">
              Jetzt mit Pivote neue Kunden finden und gewinnen!
          </h2>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/forwarder/frachtanfragen" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200 group">
              <span>Zu Frachtanfragen</span> 
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}