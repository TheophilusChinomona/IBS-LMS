'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Sparkles,
  LineChart,
  Users,
  Briefcase,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/theme/typography";
import { buttonVariants } from "@/components/ui/button";

const personas = [
  {
    id: "individuals",
    label: "Individuals",
    title: "Upskill fast with guided paths",
    body: "Curated programs with progress tracking, micro-learning, and certifications.",
  },
  {
    id: "teams",
    label: "Teams",
    title: "Launch compliance programs",
    body: "Centralize enrolments, monitor completion, and automate reminders for every department.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    title: "Scale a premium academy",
    body: "Advanced analytics, SSO-ready security, and white-label experiences.",
  },
];

const featureCards = [
  {
    title: "For Individuals",
    description: "Personalized journeys, flexible pacing, and milestone coaching.",
    icon: Sparkles,
  },
  {
    title: "For Teams",
    description: "Assign courses, manage cohorts, and surface at-risk learners fast.",
    icon: Users,
  },
  {
    title: "For Enterprise",
    description: "Segmented portals, dynamic certificates, and compliance dashboards.",
    icon: Briefcase,
  },
];

const stats = [
  { label: "Avg. adoption", value: "93%" },
  { label: "Courses Launched", value: "650+" },
  { label: "Enterprise NPS", value: "67" },
];

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-primary via-secondary to-accent px-8 py-16 text-white shadow-hero">
        <motion.div
          className="pointer-events-none absolute -left-10 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/20 blur-[120px]"
          animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="space-y-6">
            <Badge variant="default" className="bg-white/20 text-white backdrop-blur">
              New: Adaptive learning rails
            </Badge>
            <h1
              className={cn(
                typography.display.size,
                typography.display.weight,
                "text-white",
              )}
            >
              Transform compliance into competitive advantage.
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              IBS LMS blends Stripe-grade polish with Coursera-level pedagogy so
              your learners feel at home while you stay audit-ready.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/courses"
                className={cn(buttonVariants({ size: "lg" }), "gap-2")}
              >
                Browse Courses <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "bg-white/20 text-white hover:bg-white/30",
                )}
              >
                Book a Demo
              </Link>
            </div>
          </div>
          <Card padded={false} className="w-full lg:w-96">
            <div className="space-y-4 p-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Why leading teams switch
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  Zero-trust ready with granular roles
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-secondary" />
                  Curated journeys + AI nudges
                </div>
                <div className="flex items-center gap-2">
                  <LineChart className="size-4 text-white" />
                  Real-time adoption + risk alerts
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureCards.map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card>
              <card.icon className="mb-4 size-10 rounded-2xl bg-primary/10 p-2 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Card>
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Learning experience
            </p>
            <Tabs defaultValue="individuals">
              <TabsList className="w-full">
                {personas.map((persona) => (
                  <TabsTrigger key={persona.id} value={persona.id}>
                    {persona.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {personas.map((persona) => (
                <TabsContent key={persona.id} value={persona.id}>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {persona.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{persona.body}</p>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Momentum
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-600">
            High-trust financial, pharma, and energy orgs ship onboarding,
            compliance, and academies on IBS.
          </p>
        </Card>
      </section>
    </div>
  );
}
