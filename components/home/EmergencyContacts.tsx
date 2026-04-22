"use client";

import React from "react";
import { Ambulance, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmergencyContacts() {
    const contacts = [
        {
            icon: Ambulance,
            title: "Ambulance",
            number: "108",
            color: "red",
            bg: "bg-red-500/10",
            text: "text-red-500",
        },
        {
            icon: Phone,
            title: "Medical Helpline",
            number: "102",
            color: "teal",
            bg: "bg-teal-500/10",
            text: "text-teal-500",
        },
        {
            icon: Heart,
            title: "Blood Bank",
            number: "104",
            color: "rose",
            bg: "bg-rose-500/10",
            text: "text-rose-500",
        },
    ];

    return (
        <section className="py-12 bg-red-500/5 border-y border-red-500/10">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-red-500 flex items-center justify-center gap-3">
                        <span className="animate-pulse">🚨</span> Emergency Medical Contacts
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Quick access to emergency services
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contacts.map((contact, idx) => (
                        <div
                            key={idx}
                            className="bg-background/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-xl shadow-red-500/5 group"
                        >
                            <div
                                className={`w-16 h-16 rounded-full ${contact.bg} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                            >
                                <contact.icon className={`w-8 h-8 ${contact.text}`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{contact.title}</h3>
                            <p className={`text-4xl font-black ${contact.text} mb-6`}>
                                {contact.number}
                            </p>
                            <Button
                                className={`w-full ${contact.color === "red"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : contact.color === "teal"
                                            ? "bg-teal-500 hover:bg-teal-600"
                                            : "bg-rose-500 hover:bg-rose-600"
                                    } text-white rounded-full`}
                                onClick={() => window.open(`tel:${contact.number}`, "_self")}
                            >
                                <Phone className="w-4 h-4 mr-2" /> Call Now
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
