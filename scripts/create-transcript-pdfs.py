from __future__ import annotations

import html
import re
from pathlib import Path

import pdfplumber
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "content" / "story-transcripts"
OUTPUT_DIR = ROOT / "output" / "pdf"

STORIES = {
    "funny-fah-learns-when-to-stop": {
        "title": "Funny Fah Learns When to Stop",
        "ends": [5, 8, 9, 11, 14, 16, 17, 19, 22, 24, 25, 27, 29, 33, 37, 38, 39, 42, 44, 45, 48, 52, 53, 56, 57, 65, 67, 69, 70, 72, 77, 78, 79, 81, 82, 83, 84, 86, 89, 91, 94, 96, 99, 100, 102, 103, 106, 110, 111, 113, 114, 115, 118, 120, 121, 124],
        "questions": {9, 17, 22, 24, 38, 77, 81, 82, 100, 102, 111, 115, 121, 124},
        "exclamations": {25, 39, 78, 83},
        "paragraphs": {5, 19, 39, 69, 103},
        "punctuate": {
            "stop in a palace": "stop. in a palace",
            "old man his name": "old man. his name",
            "chai lou every day": "chai lou. every day",
            "relaxing melodies master": "relaxing melodies. master",
            "their adventures this is": "their adventures. this is",
            "happy too funny far": "happy too. funny far",
            "very happy he is": "very happy. he is",
            "funny jokes he shouts": "funny jokes. he shouts",
            "the doctor the others": "the doctor? the others",
            "well get it": "well. get it?",
            "peeling well then": "peeling well. then",
            "the other slide he laughs": "the other slide? he laughs",
            "that one said": "that one, said",
            "a garbage truck he had": "a garbage truck. he had",
            "of times sometimes": "of times. sometimes",
            "too loud would you": "too loud. would you",
            "saturday night before": "saturday night? before",
            "to the movies they": "to the movies. they",
            "sighed oh after breakfast": "sighed. oh. after breakfast",
            "really annoying a feather": "really annoying. a feather",
            "in school little t": "in school? little t",
            "like this funny far": "like this. funny far",
            "down real fast then": "down real fast. then",
            "anymore funny far": "anymore. funny far",
            "stop it let us": "stop it! let us",
            "for the day even the tree": "for the day. even the tree",
            "the big smile sun smiles": "the big smile? sun smiles",
            "to the sun good night": "to the sun. good night",
            "colorful pillow master": "colorful pillow. master",
            "near the palace the worker": "near the palace. the worker",
            "through the window guess what": "through the window. guess what",
            "not for jokes knock knock": "not for jokes. knock knock",
            "he shouted go to sleep": "he shouted. go to sleep",
            "a kookaburra little so": "a kookaburra. little so",
            "quiet time now she": "quiet time now. she",
            "into his pillow the evening": "into his pillow. the evening",
            "everything went hush master": "everything went hush. master",
            "with a jerk the baubles": "with a jerk. the baubles",
            "to chatter what was": "to chatter. what was",
            "nearer to him what is it": "nearer to him. what is it?",
            "he whispered who's there": "he whispered, who's there",
            "mr monster then he shouted": "mr monster? then he shouted",
            "i'm not joking i saw": "i'm not joking. i saw",
            "a monster we know": "a monster. we know",
            "other way oh no": "other way. oh no",
            "looked and looked and looked the monster": "looked and looked and looked. the monster",
            "believe me why didn't": "believe me. why didn't",
            "the monster why wouldn't": "the monster. why wouldn't",
            "who's there i told": "who's there. i told",
            "what did i do wrong funny far": "what did i do wrong? funny far",
            "not the monster next day": "not the monster. next day",
            "the palace master chylu": "the palace. master chylu",
            "beautiful songs funny far": "beautiful songs. funny far",
            "a monster it was": "a monster? it was",
            "put them away c here": "put them away. c here",
            "the gardener funny far": "the gardener. funny far",
            "stop joking was she right": "stop joking. was she right?",
            "who the monster was and": "who the monster was. and",
        },
    },
    "hi-doh": {
        "title": "Hi Doh",
        "ends": [1, 3, 8, 12, 17, 20, 25, 29, 31, 32, 35, 39, 44, 45, 47, 48, 51, 52, 54, 57, 58, 60, 63, 66, 70],
        "questions": {8, 20, 51, 70},
        "exclamations": {32, 50},
        "paragraphs": {1, 17, 35, 51, 57},
        "punctuate": {
            "happily together they play": "happily together. they play",
            "mexican villa mr diego": "mexican villa. mr diego",
            "from overseas he flew": "from overseas. he flew",
            "little chimes mr diego": "little chimes. mr diego",
            "the ceiling can you see": "the ceiling. can you see",
            "swinging around he noticed": "swinging around. he noticed",
            "is different each chime": "is different. each chime",
            "play beautifully he says": "play beautifully. he says",
            "purple little chime the little": "purple little chime. the little",
            "the others especially": "the others. especially",
            "full-toned chime his chime": "full-toned chime. his chime",
            "chiming loudly hi doe": "chiming loudly? hi doe",
            "his spirit now he": "his spirit. now he",
            "chime plate the other": "chime plate. the other",
            "listen to them he selfishly": "listen to them. he selfishly",
            "high c note it is": "high c note. it is",
            "correct him i don't": "correct him. i don't",
            "your sound huh funny far": "your sound. huh, funny far",
            "star qualities he is": "star qualities. he is",
            "proud and stubborn i don't": "proud and stubborn. i don't",
            "on my own and off": "on my own. and off",
            "proud and selfish their master": "proud and selfish. their master",
            "very much mr diego": "very much. mr diego",
            "without high doe they": "without high doe. they",
            "a concert mexicans": "a concert. mexicans",
            "love his performance hydo": "love his performance. hydo",
            "the voice he smiled": "the voice. he smiled",
            "long and loud at first": "long and loud. at first",
            "it was interesting but": "it was interesting. but",
            "what else can you sing can you": "what else can you sing? can you",
            "anything else hi dough": "anything else? hi dough",
            "so embarrassed hydo": "so embarrassed. hydo",
            "his friends he wants": "his friends. he wants",
            "his friends he wants to see": "his friends. he wants to see",
            "mr diego he begins": "mr diego. he begins",
            "at a distance hydo": "at a distance. hydo",
            "them play and hydo": "them play. and hydo",
            "to cuddle him hydo": "to cuddle him. hydo",
            "little individual they": "little individual. they",
            "how anxious he was they": "how anxious he was. they",
            "for his hand everyone": "for his hand. everyone",
            "he was saying sorry now": "he was saying sorry. now",
            "mr diego can you see": "mr diego. can you see",
        },
    },
    "imaginative-little-mee": {
        "title": "Imaginative Little Mee",
        "ends": [1, 6, 7, 10, 20, 21, 26, 27, 31, 36, 39, 40, 41, 43, 45, 46, 48, 52, 57, 58, 63, 65, 73, 75, 76, 79, 80, 82, 84, 86, 88, 92, 95, 102, 103],
        "questions": {7, 20, 26, 40, 89, 102},
        "exclamations": {21, 45, 52, 63, 76, 78, 92},
        "paragraphs": {1, 20, 36, 58, 79, 95},
        "punctuate": {
            "pleasant tunes his favorite": "pleasant tunes. his favorite",
            "colored little chime whenever": "colored little chime. whenever",
            "little chimes one evening": "little chimes. one evening",
            "to tiny tea and said": "to tiny tea and said,",
            "our master the other": "our master. the other",
            "new idea as they": "new idea. as they",
            "circle dance later": "circle dance. later",
            "the moon after days": "the moon. after days",
            "finally arrived little me": "finally arrived. little me",
            "her shoulder can i": "her shoulder. can i",
            "funny far but little": "funny far. but little",
            "her imagination with wide": "her imagination. with wide",
            "out of the way she": "out of the way. she",
            "big crash crash immediately": "big crash. crash! immediately",
            "to shock wow": "to shock. wow!",
            "that sound except": "that sound, except",
            "it was great little t": "it was great. little t",
            "after all the little": "after all. the little",
            "send them back hydo": "send them back. hydo",
            "circle dance first he": "circle dance first. he",
            "her turn oh cool": "her turn. oh cool",
            "beautiful song when crash": "beautiful song when, crash",
            "she was so excited i can't wait": "she was so excited. i can't wait",
            "fantastic she replied": "fantastic, she replied",
            "angry ray little me": "angry ray. little me",
            "waited her turn the little": "waited her turn. the little",
            "there was silence little me": "there was silence. little me",
            "opera house she was": "opera house. she was",
            "she was a star wake up": "she was a star. wake up",
            "your turn but little": "your turn. but little",
            "in her mind what a daydreamer": "in her mind. what a daydreamer",
            "daydream world angry ray": "daydream world. angry ray",
            "they have to go they": "they have to go. they",
            "new musical instrument funny far": "new musical instrument. funny far",
            "little me anxious moments": "little me. anxious moments",
            "talking it over no one": "talking it over. no one",
            "happy again the others": "happy again. the others",
            "noisy problem after talking": "noisy problem. after talking",
            "started laughing someone shouted": "started laughing. someone shouted",
            "little me little low said": "little me. little low said",
            "another idea angry ray": "another idea. angry ray",
            "stop laughing everybody": "stop laughing. everybody",
            "her friends she did": "her friends. she did",
            "the symbols down she": "the symbols down. she",
            "with her friends she": "with her friends. she",
            "open to all and now": "open to all. and now",
            "little tin hats all the": "little tin hats. all the",
            "little hats do you know": "little hats. do you know?",
            "yes it was little imaginative me": "yes, it was little imaginative me.",
        },
    },
    "little-ray": {
        "title": "Little Ray",
        "ends": [1, 6, 12, 13, 18, 19, 20, 25, 27, 31, 38, 44, 45, 46, 50, 52, 57, 59, 64, 66, 67, 69, 75],
        "questions": {12, 18, 20, 44, 47},
        "exclamations": {20, 51},
        "paragraphs": {1, 12, 31, 38, 52, 66},
        "punctuate": {
            "his anger as a new": "his anger. as a new",
            "chime plate master": "chime plate. master",
            "the floor he helps": "the floor. he helps",
            "day ahead four": "day ahead. four",
            "paddle ball rackets can you": "paddle ball rackets. can you",
            "blue chime today he": "blue chime today. he",
            "chime plate a lovely": "chime plate. a lovely",
            "unexpectedly stops it's": "unexpectedly stops. it's",
            "on her nose have you": "on her nose. have you",
            "your nose wow": "your nose? wow!",
            "by little t little t": "by little t. little t",
            "automatically reacted she": "automatically reacted. she",
            "his racket hey watch": "his racket. hey, watch",
            "little t little t tells": "little t. little t tells",
            "nosey away angry little": "nosey away. angry little",
            "he pushes her funny far": "he pushes her. funny far",
            "even madder he turns": "even madder. he turns",
            "the racket he dropped little t": "the racket he dropped. little t",
            "his anger look the breeze": "his anger. look, the breeze",
            "have stopped he is": "have stopped. he is",
            "what is happening master": "what is happening? master",
            "green tea little lo": "green tea. little lo",
            "his visitors little tea": "his visitors. little tea",
            "with him what's the matter": "with him. what's the matter",
            "leave me alone he cried": "leave me alone, he cried",
            "little ray please tell": "little ray. please tell",
            "i couldn't sleep the weather": "i couldn't sleep. the weather",
            "has changed yes added": "has changed. yes, added",
            "tonight angry little ray": "tonight. angry little ray",
            "extra blanket i have": "extra blanket? i have",
            "little t master chai": "little t. master chai",
            "angry little rey i'll go": "angry little rey. i'll go",
            "my friends mine too": "my friends. mine too",
            "added butterfly the little": "added butterfly. the little",
            "little ray the little chimes": "little ray. the little chimes",
            "much better now that": "much better now that",
            "hugged someone the anger": "hugged someone. the anger",
            "to little t i'm sorry": "to little t. i'm sorry",
            "little t i understand": "little t. i understand",
            "her hand it is": "her hand. it is",
            "and wave angry little": "and wave. angry little",
            "new blankie the sounds": "new blankie. the sounds",
            "the room his curious": "the room. his curious",
            "palace foyer the old": "palace foyer. the old",
            "their differences he": "their differences. he",
            "gentle tunes now nosey": "gentle tunes. now nosey",
            "silk blankies too imaginative": "silk blankies too. imaginative",
            "angry little ray and angry": "angry little ray. and angry",
        },
    },
}


