import os
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import duckdb

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

DATABASE_PATH = "feedback.db"

app.config.update(
    MAIL_USERNAME=os.getenv("SMTP_USER"),
    MAIL_PASSWORD=os.getenv("SMTP_PASS"),
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USE_SSL=False,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_DEFAULT_SENDER=os.getenv("SMTP_USER"),
)

mail = Mail(app)


def get_db():
    if 'db' not in g:
        g.db = duckdb.connect(DATABASE_PATH)
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()


with duckdb.connect(DATABASE_PATH) as init_db:
    init_db.execute("CREATE SEQUENCE IF NOT EXISTS feedback_id_seq START 1;")
    init_db.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY DEFAULT nextval('feedback_id_seq'),
            email VARCHAR,
            service VARCHAR,
            rating INTEGER,
            message TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


@app.route("/")
def main():
    return "Hi, this is the main page"


@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Payload JSON invalid sau lipsă."}), 400

    email = data.get("email")
    service = data.get("service")
    rating = data.get("rating")
    message = data.get("message")

    if not email or not service or rating is None or not message:
        return jsonify({"error": "Toate câmpurile sunt obligatorii."}), 400
    if not (1 <= int(rating) <= 10):
        return jsonify({"error": "Nota trebuie să fie între 1 și 10."}), 400
    if len(message) > 5000:
        return jsonify({"error": "Mesajul nu poate depăși 5000 de caractere."}), 400

    try:
        db = get_db()
        result = db.execute(
            """
            INSERT INTO feedback (email, service, rating, message)
            VALUES (?, ?, ?, ?)
            RETURNING id
            """,
            [email, service, int(rating), message]
        ).fetchone()

        last_id = result[0] if result else None

        return jsonify({
            "success": True,
            "id": last_id,
            "message": "Feedback trimis cu succes!"
        }), 201

    except Exception as e:
        print(f"DuckDB error: {e}")
        return jsonify({"error": "Eroare internă la salvarea feedback-ului."}), 500


@app.route("/api/get_feedback", methods=["GET"])
def get_all_feedback():
    try:
        db = get_db()

        results = db.execute(
            """
            SELECT id, email, service, rating, message, submitted_at
            FROM feedback
            ORDER BY submitted_at DESC
            """
        ).fetchall()

        feedback_list = []
        for row in results:
            feedback_list.append({
                "id": row[0],
                "email": row[1],
                "service": row[2],
                "rating": row[3],
                "message": row[4],
                "submitted_at": row[5].strftime("%Y-%m-%d %H:%M:%S") if row[5] else None
            })

        return jsonify(feedback_list), 200

    except Exception as e:
        print(f"Error fetching feedback: {e}")
        return jsonify({"error": "Eroare internă la preluarea datelor."}), 500


@app.route("/api/send-link", methods=["POST"])
def send_link():
    data = request.get_json(silent=True) or {}

    customer_email = (data.get("customerEmail") or "").strip()
    customer_name = (data.get("customerName") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    errors = {}
    if not customer_email or "@" not in customer_email:
        errors["customerEmail"] = "A valid email address is required."
    if not subject:
        errors["subject"] = "Subject is required."
    if not message:
        errors["message"] = "Message is required."

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    if not app.config["MAIL_USERNAME"] or not app.config["MAIL_PASSWORD"]:
        return jsonify({
            "success": False,
            "error": "Server is missing SMTP credentials. Set SMTP_USER and SMTP_PASS."
        }), 500

    greeting = f"Hi {customer_name},\n\n" if customer_name else ""

    try:
        msg = Message(
            subject=subject,
            recipients=[customer_email],
            body=f"{greeting}{message}",
        )
        mail.send(msg)
    except Exception as e:
        print(f"Mail send error: {e}")
        return jsonify({"success": False, "error": "Failed to send email. Check SMTP settings."}), 500

    return jsonify({"success": True, "message": f"Email sent to {customer_email}."}), 200


if __name__ == "__main__":
    app.run(debug=True)
