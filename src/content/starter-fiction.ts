/**
 * Sibi's fiction, converted from his original Word documents with the prose
 * left as written. Each chapter is dated to when the piece was first written:
 * the document's own creation date where Word recorded one, otherwise the
 * earliest file date of its earliest version. Like the starter essays, these
 * seed the CMS index on first boot and become ordinary editable works once
 * saved from /admin.
 */

export interface StarterChapter {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  content: string;
}

export interface StarterWork {
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  genre: string;
  kind: "novel" | "novella" | "short story" | "serial" | "collection";
  progress: "in progress" | "complete" | "on hiatus";
  publishedAt: string;
  chapters: StarterChapter[];
}

export const STARTER_WORKS: StarterWork[] = [
  {
    slug: "to-love-and-be-loved",
    title: "To Love & Be Loved",
    tagline: "A first date with someone who says the things you were trying not to.",
    synopsis: "Friends set him up with a woman they swear is the closest thing to him they know. He has a theory about first dates; she has a better one.",
    genre: "Literary",
    kind: "short story",
    progress: "in progress",
    publishedAt: "2024-02-20T09:00:00.000Z",
    chapters: [
      {
        slug: "i",
        title: "I",
        summary: "A blind setup, a first text, and lunch instead of dinner.",
        publishedAt: "2024-02-20T09:00:00.000Z",
        content: `First dates are awkward. Almost everyone would tell you so. I suppose I should start with the last ‘first’ date I had. It was a blind setup of sorts; a bunch of my friends knew this girl who they all agreed would be great for me. Whatever that meant.

“It's almost shocking that you two haven’t met. She’s the closest thing to you I’ve met. Other than you of course” Jeanene said with a smirk on her face and a satisfaction that screamed how confident she was in the match. To her credit, she wasn’t too wrong.

“That doesn’t sound like a cliché at all. Oh, look at that new girl out of nowhere who basically has all the same friends and is totally great for you. Very convenient, thank the universe.” I remarked in my usual, what I assume was a cynical tone.

“Say what you will, you’re touched by the hand of fortune. Good things just happen to you” she said with all the honesty in the world. Poor Jeanene suffered from a form of mental ailment commonly referred to as being “naïve”. It is not that I don’t realize my fortunes or the happy coincidences that happen a little too often to be normal – it is that my life has been an eternal game of tag. I find something happy and as soon as I do I become unhappy. It's them, it’s me, it's work, it's college. It’s something. Or perhaps my excellent mother was right and I just don’t know how to be happy. Or perhaps I was just bitter from the last breakup still.

Our first date was weird, weirder than usual. I was given her number to call and I held onto it for a week before I got a text that simply read “Hey, it's Alice. I think we were supposed to contact each other but I just wanted to say hi first, in case you were shy. Also the added bonus of rebelling against the patriarchy - which I heard you were into”. I admit, that was a good first text. I replied and we talked for a couple of days, texting every now and then. There were a couple of somewhat short phone calls. Then we decided we should get lunch since we both agreed that the meal of the day was less intimate than breakfast or dinner. *How arbitrary humans were, we actually inferred intimacy with what meals we eat together*. Still, my goal for the first date was to simply not talk about how arbitrary I found all things in life.

“I bet first-date lunches are less common,” she said while getting the pasta out of the oven.

“Bet it's less common for someone to cook lunch for someone on their first date” I quipped.

“Fucker, you’re not getting grilled cheese and you better be happy about that”

I smiled like an idiot and I’m sure it showed.

“Still, people are so out there. You know what I mean? Like what even is the difference between meals consumed at different times of the day!”. She said the weird things I wanted not to say.

“Arbitrary is what it is. Just like most things people do” I said before regretting not having a better handle on the bitterness.

“Ha!” She laughed.

“But I bet it isn’t that arbitrary. If you think about it, I think it comes down to the actions preceding and following the meals that assign their importance. Breakfast is early in the morning, and usually happens in one’s house. Post a night of intimacy. Dinner is just pre-game to the same thing” she smiled, applying an atypical stress on the word intimacy.

“So it's all about sex. It's not arbitrary, it's just sex”

“Except we’re having lunch, so clearly our date is about more evolved things,” she said with a tone of mockery. The giggles that followed showed me how comfortable she was, with everything.

“I suppose so” I smirked, looking into her deep green eyes.

“Wrong, it's always about sex,” she said breaking eye contact.

“I suppose so”

We both laughed a lot that afternoon. She told me a great deal of things that normally would’ve been weird to say on a first date. I told her a great deal of things that I'm sure no one else would’ve laughed at as hard as she did. And she did so as sincerely as I have seen anyone do anything. There it was, Authenticity. Such a rare thing to find when you look for it. Such a sly thing that it shows up when you don’t.

“You know Kay, you were supposed to be a rebound” she said as her hands played with my chest hair.

“Kay?” I got off the bed and walked towards the restroom.

“That’s what I’m calling you now. You got a nickname”

“Naming a rebound doesn’t sound too healthy”

“I didn’t sleep with you after one date because I planned to. The plan was to wait a few dates and get over my asshole ex. But I’m imprinting on you. HARD”.

The way she said ‘hard’ would’ve made it hard for any guy.

“You’re a dirty dirty twilight fan”

“You bring it out in me. The twilight part was just highschool. I was trash”.

“Atleast you weren’t white trash”

“Sounds like you have some interesting tastes. But I'm white. I'm trash. I bet I'm close”

“Trust me, when you're the color I am, white & trash and white trash are entirely different. Like McDonald's and rat poison different”. I regretted those words as soon as they escaped me.

“Neither is good for you but atleast one tastes good”

“I hope you meant the rat poison cause McDonald's is the worst”

“Well except the fries”

We both nodded our heads as though the facts were laid out in front of us.
`,
      },
    ],
  },
  {
    slug: "a-story-for-ulterior-reasons",
    title: "A Story for Ulterior Reasons",
    tagline: "A woman on a bridge, a stranger with a hammer, and a narrator who is only passing through.",
    synopsis: "On a rainy night, a young woman standing on the ledge of a very big bridge is offered a dangerous job by a stranger with a hammer. The one telling you this is not from your world.",
    genre: "Fantasy",
    kind: "serial",
    progress: "in progress",
    publishedAt: "2016-08-03T09:00:00.000Z",
    chapters: [
      {
        slug: "failed-jumps-and-successful-leaps",
        title: "Failed Jumps & Successful Leaps",
        summary: "A rainy night, a very big bridge, and an offer of work.",
        publishedAt: "2016-08-03T09:00:00.000Z",
        content: `This is a story about two people. Two people on the same side. They are the yin and yang of each other and of nothing else. I tell you this story my curious listener for I am only travelling through your world, I tell you this story so that you may tell this story to someone. And so it will spread in your world, a story of defiance, of courage, of acceptance and of justice; however you may define any of these. Like most nights in your world, theirs were also dark. And during a particularly rainy one, a young woman stood on the ledge of a very big bridge. A bridge unlike any you’ve seen. Below the bridge, covered in luminescent growth was a liquidy death, a gentle pull from reality her soul ever so desired. But alas, she was kissed by fate. She had the misfortunate of being one of us. For her, awaiting was an adventure like none you’ve heard. Right before she had everything she desired, she saw in the corner of her eye a flash of light. And with that she traded in a life of mediocrity and oncoming bliss, in return she was presented with an important role in this story. What she was light reflecting off a giant hammer, held by a shadowy figure on the far side of the bridge.

“I really don’t mean to stop you. But I think you can do me a big favor if you so desire” the shadowy figure said.

“What? You want me to do you a favor? If this is an attempt to save me, I can tell you I don’t need any” she said hurriedly; as though she were a kid caught stealing candy.

“Nothing of the sort I promise. There is a risky job tonight and I thought perhaps you’d like to do it. Seeing as how the job hazard might not be a particular problem to you, I figured it was worth a try” the voice emanated from the now clearly visible face of a man.

“What does the job pay?” she asked.

The man looked a little troubled at first and then awfully confused.

“Would you accept the chance to go out righteously as payment?”

“Go out like what?”

“I see. Well, I’ll tell you how it is. Tonight there is a serial killer who needs to die, but for that to happen I need an accomplice. This is, obviously, a very dangerous job. However should you die in the process or slightly afterward I can attest for a fact that history would remember you with a little more exaggeration. So how about it?”

She let out a loud scream, no a cry or perhaps a laugh, I can’t quite remember. And with the license that followed she had accepted her ticket to be on this story. I know what you’re thinking. You think that maybe the guy was me. I am no man nor woman. I am no thing that you are familiar with. And I am most certainly not what this story is about.
`,
      },
    ],
  },
  {
    slug: "nutrir",
    title: "Nutrir",
    tagline: "Pregnancy is optional now. Motherhood, it turns out, is a different question.",
    synopsis: "Alicia and Richard have decided it is time for a baby, and like most couples who can afford it, they will grow it in an artificial womb. Her grandmother, who has never trusted anything invented after her forties, has other ideas.",
    genre: "Science fiction",
    kind: "short story",
    progress: "complete",
    publishedAt: "2014-11-11T09:00:00.000Z",
    chapters: [
      {
        slug: "nutrir",
        title: "Nutrir",
        summary: "",
        publishedAt: "2014-11-11T09:00:00.000Z",
        content: `“Being a mother will change your life. It is the most amazing experience a woman can have”. Those were my grandmother’s words. The one of my things she had to say about me and Richard deciding that it was time to have a baby. Truth be told it was more Richard than me. I wasn’t opposed to the idea but it had been Richard who came up with it. We had toyed with the idea for over a month before we decided it was indeed time; though I suspect Richard had it in his mind for a while now.

“You’ll make a great mother, I just know it.” Richard said with the usual gentle smile on his face.

“I wouldn’t be too sure. My grandmother had a lot to say about what it means to be a mother and I don’t think I have even one of those things down. Some of them just don’t plain interest me.” I said with my usual skepticism. I tried not to be skeptical of everything but the stuff I hear from people just doesn’t go down well. Maybe this time I was wrong, unlike all the other times.

Richard took a sip of his French Roast from his favorite Natives coffee cup. His father had one of those old-timey Red Skins cup but Richard preferred the rebranded version of the team and rightly so. I held up my tablet by its thin black outer frame, peering deep into its screen. I just didn’t want to look him in the eye right now. Cursed translucent screens; if only I had one of those ancient opaque screen tablets. Those I’d be able to hide behind.

“Honey, it’ll be alright. You’re one of the most rational people I know. And unlike you, I do know a lot of people.” Richard said jokingly. But it was true, he did know a lot more people than me. He was good at making friends, ye olde “Outgoing personality”. Not that I was an introvert, I just didn’t see the point in socialize unnecessarily. You go out, you get drinks and you talk about unproductive things. It perplexed me that people were still willing, in this day and age, to waste time with such an old tradition.

“Maybe you’re right. Having a kid is essential for the survival of our species and is a very responsible thing to do. There are no negatives to it. Hell, maybe 50 years ago we had a population issue but not anymore.” It came out a bit forced, not how I intended to sound at all. I wanted him to think that I was okay with this decision, that I wanted it. I did want it. What rational human being wouldn’t? I was in a stable portion of my life and had enough time for nurturing another human being. Besides, if Richard and I split the work in half I’d still have enough time for my ‘Classics of English Literature’ club.

The next couple of months were bump free, I had grown used to the idea of welcoming a new human to the family. My circle of friends was small. It consisted mainly of three people; Richard, my sister Terese and my longtime friend Anna. Ever since we had made the decision, Anna had been in constant touch with me. She talked to me every day, made sure that I felt comfortable and that I wasn’t freaking out. For the most part I think that is what helped me keep it together. Maybe I’ll have another person in my circle soon. That was an exciting prospect. Other than you know, a human being complete with 4 limbs and a brain, all made by you. And your significant other of course.

My grandmother was a stern lady. We had expected her to grow old and weak for over a decade now. It was her 90th birthday last January and I swear she didn’t look 90 or 80 or even old for that matter. She had always had black hair, for as long as I’ve known her. We all assumed she dyes her hair. I remember talking with my sister about it once.

“Maybe she got a hair transplant…. I mean she is loaded” I had said.

“Who granny? No way. I mean other than her opposition to this ‘monstrous decimation of nature’, I bet she doesn’t even know that they’re identical to natural hair now. In her times they sewed that fake garbage on their heads.” Terese said with her signature cheekbone to cheekbone smile. She was right, no way was grandmother using anything invented past 2030. My grandmother for all her strength and sanity, was really irrational when it came to technology. She didn’t trust anything made after her 40s. So naturally when she visited me and saw that I had no bump on stomach, she panicked.

“Are you waiting a bit more before your pregnancy? Work too tight right now?” She enquired with ice glazed eyes. I knew what she wanted to hear. And I knew what she didn’t want to hear.

“No granny, I’m not doing a natural pregnancy” I replied my eyes staring at the floor.

“You can’t possibly want to grow your baby in a chamber! That is outrageous!” She said angrily. She paced across the room for a good 20 minutes. I just stood there staring at her hopelessly. Then she turn around, her decade old leather shoes making a squeaking noise. Too expensive to be squeaking, I thought. She walked towards the sofa, gesturing me to sit next to her. I quietly walked over and sat next to her.

“Alicia I know how scary a pregnancy is. But simply growing your baby in a box isn’t the solution. A child is a commitment and a pregnancy is a proof of concept. If you can’t spend 9 months of joy and suffering, how will you spend the rest of your life doing the same for that child?” She asked me, her eyes still glazed with ice. I had never noticed the wrinkles on her face before. They were only slightly visible but they were there all the same. I saw the validity of her point but a needless waste of time isn’t the right way to show commitment. If anything, it showed that your mother was an inefficient dumbass.

I always knew my grandmother would oppose my decision on the artificial womb but didn’t expect her to be this serious about it. Invented in the late 2030s by Nutrir, the artificial womb was the choice of over 60% of the mothers worldwide. Most that choose natural pregnancy only do so because of their financial constraints. The artificial womb process wasn’t by any means super expensive but it wasn’t something that the lower income class could easily afford. But for a working women like me, 9 months of saved time made more money than the whole process cost. Not to mention the amount of work and pain it saved me. I couldn’t imagine being immobile for 9 months let alone with increased body weight and mood swings.

“Granny, it just isn’t practical for me. Or for most people. Not anymore. 9 months at work more than compensates for the whole thing. Not just monetarily. If I had to take a break that long most of my clients would be lost. And having a kid costs a whole lot more than it used to back your time. The education cost alone!” I exclaimed, doing my best to convince her. I could see the disappointment in her face. She didn’t care much for Terese or my other cousins but she always maintained that I was her favorite grandchild, openly. She raised her slim and tender hands and slowly placed them on my shoulder as if it comfort me for what was to come.

“Those 9 months aren’t just wasted time my dear. It gives you time to take a break from your life and think about your child and only about your child. The hardships, the stress and the pain all make you love your child more. The bond between a mother and child begins with pregnancy and without it I do not how you could know your child apart from someone else’s.”

She looked sad as she said it. Predictably I was angry at what she said.

“Just because I refuse to waste almost an entire year carrying a child for no good purpose doesn’t mean that I won’t love it as much as the next mother. Pregnancy or not, that will be my child. And I’ll do everything that I need to keep that child healthy and safe.” I replied with an errant tone in my voice. She didn’t say a word afterward. All I got was a smile as she waved on her way out a couple of hours later. I had never disappointed my grandmother, let alone talk to her like that. My mother always said that I reminded grandmother of herself. ‘The only other strong woman in the family’ as my grandmother would often say.

The next day I talked to Richard about what had happened. He said that my grandmother was just being too emotional about it. That I agreed on.

"I don’t lack commitment or anything. How hard is it to understand that I can’t just drop my job for 9 whole months and for no reason!” I said with a slightly loud voice, my hands caressing Richard’s slightly beardy chin.

“You don’t have to convince me sweetheart, I know you. And your grandmother is just an old woman, her times were different.” Richard said, planting a kiss on my forehead. “I have to go now, you’ll be alright?” He questioned as he put on his trench coat. It was his favorite one and he never went out without it during fall. He just hated the rain.

“I will. Come back soon, we have the appointment with Nutrir this evening remember?”

He nodded with a gentle smile. I stood there watching him walk out the door, wondering if I was the only one nervous. Today I get to see the baby’s ultrascan for the first time.

The whole thing made nervous; nervous enough to call my sister. Terese picked up almost immediately, like she was expecting the call.

“You alright Aly?” she said just as soon.

“I’m fine, I’m fine. I just nee… need to talk to someone.” I said with a slight stutter.

“Are you nervous?”

“Just a little”

Terese always amazed me with how well she knew me. Maybe she just paid more attention to me than I ever did. She was a second mother to me, always there ready to take care of me.

“So tell me what’s making your nervous”

“I don’t know, it’s just the ultrascan. I can’t seem to rest knowing that in a less than half a day I’m going to see it!” I almost shrieked.

“I’m sure it’s nothing. It’s probably just putting a picture to the whole idea. I mean you only knew at heart that you were going to have a baby but now you’ll have proof. It’s a good thing, these things are supposed to make you nervous” she said reassuring me.

“What would I do without you Tes?” I realized how much of a cliché it was as soon as I said it.

“Probably freak out a bit more”

My conversation with Terese put me at ease. I started thinking about the baby. We still hadn’t come up with a name. We didn’t know the sex yet and I didn’t like the unisex trend that was going about. I still remember vividly when the doctor asked us if we had a preference as to the sex.

“If you do have a preference, it’s certainly possible to ensure the outcome.” He said holding up the digital pad, glancing at it as though it had our answer.

“No, we’re fine with either sex” Richard said with his ever so gentle smile and his pleasant voice.

“So you have absolutely no preference?” the doctor reiterated his question like it was protocol.

“Surprise us!” I said to find a shocked reaction from the doctor.

“It was a joke… but we really do not have a preference”

I was so embarrassed and cursed myself for trying to crack a joke. That job was better left to Richard.

I looked at the clock and our appointment was in less than hour. It wasn’t like Richard to wait until the last minute to show up. He was the brick and mortar of my life. And I expected him to be really early this time, he did seem to be looking forward to this more than me. But he showed all the same, 10 minutes left to appointment.

“Nice occasion to be late mister” I said teasingly.

“I’m still 10 minutes early. Let me get this coat off and we’ll be ready to go in a jiffy” he said taking off his trench coat and carefully placing it in the hide away hangar in the wall.

“I’m switch on the Holodeck. You better get here quick!” I yelled from across the house.

“Calm down Aly. We’re here and it isn’t time yet. Wait for the doctor to get on the call.”

I didn’t how he could be so calm about it. In a few minutes we were going to get a glimpse of our baby, our first one.

We waited for the holographic call to come in. I twitched uneasily in my seat. Richard’s hard slung across my shoulder, securing me. I buried my nerves in his warm chest. Then, the Holodeck rang notifying the hospital’s call.

Once Richard gestured his hand to answer the call, the white room transformed into a beautiful blue with a glass wall overlooking the Marina.

“Hello Mr. and Mrs. Tomsmith” the doctor said.

“Hello doc, so can we have our baby yet?” Richard said with a laugh.

Why can’t I make a joke like that? An honest, funny, good natured joke.

“Not quite yet I’m afraid but we do have some pictures for you. I’m sure you’re excited to see it.” He said with a hand gesture bringing up the pictures.

Richard held my hand was we looked at the pictures in awe. It barely resembled a human being; that much I had expected. To me it was still more beautiful than a Monet.

“Not even Monet could’ve painted something more beautiful using just shades of grey” I said.

Richard nodded with a tear in his eye. I felt relieved to see him emotional, made me feel less crazy.

“We also have a false color version of the image. I’ll have them all sent to your personal email.” The doctor said.

“We’d appreciate that. Thanks for everything doc.” Richard said before waving the call to an end.

And we just sat there for almost an hour, in each other’s arms.

It didn’t hit me for a day or two. Then I knew. I was having a baby. I had to call Tes again.

“I’m having a baby!” I shrieked

“Aly, I know. The whole world probably knows.” Tes said with a funny voice. She almost sound like one of those annoying girls from college.

“Stop that!” I said in a demanding tone.

“Why? You used to love the girls who sounded like that.”

“My friends did not sound like that!” I replied with a hurried voice.

“Yea they did. They totally did. Those annoying brats, I was surprised you hung out with them for as long as you did”

“They were good people... once you got to know them”

“Honey, the boogeyman is probably good people once you get to know him”

Tes never failed to lift my spirits and make me smile. She was my guardian angel.

“Tes… I’m having a baby”

“Alright let it sink in. Because if you don’t, then you’ll be wondering what that tiny thing in your arms is in a couple of months.”

“Oh stop it Tes. I’m serious. I don’t think I thought about everything associated with a baby. I mean I thought about the long term but I just hadn’t thought about all the small things. The feed for example! I completely forgot about the feeding. I’m making Richard pick things up today.”

“The baby isn’t coming for a couple of months. Relax Aly, I think you’re fine.”

And no matter how many times she said, I just didn’t feel fine.

Sensing my pause Tes continued.

“Look, you’ve probably thought through all the things that matter. The kid’s education, I’m sure you’ve thought of that. Where you’d send him, how you could help him. Knowing you, you probably have a daily schedule to bond with him.”

“What about you and Sam? You guys talk baby yet?”

“Us? Not yet. Not with our financial situation. I can’t afford to take time off work and sure as hell can’t afford an artificial womb”

“Nutrir has financing options. I could help out if you want” I said ecstatically.

“It’s not just that Aly. If I’m still paying for the procedure afterward how would I support another member in the household?”

We both grew silent.

“Its fine Aly, really. It’ll happen when the time is right.” Tes said with her usual vibrant voice. I knew she was hiding the sadness somewhere behind it. Of all the people I knew Tes was the best candidate for motherhood.

What really bothered me was the fact that I didn’t have a daily schedule to bond with my son. We decided to name him Henry, after Henry VIII the once king of England. This I had thought of, but only because I had been reading ‘The Other Boleyn Girl’ and its history. I felt as though I hadn’t even spent enough time for naming my future child. It all cracked down on me. Of how less time I had spent thinking about the child. Maybe Grandmother was right, maybe I really didn’t bond with the child because it hadn’t been real to me yet. Him. He hadn’t been real yet. But He was, at least had been since the call from the Hospital.

The next day I called Tes. When she heard what I had to say, she decided to come over. It took some time but I convinced her that I knew what I was doing, that I had wanted it. But a little part of me thinks that she jumped at the opportunity but that would be silly. Tes always did look out for me more than anyone. Besides if she had jumped at the opportunity, who would blame her. She actually wanted a child, unlike me. And she deserved one.

When Richard came home that day, I handed him his favorite cup of coffee. I waited until he took a sip of the French roast before I told him.

“I gave up the baby to Tes.” I said calmly.

Richard looked surprised at the words. His gentle smile transforming into a horrified look as it sunk in.

“What do you mean you gave up the baby? How could you do that? And it wasn’t just your baby to do that” he yelled.

I could see the anger and feeling of disappoint in his face.

“You’re a bloody cheat is what you are. How dare you…” he gasped for air.

I nodded to him and walked out the door. There was only one place I could go, for now at least. I wasn’t entirely sure what would happen between me and Richard. Who’d blame him if he wanted out?

I got on a cab and tried not to think about anything. I stared at the air cushion suspending the car off the surface, hovering just enough to give the effect of flying. I punched in an address code and sank myself into the comfortable seat.

When I arrived at my grandmother’s house I was sure she’d ask me why I was there. She didn’t. Instead she welcome me quietly to her living room.

“Granny.. there is something I need to tell you” I started.

“You sister called a while ago. Its good what you did.”

“I wasn’t ready for the baby Granny. You were right, I’m just not a good mother.” I sobbed. I could feel the heat in my ears, I hadn’t cried this hard in years.

“Poor child, it isn’t any of that. I’m sure you’d make a good mother if that is what you wanted.” My grandmother said as she put her hands around me, hugging me.

“You’re a child after my own heart. The difference is I couldn’t say no, twice. A women is expected to do certain things, at least in my time. I only warned you because if you were anything like me you weren’t ready for that commitment.”

“You?” I looked up, stopping my crying.

“Yes, me. I hadn’t wanted a child any more than you did but I couldn’t tell myself that. Not that at age, not in those times. Children are a commitment and truth is some of us aren’t built for that. But that’s completely fine. Grandchildren on the other hand, those are a delight.” She said with a smile I hadn’t seen in some time.

She jerked me up into the dining room. “You kept your promise to your child. You did everything necessary to ensure his wellbeing. Now stop crying and start eating. Or those clients of yours are going to get lost.”

Granny wasn’t the best at humor, I took after her I suppose. I found solace in her words, I did all that was necessary.
`,
      },
    ],
  },
  {
    slug: "shinigami",
    title: "Shinigami",
    tagline: "He can tell you when you will die, down to the second. He won't.",
    synopsis: "Since he was a boy he has seen a number over every human head, counting down. His grandmother had a word for eyes like his.",
    genre: "Magical realism",
    kind: "short story",
    progress: "complete",
    publishedAt: "2014-10-23T09:00:00.000Z",
    chapters: [
      {
        slug: "shinigami",
        title: "Shinigami",
        summary: "",
        publishedAt: "2014-10-23T09:00:00.000Z",
        content: `“*Who can really tell when someone will die?*” I can. Not in that pseudo-psychic ‘I can sense a dying soul’ kind of way. I can tell you when you will die, down to the exact second. But I won’t, for when I tell you the numbers change.

I see the world the same you do. To my eyes, a rock is just as plain and a bird just as beautiful. I see no numbers over a dove’s head as it is perched on my gutter nor over the chicken I buy fresh at the market. But humans, humans alone I see differently. Everyone has a number floating over their head, counting down to when they become just as plain as a rock. No numbers over their head then. My first memory of telling anyone about the numbers was when I was eight. Oddly enough, my grandmother took it seriously. “Your son has the eyes of a Shinigami” she had said to my father. The sane American people my parents were, they laughed it off to the myths my grandmother had brought from the old country. She, from her stories, was a priestess of the second biggest shrine under the Tokugawa family. The shrine worshipped the legendary Kirin, a beast said to punish those who fail to do their duty. The shrine, along with many other things, was destroyed when the Tokugawa Shogun fell. As expectable from any adolescent girl with new found freedom she decided to drop her priesthood and move to America. Here she married the first man who would. And ever since then she always told stories of the old country. First to my grandfather, then when he got tried to my mother and then when she too had enough of it, she started with me. Not that I complained, her stories were always interesting; much better than the goody goody musical kids show on American television anyway. So when she heard I could see numbers over people’s head, she immediately knew I had the eyes of a Shinigami. Not that I know that is what I have. But you can clearly see how one’s taste for stories involving death and their apparent Shinigami like ability would lead an old superstitious woman to believe that the Kirin had cursed her grandson for her mistakes. After her rememberable episode with my parents, I decided to never talk about this with anyone. For the most it had been a good choice, for I suspect the opposite would’ve ended with me in a strait jacket or a ton of pills.

When I first came to terms with my ability I tried to do good. I’d try to offer comfort to the random stranger in the park, his numbers approaching zero faster than my bank balance while in college. For the most part, this seemed to change nothing, the numbers remained the same. The first time that I changed fate was when I told my friend to drive safely. Turns out, a well-timed drive safely can actually save a life. I still clearly remember that night. It was a stormy one, with the clouds like firecrackers and the trees moving with joy. It felt perfect, the lightening dancing with the pitch black and the rain humming in response. I had made myself comfortable next to the scotch table at the party. I didn’t drink much but I fancied myself a sophisticated man. And sophisticated men had a glass of scotch in their hands. I peered through the scotch in the glass, trying to determine if it was cheap stuff. That’s when I noticed that my longtime friend, college roommate and fellow physics major had only about 9 minutes left. As I dashed toward him, I could see him getting into his car with a girl he had met at the party. We lived about 15 minutes away and putting two and two together I felt like Sherlock. “Drive save Jim. The road is bound to be slippery and we all know about your breaks” I had said through the window before looking over at his partner and whispering “Safety comes first”.

That was the first time I had changed someone’s numbers. In Japanese literature Shinigami are often called God. Now, 8 years later, I understand why. Not only had I saved his life, I had essentially created one more. A few years after that incident, Jim and that girl that gotten married and moved to Chicago. They had a 4 year-old now. The only person I had told of this was my then alive grandmother. She had a smile, a sweet but worried smile when she heard what I had to say. “You better hope that child is still born or you will awaken the sleeping yabu hebi.” I had had enough of the old woman. But I had always remembered what she said with caution; “The world only has a finite amount of time. You have just distributed someone else’s life.”

I can still recall the story about Kami-sama and how the life of all those who had lived, are living or to be born add up the grand existence of the universe. However the universe only had a limited time and no matter how much you tried you can’t increase that number. This is why the Shinigami existed. They made sure the numbers added up. Perhaps in this context, I had failed as a Shinigami. But maybe I wasn’t a Shinigami at all like my grandmother insisted. Maybe I only had the eyes of one.

Eventually I had gotten used to knowing when people would die. I stopped trying to change it. No matter how much I tried I couldn’t save some. And the others I could, numbered in millions. The burden of not doing anything was much lesser than the one that came with choosing one stranger over another. I found solace in the darkness of the night. My worries faded into the black, like a Shinigami in the shadows. I had always blamed the numbers for my lack of love life. I could never really fall for someone with the damn numbers glaring at me in the face, reminding me that whatever it is I hoped to have had an expiry date. And I knew the expiry date of everything except myself. Whenever I looked in the mirror the numbers over my head changed. It was as if the awareness of my own death changed it. This is what had made me take physics in college. I wanted to decipher how fate worked. I thought I’d find my answers buried deep inside the books of Quantum Mechanics. All I found were long equations that took me weeks to understand and yet made no closer to understanding why the numbers changed or what they were. Sometime before my graduation I gave up and added it to the rest of the unsolved mysteries of the universe.

This isn’t to say that I had made my peace with the numbers. It had made me distant, unapproachable and more importantly lonely – inside and out. None of this however stopped Lisa from falling for me. Or making me fall for her. The past year had been the best in my life. I had woken up each morning, laughed at her silly jokes and made fun of the coffee she’d make. “You know if that wasn’t for this terrible coffee you made, I’d have never talked to you. I wanted to know with all my heart how a Barista could ever make such shitty coffee.” I’d say referring to the day we had met. It had been cloudy that day. The heavy grey clouds shielding the brightness of the autumn sun, making the orange leaves appear a deep bittersweet shimmer. The roads were a dark wet gray, the thin film of water mildly shimmering in the light that escaped the clouds. The slight shower of the past hour had put me in the mood for coffee, my drink of choice. I liked it simple and black. No cream, no sugar and nothing fancy. I had my blend of preference but a cup of Jamaican Blue Mountain cost more than my rent at the time, so I settled for a cup of the house blend from the Café across my work. It was affordable with my ‘recent college graduate’ paycheck and was pretty much the only reason I saw the next check. So you can imagine my surprise when I sipped my coffee and it tasted horrible. It wasn’t strong and it tasted a little like nutmeg. I was so angry that I decided to go back and demand to talk to the Barista who made my coffee. It was the best worst cup of coffee I ever had. Eventually when Lisa and I started dating, I was always relieved that she had at least 60 more years. I figured that’d be longer than I’d last. And for the next year I was right and I had a smile on my face every morning, waking up next to her. Until one day I woke up and she only had 3 months left. I freaked out and forced her to get a complete check-up that day. I remember her saying “Honey you’re freaking out. Like one of those people from that reality show about psychics.”

I knew what the results were going to be even before they came. She had something that can’t be cured. She had to have. Because anything else would’ve made the numbers change as soon as I forced her to get a check-up. I can change fate but no nature. I can see when someone is about to die from cancer but the best I could do is prolong it. And in her case, I couldn’t even do that. She refused to go into chemo, not that did it any good for rapid progressive melanoma. She said she wanted to die with her dignity and she died with mine. After her death I lost it completely. Shut myself up in my house. I hadn’t even seen the light of day until today.

Today was a different day. I got up shaved, put on my coat and went to the old Café. The sky was rather cloudless and the sun shined bright, no more darkness to take solace in. All the people in the sidewalk dressed nicely completely unaware of their expiry dates. I hadn’t actually seen the numbers in quite a while. It looked funny, people walking briskly so sure of themselves. Some of them needed to be not so sure. As I walked in, a young barista greeted me. I took my old spot on the counter. “A house coffee please. And can you put some nutmeg in it?” I said.

“Any cream with it?” the barista asked in a sweet voice.

“Nope. Just black coffee with nutmeg and before you ask, it is as terrible as it sounds.”

She smiled politely and proceeded to make my drink.

“Doing anything today?”

I shook my head and said, “Not much. Just redistributing my numbers.”

I took a sip of my freshly made okay blend coffee ruined with the perfect amount of nutmeg and let out a small sigh.

3…

2…

1\\.
`,
      },
    ],
  },
  {
    slug: "short-fiction",
    title: "Short Fiction",
    tagline: "Brief stories of strangers, marriages, and the things people keep.",
    synopsis: "Very short stories, gathered in the order they were written.",
    genre: "Literary",
    kind: "collection",
    progress: "complete",
    publishedAt: "2014-03-03T09:00:00.000Z",
    chapters: [
      {
        slug: "saudade",
        title: "Saudade",
        summary: "",
        publishedAt: "2014-03-03T09:00:00.000Z",
        content: `The busy sounds of the airport on a Monday morning. The crew members walk robustly, traveling between terminals. People waiting to check in, standing in lines that trail off into the distance. A man in a long brown coat and an expensive dress hat stood up from the chair he was sitting in. The coffee from the café didn’t seem to satisfy him. He walked to a ticket counter, dumping the coffee into the trashcan on his way. He looked at the young lady on the other side of the counter; she gestured for him to wait a moment.

“Is it possible to skip the line? I have a ticket to Phoenix and I’d rather not go through that tiresome wait” he said, without waiting.

The ticketing agent looked up at the man. His expensive attire and his posh mannerisms reminded her of the kind of people who flew in private jets. The ticketing agent shook her head.

“That’s alright I suppose” he said turning back around.

“Can I have your name please?” she asked with a stern face.

“Robert. Robert Frisk.”

“And the purpose of the visit?”

“I have a connecting flight to Paris. What category does soul-searching come under?”

Robert thought it was funny but judging by the ticketing agent’s face, she obviously didn’t.

“I’ll put that in as millennial vacation then” she said. She lacked the usual warm and professional tone Robert was used to.

He decided to sit in the waiting area and board once the line was finished. He didn’t seem annoyed about the situation and the agent was rather happy to not face another angry customer.

The waiting area was rather full and there was only one free spot somewhere along the middle row. He hurried in and sat. He pulled his scarf unknotting it, and unbuttoned his long coat. He had accidentally hit the guy sitting next to him while doing so.

“I’m so sorry. You have to forgive me, but this place is rather cramped” he said in a half-apologetic voice.

“That is all right sir. It happens” said the other man, in a thick foreign accent.

Robert guessed he was somewhere from Southeast Asia, judging by his accent. He nodded to the man and took out a magazine from inside his coat. And just as he opened it and started to read, the other man leaned in.

“My name is Rajesh. People call me Raj, sir. Your good name?”

“Robert. And people call me Robert” he said jokingly.

“Funny! You are very funny sir!” exclaimed Rajesh.

Robert smiled in reply. He felt the urge to say something, anything to the stranger.

“So, Rajesh… what are you in the United States for?”

Robert quickly realized his notion that Raj wasn’t a citizen could be wrong and in case it was, it would look very bad. He held his breath and hoped he was right.

“Ah sir, I came here because my company wanted me to. They said I needed to visit the branch here; to get technical training” Rajesh said in a very excited manner.

Robert let out a breath of a sigh.

“And what is it that you do for your company?”

“I’m a product engineer, sir. I’m in charge of overseeing the product testing in my factory. But after this sir, I can get a promotion. Become a manager!” he said with a big smile on his face.

“Indeed good news” added Robert.

“Sir, this is actually my first time aboard. I thoroughly enjoyed this week sir. I worked hard but it felt amazing; it just felt super sir!”

There was a little pause. Robert was amused by Raj’s happiness. If he had to go aboard for a week just to work, he’d be upset if anything.

“First time I traveled in an airplane as well, sir. I know I might sound silly but I’m proud sir! First-person in my family to go on an airplane.”

Rajesh was overflowing with innocent pride. And it brought a real smile to Robert’s face.

“Sir, you go on a flight often?”

“Yes. But this is my first time flying first class.”

“Ah, Sir! Yes, it is very nice no? They gave me excellent food when I came to the USA. Excellent sir!”

There was something about the innocent way in which Raj talked. It touched Robert in a way he hadn’t experienced before, he seemed to like Raj for that.

“Actually Rajesh, I usually take a private jet. But there was a mechanical problem this time around and I decided to make do with this instead. But you make it sound nice; reassuring really!” Robert replied. He tried not to show off the fact but he couldn’t help it.

“Oh, sir! I am sorry. But you must be so rich. If I may ask sir, what do you do?” asked Rajesh in a humble manner.

“This and that. But I mostly oversee my trust fund” Robert smiled.

The joke seemed to have gone past Rajesh, who did not show much of a reaction.

“What a wonderful life sir! If I could not work and still manage to go on an airplane, how wonderful sir!” Rajesh exclaimed again.

“Oh, Rajesh you’d be surprised” Robert replied with his usual smile.

“Sir, I come from a very poor family. I went through college with a lot of money borrowed from my family. And when I got the job I worked for 5 years before I could marry. Now I’m trying to find enough money to send my children to college. Trust me, sir, your life is wonderful!”

“But Rajesh, that’s exactly it. You have a need for money. You have more people to spend it on than you have money for. Me, I have more money than I have people to spend it for” Robert said, his smile turning into a line. His eyes glistened momentarily.

He blinked and brought back the smile.

“I’m so sorry sir. I didn’t mean to… ”

Before Raj could complete it, Robert cut him off.

“It's fine Raj. I think I picked up the notion somewhere along the line that I needed a little soul-searching. Now, I’m not that sure. Maybe it’s just people I need to search for. And by the way, my friends call me Robbie” Robert said, smiling inside and out to the stranger who smiled in return. Only this time, the smiles were the same. Honest and simple.

“The heart wants what it wants Robbie. It always wants a family!” Raj said with a contagious amount of enthusiasm.

Outside their first-class window, the night sky darkened over the horizon. The city lights were now a distant sight, meeting the ocean which reflected the amber hue of the sunset.
`,
      },
      {
        slug: "silk-on-a-frame",
        title: "Silk on a Frame",
        summary: "",
        publishedAt: "2014-10-05T09:00:00.000Z",
        content: `The last time I saw that *Sampot* was in 1988. It was a different time back then; it was a different place. The whole world seems to have changed, perhaps aged. Or maybe it is just me. Maybe it is just me who aged, who matured. Back then the life of a mercenary seemed glamorous to me. The constant fighting, the enormous pay, and most of all the power that came with it. There was something about carrying that brand new M21 and hitting nameless targets that seduced me into the career.

My name was Alpha Echo 9-1-9, call sign Hawkeye. My job was to provide detailed reconnaissance and take down high-value targets as the infantry invaded village by village. I wasn't a smart guy like the rest of the snipers seemed to be. I didn't even know Cambodia was a place until I landed in it. I hadn't thought about the lives I took while behind my scope; I told myself "If it wasn't me, it would be someone else". I was so sure that every time was going to go the same, I'd climb up to some nice towering spot and shoot until the village was taken. I hadn't considered dying, I hadn't considered being caught. Ah hell, I was too good. But what really got me was something only Alan Rudolph would've considered. There I was sitting on a giant tree with its shedding leaves a dull tone of yellow, under the topic sun, ready to scope my next target. And then my target walked right in, with a white cloth held up. She waved the cloth at the infantry who were waiting to advance. It amused me that a villager would even be brave enough to step in front of a squad of armed soldiers, let alone a girl. That was the first time I saw that Sampot. It was a piece of art; magnificent red silk woven into curious little patterns. I hadn’t ever before stared at a piece looking with awe. It amazed me that something so beautiful could be worn, had it been up to me it’d be framed and hung on a gallery wall somewhere in Manhattan. All in all, it was a pleasant raid. Or at least as pleasant as those things can get. Turned out the village we were scouting was a mostly Vietnamese one and our orders were clear, “Escort all Vietnamese out to safety”. We packed up later that day, giving the villagers enough time to get their things. I only spoke to the girl once in the 3-day journey back across the border. She sat to my right in the back of the truck, uttering not a word. “Beautiful skirt” I said. She nodded in response. It took her a while but eventually, she said “It was my grandmother’s. People tell me it's worth more than the entire village”. All my grandmother left me was a locket. It was a nice locket but it was barely worth anything. It had her picture inside though and somehow that's all she needed to leave me. Everything I found out about her was from another villager, a chatty one. He seemed desperate to be friends with us and his English was okay, so we entertained him. I learned that the girl wanted to set up a “textile shop” as the man called it. I was no fool and I knew I’d never see her again. I liked her, I truly did. But I didn’t even know where to begin and my squad ‘rescuing’ her village didn’t make for the best of situations either.

But I always remembered that Sampot. Of course, I didn’t know that's what it was called. Not until I stared through the window of “Pham’s Textile Emporium”. And there it was, framed in glass labeled “Sampot: Traditional Red Silk. Not for Sale”.
`,
      },
      {
        slug: "in-pretty-flowers",
        title: "In Pretty Flowers",
        summary: "",
        publishedAt: "2014-11-17T09:00:00.000Z",
        content: `The flowers are pretty. They are pretty because they hide the dirt underneath. They are pretty because they are vibrant and colorful; even though they are on a bed of dull and ugly. That’s what he wanted me to be. Two months into my marriage the problems started. It started with an innocent “Your coffee could be better Rory. Just make sure to brew it a little less long.” Like he made coffee, ever. And what does he know about good coffee? He grew up in a lower-middle-class family in New Jersey. The idiot probably couldn’t spell espresso if I asked him to. Why had I married him? That escapes me. Was it really me who found this tasteless prick of a husband attractive a few months ago? Was I in a trance or was it one of those young rebellious things that children do just to spite their parents? The same simple brown jacket which I found curiously attractive a year ago, I now find plain and cheap. It wasn’t as if he couldn’t afford a better one, he did have a full-time job at a law firm now. A cheap jacket as an intern was one thing but as a junior lawyer is a whole other. I’m embarrassed to even go with him to his work parties, to be beside him in his cheap outfits while everybody else waltzes in their expensive attire. I’m sick and tired of not belonging in crowds, of not even pretending. Soon he found fault with everything I did. Like it was me who was doing things wrong. “Don’t buy expensive dresses Rory”, “Don’t make too much food Rory” and “Ah com’on make a little more food.” How was I supposed what in fucking god’s name was the right amount of food? Did I look like someone who cooked enough to know? Maybe I did. Maybe in this filthy cheap dress, I do look like some dumb Jersey wife. The cheap dress, the complaints about food I could take. Maybe I was spending too much, maybe our financial situation will improve soon. Maybe in some miracle I’ll learn how to fucking cook. But then came the “You just don’t understand me Rory”. That motherfucker, I did all of this… I did everything I never fucking thought I would. And now he thinks I don’t understand him? What the fuck more was I supposed to do? Do bake sales because his sorry ass couldn’t make money as a lawyer? A fucking lawyer. “Would it kill you to put in a garden? All the other wives are doing it”. Fine, I’ll put in a fucking flower bed. How about right in the fucking living room? Maybe he’ll find that artsy. So I called up my dad’s old contractor and had him dig me a field in the living room. He look at me like I was crazy. I was crazy. But at least he’ll get his fucking garden.

And then came the final blow. He came home drunk, with perfume all over him. His excuse? “You don’t satisfy me Rory. We just aren’t what we used to be. This, us is not working.” Oh fucking no. Then he walked into the living room. His blabbering drunken voice, his wobbly walk all piss me off. “What in the name of… what the hell is this Rory?” Well it’s the fucking garden you asked for. And that was it. I was done with all of it. So I took a shovel to his head. The weak motherfucker didn’t even resist. Two hard blows to his dead and he stopped breathing. “Do you like the Garden Rick?” I asked to no reply. “Maybe if you look at it a little closer” I said as I rolled him into a hole. A hole that I dug, for him. It was all for him. And as I sat there with dirt all over me and the flowering plants I bought at Martha’s all around, I wondered if I could start brewing the coffee the way I like it. Maybe I can.

I didn’t really think through the whole burying my husband in my living room under a flower patch thing. I hadn’t even thought through the flower patch in the living room. Attracts a lot of bugs. The police came by the house a couple of times after I called him in missing. They told me they think it was the mob. The skank Rick was seeing was a mob boss’s daughter. I suppose you know people when you grow up in Jersey. And my whole act of surprise when the police told me about the affair, ah I should’ve won an Oscar. Things were okay. Rick’s meager life insurance held up just long enough before I got a job as a columnist for the New Jersey Daily. It paid better than Rick’s. And I always watered the flowers. They were really vibrant. All things colorful grew on a patch of ugly and dull.
`,
      },
      {
        slug: "tiny-is-just-another-word-for-big",
        title: "Tiny Is Just Another Word for Big",
        summary: "",
        publishedAt: "2016-01-28T09:00:00.000Z",
        content: `"Everything said, I am a little short. I'm glad my boy isn't" said my Mom with a smile on her face, expressing nothing but exult. My Dad, with his usual exuberant smile, said "Well I'm glad you're not taller. How could I possible handle more?" looking at my mom. My Dad ladies and gentlemen, the ever mischievous learned man. "So I'm trouble? Me?" my tiny shell, giant heart of a mother demanded. "Yea, trouble I love to have" replied the ever so charming man. Right at that moment, I knew what I wanted from life. I knew what love and happiness looked like. Some might say that I set an unrealistic standard for my dreams. Others might argue that I was foolish to think I’d be as lucky as my folks. But the truth is much simpler, I simply tasted happiness that was out of the reach of the majority and I couldn’t quite get it off my tongue.
`,
      },
    ],
  },
  {
    slug: "whose-fault-is-it-anyway",
    title: "Whose Fault Is It Anyway?",
    tagline: "An interrogation on the coldest morning in years, and a question no one in the room can answer.",
    synopsis: "Detective Jenkins is handed a big case on the coldest morning in years: a young woman in cuffs who will not give her last name. She would rather tell him a story.",
    genre: "Crime",
    kind: "short story",
    progress: "complete",
    publishedAt: "2014-02-14T09:00:00.000Z",
    chapters: [
      {
        slug: "whose-fault-is-it-anyway",
        title: "Whose Fault Is It Anyway?",
        summary: "",
        publishedAt: "2014-02-14T09:00:00.000Z",
        content: `The ice cold morning breeze struck against his cheek as he removed his scarf.

“It hasn’t been this bad for years” he muttered as he walked through the hallway, brushing snow off his coat.

“Good morning Jenkins. We’ve got a big one this time” said Sarah, as she gestured him to the end of the hallway. There was a peculiar smile on her face. If Jenkins was a man of better instincts, he might’ve wondered why Sarah was happy that a high profile case was passed on to him instead of her. But Jenkins wasn’t a man of better instincts, at least not in this matter. It was no surprise in the end that it was Jenkins who got the case. Sarah and Jenkins might’ve been equal in rank, but not in experience.

*“5 years after the promotion. That’s when you become a Detective”* Jenkins thought to himself. Jenkins had been rather successful with his cases. Over a 90% closure rate and no black marks on record. An impressive feat for having served over 15 years on the force. Jenkins was a good cop, but he was neither brilliant nor ‘a natural’. But he was through. And often that was all it took to be good. He prided in himself for going that extra mile, for seeing it through to the end and leaving no rock unturned. It was a good trait to have as a detective.

He walked towards his desk with his characteristic limp; his right leg twitching every time he put weight on it. It made him slouch a bit to the right, nothing too visible nonetheless. Many around the office wondered about his limp but no one had the courage to ask. He looked down at his desk, finding as expected his daily cup of coffee and the new case file. He help up the coffee cup wondering about what might’ve turned up today. He had been told that it was a big one. Was it perhaps a high profile homicide? Or maybe a kidnapping? Kidnapping cases were always tricky. “*Kidnappings had low success rates and were always a huge negotiations affair*”, he thought as hot liquid poured down his throat. He always drank his coffee in huge gulps. Setting the empty cup down, he flicked open the case file examining its contents. His pupils dilated.

“Hey Sarah, I need you to listen in on this. I can use an extra set of ears” he said with a monotone. To him monotones were the norm. It was good to be unemotional and calm, it was good to be reliable.

Sarah stared at him with surprise. He had never asked her to listen in on his interrogations before. For him to ask a rookie like herself, she grinned.

“Well, what is it? Are you in or not?” Jenkins shouted walking across the hall, his back to her.

“I’ll be on the other side. You can thank me later” she said hastily, trying hard to hide her excitement. How oblivious was he? She had clearly shown interest in him and yet the man seemed to not notice that at all. She let out a heavy sigh. “A long day ahead” she whispered to the air.

Jenkins took out his phone and switched on the recorder. “Suspect is Female, approximately 25. Her identity is as of yet unknown”. He hit pause and took in a deep breath. He raised his back, corrected his posture and let out the breath. He put his hand on the door knob. He waited a moment to allow his mind to clear. He then gently open it, making his way in as silently as possible.

The suspect, a young woman was draped in a dark green gown. It has a rather dull gown, he noted. Her hair on the other hand had been well maintained and neatly combed. It flowed black from her head to her hip. The long hair compliment her pale face. It had a sort of beauty to it he decided. He made a clucking sound with his tongue. It got her attention like he had hoped. She raised her head to meet his eyes. Her eyes were a deep black, glistening in a most unusual way. There was something sad in those eyes Jenkins had thought.

“I’m Detective Jenkins. It’s nice to meet you, Ms.?” He broke off, expecting the question to yield an answer.

“Taurine. I would share the feelings of niceness had it not been for these cuffs detective. They certainly make the situation a lot less nice” She said in a deep and cold tone. A monotonously deep and cold tone.

He noted that she showed no signs of being scared, hell she didn’t even appear uncomfortable.

“And your last name?” he enquired rather hurriedly. He had heard that peculiar name before, it had been many years before but he still remembered it all the same.

“Last names are for people with a family detective. I’m afraid I am a ghost, with only my reflection to remind me of my existence”. Her words still exhibited no signs of emotion. He nodded gently to her and excused himself for a moment. He hurried over to the other side of the observation mirror. Sarah had been on the other side, listening as he had requested her.

“I need you to confirm something for me. Run our suspect’s profile against a missing persons report for a Taurine Adler” Jenkins said in a low but firm voice.

“You think she has something to do with that case?” Sarah said with a bit of surprise.

“I think she might be the case. I’ve a strong hunch that she is Taurine Adler. I came across the case over 15 years ago, when I was still just a uniform. The girl who went missing was about 10 years old and had black hair” He motioned at the glass separating the two sides. He knew that the room was sound proof and there was no way Taurine could hear them but he still felt the need to talk in a low voice.

Sarah looked with an expression of shock at Taurine, through the glass. Almost simultaneous, Taurine had turned her face and stared Sarah in the eyes. “Coincidence. She couldn’t possibly see through the one sided mirror” Sarah told herself.

Jenkins walked back into the interrogation room. “It’s quite remarkable really. After 15 years, I get to solve a case that had always bothered me. Ms.Adler I’m afraid I know exactly who you are. You do have a family and they’d be happy know you’re still alive. I’m quite sure of that.”

She stared at Jenkins, expressionless. “Let me tell you a story detective” she said. “A story about a child who was rejected by society and shunned by tradition. A child who merely showed a work of art made of rodents, some alive and some dead. The parents were expectedly shocked. They hadn’t known better and society did what it had always done best. Abandoned by family and distraught by society, children can become awful people. Tell me detective is it the kid’s fault, or is the parents, or better yet – is the society responsible? Who is at fault?”

Jenkins shook his head in dismay. “I’m afraid I’m merely a detective Ms.Adler. I don’t determine who is at fault, I merely determine who did what. It is actions I’m interested in and not their rightness. Or for that matter their wrongness.”

There was a knock on the door. Jenkins excused himself once more. It was a Sarah with the details he had requested.

“You were right. Preliminary reports seem to suggest she is Taurine Adler. I’ve called her family and notified the doc. We should know soon enough.”

Jenkins smiled. How easy things had become with DNA tests and facial recognition. Technology certainly made things faster. But it was the hunches however that truly solved the cases. He no doubt solved the cases faster with the help of technology, but he couldn’t say if he did it any better than before. He better put off such questions for later, he thought.

Entering back in, he said “The story I’m more interested in is what happened today morning. The reports says that a call was received, presumably from you, stating that a man had died in an apartment at 43, NW VanGauren. The first responders had found an old man, already dead, lying in your hands. The old man had died of a heart attack. What this document describes then is what I’m most interested in Ms.Adler. It says you claim to be The Expressionist.”

“And what of it?” Taurine said, her voice a little low this time.

Sarah listened closely. She knew that the case had a lot resting on it. “Hell the Feds might show up anytime. If they do, we’re going to have to give this case up and Jenkins isn’t going to like it. Not one bit” She said out load.

Serial Killers usually came under FBI jurisdiction. It wasn’t going to be long before the FBI showed up and took over their case. And no detective ever wanted to give up a case, but in this case there was only one thing Jenkins could do – try to get as much as he can before the feds got here. The Expressionist he knew was a big priority even for the FBI, mostly owing to the killer’s notoriety.

“You say that Ms.Adler but I have a hard time believing it. The Expressionist first started killing about 15 years ago. It was in fact soon after your disappearance” Jenkins remarked.

“Wouldn’t that in fact make more sense detective? That the killings should start soon after I left my parents? ”. Taurine’s voice had reverted back to a deep and cold one, her face yet to show a single expression.

“On the contrary, a 10 year old girl who recently ran out of home couldn’t possibly commit a murder and then put the body up for display.” Jenkins smirked.

“You underestimate me detective. But I’m afraid I do not have to convince you that I’m guilty. It is my understanding that they pay you to do it” she said in a rather snide tone.

“Not all Ms.Adler. I’m paid to uncover who committed the crime. And I believe it wasn’t you.”

“Let us continue the story of that child. There is more I want to tell you” She said looking up at the detective’s face. She continued, “I suggest you take a seat”. And Jenkins did so.

“The child you see Detective wanted to be appreciated for the work but in return was shunned instead. Having found home an unwelcome place, the child had no option but to run away. But that is where the story gets interesting. The child spent some time being homeless and wandering about until someone thought to do some good. The child ended up in an Orphanage. But you see this Orphanage wasn’t a normal one. They called it ‘The Lord’s House’. The Nuns had told the child it was a place of purification, a place where all were trained and required to be sinless. The child was ‘disciplined’, as the nuns had called it, when they found out the child’s unusual taste in death. All was well for a while detective. But alas it only lasted a short time. You see a curious mind is like fire. The more you try to blow it out, the more it rages. The nuns concluded that there was no way that a normal child could be of such a nature. Morbid tastes, they said, were the results of demonic possession” She paused and smiled.

Jenkins wondered if the pause was for effect. If it was, she certainly had it.

“Do you know what they do when a demon possess you Detective? They exorcise it. The funny thing was, though the nuns with all their good hearts tried to get rid of a demon, they did so in a place where none had existed. In the end, they summoned a monster far greater than what they had feared.”

“Were you that child Ms.Adler?” Jenkins asked slowly.

Taurine adjusted herself in her seat and continued, “The monster, Detective, wasn’t happy about being in the house of the Lord. Naturally, it fled. It had taken on the morbid tastes of its host. You see Detective, morbid tastes make for good art. And a monster’s art is truly like no other.”

“But why display the bodies in the way the monster did?” Jenkins said, realizing that the only way she’d answer is if he played along.

“You could suppose that monster made the art in jealousy. The monster you see had wanted to be among the people but it couldn’t. For it couldn’t laugh nor cry, smile nor frown.” She said. She laid her hands on the table and titled her head back before muttering, “I suppose even monsters are jealous”.

Jenkins had stood their listening, frozen against the wall. A sudden shiver went down his spine. He pictured a 10 year old Taurine, killing a person but not before mutilating their face. She had called it ‘art’. In all his years as a detective, he had never felt as cold as he did right at this moment. And then he remembered.

“But the old man. You haven’t told me about him.”

“The monster, detective, had an apprentice. A very loyal one. The monster’s work had not been understood by any other. And for that the monster coveted the girl.”

And within a flash, Jenkins could see it all happen in front of his eyes. It all made sense to him now.

“I can see it all now. I can see the monster, I can see it carrying away the girl. I can see the girl slowly accepting the monster… ” Jenkins was cut off.

“I do not expect you to understand detective. But do not make a mockery of it. I truly did see the monster’s genius, a most wonderful art. I do admit it took me a while but blame me not, I was nothing but a regular mind. I couldn’t see the brilliance that shone in front of me for a long time. I am ‘The Expressionist’, for I truly am the rightful heir to his works. I merely seek to let the world know of the genius of my teacher”.

Jenkins waved her to stop. He poured some water into her glass and gestured her to drink. He had enough and he had heard exactly what he wanted to. He silently stepped out of the room. He stopped the recorder on his phone.

“You set her up to say that!” scowled Sarah.

“I don’t know what you’re talking about” smiled Jenkins.

“Oh yes you do! You do very well! She was going to admit about being an accessory but you stopped her! You wanted to make her look like a victim!”

“She is a victim” said Jenkins, stressing his words. “She is nothing but a lost child. The FBI doesn’t care about that. They need a criminal and they need a live one. They won’t be satisfied with the dead body of a crumpled old man.”

“I understand what you’re trying to say Jenkins. You want to claim she suffers from Stockholm syndrome. But as you said in there earlier, we’re here to find out who did what. We merely report actions, not judgments” Sarah was quite upset. She hadn’t expected Jenkins to be this way. To her this was totally unacceptable; it was unethical.

“Oh bullshit! I took this job to protect people and I’ll do it any chance I get.” Jenkins said with a conviction. “She was a 10 year old girl who was kidnapped and held captive by what she aptly called a monster. She did what she did to find love in the only place she could” said Jenkins. For the first time, Sarah could see sadness overcome his stern facial muscles.

“It still wasn’t okay to do what you did. But I suppose the feds will be forced to treat her better this way” She said, with that smile only Jenkins seemed to bring about on her. She wondered if she changed her judgment on the matter merely because of her feelings for Jenkins. No, she could sympathize with the girl just as much as Jenkins. *She was a victim*.

“I’m sorry about scowling at you, Jenkins.”

“Not at all. You were and are right. I just did what I felt I must. And please call me Tom.” He smiled at her. He was to an extent impressed how well she had seen through him.

She smiled back. He had never smiled at her before. It made her happy. Very happy.

“So that’s what you’re actually called. There is a going bet around the office about that.”

“We’ll split it 50-50” ~~Jenkins~~ Tom joked.
`,
      },
    ],
  },
];
