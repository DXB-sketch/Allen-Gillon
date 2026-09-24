"""Build illustrated Chinese Chimes PDFs from verified YouTube frame captures."""

from pathlib import Path
from shutil import copyfile

from PIL import Image, ImageDraw, ImageFilter
from reportlab.pdfgen.canvas import Canvas


ROOT = Path(__file__).resolve().parents[1]
FRAME_ROOT = ROOT / "tmp" / "pdfs" / "chimes-frames"
SELECTED_ROOT = ROOT / "tmp" / "pdfs" / "chimes-selected"
OUTPUT_ROOT = ROOT / "output" / "pdf"
INCOMING_ROOT = ROOT / "scripts" / "incoming"

# Values are zero-based indexes into the one-frame-per-second captures. Each
# sequence was visually checked against the numbered pages shown in the video.
BOOKS = {
    "funny-fah-learns-when-to-stop": {
        "video_id": "OAu1PmILqeA",
        "title": "Funny Fah Learns When to Stop",
        "frames": [
            2, 15, 39, 69, 95, 110, 127, 140, 153, 172, 183, 198, 215,
            230, 250, 278, 302, 326, 354, 371, 379, 406, 417, 448, 458,
            484, 492, 516, 530, 544, 566, 587, 609, 636,
        ],
    },
    "imaginative-little-mee": {
        "video_id": "ZwzVEIQp3Cw",
        "title": "Imaginative Little Mee",
        "frames": [
            2, 16, 31, 48, 65, 84, 104, 123, 138, 161, 183, 199, 207,
            224, 240, 245, 252, 265, 301, 335, 361, 392, 426, 452, 473,
            488, 507, 522, 537,
        ],
    },
    "little-hi-doh": {
        "video_id": "Ynu-5Rt7Vyw",
        "title": "Hi-Doh",
        "frames": [
            4, 28, 50, 75, 97, 118, 134, 142, 156, 170, 182, 197, 212,
            228, 244, 261, 273, 286, 301, 306, 316, 332, 345, 352, 362,
        ],
    },
    "little-ray": {
        "video_id": "cEuPWVPPN0o",
        "title": "Little Ray",
        "frames": [
            5, 23, 46, 70, 90, 106, 123, 139, 154, 174, 192, 207, 219,
            236, 266, 298, 325, 348, 372,
        ],
    },
}


def crop_black_bars(image: Image.Image) -> Image.Image:
    """Remove only the pure-black pillarboxing used by the portrait videos."""
    grayscale = image.convert("L")
    width, height = grayscale.size
    columns = []
    for x in range(width):
        sample = [grayscale.getpixel((x, y)) for y in range(0, height, 12)]
        columns.append(sum(sample) / len(sample))
    active = [x for x, value in enumerate(columns) if value > 8]
    if not active or active[0] < width * 0.08 or active[-1] > width * 0.92:
        return image
    return image.crop((active[0], 0, active[-1] + 1, height))


def prepare_page(source: Path, destination: Path) -> tuple[int, int]:
    image = Image.open(source).convert("RGB")
    image = crop_black_bars(image)
    image = image.resize((image.width * 2, image.height * 2), Image.Resampling.LANCZOS)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "JPEG", quality=92, subsampling=0, optimize=True)
    return image.size


def make_contact_sheet(pages: list[Path], destination: Path) -> None:
    thumb_width = 300
    thumb_height = 190
    label_height = 24
    columns = 4
    rows = (len(pages) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * thumb_width, rows * (thumb_height + label_height)), "#ece7dc")
    draw = ImageDraw.Draw(sheet)
    for index, page in enumerate(pages):
        image = Image.open(page).convert("RGB")
        image.thumbnail((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        x = (index % columns) * thumb_width + (thumb_width - image.width) // 2
        y = (index // columns) * (thumb_height + label_height) + (thumb_height - image.height) // 2
        sheet.paste(image, (x, y))
        draw.text(((index % columns) * thumb_width + 8, y + image.height + 3), f"Page {index + 1}", fill="#24211d")
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, "JPEG", quality=88, optimize=True)


def build_pdf(slug: str, title: str, pages: list[Path]) -> Path:
    output = OUTPUT_ROOT / f"{slug}-illustrated.pdf"
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas = Canvas(str(output))
    canvas.setTitle(title)
    canvas.setAuthor("Allen Gillon")
    canvas.setSubject("Chinese Chimes illustrated story")
    for page in pages:
        with Image.open(page) as image:
            width, height = image.size
        page_width = width / 2
        page_height = height / 2
        canvas.setPageSize((page_width, page_height))
        canvas.drawImage(str(page), 0, 0, page_width, page_height, preserveAspectRatio=True, mask="auto")
        canvas.showPage()
    canvas.save()
    return output


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    INCOMING_ROOT.mkdir(parents=True, exist_ok=True)
    for slug, book in BOOKS.items():
        source_frames = sorted((FRAME_ROOT / book["video_id"] / "persec").glob("*.jpg"))
        if not source_frames:
            raise FileNotFoundError(f"No captured frames found for {book['video_id']}")
        selected_dir = SELECTED_ROOT / slug
        pages = []
        for page_number, frame_index in enumerate(book["frames"], start=1):
            destination = selected_dir / f"page-{page_number:03d}.jpg"
            prepare_page(source_frames[frame_index], destination)
            pages.append(destination)
        make_contact_sheet(pages, SELECTED_ROOT / f"{slug}-contact.jpg")
        pdf = build_pdf(slug, book["title"], pages)
        incoming = INCOMING_ROOT / f"{slug}-illustrated.pdf"
        copyfile(pdf, incoming)
        print(f"{book['title']}: {len(pages)} pages -> {pdf.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
