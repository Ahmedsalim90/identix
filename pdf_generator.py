from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os
import urllib.request
import tempfile
from datetime import datetime

CARD_WIDTH  = 8.56 * cm
CARD_HEIGHT = 5.4  * cm


def _safe(value, maxlen=None):
    """Return a safe string — never crashes on None."""
    s = str(value) if value else ""
    if maxlen and len(s) > maxlen:
        s = s[:maxlen]
    return s


def _download_photo(url):
    """Download a photo URL to a temp file and return the path, or None."""
    if not url:
        return None
    try:
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        suffix = ".jpg" if "jpg" in url.lower() else ".png"
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        opener = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=ssl_context)
        )
        with opener.open(url) as response:
            tmp.write(response.read())
        tmp.close()
        return tmp.name
    except Exception as e:
        print(f"Could not download photo: {e}")
        return None


def generate_id_card(student, output_path):
    try:
        page_width  = CARD_WIDTH  * 2 + 1 * cm
        page_height = CARD_HEIGHT * 2 + 1 * cm

        c = canvas.Canvas(output_path, pagesize=(page_width, page_height))

        # ── FRONT ──────────────────────────────────────────────────────────────
        x, y = 0.5 * cm, 0.5 * cm

        c.setFillColor(colors.HexColor('#003366'))
        c.rect(x, y, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=0)

        c.setLineWidth(2)
        c.setStrokeColor(colors.white)
        c.rect(x + 0.1*cm, y + 0.1*cm,
               CARD_WIDTH - 0.2*cm, CARD_HEIGHT - 0.2*cm, fill=0)

        # Photo area
        photo_x      = x + 0.25 * cm
        photo_y      = y + 0.25 * cm
        photo_width  = 2.5 * cm
        photo_height = 3.2 * cm

        photo_path = _download_photo(student.get("photo_url"))
        if photo_path and os.path.exists(photo_path):
            try:
                c.drawImage(photo_path, photo_x, photo_y,
                            width=photo_width, height=photo_height,
                            preserveAspectRatio=True, mask='auto')
            except Exception:
                # If image draw fails, fall back to placeholder
                c.setFillColor(colors.lightgrey)
                c.rect(photo_x, photo_y, photo_width, photo_height, fill=1, stroke=0)
            finally:
                try:
                    os.unlink(photo_path)
                except Exception:
                    pass
        else:
            c.setFillColor(colors.lightgrey)
            c.rect(photo_x, photo_y, photo_width, photo_height, fill=1, stroke=0)

        # Text info
        info_x = photo_x + photo_width + 0.25 * cm
        info_y = y + CARD_HEIGHT - 0.35 * cm

        student_id  = _safe(student.get("student_id"))
        first_name  = _safe(student.get("first_name"))
        last_name   = _safe(student.get("last_name"))
        department  = _safe(student.get("department"), 16)
        speciality  = _safe(student.get("speciality"), 16)
        issued_date = datetime.now().strftime("%Y-%m-%d")

        c.setFillColor(colors.gold)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(info_x, info_y, "YIBS")

        c.setFillColor(colors.white)
        c.setFont("Helvetica", 5.5)
        c.drawString(info_x, info_y - 0.45*cm, "Yaoundé Int'l Business School")

        c.setFont("Helvetica-Bold", 6)
        c.drawString(info_x, info_y - 0.95*cm,  f"ID: {student_id}")
        c.drawString(info_x, info_y - 1.20*cm,  f"Name: {first_name} {last_name}")
        c.drawString(info_x, info_y - 1.45*cm,  f"Dept: {department}")
        c.drawString(info_x, info_y - 1.70*cm,  f"Spec: {speciality}")

        c.setFont("Helvetica", 5)
        c.drawString(info_x, info_y - 2.00*cm, f"Issued: {issued_date}")

        # ── BACK ───────────────────────────────────────────────────────────────
        bx = 0.5*cm + CARD_WIDTH + 0.5*cm
        by = 0.5 * cm

        c.setFillColor(colors.HexColor('#1e3a8a'))
        c.rect(bx, by, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=0)

        c.setLineWidth(2)
        c.setStrokeColor(colors.white)
        c.rect(bx + 0.1*cm, by + 0.1*cm,
               CARD_WIDTH - 0.2*cm, CARD_HEIGHT - 0.2*cm, fill=0)

        center_x = bx + CARD_WIDTH  / 2
        center_y = by + CARD_HEIGHT / 2

        c.setFillColor(colors.gold)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(center_x, center_y + 0.5*cm, "YIBS")

        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(center_x, center_y + 0.1*cm,  "Yaoundé International")
        c.drawCentredString(center_x, center_y - 0.25*cm, "Business School")

        c.setFont("Helvetica", 5)
        c.drawCentredString(center_x, by + 0.3*cm,
                            "www.yibs.edu  |  Valid Student ID")

        c.save()
        return output_path

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return None
