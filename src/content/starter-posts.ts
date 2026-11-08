/**
 * Starter essays that ship with the site. They live in the CMS index from the
 * first boot (see emptyIndex) and become ordinary editable posts the moment
 * they are saved or deleted from /admin.
 */

export interface StarterPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  content: string;
}

export const STARTER_POSTS: StarterPost[] = [
  {
    slug: "customers-dont-say-no-they-go-quiet",
    title: "Customers don't say no. They go quiet.",
    excerpt:
      "Most of what a financial company loses on a new customer never shows up as a rejection. It shows up as silence.",
    tags: ["growth", "agents", "financial services"],
    publishedAt: "2026-11-07T09:00:00.000Z",
    content: `Most of what a bank loses on a new customer never shows up as a rejection.

It shows up as nothing.

Someone starts a loan application on their phone during a lunch break. They reach the amount and hesitate, because the number on the screen is a little higher than they expected. They scroll on to the documents step, and the form asks for something they don't have on them. They close the tab and tell themselves they'll finish it tonight.

They don't finish it tonight. The next morning there's an SMS with a link. It looks exactly like the other eleven texts they got that day.

Nobody said no. The journey just went quiet.

## The silence nobody reports on

Every funnel dashboard I've seen counts the people who drop. Very few can tell you *why* they dropped, and almost none can do anything about it in the moment it happens.

So we treat silence like weather. Something that happens to the business, not something the business does. We send a reminder, then another one, and we call the leftover number "drop off" as if the customers simply evaporated.

They didn't evaporate. They had a question nobody answered.

## What a good relationship manager does

Picture the same customer walking into a branch instead.

A good relationship manager notices the hesitation on the amount before the customer says anything. They suggest a smaller ticket, or a longer tenure, inside the limits they're allowed to offer. They say the document can come later today. They ask when it's a good time to call, and then they actually call at that time.

None of that is magic. It's attention, judgment and follow through.

The problem is that this person doesn't scale. One relationship manager, one customer, one conversation at a time.

## Building for the moment of hesitation

That's the problem I'm working on with SuprAgent. One agent that does what your best relationship manager does, for every customer at once.

It reads the record before it speaks, so it knows who to reach, when, and what to lead with. It reaches people on the channel they actually reply on. It negotiates inside the limits the institution sets, and never outside them. And it keeps one thread alive whether the conversation started as a message, moved to a call, and finished on a screen.

The interesting engineering isn't the language model. It's everything around it:

- knowing when to speak, and when to stay quiet
- knowing what it is never allowed to say
- handing the conversation to a human at the right moment, with the context intact
- keeping a single memory across a text, a voice call and an app screen

## The question I ask now

When I talk to growth teams, I've stopped asking about conversion rates. I ask a simpler question:

**Where do your customers go quiet?**

Everyone knows the answer immediately. That's the tell. The silence was never a mystery. It was just nobody's job.

If you know where yours go quiet, I'd like to hear about it.
`,
  },
  {
    slug: "kill-the-static-interface",
    title: "It's time to kill the static interface",
    excerpt:
      "For twenty years we've asked users to navigate our menus to reach an outcome. Agentic UI flips that around.",
    tags: ["agentic ui", "product", "design"],
    publishedAt: "2026-11-03T09:00:00.000Z",
    content: `For the last two decades, almost every digital product has been built on the same premise: if a user wants an outcome, they have to navigate our menus to get it.

We built dashboards. We designed multi step onboarding. We made filters for our filters. We called it user centric design, but if we're honest, we were asking the user to do the work.

That era is ending.

## The map and the guide

A static interface is a map. It's a carefully drawn map, often a beautiful one, but the user still has to find themselves on it, work out where they want to go, and walk there one click at a time.

An agentic interface is a guide. You say where you want to end up, and it navigates the underlying systems, tools and data for you. It shows you only what you need to see, at the moment you need to see it.

The difference isn't cosmetic. It changes who does the work.

## What changes when the interface composes itself

In an Agentic UI, the screen isn't a fixed form designed months ago by someone guessing what most users need. It's assembled in the moment, for this person, from what the system already knows.

- If we already know your address, you don't see an address field.
- If a document can be fetched, you aren't asked to upload it.
- If the question you're about to be asked doesn't apply to you, it simply isn't there.

What's left is a short, specific conversation about the decisions only you can make.

## Where it matters most

The impact is biggest in the flows where a single point of friction loses a person for good: onboarding, discovery, checkout, claims, renewals. These are the flows where a confusing step isn't an annoyance. It's the end of the relationship.

It's also where the stakes for getting it wrong are highest. An agent that composes an interface has to be held to stricter rules than a static form, not looser ones. It must know what it is not allowed to show, what it must always disclose, and when to stop and hand over to a person.

## The unit economics nobody mentions

Removing the burden of navigation doesn't just improve the experience. It changes the economics of the product. Every screen you don't have to design, translate, test and maintain for every edge case is a screen that never breaks.

The future of software isn't a prettier dashboard or a cleaner dropdown. It's an interface that does the heavy lifting so the people using it don't have to.

So here's the question I keep coming back to: are you still asking your customers to click their way to an outcome?
`,
  },
  {
    slug: "production-first-demo-second",
    title: "Production first, demo second",
    excerpt:
      "Twelve years of shipping software people depend on, from a traffic operations center in Oregon to AI agents in regulated finance, in five lessons.",
    tags: ["engineering", "founding", "lessons"],
    publishedAt: "2026-10-28T09:00:00.000Z",
    content: `The easiest thing in AI right now is a good demo. The hardest thing is the Tuesday after launch.

I've been on the hard side of that line for most of my career, and almost everything I believe about building software comes from it. Here's where those beliefs came from.

## 1. The people depending on it don't care about your migration

My first production software was for the Oregon Department of Transportation's Transportation Operations Center, built while I was studying computer science at Oregon State. We were moving a desktop system to the web.

The operators using it didn't care about our architecture. They cared that the screen they relied on worked when they needed it. So we kept the desktop version and the web version running side by side until the new one had earned its place.

**Lesson:** software people rely on doesn't get a maintenance window from reality.

## 2. Build for the person who runs it after you leave

As an independent AI architect, I worked across a dozen projects for five clients, two of them in the Fortune 500. Machine learning, content distribution, data analytics.

Every one of those systems would eventually be run by someone who wasn't in the room when it was designed. The clever parts I was proudest of were often the parts that caused the most trouble later.

**Lesson:** design for the operator, not the architect.

## 3. Nobody buys AI. They buy outcomes they can trust.

Running KayaDev AI as CEO, building computer vision and analytics products for enterprise teams, taught me the most expensive lesson of all. Customers were impressed by what the models could do. They signed when they believed it would keep doing it, in their environment, with their data, on a bad day.

**Lesson:** the model is the beginning of the product, not the product.

## 4. Real money changes everything

At Servify I owned device protection programs for Samsung Care+, AppleCare+ and Vivo V Shield. I built the engine that monitored transactional risk and flagged fraud, and brought generative AI into production through chatbots, IVRs and voicebots.

Regulated flows, real money, real customers. When an AI system is wrong in that environment, someone notices, and someone has to answer for it.

**Lesson:** decide what the system must never do before you decide what it should do.

## 5. Answer for what it does

Today I'm building SuprAgent, an AI agent that talks to customers on behalf of banks, lenders, insurers and wealth firms. I write a lot of its code, and I answer for what it does in front of a customer. I think that combination should be more common than it is.

## What production first means in practice

If I had to compress all of this into a checklist:

- Write down what it must never do, and test that first.
- Instrument everything before launch, not after the first incident.
- Design the handover to a human as carefully as the happy path.
- Agree on the baseline before the first user arrives, so you can tell whether it worked.
- Demo the failure modes, not just the success.

Demos are how you get a meeting. Production is how you keep the customer.
`,
  },
];
