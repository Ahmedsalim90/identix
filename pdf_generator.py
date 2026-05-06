"""
IDentix PDF ID Card Generator
Matches the YIBS IDentix card design — Front + Back on one page (credit-card proportions).
Requires: reportlab, Pillow, qrcode
Install:  pip install reportlab Pillow qrcode
"""

import io
import os
import json
import hashlib
from datetime import datetime, timedelta

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import (
    HexColor, white, black
)
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


# ── Brand colours (from the HTML design) ─────────────────────────────────────
DEEP_NAVY   = HexColor("#26215C")
MID_PURPLE  = HexColor("#3C3489")
VIOLET      = HexColor("#534AB7")
LIGHT_VIOLET= HexColor("#7F77DD")
PALE_VIOLET = HexColor("#AFA9EC")
GHOST       = HexColor("#EEEDFE")
STRIPE_MID  = HexColor("#CCC9F8")
WHITE       = white
BLACK       = black

# ── Card dimensions (CR80 credit-card ratio, scaled up for PDF clarity) ──────
CARD_W = 85.6 * mm
CARD_H = 53.98 * mm
MARGIN = 10 * mm
RADIUS = 3 * mm   # rounded corners

# ── School logo path — place school_logo.png next to this file ────────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(_HERE, "school_logo.png")


# ─────────────────────────────────────────────────────────────────────────────
#  QR-code generator (pure Python — no external qrcode library needed)
# ─────────────────────────────────────────────────────────────────────────────

