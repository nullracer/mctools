import json
import os
import urllib.request
from datetime import date, datetime, timezone
from icalendar import Calendar

url = os.environ.get("CALENDAR_FEED")
if not url:
    raise SystemExit("Set the CALENDAR_FEED environment variable.")

request = urllib.request.Request(url, headers={"User-Agent": "SchoolCalendarSync/1.0"})
with urllib.request.urlopen(request, timeout=30) as response:
    calendar = Calendar.from_ical(response.read())

def iso(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return None

events = []
for component in calendar.walk("VEVENT"):
    start = component.get("DTSTART")
    if start is None:
        continue
    start_value = start.dt
    end = component.get("DTEND")
    end_value = end.dt if end is not None else start_value
    all_day = isinstance(start_value, date) and not isinstance(start_value, datetime)
    # iCalendar treats an all-day DTEND as exclusive; display the last included day.
    if all_day and end is not None and isinstance(end_value, date) and not isinstance(end_value, datetime):
        from datetime import timedelta
        end_value -= timedelta(days=1)
    uid = str(component.get("UID", f"{iso(start_value)}-{component.get('SUMMARY', 'event')}"))
    events.append({"id": uid, "title": str(component.get("SUMMARY", "Untitled event")), "start": iso(start_value), "end": iso(end_value), "all_day": all_day, "location": str(component.get("LOCATION", ""))})

events.sort(key=lambda event: event["start"] or "")
with open("events.json", "w", encoding="utf-8") as output:
    json.dump({"updated": datetime.now(timezone.utc).isoformat(), "events": events}, output, ensure_ascii=False, indent=2)
print(f"Wrote {len(events)} events to events.json")
