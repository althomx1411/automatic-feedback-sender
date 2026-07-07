import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_mail import Mail

load_dotenv()


app = Flask(__name__)


CORS(app)


app.config.update(
    MAIL_USERNAME=os.getenv("SMTP_USER"),
    MAIL_PASSWORD=os.getenv("SMTP_PASS"),
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USE_SSL=False,
    MAIL_SERVER="smtp.gmail.com",
)


mail = Mail(app)


@app.route("/send_email")
def send_email():
    return "<p> Hello World!</p>"