def _make_qr_image(data: str, size_px: int = 200) -> io.BytesIO:
    """
    Generate a QR code PNG in-memory using the `qrcode` library if available,
    falling back to a simple placeholder square if not installed.
    """
    try:
        import qrcode
        from qrcode.image.pil import PilImage
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#26215C", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf
    except ImportError:
        # Fallback: draw a simple placeholder using Pillow only
        try:
            from PIL import Image, ImageDraw, ImageFont
            img = Image.new("RGB", (size_px, size_px), "white")
            draw = ImageDraw.Draw(img)
            # outer border
            draw.rectangle([4, 4, size_px-4, size_px-4], outline="#26215C", width=4)
            # finder patterns (top-left, top-right, bottom-left)
            for fx, fy in [(10, 10), (size_px-50, 10), (10, size_px-50)]:
                draw.rectangle([fx, fy, fx+40, fy+40], outline="#26215C", width=4)
                draw.rectangle([fx+8, fy+8, fx+32, fy+32], fill="#26215C")
            # data dots
            step = 8
            for r in range(6, size_px // step - 2):
                for col in range(6, size_px // step - 2):
                    h = hashlib.md5(f"{data}{r}{col}".encode()).hexdigest()
                    if int(h[0], 16) > 7:
                        x, y = col * step, r * step
                        if not (x < 50 and y < 50) and not (x > size_px-55 and y < 50) \
                                and not (x < 50 and y > size_px-55):
                            draw.rectangle([x, y, x+6, y+6], fill="#26215C")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            buf.seek(0)
            return buf
        except Exception:
            return None


# ─────────────────────────────────────────────────────────────────────────────
#  Low-level drawing helpers
# ─────────────────────────────────────────────────────────────────────────────

def _rounded_rect(c: canvas.Canvas, x, y, w, h, r, fill_color, stroke_color=None):
    c.saveState()
    c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(0.5)
    else:
        c.setLineWidth(0)
    p = c.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.arcTo(x + w - 2*r, y, x + w, y + 2*r, -90, 90)
    p.lineTo(x + w, y + h - r)
    p.arcTo(x + w - 2*r, y + h - 2*r, x + w, y + h, 0, 90)
    p.lineTo(x + r, y + h)
    p.arcTo(x, y + h - 2*r, x + 2*r, y + h, 90, 90)
    p.lineTo(x, y + r)
    p.arcTo(x, y, x + 2*r, y + 2*r, 180, 90)
    p.close()
    if stroke_color:
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.drawPath(p, fill=1, stroke=0)
    c.restoreState()


def _gradient_rect(c: canvas.Canvas, x, y, w, h, col1, col2, vertical=False):
    """Simulate gradient with many thin strips."""
    steps = 40
    for i in range(steps):
        t = i / steps
        r = col1.red   + (col2.red   - col1.red)   * t
        g = col1.green + (col2.green - col1.green) * t
        b = col1.blue  + (col2.blue  - col1.blue)  * t
        c.setFillColor(HexColor((int(r*255) << 16) | (int(g*255) << 8) | int(b*255)))
        if vertical:
            sw = w / steps
            c.rect(x + i*sw, y, sw + 0.5, h, fill=1, stroke=0)
        else:
            sh = h / steps
            c.rect(x, y + i*sh, w, sh + 0.5, fill=1, stroke=0)


def _label_value(c, lx, ly, label, value, lbl_size=5.5, val_size=7.5,
                 lbl_color=LIGHT_VIOLET, val_color=DEEP_NAVY, val_font="Helvetica-Bold"):
    c.setFont("Helvetica-Bold", lbl_size)
    c.setFillColor(lbl_color)
    c.drawString(lx, ly + val_size + 1, label.upper())
    c.setFont(val_font, val_size)
    c.setFillColor(val_color)
    c.drawString(lx, ly, str(value or "—"))


# ─────────────────────────────────────────────────────────────────────────────
#  FRONT of card
# ─────────────────────────────────────────────────────────────────────────────

def _draw_front(c: canvas.Canvas, ox, oy, student: dict, card: dict):
    W, H = CARD_W, CARD_H

    # Card background
    _rounded_rect(c, ox, oy, W, H, RADIUS, WHITE,
                  stroke_color=HexColor("#C8C4EE"))

    # ── Header gradient ───────────────────────────────────────────────────────
    hdr_h = H * 0.30
    # clip to rounded top
    c.saveState()
    p = c.beginPath()
    p.moveTo(ox + RADIUS, oy + H)
    p.lineTo(ox + W - RADIUS, oy + H)
    p.arcTo(ox + W - 2*RADIUS, oy + H - 2*RADIUS, ox + W, oy + H, 0, 90)
    p.lineTo(ox + W, oy + H - hdr_h)
    p.lineTo(ox, oy + H - hdr_h)
    p.lineTo(ox, oy + H - RADIUS)
    p.arcTo(ox, oy + H - 2*RADIUS, ox + 2*RADIUS, oy + H, 90, 90)
    p.close()
    c.clipPath(p, stroke=0)
    _gradient_rect(c, ox, oy + H - hdr_h, W, hdr_h, DEEP_NAVY, PALE_VIOLET, vertical=True)
    c.restoreState()

    # School logo (top-left)
    logo_h = hdr_h * 0.80
    logo_w = logo_h * (223 / 257)   # preserve aspect ratio from 223x257 px
    logo_y = oy + H - hdr_h + (hdr_h - logo_h) / 2
    if os.path.exists(LOGO_PATH):
        c.drawImage(ImageReader(LOGO_PATH), ox + 2*mm, logo_y,
                    logo_w, logo_h, preserveAspectRatio=True, mask="auto")
    else:
        # fallback text if logo file missing
        school = student.get("school", "Yaounde International Business School")
        c.setFont("Helvetica-Bold", 5.5)
        c.setFillColor(WHITE)
        c.drawString(ox + 3*mm, oy + H - 7*mm, school.upper())

    # IDentix brand (top-right)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(WHITE)
    c.drawRightString(ox + W - 3*mm, oy + H - 7*mm, "IDentix")
    # iD box
    _rounded_rect(c, ox + W - 14*mm, oy + H - 12.5*mm, 9*mm, 7*mm, 1*mm,
                  HexColor("#FFFFFF30"))
    c.setFont("Helvetica-Bold", 6)
    c.setFillColor(WHITE)
    c.drawCentredString(ox + W - 9.5*mm, oy + H - 10*mm, "iD")

    # ── Accent stripe ─────────────────────────────────────────────────────────
    sy = oy + H - hdr_h - 1.5*mm
    _gradient_rect(c, ox, sy, W, 1.5*mm, DEEP_NAVY, PALE_VIOLET, vertical=True)

    # ── Photo ─────────────────────────────────────────────────────────────────
    ph_x = ox + 3*mm
    ph_y = oy + H - hdr_h - 1.5*mm - 25*mm - 2*mm
    ph_w = 18*mm
    ph_h = 24*mm

    _rounded_rect(c, ph_x - 0.5*mm, ph_y - 0.5*mm,
                  ph_w + 1*mm, ph_h + 1*mm, 2*mm, LIGHT_VIOLET)
    _rounded_rect(c, ph_x, ph_y, ph_w, ph_h, 2*mm, GHOST)

    photo_url = student.get("photo_url", "")
    photo_drawn = False
    if photo_url and photo_url.startswith("http"):
        try:
            import urllib.request
            req = urllib.request.Request(photo_url,
                  headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                img_data = io.BytesIO(resp.read())
            c.saveState()
            p2 = c.beginPath()
            p2.roundRect(ph_x, ph_y, ph_w, ph_h, 2*mm)
            c.clipPath(p2, stroke=0)
            c.drawImage(ImageReader(img_data), ph_x, ph_y, ph_w, ph_h,
                        preserveAspectRatio=True, anchor="c", mask="auto")
            c.restoreState()
            photo_drawn = True
        except Exception:
            pass

    if not photo_drawn:
        # placeholder icon
        cx2 = ph_x + ph_w / 2
        c.setFillColor(LIGHT_VIOLET)
        c.circle(cx2, ph_y + ph_h * 0.65, 4*mm, fill=1, stroke=0)
        c.setFillColor(LIGHT_VIOLET)
        c.ellipse(cx2 - 5*mm, ph_y + 1*mm, cx2 + 5*mm, ph_y + ph_h * 0.52,
                  fill=1, stroke=0)
        c.setFont("Helvetica", 4)
        c.setFillColor(HexColor("#8885c2"))
        c.drawCentredString(cx2, ph_y + ph_h * 0.08, "PHOTO")

    # Student badge
    badge_y = ph_y - 4*mm
    _rounded_rect(c, ph_x, badge_y, ph_w, 3.5*mm, 1.5*mm, MID_PURPLE)
    c.setFont("Helvetica-Bold", 4.5)
    c.setFillColor(WHITE)
    c.drawCentredString(ph_x + ph_w/2, badge_y + 1*mm, "STUDENT")

    # ── Student info ──────────────────────────────────────────────────────────
    ix = ph_x + ph_w + 3*mm
    iy_top = oy + H - hdr_h - 1.5*mm - 5*mm

    # Full name
    first = student.get("first_name", "")
    last  = student.get("last_name",  "")
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(DEEP_NAVY)
    c.drawString(ix, iy_top - 5*mm, last.upper())
    c.setFont("Helvetica", 9)
    c.drawString(ix, iy_top - 9*mm, first)

    # Info grid
    col1_x = ix
    col2_x = ix + (W - ix - ox) / 2 + ox - ox  # midpoint of remaining width
    row1_y = iy_top - 16*mm
    row2_y = row1_y - 9*mm
    row3_y = row2_y - 9*mm

    _label_value(c, col1_x, row1_y, "Student ID",
                 student.get("student_id", ""), val_color=VIOLET, val_font="Helvetica-Bold")
    _label_value(c, col2_x, row1_y, "Academic Year",
                 f"{datetime.now().year} – {datetime.now().year + 1}")
    _label_value(c, col1_x, row2_y, "Specialty",
                 student.get("speciality", student.get("department", "")))
    _label_value(c, col2_x, row2_y, "Level",
                 student.get("level", ""))

    # Campus full width
    avail_w = W - (ix - ox) - 3*mm
    c.setFont("Helvetica-Bold", 5.5)
    c.setFillColor(LIGHT_VIOLET)
    c.drawString(col1_x, row3_y + 8, "CAMPUS")
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(DEEP_NAVY)
    campus_str = student.get("campus", "Main Campus")
    c.drawString(col1_x, row3_y, campus_str)

    # ── Footer ────────────────────────────────────────────────────────────────
    ftr_h = 9*mm
    ftr_y = oy
    c.saveState()
    p3 = c.beginPath()
    p3.moveTo(ox, ftr_y + ftr_h)
    p3.lineTo(ox + W, ftr_y + ftr_h)
    p3.lineTo(ox + W, ftr_y + RADIUS)
    p3.arcTo(ox + W - 2*RADIUS, ftr_y, ox + W, ftr_y + 2*RADIUS, -90, -90)
    p3.lineTo(ox + RADIUS, ftr_y)
    p3.arcTo(ox, ftr_y, ox + 2*RADIUS, ftr_y + 2*RADIUS, 180, 90)  # fixed
    p3.close()
    c.clipPath(p3, stroke=0)
    c.setFillColor(GHOST)
    c.rect(ox, ftr_y, W, ftr_h, fill=1, stroke=0)
    # top border line
    c.setStrokeColor(STRIPE_MID)
    c.setLineWidth(0.5)
    c.line(ox, ftr_y + ftr_h, ox + W, ftr_y + ftr_h)
    c.restoreState()

    # Barcode (decorative)
    bx = ox + 3*mm
    by = ftr_y + 1.5*mm
    bar_heights = [6, 4, 5, 6, 3, 6, 5, 4, 6, 5, 6, 4, 6, 5, 4, 6, 3, 5, 6, 4]
    for i, bh in enumerate(bar_heights):
        c.setFillColor(DEEP_NAVY)
        c.rect(bx + i * 1.8, by + (6 - bh), 1.2, bh, fill=1, stroke=0)
    sid = student.get("student_id", "000000")
    c.setFont("Courier", 4.5)
    c.setFillColor(VIOLET)
    c.drawString(bx, by - 2, sid[:16])

    # Validity
    expire = card.get("expire_date", "")
    c.setFont("Helvetica-Bold", 5)
    c.setFillColor(VIOLET)
    c.drawRightString(ox + W - 3*mm, ftr_y + 5*mm, "VALID UNTIL")
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(DEEP_NAVY)
    try:
        exp_dt = datetime.strptime(expire, "%Y-%m-%d")
        exp_str = exp_dt.strftime("%d / %m / %Y")
    except Exception:
        exp_str = expire
    c.drawRightString(ox + W - 3*mm, ftr_y + 1.5*mm, exp_str)


# ─────────────────────────────────────────────────────────────────────────────
#  BACK of card
# ─────────────────────────────────────────────────────────────────────────────

def _draw_back(c: canvas.Canvas, ox, oy, student: dict, card: dict):
    W, H = CARD_W, CARD_H

    # Card background (dark gradient)
    c.saveState()
    p = c.beginPath()
    p.roundRect(ox, oy, W, H, RADIUS)
    c.clipPath(p, stroke=0)
    _gradient_rect(c, ox, oy, W, H, DEEP_NAVY, VIOLET)
    c.restoreState()
    # border
    c.saveState()
    c.setStrokeColor(HexColor("#534AB760"))
    c.setLineWidth(1)
    c.roundRect(ox, oy, W, H, RADIUS, fill=0, stroke=1)
    c.restoreState()

    # ── Header ────────────────────────────────────────────────────────────────
    hdr_h = H * 0.25
    # School logo (top-left of back)
    logo_h = hdr_h * 0.82
    logo_w = logo_h * (223 / 257)
    logo_x = ox + 2*mm
    logo_y2 = oy + H - hdr_h + (hdr_h - logo_h) / 2
    if os.path.exists(LOGO_PATH):
        c.drawImage(ImageReader(LOGO_PATH), logo_x, logo_y2,
                    logo_w, logo_h, preserveAspectRatio=True, mask="auto")
    else:
        c.setStrokeColor(HexColor("#FFFFFF80"))
        c.setLineWidth(0.8)
        c.circle(ox + 4*mm + 7*mm, oy + H - hdr_h / 2, 7*mm, fill=0, stroke=1)
        c.setFont("Helvetica-Bold", 6)
        c.setFillColor(HexColor("#FFFFFFCC"))
        c.drawCentredString(ox + 11*mm, oy + H - hdr_h/2, "YIBS")

    # Brand right
    c.setFont("Helvetica", 5.5)
    c.setFillColor(HexColor("#AFA9EC"))
    c.drawRightString(ox + W - 3*mm, oy + H - hdr_h/2 + 2*mm, "Management System")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(WHITE)
    c.drawRightString(ox + W - 3*mm, oy + H - hdr_h/2 - 3*mm, "IDentix")

    # ── Accent stripe ─────────────────────────────────────────────────────────
    sy = oy + H - hdr_h - 1*mm
    _gradient_rect(c, ox, sy, W, 1*mm, DEEP_NAVY, PALE_VIOLET, vertical=True)

    # ── Mag stripe ────────────────────────────────────────────────────────────
    mag_y = sy - 7*mm
    c.setFillColor(HexColor("#00000066"))
    c.rect(ox, mag_y, W, 7*mm, fill=1, stroke=0)

    # ── Body: QR + info ───────────────────────────────────────────────────────
    body_y = oy + 10*mm
    body_top = mag_y

    # QR code
    qr_size = 17*mm
    qr_x = ox + 3*mm
    qr_y = body_top - qr_size - 2*mm

    qr_data = json.dumps({
        "student_id": student.get("student_id"),
        "name": f"{student.get('first_name','')} {student.get('last_name','')}",
        "department": student.get("department", ""),
        "speciality": student.get("speciality", ""),
        "level": student.get("level", ""),
        "campus": student.get("campus", ""),
        "issued": card.get("issued_date", ""),
        "expires": card.get("expire_date", ""),
    }, ensure_ascii=False)

    qr_buf = _make_qr_image(qr_data)
    if qr_buf:
        # white background for QR
        _rounded_rect(c, qr_x - 0.5*mm, qr_y - 0.5*mm,
                      qr_size + 1*mm, qr_size + 1*mm, 1*mm, WHITE)
        c.drawImage(ImageReader(qr_buf), qr_x, qr_y, qr_size, qr_size,
                    preserveAspectRatio=True, mask="auto")
    else:
        _rounded_rect(c, qr_x, qr_y, qr_size, qr_size, 1*mm, WHITE)
        c.setFont("Helvetica", 4)
        c.setFillColor(DEEP_NAVY)
        c.drawCentredString(qr_x + qr_size/2, qr_y + qr_size/2, "QR")

    c.setFont("Helvetica", 4)
    c.setFillColor(HexColor("#AFA9EC"))
    c.drawCentredString(qr_x + qr_size/2, qr_y - 2.5*mm, "Scan to Verify")

    # Info rows (right of QR)
    info_x = qr_x + qr_size + 3*mm
    info_w = W - (info_x - ox) - 3*mm
    row_h  = 6*mm

    rows = [
        ("Emergency Contact", student.get("emergency_phone") or student.get("contact", "")),
        ("Nationality",       student.get("nationality", "")),
        ("Date of Birth",     student.get("date_of_birth", "")),
        ("Gender",            student.get("gender", "")),
    ]

    ry = body_top - row_h - 1*mm
    for label, value in rows:
        c.setFont("Helvetica-Bold", 4.5)
        c.setFillColor(HexColor("#AFA9ECD9"))
        c.drawString(info_x, ry + row_h * 0.55, label.upper())
        c.setFont("Helvetica", 6.5)
        c.setFillColor(WHITE)
        c.drawString(info_x, ry + row_h * 0.1, str(value or "—"))
        # divider
        c.setStrokeColor(HexColor("#FFFFFF1F"))
        c.setLineWidth(0.4)
        c.line(info_x, ry, info_x + info_w, ry)
        ry -= row_h

    # ── Footer ────────────────────────────────────────────────────────────────
    c.setFont("Helvetica-Bold", 4.5)
    c.setFillColor(HexColor("#FFFFFFBF"))
    school = student.get("school", "Yaounde International Business School")
    c.drawString(ox + 3*mm, oy + 5.5*mm, school)
    c.setFont("Helvetica", 4)
    c.setFillColor(HexColor("#FFFFFF7F"))
    c.drawString(ox + 3*mm, oy + 3*mm,
                 "www.yibs.cm  ·  registrar@yibs.cm")
    c.drawString(ox + 3*mm, oy + 1*mm,
                 "If found, please return to the nearest campus office.")

    # Signature
    c.setStrokeColor(HexColor("#FFFFFF59"))
    c.setLineWidth(0.5)
    c.line(ox + W - 25*mm, oy + 5*mm, ox + W - 3*mm, oy + 5*mm)
    c.setFont("Helvetica", 4)
    c.setFillColor(HexColor("#FFFFFF73"))
    c.drawCentredString(ox + W - 14*mm, oy + 2.5*mm, "REGISTRAR")


# ─────────────────────────────────────────────────────────────────────────────
#  Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def generate_id_card(student_data: dict, output_path: str) -> str:
    """
    Generate a PDF ID card (front + back) for the given student.

    Parameters
    ----------
    student_data : dict
        Keys: student_id, first_name, last_name, department, speciality,
              photo_url, level, campus, gender, school, nationality,
              date_of_birth, contact, emergency_phone, email
    output_path : str
        Absolute path where the PDF will be saved.

    Returns
    -------
    str  — output_path on success, None on failure.
    """
    try:
        # Build card meta (issued / expire can be passed in or defaulted)
        issued  = student_data.get("issued_date",
                                   datetime.now().strftime("%Y-%m-%d"))
        expire  = student_data.get("expire_date",
                                   (datetime.now() + timedelta(days=365*4))
                                   .strftime("%Y-%m-%d"))
        card = {"issued_date": issued, "expire_date": expire}

        # Page large enough for both cards side-by-side with margins
        page_w = CARD_W * 2 + MARGIN * 3
        page_h = CARD_H + MARGIN * 2

        c = canvas.Canvas(output_path, pagesize=(page_w, page_h))
        c.setTitle(f"IDentix — {student_data.get('first_name','')} "
                   f"{student_data.get('last_name','')}")

        # Front card (left)
        _draw_front(c, MARGIN, MARGIN, student_data, card)

        # Back card (right)
        _draw_back(c, MARGIN * 2 + CARD_W, MARGIN, student_data, card)

        c.save()
        return output_path

    except Exception as e:
        print(f"[pdf_generator] Error: {e}")
        import traceback; traceback.print_exc()
        return None


