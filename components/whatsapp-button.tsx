type WhatsAppButtonProps = {
  phone: string;
};

function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("620")) return `62${digits.slice(3)}`;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;

  return digits;
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const number = normalizeWhatsAppNumber(phone);
  const message = encodeURIComponent(
    "Halo PT Sigma Core Solusindo, saya ingin berkonsultasi mengenai solusi IT untuk perusahaan kami.",
  );

  if (!number) return null;

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Hubungi PT Sigma Core Solusindo melalui WhatsApp di ${phone}`}
    >
      <span className="whatsapp-float__copy">
        <small>Butuh bantuan?</small>
        <strong>Hubungi Kami</strong>
      </span>
      <span className="whatsapp-float__icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img">
          <path
            fill="currentColor"
            d="M16.1 3.2A12.5 12.5 0 0 0 5.4 22.1L3.7 28.5l6.5-1.7a12.5 12.5 0 1 0 5.9-23.6Zm0 22.7a10.4 10.4 0 0 1-5.3-1.5l-.4-.2-3.8 1 1-3.7-.2-.4a10.4 10.4 0 1 1 8.7 4.8Zm5.7-7.8c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-1.8-.9-3-1.7-4.2-3.8-.3-.5.3-.5.9-1.7.1-.2 0-.5 0-.7l-1-2.5c-.3-.7-.6-.6-.9-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.4 1.4-1.4 3.4s1.5 4 1.7 4.3c.2.3 2.9 4.5 7.2 6.1 2.7 1.2 3.8 1.3 5.2 1.1.8-.1 1.8-.8 2.1-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4Z"
          />
        </svg>
      </span>
    </a>
  );
}
