from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os
from datetime import datetime

CARD_WIDTH = 8.56 * cm
CARD_HEIGHT = 5.4 * cm

def generate_id_card(student, output_path):
    try:
        page_width = CARD_WIDTH * 2 + 1 * cm
        page_height = CARD_HEIGHT * 2 + 1 * cm

        c = canvas.Canvas(output_path, pagesize=(page_width, page_height))

        # FRONT
        x, y = 0.5 * cm, 0.5 * cm
        c.setFillColor(colors.HexColor('#003366'))
        c.rect(x, y, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=1)

        c.setLineWidth(2)
        c.setStrokeColor(colors.white)
        c.rect(x + 0.1*cm, y + 0.1*cm,
               CARD_WIDTH - 0.2*cm, CARD_HEIGHT - 0.2*cm)

        photo_x = x + 0.2 * cm
        photo_y = y + 0.2 * cm
        photo_width = 2.5 * cm
        photo_height = 3.2 * cm

        c.setFillColor(colors.lightgrey)
        c.rect(photo_x, photo_y, photo_width, photo_height, fill=1)

        info_x = photo_x + photo_width + 0.2 * cm
        info_y = y + CARD_HEIGHT - 0.3 * cm

        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(colors.white)
        c.drawString(info_x, info_y, "YIBS")

        c.setFont("Helvetica-Bold", 6)
        c.drawString(info_x, info_y - 0.8*cm,
                     f"ID: {student['student_id']}")
        c.drawString(info_x, info_y - 1.0*cm,
                     f"Name: {student['first_name']} {student['last_name']}")
        c.drawString(info_x, info_y - 1.2*cm,
                     f"Dept: {student['department'][:15]}")
        c.drawString(info_x, info_y - 1.4*cm,
                     f"Spec: {student['speciality'][:15]}")

        issued_date = datetime.now().strftime("%Y-%m-%d")
        c.setFont("Helvetica", 5)
        c.drawString(info_x, info_y - 1.7*cm, f"Issued: {issued_date}")

        # BACK
        bx = 0.5*cm + CARD_WIDTH + 0.5*cm
        by = 0.5 * cm

        c.setFillColor(colors.HexColor('#1e3a8a'))
        c.rect(bx, by, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=1)

        c.setLineWidth(2)
        c.setStrokeColor(colors.white)
        c.rect(bx + 0.1*cm, by + 0.1*cm,
               CARD_WIDTH - 0.2*cm, CARD_HEIGHT - 0.2*cm)

        center_x = bx + CARD_WIDTH / 2
        center_y = by + CARD_HEIGHT / 2

        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.white)
        c.drawString(center_x, center_y - 0.5*cm, "YIBS")

        c.setFont("Helvetica", 6)
        c.drawString(center_x, center_y, "Yaoundé International")
        c.drawString(center_x, center_y - 0.3*cm, "Business School")

        c.setFont("Helvetica", 4)
        c.drawString(center_x, by + 0.2*cm, "www.yibs.edu | Valid ID")

        c.save()
        return output_path

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return None