"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="border-y border-yora-charcoal/10 bg-yora-cream">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6 md:py-20 lg:px-8">
        <p className="text-xs tracking-[0.35em] text-yora-taupe uppercase">
          Fique por dentro
        </p>
        <h2 className="mt-4 font-display text-3xl text-yora-charcoal md:text-4xl">
          Acesso antecipado aos drops
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-yora-muted">
          Inscreva-se na newsletter e receba novidades, lançamentos exclusivos
          e condições especiais em primeira mão.
        </p>

        {submitted ? (
          <p className="mt-8 text-sm text-yora-taupe">
            Obrigada por se inscrever! Em breve você receberá novidades da Yora.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Seu e-mail"
              required
              className="flex-1 border border-yora-charcoal/20 bg-transparent px-4 py-3 text-sm text-yora-charcoal placeholder:text-yora-muted/60 focus:border-yora-charcoal focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" className="sm:shrink-0">
              Inscrever-se
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
