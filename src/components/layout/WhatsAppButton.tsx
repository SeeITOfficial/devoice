"use client";

export default function WhatsAppButton() {
  const message =
    "Hello, I am reaching out to De Voice Management regarding an inquiry for Jonathan (De Voice).";
  const whatsappUrl = `https://wa.me/256703008952?text=${encodeURIComponent(
    message
  )}`;

  return (
    <aside aria-label="Direct WhatsApp Contact">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with De Voice Management on WhatsApp"
        className="group fixed bottom-5 right-5 z-40 flex items-center justify-center rounded-full bg-[#25D366] p-3 text-[#0a1412] shadow-lg shadow-[#0a1412]/15 transition-all duration-300 hover:bg-[#20ba5a] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6 sm:p-3.5"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center sm:h-[22px] sm:w-[22px]">
          <svg
            className="h-5 w-5 fill-current sm:h-[22px] sm:w-[22px]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 0C5.397 0 0 5.391 0 12.019c0 2.113.547 4.175 1.588 5.986L.055 24l6.195-1.622a11.968 11.968 0 005.781 1.482h.005c6.633 0 12.03-5.391 12.03-12.022 0-3.21-1.25-6.228-3.52-8.5C18.27 1.066 15.247 0 12.031 0zm0 22.017h-.004a9.99 9.99 0 01-5.093-1.39l-.365-.217-3.784.992 1.01-3.687-.238-.379a9.98 9.98 0 01-1.536-5.317c0-5.526 4.498-10.024 10.02-10.024 2.677 0 5.193 1.043 7.085 2.936a9.96 9.96 0 012.93 7.087c0 5.528-4.498 10.025-10.015 10.025zm5.49-7.514c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.676.15-.2.301-.776.98-.952 1.18-.175.201-.35.226-.651.076-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.675-2.085-.175-.3-.019-.463.131-.613.136-.135.301-.35.451-.526.151-.175.201-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.587-.492-.507-.676-.516l-.576-.01c-.2 0-.526.075-.801.376-.276.301-1.053 1.028-1.053 2.507 0 1.479 1.078 2.908 1.228 3.108.15.201 2.121 3.24 5.138 4.542.718.31 1.278.496 1.716.635.722.23 1.379.197 1.898.12.578-.087 1.782-.727 2.032-1.43.25-.702.25-1.303.175-1.429-.075-.125-.275-.201-.576-.351z" />
          </svg>
        </span>

        {/* Hidden on mobile (icon only), expands on hover on desktop */}
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em] opacity-0 transition-all duration-300 ease-out sm:inline-block group-hover:max-w-xs group-hover:pl-2.5 group-hover:pr-1.5 group-hover:opacity-100">
          Chat with Management
        </span>
      </a>
    </aside>
  );
}
