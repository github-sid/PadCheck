import re


def build_canonical_key(street_address: str, unit_number: str | None, postal_code: str) -> str:
    street = re.sub(r"\s+", " ", street_address.lower().strip())
    unit = (unit_number or "").lower().strip()
    postal = postal_code.upper().replace(" ", "").replace("-", "")
    return f"{street}|{unit}|{postal}"
