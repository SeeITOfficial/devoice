"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";

type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number | null;
  unlimited: boolean;
};

type EventData = {
  id: string;
  title: string;
  date: string;
  ticketTypes: TicketType[];
};

type WalkInTicket = {
  id: string;
  ticketCode: string;
  qrToken: string;
};

function QrCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 250,
        margin: 2,
        color: { dark: "#0d1a17", light: "#f2e9d8" },
      }).catch(console.error);
    }
  }, [value]);

  return <canvas ref={canvasRef} className="rounded-2xl" />;
}

export default function WalkInEntryPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [generating, setGenerating] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState<WalkInTicket[] | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${id}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Event not found");
        
        setEvent(result.event);
        if (result.event.ticketTypes.length > 0) {
          setSelectedType(result.event.ticketTypes[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading event");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  async function handleGenerate() {
    if (!selectedType) return;
    setGenerating(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${id}/walk-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTypeId: selectedType.id,
          quantity,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to generate ticket.");
      }

      setGeneratedTickets(result.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate ticket.");
    } finally {
      setGenerating(false);
    }
  }

  function handleReset() {
    setGeneratedTickets(null);
    setQuantity(1);
    setError("");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex items-center justify-center p-6 text-[#0d1a17]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b18a3b]">Loading...</p>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex flex-col items-center justify-center p-6 text-[#0d1a17]">
        <p className="text-red-700 uppercase tracking-[0.2em] font-bold text-sm text-center">{error}</p>
        <Link href="/" className="mt-6 text-xs uppercase tracking-[0.1em] underline text-[#b18a3b]">Back to Home</Link>
      </main>
    );
  }

  if (!event) return null;

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17] py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#b18a3b] mb-2">Event Entry</p>
          <h1 className="font-serif text-4xl leading-tight">{event.title}</h1>
        </div>

        {!generatedTickets ? (
          <div className="bg-white/50 border border-[#0d1a17]/10 rounded-[2rem] p-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center text-[#0d1a17]/60">Select Ticket</h2>
            
            <div className="space-y-4">
              {event.ticketTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedType?.id === type.id 
                      ? "border-[#c9a24b] bg-[#c9a24b]/10 text-[#0d1a17]" 
                      : "border-[#0d1a17]/10 hover:border-[#c9a24b]/50"
                  }`}
                >
                  <span className="font-bold tracking-wider">{type.name}</span>
                  <span>{type.price.toLocaleString()} UGX</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#0d1a17]/10 pt-8">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d1a17]/60">Quantity</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-[#0d1a17]/20 flex items-center justify-center hover:bg-black/5"
                >
                  -
                </button>
                <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-[#0d1a17]/20 flex items-center justify-center hover:bg-black/5"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold">Total Due</span>
                <span className="font-serif text-2xl text-[#b18a3b]">
                  {selectedType ? (selectedType.price * quantity).toLocaleString() : 0} UGX
                </span>
              </div>
              
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !selectedType}
                className="w-full rounded-full bg-[#0d1a17] text-[#f2e9d8] py-5 uppercase font-bold text-xs tracking-[0.2em] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Ticket"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {generatedTickets.map((ticket, index) => (
              <div key={ticket.id} className="bg-white/50 border border-[#0d1a17]/10 rounded-[2rem] p-8 flex flex-col items-center text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b] mb-4">
                  Ticket {index + 1} of {generatedTickets.length}
                </p>
                <div className="bg-white p-2 rounded-3xl shadow-sm mb-6 inline-block border border-[#0d1a17]/5">
                  <QrCanvas value={ticket.qrToken} />
                </div>
                <h3 className="font-serif text-2xl mb-2">{selectedType?.name}</h3>
                <p className="font-mono tracking-widest text-[#0d1a17]/60 mb-8">{ticket.ticketCode}</p>
                
                <div className="w-full bg-[#0d1a17] text-[#f2e9d8] p-4 rounded-xl">
                  <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-70 mb-1">Total to Pay</p>
                  <p className="text-xl font-serif">{((selectedType?.price || 0) * quantity).toLocaleString()} UGX</p>
                  <p className="text-[10px] uppercase tracking-widest mt-2">Pay cash at the entrance</p>
                </div>
              </div>
            ))}

            <button
              onClick={handleReset}
              className="w-full mt-6 rounded-full border border-[#0d1a17]/20 py-4 uppercase font-bold text-[10px] tracking-[0.2em] hover:bg-black/5"
            >
              Done / Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