def body_lines(path: Path) -> list[str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    for index, line in enumerate(lines):
        if line.startswith("Transcript note:"):
            body_start = index + 3
            break
    else:
        raise ValueError(f"Transcript note not found in {path}")
    return [re.sub(r"\s+", " ", line).strip() for line in lines[body_start:] if line.strip()]


def word_tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+(?:'[a-z0-9]+)?", text.lower())


def build_sentences(lines: list[str], config: dict) -> list[tuple[str, bool]]:
    ends = set(config["ends"])
    if len(lines) not in ends:
        raise ValueError(f"Final cue {len(lines)} is not a configured sentence end")

    sentences: list[tuple[str, bool]] = []
    current: list[str] = []
    for cue_number, line in enumerate(lines, start=1):
        current.append(line)
        if cue_number in ends:
            sentence = " ".join(current)
            for original, punctuated in config.get("punctuate", {}).items():
                sentence = sentence.replace(original, punctuated)
            mark = "?" if cue_number in config["questions"] else "!" if cue_number in config["exclamations"] else "."
            sentences.append((sentence + mark, cue_number in config["paragraphs"]))
            current = []

    if current:
        raise ValueError("Unclosed transcript cue group")

    original = word_tokens(" ".join(lines))
    reorganised = word_tokens(" ".join(sentence for sentence, _ in sentences))
    if original != reorganised:
        raise ValueError("Transcript words changed while reorganising sentence boundaries")
    return sentences


def register_fonts() -> tuple[str, str]:
    regular = Path("C:/Windows/Fonts/georgia.ttf")
    bold = Path("C:/Windows/Fonts/georgiab.ttf")
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("TranscriptSerif", str(regular)))
        pdfmetrics.registerFont(TTFont("TranscriptSerifBold", str(bold)))
        return "TranscriptSerif", "TranscriptSerifBold"
    return "Times-Roman", "Times-Bold"


def make_pdf(slug: str, config: dict, regular_font: str, bold_font: str) -> Path:
    source = SOURCE_DIR / f"{slug}.txt"
    lines = body_lines(source)
    sentences = build_sentences(lines, config)
    output = OUTPUT_DIR / f"{slug}.pdf"

    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=24 * mm,
        leftMargin=24 * mm,
        topMargin=22 * mm,
        bottomMargin=22 * mm,
        title=config["title"],
        author="Allen Gillon",
        subject="Chinese Chimes transcript prepared for narration",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TranscriptTitle",
        parent=styles["Title"],
        fontName=bold_font,
        fontSize=22,
        leading=27,
        textColor=HexColor("#284C8F"),
        alignment=TA_LEFT,
        spaceAfter=12 * mm,
    )
    sentence_style = ParagraphStyle(
        "TranscriptSentence",
        parent=styles["BodyText"],
        fontName=regular_font,
        fontSize=12.2,
        leading=18.5,
        textColor=HexColor("#24212A"),
        spaceAfter=2.2 * mm,
        allowWidows=0,
        allowOrphans=0,
    )

    story = [Paragraph(html.escape(config["title"]), title_style)]
    for sentence, paragraph_end in sentences:
        story.append(Paragraph(html.escape(sentence), sentence_style))
        if paragraph_end:
            story.append(Spacer(1, 4.5 * mm))
    doc.build(story)

    with pdfplumber.open(output) as pdf:
        extracted = " ".join((page.extract_text() or "") for page in pdf.pages)
    pdf_tokens = word_tokens(extracted)
    source_tokens = word_tokens(" ".join(lines))
    if pdf_tokens[-len(source_tokens):] != source_tokens:
        raise ValueError(f"PDF text verification failed for {output.name}")
    return output


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    regular_font, bold_font = register_fonts()
    for slug, config in STORIES.items():
        output = make_pdf(slug, config, regular_font, bold_font)
        print(output)


if __name__ == "__main__":
    main()
