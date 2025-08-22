from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from flask import Flask, jsonify, redirect, render_template, request, url_for, flash


BASE_DIR = Path("/workspace").resolve()
DATA_DIR = BASE_DIR / "data"
APPOINTMENTS_PATH = DATA_DIR / "appointments.json"

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")


def ensure_data_file_exists() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not APPOINTMENTS_PATH.exists():
        APPOINTMENTS_PATH.write_text("[]", encoding="utf-8")


def load_appointments() -> List[Dict[str, Any]]:
    ensure_data_file_exists()
    with APPOINTMENTS_PATH.open("r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_appointments(appointments: List[Dict[str, Any]]) -> None:
    ensure_data_file_exists()
    with APPOINTMENTS_PATH.open("w", encoding="utf-8") as f:
        json.dump(appointments, f, indent=2, ensure_ascii=False)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/book", methods=["GET", "POST"]) 
def book():
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip()
        phone = request.form.get("phone", "").strip()
        date = request.form.get("date", "").strip()
        time = request.form.get("time", "").strip()
        notes = request.form.get("notes", "").strip()

        errors: List[str] = []
        if not full_name:
            errors.append("Full name is required.")
        if not email:
            errors.append("Email is required.")
        if not phone:
            errors.append("Phone is required.")
        if not date:
            errors.append("Date is required.")
        if not time:
            errors.append("Time is required.")

        # Basic date/time validation
        try:
            _ = datetime.fromisoformat(f"{date} {time}")
        except ValueError:
            errors.append("Please provide a valid date and time.")

        if errors:
            for msg in errors:
                flash(msg, "error")
            return render_template("book.html", form=request.form)

        appointment_id = f"apt_{int(datetime.now().timestamp()*1000)}"
        new_appointment = {
            "id": appointment_id,
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "date": date,
            "time": time,
            "notes": notes,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }

        appointments = load_appointments()
        appointments.append(new_appointment)
        save_appointments(appointments)

        flash("Appointment booked successfully!", "success")
        return redirect(url_for("success", appointment_id=appointment_id))

    return render_template("book.html", form={})


@app.route("/success")
def success():
    appointment_id = request.args.get("appointment_id")
    appointment: Dict[str, Any] | None = None
    if appointment_id:
        for a in load_appointments():
            if a.get("id") == appointment_id:
                appointment = a
                break
    return render_template("success.html", appointment=appointment)


@app.route("/learn")
def learn():
    return render_template("learn.html")


@app.route("/api/appointments")
def api_appointments():
    return jsonify(load_appointments())


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)