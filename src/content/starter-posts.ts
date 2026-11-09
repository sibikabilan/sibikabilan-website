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
    slug: "betting-my-second-company-on-agentic-ui",
    title: "Why I'm betting my second company on Agentic UI",
    excerpt:
      "I've spent my career shipping screens that guess what the average customer needs. SuprAgent is a bet that the screen should be decided in the moment, by an agent working inside rules the institution writes.",
    tags: ["agentic ui", "founding", "product"],
    publishedAt: "2026-11-09T09:00:00.000Z",
    content: `The first software I shipped that people depended on was used by the operators at the Transportation Operations Center of the Oregon Department of Transportation.

I was still studying computer science at Oregon State. The job was to move a desktop system to the web. On paper it was a migration. In practice it was the start of a lesson I've never stopped learning, because the operators weren't users in the way a product team means the word. They had a job to do, and the screen was the thing standing between them and it.

People who depend on software don't experience it as screens. They experience it as whether the work got done. A screen that showed them the right thing at the right moment disappeared into the work. A screen that made them hunt was in the way, every single time.

I've thought about that a lot since. It's the reason I'm building SuprAgent, and the reason I'm willing to bet a second company on an idea most product teams still treat as a feature: Agentic UI.

## A career of good guesses

Here's an uncomfortable thing to admit after years of building software: a lot of what I built was a guess.

Every form is a guess. Someone sits down months before a customer arrives and decides which fields come first, which questions everyone must answer, and which document is needed at which step. They decide it for the average customer, because they have to decide it for everyone at once. Then it ships, and the guess is frozen.

I've made those guesses in many places. At Oregon State I also worked on projects touching the USDA, the California Board of Education and HP. From 2017 to 2018 I worked as an independent AI and solutions architect, on twelve projects for five clients, two of them in the Fortune 500. Then I co founded a company, and later I owned flows that customers moved through when something they relied on had broken.

Some of those guesses were good. Many were good for most people and wrong for the person actually in front of the screen.

When the guess is wrong, nobody tells you. People don't write in to complain about a form. They leave it. You see the drop on a dashboard weeks later, as a line going the wrong way, and by then the person who left is long gone.

## What KayaDev taught me about trust

KayaDev AI was my first company. I co founded it and ran it as CEO from 2018 to 2021, building computer vision and analytics for enterprise teams.

The models were the part we were proudest of. They were rarely the part that decided whether a customer signed. What enterprise teams were really asking was simpler and harder. Will this keep working in our environment, with our data, when nobody from your team is in the room? Can we explain what it does to the people we report to? Can we stop it if it misbehaves?

I used to hear those questions as sales objections. I now think they're the specification. An enterprise doesn't buy what a system can do. It buys what the system will reliably do, and just as much, what it will reliably refuse to do.

That lesson matters even more for agents than it did for anything we built at KayaDev. An agent that runs part of a bank's interface is making decisions in front of the bank's customers. If the bank can't see the rules, check the actions and stop the system, it shouldn't buy it. And it won't.

## Servify, where every step cost someone

From 2022 to 2024 I was at Servify, working on device protection programs for Samsung Care+ and AppleCare+. I built a transactional risk and fraud engine, and brought generative AI into production through chat, IVR and voicebots.

Device protection is a business of moments nobody plans for. Picture someone whose phone has just cracked. They're annoyed, they may be without the device they use for everything, and now they need to show what happened, prove they're covered and get it fixed. Every unclear question in that flow lands on a person having a bad day. Every unnecessary step is a reason to call support, or to give up on a claim they were entitled to make.

Servify also taught me the other side. When real money moves, the system has to be strict. A fraud engine exists because some requests should not go through, however politely they're asked. A flow that's equally easy for an honest customer and a dishonest one isn't a good flow.

So for years I held two things at once. Every confusing step costs someone. And some steps are there for a reason.

Most interfaces resolve that tension by making everyone do everything. It's safe for the institution and hard on the customer. I don't think we have to choose like that anymore.

## The screen as an output

Here's the thesis, as plainly as I can put it.

A static screen is a guess about what the average customer needs, frozen at design time. In an Agentic UI, the screen isn't drawn in advance. It's an output of reasoning. An agent decides, during the session and for this person, what the next step should be, and then shows it using the product's own components.

It works as a loop of four verbs:

- **Observe.** Read what it's permitted to read: what the customer said, what they tapped, where they are in the journey, and what the institution's systems already hold.
- **Decide.** Choose the next step against a goal and a set of rules the institution wrote. Often that means asking less, showing fewer options, or skipping a step this person doesn't need.
- **Act.** Do the work. Render the step, fill in what's already known, call the system that needs calling, check the document.
- **Learn.** Feed each session back, completed or abandoned, so the next one goes better, always inside the same limits.

That loop is what separates Agentic UI from the things it gets confused with. A chatbot answers in a side window. A copilot suggests while the customer still drives. Generative UI renders a screen once and then stands still. RPA works in the back office and never touches what the customer sees. None of them owns the outcome. An Agentic UI does.

Picture a customer renewing an insurance policy. A static flow shows them the same pages it shows everyone: details they gave last year, a coverage table built for the median buyer, payment at the very end. An Agentic UI starts from the record. It already has the policy, the renewal date and whatever history it's allowed to see. It asks about the one thing that might have changed, explains the one coverage difference that matters to this person, and puts the payment step in front of them while they're still ready to finish.

Same product. Same rules. Same disclosures. A different screen for each person, because each person arrived with a different question.

## Why now

People have wanted adaptive interfaces for as long as I've been building software. Three things have changed that make me think this is the moment, and not another early attempt.

The first is that models can now reason over messy context and return structured output that ordinary software can check. That second half matters more than it sounds. An agent that only writes prose is a chatbot. An agent that returns a directive a program can validate is something you can build an interface on.

The second is speed. A session moves at the pace of a person. For an agent to sit inside that loop, deciding the next step while the customer waits, it has to answer before the person loses patience. For a long time that wasn't realistic. For a growing set of tasks, it now is.

The third is the one I think about most. Over the last decade, most serious product teams built a design system: buttons, inputs, cards, choosers, date pickers, each with defined properties and states. We built them for consistency. Without meaning to, we also built a vocabulary. A design system is a finite, well described set of things an interface is able to say. That's exactly what an agent needs in order to compose a screen without inventing one.

## What has to be true

I don't think Agentic UI works by default. It works only if a few things are true, and most of what we build at SuprAgent exists to make them true.

**The institution writes the rules.** The agent decides the next step. It doesn't decide what's allowed. What it may offer, what it must disclose, what it can never say and when it must stop are written by the bank, the lender or the insurer, in a form their own teams can read and change. Not buried in a prompt.

**The guardrails are deterministic.** Every directive the agent sends toward the screen is checked against the schema of the component it wants to use before it can touch the page. Every submission is checked before it's sent. If the agent proposes something the contract doesn't allow, the proposal is refused and the refusal is logged. A model's confidence is not a control. A schema is.

**There is always a way to a person.** Some moments need a human: a complaint, an unusual case, a customer who simply wants to talk to someone. The handover deserves the same care as the happy path, with the context carried across so nobody has to repeat themselves.

**The brand stays the brand.** The agent works through the product's own components, in the product's own design system, under the institution's name. The customer should feel they're using their bank's app on a good day, not talking to a stranger who has been let in through a side door.

If any of these is missing, I'd rather ship the static form. A predictable bad experience is better than an unpredictable one with real money behind it.

## What I might be wrong about

A bet isn't honest unless you say what would make you lose it. This is my list.

**People may want the screen to stay still.** Familiarity is a feature. Someone who does the same task every month builds muscle memory, and an interface that rearranges itself can feel unstable even when every change helps. My answer is that the components stay the same while the sequence changes. I might be underestimating how much people value knowing exactly where the button will be.

**For simple tasks, the static screen is right.** Checking a balance, downloading a statement, changing a password. Nobody needs an agent deciding anything there. If Agentic UI only earns its place on long, complicated, high stakes journeys, it's a narrower idea than I think it is. I'm fairly sure that's where it starts. I'm less sure where it stops.

**Approval may be the slow part.** Compliance teams in regulated businesses approve screens. They can print a form and sign it off. An interface that's different for every person asks them to approve rules, components and logs instead. I think that's a stronger kind of control, because every session can be replayed step by step. But it's a different way of working, and changing how an institution approves things can take longer than building the technology.

**Learning is the easiest verb to overclaim.** Observe, decide and act can be engineered and tested today. Learning that is real, measured and kept inside limits is slower and harder than any pitch makes it sound. I'd rather say that out loud now than discover it in front of a customer.

**The transitional forms may last.** A chat window in the corner of a product is easy to buy and easy to ship. The market may spend years there before it moves on. Being right too early is a real way to be wrong.

## Why I'm still betting

I've built software for a state transportation agency, enterprise AI as a founder, and production AI in a business where real money moves. The pattern I keep running into is the same. The institution knows a great deal about the customer, and the interface acts as if it knows nothing.

Agentic UI is my attempt to close that gap without loosening anything that matters. The rules get stricter, not softer. The brand stays intact. The customer does less, and the institution can still see and check every step.

I'm building SuprAgent around that idea in Bengaluru, one journey at a time. It's my second company, and the first where every part of my career seems to point at the same problem.

If you build interfaces for a living, I'd like to know: which screen in your product is the biggest guess, and what would it take for you to let an agent decide it instead?
`,
  },
  {
    slug: "chat-is-not-the-interface",
    title: "Chat is not the interface",
    excerpt:
      "The chat window bolted to the corner of a product can explain a step but never take it. The agent belongs inside the product, working through its own components, with every action checked against a contract.",
    tags: ["agentic ui", "design", "agents"],
    publishedAt: "2026-11-08T09:00:00.000Z",
    content: `Open a lot of financial apps today and you'll find the same new feature in the bottom right corner. A small bubble. Tap it, and a chat window slides up over the product.

I understand why it's there, because I've built that kind of thing. At Servify I put generative AI in front of customers through chat, IVR and voicebots. Those systems answered real questions for real customers, and I'd do much of that work again.

But the more time I spent with them, the more I noticed what happened after the answer. It's made me fairly sure the chat window in the corner is a transitional form. It's what you get when intelligence is added to a product but isn't allowed to touch it.

## A scene in the corner

Picture a customer partway through a home loan application on their phone. They reach the income section and stop, because they're self employed and the form seems to want a salary slip.

They open the chat and type their question. The assistant answers well. It explains which documents a self employed applicant can use instead, and links to the right page in the help center.

Then the chat closes, and the customer is back exactly where they were. Same form. Same salary slip field. Same decision about what to type and what to upload, except now they're carrying a paragraph of instructions they have to remember and apply on their own.

Nothing was wrong with the answer. The problem is that the answer was the end of the assistant's job and the start of the customer's.

## What the window can't do

Look closely and the chat window in the corner has three problems. None of them is about the quality of the model.

**It answers, but it can't act.** It can explain the step. It can't take it. It can't fill a field, change which document is requested or move the journey forward. It lives next to the product, not inside it.

**It moves the work back to the customer.** Every answer comes with homework: read this, then go back and do that. The assistant understood the customer's situation perfectly, then handed the customer the job of turning that understanding into taps.

**It sits outside the brand.** The product has a design system someone spent years getting right: type, spacing, components, tone of voice. Then a generic window opens on top of it with its own fonts, its own bubbles and its own personality. For a bank, that isn't cosmetic. The moment a customer is most uncertain is the moment the interface looks least like the institution they trust.

Each of these could be patched on its own. Together they point at the real issue. The chat window was never meant to be the interface. It's where we put a model when we haven't yet decided to let it into the product.

## Put the agent inside the product

The alternative isn't a better chat window. It's an agent that works through the product itself.

Go back to the loan applicant. In an Agentic UI, they can still ask the question, by typing or by speaking. But the reply isn't a paragraph. The income step on the screen changes. The salary slip request gives way to the documents a self employed applicant can actually provide, in the product's own upload component, in the institution's own words. The agent does the translation the customer would otherwise have had to do in their head.

Nothing on that screen is foreign. The upload component is the one the product team built. The type is the product's type. The wording around it was written and approved by the institution. The only thing that changed is who decided this was the right step for this person.

This is the part of Agentic UI that I think gets missed most often. The agent shouldn't render its own interface. It should drive yours: your components, in your design system, across the regions of the page you choose to give it. The journey in the main canvas. A short note in the sidebar. A confirmation where confirmations already go.

## The agent proposes, the schema disposes

The obvious objection is the right one. If an agent decides what goes on the screen, what stops it from putting the wrong thing there?

The answer can't be a better prompt. A prompt is advice. In a product that handles money, you need something closer to law.

I think of it as a contract. Every component the agent is allowed to use has a schema: which properties it takes, which are required, which values are allowed. When the agent wants to show something, it doesn't produce a screen. It produces a directive, a structured request to show one specific component with specific properties. That directive is checked against the schema, deterministically, before it can reach the page.

An unknown property is rejected. A missing required field is rejected. A value outside the allowed set is rejected. Each rejection comes back with the exact place it failed, and it's logged. The same holds in the other direction. Whatever the customer submits is checked against what that component declared it would collect, before anything is sent.

So the model can be creative about what should happen next. It can't be creative about what a component is.

**The agent proposes. The schema disposes.**

There's a second benefit I didn't fully appreciate until we started building this at SuprAgent. If the contract is generated into types, a component that drifts from its contract breaks the build. The mismatch becomes a compile error in CI, in front of an engineer, instead of a strange screen in front of a customer. A whole category of AI failure moves from production to the pull request.

It also removes a whole class of security risk. When the agent sends validated data to your own components, no one else's markup or scripts are being injected into your page. Only checked properties reach code your team wrote.

## Voice is an input, not a product

Voice usually gets treated as a separate product: a voicebot on the phone line, or an assistant you talk to instead of the app.

I think voice is better understood as an input. One more way for the customer to tell the interface what they want, alongside tapping and typing.

Speaking is how most people explain a complicated situation. Nobody describes their life in the order a form asks for it. They say something like "I moved cities last year, I have two jobs now, and one of them pays me as a contractor." A form needs several screens to collect that. A person said it in one breath.

When voice feeds an agent that drives the screen, the customer can say that sentence and watch the interface respond. Fields fill in. Steps that no longer apply fall away. The next question on the screen is the one their sentence didn't answer. And because all of it is on the screen, the customer can read it, check it and correct it.

Voice makes the input faster. The screen keeps it honest.

That matters in regulated journeys. A customer has to see what they're agreeing to, and a disclosure read aloud is easy to miss. Voice on its own struggles to carry that weight. Voice and screen together can.

## The interface should get shorter

Here's a test I'd apply to any product. Does the interface get shorter for each person, or is it the same length for everyone?

A static flow is the same length for everyone. It's built for the customer with the most complicated situation, because the form has to handle them too. Everyone else walks past fields that don't apply, gets asked for things the institution already knows, and reads explanations meant for someone else.

An agent that observes before it asks can do the opposite. It can skip the step whose answer is already in the record. It can fold three questions into one when the first answer settles the other two. It can leave out a section written for a different kind of customer entirely.

The flow stops being a fixed path and becomes the shortest path for this person through the same rules. Nothing required is skipped. Nothing unnecessary is shown.

I'd push this further. A good product should get shorter the longer you use it. The second renewal, the third claim, the fifth time you update something: the agent knows more each time, so the interface should ask less. Most software does the opposite. It piles up settings, banners and steps, and asks its most loyal customers the same questions it asked on their first day.

## What designers do now

The question I hear most from designers is a fair one. If the agent decides the screen, what's left for me?

My answer is: more than before, and higher up.

In a static product, a designer's main output is a flow. A fixed sequence of screens, drawn in advance for the people they expect. In an Agentic UI, the sequence isn't drawn in advance. So the design work moves to the pieces the agent composes from and the limits it composes within.

- **Components.** Pieces that work on their own, in any order, for any customer, because the designer no longer controls what comes before or after them.
- **Contracts.** What each component accepts, what it requires, which values make sense. A schema is a design decision, not only an engineering one.
- **Rules and limits.** What must always appear together, what can never be skipped, which disclosure belongs at which moment, and when the agent should stop and hand over to a person.
- **Regions.** Which parts of the page the agent may control, and which stay fixed. Not everything should move.

That's a different craft, closer to designing a language than designing a page. It's also closer to what good designers were always doing. A good design system was already a set of rules for screens nobody had drawn yet. Agentic UI just takes that seriously.

There's one thing no agent takes from a designer, and that's taste. An agent can choose the next component. It can't decide what the product should feel like. That still belongs to people.

## Where the conversation goes

I don't think chat disappears. Conversation is a good way to tell a product what you want, and some questions really are just questions.

What I think disappears is the window: the separate box, in a separate style, that can explain everything and do nothing. The conversation moves to where the work is. Into the product, through its own components, under its own brand, with every action checked against a contract before the customer ever sees it.

Chat is an input. The interface is the product. The agent should be the product's best operator, not a guest waiting in the corner.

If there's a chat bubble in the corner of the product you're building today, I'd like to hear from you. What would it take to let that agent out of the window and into the screen?
`,
  },
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
