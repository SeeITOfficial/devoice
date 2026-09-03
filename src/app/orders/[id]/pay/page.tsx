"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type PaymentPageData = {
  order: {
    id: string;
    status: string;
    quantity: number;
    customerName: string;
    paymentMethod: string;
    totalAmount: number;
    event: {
      title: string;
      date: string;
    };
    ticketType: {
      name: string;
      price: number;
    };
  };
  paymentDetails: {
    provider: string;
    accountNumber: string;
    accountName: string;
  };
};

export default function PaymentInstructionsPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<PaymentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markedPaid, setMarkedPaid] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.message || "Order not found");
        }
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex items-center justify-center p-6 text-[#0d1a17]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b18a3b]">Loading...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex flex-col items-center justify-center p-6 text-[#0d1a17]">
        <p className="text-red-700 uppercase tracking-[0.2em] font-bold text-sm text-center">{error || "Order not found"}</p>
        <Link href="/" className="mt-6 text-xs uppercase tracking-[0.1em] underline text-[#b18a3b]">Back to Home</Link>
      </main>
    );
  }

  const { order, paymentDetails } = data;

  if (order.status === "CONFIRMED") {
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex flex-col items-center justify-center p-6 text-[#0d1a17] text-center">
        <div className="bg-white/50 border border-[#0d1a17]/10 rounded-[2rem] p-10 max-w-md w-full">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-6 text-2xl">✓</div>
          <h1 className="font-serif text-3xl mb-4">Payment Confirmed!</h1>
          <p className="text-[#0d1a17]/60 text-sm mb-8 leading-relaxed">
            Your payment has been successfully verified. Your tickets are valid and ready.
          </p>
          <Link href="/ticket" className="block w-full rounded-full bg-[#0d1a17] text-[#f2e9d8] py-4 uppercase font-bold text-xs tracking-[0.2em]">
            View My Tickets
          </Link>
        </div>
      </main>
    );
  }

  if (order.status === "REJECTED") {
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex flex-col items-center justify-center p-6 text-[#0d1a17] text-center">
        <div className="bg-white/50 border border-[#0d1a17]/10 rounded-[2rem] p-10 max-w-md w-full">
          <h1 className="font-serif text-3xl mb-4 text-red-700">Order Rejected</h1>
          <p className="text-[#0d1a17]/60 text-sm mb-8">This order has been rejected or cancelled.</p>
          <Link href="/events" className="block w-full rounded-full bg-[#0d1a17] text-[#f2e9d8] py-4 uppercase font-bold text-xs tracking-[0.2em]">
            Browse Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17] py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#b18a3b] mb-2">Complete Your Purchase</p>
          <h1 className="font-serif text-4xl leading-tight">Payment Instructions</h1>
        </div>

        <div className="bg-white/50 border border-[#0d1a17]/10 rounded-[2rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Top banner */}
          <div className="absolute top-0 left-0 right-0 bg-amber-500/10 px-4 py-3 border-b border-amber-500/20 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-bold">
              Payment is not confirmed until verified by De Voice
            </p>
          </div>

          <div className="pt-8">
            <div className="border-b border-[#0d1a17]/10 pb-6 mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/50 mb-1">Order Details</p>
              <h2 className="font-serif text-2xl mb-1">{order.event.title}</h2>
              <p className="text-sm text-[#0d1a17]/70 mb-4">
                {new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(order.event.date))}
              </p>
              
              <div className="flex justify-between items-center text-sm font-medium">
                <span>{order.quantity} × {order.ticketType.name}</span>
                <span>{order.totalAmount.toLocaleString()} UGX</span>
              </div>
            </div>

            <div className="bg-[#0d1a17] text-[#f2e9d8] rounded-2xl p-6 mb-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">Total Amount Due</p>
              <p className="font-serif text-4xl">{order.totalAmount.toLocaleString()} UGX</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-[#0d1a17]/60">How to pay</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-[#0d1a17]/5 pb-3">
                  <span className="text-sm text-[#0d1a17]/70">Provider</span>
                  <span className="font-medium text-sm">{paymentDetails.provider}</span>
                </div>
                <div className="flex justify-between border-b border-[#0d1a17]/5 pb-3">
                  <span className="text-sm text-[#0d1a17]/70">Account Name</span>
                  <span className="font-medium text-sm">{paymentDetails.accountName}</span>
                </div>
                <div className="flex justify-between border-b border-[#0d1a17]/5 pb-3">
                  <span className="text-sm text-[#0d1a17]/70">Account Number</span>
                  <span className="font-mono font-bold text-sm bg-black/5 px-2 py-1 rounded">{paymentDetails.accountNumber}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#0d1a17]/60 leading-relaxed bg-[#b18a3b]/10 p-4 rounded-xl">
                Please send exactly <strong>{order.totalAmount.toLocaleString()} UGX</strong> to the account above. Use your name (<strong>{order.customerName}</strong>) or phone number as the payment reference if possible.
              </p>
            </div>

            {!markedPaid ? (
              <button
                onClick={() => setMarkedPaid(true)}
                className="w-full rounded-full bg-[#c9a24b] text-[#0d1a17] py-4 uppercase font-bold text-xs tracking-[0.2em] transition-transform hover:-translate-y-0.5"
              >
                I have paid
              </button>
            ) : (
              <div className="text-center p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-800">
                <p className="font-bold text-sm mb-1">Payment Noted</p>
                <p className="text-xs opacity-90">
                  Please wait for our team to verify the transaction. You will receive an email with your tickets once confirmed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
