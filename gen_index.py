import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


WEATHER_DIR = Path("weather_data")
FORECAST_DIR = Path("NineDayForecast")
WEATHER_HISTORY_FILE = WEATHER_DIR / "history.json"
FORECAST_LATEST_FILE = FORECAST_DIR / "latest.json"
WEATHER_FILE_PATTERN = re.compile(r"weather_(\d{8})_(\d{6})\.json$")
FORECAST_FILE_PATTERN = re.compile(r"forecast_(\d{8})_(\d{6})\.json$")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weather-file", help="Path to the latest weather JSON payload")
    parser.add_argument("--weather-timestamp", help="Timestamp in YYYYMMDD_HHMMSS format")
    parser.add_argument("--forecast-file", help="Path to the latest forecast JSON payload")
    parser.add_argument("--forecast-timestamp", help="Timestamp in YYYYMMDD_HHMMSS format")
    return parser.parse_args()


def extract_timestamp(filename, pattern):
    match = pattern.match(filename)
    if not match:
        return None
    return datetime.strptime("".join(match.groups()), "%Y%m%d%H%M%S").replace(
        tzinfo=timezone.utc
    )


def to_isoformat(value):
    if isinstance(value, datetime):
        return value.isoformat().replace("+00:00", "Z")
    return value


def read_json(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, separators=(",", ":"))


def build_history_entry(filename, payload):
    timestamp = extract_timestamp(filename, WEATHER_FILE_PATTERN)
    return {
        "filename": filename,
        "timestamp": to_isoformat(timestamp) if timestamp else payload.get("updateTime"),
        "updateTime": payload.get("updateTime"),
        "temperature": payload.get("temperature"),
    }


def normalize_history_bundle(payload):
    if not isinstance(payload, dict):
        return []

    history = payload.get("history")
    if not isinstance(history, list):
        return []

    normalized = []
    seen = set()

    for entry in history:
        if not isinstance(entry, dict):
            continue

        filename = entry.get("filename")
        timestamp = entry.get("timestamp")
        if not filename or not timestamp or filename in seen:
            continue

        normalized.append(
            {
                "filename": filename,
                "timestamp": timestamp,
                "updateTime": entry.get("updateTime"),
                "temperature": entry.get("temperature"),
            }
        )
        seen.add(filename)

    return normalized


def load_legacy_weather_history():
    entries = []
    for path in WEATHER_DIR.glob("weather_*.json"):
        if not WEATHER_FILE_PATTERN.match(path.name):
            continue
        try:
            payload = read_json(path)
        except (OSError, json.JSONDecodeError):
            continue
        entries.append(build_history_entry(path.name, payload))
    return entries


def load_weather_history():
    if WEATHER_HISTORY_FILE.exists():
        try:
            history = normalize_history_bundle(read_json(WEATHER_HISTORY_FILE))
            if history:
                return history
        except (OSError, json.JSONDecodeError):
            pass
    return load_legacy_weather_history()


def build_latest_weather_entry(filename, payload):
    timestamp = extract_timestamp(filename, WEATHER_FILE_PATTERN)
    return {
        "filename": filename,
        "timestamp": to_isoformat(timestamp) if timestamp else payload.get("updateTime"),
        "data": payload,
    }


def update_weather_history(weather_file=None, weather_timestamp=None):
    history_entries = load_weather_history()

    latest_weather = None
    if weather_file and weather_timestamp:
        filename = f"weather_{weather_timestamp}.json"
        payload = read_json(weather_file)
        latest_weather = build_latest_weather_entry(filename, payload)
        history_entry = build_history_entry(filename, payload)
        history_by_filename = {entry["filename"]: entry for entry in history_entries}
        history_by_filename[filename] = history_entry
        history_entries = list(history_by_filename.values())

    history_entries.sort(key=lambda entry: entry["filename"])

    if latest_weather is None and history_entries:
        latest_filename = history_entries[-1]["filename"]
        legacy_path = WEATHER_DIR / latest_filename
        if legacy_path.exists():
            latest_weather = build_latest_weather_entry(latest_filename, read_json(legacy_path))

    bundle = {
        "generatedAt": to_isoformat(datetime.now(timezone.utc)),
        "latest": latest_weather,
        "history": history_entries,
    }
    write_json(WEATHER_HISTORY_FILE, bundle)


def update_latest_forecast(forecast_file=None, forecast_timestamp=None):
    forecast_payload = None

    if forecast_file and forecast_timestamp:
        forecast_payload = read_json(forecast_file)
    else:
        latest_legacy = None
        for path in FORECAST_DIR.glob("forecast_*.json"):
            if FORECAST_FILE_PATTERN.match(path.name) and (
                latest_legacy is None or path.name > latest_legacy.name
            ):
                latest_legacy = path
        if latest_legacy:
            forecast_payload = read_json(latest_legacy)

    if forecast_payload is not None:
        write_json(FORECAST_LATEST_FILE, forecast_payload)


if __name__ == "__main__":
    args = parse_args()
    update_weather_history(args.weather_file, args.weather_timestamp)
    update_latest_forecast(args.forecast_file, args.forecast_timestamp)
    print("Weather history and forecast files updated successfully")
